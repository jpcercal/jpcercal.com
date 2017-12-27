---
draft: false
author: jpcercal@gmail.com
slug: como-recriar-deb-a-partir-de-pacote-instalado
title: Como recriar .deb a partir de pacote instalado
date: 2011-10-14T22:02:03+00:00
description: O dpkg-repack gera um arquivo .deb a partir do pacote que você tem instalado, com todas as configurações correntes. Crie um arquivo .deb de seus programas.
categories:
  - other
tags: 
  - linux
---

Se você utiliza o sistema operacional [Ubuntu](http://www.ubuntu.com/ "Ubuntu") ou qualquer outra distro derivada do 
[Debian](http://www.debian.org/ "Debian"), muito provavelmente já deve ter precisado instalar um programa em outra 
máquina que não fosse a sua, porém na hora de copiar… cadê o **.deb**?

Se você encontrar o programa na Internet, tudo bem, mas e se ele não estiver mais disponível para download? Se você 
no momento estiver sem acesso a Internet?

Para isso existe o **"dpkg-repack"**.

Este programa gera um arquivo **.deb** a partir do pacote que você tem instalado, com todas as configurações correntes. 
Ou seja, quando for instalado o **.deb**, o pacote já estará configurado da forma que você deixou antes de executar o 
**dpkg-repack** em cima dele.

Para instalar é simples, abra um terminal de sua preferência e digite:

```shell
$ sudo apt-get install dpkg-repack -y
```

Para usar, basta fazer o seguinte, no terminal digite:

```shell
$ sudo dpkg-repack nome-do-pacote
```

Exemplo:

```shell
$ sudo dpkg-repack chromium-browser
```

O comando acima criará um pacote **.deb** no diretório em que você se encontra. A partir daí é só instalar o pacote 
onde quiser ou deixar armazenado como sendo a última configuração válida dele antes de uma atualização por exemplo.
