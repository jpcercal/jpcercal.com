---
draft: false
author: jpcercal@gmail.com
slug: wordpress-tip-how-to-check-whether-a-plugin-is-active
title: "WordPress Tip: How to check whether a plugin is active?"
date: 2013-08-28T17:40:54+00:00
description: If while developing a Plugin or Theme for Wordpress you need to know whether a third-party Plugin is Active, then check out this tip.
categories:
  - php
tags: 
  - cms
  - wordpress
---

When you're developing a theme or a _plugin_ for the _WordPress_ platform, you may need to check
whether a specific _plugin_ is activated. Well, here's a simple _script_ to check whether a _plugin_
is activated or not in the _wordpress_ administration panel.

You'll only need to change line 4 to your _plugin's_ directory name.

**Note:** _Plugins_ are located in the directory: `/wp-content/plugins/`

```php
<?php

// Adicione esta linha se este pedaço de código
// não estiver sendo executado no painel administrativo
require_once(ABSPATH . '/wp-admin/includes/plugin.php');

// Verifica se o plugin está ativado...
if (is_plugin_active('plugin-directory/plugin-file.php')) {
    // o plugin está ativado...
} else {
    // O plugin está desativado...
}
```

That was another tip for the _WordPress_ platform.

You can find more details about the `is_plugin_active()` function in the
[official WordPress Documentation](http://codex.wordpress.org/Function_Reference/is_plugin_active "Official WordPress Documentation").

> Questions? **Leave a comment!**
