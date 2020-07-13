---
draft: false
author: jpcercal@gmail.com
slug: how-to-create-a-bidirectional-file-sync-using-unison
title: How to Create a Bidirectional File Sync using Unison
date: 2020-07-13T06:35:28+00:00
description: Unison can be used as a two-way file sync tool for OSX (macOS), Unix and Windows. Check it out how we synchronized our iCloud folder with a git repository.
categories:
  - other
tags: 
  - howto
  - tutorial
  - osx
  - linux
  - windows
---

So if you came here I consider you already have a problem to solve, and you are familiar with `unison`. If this is the case, skip the introduction please. 

If you don't, then keep reading as it might clarify a few things before we get started with the how to use `unison` in order to create a bidirectional (two way) synchronization of two directories.

# Introduction

To simplify the understanding let's imagine that you have two folders and you want both folders to be synchronized when an event happens such as a new file is created, a file got changed or even a file got deleted. You want both folders to reflect exactly the same state as a replica.

There are different tools available to achieve it given the situation mentioned before, but we are going to talk about [unison](https://www.cis.upenn.edu/~bcpierce/unison/) today.

## What is unison and how it can help us?

According to the official project `unison` is a file-synchronization tool for OSX (macOS), Unix, and Windows. It has common features being shared among other famous tools, however, there are several points where it differs, to mention a few of them:

- It allows communication across different systems, like if you want to synchronize a Windows laptop with a Unix Server.
- As it can propagate events on both directions `unison` shows up as a very useful tool for bidirectional files sync.
- Unison runs in a user-level program, so you don't need to have superuser privileges in order to use it.
- The tool is completely free and the source code is available under the GNU public license.

# Our problem

As I'm a big fan of automation so I wanted to write on my iPhone or iPad while out of home or even in a few moments where I can see myself with some thoughts while relaxing on the sofa. Because of that I bought last year the license of [iA Writer](https://ia.net/writer) for macOS and iOS to take notes of anything and at the same time make use of the [markdown syntax](https://www.markdownguide.org/basic-syntax/). The problem is that all the articles from this blog are written down in Markdown files, there's no database, but the git repository available on GitHub. 

> If you want to check the project out, please take a look into this post where I tell a bit more of the blog architecture and how I generate the final website through an integration with TravisCI.
> {{< ref "posts/revisiting-the-layout-and-the-blog-project/index.md" >}}.

The problem I had was that I wanted to save the articles content on my iPad, but when I was on the PC I wanted to commit the file to the repository and see how would it looks like in a preview mode of the blog post locally (before sending to production).

In order to achieve this, I decided that I wanted to sync my [iCloud](https://www.icloud.com) subfolder (the one containing all the blog posts synchronized by iA Writer) with one specific folder from the [git repository `./content/posts/`](https://github.com/jpcercal/cercal.io/tree/master/content/posts). And, it worked like a charm. Check it out how to do that below.

## How to install Unison

On Debian based distributions you can install it by running the following command:

```bash
apt-get install unison
```

If you're like me running it on OSX (macOS) I think the easiest way would be to install it by using [brew](https://brew.sh):

```bash
brew install autozimu/homebrew-formulas/unison-fsmonitor
brew install unison
```

> Note that on macOS if you want the watch mode to work, an additional tool named [unison-fsmonitor](https://github.com/autozimu/unison-fsmonitor) must be installed too.

If you're using Windows, I think [chocolatey](https://chocolatey.org) might be a good solution to stay on the command line side. I did not test it though.

```bash
choco install unison
```

> There are also the pre-compiled binaries page which can help you to install it directly, but manually. Sorry.
> Check it out on [http://unison-binaries.inria.fr](http://unison-binaries.inria.fr).

## How to enable (two-way) bidirectional sync of two directories

The solution is pretty straight forward you only have to run the following command:

```bash
unison \
  -repeat watch \
  -copyonconflict \
  -prefer newer \
  -ignore 'Name {.DS_Store}' \
  "/Users/jpcercal/projects/cercal.io/content/posts" \
  "/Users/jpcercal/Library/Mobile Documents/27N4MQEA55~pro~writer/Documents/cercal.io"
```

A basic understanding on what the command above is doing:

- `-repeat watch` says to `unison` that we want it to watch for changes and to sync those changes incrementally as needed.
- `-copyonconflict -prefer newer` tells that we want the conflicts to be solved automatically and that we prefer the newer version if it happens to occur.
- `-ignore` as the name suggests ignore all changes related to the pattern `'Name {.DS_Store}'`.
- `"/Users/jpcercal/projects/cercal.io/content/posts"` is my git repository pointing to the [./content/posts/](https://github.com/jpcercal/cercal.io/tree/master/content/posts).
- `"/Users/jpcercal/Library/Mobile Documents/27N4MQEA55~pro~writer/Documents/cercal.io"` is my iCloud folder, allowing me to sync any content from the iCloud directory with my local dir.

> `-ignore` could be interesting to you if you plan to sync a root folder of a project which usually has third-party dependencies like the `vendor` folder on PHP projects or `node_modules` on Javascript. For example if you want to ignore additionally both of them you can do something like:
> `-ignore 'Name {node_modules,vendor,composer.lock,package-lock.json,.DS_Store}'`.

The command above will start doing the synchronization of the files and it will look like this:

```bash
jpcercal@Joaos-MBP: ~/projects/cercal.io (master ●●●)
→3 $ unison \
  -repeat watch \
  -copyonconflict \
  -prefer newer \
  -ignore 'Name {.DS_Store}' \
  "/Users/jpcercal/projects/cercal.io/content/posts" \
  "/Users/jpcercal/Library/Mobile Documents/27N4MQEA55~pro~writer/Documents/cercal.io"
Unison 2.51.2 (ocaml 4.08.1): Contacting server...
Looking for changes
Reconciling changes
         <---- deleted    how-to-create-a-bidirectional-file-sync-using-unison/25.png
posts        : unchanged file     modified on 2020-08-26 at 10:06:28  size 32672     rw-r--r--
cercal.io    : deleted
         <---- new file   how-to-create-a-bidirectional-file-sync-using-unison/git-status.png
posts        : absent
cercal.io    : new file           modified on 2020-08-26 at 19:53:38  size 49486     rw-r--r--
         <---- new file   how-to-create-a-bidirectional-file-sync-using-unison/ia-writer-blog-posts.png
posts        : absent
cercal.io    : new file           modified on 2020-08-26 at 19:49:26  size 178662    rw-r--r--
         <---- changed    how-to-create-a-bidirectional-file-sync-using-unison/index.en.md
posts        : unchanged file     modified on 2020-08-26 at  6:42:09  size 348       rw-r--r--
cercal.io    : changed file       modified on 2020-08-26 at 20:06:47  size 7503      rw-r--r--
         <---- changed    revisiting-the-layout-and-the-blog-project/index.md
posts        : unchanged file     modified on 2020-08-25 at 18:46:23  size 9898      rw-r--r--
cercal.io    : changed file       modified on 2020-08-26 at 19:14:52  size 9896      rw-r--r--
Propagating updates
UNISON 2.51.2 (OCAML 4.08.1) started propagating changes at 20:06:50.68 on 26 Aug 2020
[BGN] Copying how-to-create-a-bidirectional-file-sync-using-unison/git-status.png from /Users/jpcercal/Library/Mobile Documents/27N4MQEA55~pro~writer/Documents/cercal.io to /Users/jpcercal/projects/cercal.io/content/posts
[END] Copying how-to-create-a-bidirectional-file-sync-using-unison/git-status.png
[BGN] Copying how-to-create-a-bidirectional-file-sync-using-unison/ia-writer-blog-posts.png from /Users/jpcercal/Library/Mobile Documents/27N4MQEA55~pro~writer/Documents/cercal.io to /Users/jpcercal/projects/cercal.io/content/posts
[END] Copying how-to-create-a-bidirectional-file-sync-using-unison/ia-writer-blog-posts.png
[BGN] Updating file how-to-create-a-bidirectional-file-sync-using-unison/index.en.md from /Users/jpcercal/Library/Mobile Documents/27N4MQEA55~pro~writer/Documents/cercal.io to /Users/jpcercal/projects/cercal.io/content/posts
[END] Updating file how-to-create-a-bidirectional-file-sync-using-unison/index.en.md
[BGN] Updating file revisiting-the-layout-and-the-blog-project/index.md from /Users/jpcercal/Library/Mobile Documents/27N4MQEA55~pro~writer/Documents/cercal.io to /Users/jpcercal/projects/cercal.io/content/posts
[END] Updating file revisiting-the-layout-and-the-blog-project/index.md
[BGN] Deleting how-to-create-a-bidirectional-file-sync-using-unison/25.png from /Users/jpcercal/projects/cercal.io/content/posts
[END] Deleting how-to-create-a-bidirectional-file-sync-using-unison/25.png
UNISON 2.51.2 (OCAML 4.08.1) finished propagating changes at 20:06:50.68 on 26 Aug 2020
Saving synchronizer state
Synchronization complete at 20:06:50  (5 items transferred, 0 skipped, 0 failed)
Looking for changes
Reconciling changes
Nothing to do: replicas have not changed since last sync.
```

The script will be waiting for new changes to be synchronized if you want to kill the execution, then just press `CTRL-C` and the process will be stopped.

### Screenshots

It shows the `git status` command and the updates that came from iA Writer after running the synchronization.

![Git Status](git-status.png)

It shows the iA Writer with the library of posts on the left and the editor on the right side.

![iA Writer](ia-writer-blog-posts.png)

> I hope you now understand how to use `unison` for syncing two directories bidirectionally, if you have any questions or suggestions, please drop me a comment or get in touch with me through my social networks. Obrigado! =)
