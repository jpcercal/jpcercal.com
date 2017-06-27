---
title: Validando formulários com o plugin jQuery Validade
date: 2013-01-21T13:15:32+00:00
author: jpcercal@gmail.com
excerpt: Aprenda a realizar a validação de formulários utilizando um excelente plugin, conheça o  jQuery Validade desenvolvido pela equipe http://bassistance.de.
layout: post
permalink: /blog/validando-formularios-com-o-plugin-jquery-validade/
image_path: /wp-content/uploads/2012/11/inauguracao-125x125.jpg
categories:
  - Artigos
  - Javascript
  - jQuery
  - Programação
---

Hoje apresento a vocês o **jQuery Validade**, um excelente plugin jQuery desenvolvido pela equipe [http://bassistance.de](http://bassistance.de/jquery-plugins/jquery-plugin-validation/ "jQuery Validate").

Você pode fazer o download deste plugin diretamente no site do desenvolvedor (_citado acima_) ou então no repositório [GitHub](http://sistemas.cekurte.com/blog/git-hub-atinge-tres-milhoes-de-usuarios/ "Git Hub atinge 3 milhões de usuários") (_https://github.com/jzaefferer/jquery-validation_).

Se você utiliza o **GIT** como controlador de versão, poderá executar o comando abaixo para clonar o repositório oficial do plugin:

```shell
$ git clone https://github.com/jzaefferer/jquery-validation.git
```

Para utilizar este plugin você precisa utilizar o [jQuery](http://jquery.com/ "jQuery").

**Mão na massa**

Adicione as linhas abaixo dentro da tag head do seu documento [HTML](http://sistemas.cekurte.com/blog/aprenda-o-basico-sobre-html/ "Aprenda o básico sobre HTML").

```html
<script type="text/javascript" src="js/jquery.min.js"></script>
<script type="text/javascript" src="js/jquery.validate.js"></script>
```

Agora vamos criar um formulário, e adicionar alguns campos. Confira abaixo:

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

Agora iremos realizar a validação do formulário que acabamos de criar, para isto adicione as seguintes linhas de código:

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

Agora basta executar o seu documento HTML em seu [navegador](http://sistemas.cekurte.com/blog/navegadores-ou-browsers/ "Navegadores ou Browsers") para ver o resultado final.

> Espero que tenham gostado, se houver dúvidas quanto a utilização do plugin, deixe um comentário.
