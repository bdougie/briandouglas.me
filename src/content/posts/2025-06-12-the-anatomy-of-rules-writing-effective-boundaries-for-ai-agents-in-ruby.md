---
title: "The Anatomy of Rules: Writing Effective Boundaries for AI Agents in Ruby"
date: 2025-06-12
description: "Breaking down what makes effective rules for AI coding agents, using Ruby TDD rules as an example."
canonical_url: "https://blog.continue.dev/the-anatomy-of-rules-writing-effective-boundaries-for-ai-agents-in-ruby/"
---

When working with AI agents to write code, the difference between good and great results often comes down to the quality of your rules. In [my recent video](https://www.youtube.com/watch?v=8fkLZ5oB8Do&ref=blog.continue.dev), I demonstrated how rules serve as guardrails that amplify your intentions and ensure the agent codes like a senior developer would.

My examples are in Ruby, but I believe these tips carry over to any language of your choice. Let's break down what makes a good rule, using my actual Ruby TDD rules as the example.

**Why Rules Matter**

Rules are more than just suggestions; they're essential building blocks that shape how your AI assistant interprets your requests. Clear, actionable rules help the agent consistently produce code that meets your standards, avoids common pitfalls, and aligns with your team's workflows.

## Anatomy of a Good Rule

Drawing from my [tdd-in-ruby.md](https://github.com/bdougie/gameoflife/blob/main/.continue/rules/tdd.md?ref=blog.continue.dev), here's how I structure rules for maximum effectiveness:

| Section | Purpose |
|---|---|
| **Name** | A concise, descriptive title for the rule |
| **Description** | Explains the rule's intent and the specific problem it solves |
| **Scope** | Where and when the rule applies (e.g., all Ruby files, test files, etc.) |
| **Do** | Explicit instructions for the agent—what to always do |
| **Don't** | Clear prohibitions—what to never do |
| **Examples** | Positive and negative code snippets to clarify the rule |
| **Rationale** | (Optional) The "why" behind the rule, especially for non-obvious conventions |

## Example: Test-Driven Development in Ruby

Below is a distilled version of my actual TDD rule for Ruby, as used in my [Continue assistant](https://hub.continue.dev/bdougie/ruby?ref=blog.continue.dev):

```markdown
---
name: Test-Driven Development in Ruby
description: Always use test-driven development (TDD) for Ruby projects. Write tests first using RSpec, then implement code to make tests pass.
---
## Rules

### Do this
  - Write RSpec tests before implementing any production code.
  - Ensure tests fail before writing implementation code.
  - Implement only enough code to make the current test pass.
  - Refactor code after tests pass, maintaining green tests.
  - Use descriptive test names and organize tests logically.

### Dont do this
  - Don't write implementation code before writing a failing test.
  - Don't skip writing tests for new features or bug fixes.
  - Don't use third-party test frameworks other than RSpec unless specified.

## Examples

### Good
```rb
# spec/grid_spec.rb
describe Grid do
  it "initializes with a given size" do
    grid = Grid.new(5, 5)
    expect(grid.cells.size).to eq(5)
  end
end

# grid.rb
class Grid
  attr_reader :cells
  def initialize(rows, cols)
    @cells = Array.new(rows) { Array.new(cols, 0) }
  end
end
```

### Bad
```rb
# grid.rb
class Grid
  def initialize(rows, cols)
    @cells = Array.new(rows) { Array.new(cols, 0) }
  end
end

# spec/grid_spec.rb
# (No test written before implementation)
```

## What Makes This Rule Effective?

-   **Clarity:** The rule spells out exactly what to do (write RSpec tests first) and what not to do (don't write implementation first).
-   **Contextual Relevance:** It's tailored for Ruby and RSpec, matching the workflow I want the agent to follow.
-   **Explicit Boundaries:** By stating both positive ("do") and negative ("don't") actions, it leaves little room for ambiguity.
-   **Concrete Examples:** Good and bad code snippets illustrate the rule in practice, making it easy for both humans and agents to interpret.
-   **Iterative Feedback:** If the agent strays, I refine the rule and loop it back into the workflow, amplifying my intentions with each iteration.

## Best Practices for Writing Your Own Rules

-   **Be direct and prescriptive:** Use strong language ("always," "never," "must," "do not").
-   **Modularize:** Keep each rule focused on a single aspect (e.g., TDD, naming conventions, error handling).
-   **Document rationale:** Explain why the rule exists, especially for less obvious conventions. _The description attribute in the rules file is a perfect place for this._ [_See the docs for syntax_](https://passwords.dougie.dev/?ref=blog.continue.dev) examples.
-   **Iterate:** Treat rules as living documents—update them as your needs and workflows evolve.

## Getting Started with Rules in Continue

The fastest way to add rules to your Continue setup is through the [rules CLI](https://rules.so/?ref=blog.continue.dev#add-rules). Simply run `rules add ruby` to download curated Ruby rules into your project's `.rules` folder, or pull directly from GitHub repositories with:

`rules add gh:continuedev/awesome-rules/ruby`

These rules automatically integrate with Continue, ensuring your AI assistant follows your team's coding standards in every Agent request.

## Final Thoughts

Rules are the contract between you and your AI agent. The more thoughtfully you define them, the more reliably the agent can amplify your intentions turning AI from a code generator into a true collaborator. For Ruby projects, rules like TDD-first not only ensure code quality but also teach the agent to work the way Senior Developers do.

Ready to level up your AI native workflow? Start by writing rules today. Check out our [Rules Deep Dive](https://docs.continue.dev/customize/deep-dives/rules?ref=blog.continue.dev) in Continue docs and example rules in the [continuedev/awesome-rules](https://github.com/continuedev/awesome-rules/tree/main/rules/ruby?ref=blog.continue.dev) repo.
