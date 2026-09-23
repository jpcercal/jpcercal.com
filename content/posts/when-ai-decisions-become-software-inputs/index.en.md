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

I've been thinking about what software actually needs when it asks an AI system where to send a request.

Usually it is not another paragraph. It is an answer it can inspect: a known category, an indication of uncertainty, and a rule for what happens next.

Consider a support message: “I was charged twice, and the receipt page will not load.” A free-form explanation might help a person, but the application still has to decide which queue receives the message. Parsing prose into a queue name adds another place for the workflow to fail.

## Constrain the judgment

Jev (e.g., TypeSafe AI System One, a decision model not a chat model) offers three question types for evaluating supplied state. **Choice** selects one option from a set defined by the caller and returns probabilities for the options. **Noul** answers a yes-or-no question with a value from zero to one representing the probability of yes, with no separate confidence field. **Score** rates the state against an ordered rubric and returns a probability-weighted score. These are different ways to ask for a bounded judgment, rather than an open-ended explanation. Details are in the introduction, quickstart, Choice, Noul, Score, and confidence docs.

For the support message, the application could ask one Choice question. The shape below follows the evaluation API (`state` plus `questions`, sent to the System One endpoint with `model: jev-latest`); the question id is yours and is not sent to the model:

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

The request shape follows Jev’s evaluation API (`state` supplies the material to judge, and the named question defines the allowed answers). The response has an `answers.queue` object with `type`, `choice`, `probabilities`, and `confidence`. Its shape, shown here as a type sketch rather than a result from a live call, is:

```ts
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

The probability for an option and the `confidence` field are separate values. Confidence is derived from how the distribution spreads; a single peak means high confidence, a flat split means low confidence. The application can inspect the full distribution, rather than treating the selected category as a complete account of the uncertainty. The message in this example touches both billing and a page error, so a review path is useful when the classification is ambiguous.

## Put the workflow in code

The application can validate that the answer contains an allowed category and usable probabilities. It can then branch with plain code and no parsing:

```python
if queue.confidence < 0.5:
    send_to_review(message)
elif queue.choice == "billing":
    assign(message, team="billing")
else:
    assign(message, team=queue.choice)
```

A clear, low-stakes classification goes to a queue and uncertain cases go for review. It should also define what happens when the API fails or returns an unusable answer. Those are application decisions, not decisions delegated to the model.

A threshold can help decide when to review, but it should come from testing on the application’s own messages and the cost of routing mistakes. High confidence might act automatically, medium might confirm or flag, low should route to a human. A probability is not proof that a particular answer is correct. A typed answer can be perfectly valid and still put a message in the wrong queue.

Some decisions should never be left to this judgment. If a rule says a refund above a fixed amount needs approval, the application should compare the amount in deterministic code and keep the irreversible step behind human approval. Jev may help identify what a message is about, but it should not replace an exact policy check. For consequential actions, the workflow should preserve appropriate human review before anything happens.

The surrounding system can hold what the model cannot.

If you route work with typed judgments, I put the exact check I run for ambiguous classifications in the Python branch above. What would you change first?
