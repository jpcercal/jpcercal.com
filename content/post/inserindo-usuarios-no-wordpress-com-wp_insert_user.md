---
draft: true
author: jpcercal@gmail.com
slug: inserindo-usuarios-no-wordpress-com-wp_insert_user
title: Inserindo usuários no WordPress com wp_insert_user
date: 2013-01-24T10:16:39+00:00
description: A função wp_insert_user insere um usuário na base de dados do Wordpress. Com ela também é possível atualizar um usuário, aprenda a utilizar esta função.
topics:
  - Artigos
  - PHP
  - Programação
  - Wordpress
tags: []
---

A função wp_insert_user insere um usuário na base de dados do WordPress. Com ela também é possível atualizar um usuário se a chave ID estiver presente no array passado para a função como parâmetro.

```php
<?php

/**
 * Insere um usuário na base de dados do WordPress
 *
 * @param $userdata mixed Um array com os dados do usuário, stdClass ou um objeto WP_User
 *
 * @return mixed Se sucesso, retorna o ID do usuário que acaba de ser criado,
 *               do contrário retorna um objeto WP_Error
 */
wp_insert_user($userdata);
```

O array `$userdata` deve conter os seguintes campos:

* **ID**              um _inteiro_, será utilizado para atualizar um usuário existente.
* **user_pass**       uma _string_, contém uma senha que será utilizada pelo usuário.
* **user_login**      uma _string_, contém um nome de usuário que será utilizado durante o login.
* **user_nicename**   uma _string_, contém uma URL amigavel para o nome do usuário, o default para este campo é o nome do usuário.
* **user_url**        uma _string_, contém a URL do perfil do usuário.
* **user_email**      uma _string_, contém o endereço de email do usuário.
* **display_name**    uma _string_, será utilizada para exibir o nome do usuário dentro do site. O valor padrão é o nome do usuário.
* **nickname**        uma _string_, o nickname do usuário, o valor default para este campo é o nome do usuário.
* **first_name**      uma _string_, o primeiro nome do usuário.
* **last_name**       uma _string_, o sobrenome do usuário.
* **description**     uma _string_, contém uma breve descrição sobre o usuário.
* **rich_editing**    uma _string_, permite habilitar ou desabilitar o editor de textos.
* **user_registered** a data em que o usuário foi registrado, o formato utilizado é o seguinte: Y-m-d H:i:s.
* **role**            uma _string_, as regras que o usuário irá possuir. Por padrão o wordpress traz as seguintes regras: administrator, editor, author, contributor e subscriber.
* **jabber**          uma _string_, a conta Jabber de um usuário.
* **aim**             uma _string_, a conta AOL IM de um usuário.
* **yim**             uma _string_, a conta Yahoo IM de um usuário.Agora um exemplo de utilização desta função:

```php
<?php

$userdata = array(
  'user_pass'    => '123',
  'user_login'   => 'jpcercal',
  'user_url'     => 'http://sistemas.cekurte.com',
  'user_email'   => 'jpcercal@gmail.com',
  'display_name' => 'João Paulo Cercal',
  'nickname'     => 'JPC',
  'first_name'   => 'João Paulo',
  'last_name'    => 'Cercal',
  'role'         => 'author',
);

$userId = wp_insert_user($userdata);
```

No exemplo acima vimos como é fácil inserir um usuário na base de dados do WordPress.

> E aí, você ainda tem alguma dúvida? Não deixe de comentar.
