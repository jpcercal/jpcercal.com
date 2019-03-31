---
draft: false
author: jpcercal@gmail.com
slug: composer-clear-cache
title: Composer clear cache
date: 2019-03-31T20:53:12+00:00
description: Se você tiver um problema similar à este “End-of-central-directory signature not found.”, talvez você precise só limpar o cache do seu composer.
categories:
  - other
tags: 
  - tutorial
  - howto
---

Bem, hoje eu estava enfrentando o seguinte problema:

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

> Essa era a saída parcial do comando `composer install`.
 
Basicamente, essa mensagem indica que algo está errado com um pacote que o composer tem *cacheado*. 
 
## Como eu resolvi este problema?

É bem simples. E, a resposta é limpando o cache do composer, você pode fazer isto executando o comando abaixo.

```shell
$ composer clearcache
```

> Se você quiser, você pode usar também o comando `clear-cache` que nada mais é do que um alias para `clearcache` que foi mencionado acima.
