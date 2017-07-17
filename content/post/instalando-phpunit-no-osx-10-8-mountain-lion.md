---
draft: true
author: jpcercal@gmail.com
slug: instalando-phpunit-no-osx-10-8-mountain-lion
title: Instalando PHPUnit no OSX 10.8 Mountain Lion
date: 2013-08-24T15:00:39+00:00
description: Aprenda a realizar a instalação do PHPUnit no sistema operacional da Apple, o Mac OSX 10.8 Mountain Lion com este passo a passo.
categories:
  - Apple
  - Artigos
  - PHP
  - Programação
tags: []
---

Olá, hoje irei demostrar como realizar a instalação do PHPUnit no sistema operacional da _Apple_. Este guia deve ser compatível também com os sistemas operacionais anteriores da família da maçã, tais como: _Snow Leopard_ e _Lion_.

Se você utiliza o sistema operacional Microsoft Windows, poderá ler este outro tutorial: [Instalando PHPUnit no Windows](http://sistemas.cekurte.com/blog/instalando-phpunit-no-windows/ "Instalando PHPUnit no Windows").

Bem, vamos instalar o PHPUnit no OSX.

Abra o Terminal e verifique se o _PEAR_ já está instalado com o seguinte comando.

```shell
$ pear version
```

Se ele não estiver instalado, a saída do comando deverá se parecer com:

```shell
pear: command not found
```

Se você viu essa mensagem, deverá seguir este tutorial antes de continuar com a instalação do PHPUnit: [Instalando PEAR no OSX 10.8 Mountain Lion](http://sistemas.cekurte.com/blog/instalando-pear-no-osx-10-8-mountain-lion/ "Instalando PEAR no OSX 10.8 Mountain Lion").

Vamos seguir a instalação, abra e execute o seguinte comando no Terminal:

```shell
$ sudo pear config-set auto_discover 1
```

Você verá uma mensagem como a que está sendo apresentada na imagem abaixo:

![Instalando PHPUnit no OSX 10.8 Mountain Lion](http://sistemas.cekurte.com/wp-content/uploads/2013/04/Captura-de-Tela-2013-04-08-às-18.23.31.png "Instalando PHPUnit no OSX 10.8 Mountain Lion")

Feito isto, você deve executar o comando a seguir no terminal para instalar o PHPUnit:

```shell
$ sudo pear install pear.phpunit.de/PHPUnit
```

O PHPUnit foi instalado no seguinte diretório: /Users/**nome-do-seu-usuario**/pear/share/pear/**PHPUnit**, para utiliza-lo em seus scripts basta incluir/verificar se o seu include_path do php.ini já contém o diretório do PEAR.

Para verificar essa configuração do seu arquivo _php.ini_ execute o seguinte comando no terminal:

```shell
$ cat /etc/php.ini | grep include_path
```

O seu _include_path_ será exibido e deverá conter a seguinte linha:

/Users/**nome-do-seu-usuario**/pear/share/pear

Se o seu include_path não tiver a linha citada acima, você deverá abrir o arquivo _php.ini_ e ao final do _include_path_ adicionar ":/Users/**nome-do-seu-usuario**/pear/share/pear" (sem aspas).

Agora vamos criar uma classe de testes para verificar se o phpunit está funcionando corretamente.

Crie um arquivo php chamado _"teste-phpunit.php"_ e adicione as seguinte linhas:

```php
<?php

class HelloWorld
{
  public function msg($message)
  {
    return $message;
  }
}

class HelloWorldTest extends PHPUnit_Framework_TestCase
{
  public function testHelloWorld()
  {
    $obj = new HelloWorld();

    $this->assertEquals($obj->msg('Olá') , 'Olá');
  }
}
```

Agora execute o teste com o seguinte comando no terminal:

```shell
$ phpunit teste-phpunit.php
```

Uma imagem como está será exibida, informando que todos os testes foram executados com sucesso.

![Instalando PHPUnit no OSX 10.8 Mountain Lion](http://sistemas.cekurte.com/wp-content/uploads/2013/04/Captura-de-Tela-2013-04-08-às-18.37.40.png "Instalando PHPUnit no OSX 10.8 Mountain Lion")

> Você tem alguma dúvida? Já utiliza o PHPUnit nos seus projetos? Deixe um comentário.
