---
draft: false
author: jpcercal@gmail.com
slug: wordpress-hack-how-to-get-a-posts-content-by-id
title: "WordPress Hack: How to get a Post's content by ID"
date: 2013-08-23T14:52:26+00:00
description: Learn to retrieve a post's content (post_content) in Wordpress based on a post's ID. Get to know the function that can help you with this task.
categories:
  - php
tags: 
  - cms
  - wordpress
---

When you're building a theme for WordPress, you may need to get the content of a specific post
using the **ID** as a filter. Most of the time you get a post's content through the _get_post_content_ function
inside a _Loop_.

However, when you need to retrieve a post's information outside the _loop_ context or at a separate point
in the application, the best solution is to use the `get_post_field('field-name'), $postId)` function.

Right below you can check an example of retrieving a post's content by _ID_:

```php
<?php

echo get_post_field('post_content', $post_id);
```

You can find more details about this function in the
[official WordPress documentation](http://codex.wordpress.org/Function_Reference/get_post_field "Official WordPress documentation").
