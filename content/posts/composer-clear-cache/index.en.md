---
draft: false
author: jpcercal@gmail.com
slug: composer-clear-cache
title: Composer clear cache
date: 2019-03-31T20:53:12+00:00
description: If you have a problem similar to “End-of-central-directory signature not found.”, you might need to run a composer clear cache command in order to get it working.
categories:
  - other
tags: 
  - tutorial
  - howto
---

Well, today I was facing the follow issue:

```shell
End-of-central-directory signature not found.  Either this file is not
  a zipfile, or it constitutes one disk of a multi-part archive.  In the
  latter case the central directory and zipfile comment will be found on
  the last disk(s) of this archive.
unzip:  cannot find zipfile directory in one of /var/www/apps/api/vendor/symfony/symfony/d9b1f549001f508e27a7334590534b83 or
        /var/www/apps/api/vendor/symfony/symfony/d9b1f549001f508e27a7334590534b83.zip, and cannot find /var/www/apps/api/vendor/symfony/symfony/d9b1f549001f508e27a7334590534b83.ZIP, period.

    The archive may contain identical file names with different capitalization (which fails on case insensitive filesystems)
    Unzip with unzip command failed, falling back to ZipArchive class

    Invalid zip file, retrying...
```

> It was part of the output message after executing `composer install` command.
 
Basically, it says that something was wrong with my dependency package.

## How did I solve this issue?

It’s quite simple. And, the answer is by cleaning the composer cache, you can do it by running the command below.

```shell
$ composer clearcache
```

> If you want, you can also use `clear-cache` command which is an alias for the `clearcache` one that was mentioned above.
