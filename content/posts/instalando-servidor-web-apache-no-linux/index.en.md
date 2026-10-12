---
draft: false
author: jpcercal@gmail.com
slug: installing-the-apache-web-server-on-linux
title: Installing the Apache web server on Linux
date: 2011-12-22T09:38:01+00:00
description: In this guide you'll learn how to install the apache web server on Linux operating systems. Download the source code and compile it for your distro.
categories:
  - devops
tags: 
  - linux
  - tutorial
---

Well, today I'll show you how to install the **Apache 2** web server. So, let's go!

_**Note:** When I performed the installation, the latest version of the package was "2.2.19″. So the tutorial will cover that
version. However, you'll download the most recent version, so your file will probably have a different
name._

![Installing the Apache web server on Linux](i-apache-2.2.jpg "Apache 2.2 Web Server")

First download the latest package containing the **Apache** source code, in _"tar.gz"_ format, from:

[http://httpd.apache.org/download.cgi](http://httpd.apache.org/download.cgi)

Then go to the directory where you downloaded the file and extract it into the _"/opt"_ directory:

```shell
$ sudo tar xvfz ./httpd-2.2.19.tar.gz -C /opt/
```

Now enter the directory where the source files were extracted:

```shell
$ cd /opt/httpd-2.2.19/
```

Run the following command:

```shell
$ sudo ./configure --prefix=/usr/local/apache2
```

Next:

```shell
$ sudo make && make install
```

Congratulations, your apache web server is now installed, and we'll check whether it's working correctly.
To do this, we need to start it and try accessing it using a
[web browser]({{< ref "posts/navegadores-ou-browsers/index.md" >}} "Web Browsers") (_e.g.: Mozilla Firefox_).

Enter the directory where you installed **apache**. If you didn't change the installation path, run the
following command:

```shell
$ cd /usr/local/apache2
```

Otherwise, run the following command:

```shell
$ cd /diretorio-em-que-o-apache-foi-instalado
```

Start apache by running the following command:

```shell
$ sudo ./bin/apachectl -k start
```

Now open your preferred browser, requesting the following address: [http://localhost](http://localhost).

If everything is right, the following message will appear:

**# It works!**
