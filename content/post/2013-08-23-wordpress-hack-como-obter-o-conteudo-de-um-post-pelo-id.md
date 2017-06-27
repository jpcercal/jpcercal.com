---
title: "WordPress Hack: Como obter o conteúdo de um Post pelo ID"
date: 2013-08-23T14:52:26+00:00
author: jpcercal@gmail.com
excerpt: Aprenda a recuperar o conteúdo de um post (post_content) no Wordpress com base no ID de um post. Conheça a função que poderá lhe auxiliar neste trabalho.
layout: post
permalink: /blog/wordpress-hack-como-obter-o-conteudo-de-um-post-pelo-id/
image_path: /wp-content/uploads/2012/11/inauguracao-125x125.jpg
categories:
  - Artigos
  - PHP
  - Programação
  - Wordpress
  - Wordpress
---

Quanto você está construindo um tema para o WordPress, poderá ser necessário obter o conteúdo de um post específico tendo como filtro o **ID**. Na maioria das vezes você obtém o conteúdo de um post através da função _get_post_content_ dentro de um _Loop_.

Entretanto, quando você precisa recuperar a informação de um post fora do contexto do _loop_ ou em um ponto separado da aplicação, a melhor solução é usar a função `get_post_field('field-name'), $postId)`.

Logo abaixo você pode conferir um exemplo de como recuperar o conteúdo de um post pelo _ID_:

```php
<?php

echo get_post_field('post_content', $post_id);
```

Você poderá conferir mais detalhes sobre esta função na [documentação oficial do WordPress](http://codex.wordpress.org/Function_Reference/get_post_field "documentação oficial do WordPress").
