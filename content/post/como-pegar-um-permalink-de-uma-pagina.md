---
draft: true
author: jpcercal@gmail.com
slug: como-pegar-um-permalink-de-uma-pagina
title: Como pegar um Permalink de uma Página
date: 2013-02-09T10:17:18+00:00
description: Aprenda como obter um permalink de uma página no Wordpress, cujo post_type é "page". Combinando as funções get_permalink() e get_page_by_path().
topics:
  - Artigos
  - PHP
  - Programação
  - Wordpress
tags: []
---

Hoje precisamos obter um **permalink** de uma página no _WordPress_, cujo _post_type_ é "_page_". Para isto, tivemos de combinar duas funções, são elas: `get_permalink()` e `get_page_by_path()`.

**Como Pegar um Permalink de uma Página utilizando o Nome da Página:**

```php
<a href="<?php echo get_permalink( get_page_by_path('Eventos') ); ?>">
    <?php _e('Eventos', 'cekurte'); ?>
</a>
```

**Como Pegar um Permalink de uma Página utilizando o Slug da Página:**

```php
<a href="<?php echo get_permalink( get_page_by_path('cadastrar-cliente') ); ?>">
    <?php _e('Cadastrar Cliente', 'cekurte'); ?>
</a>
```

**Nota Sobre a Hierarquia de Páginas e Slug's.**

Se você tem uma hierarquia de páginas você terá de passar o _slug_ completo incluindo a página base para a função `get_page_by_path()`.

_Por exemplo:_ para pegar o _permalink_ de uma página filha chamada "Festas" que possuí uma página base chamada "Eventos" faríamos assim:

```php
<a href="<?php echo get_permalink( get_page_by_path( 'eventos/festas' ) ) ?>">
    <?php _e('Eventos', 'cekurte'); ?>
</a>
```

As funções citadas acima, você pode conferir diretamente na documentação oficial do _WordPress_.

* [Documentação da função get_permalink()](http://codex.wordpress.org/Function_Reference/get_permalink "Documentação da função get_permalink()")
* [Documentação da função get_page_by_path()](http://codex.wordpress.org/Function_Reference/get_page_by_path "Documentação da função get_page_by_path()")

> Esse foi um post bem curto, se tiver dúvidas deixe um comentário!
