---
draft: false
author: jpcercal@gmail.com
slug: conio2-h-installation-and-configuration
title: Conio2.h Installation and Configuration
date: 2012-05-22T17:51:39+00:00
description: Install the Conio2.h package for the Dev-C++ IDE. This package adds functionality for developing applications written in C/C++.
categories:
  - engineering
tags: []
---

I prepared this document for some colleagues who were having difficulty installing the **Conio2.h** package for the
**Dev-C++ IDE**. This package includes a library with functionality for developing applications written
in **C/C++**.

To continue with this guide, you need to have **Dev-C++** installed.

First we should [Download the Conio2.h package from SourceForge](http://sourceforge.net/projects/conio/files/devpak/CONIO%202.0/conio-2.0-1mol.DevPak/download).

After downloading it, we should run the file with the _"DevPak"_ extension.

![Conio2.h - Conio2.h Installation and Configuration](Conio2.h-Arquivo.png "Conio2.h")

A setup will appear, click the _"Install"_ button as shown in the image below:

![Conio2.h - Conio2.h Installation and Configuration](Conio2.h-Instalando-Tela01.png "Conio2.h - Installation - Click the \"Install\" button")

Now click the _"Finish"_ button as shown in the image below:

![Conio2.h - Conio2.h Installation and Configuration](Conio2.h-Instalando-Tela02.png "Conio2.h - Installation - Click the \"Finish\" button")

Let's make sure the **Conio2.h** library was installed, as shown in the image below:

![Conio2.h - Conio2.h Installation and Configuration](Conio2.h-Instalando-Tela03.png "Conio2.h - Installation - Checking whether installation succeeded")

Now we need to configure Dev-C++ to use the library. Go to the _"Tools"_ **>** _"Compiler Options"_ menu, as shown in the image below:

![Conio2.h - Conio2.h Installation and Configuration](Conio2.h-Instalando-Tela04.png "Conio2.h - Installation - "Tools" > "Compiler Options"")

Add the following command **"-lconio"**, as shown in the image below:

![Conio2.h - Conio2.h Installation and Configuration](Conio2.h-Instalando-Tela05.png "Conio2.h - Installation - Add the command "-lconio"")

Now you can enjoy the **Conio2.h** library.

![Conio2.h - Conio2.h Installation and Configuration](Conio2.h-Instalando-Tela06.png "Conio2.h - Installation - Source code")
