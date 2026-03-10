---
title: "What I Learned Running 10 Pokemon Bots in 36 Seconds"
date: 2026-03-10
description: "How a DeepMind paper turned my Pokemon agent from 'watch and tweak' into 'run and measure.'"
---

I spent an evening building a Pokemon Red agent. If you've read the [pokedex logs](https://github.com/papercomputeco/pokemon/tree/dfab7e6c1ce2e65f86999a341819522da5390cdc/pokedex), you know the journey: six logs of fixing text-box detection, discovering PyBoy's button API quirks, fighting door loops, and getting the agent from Red's bedroom to Pallet Town.

Every log followed the same pattern. Watch the agent run. Notice something wrong. Form a hypothesis. Write a fix. Run it again. Sometimes my hypothesis was right. Sometimes I'd spend an hour tweaking a parameter that turned out to be irrelevant.

Then I read DeepMind's [AlphaEvolve paper](https://arxiv.org/abs/2602.16928). The core idea: treat algorithm source code as a genome, use an LLM to propose mutations, evaluate candidates against a fitness metric, keep the best.

My Pokemon agent runs headless at roughly 100x real-time. I could run 10 strategy variants in 36 seconds and let the numbers decide what works.

## Watching One Agent Hits a Ceiling

The pokedex logs tell the story of manual iteration. [Log 1](https://github.com/papercomputeco/pokemon/blob/dfab7e6c1ce2e65f86999a341819522da5390cdc/pokedex/log1.md) was just getting Python to run in the NixOS sandbox. [Log 5](https://github.com/papercomputeco/pokemon/blob/dfab7e6c1ce2e65f86999a341819522da5390cdc/pokedex/log5.md) was discovering that `pyboy.button_press()` doesn't work reliably in headless mode. [Log 6](https://github.com/papercomputeco/pokemon/blob/dfab7e6c1ce2e65f86999a341819522da5390cdc/pokedex/log6.md) was adding oscillation detection because the stuck counter kept resetting when the agent bounced between two positions.

Each of those discoveries required me to watch the agent, notice what was wrong, and debug it. That's the right approach when you're building new capabilities. You can't automate "notice that the text-box detection is using a background tile address instead of a game state flag."

But once the heuristics exist, tuning them is a different problem. The navigator has parameters like `stuck_threshold` (how many turns before skipping a waypoint), `door_cooldown` (turns to walk away from a door after exiting), and `waypoint_skip_distance` (max distance to skip when stuck). I set these to values that seemed reasonable and moved on.

The AlphaEvolve paper made me realize I was leaving performance on the table. These parameters are exactly the kind of thing evolution is good at.

## What I Built

[PR #9](https://github.com/papercomputeco/pokemon/pull/9) adds three components.

### Fitness Metrics

The agent now reports structured results instead of log output I have to squint at:

```python
def compute_fitness(self) -> dict:
    """Return structured metrics from the current run state."""
    final = self.memory.read_overworld_state()
    return {
        "turns": self.turn_count,
        "battles_won": self.battles_won,
        "maps_visited": len(self.maps_visited),
        "final_map_id": final.map_id,
        "final_x": final.x,
        "final_y": final.y,
        "badges": final.badges,
        "party_size": final.party_count,
        "stuck_count": len([e for e in self.events if "STUCK" in e]),
    }
```

The [`--output-json` flag](https://github.com/papercomputeco/pokemon/blob/dfab7e6c1ce2e65f86999a341819522da5390cdc/scripts/agent.py) writes this to a file. No more parsing terminal output.

### Evolvable Parameters

The navigator parameters are now configurable via an `EVOLVE_PARAMS` environment variable:

| Parameter | What it does | Default |
|-----------|--------------|---------|
| `stuck_threshold` | Turns stuck before skipping a waypoint | 8 |
| `door_cooldown` | Turns to walk away from a door after exiting | 8 |
| `waypoint_skip_distance` | Max distance to skip when stuck | 3 |
| `axis_preference_map_0` | Preferred movement axis on Pallet Town | "y" |

The [evolution harness](https://github.com/papercomputeco/pokemon/blob/dfab7e6c1ce2e65f86999a341819522da5390cdc/scripts/evolve.py) sets this before launching each subprocess.

### Parallel Multi-Agent Runner

[`run_10_agents.py`](https://github.com/papercomputeco/pokemon/blob/dfab7e6c1ce2e65f86999a341819522da5390cdc/scripts/run_10_agents.py) launches 10 parameter variants simultaneously:

```python
VARIANTS = [
    ("baseline", {"stuck_threshold": 8, "door_cooldown": 8, ...}),
    ("low_stuck", {"stuck_threshold": 4, "door_cooldown": 8, ...}),
    ("high_stuck", {"stuck_threshold": 12, "door_cooldown": 8, ...}),
    ("short_door", {"stuck_threshold": 8, "door_cooldown": 4, ...}),
    ("long_door", {"stuck_threshold": 8, "door_cooldown": 12, ...}),
    # ... 5 more variants
]
```

Total wall time for 10 runs to Pokemon selection: **11.1 seconds**.

## The First Real Discovery

Here's the output from the first multi-agent race:

| Rank | Variant | Score | Stuck Events | Time |
|------|---------|-------|--------------|------|
| 1 | **short_door** (cooldown=4) | 40375 | 9 | 5.4s |
| 2-8 | baseline + 6 others | 40365 | 11 | ~5.4s |
| 9 | long_door (cooldown=12) | 40340 | 16 | 5.5s |
| 10 | conservative (cooldown=12) | 40340 | 16 | 5.4s |

Shorter door cooldown wins. With `door_cooldown=8`, the agent walks 8 tiles away from a door before it can re-enter. With `door_cooldown=4`, it wastes fewer turns. The effect compounds: 9 stuck events vs 11 vs 16.

I set `door_cooldown=8` back in [log 5](https://github.com/papercomputeco/pokemon/blob/dfab7e6c1ce2e65f86999a341819522da5390cdc/pokedex/log5.md) when I was debugging the door loop between map 37 and map 0. It was a guess. "Eight frames seems like enough to clear the doorstep." The evolution loop found that 4 is better, and it found it across 10 independent runs. That's not a guess. That's a measurement.

## The Fitness Function Is the Hard Part

Running agents is easy. Defining what "good" means is not:

```python
def score(fitness: dict) -> float:
    return (
        fitness.get("final_map_id", 0) * 1000
        + fitness.get("badges", 0) * 5000
        + fitness.get("party_size", 0) * 500
        + fitness.get("battles_won", 0) * 10
        - fitness.get("stuck_count", 0) * 5
        - fitness.get("turns", 0) * 0.1
    )
```

This weights map progress heavily (reaching Oak's Lab is map 40), penalizes getting stuck, and slightly prefers fewer turns. The weights are themselves tunable. A meta-evolution problem.

Getting the fitness function wrong means optimizing for the wrong thing. If I only counted `maps_visited`, the agent might find ways to teleport between maps that don't actually progress the game. If I over-penalized `stuck_count`, the agent might avoid doors entirely.

The pokedex logs are full of decisions about what matters. Map transitions. Party count. Battles won. Stuck events. All of those became fitness components because I'd already learned they were important through manual debugging. The watch-and-tweak phase wasn't wasted work. It was building the vocabulary for the fitness function.

## What Changes When You Race Instead of Watch

| | Watch One Agent | Race Ten Agents |
|---|---|---|
| **Iteration speed** | Minutes to hours, manual | 10 variants in 36s, automated |
| **Discovery method** | Human watches, spots failure | Fitness function surfaces what works |
| **Parameter tuning** | Gut feel | Structured search with rankings |
| **Confidence** | "It worked when I ran it" | "Beat 9 alternatives across 10 runs" |

Manual iteration is still how you discover new capabilities. I needed to watch the agent to notice that `wd730` bit 5 indicates simulated joypad state, or that oscillation detection was needed, or that the route waypoints were sending the agent into tables. You can't automate noticing what's broken.

But once the heuristics exist, evolution is better at tuning them than I am.

## What's Next

The evolution harness is deliberately minimal. It only mutates numeric parameters. The paper's more ambitious claim is that you can evolve actual code: have the LLM rewrite `choose_action()` and evaluate the result.

That's harder because syntax errors crash the agent and semantic changes can break everything. But the infrastructure is in place:

- Agent runs headless at 100x speed
- Structured fitness metrics via `--output-json`
- Parameter overrides via environment
- Subprocess isolation for clean runs

The next step is letting the LLM propose code changes, running them in a sandboxed subprocess, and keeping improvements. Genetic programming with an LLM as the mutation operator.

Think of it like [tapes](https://tapes.dev) for strategy evolution. Tapes records every LLM conversation so you can recover from crashes. The evolution harness records every parameter variant so you can know what actually works. Both capture state that would otherwise be lost.

## Try It

The code is at [papercomputeco/pokemon](https://github.com/papercomputeco/pokemon):

```bash
# Run 10 agents in parallel, see which parameters win
uv run scripts/run_10_agents.py <rom_path>

# Run the evolution loop (LLM variant proposal)
uv run scripts/evolve.py <rom_path> --generations 5 --max-turns 200
```

The pattern generalizes beyond Pokemon. If your agent can run headless and fast, and you can define a fitness function, you can evolve strategy. Game bots, web scrapers, code generators. Iteration speed unlocks automated search.

Eleven seconds to run 10 variants. That's fast enough to let the numbers decide.

---

*The AlphaEvolve paper is at [arxiv.org/abs/2602.16928](https://arxiv.org/abs/2602.16928). [PR #9](https://github.com/papercomputeco/pokemon/pull/9) implements the evolution harness. The [pokedex logs](https://github.com/papercomputeco/pokemon/tree/dfab7e6c1ce2e65f86999a341819522da5390cdc/pokedex) document the manual iteration phase.*
