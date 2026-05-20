---
title: "I Trained a Model Instead of Writing a Skill"
date: 2026-05-20
description: "Skills are a great way to teach an agent a pattern. I got curious whether the agent could just learn the pattern, so I tried training a model while also figuring out what RL actually is."
---

Skills are popular right now, and worth paying attention to. A skill is a markdown file that teaches an agent a pattern. You write the workflow down once, point the agent at it, and the agent picks up the pattern without you re-explaining it every session.

That works. It works well enough that I started wondering what would happen if the agent learned the pattern instead of reading it every time. That is the line between writing a skill and training a model.

So I tried my hand at training a model. I did most of this while also learning what reinforcement learning actually is, which I will admit upfront. Experts would likely get better results, but you got to start somewhere, so why not now? These are my results.

## Training is smaller than it sounds

I did not train a model from scratch. Nobody does that anymore for this kind of work, its 2024 anymore. What I trained was a [LoRA adapter](https://arxiv.org/abs/2106.09685), which is a small set of low-rank matrices that sit on top of a frozen base model. The base model holds all the general capability. The adapter is the margin notes.

A LoRA adapter for a 32B model is around 100 MB. The base model is 60+ GB. The adapter is the part that knows what your agent is supposed to do.

I procured an H100 (yeah I know) to run training on it. One GPU, a few hours per run. Cheaper than I expected, slower than I expected, and very easy to break by getting hyperparameters wrong.

## The pipeline

The shape of the pipeline ended up looking like this:

1. Capture agent sessions through [tapes](https://tapes.dev) as they happen.
2. Label which skill each session was exercising and whether it succeeded.
3. Turn the labeled sessions into training examples.
4. Train a LoRA adapter on a base model.
5. Serve the adapter behind a [vLLM](https://github.com/vllm-project/vllm) endpoint so an agent can call it like any other OpenAI-compatible model.

Capture is the easy part. tapes already records every request and response. The hard part is everything after capture, and almost all of that hardness lives in step two.

## The part that actually mattered

I started with around 77,000 raw sessions. After auditing for completeness and stripping out anything that did not have a clean start and end, that came down to about 6,300 faceted sessions. Each faceted session carries a label for which skill it was, and a verdict on whether it worked.

From those I produced roughly 2,100 supervised examples and 235 preference pairs. That is the dataset. Three hundred plus hours of agent activity, distilled down to a few thousand rows.

Almost every decision that determined the final result was a labeling decision. What counts as the same skill. What counts as success. Which sessions are too noisy to use. The training step is essentially turning those labels into weights.

Labeling is the clear winner. If you do nothing else from this post, label your sessions.

## SFT and DPO, plainly

There are two phases I used.

**Supervised fine-tuning (SFT)** is "imitate these good sessions." You take examples of the agent doing the thing well and train the model to produce those outputs given those inputs. This is the part that feels most like training in the classic sense.

**Direct preference optimization (DPO)** is "prefer this over that." You take pairs where one response is better than another and train the model to lean toward the better one. It is a lighter-weight stand-in for full reinforcement learning, which is where most of my time-learning-what-RL-is budget went.

SFT first, DPO second. SFT teaches the shape of good behavior. DPO sharpens the edges.

## The closed loop

This is the part I find genuinely interesting.

The agent generates sessions. The sessions get labeled. The labels become training data. The training data improves the model. The improved model runs the agent that generates the next round of sessions.

Each loop, the data gets slightly better, because the agent is slightly better at producing usable sessions. You do not need a new dataset. You need the agent to keep working and the labels to keep coming.

I did not get to run this loop many times. I ran it enough to see the shape.

## Honest results

The first evaluation looked like a tie. Thirty prompts, an LLM judge, head-to-head between the base model and the adapter. The numbers were within noise. I wanted to be excited about that and I was not.

So I tested the eval rig itself, which I should have done first. I asked the judge to compare the same two responses twice, once in each order. It flipped its verdict 53% of the time. That is not a judge. That is a coin.

So I fixed the rig. I swapped to a stronger judge, added a rubric, ran every comparison in both orders, and only counted agreements. Self-flip rate dropped from 53% to about 3%.

Then I re-ran the eval. Here are the actual numbers, which I will report honestly because I think the honest version is more useful than the flattering one.

| Eval (30 prompts, Haiku judge, both orders) | Base wins | Adapter wins | Tie |
|---|---|---|---|
| Skill-specific rubric | 12 | 3 | 15 |
| Overall quality | 9 | 6 | 15 |

The 32B finetune lost to its own base on the skill rubric, 12 to 3. On overall quality it was closer, 9 to 6, but still losing.

The smaller experiment was more interesting. I ran the same pipeline on a 4B base model. On a curated set of seven prompts it went 4 to 3 in the adapter's favor. On a broader 30-prompt set it was 16 to 14, again for the adapter. Small wins, but real ones.

> The smaller model came closer to beating its base than the larger one did.

I have theories about why. I am not confident enough in any of them to put them in a blog post.

## What I took away

Three things, in order of how surprised I was.

**Labeling is the clear winner.** Almost everything that determined the final quality of the model was a decision made during labeling. The training step matters, but it can only work with what the labels give it. If I do this again, I will spend more time on the labels and less time on the hyperparameters.

**Skills alone get you surprisingly far.** A well-written skill is a competitive baseline. For most of what I was trying to teach the model, a skill on top of the base model performed about as well as my finetune did, sometimes better. That is not a knock on training. It is a reminder that the bar is not "vs. nothing." The bar is "vs. the version of the same agent with the skill already loaded."

**We are a bit away from fine-tuning reliably beating the base.** At least with the methods and budget I used, on the sizes I used, against the bases I used. Someone with more RL background, better data, and more compute would probably get a different table than mine.

None of this stopped being worth doing. I now know how a LoRA adapter is shaped. I know what SFT and DPO actually are instead of having read about them. I know how to break an eval rig, and how to fix one. That is a lot for one rented GPU.

If you have been writing skills, keep writing skills. If you have been curious whether the agent could just learn the pattern instead, around 17 GPU-hours and under $50 of rented H100 time is roughly what it costs to find out.
