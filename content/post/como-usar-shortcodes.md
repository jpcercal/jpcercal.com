---
draft: true
author: jpcercal@gmail.com
slug: como-usar-shortcodes
title: "WordPress Dica: Como usar Shortcodes"
date: 2013-10-22T12:05:38+00:00
description: Os shortcodes são extremamente úteis e fáceis de usar, sendo que, eles permitem que desenvolvedores criem conteúdos personalizados para os usuários.
topics:
  - Artigos
  - Dicas
  - PHP
  - Programação
  - Wordpress
  - Wordpress
tags: []
---

O _WordPress_ desde a versão _2.5+_ possuí um recurso conhecido como _shortcodes_, ele funciona de forma similar aos filtros (filters), pois, aceitam parâmetros (atributos) e retornam um resultado.

Bem, os shortcodes são extremamente úteis e fáceis de usar, sendo que, eles permitem que desenvolvedores criem conteúdos personalizados para os usuários adicionarem em suas páginas.

Nós iremos ver a seguir, como é simples adicionar um shortcode no seu tema. Sendo assim, iremos conhecer a função `do_shortcode()`.

Para utilizar esta função, basta que você adicione ao seu tema o código a seguir:

```php
<?php

// Substitua o trecho "[SHORT-CODE-AQUI]" pelo shortcode que você deseja inserir,
// Um shortcode pode ser habilitado através de plugins..
echo do_shortcode('[SHORT-CODE-AQUI]');

// Exemplo de um Shortcode que utiliza o plugin "Contact Form 7"
echo do_shortcode('[contact-form-7 404 "Not Found"]');
```

Essa foi mais uma dica para a plataforma _WordPress_.

Você poderá conferir mais detalhes referentes a função `do_shortcode()` na [Documentação oficial do WordPress](http://codex.wordpress.org/Function_Reference/do_shortcode "Documentação oficial do WordPress").

Isto é tudo pessoal, uma função simples mas que poderá ser muito útil no seu dia a dia com a integração de plugins.

> Dúvidas? **Deixe um comentário!**
