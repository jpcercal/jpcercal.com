---
draft: false
author: jpcercal@gmail.com
slug: zend-disable-the-layout-and-view-renderer
title: Zend disable the layout and view renderer
date: 2011-11-29T16:54:51+00:00
description: Learn to disable the layout and view renderer in Zend Framework so an action in a given controller returns JSON.
categories:
  - engineering
tags:
  - php
  - zend
  - framework
---

Some people have been asking me how to disable the layout and view renderer in
**Zend Framework** so an _action_ in a given _controller_ returns only **JSON**.
Well, to do this, just use two lines of code, as you can see below.

This first approach disables the layout and view renderer for all _actions_ in a given
_controller_:

```php
public function preDispatch()
{
    $this->_helper->layout()->disableLayout();
    $this->_helper->viewRenderer->setNoRender(true);
}
```

However, this second approach disables the layout and view renderer for only one _action_,
in this case _"index"_:

```php
public function indexAction()
{
    $this->_helper->layout()->disableLayout();
    $this->_helper->viewRenderer->setNoRender(true);
}
```
