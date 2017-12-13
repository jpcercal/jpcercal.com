---
draft: true
author: jpcercal@gmail.com
slug: instalando-phpunit-no-windows
title: Instalando PHPUnit no Windows
date: 2012-06-06T21:07:19+00:00
description: Desenvolvimento orientado a testes (TDD) com PHP. Aprenda a realizar a instalação do PHPUnit no sistema operacional da Microsoft, o Windows Seven.
categories:
  - Artigos
  - PHP
  - Programação
tags: []
---

Olá pessoa(s), hoje irei apresentar um passo a passo de como instalar o PHPUnit no famoso sistema operacional do tiu Bil Gates, o Microsoft Windows 7 (Seven), antes de seguir com o tutorial queria falar um pouquinho sobre testes unitários e o desenvolvimento guiado por testes (o famoso TDD – Test Driven Development).

**Afinal, o que é TDD?**

TDD é um método para construir software e não apenas para testa-lo. Através do processo "Vermelho", "Verde", "Refatoração" você percebe que o código fica limpo, organizado e o melhor de tudo funcionando!

```shell
phpunit --version
```

Agora abra um editor de texto e digite o seguinte código fonte:

```php
<?php

class HelloWorld
{
  public function msg( $message )
  {
    return $message;
  }
}

class HelloWorldTest extends PHPUnit_Framework_TestCase
{
  public function testHelloWorld()
  {
    $obj = new HelloWorld();

    $this->assertEquals( $obj->msg('Olá') , 'Olá' );
  }
}
```

Salve o arquivo como: **HelloWorldTest.php**

Eu salvei o arquivo no diretório: **C:\teste**

![24 - Instalando PHPUnit no Windows](http://sistemas.cekurte.com/wp-content/uploads/2012/06/25.png "Executando o teste unitário")

> Agora está tudo funcionando! Seja um novo desenvolvedor a partir de hoje e utilize testes unitários, se tiver dúvidas deixe-nos um comentário.
