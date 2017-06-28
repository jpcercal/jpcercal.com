---
draft: true
author: jpcercal@gmail.com
slug: zend-desabilitar-o-layout-e-o-renderizador-de-visoes
title: Zend desabilitar o layout e o renderizador de visões
date: 2011-11-29T16:54:51+00:00
description: Aprenda a desabilitar o uso de layout e o renderizador de visões do Zend Framework para que uma action de um determinado controller retorne um JSON.
topics:
  - Artigos
  - PHP
  - Programação
  - Zend
tags: []
---

Algumas pessoas estiveram me perguntando como desabilitar o uso de layout e o renderizador de visões do **Zend Framework** para que uma _action_ de um determinado _controller_ retornasse unicamente um **JSON**. Bem, para isto, basta utilizar duas linhas de código, como pode ser visto a seguir.

Essa primeira forma desabilita o layout e o renderizador de visões para todas as _actions_ de um determinado _controller_:

```php
public function preDispatch()
{
  $this->_helper->layout()->disableLayout();
  $this->_helper->viewRenderer->setNoRender(true);
}
```

Entretanto essa segunda forma, desabilita o layout e o renderizador de visões apenas para uma unica _action_ , neste caso a _"index"_:

```php
public function indexAction()
{
  $this->_helper->layout()->disableLayout();
  $this->_helper->viewRenderer->setNoRender(true);
}
```
