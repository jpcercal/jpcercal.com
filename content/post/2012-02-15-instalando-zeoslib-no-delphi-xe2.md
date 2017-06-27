---
title: Instalando ZeosLib no Delphi XE2
date: 2012-02-15T18:05:05+00:00
author: jpcercal@gmail.com
excerpt: Aprenda a realizar a instalação da biblioteca ZeosLib no Embarcadero RAD Studio Delphi XE2, este guia irá lhe apresentar um passo a passo da instalação.
layout: post
permalink: /blog/instalando-zeoslib-no-delphi-xe2/
image_path: /wp-content/uploads/2012/11/inauguracao-125x125.jpg
categories:
  - Artigos
  - Delphi
  - Programação
---

Após passar dificuldades na realização da instalação do **ZeosLib** no **Delphi XE2**, decidi compartilhar o _"caminho das pedras"_.

**A Bilbioteca ZeosLib**

A bilbioteca _ZeosLib_ é composta por um conjunto de ferramentas para que você possa ter uma conexão nativa com banco de dados, ou seja, uma conexão sem drivers auxiliares como o _ODBC_.

O _ZeosLib_ é um projeto de **código aberto**, sua instalação não é tão complexa, mas segue a receita do bolo, basta seguir os passos sem pular _"nenhum ingrediente"_.

**Baixando a Biblioteca ZeosLib**

Bem primeiramente baixe a última versão do _ZeosLib_ diretamente no repositório SVN Oficial.

Se você utiliza o **SVN** como controle de versão, poderá utilizar o seguinte comando:

```shell
$ svn checkout https://zeoslib.svn.sourceforge.net/svnroot/zeoslib/trunk/ zeoslib
```

Se você utiliza o **GIT** como controle de versão, poderá utilizar o seguinte comando:

```shell
$ git svn clone --revision HEAD https://zeoslib.svn.sourceforge.net/svnroot/zeoslib/trunk/ zeoslib
```

**Adicionando o diretório do ZeosLib ao Library Path do Delphi**

Vamos adicionar uma _variável de ambiente_ no _Windows_, se você utiliza o _Windows Seven_ como eu, navegue até: Painel de Controle > Sistema e Segurança > Sistema. Na barra lateral clique em "Definições Avançadas do Sistema", uma janela como esta será exibida:

![Windows Seven - Propriedades do Sistema - Instalando ZeosLib no Delphi XE2](http://sistemas.cekurte.com/wp-content/uploads/2012/12/Windows-Seven-Propriedades-do-Sistema.png "Instalando ZeosLib no Delphi XE2")

Clique no botão identificado na figura como "Variáveis de ambiente…" e uma janela como esta abaixo será exibida:

![Windows Seven - Propriedades do Sistema - Variáveis de Ambiente Instalando ZeosLib no Delphi XE2](http://sistemas.cekurte.com/wp-content/uploads/2012/12/Windows-Seven-Propriedades-do-Sistema-Variáveis-de-Ambiente.png "Instalando ZeosLib no Delphi XE2")

Preencha a caixa com os seguintes valores:

* **Nome da variável:** _ZEOSLIB_
* **Valor da variável:** _PATH-onde-você-baixou-o-zeoslib_, no meu caso: _D:\Delphi Components\zeoslib_

Agora iremos adicionar o path do _ZeosLib_ ao _Library Path_ do _Delphi_, para isto, clique no menu "_Tools_" e selecione "_Options..._"

Uma tela como esta abaixo será exibida:

![Delphi XE2 - Library Path - Instalando ZeosLib no Delphi XE2](http://sistemas.cekurte.com/wp-content/uploads/2012/12/Delphi-XE2-Library-Path.png "Instalando ZeosLib no Delphi XE2")

Clique no botão "..." indicado na figura acima para adicionar um novo _path_.

Adicione os seguintes caminhos:

* **_$(ZEOSLIB)_\packages\DelphiXE2**
* **_$(ZEOSLIB)_\src\component**
* **_$(ZEOSLIB)_\src\core**
* **_$(ZEOSLIB)_\src\dbc**
* **_$(ZEOSLIB)_\src\parsesql**
* **_$(ZEOSLIB)_\src\plain**

No final você terá um resultado semelhante a este: ![Delphi XE2 - Library Path - Directories Instalando ZeosLib no Delphi XE2](http://sistemas.cekurte.com/wp-content/uploads/2012/12/Delphi-XE2-Library-Path-Directories.png "Instalando ZeosLib no Delphi XE2")

Clique no botão "OK", feche as janelas restantes e reinicie o Delphi XE2.

**Abrindo o projeto do ZeosLib no Delphi XE2**

Com o Library Path do Delphi XE2 configurado, iremos realizar a instalação do ZeosLib. Clique no botão: **File** > **Open Project… (Ctrl + F11)**

Navegue até a pasta em que você baixou o ZeosLib, no meu caso: _D:\Delphi Components\zeoslib_. Logo após, abra o diretório **packages** > ** DelphiXE2** e abra o projeto chamado **ZeosDbo.groupproj**.

**Compilando o ZeosLib no Delphi XE2**

Você deverá compilar os pacotes na seguinte ordem:

* **ZCore160.bpl**
* **ZPlain160.bpl**
* **ZParseSql160.bpl**
* **ZDbc160.bpl**
* **ZComponent160.bpl**
* **ZComponentDesign160.bpl**

A imagem abaixo, ilustra este processo:

![Delphi XE2 - ZeosLib - Compilando e Instalando ZeosLib no Delphi XE2](http://sistemas.cekurte.com/wp-content/uploads/2012/12/Delphi-XE2-ZeosLib-Compilando.png "Instalando ZeosLib no Delphi XE2")

Depois que você compilar todos os pacotes, enfim poderá realizar a instalação. Clique sobre o pacote **ZComponentDesign160.bpl** e selecione a opção "Install", como mostra a imagem abaixo:

![Delphi XE2 - ZeosLib - Instalando ZeosLib no Delphi XE2](http://sistemas.cekurte.com/wp-content/uploads/2012/12/Delphi-XE2-ZeosLib-Instalando.png "Instalando ZeosLib no Delphi XE2")

Se tudo ocorrer bem, uma mensagem como esta será exibida:

![Delphi XE2 - ZeosLib - Instalando ZeosLib no Delphi XE2](http://sistemas.cekurte.com/wp-content/uploads/2012/12/Delphi-XE2-ZeosLib-Mensagem-de-instalação.png "Instalando ZeosLib no Delphi XE2")

Concluímos a instalação da biblioteca, reinicie o _Delphi XE2_ e faça bom proveito do componente _ZeosLib_.

> Se tiver dúvidas ou algum problema com a instalação, deixe-nos um comentário.
