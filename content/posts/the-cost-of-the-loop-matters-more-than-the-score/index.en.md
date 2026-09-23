---
draft: false
author: jpcercal@gmail.com
slug: the-cost-of-the-loop-matters-more-than-the-score
title: The Cost of the Loop Matters More Than the Score
date: 2026-09-23T18:00:00+00:00
description: Anthropic says Opus 5.5 is at Fable 5.1's level on most work and 40 percent cheaper than Opus 5 at default settings; the useful question is what that does to the cost and the checks of an agent loop.
categories:
  - other
tags:
  - architecture
  - engineering
  - lessons-learned
---

I've been reading Anthropic's notes on Claude Opus 5.5, and the part I keep coming back to is not the leaderboard.

They say it performs at the level of Claude Fable 5.1 on most work, and that in their own use the gap is narrower than the benchmark scores suggest. They also say that at this level of capability, benchmark margins have become a less reliable guide to real-world differences.

That matches how I have been thinking about agent work. A higher score does not tell me whether a long session on our codebase will be cheaper to run, easier to check, or still inside the boundaries we set.

## The clear gain is the cost of the loop

Where the notes are concrete is efficiency.

They say Opus 5.5 costs less per token than Opus 5 and uses fewer tokens per task, which nets out to a 40 percent drop in costs. At default settings, their tests show it will cost 40 percent less than Opus 5 on typical workloads. Input and output are $4 and $20 per million tokens, 20 percent less than Opus 5. Cache reads, which they say make up the majority of agentic and coding work costs, are $0.20 per million, 60 percent less than Opus 5's $0.50. They also say it generates output more than 30 percent faster than Opus 5.

Two of their comparisons are specific enough to keep. An early tester, as Anthropic reports it, audited and fixed a 200,000-line codebase in under three hours, where Opus 5 took over 20 hours and used 2.5 times as many tokens. In an internal test, both Opus 5.5 and Fable 5.1 translated HAProxy from C into Rust and passed nearly all of HAProxy's own regression tests. Opus 5.5 finished in 9.5 hours, against 12 for Fable 5.1, at 51 percent less cost. On FrontierCode, they say default effort beats GPT-6 Astra at roughly 20 percent of the cost per task.

I would not treat those reports as a promise for our repos. The 40 percent figure is for default settings and typical workloads, and their charts show cost per task moving with effort.

## The checks have to move with the price

Opus 5.5 ships with safeguards similar to those on Fable 5.1, because Anthropic treats it as comparable to Claude Mythos 5.1 in biology and cybersecurity. Most cybersecurity tasks are re-routed to Opus 4.8. Routine work to identify and fix bugs in the software development lifecycle is still in scope. On the benchmarks, when safeguards intervened, cybersecurity tasks were completed by Opus 4.8, and biology and frontier LLM development tasks were completed by Opus 5. Anthropic says that likely reduces Opus 5.5's scores on those benchmarks.

On their automated behavioral audit, the most comprehensive alignment test they run, they call it the strongest model they have tested. In a containment evaluation, it attempted to cross boundaries around 85 percent less often than Opus 5 or Mythos 5.1, and every attempt was low severity and self-reported. They also say it often suspects it is being evaluated, which challenges how well that audit predicts real-world settings. They say catching every failure before deployment remains unsolved.

They also say the writing is clearer, and that it puts the most important information up front. That is their account of the model, not a result I have measured.

So the practical reading, for me, is familiar. The price can move. The surrounding checks still have to move with it: which effort you chose, what the session is allowed to do, which model actually answered when a safeguard fired, and how a person reviews the result.

The cheaper loop does not remove the need to stay on it.

If you are about to point a long coding session at Opus 5.5, I would start with one task you already know, keep the effort setting explicit, and compare cache-read cost, token use, and whether a safeguard sent the work to another model. The figures above are from [Anthropic's notes](https://www.anthropic.com/claude-opus-5-5). What would you change first?
