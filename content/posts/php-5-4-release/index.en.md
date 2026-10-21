---
draft: false
author: jpcercal@gmail.com
slug: php-5-4-release
title: PHP 5.4 Release
date: 2012-03-02T04:26:38+00:00
description: PHP 5.4 is fresh out of the oven. This version includes a large number of new features and bug fixes. Check out what's new.
categories:
  - php
tags: 
  - news
---

Hey folks! I've just seen, this very moment, that **PHP 5.4** is fresh out of the oven, which you can check
directly on the official [PHP](http://php.net/releases/5_4_0.php) website.

![PHP 5.4 Released](php.jpg "PHP")

This version includes a large number of new features and bug fixes. If you're not familiar with PHP yet,
read the following post: [Introduction to PHP]({{< ref "posts/introduction-to-php/index.md" >}} "Introduction
to PHP").

Among the main new features are:

* Traits
* Built-in web server
* Better performance and reduced memory consumption
* Small improvements in various extensions
* Short Tags are now always available
* Array dereferencing (being able to use square brackets on elements that return an array)

```php
<?php

// Exemplo:
foo()[0]
```

* Short syntax for arrays

```php
<?php

// Exemplo:
$a = [
  'um'   => 1,
  'dois' => 2
];
```
