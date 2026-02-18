---
title: "Code Offline with Context Engineering"
date: 2025-07-01
description: "How to use Continue's agent mode with Ollama for productive offline coding during your commute."
canonical_url: "https://blog.continue.dev/go-offline-with-context-engineering/"
---

I ride BART every day, and I've turned those underground stretches into productive coding time using Continue's agent mode with Ollama. No internet required.

<iframe width="560" height="315" src="https://www.youtube.com/embed/TbJ0gaC0T-E" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>

## The reality of offline development

We've all been there. No access to LLMs goes down for 30-40mins because your coffee shop WiFi is crawling. You're in a secure environment where code can't leave the network. Or you're simply trying to focus without the constant pull of online distractions.

Modern development has become so AI-dependent that when connectivity fails, our productivity grinds to a halt. But it doesn't have to be this way.

## Why agent mode changes everything

Agent mode isn't just another AI feature—it's a different way of thinking about code generation. Instead of asking questions and getting suggestions, you're directing an assistant that can:

-   Create new files and directories
-   Implement entire features across multiple files
-   Execute terminal commands
-   Refactor existing code while maintaining consistency
-   Work through complex, multi-step implementations

When this runs entirely on your machine through Ollama, you get zero-latency responses that keep pace with your thoughts. No network round trips. No API rate limits. Just you and your local AI, working together.

## Context engineering: setting yourself up for success

Here's what I've learned from coding on BART: the difference between a frustrating experience and a productive session comes down to preparation. Before you lose internet access, you need to set up your environment for success.

### The PRD approach

I've started writing PRDs (Product Requirement Documents) before touching any code. Why? Because without clear constraints, AI agents tend to take you on side quests. You ask for a simple feature, and suddenly you're refactoring half your codebase.

My PRDs are simple markdown files that outline:

-   What specific problem I'm solving
-   Success metrics for the implementation
-   Clear boundaries (anything else becomes a new issue)
-   Step-by-step tasks broken into bite-sized chunks

This keeps both me and the agent focused, especially when time is limited.

### Rules as the 3rd rail

Rules are pre-emptive additions to your system prompt that teach the AI how your team writes code. They're not about being restrictive—they're about amplifying your team's best practices.

For example, I have rules that:

-   Specify we use Vitest, not Jest, for testing
-   Define our file structure conventions
-   Outline error handling patterns
-   Set code style preferences

When you're offline, these rules become even more critical. They prevent the agent from making assumptions that would require internet lookups or external dependencies.

### Pre-flight checklist

Before going offline:

1.  **Index your entire codebase** - Let Continue fully analyze your work in progress with [@Git Diff](https://docs.continue.dev/customize/context-providers?ref=blog.continue.dev#git-diff)
2.  **Download relevant docs** - Use the [@docs](https://docs.continue.dev/customize/deep-dives/docs?ref=blog.continue.dev) provider to cache API documentation locally
3.  **Create project-specific rules** - Capture your team's conventions and patterns
4.  **Pull your models** - Ensure Ollama has downloaded all models you'll need
5.  **Test your setup** - Run a few prompts to verify everything works offline

This preparation transforms agent mode from a helpful tool into genuine productivity multiplication.

## Setting up your offline development environment

Getting started is straightforward:

1.  [**Install Ollama**](https://ollama.com/?ref=blog.continue.dev) from ollama.com (note: [LM Studio](https://lmstudio.ai/?ref=blog.continue.dev) & [llama.cpp](https://github.com/ggml-org/llama.cpp?ref=blog.continue.dev) also work)
2.  **Configure Continue** with a config.yaml:

**Pull your models**:

```bash
ollama run gemma:4b  # Great for constrained environmentsollama run llama3.1:8b  # More capable for complex tasks

```
```yaml
name: offline-coding-config
version: 0.0.1
schema: v1

models:
  - name: Gemma 4B
    provider: ollama
    model: gemma:4b
    roles:
      - chat
      - edit
      - apply
    defaultCompletionOptions:
      temperature: 0.7

  - name: Qwen2.5-Coder
    provider: ollama
    model: qwen2.5-coder:1.5b
    roles:
      - autocomplete
    defaultCompletionOptions:
      temperature: 0.3

```

## Real-world lessons from BART

My daily BART commute has become a testing ground for offline development. Here's what actually happens:

### The reality check

But here's what worked: Using Gemma 4B, I was able to interact with my code, ask questions, and plan implementations. The key was having that PRD ready before the train even left the station. Low level models do well with defined and scoped work. Try generating PRDs or specs with more powerful models before going offline.

### What actually gets done

In a typical 30-40 minute BART ride, I can:

-   Review and refine a PRD with agent assistance
-   Generate step-by-step implementation tasks
-   Work through 2-3 small features or bug fixes
-   Create comprehensive test suites for existing code

The constraint of time and lack of internet actually helps focus. No Stack Overflow rabbit holes. No "let me just check the X real quick." Just you, your code, and an assistant that knows your project.

### The compound effect

Over a week of commutes, those 30-minute sessions add up. Features get shipped. Technical debt gets addressed. And most importantly, you develop a rhythm of focused, constraint-based development that carries over to your regular work.

## Tips from the underground

After months of BART coding, here's what I've learned:

1.  **Start small** - Don't try to refactor your entire app on your first offline session
2.  **Embrace constraints** - Limited time and no internet can actually boost creativity
3.  **Document everything** - PRDs and rules become your external brain
4.  **Pick the right model** - Gemma 4B is perfect for constrained environments
5.  **Don't fight the crowd** - Some days the train is too packed. That's okay.

## Give Continue a try

Whether you're commuting on BART, flying cross-country, or just trying to focus without distractions, Continue with Ollama gives you a powerful AI coding assistant that works anywhere.

The setup takes minutes, but it fundamentally changes how you approach offline time. Those previously "dead" periods—commutes, flights, waiting rooms become opportunities for focused, productive coding.

Check out our [installation guide](https://docs.continue.dev/quickstart?ref=blog.continue.dev) to get started. And if you're interested in sharing rules and PRD templates with the community, take a look at our new [awesome-rules repository](https://github.com/continuedev/awesome-rules?ref=blog.continue.dev) that includes [my rules for setting up tasks](https://github.com/continuedev/awesome-rules/blob/main/rules/task-management/agent-task-generate-tasks.md?ref=blog.continue.dev).

We'd love to hear about your offline coding experiences. [Join the discussion](https://github.com/continuedev/continue/discussions) to share what you've built during your commute.

Because sometimes the best code gets written underground.
