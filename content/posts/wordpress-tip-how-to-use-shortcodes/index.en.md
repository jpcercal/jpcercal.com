---
draft: false
author: jpcercal@gmail.com
slug: wordpress-tip-how-to-use-shortcodes
title: "WordPress Tip: How to use Shortcodes"
date: 2013-10-22T12:05:38+00:00
description: Shortcodes are extremely useful and easy to use, allowing developers to create custom content for users.
categories:
  - php
tags: 
  - cms
  - wordpress
---

Since version _2.5+_, _WordPress_ has had a feature known as _shortcodes_, it works similarly to
filters, because they accept parameters (attributes) and return a result.

Well, shortcodes are extremely useful and easy to use, allowing developers to create
custom content for users to add to their pages.

Next we'll see how simple it is to add a shortcode to your theme. So we'll get to know the
`do_shortcode()` function.

To use this function, just add the following code to your theme:

```php
<?php

// Substitua o trecho "[SHORT-CODE-AQUI]" pelo shortcode que você deseja inserir,
// Um shortcode pode ser habilitado através de plugins..
echo do_shortcode('[SHORT-CODE-AQUI]');

// Exemplo de um Shortcode que utiliza o plugin "Contact Form 7"
echo do_shortcode('[contact-form-7 404 "Not Found"]');
```

That was another tip for the _WordPress_ platform.

You can find more details about the `do_shortcode()` function in the
[official WordPress Documentation](http://codex.wordpress.org/Function_Reference/do_shortcode "Official WordPress Documentation").

That's all folks, a simple function that can be very useful in your day-to-day work integrating plugins.

> Questions? **Leave a comment!**
