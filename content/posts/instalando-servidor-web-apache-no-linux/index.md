---
draft: false
author: jpcercal@gmail.com
slug: instalando-servidor-web-apache-no-linux
title: Instalando o servidor web Apache no Linux
date: 2011-12-22T09:38:01+00:00
description: Neste guia você aprenderá a realizar a instalação do servidor web apache em sistemas operacionais Linux. Baixe o código fonte e o compile para a sua distro.
categories:
  - devops
tags: 
  - linux
  - tutorial
---

Bem, hoje vou apresentar como realizar a instalação do servidor web **Apache 2**. Então, vamos lá!

_**Nota:** Quando realizei a instalação a última versão do pacote era a "2.2.19″. Portanto o tutorial irá tratar dessa 
versão. Entretanto, você irá baixar a versão mais recente, sendo assim, seu arquivo provavelmente terá um nome 
diferente._

![Instalando o servidor web Apache no Linux](i-apache-2.2.jpg "Servidor Web Apache 2.2")

Primeiramente efetue o download do último pacote com os fontes do **Apache**, no formato _"tar.gz"_ em:

[http://httpd.apache.org/download.cgi](http://httpd.apache.org/download.cgi)

Logo em seguida, vá ao diretório em que você baixou o arquivo e descompacte-o para o diretório _"/opt"_:

```shell
$ sudo tar xvfz ./httpd-2.2.19.tar.gz -C /opt/
```

Agora entre no diretório em que os fontes foram extraídos:

```shell
$ cd /opt/httpd-2.2.19/
```

Rode o seguinte comando:

```shell
$ sudo ./configure --prefix=/usr/local/apache2
```

Em seguida:

```shell
$ sudo make && make install
```

Parabéns seu servidor web apache já está instalado, agora iremos verificar se ele está funcionando corretamente. 
Para isto, devemos inicializa-lo e tentar acessá-lo utilizando um 
[web browser]({{< ref "posts/navegadores-ou-browsers/index.md" >}} "Navegadores ou Browsers") (_ex: Mozilla Firefox_).

Entre no diretório em que que você instalou o **apache**. Se você não modificou o caminho de instalação, rode o 
seguinte comando:

```shell
$ cd /usr/local/apache2
```

Do contrário, rode o seguinte comando:

```shell
$ cd /diretorio-em-que-o-apache-foi-instalado
```

Inicialize o apache rodando o seguinte comando:

```shell
$ sudo ./bin/apachectl -k start
```

Agora abra o navegador de sua preferência, solicitando o seguinte endereço: [http://localhost](http://localhost).

Se tudo estiver certo a seguinte mensagem será apresentada:

**# It works!**
