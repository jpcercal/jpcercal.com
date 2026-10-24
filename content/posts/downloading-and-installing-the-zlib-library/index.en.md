---
draft: false
author: jpcercal@gmail.com
slug: downloading-and-installing-the-zlib-library
title: Downloading and Installing the Zlib library
date: 2011-12-22T17:43:30+00:00
description: In this guide you'll learn how to install the zlib library on Linux operating systems. Download the source code and compile it for your distro.
categories:
  - engineering
tags:
  - linux
  - tutorial
---

The **zlib** compression library is intended for the **compression** and **decompression** of _files_, including
_integrity checks_ of _decompressed_ data. This library can also optionally read and write
**gzip streams** in _memory_.

The **zlib** format was primarily designed to be compact and fast, for use in memory and communication
channels.

**So, let's get our hands dirty!**

Visit the official website and download the latest stable version:

[http://zlib.net/](http://zlib.net/)

Open the terminal and enter the directory where the library was saved:

```shell
$ cd ./Download/
```

Extract the file into the _"/opt"_ directory:

```shell
$ sudo tar xvfz zlib-1.2.5.tar.gz -C /opt/
```

Enter the directory where the file was extracted:

```shell
$ sudo cd /opt/zlib-1.2.5/
```

For a standard installation run the command below, you can change the installation directory if you want.

```shell
$ sudo ./configure --prefix=/usr/local/zlib
```

Now just install:

```shell
$ sudo make && make install
```
