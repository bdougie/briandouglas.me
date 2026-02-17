---
title: "Recurse ML Rules That Enable async Context Engineering with Kids Around"
date: 2025-07-08
description: "Using Recurse ML rules as automated quality gates for async AI development during fragmented family time."
canonical_url: "https://blog.continue.dev/recurse-ml-rules-that-enable-async-context-engineering-with-kids-around/"
---

Last weekend, I was practicing what Ty Dunn shared on ["context engineering"](https://blog.continue.dev/context-engineering-the-bottleneck-to-better-continuous-ai/) with my project [contributor.info](https://contributor.info/?ref=blog.continue.dev) while the kids were home. Instead of traditional vibe coding, I was systematically providing Agent mode with the right context to work autonomously during my fragmented family time.

You know the drill - 15-minute bursts between "Dad, can I have a snack?" and "Dad, the WiFi isn't working!" I was testing how well my context engineering setup could handle async development when I discovered [PR #179](https://github.com/bdougie/contributor.info/pull/179?ref=blog.continue.dev) had a critical import path error that would have broken the entire build.

This is exactly why I've become obsessed with the [Recurse ML](https://www.recurse.ml/?ref=blog.continue.dev) and their coding assistant rules as my safety net for async AI development. The [awesome-rules repository](https://github.com/continuedev/awesome-rules?ref=blog.continue.dev) has a specific rule called "**Verify Changes Using Recurse ML**" that's designed exactly for this scenario.

## **The Reality Check: AI Agents Make Mistakes**

Here's what Continue's agent generated in my test file:

```js
// test-inngest-dev.js

import { inngestQueueManager } from './src/lib/inngest/queue-manager.js';
```

Looks reasonable, right? Wrong. The queueMissingFileChanges method is actually defined in src/lib/progressive-capture/queue-manager.ts under the DatacaptureQueueManager class. The import path was completely hallucinated.

**The error breakdown:**

-   **Expected:** src/lib/progressive-capture/queue-manager.ts
-   **Generated:** ./src/lib/inngest/queue-manager.js
-   **Impact:** Module not found error, broken build, frustrated developer

This would have been a painful debug session if it had made it to production. Instead, my recurse-ml rules caught it before I even committed when I ran rml test-inngest-dev.js --from HEAD^.

## **Why Async Context Engineering Needs Guardrails**

When I'm doing async context engineering with kids around, I'm solving what Ty describes as the core challenge: "providing relevant information to AI when it's needed." I set up the context once, describe what I want, and let Continue's agent work while I handle parenting duties.

This workflow is incredibly productive BUT requires automated quality gates. As Ty notes, "bad context is worse than no context" - and the recurse-ml rules from the [awesome-rules repository](https://github.com/continuedev/awesome-rules/blob/main/rules/recurse-ml/rml-verify.md?ref=blog.continue.dev) prevent context poisoning that could propagate errors throughout my codebase.

![Recurse ML rules in action](https://res.cloudinary.com/bdougie/image/upload/f_auto,q_auto/blog/recurse-ml-rules-that-enable-async-context-engineering-with-kids-around-137)

**My async context engineering pattern:**

1.  **Morning context setup:** Define rules and project context once
2.  **Ship with confidence:** Automated rules prevent errors that manual review might miss
3.  **Agent autonomy:** Let Continue work with established context while I handle family duties
4.  **Fragmented oversight:** Quick check-ins during 15-30 minute windows
5.  **Quality gate:** The "**Verify Changes Using Recurse ML**" rule in .continue/rules automatically applies when I'm working on .js, .ts, or other files matching the glob pattern, prompting Continue to run verification

## **The Recurse ML Safety Net in Action**

The beauty of the recurse-ml rule is they're designed for exactly this scenario - fast iteration with automated quality control. But here's the game-changer: adding these rules to `.continue/rules` means they're automatically applied to every AI interaction, keeping your code clean even when you're working completely async.

![Recurse ML verification output](https://res.cloudinary.com/bdougie/image/upload/f_auto,q_auto/blog/recurse-ml-rules-that-enable-async-context-engineering-with-kids-around-138)

Here's what they caught in my weekend session:

**Import path validation:**

```sh
Symbol: queueMissingFileChanges

The code is importing 'inngestQueueManager' from './src/lib/inngest/queue-manager.js'
but this is the wrong path. The queueMissingFileChanges method is actually defined
in 'src/lib/progressive-capture/queue-manager.ts' under the DatacaptureQueueManager
class. The import path is incorrect and will cause a module not found error.
```

**Affected locations:**

```sh
src/lib/progressive-capture/queue-manager.ts:42

```

This level of detail from an automated tool is game-changing for async context engineering. I get specific feedback on not just WHAT'S wrong, but WHERE it's defined and WHY it's problematic. And because the rules live in .continue/rules, they're enforced during every AI generation - not just when I remember to run the CLI tool.

## **Why This Workflow Works for Async Context Engineering**

Traditional development assumes long, uninterrupted focus sessions. But as Ty explains in his post, context engineering is about "systematically solving the problem of getting relevant information to AI when it's needed" - not when it's convenient for human schedules.

Parenting requires tools that work asynchronously. You need:

-   **Work asynchronously:** Let AI agents run while you're making lunch
-   **Catch mistakes automatically:** No time for deep code review between interruptions
-   **Provide clear feedback:** Specific errors, not vague warnings
-   **Scale with chaos:** More reliable as your attention gets more fragmented

The recurse-ml rule solve what Ty calls "the maintenance problem" in context engineering. They provide ongoing quality control that "continues to work well as your organization evolves" - or in my case, as family chaos evolves throughout the weekend.

## **Real Results: Productive Chaos**

**Weekend async context engineering session breakdown:**

-   **Total time:** 2 hours across Saturday/Sunday
-   **Actual coding:** 45 minutes in 3-4 bursts
-   **Features shipped:** PWA implementation, improved error handling, new test coverage
-   **Bugs prevented:** 1 critical import error, 2 potential performance issues
-   **Time saved:** ~1 hour of debugging

The recurse-ml rule turned what could have been a debugging nightmare into a smooth deployment. I shipped solid features while being fully present for family time.

## **Try the Recurse.ml Rules Yourself**

If you're juggling development with life constraints, async context engineering with recurse-ml rule can transform your workflow:

1.  **Set up systematic context** using Continue rules and project-specific context
2.  **Add the "Verify Changes Using Recurse ML" rule** from the [awesome-rules repository](https://github.com/continuedev/awesome-rules?ref=blog.continue.dev) to your .continue/rules
3.  **Start with agent mode** on a non-critical feature to test your context setup
4.  **The rule triggers automatically** when Continue works on files matching the glob pattern (like my .js test file)

The goal isn't to replace careful development - it's to make progress when careful development isn't possible.

## **Bottom Line**

Async context engineering with kids around used to mean choosing between family time and code quality. Now, with Continue's systematic approach to context and recurse-ml rule, I can have both. The automated quality gates prevent the context poisoning that Ty warns about, and I ship features without sacrificing weekend family time.

Try async context engineering with recurse-ml rule on your next constrained development session. You might be surprised how productive you can be when you solve the context problem systematically rather than fighting your schedule.

* * *

_Ready to try async context engineering with automated quality gates? Check out the_ [_recurse-ml rules_](https://github.com/continuedev/awesome-rules/blob/main/rules/recurse-ml/rml-verify.md?ref=blog.continue.dev) _and Ty's post on_ [_context engineering_](https://blog.continue.dev/context-engineering-the-bottleneck-to-better-continuous-ai/) _to start building systematic context for your AI development workflow._
