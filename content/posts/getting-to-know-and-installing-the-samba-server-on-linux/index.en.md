---
draft: false
author: jpcercal@gmail.com
slug: getting-to-know-and-installing-the-samba-server-on-linux
title: Getting to Know and Installing the SAMBA server on LINUX
date: 2012-11-22T02:36:32+00:00
description: SAMBA is a server and a set of tools that lets Linux and Windows machines communicate with each other, sharing services and files.
categories:
  - engineering
tags:
  - linux
  - devops
  - tutorial
---

**WHAT IS IT?**

SAMBA is a server and a set of tools that lets Linux and Windows machines communicate with each other,
sharing services (files, directories, printing) through the SMB (Server Message Block)/CIFS
(Common Internet File System) protocol, equivalent to the NetBEUI implementation on Windows.

It can also be used as a primary domain controller (PDC), serving as an authentication server
for Windows clients.

In most cases, access control and directory display in samba are more detailed and customizable than in
Microsoft's own system.

So, SAMBA is one of the solutions in the UNIX environment capable of connecting heterogeneous networks.

**A BRIEF HISTORY**

Its development began because of the need to mount a UNIX volume on a DOS machine. Its creator,
Andrew Tridgell, created a packet sniffer to analyze and understand data traffic on a
NetBIOS network. After understanding it, he implemented it on Linux over the SMB protocol. This made the
Unix server appear as a Windows file server on his DOS PC.

This code was published in 1992, after which Andrew decided to put the project on hold. Two years later,
he tried to connect his wife's PC to his Linux computer and discovered that the documentation for the
SMB and NetBIOS protocols had been updated. That's when he returned to the project.

**INSTALLING SAMBA**

Samba is available under the GNU (GNU is not Unix) license and is therefore free software. The vast majority of
distributions already include it, but you can get it from the official website – www.samba.org. If you're a
Debian user, or have a distribution derived from it, you can type the following command in the terminal to
install it:

```shell
# apt-get install samba smbclient smbfs
```

If you downloaded the source code, you should extract it first:

Note: {VERSION} should be replaced with the application's version.

```shell
# tar -zxvf samba-{VERSION}.tar.gz
```

Now enter the directory where the source was created and run the following commands:

```shell
# ./configure
# make && make install
```

**REFERENCES**

* _http://www.vivaolinux.com.br/artigo/Micro-curso-Samba_
* _http://mlsvicente.blogspot.com.br/2007/10/controlador-de-domnio-com-samba-e.html_
* _http://www.hardware.com.br/artigos/samba-dominio/_
* _http://www.infowester.com/linuxsamba.php_
* _http://www.samba.org/samba/docs/man/Samba-HOWTO-Collection/IntroSMB.html#id2551356_
* _http://www.guiafoca.org/cgs/guia/avancado/ch-s-samba.html_
