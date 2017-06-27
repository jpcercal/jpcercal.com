---
title: CakePHP problema com mod_rewrite
date: 2012-02-23T03:10:27+00:00
author: jpcercal@gmail.com
excerpt: Se você já enfrentou algum problema com mod_rewrite no CakePHP saiba que a solução pode ser bastante simples, confira o problema que passamos e resolvemos.
layout: post
permalink: /blog/cakephp-problema-com-mod_rewrite/
image_path: /wp-content/uploads/2012/11/inauguracao-125x125.jpg
categories:
  - Artigos
  - CakePHP
  - PHP
  - Programação
---

Olá, boa noite. Hoje tive problemas com a reescrita de URL's do [CakePHP](http://cakephp.org/), e decidi compartilhar o erro e como o resolvi.

![CakePHP problema com mod rewrite](http://sistemas.cekurte.com/wp-content/uploads/2012/02/CakePHP.png "CakePHP problema com mod rewrite")

O problema que ocorria era que ao tentar acessar a URL da aplicação através do browser, este me retornava o seguinte erro **404 – Not Found**.

Bem primeiramente, logo após procurar alguma inconsistência nos nomes de controladores e ações, limpar o cache, verificar se a reescrita de url's estava habilitada no Apache, etc, apelei para o Google. Após algumas pesquisas, encontrei na documentação do próprio _Cake_ a solução.

Eis, que faltava um arquivo **.htaccess** no diretório _ROOT_ da aplicação. _Por algum motivo eu excluí este arquivo sem querer._

Então, para quem estiver com dificuldades também. Aqui está a solução, e outras possíveis soluções para este problema: [Documentação do CakePHP](http://book.cakephp.org/2.0/pt/tutorials-and-examples/blog/blog.html?highlight=mod_rewrite#uma-palavra-sobre-o-mod-rewrite).
