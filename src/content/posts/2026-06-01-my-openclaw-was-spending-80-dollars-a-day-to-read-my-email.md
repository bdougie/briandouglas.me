---
title: "My OpenClaw Was Spending $80 a Day to Read My Email"
date: 2026-06-01
description: "My OpenClaw chief-of-staff agent was burning $80 a day in Anthropic API costs. The fix was one config line, and the only reason I found it was observability."
---

I run an AI chief of staff called [clawchief](https://github.com/bdougie/clawchief). It triages my Gmail, watches my GitHub org, preps me for meetings, and DMs me on Slack like a diligent coworker who never sleeps. Last month, it cost me $80 a day to do that. Some days it hit $90.

That is a $2,400 a month run rate, mostly to archive newsletters and star the occasional email from a real human.

![Daily token cost chart from the Anthropic console. Opus 4.6 bars climb from $54 to $90 a day, then drop to a few dollars of Sonnet 4.6 and Haiku 4.5.](/images/clawchief-daily-token-cost.png)

That chart is the Anthropic console. The tall bars are Claude Opus 4.6. The sliver on the right is the same agent, doing the same job, on Sonnet 4.6 and Haiku 4.5. Daily spend since: a few dollars. Nothing about the agent got worse. I had been paying flagship prices for triage work.

## What clawchief does

clawchief is built on [OpenClaw](https://openclaw.ai) and runs on a $12/month DigitalOcean droplet under systemd. No containers, no Kubernetes, one box. (The repo started life as `staffchief` before the rename.) The design borrows from Ryan Carson's [chief-of-staff starter kit](https://github.com/snarktank/clawchief), keeping the patterns I liked and bolting on my own workflow.

Three files do most of the thinking:

- **priority-map.md** decides who and what matters: people, orgs, urgency levels.
- **auto-resolver.md** decides when the agent acts on its own, drafts something for me, or escalates.
- **skills/** holds one contract per workflow, so "triage my inbox" is a documented procedure instead of vibes.

Cron does the rest:

| Job | Cadence |
|---|---|
| Gmail triage | Every 30 minutes, 8am to 9pm |
| GitHub org triage | Weekday mornings |
| Calendar prep brief | 8:07am weekdays |
| Hacker News scan | Every 3 hours |
| LinkedIn followups | Weekly |

The Gmail sweep alone is 28 runs a day. Each run wakes up, loads the skill, the priority map, and the inbox, makes its calls, and writes a report. That is a lot of tokens before lunch.

## Where the $80 went

OpenClaw has one config value that matters more than all the others:

```
agents.defaults.model
```

Mine was set to `anthropic/claude-opus-4-6`. Every sweep, every heartbeat, every "label this recruiter email and move on" ran on the most capable model Anthropic sells.

Opus is a fantastic model. It is also the wrong tool for deciding whether a Calendly notification needs my attention. Most of what a chief of staff does all day is classification: label, archive, star, skip, summarize. The judgment calls that actually deserve a frontier model come up a handful of times a week.

The bill was not a bug. Every one of those runs did exactly what I asked. I had made a flagship model the default for work a mid-tier model handles fine, then scheduled that work 28 times a day.

## Seeing it is most of the fix

I would love to say I caught this through careful engineering discipline. The console chart made me wince, but a wince is not a diagnosis. What actually solved this was observability I already had running.

All of clawchief's traffic routes through [tapes](https://tapes.dev), which I have [written about before](/posts/2026/03/04/claude-failed-mid-session-tapes-brought-it-back/): every request and response the agent makes lands in a local SQLite database. On top of tapes I built [clawtel](https://github.com/bdougie/clawtel), the underlying tech for [claw.tech](https://claw.tech). It is a single Go binary that reads aggregate token counts out of the tapes database (model, prompt tokens, completion tokens, nothing else) and ships the totals to the dashboard. Every OpenClaw agent on claw.tech gets a public page with tokens, messages, uptime, and the per-model split. clawchief's is at [claw.tech/clawchief](https://claw.tech/clawchief). As I write this it shows 32,000 messages and 658 million tokens, and you can see exactly which models did the work. Here is the model distribution from the dashboard today:

![Model distribution on clawchief's claw.tech dashboard: Haiku 4.5 at 34.2%, Sonnet 4.6 at 28%, Opus 4.6 at 23.6%, and a second Haiku 4.5 model ID at 14.3%.](/images/clawchief-model-distribution.png)

The per-model split is the part that matters for money. "Your agent spent $80 yesterday" is a fact. "Almost all of it was Opus doing inbox sweeps" is a decision waiting to be made.

## The fix was one line

```bash
openclaw config set agents.defaults.model anthropic/claude-sonnet-4-6
```

Sonnet 4.6 became the default. Heartbeats run on Haiku 4.5. Opus is still there for when something genuinely hard shows up, but it is opt-in now instead of the default.

I did not guess my way to that split. The per-model data showed me what each kind of run was actually doing: the sweeps were classification, the heartbeats were pings, and only a handful of runs a week needed frontier-model judgment. That is what made the change feel safe instead of reckless.

I braced for a quality drop and could not find one. The inbox reports read the same. The org triage still catches stale PRs and CI failures. The morning briefs still surface the right meetings. For classification and triage, Sonnet was never the compromise. Opus was the extravagance.

You can also point OpenClaw at a Claude Max plan instead of the API, and that is a fair way to cap the bill. I skipped it. At a few dollars a day, the API is cheap enough that it is not worth burning the weekly limits I use for my actual day-to-day work.

> The default model is not a technical setting. It is a spend policy.

## What I took away

**Cadence multiplies everything.** A model choice you would never notice in a chat session becomes 28x a day on a cron schedule. Whatever your per-run cost is, the schedule multiplies it before it hits your bill.

**Match the model to the work, not the job title.** "Chief of staff" sounds like it deserves the best model money can buy. The actual work is mostly labeling emails. Price the task, not the role.

**You cannot right-size what you cannot see.** Without the per-model breakdown I would have squinted at $80 and guessed. The observability came first; the savings were downstream of it.

If you want to poke at any of this, the [clawchief repo](https://github.com/bdougie/clawchief) has the whole setup, droplet provisioning included, and the [live dashboard](https://claw.tech/clawchief) shows what it costs to run in real time. And if SSH-ing into a droplet is the part that stops you, there is now a one-click deploy on Render, live on [claw.tech](https://claw.tech/clawchief). One button, your own chief of staff, and a much smaller bill than mine.
