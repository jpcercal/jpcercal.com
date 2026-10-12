---
draft: false
author: jpcercal@gmail.com
slug: excerpts-on-wordpress-3-0-pages
title: Excerpts on WordPress 3.0+ pages
date: 2012-12-09T03:12:27+00:00
description: Add functionality to post types in Wordpress 3.0+ using the API with the following function add_post_type_support();
categories:
  - php
tags: 
  - cms
  - wordpress
---

If you've ever needed to add excerpts to pages in WordPress 3.0+, you can be happy because the tip is
very simple. Just add the following code to a file that wordpress loads automatically.

```php
<?php
/**
 * @param string $post_type
 * @param string|array $supports
 */
add_post_type_support('search', 'excerpt');
```

Usually the code above is placed in an "init" _action hook_.

This will enable a new field in the administration panel, letting you add an **excerpt** to your
**pages**.

In the case above, we're adding the "excerpt" functionality to the "page" post type.

Visit the [official WordPress Documentation](http://codex.wordpress.org/ "Official WordPress Documentation") and also
the [official documentation for this function](http://codex.wordpress.org/Function_Reference/add_post_type_support "Official documentation for this function")
for more details.
