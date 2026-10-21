---
draft: false
author: jpcercal@gmail.com
slug: jquery-mask-masks-for-form-fields
title: "jQuery Mask: Masks for form fields"
date: 2013-01-20T11:01:36+00:00
description: A simple and quick way to add masks to form fields is to use a jQuery plugin, this plugin is called Masked Input Plugin.
categories:
  - js
tags: 
  - jquery
---

A simple and quick way to add masks to form fields is to use a
[jQuery](http://jquery.com/ "jQuery") plugin, this plugin is called
[Masked Input Plugin](https://github.com/digitalBush/jquery.maskedinput "jQuery Plugin").

To create a **mask**, you just need to provide a simple _javascript_ command, with only the following rules:

* _a_ – _Represents an alphabetic character (A-Z, a-z)_
* _9_ – _Represents a numeric character (0-9)_
* _*_ – _Represents an alphanumeric character (A-Z, a-z ,0-9)_

Let's look at some practical examples:

**Note:** we're using the _jQuery_ selector through the **ID** attribute.

Mask for a **Telephone** field:

```js
// <input type="text" id="telefone" name="telefone">

jQuery("#telefone").mask("(99) 9999-9999");
```

Mask for an **RG** field:

```js
// <input type="text" id="rg" name="rg">

jQuery("#rg").mask("9.999.999");
```

Mask for a **CPF** field:

```js
// <input type="text" id="cpf" name="cpf">

jQuery("#cpf").mask("999.999.999-99");
```

Mask for a **Date** field:

```js
// <input type="text" id="data" name="data">

jQuery("#data").mask("99/99/9999");
```

Mask for a **Time** field:

```js
// <input type="text" id="hora" name="hora">

jQuery("#hora").mask("99:99");
```

Mask for a **Postal code** field:

```js
// <input type="text" id="cep" name="cep">

jQuery("#cep").mask("99999-999");
```
