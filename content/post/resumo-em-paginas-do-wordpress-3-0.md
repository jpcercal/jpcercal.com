---
draft: true
author: jpcercal@gmail.com
slug: resumo-em-paginas-do-wordpress-3-0
title: Resumo em páginas do WordPress 3.0+
date: 2012-12-09T03:12:27+00:00
description: Adicione funcionalidades aos tipos de posts (Post Types) no Wordpress 3.0+ utilizando a API com a seguinte função add_post_type_support();
categories:
  - Wordpress
tags: []
---

Se você já sentiu a necessidade de adicionar resumos para páginas no WordPress 3.0+, pode ficar feliz porque a dica é bem simples. Basta adicionar o seguinte código em um arquivo que seja carregado automaticamente pelo wordpress.

```php
<?php
/**
 * @param string $post_type
 * @param string|array $supports
 */
add_post_type_support('page', 'excerpt');
```

Geralmente o código acima é colocado em uma _action hook_ "init".

Isto irá habilitar um novo campo no painel de administração permitindo que você adicione um **resumo** para as suas **páginas**.

No caso acima, estamos adicionando ao post type "page" (Página) a funcionalidade "excerpt" (Resumo).

Visite a [Documentação oficial do WordPress](http://codex.wordpress.org/ "Documentação oficial do WordPress") e também a [Documentação oficial desta função](http://codex.wordpress.org/Function_Reference/add_post_type_support "Documentação oficial desta função") para obter mais detalhes.
