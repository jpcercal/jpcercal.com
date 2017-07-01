---
draft: true
author: jpcercal@gmail.com
slug: acessando-instancias-amazon-rds-em-seu-desktop
title: Acessando Instâncias Amazon RDS em seu Desktop
date: 2014-08-15T10:48:28+00:00
description: Aprenda a conectar no serviço RDS da Amazon através de um cliente Desktop utilizando uma conexão SSH que reencaminha os pacotes para a sua máquina local.
topics:
  - Artigos
tags: []
---

Depois de alguns minutos de pesquisa, encontrei uma solução interessante para conectar no RDS da Amazon através de um cliente Desktop, pois bem, a fórmula mágica se dá através de uma conexão SSH que reencaminha os pacotes para a máquina local, permitindo desta forma, uma conexão remota.

Primeiramente você precisa adicionar a sua chave de conexão do serviço EC2 da Amazon. Faça isso executando o seguinte comando:

```shell
$ ssh-add <your-key-filename>.pem
```

E para reencaminhar os pacotes execute o seguinte comando:

```shell
$ ssh -l <your-username-ec2> -L <your-local-port>:<your-host-rds>:<your-host-rds-port> -N <your-host-ec2>
```

E por fim, realize a conexão através de um cliente de banco de dados, onde:

* **host:** `127.0.0.1`
* **port:** `<your-local-port>`
* **database:** `<your-database-rds>`
* **username:** `<your-username-database-rds>`
* **password:** `<your-password-database-rds>`

É isto, espero que isto possa servir para alguém.

> Ficou com dúvidas ou este conteúdo realmente lhe ajudou? Então, deixe um comentário.
