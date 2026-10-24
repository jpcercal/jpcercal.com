---
draft: false
author: jpcercal@gmail.com
slug: installing-pear-on-osx-10-8-mountain-lion
title: Installing PEAR on OSX 10.8 Mountain Lion
date: 2013-04-04T22:28:01+00:00
description: Learn how to install PEAR on Apple's operating system, Mac OSX 10.8 Mountain Lion, with this step-by-step guide.
categories:
  - engineering
tags:
  - php
  - osx
  - apple
  - tutorial
---

Folks, this time we'll learn to install _PEAR_ on _Apple's_ operating system. This guide should also be compatible
with earlier operating systems in the apple family, such as _Snow Leopard_ and _Lion_.

Well, let's share the recipe.

Open the Terminal and check whether _PEAR_ is already installed with the following command.

```shell
$ pear version
```

If it isn't installed, the command's output should look like:

```shell
pear: command not found
```

If you saw the message above, then we can install pear, because it isn't on your operating system.

Run the following command to select a directory and download the _pear_ installation package:

```shell
$ cd /usr/local
$ curl -O  http://pear.php.net/go-pear.phar
```

Finally, let's install pear:

```shell
$ sudo php -d detect_unicode=0 go-pear.phar
```

Just check the specified _PATH_, if you need to customize your installation, make the necessary changes, in my
case I didn't change a single line and pressed _ENTER_ straight away.

The Script will also ask whether you want to update the _include_path_ of _PHP_ by adding _PEAR_, press
Y (Yes) followed by _ENTER_.

Now let's add _PEAR_ to your user's _PATH_.

Type the following commands in the Terminal.

```shell
$ cd
$ vi .bashrc
```

Add the following line immediately after the last path in the _PATH_ variable:

/Users/**nome-do-seu-usuario**/pear/bin/

Save the file and run the following command in the Terminal:

```shell
$ source .bashrc
$ pear version
```

You should see something like the output shown below:

```shell
PEAR Version: 1.9.4
PHP Version: 5.3.15
Zend Engine Version: 2.3.0
```

If you saw the output above, then _PEAR_ was installed **successfully** on your machine. Otherwise, check
the commands mentioned above again and see whether there was a syntax error.

> If you're having trouble installing _pear_ or manage to install it through this guide, please
leave your comment.
