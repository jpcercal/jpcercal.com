---
title: Conhecendo e Instalando o servidor SAMBA no LINUX
date: 2012-11-22T02:36:32+00:00
author: jpcercal@gmail.com
excerpt: O SAMBA é um servidor e um conjunto de ferramentas que permite que máquinas Linux e Windows se comuniquem entre si, compartilhando serviços e arquivos.
layout: post
permalink: /blog/conhecendo-e-instalando-o-servidor-samba-no-linux/
image_path: /wp-content/uploads/2012/11/inauguracao-125x125.jpg
categories:
  - Artigos
  - Linux
---

**O QUE É?**

O SAMBA é um servidor e um conjunto de ferramentas que permite que máquinas Linux e Windows se comuniquem entre si, compartilhando serviços (arquivos, diretório, impressão) através do protocolo SMB (Server Message Block)/CIFS (Common Internet File System), equivalentes a implementação NetBEUI no Windows.

Ele também pode ser utilizado como um controlador primário de domínio (PDC), servindo como um servidor de autenticação para os clientes Windows.

Na maioria dos casos o controle de acesso e exibição de diretórios no samba é mais minucioso e personalizável que no próprio sistema da Microsoft.

Sendo assim, O SAMBA é uma das soluções em ambiente UNIX capaz de interligar redes heterogênea.

**BREVE HISTÓRIA**

Seu desenvolvimento foi iniciado porque houve a necessidade de montar um volume UNIX em uma máquina DOS. Seu criador Andrew Tridgell criou um sniffer de pacotes com o objetivo de analisar e entender o tráfego de dados em uma rede NetBIOS. Após o compreendimento, realizou sua implementação no Linux sobre o protocólo SMB. Isto fez com que o servidor Unix fosse apresentado com um servidor de arquivos Windows em seu PC com DOS.

Este código foi publicado em 1992, em seguida Andrew decidiu deixar o projeto estacionado. Dois anos mais tarde, ele tentou conectar o PC de sua esposa em seu computador com Linux, e descobriu que a documentação dos protocólos SMB e NetBIOS haviam sido atualizadas. Foi então que ele voltou a dedicar-se ao projeto.

**INSTALANDO O SAMBA**

O samba está disponível sob a licença GNU (GNU is not Unix) e é portanto um software livre. A grande maioria das distribuições já o incluem, entretanto, é possível que você o obtenha do site oficial – www.samba.org. Se você é um usuário Debian, ou possuí uma distribuição derivada deste poderá digitar o seguinte comando no terminal para efetuar a instalação:

```shell
# apt-get install samba smbclient smbfs
```

Se você baixou o código fonte deverá primeiramente descompacta-lo:

Nota: {VERSION} deverá ser substituído pela versão do aplicativo.

```shell
# tar -zxvf samba-{VERSION}.tar.gz
```

Neste momento, entre no diretório em que o source foi criado e execute os seguintes comandos:

```shell
# ./configure
# make && make install
```

**REFERÊNCIAS**

* _http://www.vivaolinux.com.br/artigo/Micro-curso-Samba_
* _http://mlsvicente.blogspot.com.br/2007/10/controlador-de-domnio-com-samba-e.html_
* _http://www.hardware.com.br/artigos/samba-dominio/_
* _http://www.infowester.com/linuxsamba.php_
* _http://www.samba.org/samba/docs/man/Samba-HOWTO-Collection/IntroSMB.html#id2551356_
* _http://www.guiafoca.org/cgs/guia/avancado/ch-s-samba.html_
