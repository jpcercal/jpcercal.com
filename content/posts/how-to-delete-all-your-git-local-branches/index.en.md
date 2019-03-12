---
draft: false
author: jpcercal@gmail.com
slug: how-to-delete-all-your-git-local-branches
title: How to delete all your Git local branches
date: 2019-03-12T11:31:29+00:00
description: Sometimes after working for a long time, all the remaining local branches are just taking up space. Here's a small snippet to remove all your local branches in one go.
categories:
  - other
tags: 
  - git
  - tutorial
  - howto
---

Well, from time to time I feel the need of cleaning my local branches, it’s part of my natural workflow and if you need the same you could benefit as well of this handful pipped command below:

```bash
$ git branch --list | \
egrep --invert-match "(master|develop|\*)" | \
xargs git branch -D
```

So, I believe the command listed above is self-explained, but if you didn’t understand what’s going on then, here’s the explanation for each on of them:

- `git branch --list` lists all the branches in your git local repository
- `egrep --invert-match "(master|develop|\*)"` filters out the branch `master`, `develop` and the current branch (where you’re now, just in case), note that, you can add/remove branches to/from that expression.
- `xargs git branch -D` deletes each one of your local branches except the ones filtered out on the step before


Feel free to modify the command above and even create an alias for that, please share with me as a comment if you had to change it to your needs or if you know a better way for doing that.

I hope it was useful, see you next time with another small tip.
