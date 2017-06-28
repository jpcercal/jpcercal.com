---
draft: true
author: jpcercal@gmail.com
slug: lancado-php-5-4
title: Lançamento do PHP 5.4
date: 2012-03-02T04:26:38+00:00
description: O PHP 5.4 acabou de sair do forno. Esta versão incluí um grande número de novas características e correções de bugs. Confira essas novidades.
topics:
  - Artigos
  - Notícias
  - PHP
  - Programação
tags: []
---

Salve galera! Acabo de ver nesse exato momento que o **PHP 5.4** acabou de sair do forno, isto pode ser conferido diretamente no site oficial do [PHP](http://php.net/releases/5_4_0.php).

![Lançado PHP 5.4](http://sistemas.cekurte.com/wp-content/uploads/2010/10/php.jpg "PHP")

Esta versão incluí um grande número de novas características e correções de bugs. Se você ainda não conhece o PHP, leia o seguinte post: [Introdução a Linguagem PHP](http://sistemas.cekurte.com/blog/introducao-a-linguagem-php/ "Introdução a linguagem PHP").

Dentre as principais novidades estão:

* Traits
* Servidor web integrado
* Melhor desempenho e consumo reduzido de memória
* Pequenas melhorias em várias extensões
* Short Tags agora estão sempre disponíveis
* Derreferenciamento de array (poder usar colchetes sobre elementos que retornam array)

```php
<?php

// Exemplo:
foo()[0]
```

* Sintaxe curta para arrays

```php
<?php

// Exemplo:
$a = [
  'um'   => 1,
  'dois' => 2
];
```
