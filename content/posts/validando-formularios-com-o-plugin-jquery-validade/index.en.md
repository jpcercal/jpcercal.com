---
draft: false
author: jpcercal@gmail.com
slug: validating-forms-with-the-jquery-validade-plugin
title: Validating forms with the jQuery Validade plugin
date: 2013-01-21T13:15:32+00:00
description: Learn to validate forms using an excellent plugin, get to know jQuery Validade developed by the team at http://bassistance.de.
categories:
  - js
tags: 
  - jquery
---

Today I introduce you to **jQuery Validade**, an excellent jQuery plugin developed by the team at
[http://bassistance.de](http://bassistance.de/jquery-plugins/jquery-plugin-validation/ "jQuery Validate").

You can download this plugin directly from the developer's site (_mentioned above_) or from the
[GitHub]({{< ref "posts/git-hub-atinge-tres-milhoes-de-usuarios/index.md" >}} "Git Hub reaches 3 million users") repository
(_https://github.com/jquery-validation/jquery-validation).

If you use **GIT** for version control, you can run the command below to clone the plugin's
official repository:

```shell
$ git clone https://github.com/jzaefferer/jquery-validation.git
```

To use this plugin you need to use [jQuery](http://jquery.com/ "jQuery").

**Let's get our hands dirty**

Add the lines below inside the head tag of your
[HTML]({{< ref "posts/aprenda-o-basico-sobre-html/index.md" >}} "Learn the basics of HTML") document.

```html
<script type="text/javascript" src="js/jquery.min.js"></script>
<script type="text/javascript" src="js/jquery.validate.js"></script>
```

Now let's create a form and add some fields. Check it out below:

```html
<form id="formulario" action="" method="post">
  Nome:  <input type="text" name="nome" id="nome" /><br />
  Email: <input type="text" name="email" id="email" /><br />
  Senha: <input type="password" name="senha" id="senha" /><br />
  Confirmação de Senha: <input type="password" name="confirmar_senha" id="confirmar_senha" /><br />
  Termos de Contrato: <input type="checkbox" name="termos" id="termos"/><br />
  <input type="submit" value="Cadastrar" />
</form>
```

Now we'll validate the form we've just created, to do this add the following lines of code:

```html
<script type="text/javascript">
$(document).ready(function(){
  $('#formulario').validate({
    rules: {
      nome: {
        required: true,
        minlength: 3
      },
      email: {
        required: true,
        email: true
      },
      senha: {
        required: true
      },
      confirmar_senha: {
        required: true,
        equalTo: "#senha"
      },
      termos: "required"
    },
    messages: {
      nome: {
        required: "O campo nome é obrigatório.",
        minlength: "O campo nome deve conter no mínimo 3 caracteres."
      },
      email: {
        required: "O campo email é obrigatório.",
        email: "O campo email deve conter um email válido."
      },
      senha: {
        required: "O campo senha é obrigatório."
      },
      confirmar_senha: {
        required: "O campo confirmação de senha é obrigatório.",
        equalTo: "O campo confirmação de senha deve ser identico ao campo senha."
      },
      termos: "Para se cadastrar você deve aceitar os termos de contrato."
    }
  });
});
</script>
```

Now just run your HTML document in your
[browser]({{< ref "posts/navegadores-ou-browsers/index.md" >}} "Web Browsers") to see the final result.

> I hope you liked it, if you have questions about using the plugin, leave a comment.
