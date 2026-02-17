---
title: "The True Cost of Claude Code"
date: 2025-02-17
description: "If you're paying $100/month but consuming multiples of that in API costs, you have to start wondering when the subsidy ends."
---

Sometimes the math doesn't math. If you're paying $100/month on a Claude Code Max plan, but are consuming way more than that, you have to start wondering when that's going to catch up to you.

No, it's not a bug. It's a business model. And if you've been around long enough to remember when an Uber from Manhattan to JFK was $25, you already know how this story ends.

## The Subsidy You're Not Supposed to Notice

Right now, Claude Code's Max plan runs $100/month for what Anthropic's own docs describe as roughly $100-200/developer/month in actual API token costs at average usage. But "average" is doing a lot of heavy lifting in that sentence. Power users are burning through multiples of that.

Anthropic knows this. They've even been somewhat transparent about it. Their average daily cost per developer sits around $6 in credits, with 90% of users staying below $12. But heavy users, the ones building real things, running agentic workflows, spinning up multi-file reasoning sessions? They're consuming far more value than they're paying for.

Here's the thing. This isn't generosity. This is market capture.

## We've Seen This Movie Before

Uber lost more than $30 billion in the years since the company's finances became public, amounting to an enormous, investor-fueled subsidy of America's ride-hailing habit. In 2015, Uber passengers were only paying about 41% of the actual cost of their trips. The strategy was straightforward. Make the product so cheap and so convenient that it becomes infrastructure. Then, once alternatives have been starved out and habits are locked in, raise prices.

It worked. Average Uber prices rose 92% between 2018 and 2021. Kevin Roose at the New York Times called the original pricing a "millennial lifestyle subsidy" and framed the eventual correction not as price-gouging but as the market finally reflecting reality.

The AI coding tool market is following the same playbook. Anthropic just closed a $30 billion Series G at a $380 billion valuation. Their annualized revenue hit over $9 billion by end of 2025. They're projecting revenue could quadruple this year to as much as $18 billion. But they're still burning significant cash, and now expect to turn cash-flow positive in 2028, a year later than previously planned.

That gap between revenue and profitability? You're standing in it. Every subsidized token is venture capital money being converted into your muscle memory and workflow dependency.

## The Dependency Graph You Didn't Audit

The real cost isn't the $100 - $200/month. It's what happens when the price reflects reality.

Think about what Claude Code has become for developers who rely on it daily. It's not a nice-to-have anymore. It's woven into how people architect systems, debug complex issues, and reason through multi-file refactors. When your entire development workflow is optimized around a tool that costs $100 but delivers $2,000 in value, you've built a dependency that's priced to change.

And it will change. It has to. Anthropic expects to spend about $12 billion training models and another $7 billion running them in 2026 alone. No amount of venture capital makes that math work forever.

When the correction comes, it probably won't look like a dramatic overnight price hike. It'll look like what we're already starting to see. Anthropic introduced new weekly rate limits in August 2025, primarily targeting power users. 5-hour usage windows that reset unpredictably. Token caps that force you to choose between using Opus for the hard problems or Sonnet for everything. Death by a thousand paper cuts until the plan that used to feel unlimited feels very, very limited.

## What This Means for How You Build

This isn't a "don't use Claude Code" argument. The tool is genuinely powerful. The question is whether you're building awareness of your dependency into how you work.

A few things worth thinking about.

**Track your actual token consumption.** If you don't know what your usage would cost at API rates, you can't plan for a future where that's what you're paying. Understand how much you're consuming to how much you're actually paying.

**Diversify your toolchain.** If Claude Code goes down, gets rate-limited, or doubles in price tomorrow, do you have a fallback? Can your workflow survive a week without it? This is the same resilience thinking we apply to any other critical dependency in our stack.

**Build observability into your agent workflows.** This is where tools like tapes help. When you're running agentic coding sessions, all of that context is typically lost once a session ends: the learned lessons, the decisions, the errors, and the successes. Having a durable, auditable record of what your agents actually do lets you understand your real costs, optimize your usage, and maintain continuity even if you need to switch providers. It's the difference between flying blind and having instrumentation.

**Think about what "good enough" looks like.** Not every task needs Opus. Not every refactor needs extended thinking. The developers who will weather a pricing correction best are the ones who've already built habits around using the right model for the right job.

## The Question Nobody's Asking

Anthropic has begun preparations for a potential IPO as soon as 2026, hiring Wilson Sonsini to advise on the process. The revenue growth is real and impressive. But so was Uber's.

The question isn't whether AI coding tools are valuable. They obviously are. The question is what happens when the price tag matches the value. When the $100/month plan becomes $300/month, or usage-based pricing becomes the only option, or the rate limits get tight enough that you're effectively paying per-task anyway.

We're in a window right now where the economics of these tools are artificially favorable. That window will close. Not because anyone is being deceptive, but because the math demands it.

The developers who come out ahead won't be the ones who got the most subsidized tokens. They'll be the ones who used this window to build workflows that are observable, portable, and resilient. The ones who tracked what they consumed, understood what it really cost, and built systems that don't have a single point of failure at the inference layer.

The best time to audit your AI dependencies is before the price correction. Not after. Start with tapes.
