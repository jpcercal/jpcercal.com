---
draft: false
author: jpcercal@gmail.com
slug: baixando-e-instalando-a-biblioteca-libxml
title: Baixando e Instalando a biblioteca libxml
date: 2011-12-22T19:13:10+00:00
description: Neste guia você aprenderá a realizar a instalação da biblioteca libxml em sistemas operacionais Linux. Baixe o código fonte e o compile para a sua distro.
categories:
  - devops
tags: 
  - tutorial
  - linux
---

XML é um padrão para a construção de documentos estruturados baseado em marcações que contém os dados.

A biblioteca **libxml2** foi escrita em **C** puro, a fim de permitir uma fácil reutilização em várias plataformas, 
incluindo sistemas embarcados.

**Mão na massa!**

Entre no website e baixe a última versão estável:

[http://www.xmlsoft.org/downloads.html](http://www.xmlsoft.org/downloads.html)

Abra o terminal, e entre no diretório em que a biblioteca foi salva:

```shell
$ cd ./Download/
```

Descompacte o arquivo para o diretório _"/opt"_:

```shell
$ sudo tar xvfz libxml2-git-snapshot.tar.gz -C /opt/
```

Entre no diretório em que o arquivo foi descompactado:

```shell
$ sudo cd /opt/libxml2-2.7.8/
```

Para uma instalação padrão rode o comando abaixo, se você quiser poderá mudar o diretório de instalação.

```shell
$ sudo ./configure --prefix=/usr/local/libxml
```

Agora basta instalar:

```shell
$ sudo make && make install
```
