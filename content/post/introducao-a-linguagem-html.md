---
draft: true
author: jpcercal@gmail.com
slug: introducao-a-linguagem-html
title: Introdução a Linguagem HTML
date: 2010-12-07T23:57:10+00:00
description: Um documento HTML (HyperText Markup Language) é um conjunto de instruções em formato ASCII, usada para criar documentos de hipertexto e que podem ser visualizados por um browser WWW (como o Internet Explorer, Mozilla Firefox, Apple Safari, etc).
categories:
  - Artigos
  - Curso
  - HTML
  - Programação
tags: []
---

Um documento **HTML** (_HyperText Markup Language_) é um conjunto de instruções em formato _ASCII_, usada para criar documentos de hipertexto e que podem ser visualizados por um [Navegador ou Browser](http://sistemas.cekurte.com/blog/navegadores-ou-browsers/ "Navegadores ou Browsers") WWW (_como o Internet Explorer, Mozilla Firefox, Apple Safari, etc_).

Para criar uma página _HTML_ você precisa unicamente de um editor de textos que permita salvar arquivos no formato "_ASCII com quebras de linhas_" pode se citar o "_Notepad"_ ou_ "Sublime Text 2″ _em ambiente Windows.

Para visualizar o documento _HTML_ basta abri-lo no seu navegador favorito.

A linguagem _HTML_ é composta por **tags** (_marcadores_), o qual o browser interpreta e os exibe.

As marcações HTML seguem o seguinte padrão:

* **NOTA:** a imagem abaixo ilustram a sintaxe da Linguagem de marcação HTML **sem** par de fechamento.

![Introdução a Linguagem HTML](http://sistemas.cekurte.com/wp-content/uploads/2010/12/html1.png "Sintaxe da Linguagem de Marcação HTML")

* **NOTA:** a imagem abaixo ilustram a sintaxe da Linguagem de marcação HTML **com** par de fechamento.

![Introdução a Linguagem HTML](http://sistemas.cekurte.com/wp-content/uploads/2010/12/html.png "Sintaxe da Linguagem de Marcação HTML")Sintaxe da Linguagem de Marcação HTML com par de fechamento

Assim como na segunda imagem – de um modo geral – as tags aparecem em pares, por exemplo:

```html
<p>Esse texto contém um parágrafo</p>
```

Onde:

`<p>` Indica que um parágrafo deve ser criado.

`</p>` Indica que o parágrafo está concluído.

O símbolo que termina uma determinada marcação é igual aquele que a inicia, antecedido por uma barra (**/**).

Há exceções a esse funcionamento em pares das marcações. Por exemplo, a marcação que indica quebra de linha `<br>` também não precisa de uma correspondente, e outras tais como `<hr>`.

As tags podem opcionalmente conter **atributos**. Um atributo define uma _característica_ ou _propriedade_ de um _elemento_. É sempre incluído na tag inicial (_abertura_) de um elemento (_marcador_), usando a sintaxe: **nome-do-atributo="_valor_"**.

Um elemento pode ter vários atributos, separados por espaço(s) em branco.

A imagem abaixo ilustra a sintaxe da Linguagem de Marcação HTML utilizando atributos:

![Introdução a Linguagem HTML](http://sistemas.cekurte.com/wp-content/uploads/2010/12/sintaxe-html.png "Sintaxe da Linguagem de Marcação HTML")

**Importante**: _HTML_ não faz diferença entre _maiúsculas_ e _minúsculas_ (_NÃO é "[case sensitive](http://sistemas.cekurte.com/blog/o-padrao-camelcase/ "O Padrão CamelCase")"_). Então a notação `<title></strong>` **é equivalente a** `<strong><TITLE></strong>` ou `<strong><TiTlE></strong>. </p></title>`.

Veja a seguir um exemplo de uma página HTML:

```html
<html>
    <head>
        <title>Título da Página</title>
    </head>
    <body>
        <p align="center">Olá Html!</p>
    </body>
</html>
```

**Fontes de Pesquisa**:

* _http://www.ic.unicamp.br/~celio/inf533/docs/markup.html_
* _http://cdcc.sc.usp.br/tutorial/index.htm_
