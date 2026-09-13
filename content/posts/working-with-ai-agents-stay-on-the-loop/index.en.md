---
draft: false
author: jpcercal@gmail.com
slug: working-with-ai-agents-stay-on-the-loop
title: "Working With AI Agents: Stay on the Loop"
date: 2026-09-13T00:00:00+00:00
description: Instead of reviewing every line an AI agent produces, design the environment — specs, tests, checks, and feedback loops — so good outcomes emerge reliably.
categories:
  - other
tags:
  - architecture
  - engineering
  - lessons-learned
---

I've been thinking recently about how our role as software engineers changes when AI agents become part of the development process.

There seems to be a tempting choice between two extremes.

Either we let the agent handle everything and trust the result, or we stay involved in every step, reviewing every piece of code it produces.

I don't think either approach scales particularly well.

## The output isn't the whole process

When building software, we often focus heavily on the artifacts we produce: code, tests, technical designs, configuration, and documentation.

But those are really intermediate steps toward something else.

The thing we actually care about is the outcome: working software that behaves correctly, performs well, is secure, and solves the problem we intended to solve.

This distinction becomes particularly interesting with AI agents.

An agent can produce code much faster than a human can inspect it line by line. If our process depends on a developer manually validating every small decision the agent makes, we've simply moved the bottleneck.

The agent may be faster at producing code, but the overall system isn't necessarily faster.

## In the loop vs. on the loop

A useful way to think about this is the difference between being **in the loop** and being **on the loop**.

Being in the loop means reviewing and correcting the individual artifacts produced by the agent.

Being on the loop means designing the environment in which the agent operates.

That environment can include:

* clear specifications
* architectural constraints
* tests
* static analysis
* security checks
* deployment validation
* documentation
* feedback from previous runs

Instead of manually fixing every problem, we improve the mechanisms that help the agent detect and avoid those problems.

This is closely related to Martin Fowler's recent discussion of humans and agents in software engineering loops. He describes this as humans managing the "how" loop rather than micromanaging every intermediate result.

## The engineering problem becomes different

This changes what I think is an interesting engineering problem.

Instead of asking:

> "How do I get the AI to write better code?"

We can start asking:

> "How do I design a system in which the AI can reliably produce good outcomes?"

That's a very different question.

It brings us back to familiar engineering concepts: feedback loops, constraints, observability, testing, failure handling, and continuous improvement.

The technology is new.

The engineering principles aren't.

And perhaps that's one of the more interesting parts of working with AI agents: we're not replacing software engineering with something completely different.

We're applying software engineering principles to a new kind of participant in the development process.
