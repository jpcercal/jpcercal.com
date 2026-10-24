---
draft: false
author: jpcercal@gmail.com
slug: cakephp-problem-with-mod_rewrite
title: CakePHP problem with mod_rewrite
date: 2012-02-23T03:10:27+00:00
description: If you've ever faced a problem with mod_rewrite in CakePHP, know that the solution can be quite simple, check out the problem we encountered and solved.
categories:
  - engineering
tags:
  - php
  - cakephp
  - framework
  - apache
---

Hello, good evening. Today I had problems with [CakePHP](http://cakephp.org/) URL rewriting, and decided to share
the error and how I solved it.

![CakePHP problem with mod rewrite](CakePHP.png "CakePHP problem with mod rewrite")

The problem was that when I tried to access the application's URL through the browser, it returned the following
error **404 – Not Found**.

Well, first, after looking for inconsistencies in controller and action names, clearing the cache,
checking whether URL rewriting was enabled in Apache, etc, I turned to Google. After some research,
I found the solution in _Cake's_ own documentation.

It turned out that a **.htaccess** file was missing from the application's _ROOT_ directory. _For some reason I had deleted this file
by accident._

So, for anyone else having trouble. Here's the solution, and other possible solutions to this
problem: [CakePHP Documentation](http://book.cakephp.org/2.0/pt/tutorials-and-examples/blog/blog.html?highlight=mod_rewrite#uma-palavra-sobre-o-mod-rewrite).
