---
title: "The Continuous AI Workflow: Opus 4.1 Plans, Sonnet 4 Builds, I Ship"
date: 2025-08-12
description: "A two-model workflow using Claude Opus 4.1 for deep planning and Sonnet for rapid implementation."
canonical_url: "https://blog.continue.dev/opuwhen-to-use-opus-4-1s-4-1-what-is-it-good-for/"
---


**Stop treating all AI models the same.** Use Claude Opus 4.1 for deep architectural thinking and comprehensive planning, then switch to Sonnet for rapid implementation. This two-model workflow transformed my complex data pipeline project from overwhelming to manageable. Opus catches production issues before you write code, while Sonnet cranks out the implementation at speed.

Ever tried building a complex data pipeline and found yourself drowning in architectural decisions? Well, I've never built one before and was drowning trying to figure out where to start. It's clear that AI is a great use case for generating code, and even planning that same code, but I really needed help exploring how to build out this project in stages—and tracking everything through markdown files just wasn't cutting it.

What if AI could not just write code, but actually help you think through the entire system design? This past week, Opus 4.1 launched in general availability, and I discovered the perfect workflow: using Opus for planning while leveraging Sonnet for generating my [dlt](https://github.com/dlt-hub/dlt?ref=blog.continue.dev) + [DuckDB](https://duckdb.org/?ref=blog.continue.dev) pipeline.

## The Problem: AI Can Code, But Can It Think?

Traditional AI workflow: Ask for code → Get code → Debug → Ask again → Repeat.

What I needed: Something that could understand my entire system, reason through trade-offs, and help me avoid problems before they happened.

I'm building a data pipeline with dlt (data load tool) + DuckDB—a modern Python framework for ELT pipelines paired with an in-process analytical database. This isn't your average CRUD app, but something I've been thinking about attempting for a while now. We're talking about:

-   Creating a single data source aggregating all my GitHub repos, issues, and projects
-   Handling GitHub rate limiting with scaling and optimizations to prevent timeouts
-   Moving beyond my normal approach of local scripts in a TypeScript folder

This is not something I could have done before, but I read a book [Designing Data-intesive](https://www.oreilly.com/library/view/designing-data-intensive-applications/9781491903063/?ref=blog.continue.dev) applications and got some hubris after the second chapter. But here's what I learned: **LLMs love reading books too**. I can feed entire technical books to kickstart a prototype, giving the AI deep domain knowledge to work with.

## The Breakthrough: Opus for Thinking, Sonnet for Doing

Last we I saw on X w perfectly captures what users actually feel:

![x.com/BrendanFalk/status/1953925364709044626](https://res.cloudinary.com/bdougie/image/upload/f_auto,q_auto/blog/opuwhen-to-use-opus-4-1s-4-1-what-is-it-good-for-109.png)

I responded as soon as I saw Brendan's clarifying question. Not all models should be treated the same—they're like different tools in your toolbox. You wouldn't use a sledgehammer to hang a picture, right? Opus isn't meant for one-shot solutions; it's designed for deep reasoning.

![Opus vs Sonnet comparison](https://res.cloudinary.com/bdougie/image/upload/f_auto,q_auto/blog/opuwhen-to-use-opus-4-1s-4-1-what-is-it-good-for-110.png)

## Meet Your New Architect: Opus

### Planning That Actually Makes Sense

Opus doesn't simply just write code - it _reasons_ through problems. Here's a real issue it created when I asked about making my pipeline production-ready:

```markdown
**Add comprehensive logging and debugging capabilities**
**#18**

Implement structured logging throughout the pipeline for debugging, monitoring, and audit purposes.

**Tasks**
* Replace print statements with proper logging
* Add structured logging with JSON format
* Implement log levels (DEBUG, INFO, WARN, ERROR)
* Add correlation IDs for request tracking
* Create log rotation configuration
* Add performance timing logs
* Implement audit logging for data changes

```

It didn't just say "add logging" - it thought through correlation IDs, audit trails, and performance metrics. These are things I would've discovered the hard way in production. Quick tip: take all that reasoning work and produce wonderful documentation and reference guides to use for future context engineering.

![Opus planning output](https://res.cloudinary.com/bdougie/image/upload/f_auto,q_auto/blog/opuwhen-to-use-opus-4-1s-4-1-what-is-it-good-for-111.png)

### The Deep Thinking Sessions

Here's what Opus helps me with daily:

-   **Document Changes**: I personally like combing through open source code to discover unfamiliar patterns. Using tools like [Repomix](https://repomix.com/?ref=blog.continue.dev) or [Gitingest](https://gitingest.com/?ref=blog.continue.dev)
-   **Architecture Decisions**: On multiple occasions, Opus brings up ideas for improving performance or test coverage. I personal don't like the agent simply adding and staying on the main goal. This is where handing Sonnet implementation the clear winner.
-   **Scaling Strategy**: I am not much of data engineer, but do like a kubernetes or two and happy when Opus can suggest refactors while in planning to think how projects can scale with orchestration.

## Meet Your Builder: Sonnet

At the time I was drafting this blog post, [Anthropic announced 1m context windows](https://www.anthropic.com/news/1m-context?ref=blog.continue.dev) for Sonnet. So at this point, context length is not a blocker for choosing between the two. The real difference is task speed and reasoning depth.

### The Speed Demon

While Opus is thinking deep thoughts, Sonnet is cranking out code. It's perfect for:

-   Writing individual transform functions
-   Quicker bug fixes
-   API integrations
-   Boilerplate generation
-   Well-scoped implementations

Because my local environment has access to the GitHub CLI, I leverage it often to generate GitHub issues while working with Opus:

```bash
> Great plan, use the gh CLI to generate sub-issues with issue linking to each other. Identify which should be implemented next.
```

Switch to Sonnet:

```
> look at gh issue 34 and implement the plan suggested
```

Not quite a one shot here, but my goal is not speed for sake of speed, I instead like the fact Sonnet get the job done without oversight.

## The Decision Framework

### When I Reach for Opus

```
✓ Planning new pipeline components
✓ Creating comprehensive GitHub issues
✓ Debugging multi-system problems
✓ Reasoning through data flow architecture
✓ Writing acceptance criteria
✓ Thinking through error handling strategies

```

### When I Reach for Sonnet

```
✓ Implementing well-defined transforms
✓ Writing SQL queries
✓ Creating simple utility functions
✓ Fixing known bugs
✓ Writing tests for existing code
✓ Well scoped GitHub Issues

```

## Why This Changes Everything

Traditional development: Write code → Find problems → Refactor → Repeat

My workflow now: Think with Opus → Plan comprehensively → Execute with Sonnet → Review with Opus → Ship

The kicker? That logging issue Opus created? It caught a potential production issue before I wrote a single line of code:

Before commit I like having Opus do a code review using "first principles" as the keyword in the prompt and it discovered a test that was using a live in the test environment. It's reasoning made the discovery that test would hit a rate limit pretty quickly and made the suggestion and fix for mocking that experience.

## The Future is Continuous AI

We're moving from AI as a coding assistant to AI as a thinking partner. It's not about replacing developers - it's about augmenting our ability to tackle complex problems.

Think about it:

-   **Before**: Spend hours planning, maybe miss something
-   **Now**: Collaborate with AI that catches what you miss
-   **Next**: Add both Sonnet and Opus to your agent and switch between the two.

**Start planning with Opus in your editor.**

-   Switch to Sonnet for implementation with a simple model selector
-   Jump back to Opus for code review
-   All without leaving your development environment

##
Ready to Level Up Your Pipeline Game?

Stop treating all AI models the same. Try this:

1.  Take your next complex problem to Opus
2.  Let it create a comprehensive plan
3.  Execute with Sonnet
4.  Track the time you save

Your future self (and your production environment) will thank you.

* * *

**Want more?** Check out [docs.continue.dev](https://docs.continue.dev/?ref=blog.continue.dev) and start building with context that scales.
