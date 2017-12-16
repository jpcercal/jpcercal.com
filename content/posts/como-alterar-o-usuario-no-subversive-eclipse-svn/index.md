---
draft: true
author: jpcercal@gmail.com
slug: como-alterar-o-usuario-no-subversive-eclipse-svn
title: Como alterar o usuário no Subversive (Eclipse SVN)
date: 2013-06-11T17:01:31+00:00
description: Perdeu ou alterou o seu usuário e/ou senha no Servidor SVN e não consegue altera-lo no Subversive? Então, leia este guia e aprenda a solucionar o problema.
categories:
  - Artigos
tags: []
---

Hoje iremos aprender como trocar o usuário que fica logado no plugin da IDE _Eclipse_, o _Subversive_. Pois bem, este guia também poderá ser útil se você alterou ou perdeu o seu usuário e/ou senha e não consegue se autenticar no Servidor _SVN_. Infelizmente esse plugin não disponibiliza uma interface gráfica para que você possa simplesmente fazer _logoff_ e _login_ novamente.

Entretanto, podemos fazer isto de uma maneira bem simples. Enfim, chega de enrolar e vamos logo ao que interessa.

Quando realizamos o _login_ e marcamos a opção para salvar a senha o _Subversive_ criou um arquivo criptografado que contém os seus dados de acesso, não permitindo a edição. Sendo assim, para alterar o seu usuário e senha basta excluir este arquivo e quando for realizar uma ação no _Subversive_, será exibida novamente uma janela na qual você irá preencher o seu usuário e senha.

![Como alterar o usuário no Subversive](http://sistemas.cekurte.com/wp-content/uploads/2013/06/svn-login.png "Como alterar o usuário no Subversive")

O arquivo que você precisa excluir encontra-se no seguinte diretório: `%APPDATA%\Subversion\auth\svn.simple`

![Como alterar o usuário no Subversive](http://sistemas.cekurte.com/wp-content/uploads/2013/06/svn-arquivo-authpng.png "Como alterar o usuário no Subversive")
