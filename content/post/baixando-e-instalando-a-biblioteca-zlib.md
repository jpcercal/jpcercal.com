---
draft: true
author: jpcercal@gmail.com
slug: baixando-e-instalando-a-biblioteca-zlib
title: Baixando e Instalando a biblioteca Zlib
date: 2011-12-22T17:43:30+00:00
description: Neste guia você aprenderá a realizar a instalação da biblioteca zlib em sistemas operacionais Linux. Baixe o código fonte e o compile para a sua distro.
topics:
  - Artigos
tags: []
---

A biblioteca de compressão **zlib** tem como finalidade a **compressão** e **descompressão** de _arquivos_, incluindo _verificações de integridade_ dos dados _descompactados_. Esta biblioteca também pode, opcionalmente, ler e escrever **streams gzip** na _memória_.

O formato **zlib** foi projetado principalmente para ser compacto e rápido, para uso na memória e nos canais de comunicação.

**Então, Mão na massa!**

Entre no website oficial e baixe a última versão estável:

[http://zlib.net/](http://zlib.net/)

Abra o terminal, e entre no diretório em que a biblioteca foi salva:

```shell
$ cd ./Download/
```

Descompacte o arquivo para o diretório _"/opt"_:

```shell
$ sudo tar xvfz zlib-1.2.5.tar.gz -C /opt/
```

Entre no diretório em que o arquivo foi descompactado:

```shell
$ sudo cd /opt/zlib-1.2.5/
```

Para uma instalação padrão rode o comando abaixo, se você quiser poderá mudar o diretório de instalação.

```shell
$ sudo ./configure --prefix=/usr/local/zlib
```

Agora basta instalar:

```shell
$ sudo make && make install
```
