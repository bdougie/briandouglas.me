---
title: "Every Agent Session Should Be a Heist"
date: 2026-09-02T12:00:00-07:00
description: "I stopped asking one model to play every role. Pokémon Red showed me how to cast a crew by benchmark and route each job with vLLM."
blueskyUrl: "https://bsky.app/profile/bizza.pizza/post/3muluh5aszs2w"
---

Pokémon has become my test bench for watching agents observe, act, fail, and improve. If you are new to the experiment, start with [what I learned running 10 Pokémon bots in 36 seconds](/posts/2026/03/10/what-i-learned-running-10-pokemon-bots-in-36-seconds/).

Those first bots were racing through the opening minutes of Pokémon Red. The experiment has grown since then, but the setup is still simple. A Game Boy emulator called PyBoy runs the cartridge's ROM, a digital copy of the game data. Instead of holding a controller, an agent reads the current map, position, health, and menus from the emulated game, then sends the same directional, A, and B button presses a person would use.

Most runs happen *headlessly*, meaning no game window needs to stay open. The gameplay viewer is for me; the emulator can advance faster than real time without making a model watch the screen as a video.

I do not hand every part of a run to one model. I assemble what I started calling the crew. Pi is the coding-agent harness, not a Raspberry Pi. It gives each model the Pokémon codebase and tools for operating the emulator. Fable sits above Pi, plans the mission, and distributes the work. A semantic router from vLLM calls in a different specialist when the job changes. The crew is the experiment now.

Emulator save states let the crew spread out. A save state freezes an exact moment in the game: location, health, inventory, progress, everything. I can copy that moment and hand it to 23 agents, or 238, at the same time. Each run starts from the same game state and tests a different way forward. The emulator does not care how many copies I make, though my hardware eventually does.

As I write this, 23 crew sessions are starting from the same save, with the bicycle in the bag and six badges already won. They are trying different ways to discover how to reach the next gym badge. Nobody has to replay the game from the beginning. When one run finds a path, its saved game can become the starting point, or baton, for the next round.

<figure style="max-width: 640px; margin-left: auto; margin-right: auto;">
  <img src="/images/blog/pokemon-heist-flail.png" alt="Pokémon Red frame showing the player character in Professor Oak's lab among several people and objects" width="160" height="144" style="width: 100%; height: auto; image-rendering: pixelated;" />
  <figcaption>The earliest agent flailed around Professor Oak's lab. The viewer renders the run for me; the agent itself plays through tools and game state.</figcaption>
</figure>

The mission that produced that save sounded like a small errand: get a bicycle.

The agent discovered that the bicycle is impossible to buy. It costs one Pokédollar more than the player can carry. I have played this game for years and did not know that. The actual route is to find the Pokémon Fan Club, talk to its chairman, receive a Bike Voucher, carry it back to the bike shop, and redeem it with the clerk behind the counter.

I had forbidden the agent from searching the internet or leaning on what the model remembered about Pokémon. It responded by reading the ROM directly. It inspected the map and item table, worked out that the voucher was the key, and even found the shop's dialogue:

> Oh, that's... a BIKE VOUCHER! OK! Here you go!

This was clever, and it worked. It also foreshadowed how the run would fail. Reading deeper into the ROM would later become a way to avoid trying the obvious move in the live game.

The crew found the chairman, collected the voucher, walked into the correct shop, freed a slot in the full bag, and stood in front of the clerk.

Then the game-playing code reported: `body (6,2) unreachable/no response`.

That was the useful part of the run. The agent had nearly every fact it could ask for and still did not know what to do next.

That is where the mission started looking like a heist.

## One model walks in like it owns the place

When Fable hands an entire mission to one model, the model develops an ego.

The bicycle run showed me how. Reading the ROM found the voucher, so when the live game later disagreed with the plan, Claude went back to the ROM. It kept reading, studied the planned routes, and built a coherent story about why the next move would not work.

One button press proved the story wrong.

I saw this while using Claude Code as the analysis seat beside the gameplay runs. Claude did useful work. It decoded cartridge data, identified teleport pads, found bugs in how the engine read the game, and later generalized the counter discovery. The crew needed that work.

It also spent time trying to understand the entire game from the cartridge outward. A dead-end search through internal game state did not answer whether the player was surfing. Hand-written route chains overruled routes the navigation system had already rejected. One wrong six-cell estimate for an island made it into the next mission; the live map later measured 43.

The cartridge says what the game contains. It does not always say what is happening in this frame. In other runs, stale menu text became evidence, a person talking became a permanent wall, and a frozen screen became imaginary geography.

A heist does not ask the person cracking the safe to drive the getaway car, watch the cameras, charm the guard, and decide whether the floor plan is still accurate.

You bring a crew.

## The crew talks to people

The clearest evidence came from [two parts of the same run](https://github.com/pcc-labs/pokemon-kafka/blob/main/benchmarks/2026-09-02-crew-vs-solo.md). The crew spoke to 82 people across eight maps on the way to the sixth gym badge, and it won. On the next arc, a water route, it spoke to nobody across six maps and lost five attempts.

Those were different parts of the game, so this was not a controlled experiment. The split was still hard to ignore. On one water map, the agent listed ten people and treated every one of them as an obstacle to route around. It kept handing models route tables, failure codes, and stale text from the screen, then asking them to reason about a world nobody had actually questioned.

<figure style="max-width: 640px; margin-left: auto; margin-right: auto;">
  <img src="/images/blog/pokemon-heist-surf.png" alt="Pokémon Red frame showing a route bordered by water, tall grass, and a rocky wall" width="160" height="144" style="width: 100%; height: auto; image-rendering: pixelated;" />
  <figcaption>The water route looked like a pure pathfinding problem. Five failed attempts showed it was also an observation problem.</figcaption>
</figure>

One question broke the loop: are you talking to the NPCs?

I had seen this exact blind spot [in an earlier run](https://papercompute.com/blog/agent-played-pokemon/). The agent walked in circles because it did not know where to look. The first person it finally talked to was the character's mom, who gave it good directions. The answer was one conversation away.

That lesson was already in the project's history. The model had enough context to find it and still stopped talking to people again.

The first trainer the crew approached answered, “Wait! You'll have a heart attack!” and opened a battle. The conversation did not solve the whole route, but it turned an assumed wall into a measured interaction. It exposed what the crew was missing.

We added an Investigator to the crew.

This was not a temporary debugging seat. The Investigator became part of the permanent cast. It does not choose the route. It decides what to observe: which person to approach, which direction to face, which screen to inspect. It runs before the expensive reasoning seats because reconnaissance is cheaper than asking a large model to explain bad evidence.

The Investigator now has one rule:

> When a run is stuck, stop asking what the model thinks. Ask what the game has said, and who we have not talked to.

## Qwen has no fear

Qwen 3.8 27B, `qwen38-27b` in my run configuration, became the local model I trusted with this kind of work.

I run it on my own GPU, sometimes grinding Pokémon for eight hours overnight. It is not the fastest model in the roster, and it does not always finish the whole mission. What it has is a useful lack of fear. It probes. It runs one path in isolation. It changes something concrete. It tests the result. When the model says a door is blocked, Qwen has a habit of walking over and trying the handle.

That behavior showed up in the benchmarks. In one navigation test through Mt. Moon, the game's first cave, six models reached the goal. Qwen took the best route: 49 turns with 36 health points remaining. In the harder cave puzzle, nobody finished, but Qwen was the only model whose first attempt did not immediately bounce back through the entrance. It left a diagnosis that the rest of the crew used to build the fix.

The numbers behind an earlier Qwen session are even more revealing: 33 small, single-run experiments before it launched one six-way race. It was not being reckless. It was refusing to substitute a theory for an observation.

Claude wanted to read enough of the world to make the right move.

Qwen made a move so it could read the world.

## The counter nobody could reach

The [bike shop](https://github.com/pcc-labs/pokemon-kafka/pull/124) gave both modes of work something useful to do.

The crew produced the observation. It had the voucher, stood in the room, and reported that the clerk could not be reached from an adjacent square. Claude's analysis turned that failure into a general question: where else does the game expect the player to talk across a counter?

The answer was already hiding in the code. Pokémon Centers had a special rule for nurses behind counters: stand two tiles away, face the nurse, and talk. Nobody had generalized that geometry to shops, clerks, or desks.

From the bike shop's reachable square, the crew faced right and pressed A. The voucher exchange fired on the first attempt.

<figure style="max-width: 640px; margin-left: auto; margin-right: auto;">
  <img src="/images/blog/pokemon-heist-bicycle.png" alt="Pokémon Red bike shop frame showing the player standing across the counter from the clerk as the clerk asks, How do you like your new BICYCLE?" width="160" height="144" style="width: 100%; height: auto; image-rendering: pixelated;" />
  <figcaption>The player cannot stand beside this clerk. From the reachable square across the counter, facing right and pressing A completes the exchange.</figcaption>
</figure>

The follow-up count made the finding larger. A static scan of the game's maps found 778 people with a normal walkable square beside them. Fifteen had no adjacent square but did have a valid place to stand across a counter. Seven matched the standard shop layout used across the game's cities. The buying code had existed the whole time, but the recorded history showed zero purchases because the agents could not reach the clerks who activated it.

The live run found the blocked clerk. Claude turned that blocked clerk into a general counter rule. The fix that bought one bicycle also made the clerks in seven standard shop layouts reachable.

## Meet the crew, cast by benchmark

I did not cast this crew from a model leaderboard. I ran the same jobs with different models and kept the ones that left the best results.

The question is not which model is best at Pokémon. It is which model should be in the seat for the problem in front of us.

This is the crew I keep referring to. The [benchmark gave us the cast](https://github.com/pcc-labs/pokemon-kafka#the-model-crew-heist-casting-by-benchmark):

| Crew role | Model | What earned the seat |
|---|---|---|
| **The Wheelman** | Laguna XS, local | Fast routine execution; first model to reach the Gym |
| **The Point Man** | Qwen 3.8 27B, local | Best navigation result and a habit of probing before declaring a wall |
| **The Extractor** | Kimi K2.6, cloud | Went deepest in the cave puzzle and ranked highest in the quick puzzle evaluation |
| **The Investigator** | Qwen 3.8 27B, local | Reads the live room before the expensive seats reason about it |

No model earned every title.

Every model in the crew runs locally except Kimi K2.6. The machine hosting the game and local models has an NVIDIA RTX 5090 GPU. Kimi is the cloud exception because it carries more weight when a difficult puzzle survives triage; the benchmark showed it going deeper underground than the local roster.

Qwen occupies two seats because recon in this game is also a movement problem. The Investigator decides what the crew needs to observe; the Point Man gets there.

The battle test did not discriminate between the six models at all. Every one finished. Paying for the deepest thinker there would not make the battle better. It would only make the battle more expensive. That routine work belongs to Laguna XS, the Wheelman.

<figure style="max-width: 640px; margin-left: auto; margin-right: auto;">
  <img src="/images/blog/pokemon-heist-brock.png?v=2" alt="Pokémon Red reward screen showing Brock facing Charmeleon with the message, As proof of your victory" width="160" height="144" style="width: 100%; height: auto; image-rendering: pixelated;" />
  <figcaption>Brock begins handing over the proof of victory. Every model reached this reward screen, so the battle was execution work, not a reason to call the most expensive model.</figcaption>
</figure>

Each title has a run behind it. Fable plans and distributes the work. Laguna XS takes routine jobs. Kimi handles the difficult problems that survive triage. Qwen runs the long local Pokémon sessions and handles navigation and recon.

This is the current cast, not a permanent roster. The jobs stay; the models holding them can change with the next benchmark.

## The semantic router is the caller

A crew still needs someone to make the call.

The [vLLM semantic router](https://github.com/vllm-project/semantic-router) sits in front of the model roster. To Pi it looks like one automatic model. Behind that name, the router reads each request and sends it to the specialist whose runs earned that work.

Battle goes to the Wheelman. Navigation goes to the Point Man. A puzzle goes to the Extractor. Recon happens before any of them are asked to explain a wall.

The first field run already showed why this matters. A session began with the Point Man handling navigation. As the request filled with the language of walls and anomalies, the router handed the next call to the Extractor. The mission stayed the same. The needed role changed underneath it.

A coding session changes shape too. It can start as implementation, turn into investigation, become a migration, and end with review. I do not want one model carrying its favorite behavior through every phase.

## A heist needs receipts

The metaphor only works if the crew is accountable.

Models are very good at narrating the job they believe they completed. The Pokémon runs include a claimed fix that failed, a quoted log line that did not exist, and elapsed times that did not match the clock. Confidence is not telemetry.

I let the model write the summary. I do not let it grade its own run.

Every role needs receipts: the recorded session, the experiment, the turn count, the remaining health, the code change, and the saved game that proves where the run ended. The semantic router uses knowledge from earlier sessions, so routed runs are labeled as assisted. A title without a benchmark is just casting by vibe.

The Point Man does not get the job because I like Qwen. It gets the job because Qwen took a faster line, survived with more HP, and left a useful diagnosis. Another model can take that seat with a better run.

The crew has no permanent stars. Jobs change, teams rotate, and the next benchmark can recast any seat.

## Try this on your own codebase

Take away the Game Boy and this harness is Pi plus Ollama. [Sweeper](https://github.com/papercomputeco/sweeper) is Pi plus Ollama pointed at a repository. My Pokémon crew fans out from the same saved game; Sweeper fans out from the same commit. Each worker gets the same starting point and a different way to attack the job.

<figure style="max-width: 720px; margin-left: auto; margin-right: auto;">
  <picture>
    <source media="(max-width: 520px)" srcset="/images/blog/sweeper-crew-mobile.svg?v=2" />
    <img src="/images/blog/sweeper-crew.svg?v=2" alt="Diagram showing one repository commit entering Sweeper, where Pi fans work out to local Ollama models and Kimi K2.6 in the cloud, before lint, test, and diff verification" width="720" height="760" style="width: 100%; height: auto;" />
  </picture>
  <figcaption>Sweeper runs the same heist against a repository. Pi directs the work, Ollama serves the local crew, Kimi takes the hard puzzle lane, and only verified changes advance.</figcaption>
</figure>

Start by checking whether each worker used the tool that could prove it wrong. If the job is a lint fix, did it run the linter? For a build failure, did it run the compiler? For a broken test, did it run the test? Capture the transcripts, count those checks, then compare them with what was actually fixed.

That is the code version of talking to NPCs. The Pokémon split was not a controlled experiment, but 82 conversations on the winning arc and zero on the arc that lost five attempts got my attention. I would measure the tool calls before spending more money on a larger model.

Then watch what fails twice. Do not send the same file up the model ladder for a third try without learning why it stalled. Codebases have their own two-tile clerks: generated files, vendored packages, build tags, configuration changes, and tests whose fixes live somewhere else. Write down what the worker measured and tried. Give that evidence to the next seat.

Finally, score the result, not the exit code. Run the linter again. Run the test again. Diff the tree. A worker that exits cleanly and changes nothing did not finish the job.

Start from the same commit. Route the work by what the benchmarks say. Verify what changed.

Claude misread the floor plan.

Qwen tried the door.

The crew left with the bicycle.
