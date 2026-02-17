---
title: "Finding Similar GitHub Issues with Continuous AI and Chroma Cloud"
date: 2025-08-08
description: "Using Chroma Cloud to find semantically similar GitHub issues based on meaning, not just keyword matching."
canonical_url: "https://blog.continue.dev/finding-similar-github-issues-with-continuous-ai-and-chroma-cloud/"
---

Ever opened a pull request and wondered "hasn't someone dealt with this before?" What if your AI coding assistant could instantly find similar issues across your entire project history? Let's make that happen using [Chroma Cloud](https://www.trychroma.com/?ref=blog.continue.dev).

At Continue we believe the future is Continuous AI. As we explore agents in our software development life cycle, there will continue to be ways to explore how far we can take by allow the agent to help triage issues without leaving out the terminal.

## **The Problem: Déjà Vu in Development**

We've all been there. You're fixing a bug or implementing a feature, and something feels familiar. Maybe someone already solved this. Maybe there's context you're missing. Traditional GitHub search is keyword-based - it can't understand that "config file missing" and "recreate configuration if not found" are talking about the same thing.

I came up with [deja-view](https://github.com/bdougie/deja-view?ref=blog.continue.dev) - a semantic search tool that uses Chroma's vector database to find genuinely similar issues based on meaning, not just matching words.

Chroma allows you to work with embedding vectors of text, in our case GitHubissues and transforms them into high-dimensional vectors - think of it as converting words into coordinates in space where similar meanings cluster together. When you search, Chroma converts your query into the same vector space and finds the nearest neighbors. It's like having a map where "authentication error" and "login failed" are right next to each other, even though they share no common words. The best part? Chroma Cloud client handles the heavy lifting - embedding generation happens within the client itself, while Chroma Cloud manages vector storage and similarity search -  so you can focus on building, not infrastructure.

## **Real Example: Finding Hidden Context**

Working on Continue [PR #6683](https://github.com/continuedev/continue/pull/6683?ref=blog.continue.dev)? Let me show you what semantic search reveals:

![Semantic search results](https://res.cloudinary.com/bdougie/image/upload/f_auto,q_auto/blog/finding-similar-github-issues-with-continuous-ai-and-chroma-cloud-113.jpg)

Note: [Issue #5053](https://github.com/continuedev/continue/issues/5053?ref=blog.continue.dev) is 60% similar and already closed. That's valuable context - someone already solved a related problem. This was a simple test using the default embeddings provided by the Chroma client, but I could definitely see the potential for improving this experience and adding it to my continuous AI workflow.

## **See It Live: The GitHub Action in Continue**

Check out [PR #7066](https://github.com/continuedev/continue/pull/7066?ref=blog.continue.dev) where I've added this workflow to the Continue repository. Here's what it does automatically on every new issue and PR:

1.  **Semantic Search**: Finds the top 5 most similar existing issues
2.  **Confidence Scoring**: Shows similarity percentages for each match
3.  **Smart Suggestions**: Recommends converting to discussions when appropriate
4.  **Auto-labeling**: Applies relevant labels based on content analysis

Here's what the bot comment looks like:

![Bot comment with similar issues](https://res.cloudinary.com/bdougie/image/upload/f_auto,q_auto/blog/finding-similar-github-issues-with-continuous-ai-and-chroma-cloud-114.png)

## **Continue the Plan Mode**

I'm working on something that could change how we approach context engineering entirely and I am using Continue's Plan mode to can create a semantic understanding layer that helps AI assistants truly grasp our project history.

The workflow I'm building:

1.  **Open the Issue**: Use Continue to explore and plan the integration
2.  **Come up with the Plan**: I've been using continue and the GitHub MCP read and respond the issues while my code is in context.
3.  **Semantic Context**: Find similar issues directly into your AI workflow

Here's more context on: [Plan Mode: Your LLM's Safe Sandbox for Smarter Code Exploration](https://blog.continue.dev/plan-mode-your-llms-safe-sandbox-for-smarter-code-exploration/)

## **Context Engineering Magic**

At the time of this writing, I've only come up with a plan that I opened as an [issue #1](https://github.com/bdougie/deja-view/issues/1?ref=blog.continue.dev) but my goal is to implement this as a novel part of my continuous AI engineering workflow:

1.  **Discover**: Find similar issues with deja-view
2.  **Explore**: Use Plan mode + MCP to safely investigate the indexed
3.  **Understand**: Let Continue read relevant files and build context
4.  **Implement**: Switch to Agent mode with full understanding

## **The Future is Contextual**

This is just the beginning. I am thinking through some other ideas:

-   Automatic PR review enrichment with a check for similar issues
-   Semantic search across code, docs, and discussions
-   AI that understands your project's history

Tools like Chroma and Continue aren't just making coding faster - they're making it smarter. By building better context, we help AI assistants truly understand our codebases.

Stop reinventing the wheel. Start finding the wheels others have already built.

* * *

Ready to try it? Clone the repo [deja-view](https://github.com/bdougie/deja-view?ref=blog.continue.dev) and explore features using Plan mode. Contributions welcomed.
