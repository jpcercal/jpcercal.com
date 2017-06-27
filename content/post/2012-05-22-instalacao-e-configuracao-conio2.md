---
title: Instalação e Configuração Conio2.h
date: 2012-05-22T17:51:39+00:00
author: jpcercal@gmail.com
excerpt: Realize a instalação do pacote Conio2.h para o IDE Dev-C++. Este pacote adiciona funcionalidades para o desenvolvimento de aplicativos escritos em C/C++.
layout: post
permalink: /blog/instalacao-e-configuracao-conio2/
image_path: /wp-content/uploads/2012/11/inauguracao-125x125.jpg
categories:
  - Artigos
  - C++
  - Programação
---

Elaborei este documento para alguns colegas meus que estavam com dificuldade em instalar o pacote **Conio2.h** para o **IDE Dev-C++**. Este pacote incluí uma biblioteca com funcionalidades para o desenvolvimento de aplicativos escritos em **C/C++**.

Para prosseguir com este guia, é necessário que você possua o **Dev-C++** instalado.

Primeiramente devemos [Baixar o pacote Conio2.h no SourceForge](http://sourceforge.net/projects/conio/files/devpak/CONIO%202.0/conio-2.0-1mol.DevPak/download).

Após ter realizado o download devemos executar o arquivo com extensão _"DevPak"_.

![Conio2.h - Instalação e Configuração Conio2.h](http://sistemas.cekurte.com/wp-content/uploads/2012/05/Conio2.h-Arquivo.png "Conio2.h")

Um setup será exibido clique no botão _"Install"_ como mostra a imagem abaixo:

![Conio2.h - Instalação e Configuração Conio2.h](http://sistemas.cekurte.com/wp-content/uploads/2012/05/Conio2.h-Instalando-Tela01.png "Conio2.h - Instalação - Clique no botão \"Install\" (Instalar)")

Agora clique no botão _"Finish"_ como mostra a imagem abaixo:

![Conio2.h - Instalação e Configuração Conio2.h](http://sistemas.cekurte.com/wp-content/uploads/2012/05/Conio2.h-Instalando-Tela02.png "Conio2.h - Instalação - Clique no botão \"Finish\" (Finalizar)")

Vamos nos certificar de que a biblioteca **Conio2.h** foi instalada, como mostra a imagem abaixo:

![Conio2.h - Instalação e Configuração Conio2.h](http://sistemas.cekurte.com/wp-content/uploads/2012/05/Conio2.h-Instalando-Tela03.png "Conio2.h - Instalação - Verificando se a instalação foi bem sucedida")

Agora precisamos configurar o Dev-C++ para que ele utilize a biblioteca. Vá ao menu _"Ferramentas"_ **>** _"Opções do Compilador"_, como mostra a imagem abaixo:

![Conio2.h - Instalação e Configuração Conio2.h](http://sistemas.cekurte.com/wp-content/uploads/2012/05/Conio2.h-Instalando-Tela04.png "Conio2.h - Instalação - "Ferramentas" > "Opções do Compilador"")

Adicione o seguinte comando **"-lconio"**, como mostra a imagem abaixo:

![Conio2.h - Instalação e Configuração Conio2.h](http://sistemas.cekurte.com/wp-content/uploads/2012/05/Conio2.h-Instalando-Tela05.png "Conio2.h - Instalação - Adicione o comando "-lconio"")

Agora você já pode desfrutar da biblioteca **Conio2.h**.

![Conio2.h - Instalação e Configuração Conio2.h](http://sistemas.cekurte.com/wp-content/uploads/2012/05/Conio2.h-Instalando-Tela06.png "Conio2.h - Instalação - Código fonte")
