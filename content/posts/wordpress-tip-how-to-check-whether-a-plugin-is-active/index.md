---
draft: false
author: jpcercal@gmail.com
slug: wordpress-dica-como-verificar-se-um-plugin-esta-ativo
title: "WordPress Dica: Como verificar se um plugin está ativo?"
date: 2013-08-28T17:40:54+00:00
description: Se durante o desenvolvimento de um Plugin ou de um Tema para Wordpress você precisar saber se um Plugin de terceiro está Ativo, então, confira esta dica.
categories:
  - php
tags: 
  - cms
  - wordpress
---

Quando você estiver desenvolvendo um tema ou um _plugin_ para a plataforma _WordPress_, pode ser necessário verificar 
se um _plugin_ específico está ativado. Pois bem, apresento aqui um simples _script_ para verificar se um _plugin_ 
está ou não ativado no painel de administração do _wordpress_.

Você precisará modificar apenas a linha 4, pelo nome do diretório do seu _plugin_.

**Nota:** Os _plugins_ ficam localizados no diretório: `/wp-content/plugins/`

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

Essa foi mais uma dica para a plataforma _WordPress_.

Você poderá conferir mais detalhes referentes a função `is_plugin_active()` na 
[Documentação oficial do WordPress](http://codex.wordpress.org/Function_Reference/is_plugin_active "Documentação oficial do WordPress").

> Dúvidas? **Deixe um comentário!**
