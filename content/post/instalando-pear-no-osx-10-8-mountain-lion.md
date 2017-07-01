---
draft: true
author: jpcercal@gmail.com
slug: instalando-pear-no-osx-10-8-mountain-lion
title: Instalando PEAR no OSX 10.8 Mountain Lion
date: 2013-04-04T22:28:01+00:00
description: Aprenda a realizar a instalação do PEAR no sistema operacional da Apple, o Mac OSX 10.8 Mountain Lion com este passo a passo.
topics:
  - Apple
  - Artigos
tags: []
---

Galera, desta vez vamos aprender a instalar o _PEAR_ no sistema operacional da _Apple_. Este guia deve ser compatível também com os sistemas operacionais anteriores da família da maçã, tais como: _Snow Leopard_ e _Lion_.

Bem, vamos passar a receita do bolo.

Abra o Terminal e verifique se o _PEAR_ já está instalado com o seguinte comando.

```shell
$ pear version
```

Se ele não estiver instalado, a saída do comando deverá se parecer com:

```shell
pear: command not found
```

Se você viu a mensagem acima, então podemos instalar o pear, pois ele não encontra-se no seu sistema operacional.

Execute o seguinte comando, para selecionar um diretório e baixar o pacote de instalação do _pear_:

```shell
$ cd /usr/local
$ curl -O  http://pear.php.net/go-pear.phar
```

Finalmente vamos instalar o pear:

```shell
$ sudo php -d detect_unicode=0 go-pear.phar
```

Apenas confira o _PATH_ informado, se precisar personalizar a sua instalação faça as alterações necessárias, no meu caso não modifiquei nenhuma linha e pressionei direto a tecla _ENTER_.

O Script também irá lhe perguntar se você deseja atualizar o _include_path_ do _PHP _adicionando o _PEAR_, pressione a tecla Y (Sim/Yes) seguida de _ENTER_.

Agora vamos adicionar o _PEAR_ ao _PATH_ do seu usuário.

Digite os seguintes comandos no Terminal.

```shell
$ cd
$ vi .bashrc
```

Adicione a seguinte linha logo após o último caminho presente na variável _PATH_:

/Users/**nome-do-seu-usuario**/pear/bin/

Salve o arquivo e execute o seguinte comando no Terminal:

```shell
$ source .bashrc
$ pear version
```

Você deverá ver algo como a saída apresentada abaixo:

```shell
PEAR Version: 1.9.4
PHP Version: 5.3.15
Zend Engine Version: 2.3.0
```

Se você viu a saída acima, então o _PEAR_ foi instalado com **sucesso** em sua máquina. Do contrário, verifique novamente os comandos mencionados acima e analise se não houve algum erro de sintaxe.

> Se estiver com dificuldades em realizar a instalação ou conseguir instalar o _pear_ através deste guia, por favor, deixe o seu comentário.
