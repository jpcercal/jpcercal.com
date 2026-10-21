---
draft: false
author: jpcercal@gmail.com
slug: how-to-recreate-a-deb-from-an-installed-package
title: How to recreate a .deb from an installed package
date: 2011-10-14T22:02:03+00:00
description: dpkg-repack generates a .deb file from the package you have installed, with all its current settings. Create a .deb file of your programs.
categories:
  - other
tags: 
  - linux
---

If you use the [Ubuntu](http://www.ubuntu.com/ "Ubuntu") operating system or any other distro derived from
[Debian](http://www.debian.org/ "Debian"), you've most likely needed to install a program on another
machine that wasn't yours, but when it was time to copy it… where's the **.deb**?

If you find the program on the Internet, fine, but what if it's no longer available for download? What if you
don't have Internet access at the moment?

That's what **"dpkg-repack"** is for.

This program generates a **.deb** file from the package you have installed, with all its current settings.
In other words, when the **.deb** is installed, the package will already be configured the way you left it before running
**dpkg-repack** on it.

Installing it is simple, open a terminal of your choice and type:

```shell
$ sudo apt-get install dpkg-repack -y
```

To use it, just do the following, type in the terminal:

```shell
$ sudo dpkg-repack nome-do-pacote
```

Example:

```shell
$ sudo dpkg-repack chromium-browser
```

The command above will create a **.deb** package in your current directory. From there, just install the package
wherever you want or keep it stored as its last valid configuration before an update, for example.
