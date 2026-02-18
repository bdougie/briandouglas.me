---
title: "Building a Semantic Code History Search with LanceDB"
date: 2025-06-26
description: "Build a semantic code history search using LanceDB and Continue's MCP integration to query your git history with natural language."
canonical_url: "https://blog.continue.dev/building-a-semantic-code-history-search-with-lancedb/"
---

Ever wished you could ask "who wrote all the authentication logic?" instead of manually running git blame on every auth-related file? What if your AI coding assistant could understand not just **who** changed code, but **why** and **what** it relates to across your entire codebase? Let's build exactly that using [**LanceDB's** **multimodal lakehouse**](https://www.lancedb.com/blog/blog/multimodal-lakehouse/?ref=blog.continue.dev) and Continue's MCP integration!

## **The Problem: Git Blame**

Traditional `git blame` shows you line-by-line authorship, but it's keyword-based and lacks semantic understanding. You can't ask questions like:

-   "Find all error handling patterns similar to this one"
-   "Who implemented our retry logic across services?"
-   "Show me authentication code changes from last sprint"

[**LanceDB**](https://www.lancedb.com/?ref=blog.continue.dev) - an AI-native vector database that turns your code history into a searchable knowledge base! Built on Apache Arrow with columnar storage, it's blazing fast and runs embedded in your app. No separate database server needed.

## **What You'll Get**

A local MCP server that lets you ask Continue natural language questions like:

-   "Who implemented the error handling in our API?"
-   "Find all database-related changes by Sarah"
-   "Show me authentication code changes from last month"

## **The Setup: Git Blame Search MCP**

We'll use the `git_blame_search` tool as an MCP (Model Context Protocol) server that integrates with Continue. This gives your AI assistant superpowers to understand your codebase history semantically.

## **Quick Start**

```bash
# Clone the repository
git clone https://github.com/bdougie/git_blame_search.git
cd git_blame_search

# Install with uv (super fast Python package manager)
curl -LsSf https://astral.sh/uv/install.sh | sh
uv sync
```

### **2\. Configure Continue**

Add to your Continue config (~/.continue/config.yml):

```
mcpServers:
  git_blame_search:
    command: uv
    args:
      - --directory
      - /path/to/git_blame_search  # Replace with your actual path
      - run
      - python
      - src/server.py

```

**Important**: The cwd points to where you cloned the repo. Everything runs locally on your machine - your code never leaves your computer!

### **3\. Start Using It!**

Restart VS Code and start asking questions in Continue:

```
@mcp who wrote the authentication middleware?
@mcp find commits related to database optimization
@mcp show me error handling patterns in the codebase
```

## **How It Works**

### **The Indexing Magic (**[**git\_blame\_tool.py**](https://github.com/bdougie/git_blame_search/blob/main/git_blame_tool.py?ref=blog.continue.dev)**)**

The tool creates a semantic index of your git history:

1.  **Extracts Git Blame Data**: For each file, it runs git blame to get line-by-line authorship
2.  **Creates Embeddings**: Uses sentence transformers to convert code + context into vectors
3.  **Stores in LanceDB**: Saves everything in a local vector database for lightning-fast searches

Key snippet:

```python
# Get blame data and create embeddings
blame_data = get_git_blame(file_path)
for line in blame_data:
    text = f"{line['content']} {line['commit_message']}"
    embedding = model.encode(text)
    # Store in LanceDB with metadata
```

### **The MCP Server (**[**server.py**](https://github.com/bdougie/git_blame_search/blob/main/src/server.py?ref=blog.continue.dev)**)**

Built with FastMCP, the server exposes tools to Continue:

```python
@mcp.tool()
async def search_git_blame(query: str):
    """Search git history using natural language"""
    # Encode query to vector
    query_embedding = model.encode(query)

    # Search LanceDB
    results = table.search(query_embedding).limit(10)

    return format_results(results)
```

The server:

-   Runs locally in your project directory
-   Uses stdio transport to communicate with Continue
-   Provides semantic search over your indexed git history

## **Why This Changes Everything**

Traditional Git Blame asks: **"Who touched line 42?"**

Semantic Git Blame asks: **"Who knows about authentication patterns?"**

With LanceDB's multimodal capabilities, you can:

-   Store code snippets with embeddings
-   Include commit messages and PR descriptions
-   Add documentation and architecture diagrams
-   Query everything with natural language

## **Extra credit**

1.  **LanceDB on Continue Hub**: LanceDB is officially available on the [Continue Hub](https://hub.continue.dev/lancedb?ref=blog.continue.dev), making integration even easier!
2.  **Performance**: LanceDB runs embedded, so searches are lightning fast with no network latency
3.  **Scale**: Handle millions of code snippets without breaking a sweat
4.  **Privacy**: Everything runs locally - your code never leaves your machine

## **The Future is Multimodal**

LanceDB's vision of the multimodal lakehouse means you're not limited to just code. Imagine:

-   Searching architecture diagrams alongside code
-   Finding who drew that system design
-   Connecting meeting notes to code changes
-   Querying across all your development artifacts

## **Ready to Transform Your Code Search?**

Stop grepping through git logs, try out LanceDB with Continue's MCP integration, you get an AI assistant that truly understands your codebase's history.

**Try it now**: Install Continue, set up this LanceDB service as an MCP server, and start asking your code history real questions. Your future self (and your team) will thank you!

Want more? Check out [Continue's MCP docs](https://continue.dev/docs?ref=blog.continue.dev) and start building your own semantic development tools!
