---
title: "842 Lint Errors, 5 Parallel Agents, 54 Minutes"
date: 2026-03-15
description: "I built a tool that fans out parallel Claude Code agents to fix lint errors across a codebase. It taught me that the hard problems aren't prompts or models. They're isolation, observability, and memory."
---

I had 1,992 ESLint errors in [contributor.info](https://github.com/open-sauced/contributor.info). The project had been through a heavy vibe coding phase and the codebase showed it. Auto-fix handled 1,150 formatting issues. That left 842 errors across 99 files that needed an agent to reason about.

I could have opened Claude Code and started grinding through files one at a time. But I'd been building [Tapes](https://github.com/papercomputeco/tapes) and [stereOS](https://github.com/papercomputeco/stereOS) for months and wanted to prove a thesis: agent infrastructure changes what agents can do. Not better prompts. Not bigger context windows. Infrastructure.

So I built [Sweeper](https://github.com/papercomputeco/sweeper).

## What it does

Sweeper takes any linter output and turns it into parallel agent work. Point it at golangci-lint, ESLint, Clippy, or a custom script that checks for AI slop. It groups issues by file, builds a prompt for each file, and fans out Claude Code sub-agents to fix them.

```bash
sweeper run -- npm run lint        # arbitrary linter command
sweeper run                        # default: golangci-lint
npm run lint | sweeper run         # piped input
sweeper run -- cargo clippy 2>&1   # Rust
```

Each sub-agent is a stateless claude --print process. It reads one file, applies the fix, exits. The orchestrator never sees your source code. It holds lint output, task metadata, and result summaries. Context stays small whether you're touching 5 files or 50.

```
          sweeper run --vm -c 10
                    │
          ┌─────────┼─────────┐
          ▼         ▼         ▼
    ┌──────────────────────────────┐
    │        Worker Pool           │
    │   (semaphore-bounded, N=10)  │
    └──┬───┬───┬───┬───┬───┬──────┘
       ▼   ▼   ▼   ▼   ▼   ▼
     ┌───┐┌───┐┌───┐┌───┐┌───┐
     │VM ││VM ││VM ││VM ││VM │ ◄── stereOS isolation
     └─┬─┘└─┬─┘└─┬─┘└─┬─┘└─┬─┘
    claude claude claude claude claude
       └─────┴──┬──┴─────┴─────┘
                │
      streaming + telemetry + tapes
```

Complexity scales in parallelism, not in context size.

Anthropic just [made 1M context generally available](https://medium.com/ai-software-engineer/anthropic-adds-1-million-context-window-to-opus-4-6-sonnet-4-6-now-you-can-code-at-scale-f5a932ba347c) on Opus 4.6 and Sonnet 4.6 at standard pricing. That's a big deal for deep research and long conversations. But for code maintenance across dozens of files, a bigger window is the wrong axis. You don't want one agent holding 99 files in context. You want 99 focused agents that each hold one file. The agent gets dumber the more you ask it to hold. Parallelism keeps each agent sharp.

## Isolation is the first problem

I learned building the [Pokemon Red agent](https://bdougie.dev/posts/2026/03/10/what-i-learned-running-10-pokemon-bots-in-36-seconds/) that shared-process concurrency breaks down fast. A runaway agent or a leaked credential becomes everyone's problem. And claude --print won't even start inside an active Claude Code session because of the CLAUDECODE env var nesting detection.

With --vm, each agent runs inside a [stereOS](https://github.com/papercomputeco/stereOS) virtual machine. Own CPU, own memory, 4 cores and 8GB RAM per instance. API keys are injected into the VM as secrets and never touch the host filesystem. The VM boots from an ephemeral config, runs its work, and tears down on exit. Success or failure, the cleanup is the same.

```bash
sweeper run --vm -c 5 -- npm run lint
```

Sweeper handles the full lifecycle. It generates the VM config, boots the instance, executes via SSH, and destroys it on exit. Signal handlers ensure VMs get cleaned up even on Ctrl+C. No orphaned processes. No leaked keys.

VMs feel heavy until you've debugged a shared-process agent race condition at 2am. Then they feel obvious.

## Observability is the second problem

Most agent tooling skips this part. The agent runs, you get output, nobody records what happened between input and output. So nobody learns anything between runs.

Every Sweeper sub-agent session records to [Tapes](https://github.com/papercomputeco/tapes). Token spend per linter. Strategy effectiveness by round. Whether you're trending toward more fixes with fewer tokens over time. The telemetry lands as JSONL files with event types for initialization, fix attempts, and round completion. Each fix attempt includes the prompt strategy and round number.

Run sweeper observe after a sweep and you get actual data:

- Success rates broken down by linter
- Round effectiveness — what fraction of fixes each round contributed
- Strategy analysis — standard vs retry vs exploration success rates
- Token usage distributed across linters when Tapes data is available

This is the part that separates running experiments from accumulating knowledge.

## Escalation, not repetition

When fixes stall, Sweeper doesn't just retry the same prompt. It tracks per-file history across rounds and counts how many consecutive rounds produced no improvement. After hitting the stale threshold, it escalates.

First round: standard prompt. Lists the lint issues, instructs the agent to fix without changing behavior.

Second round: retry prompt. Includes the prior attempt's output (truncated to 2,000 characters to avoid prompt bloat) and instructs the agent to try a different approach.

Third round: exploration prompt. Tells the agent to consider refactoring surrounding code, pulling in context from neighboring files. This is the expensive play, but it catches the issues that straightforward fixes miss.

After exploration is attempted and fails, the file gets dropped from further retries. No infinite loops.

## Karpathy's loop, plus memory

Karpathy's [autoresearcher](https://github.com/karpathy/autoresearcher) works a similar loop. Agent edits code, runs experiment, evaluates, keeps or reverts. 100 experiments overnight on one GPU. It's a good design.

But each run is stateless. The agent doesn't know what strategies worked last Tuesday or which file patterns tend to stall. Sweeper differs because Tapes gives it [observational memory](https://mastra.ai/blog/observational-memory). Every session records strategy, round, outcome, and token cost. The next run reads that history. Stalled files get escalated based on what actually failed before, not a generic retry. The idea is the same one Mastra describes: compress agent history into useful observations instead of hauling raw context forward. Tapes does this at the session level. What worked, what didn't, how many tokens it cost.

Over time the system learns which approaches work for which categories of issues. That's the difference between running experiments and accumulating knowledge.

## The contributor.info results

I pointed Sweeper at the 842 remaining ESLint errors across 99 files. Five parallel agents, three rounds.

| Metric | Value |
|---|---|
| Starting errors | 1,992 |
| After eslint --fix | 842 |
| After Sweeper | 0 |
| Parallel agents | 5 |
| Rounds | 3 |
| Wall clock time | ~54 minutes |
| Total agent-time | 269.8 minutes |
| API tokens | 108,150 |
| Fix rate | 100% |

100% fix rate across all rounds. [PR #1741](https://github.com/bdougie/contributor.info/pull/1741) landed with 110 files changed.

One thing I didn't expect: type cascades. Sweeper fixes per-file but doesn't check cross-file type compatibility. Replacing any with specific types caused 61 downstream TypeScript errors that needed manual cleanup. A good reminder that file-level isolation has trade-offs.

## Same tool, different prompt

Then I pointed it at the docs. contributor.info had 15 feature doc pages that were stale, inconsistent, and missing screenshots. I gave Sweeper a copywriter skill and told it to rewrite everything.

It dispatched parallel agents, each one taking a doc page, rewriting the content, and adding focused screenshots from the live app. It replaced an entire outdated Insights section with new StarSearch and Workspaces documentation, consolidated the CLAUDE.md and AGENTS.md files, and built a doc quality linter script to keep things clean going forward. [PR #1745](https://github.com/bdougie/contributor.info/pull/1745).

Sweeper doesn't care if it's fixing lint or rewriting prose. It groups tasks, dispatches agents, records outcomes. The orchestrator pattern is the same. Only the prompt changes.

## What this taught me

The hard problems in agent tooling aren't about models or prompts. They're about the infrastructure underneath.

**Isolation** so agents can't interfere with each other or leak credentials. **Observability** so you can measure what's working and what isn't. **Memory** so the system improves across runs instead of starting from zero every time.

Tapes, stereOS, and Sweeper are three layers of the same idea: agents need infrastructure the same way services do. You wouldn't run a production service without containers, logging, and metrics. Why are we running agents without them?

Sweeper works with anything that produces output. It runs as a standalone Go CLI, a Claude Code skill, an opencode agent, or a [Pi](https://pi.dev) extension.

Go try it.

→ [github.com/papercomputeco/sweeper](https://github.com/papercomputeco/sweeper)
