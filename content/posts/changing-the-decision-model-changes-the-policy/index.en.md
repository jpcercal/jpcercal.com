---
draft: true
author: jpcercal@gmail.com
slug: changing-the-decision-model-changes-the-policy
title: Changing the Decision Model Changes the Policy
date: 2026-10-11T00:00:00+00:00
description: Jev, Laya, and Liquid d1 can share a request shape without sharing an error profile. Changing the model means revalidating the thresholds, review workload, and deployment behind the application's policy.
categories:
  - other
tags:
  - architecture
  - engineering
  - lessons-learned
---

I've been reading Vercel's comparison of Jev, Laya, and Liquid d1, and the useful part for me is not which model wins.

The article does not establish a winner.

It shows that all three can answer the same typed questions through AI Gateway. That makes comparing them easier. It does not tell us whether the application should act on their answers in the same way.

That is the distinction I would keep before changing a model in an existing system.

## The request can stay the same

In [an earlier post]({{< ref "posts/when-ai-decisions-become-software-inputs/index.en.md" >}}), I looked at using a typed judgment to route a support message. The application defines the categories, inspects uncertainty, and decides what happens next.

Vercel's [comparison](https://vercel.com/i/jev-vs-laya-vs-liquid-d1) applies a similar idea to a product catalog.

A listing describes a backpack with a laptop compartment and an insulated lunch pouch. The question asks what is actually being sold, rather than which accessories appear in the description.

Through AI Gateway, the model identifiers are `typesafe-ai/jev`, `convaiinnovations/laya`, and `liquid/d1`. The shared AI SDK interface supports Choice, Score, and Boolean questions.

That is useful integration work we do not have to repeat.

But a shared request shape is not a shared error profile. One model might confuse a laptop sleeve with a backpack. Another might send more listings for review. Both can return valid answers.

The interface makes the experiment easier to arrange. It does not replace the experiment.

## A familiar number can mean something different

The detail I would inspect first is the value used to decide whether an answer can proceed automatically.

The [AI SDK contract](https://ai-sdk.dev/docs/ai-sdk-core/decisions) makes probability distributions optional for Choice and Score answers. If an application requires the selected category's probability, it has to check that the distribution is present.

Missing information should not become certainty.

Provider-specific confidence needs a separate check. TypeSafe's [Choice confidence](https://docs.typesafe.ai/confidence) is calculated from the leading probability and the number of options. With four options, a leading probability of `0.7` produces confidence of `0.6`.

A cutoff of `0.65` would accept one value and reject the other.

That difference exists before we even change models.

After a change, keeping the same field name and threshold still does not establish that we will accept the same proportion of incorrect answers. The SDK does not promise calibration across providers.

I would treat the threshold as part of the application's policy, tested with a particular model, question, and integration. Not as a setting that becomes portable because the request compiles.

## Where it runs is part of what we test

Laya adds another consideration: downloadable checkpoints and a Jev-compatible HTTP server provide a self-hosting path.

That matters if controlling the serving environment is a requirement.

It also gives the team more work to own. We have to choose a checkpoint, test the languages and input lengths we receive, and operate the inference process and its capacity.

Calling Laya through AI Gateway evaluates a hosted deployment. It does not test every checkpoint we might run ourselves.

I would record the deployment alongside the model name. Otherwise, two results labeled "Laya" could describe different systems.

Self-hosting is an option to evaluate, not evidence that the operational problem has disappeared.

## Compare the cases the workflow cannot afford to miss

The backpack example has an intended label defined by a person. Vercel explicitly says it is not an observed result from the models.

One clear listing would not be enough anyway.

I would start with the boundaries: a standalone laptop sleeve advertised as fitting inside a backpack, a lunch tote with a shoulder strap, and a pouch whose description does not contain enough information to classify it.

Before testing, the catalog rule needs to say what happens to bundles and products outside the taxonomy. Otherwise, a disagreement may reveal an undefined business rule rather than a model failure.

Then I would compare two things together: incorrect assignments among automatically accepted listings, and the proportion sent for review.

A model that appears safer because almost everything reaches a person has changed the workload, not necessarily improved the workflow.

Thresholds should be selected on labeled examples and assessed on a separate set. Failed requests and missing distributions should remain distinguishable from a deliberate `review` answer, even if all three eventually need human attention.

Those distinctions help us understand what needs fixing.

## Change the model without giving away the rule

If Jev already meets the application's requirements, I would keep it as the baseline. Liquid d1 offers another hosted candidate. Laya is relevant both as a hosted comparison and when investigating self-hosting.

I have not run a comparative evaluation of these models. Vercel's article demonstrates compatible requests, not superior accuracy or speed.

The useful next step is smaller than a migration: keep the current definitions, compare the candidates on work we own, and inspect what each would accept, reject, or leave unresolved.

The model can change.

The application still owns the conditions under which its answer becomes an action.

Which threshold in your system would you revalidate first?
