---
title: "jQuery Mask: Máscaras para campos de formulários"
date: 2013-01-20T11:01:36+00:00
author: jpcercal@gmail.com
excerpt: Uma maneira simples e rápida de adicionar máscaras aos campos de um formulário é utilizando um plugin jQuery, este plugin se chama Masked Input Plugin.
layout: post
permalink: /blog/jquery-mask-mascaras-para-campos-de-formularios/
image_path: /wp-content/uploads/2012/11/inauguracao-125x125.jpg
categories:
  - Artigos
  - Javascript
  - jQuery
---

Uma maneira simples e rápida de adicionar máscaras aos campos de um formulário é utilizando um plugin [jQuery](http://jquery.com/ "jQuery"), este plugin se chama [Masked Input Plugin](https://github.com/digitalBush/jquery.maskedinput "Plugin jQuery").

Para criar uma **máscara**, basta você informar um simples comando _javascript_, tendo apenas as seguintes regras:

* _a_ – _Representa um caractere alfabético (A-Z, a-z)_
* _9_ – _Representa um carácter numérico (0-9)_
* _*_ – _Representa um caractere alfanumérico (A-Z, a-z ,0-9)_

Vamos ver alguns exemplos práticos:

**Nota:** estamos utilizando o seletor _jQuery_ através do atributo **ID**.

Máscara para um campo **Telefone**:

```js
// <input type="text" id="telefone" name="telefone">

jQuery("#telefone").mask("(99) 9999-9999");
```

Máscara para um campo **RG**:

```js
// <input type="text" id="rg" name="rg">

jQuery("#rg").mask("9.999.999");
```

Máscara para um campo **CPF**:

```js
// <input type="text" id="cpf" name="cpf">

jQuery("#cpf").mask("999.999.999-99");
```

Máscara para um campo **Data**:

```js
// <input type="text" id="data" name="data">

jQuery("#data").mask("99/99/9999");
```

Máscara para um campo **Hora**:

```js
// <input type="text" id="hora" name="hora">

jQuery("#hora").mask("99:99");
```

Máscara para um campo **Cep**:

```js
// <input type="text" id="cep" name="cep">

jQuery("#cep").mask("99999-999");
```
