---
draft: false
author: jpcercal@gmail.com
slug: how-to-get-a-page-permalink
title: How to get a Page Permalink
date: 2013-02-09T10:17:18+00:00
description: Learn how to get the permalink of a page in Wordpress whose post_type is "page". Combining the get_permalink() and get_page_by_path() functions.
categories:
  - php
tags: 
  - cms
  - wordpress
---

Today we needed to get the **permalink** of a page in _WordPress_ whose _post_type_ is "_page_". To do this, we had to
combine two functions, which are: `get_permalink()` and `get_page_by_path()`.

**How to Get a Page Permalink using the Page Name:**

```php
<a href="<?php echo get_permalink( get_page_by_path('Eventos') ); ?>">
    <?php _e('Eventos', 'jpcercal.com'); ?>
</a>
```

**How to Get a Page Permalink using the Page Slug:**

```php
<a href="<?php echo get_permalink( get_page_by_path('cadastrar-cliente') ); ?>">
    <?php _e('Cadastrar Cliente', 'jpcercal.com'); ?>
</a>
```

**Note About Page Hierarchy and Slugs.**

If you have a page hierarchy, you'll have to pass the complete _slug_, including the parent page, to the
`get_page_by_path()` function.

_For example:_ to get the _permalink_ of a child page called "Festas" with a parent page called
"Eventos", we would do this:

```php
<a href="<?php echo get_permalink( get_page_by_path( 'eventos/festas' ) ) ?>">
    <?php _e('Eventos', 'jpcercal.com'); ?>
</a>
```

You can check the functions mentioned above directly in the official _WordPress_ documentation.

* [get_permalink function documentation](http://codex.wordpress.org/Function_Reference/get_permalink "get_permalink function documentation")
* [get_page_by_path function documentation](http://codex.wordpress.org/Function_Reference/get_page_by_path "get_page_by_path function documentation")

> That was a very short post, if you have questions, leave a comment!
