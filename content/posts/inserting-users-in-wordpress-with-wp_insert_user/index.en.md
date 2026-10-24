---
draft: false
author: jpcercal@gmail.com
slug: inserting-users-in-wordpress-with-wp_insert_user
title: Inserting users in WordPress with wp_insert_user
date: 2013-01-24T10:16:39+00:00
description: The wp_insert_user function inserts a user into the Wordpress database. It can also update a user, learn to use this function.
categories:
  - engineering
tags:
  - php
  - wordpress
  - cms
  - tutorial
---

The wp_insert_user function inserts a user into the WordPress database. It can also update a user
if the ID key is present in the array passed to the function as a parameter.

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

The `$userdata` array should contain the following fields:

* **ID**              an _integer_, used to update an existing user.
* **user_pass**       a _string_, containing a password the user will use.
* **user_login**      a _string_, containing a username used during login.
* **user_nicename**   a _string_, containing a friendly URL for the username, the default for this field is the username.
* **user_url**        a _string_, containing the user's profile URL.
* **user_email**      a _string_, containing the user's email address.
* **display_name**    a _string_, used to display the user's name within the site. The default value is the username.
* **nickname**        a _string_, the user's nickname, the default value for this field is the username.
* **first_name**      a _string_, the user's first name.
* **last_name**       a _string_, the user's last name.
* **description**     a _string_, containing a brief description of the user.
* **rich_editing**    a _string_, allowing the text editor to be enabled or disabled.
* **user_registered** the date the user was registered, the format used is: Y-m-d H:i:s.
* **role**            a _string_, the roles the user will have. By default wordpress provides the following roles: administrator, editor, author, contributor and subscriber.
* **jabber**          a _string_, a user's Jabber account.
* **aim**             a _string_, a user's AOL IM account.
* **yim**             a _string_, a user's Yahoo IM account.Now an example of using this function:

```php
<?php

$userdata = array(
  'user_pass'    => '123',
  'user_login'   => 'johndoe',
  'user_url'     => 'https://jpcercal.com',
  'user_email'   => 'johndoe@gmail.com',
  'display_name' => 'John Doe',
  'nickname'     => 'JD',
  'first_name'   => 'John',
  'last_name'    => 'Doe',
  'role'         => 'author',
);

$userId = wp_insert_user($userdata);
```

In the example above, we saw how easy it is to insert a user into the WordPress database.

> So, do you still have any questions? Be sure to comment.
