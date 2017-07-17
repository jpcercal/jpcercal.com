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

![Ciclo - Vermelho, Verde e Refatoração](http://sistemas.cekurte.com/wp-content/uploads/2012/06/Ciclo.png "Ciclo: Vermelho > Verde > Refatoração")

Primeiramente você cria um teste, ele então irá falhar (vermelho), em seguida você irá fazer a menor alteração possível para que o teste passe (verde), depois disso você irá refatorar o código fonte.

Existe uma espécie de "espiral da morte", que ocorre quando não há tempo para testar.

![Espiral da Morte - TDD](http://sistemas.cekurte.com/wp-content/uploads/2012/06/Espiral-da-Morte.png "TDD: Espiral da Morte")

Não sou um especialista em TDD, mas concordo muito com a sua metodologia.

**Os principais benefícios:**

* _Design guiado pelos testes, ou seja, primeiro teste e depois desenvolva_
* _Aumento de qualidade no código fonte e da aplicação final_
* _Testes são especificações e também documentações_
* _O tempo perdido para desenvolver os testes é compensado por minizar os problemas e deixar o cliente satisfeito_
* _Segurança_
* _Código limpo com alta coesão_

**Chega de "blá blá blá" e vamos logo instalar o PHPUnit!**

Para realizar a instalação do PHPUnit siga o passo a passo:

* Abra o diretório em que o [PHP](http://sistemas.cekurte.com/blog/introducao-a-linguagem-php/ "Introdução a linguagem PHP") foi instalado e execute o arquivo _"go-pear.bat"_:

```shell
go-pear.bat
```

![01 - Instalando PHPUnit no Windows](http://sistemas.cekurte.com/wp-content/uploads/2012/06/01.png "Executando go-pear.bat")

* Por padrão a instalação marca a opção _"system"_, basta pressionar a tecla **ENTER**:

![02 - Instalando PHPUnit no Windows](http://sistemas.cekurte.com/wp-content/uploads/2012/06/02.png "Pressione a tecla "Enter"")

* Uma lista de _PATH's_ será exibida como mostra a imagem abaixo, verifique esses _PATH's _e se eles estiverem corretos pressione a tecla **ENTER**, do contrário realize a configuração dos caminhos que estão incorretos.

![03 - Instalando PHPUnit no Windows](http://sistemas.cekurte.com/wp-content/uploads/2012/06/03.png "Se os diretórios listados acima estiverem corretos, pressione a tecla "Enter"")

* Neste momento, o instalador irá lhe questionar se você deseja modificar o arquivo _php.ini_, para adicionar as configurações necessários do **PEAR** automaticamente. Pressione a tecla **Y **seguida da tecla **ENTER**.

![04 - Instalando PHPUnit no Windows](http://sistemas.cekurte.com/wp-content/uploads/2012/06/04.png "Pressione a tecla "y" para configurar automaticamente o php.ini em seguida pressione "Enter"")

* A figura abaixo apenas ilustra que a alteração no arquivo _php.ini_ foi realizada com sucesso. Pressione a tecla **ENTER** para continuar.

![05 - Instalando PHPUnit no Windows](http://sistemas.cekurte.com/wp-content/uploads/2012/06/05.png "Pressione a tecla "Enter"")

* Na figura abaixo o instalador lhe notifica que você deve registrar as variáveis de ambiente, pressione **ENTER** para continuar.

![07 - Instalando PHPUnit no Windows](http://sistemas.cekurte.com/wp-content/uploads/2012/06/07.png "O script "go-pear.bat" concluiu sua execução")

* Conforme o instalador solicitou agora iremos registrar as variáveis de ambiente, navegue até o diretório em que a instalação do **PHP** foi realizada e de um duplo clique no arquivo **PEAR_ENV.reg**, conforme ilustra a imagem abaixo:

![08 - Instalando PHPUnit no Windows](http://sistemas.cekurte.com/wp-content/uploads/2012/06/08.png "Execute o arquivo "PEAR_ENV.reg", dando um duplo clique sobre ele")

* Uma caixa de diálogo como esta abaixo será exibida, clique no botão **"SIM"**.

![09 - Instalando PHPUnit no Windows](http://sistemas.cekurte.com/wp-content/uploads/2012/06/09.png "Clique no botão "Sim"")

* Ao clicar no botão **"SIM" **o sistema operacional _Windows _irá registrar as variáveis de ambiente, e uma mensagem como esta abaixo será exibida.

![10 - Instalando PHPUnit no Windows](http://sistemas.cekurte.com/wp-content/uploads/2012/06/10.png "Clique no botão "Ok"")

* Agora iremos realizar a instalação do PHPUnit, para isto devemos adicionar alguns canais ao PEAR e logo em seguida realizar a instalação. Execute o seguinte comando:

```shell
pear channel-discover pear.phpunit.de
```

![11 - Instalando PHPUnit no Windows](http://sistemas.cekurte.com/wp-content/uploads/2012/06/11.png "Adicionando o repositório do PHPUnit")

![12 - Instalando PHPUnit no Windows](http://sistemas.cekurte.com/wp-content/uploads/2012/06/12.png "Adicionando o repositório do PHPUnit")

* Adione o repositório do Symfony executando o comando abaixo:

```shell
pear channel-discover pear.symfony-project.com
```

![13 - Instalando PHPUnit no Windows](http://sistemas.cekurte.com/wp-content/uploads/2012/06/13.png "Adione o repositório do Symfony")

![14 - Instalando PHPUnit no Windows](http://sistemas.cekurte.com/wp-content/uploads/2012/06/14.png "Adicionando o repositório do Symfony")

* Com o comando a seguir iremos atualizar a lista de canais:

```shell
pear update-channels
```

![15 - Instalando PHPUnit no Windows](http://sistemas.cekurte.com/wp-content/uploads/2012/06/161.png "Atualizando os repositórios")

* Vamos agora atualizar os canais, utilize o seguinte comando:

```shell
pear upgrade-all
```

![16 - Instalando PHPUnit no Windows](http://sistemas.cekurte.com/wp-content/uploads/2012/06/17.png "Atualize os repositórios")

![17 - Instalando PHPUnit no Windows](http://sistemas.cekurte.com/wp-content/uploads/2012/06/181.png "Atualizando os repositórios")

* Neste momento, iremos realizar a instalação do PHPUnit, execute o seguinte comando:

```shell
pear install phpunit/PHPUnit
```

![18 - Instalando PHPUnit no Windows](http://sistemas.cekurte.com/wp-content/uploads/2012/06/191.png "Instale o PHPUnit")

![19 - Instalando PHPUnit no Windows](http://sistemas.cekurte.com/wp-content/uploads/2012/06/201.png "Instalando o PHPUnit")

* A imagem abaixo ilustra que a instalação do PHPUnit foi realizada com sucesso.

```shell
phpunit --version
```

![20 - Instalando PHPUnit no Windows](http://sistemas.cekurte.com/wp-content/uploads/2012/06/21.png "Testando se o PHPUnit foi instalado com sucesso")

* Para que você ao executar os testes unitários não necessite chamar o **PHPUnit** através de seu _PATH_ absoluto, adicione o _PATH_ do **PHPUnit** ao _PATH_ do Windows.

![21 - Instalando PHPUnit no Windows](http://sistemas.cekurte.com/wp-content/uploads/2012/06/22.png "Vá ao menu "Iniciar" > Clique com o botão direito em "Computador" e selecione a opção "Propriedades" > "Configurações avançadas do Sistema" > "Váriaveis de Ambiente"")

![22 - Instalando PHPUnit no Windows](http://sistemas.cekurte.com/wp-content/uploads/2012/06/23.png "Clique no botão "Novo"")

![23 - Instalando PHPUnit no Windows](http://sistemas.cekurte.com/wp-content/uploads/2012/06/24.png "Adicionando a variável de ambiente, o valor da variável deve ser preenchido com o caminho absluto do PHP")

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
