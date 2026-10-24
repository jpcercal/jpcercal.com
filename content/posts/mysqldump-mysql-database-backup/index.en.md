---
draft: false
author: jpcercal@gmail.com
slug: mysqldump-mysql-database-backup
title: MySQLDump - MySQL database backup
date: 2013-10-21T12:10:18+00:00
description: The mysqldump tool backs up MySQL databases, creating a *.sql file with the statements needed to create a copy of the target database.
categories:
  - engineering
tags:
  - mysql
  - database
  - devops
---

Using the **mysqldump** tool, you can back up a local database and restore it to a
remote database with the same characteristics, all using a simple command. Next, you'll see
practical examples of using the **mysqldump** tool to export and import
_MySQL_ databases.

Below is an export example:

```shell
$ mysqldump -u [USERNAME] -p[PASSWORD] [DATABASE-NAME] > dumpfilename.sql
```

And to import the database:

```shell
$ mysql -u [USERNAME] -p[PASSWORD] [DATABASE-NAME] < dumpfilename.sql
```

Based on the syntax shown above, let's say there is a database called "exemplo", and we want to export it.
To do this, we would run the following command:

```shell
$ mysqldump -u root exemplo > exemplo.sql
```

This command would export all the content in the "exemplo" database to a file called "exemplo.sql".

Once we have our database exported, in another database (for example the one in the production
environment) into which we want to import the previously exported database, we would run the following command:

```shell
$ mysql -u root exemplo < exemplo.sql
```

We can also import a database by connecting to mysql and running the source command there to import the
database, for this we use the following sequence of commands:

```shell
$ mysql -u root
```

```shell
$ mysql> use exemplo;
```

```shell
$ mysql> source /home/usuario/dump/dumpfilename.sql
```

**1\. Back up N databases simultaneously:**

If you intend to back up N databases simultaneously, first you'll need to identify
the names of the databases you want to export. To do this, you can connect to the database
with the following command:

```shell
$ mysql -u root
```

After connecting, you can list the database names with the following command:

![MySQL database backup](mysql-300x184.jpg "MySQLDump - MySQL database backup")

```shell
$ mysql> show databases;
```

The command's output is shown below:

```shell
$ mysql> show databases;
+--------------------+
| Database |
+--------------------+
| information_schema |
| clientes |
| mysql |
| exemplo |
+--------------------+
4 rows in set (0.00 sec)
```

If you want to export the cliente database and the exemplo database, you could run the tool using
the following syntax:

```shell
$ mysqldump -u root --databases <DATABASE-NAME-1 DATABASE-NAME-2 DATABASE-NAME-N> > dumpfilename.sql
```

So our command would look like this:

```shell
$ mysqldump -u root --databases clientes exemplo > clientes_exemplo.sql
```

**2\. Back up all databases:**

The following command would back up all databases:

```shell
$ mysqldump -u root --all-databases > dumpfilename.sql
```

**3\. Back up a specific table**

If you intend to back up a specific table within a database, you can use
the following syntax:

```shell
$ mysqldump -u <DATABASE-NAME> <TABLE-NAME> > dumpfilename.sql
```

So if we wanted to export a table called "tabela1″ in a database called "exemplo",
we would use the following command:

```shell
$ mysqldump -u root exemplo tabela1 > exemplo_tabela1.sql
```

Well, that's all folks.

> Questions? **Leave a comment!**
