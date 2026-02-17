---
title: "Cognee MCP is my new AI Memory for making rules"
date: 2025-07-22
description: "Using Cognee MCP as an AI memory engine that learns from every interaction and remembers what you teach it."
canonical_url: "https://blog.continue.dev/cognee-mcp-is-my-new-ai-memory/"
---

It started with a simple mistake. I'd create new documentation pages for our Mintlify site, get them ready for review, and then... they'd be invisible on the live site. Every single time, I'd forget to add them to docs.json.

That's when I realized I needed something smarter than sticky notes. Then I discovered the [Cognee MCP](https://github.com/topoteretes/cognee/tree/main/cognee-mcp?ref=blog.continue.dev), an AI memory engine that learns from every interaction and actually remembers what you teach it.

## **The Problem: My Assistant Had Goldfish Memory**

Here's the thing about migrating hundreds of documentation pages: you hit the same issues repeatedly. During our [Continue docs migration to Mintlify](https://blog.continue.dev/how-we-migrated-docs-from-docusaurus-to-mintlify/), I kept forgetting a crucial step. Mintlify keeps new pages hidden by default, which is great for drafting, but terrible when you push to production and wonder why your new docs are MIA.

The [continue-mcp reference page](https://docs.continue.dev/reference/continue-mcp?ref=blog.continue.dev)? Almost went to a PR review completely invisible. It wasn't just one page either, it was every new file I created. I'd forget to add to docs.json. My AI assistant was no help; it would generate perfect documentation but never remind me about this critical step.

Every time I'd catch the mistake in review, fix it, and then... nothing. Next documentation page, same oversight. It was like Groundhog Day, but for missing docs.

## **The Solution: An AI That Actually Learns**

[Cognee MCP](https://github.com/topoteretes/cognee/tree/main/cognee-mcp?ref=blog.continue.dev) turns your local machine into a memory palace for your AI assistant. Unlike sending your data to some cloud service, everything stays local, your interactions become a searchable knowledge [graph powered by LanceDB and Kuzu](https://www.cognee.ai/blog/deep-dives/cognee-lancedb-simplifying-rag-for-developers?ref=blog.continue.dev).

What sold me wasn't the tech stack (though it's pretty sweet). It was this: Cognee suggested using the [Mintlify MCP](https://mintlify.com/docs/mcp?ref=blog.continue.dev) to ensure we always use the latest syntax. Then it recommended indexing our docs.json so it would never hallucinate the syntax again.

An AI suggesting how to make itself smarter? Now we're talking.

## **Setting Up Cognee MCP in Continue**

```sh
git clone https://github.com/topoteretes/cognee.git
cd cognee/cognee-mcp
pip install uv
uv sync --dev --all-extras --reinstall
source .venv/bin/activate
python src/server.py
```

Now for the Continue integration. Add this to your [`config.yaml`](https://docs.continue.dev/reference?ref=blog.continue.dev):

```yml
mcpServers:
  - name: cognee
    command: uv
    args:
      - --directory
      - /path/to/your/cognee-mcp
      - run
      - cognee
    env:
      TOKENIZERS_PARALLELISM: "false"
      LLM_API_KEY: "sk-your-api-key"
```

## **The Magic: Project Rules That Learn**

Here's where it gets interesting. Create `.continue/rules/cognee_rules.yaml` in your project:

```md
---
name: Generate rules during chat from user-agent interaction
alwaysApply: true
description: >
  Cognee's save_interaction tool captures every exchange,
  building a memory of what works and what doesn't.
rules:
  - tool: save_interaction
    auto: true

```

Now every interaction gets stored. When I explained that new Mintlify pages need to be added to docs.json, Cognee remembered. When I showed it where to add entries in the navigation structure, it learned. The next time I created a new documentation page, my assistant knew to remind me and in agent mode, it could even add the entry automatically.

## **Real Results from Real Work**

During the migration, Cognee caught patterns I didn't even realize I was teaching:

-   It learned to check docs.json whenever I created new .mdx files
-   It started suggesting the correct navigation structure based on file location
-   It remembered to add pages to the appropriate section (like adding continue-mcp to the reference section [at line 263](https://github.com/continuedev/continue/blob/main/docs/docs.json?ref=blog.continue.dev#L263))

The kicker? It works with your existing Continue workflow. You're not learning a new tool, you're just making your current assistant smarter.

## **Tips from the Trenches**

**When Rules Don't Generate**: Check your database connection. Cognee needs proper setup to build its knowledge graph.

**Model Quality Matters**: Better models = better rule inference. Don't skimp here.

**Start Simple**: Begin with obvious patterns like syntax corrections. Let Cognee learn your style gradually.

## **Your Assistant Should Remember**

We're all context engineering these days, but why should we repeat the same context every session? Cognee MCP solves this by giving your AI assistant actual memory.

The Mintlify migration taught me something: the best documentation tool isn't the one with the most features. It's the one that learns from how you actually work. And when your AI assistant remembers that every new page needs a docs.json entry? That's when you know you've found something special.

Try it on your next migration. Let your assistant learn. Because honestly, we've got better things to do than teach the same lessons twice.

_Want to see the results? Check out_ [_docs.continue.dev_](https://docs.continue.dev/?ref=blog.continue.dev) _and see the pages features referenced in the article._
