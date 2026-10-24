---
draft: false
author: jpcercal@gmail.com
slug: accessing-amazon-rds-instances-from-your-desktop
title: Accessing Amazon RDS Instances from your Desktop
date: 2014-08-15T10:48:28+00:00
description: Learn to connect to Amazon's RDS service through a Desktop client using an SSH connection that forwards packets to your local machine.
categories:
  - engineering
tags:
  - aws
  - database
  - linux
  - devops
---

After a few minutes of research, I found an interesting solution for connecting to Amazon RDS through a Desktop client, well, the magic formula is an SSH connection that forwards packets to the local machine, allowing a remote connection this way.

First you need to add your Amazon EC2 service connection key. Do this by running the following command:

```shell
$ ssh-add <your-key-filename>.pem
```

And to forward the packets, run the following command:

```shell
$ ssh -l <your-username-ec2> -L <your-local-port>:<your-host-rds>:<your-host-rds-port> -N <your-host-ec2>
```

Finally, connect through a database client, where:

* **host:** `127.0.0.1`
* **port:** `<your-local-port>`
* **database:** `<your-database-rds>`
* **username:** `<your-username-database-rds>`
* **password:** `<your-password-database-rds>`

That's it, I hope this can be useful to someone.

> Still have questions, or did this content really help you? Then leave a comment.
