---
title: "Pre-commit hooks are back thanks to AI"
date: 2025-08-27
description: "How pre-commit hooks help AI assistants ship better code by focusing on implementation instead of formatting debates"
---

## The Problem: AI Gets Lost in the Weeds

I've been working with AI coding assistants daily, and I've noticed something interesting: they're incredible at implementation but can get completely derailed by code style issues. Give an AI a task like "add authentication to this API," and halfway through, it might start reformatting your entire codebase or get stuck in an internal debate about whether to use tabs or spaces.

This isn't the AI's fault – it's trained to produce clean, well-formatted code. But when you're trying to ship features, you don't want your assistant spending tokens on semicolon placement.

## Enter Pre-commit Hooks: The AI's Guard Rails

Pre-commit hooks are having a renaissance, and it's because of AI. What used to feel like annoying gatekeeping now serves as essential boundaries that keep AI assistants focused on what matters: the actual implementation.

Here's what I mean. When I set up ESLint and Prettier with pre-commit hooks in my projects, I'm essentially telling the AI: "Don't worry about formatting. Just write the logic." The hooks handle the rest.

## My Setup: Simple and Effective

I keep it straightforward. Here's what actually works:

```json
// .lintstagedrc.json
{
  "*.{js,ts,tsx}": ["eslint --fix", "prettier --write"],
  "*.{json,md}": ["prettier --write"]
}
```

That's it. Every file that gets staged for commit automatically gets formatted and linted. The AI doesn't need to think about it.

The magic happens in the pre-commit hook:

```bash
#!/bin/sh
npx lint-staged
```

## Why This Works So Well with AI

### 1. Clear Separation of Concerns

The AI focuses on business logic, algorithms, and architecture. The tooling handles style. This separation means I get better implementations because the AI isn't context-switching between "should this be a const or let" and "how do I implement this authentication flow."

### 2. Faster Iterations

When the AI knows formatting will be handled automatically, it can produce rougher, faster drafts. I've seen response times improve because the AI isn't trying to perfectly format every line. It just needs to be syntactically correct.

### 3. Consistent Codebase

AI models can have different "opinions" about code style depending on their training data. With pre-commit hooks, it doesn't matter. Everything gets normalized to your project's standards before it hits the repository.

## The Unexpected Benefit: AI Education

Here's something I didn't expect: pre-commit hooks actually help train the AI for future sessions. When the AI sees that its code always gets formatted a certain way post-commit, it starts adapting its output to match those patterns. It's like passive learning through consistent feedback.

## Real-World Example

Last week, I asked Claude to refactor a complex React component. Without pre-commit hooks, it spent half the conversation debating whether to use arrow functions or function declarations. With hooks in place, I just told it: "Don't worry about formatting, just make it work better."

The result? A clean refactor in one shot, focused entirely on improving the component's logic and performance. The pre-commit hook handled all the formatting on save.

## The Setup That Just Works

If you want to try this approach, here's the minimal setup:

```bash
npm install -D husky lint-staged eslint prettier eslint-config-prettier
npx husky init
echo "npx lint-staged" > .husky/pre-commit
```

Add your config files, and you're done. The AI can now focus on what it does best: solving problems and implementing features.

## Looking Forward

As AI coding assistants become more prevalent, I think we'll see more tools designed specifically to create boundaries and guide rails. Pre-commit hooks are just the start. The goal isn't to restrict the AI but to channel its capabilities where they're most valuable.

The irony isn't lost on me: a tool that many developers found annoying is now essential for working effectively with AI. Sometimes the old solutions are exactly what new problems need.

## The Bottom Line

Pre-commit hooks aren't about catching human mistakes anymore. They're about keeping AI focused. By handling the mundane aspects of code quality automatically, we free up both human and artificial intelligence to tackle the interesting problems.

And honestly? My code has never been cleaner or shipped faster.