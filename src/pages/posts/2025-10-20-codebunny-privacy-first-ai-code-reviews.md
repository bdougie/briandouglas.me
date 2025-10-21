---
title: "CodeBunny: Privacy-First AI Code Reviews with Continue"
date: 2025-10-20
description: AI code reviews that run in your GitHub Actions environment, keeping your code in your repository. Built on Continue for flexible, privacy-focused code analysis.
blueskyUrl: "https://bsky.app/profile/bizza.pizza/post/3m3o3sstnmk2w"
---

![CodeBunny AI code review in progress](https://res.cloudinary.com/bdougie/image/upload/v1761006218/blog/codebun_idkj3a.png)

Getting AI to generate code has never been easier. With a simple prompt, you can scaffold entire features, generate boilerplate, or refactor complex functions. It's no surprise we're seeing a rise in AI code review tools for GitHub pull requests—if AI can write code, it should be able to review it too. But here's the question no one's asking: how much control do you have over your data when using these tools? Most AI code review services require sending your code to third-party servers. CodeBunny takes a different approach: it runs entirely in your GitHub Actions environment, keeping your code in your repository.

## What It Does

CodeBunny is a GitHub Action that uses Continue's AI agent to provide intelligent, context-aware code reviews. When a pull request opens or updates, it analyzes your codebase patterns, applies custom rules, and posts actionable feedback—all without your code leaving GitHub's infrastructure.

## How It Works

The workflow is straightforward:

1. **Pattern Analysis** - Understands your project's conventions and architecture
2. **Custom Rules** - Loads project-specific guidelines from `.continue/rules/`
3. **Continue Agent** - Uses Continue's CLI to perform the review
4. **Single Comment** - Posts or updates one comment per PR (no spam)

Here's the basic workflow setup:

```yaml
name: Code Review
on:
  pull_request:
    types: [opened, synchronize, ready_for_review]
  issue_comment:
    types: [created]

jobs:
  review:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: CodeBunny Review
        uses: bdougie/codebunny/actions/codebunny@main
        with:
          continue-api-key: ${{ secrets.CONTINUE_API_KEY }}
          continue-org: ${{ vars.CONTINUE_ORG }}
          continue-config: ${{ vars.CONTINUE_CONFIG }}
```

## The Continue Integration

CodeBunny is built on Continue, the open-source platform for building custome coding agents. This gives you flexibility: use Continue's hosted service or self-host your own instance. The integration leverages Continue's agent mode for deep code analysis while keeping everything in your control.

## Custom Rules: Your Standards

Create markdown files in `.continue/rules/` to define what matters to your team:

```markdown
---
globs: "**/*.{ts,tsx}"
description: "TypeScript Standards"
---

# TypeScript Best Practices
- Use strict type checking
- Avoid 'any' types
- Prefer interfaces for object shapes
```

These rules apply automatically to every PR. Define standards for security, testing, architecture—whatever your team needs.

## Interactive Reviews

Beyond automatic reviews, comment on any PR to request specific feedback:

- `@codebunny check for security issues`
- `@codebunny review the TypeScript types`
- `@codebunny explain the architecture changes`

## Why It Matters

**Privacy** - Your code never leaves your infrastructure. Unlike SaaS code review services, analysis happens in your GitHub Actions runner.

**Control** - Review data lives as GitHub comments in your repo. Self-host Continue if you want complete control over the AI infrastructure.

**Customization** - MIT licensed and open source. Fork it, modify it, make it yours.

**No Vendor Lock-in** - Switch between Continue's cloud and self-hosted anytime. Your configuration stays the same.

## Getting Started

Setup takes about 10 minutes:

1. Create a GitHub App with PR write permissions (or use default `GITHUB_TOKEN`)
2. Set up a Continue account or self-hosted instance
3. Add secrets: `CONTINUE_API_KEY`, `CONTINUE_ORG`, `CONTINUE_CONFIG`
4. Add the workflow file
5. Create custom rules (optional but recommended)

## When to Use CodeBunny

CodeBunny makes sense when privacy matters, you have team-specific conventions that generic AI tools miss, or you want control over your AI infrastructure. Currently optimized for JavaScript/TypeScript projects.

CodeBunny represents a shift in AI developer tools—bringing AI to your infrastructure instead of sending code to external services. It's pragmatic, leveraging Continue's power while maintaining data ownership. For teams serious about code quality but unwilling to compromise on privacy, it's a compelling alternative.

## Future Exploration

Looking ahead, I'm exploring the use of SQLite or vector databases to persist PR review data. This would enable tracking review patterns over time, building custom analytics on code quality trends, and potentially training specialized models on your team's specific feedback patterns. The goal is to make code reviews not just automated, but continuously improving based on historical context.

**Try it:** [github.com/bdougie/codebunny](https://github.com/bdougie/codebunny)
