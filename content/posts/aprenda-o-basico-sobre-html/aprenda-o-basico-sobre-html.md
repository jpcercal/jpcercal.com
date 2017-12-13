---
draft: true
author: jpcercal@gmail.com
slug: aprenda-o-basico-sobre-html
title: Aprenda o básico sobre HTML
date: 2011-05-13T22:14:34+00:00
description: As páginas web são desenvolvidas utilizando texto puro, o que significa que basta escrever o código em um programa de edição de texto simples. Aprenda HTML!
categories:
  - html
tags: []
---

Partindo do princípio que você já leu a [Introdução a Linguagem HTML](http://sistemas.cekurte.com/2010/12/introducao-a-linguagem-html/), vamos prosseguir.

**O Que Você Precisa?**

* _Querer aprender._

**O que você não precisa?***

* _Um **Editor HTML** profissional._
* _Um **Servidor WEB.**_
* _Um **Website.**_

**HTML e Compatibilidade**

Diferentemente dos processadores de texto, a linguagem HTML não foi criada para controlar a aparência dos documentos.

Os vários navegadores interpretam HTML de diferentes formas. Caso pretenda criar websites profissionalmente, o ideal é que você instale várias opções de navegadores em seu computador ([Navegadores ou Browsers](http://sistemas.cekurte.com/blog/navegadores-ou-browsers/ "Navegadores ou Browsers")), de forma a prever a aparência que suas páginas da web terão, ao menos nos navegadores mais comumente utilizados. Outra preocupação seria com a resolução do monitor do usuário final.

**Como Editar e Salvar**

As páginas da web, como mencionado, são desenvolvidas utilizando texto puro, o que significa que basta escrever o código em um programa de edição de texto simples (como o 'Bloco de Notas' do Windows) e depois salvá-lo como:

**Extensão**: Todos os arquivos (*.*), nomeando-o com a extensão **.html** (pagina**.html**) ou **.htm** (pagina**.htm**).

1. **.htm:** característica do _DOS_ e _WINDOWS_
2. **.html:** característica do _UNIX_

Usaremos a extensão **.html** em nossos exemplos.

**Nota:** se existirem dois documentos com o mesmo nome, por exemplo, um arquivo chamado **index.html** e outro, **index.htm**, o servidor irá sempre apresentar o _index.html_. A menos que você modifique a configuração padrão. [Conheça o Servidor Web Apache](http://sistemas.cekurte.com/blog/instalando-servidor-web-apache-no-linux/ "Instalando o servidor web Apache no Linux").

Além de editores de texto puro, você pode utilizar um **Editor de HTML profissional** especializado para editar suas páginas.

**Recomendado:** _Se você quiser ser um desenvolvedor Web habilidoso, use um editor de texto puro para aprender HTML elementar. E quando souber o que faz cada tag utilize um editor para acelerar o processo de desenvolvimento._


**Exemplo:**

```html
<html>
  <head>
    <title>Título</title>
  </head>
  <body>
    <p>Esse texto contém um parágrafo</p>
  </body>
</html>
```

Vamos à explicação passo a passo:

1. _Esta tag diz para o seu navegador que este é o início de um documento HTML._
2. _Inicia o cabeçalho_
3. _Configura o título_
4. _Finaliza o cabeçalho_
5. _Inicia o corpo_
6. _Insere um texto com um parágrafo_
7. _Finaliza o corpo do documento_
8. _Finaliza o documento html_

Apenas o corpo (_body_) do documento é apresentado no navegador.

![Aprenda o básico sobre HTML](http://sistemas.cekurte.com/wp-content/uploads/2010/12/primeiraPagina.png "Exemplo utilizando as marcações HTML")

Utilizaremos o padrão [CamelCase](http://sistemas.cekurte.com/blog/o-padrao-camelcase/ "O Padrão CamelCase") para os nomes dos arquivos, então, salve o arquivo como **"primeiraPagina.html"**.

![Aprenda o básico sobre HTML](http://sistemas.cekurte.com/wp-content/uploads/2010/12/salvarDocumentoHtml.png "Salvar documento HTML com o Bloco de Notas")

**Abrindo o documento em seu navegador**

Siga os passos abaixo:

![Aprenda o básico sobre HTML](http://sistemas.cekurte.com/wp-content/uploads/2010/12/abrirDocumentoHtmlMozillaFirefoxMenu.png "Aprenda o básico sobre HTML")

![Aprenda o básico sobre HTML](http://sistemas.cekurte.com/wp-content/uploads/2010/12/abrirDocumentoHtmlMozillaFirefox.png "Aprenda o básico sobre HTML")

**Fontes de Pesquisa:**

* _http://www.criarwebsite.com/tutoriais/html/introducao.html_
* _http://www.ufpa.br/dicas/htmmozi/htm-intr.htm_
* _http://www.clem.ufba.br/tuts/html/c02.htm_
