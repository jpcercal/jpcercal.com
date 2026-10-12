---
draft: false
author: jpcercal@gmail.com
slug: downloading-and-installing-the-libxml-library
title: Downloading and Installing the libxml library
date: 2011-12-22T19:13:10+00:00
description: In this guide you'll learn how to install the libxml library on Linux operating systems. Download the source code and compile it for your distro.
categories:
  - devops
tags: 
  - tutorial
  - linux
---

XML is a standard for building structured documents based on markup containing the data.

The **libxml2** library was written in pure **C** to allow easy reuse across various platforms,
including embedded systems.

**Let's get our hands dirty!**

Visit the website and download the latest stable version:

[http://www.xmlsoft.org/downloads.html](http://www.xmlsoft.org/downloads.html)

Open the terminal and enter the directory where the library was saved:

```shell
$ cd ./Download/
```

Extract the file into the _"/opt"_ directory:

```shell
$ sudo tar xvfz libxml2-git-snapshot.tar.gz -C /opt/
```

Enter the directory where the file was extracted:

```shell
$ sudo cd /opt/libxml2-2.7.8/
```

For a standard installation run the command below, you can change the installation directory if you want.

```shell
$ sudo ./configure --prefix=/usr/local/libxml
```

Now just install:

```shell
$ sudo make && make install
```
