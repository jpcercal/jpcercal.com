---
draft: false
author: jpcercal@gmail.com
slug: when-ai-decisions-become-software-inputs
title: When AI Decisions Become Software Inputs
date: 2026-09-23T00:00:00+00:00
description: A typed AI judgment can help software route work, provided the application owns the rules, checks uncertainty, and keeps people responsible for consequential decisions.
categories:
  - other
tags:
  - architecture
  - engineering
  - lessons-learned
---

Most software does not need another paragraph when it asks an AI system where to send a request. It needs an answer it can inspect: a known category, an indication of uncertainty, and a rule for what happens next.

Consider a support message: “I was charged twice, and the receipt page will not load.” A free-form explanation might be useful to a person, but an application still has to decide which queue receives the message. Parsing prose into a queue name adds another place for the workflow to fail.

## Constrain the judgment

Jev offers three question types for evaluating supplied state. **Choice** selects one option from a set defined by the caller and returns probabilities for the options. **Noul** answers a yes-or-no question with a value from zero to one representing the probability of yes. **Score** rates the state against an ordered rubric and returns a probability-weighted score. These are different ways to ask for a bounded judgment, rather than an open-ended explanation.

For the support message, the application could ask one Choice question:

```json
{
  "model": "jev-latest",
  "state": "I was charged twice, and the receipt page will not load.",
  "questions": {
    "queue": {
      "type": "choice",
      "instructions": "Which team should inspect this message first?",
      "criteria": {
        "billing": "Charges, payments, and receipts",
        "technical": "Site errors and unavailable pages",
        "other": "Neither category clearly applies"
      }
    }
  }
}
```

The request shape follows Jev’s evaluation API: `state` supplies the material to judge, and the named question defines the allowed answers. The response has an `answers.queue` object with `type`, `choice`, `probabilities`, and `confidence`. Its shape, shown here as a type sketch rather than a result from a live call, is:

```text
answers.queue = {
  type: "choice",
  choice: "billing" | "technical" | "other",
  probabilities: {
    billing: number,
    technical: number,
    other: number
  },
  confidence: number
}
```

The probability for an option and the `confidence` field are separate values. The application can inspect the full distribution, rather than treating the selected category as a complete account of the uncertainty. The message in this example touches both billing and a page error, so a review path is useful when the classification is ambiguous.

## Put the workflow in code

The application can validate that the answer contains an allowed category and usable probabilities. It can then route a clear, low-stakes classification to a queue and send uncertain cases for review. It should also define what happens when the API fails or returns an unusable answer. Those are application decisions, not decisions delegated to the model.

A threshold can help decide when to review, but it should come from testing on the application’s own messages and the cost of routing mistakes. A probability is not proof that a particular answer is correct. A typed answer can be perfectly valid and still put a message in the wrong queue.

Some decisions should never be left to this judgment. If a rule says a refund above a fixed amount needs approval, the application should compare the amount in deterministic code. Jev may help identify what a message is about, but it should not replace an exact policy check. For consequential actions, the workflow should preserve appropriate human review before anything happens.

The useful shift is small: ask AI for a bounded judgment, then let software inspect it and apply the workflow’s rules. That makes the boundary between inference and action visible enough to test, revise, and own.
