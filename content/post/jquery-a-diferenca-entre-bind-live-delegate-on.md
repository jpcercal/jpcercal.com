---
draft: true
author: jpcercal@gmail.com
slug: jquery-a-diferenca-entre-bind-live-delegate-on
title: jQuery a diferença entre bind, live, delegate, on
date: 2013-02-01T04:07:20+00:00
description: "A biblioteca jQuery permite registrar eventos utilizando os seguintes métodos: bind, live, delegate, on. Conheça a diferença entre eles."
topics:
  - Artigos
  - Javascript
  - jQuery
  - Programação
tags: []
---

A biblioteca **jQuery** permite _registrar eventos_ utilizando os seguintes métodos: **bind**, **live**, **delegate**, **on**. Você sabe quando e onde utilizar? Conhece a diferença entre eles?

Se ainda, não conhece sugerimos a leitura deste artigo.

**BIND**

```js
// Attach a handler to an event for the elements.
.bind( eventType [, eventData ], handler(eventObject) )
.bind( eventType [, eventData ], preventBubble )
.bind( events )

// ----------------------------------------------
// Exemplo:

jQuery('#botao').bind('click' function() {
  // faz alguma coisa...
});
```

Registra os eventos nos elementos selecionados pela biblioteca **jQuery**. Permite registrar apenas os elementos que se encontram no _DOM_ inicialmente, ou seja, se você cria elementos usando _javascript_, _ajax_.. o **bind** não irá funcionar.

Veja o que diz a [documentação oficial do jQuery sobre o bind](http://api.jquery.com/bind/ "documentação oficial do jQuery sobre o bind").

**LIVE**

```js
// Attach an event handler for all elements which match
// the current selector, now and in the future.

.live( events, handler(eventObject) )
.live( events, data, handler(eventObject) )
.live( events )

// ----------------------------------------------
// Exemplo:

jQuery('#botao').live('click' function() {
  // faz alguma coisa...
});
```

Registra os eventos nos elementos selecionados pela biblioteca jQuery, diferentemente do **bind** (citado acima), o **live** permite registrar eventos para os elementos que serão carregados através de _ajax_ ou _javascript_. O negativo dessa abordagem é o desempenho, este método está deprecado e seu uso não é aconselhado pela documentação.

Veja o que diz a [documentação oficial do jQuery sobre o live](http://api.jquery.com/live/ "documentação oficial do jQuery sobre o live").

**DELEGATE**

```js
// Attach a handler to one or more events for all elements
// that match the selector, now or in the future, based on
// a specific set of root elements.

.delegate( selector, eventType, handler(eventObject) )
.delegate( selector, eventType, eventData, handler(eventObject) )
.delegate( selector, events )

// ----------------------------------------------
// Exemplo:

jQuery('#botao').delegate('a', 'click' function() {
  // faz alguma coisa...
});
```

O método delegate é semelhante ao **live** (citado acima), pois os elementos que são criados após o carregamento da página também respondem aos eventos. A diferença é que este não utiliza o document como elemento raiz, você mesmo escolhe o elemento raiz, casando-o com o seletor. Assim sendo, é clara a vantagem em desempenho deste método.

Veja o que diz a [documentação oficial do jQuery sobre o delegate](http://api.jquery.com/delegate/ "documentação oficial do jQuery sobre o delegate").

**ON**

```js
// Attach an event handler function for one or more
// events to the selected elements.

.on( events [, selector ] [, data ], handler(eventObject) )
.on( events [, selector ] [, data ] )

// ----------------------------------------------
// Exemplo:

// Estilo bind
jQuery('#botao').on('click' function() {
  // faz alguma coisa...
});

// Estilo delegate
jQuery('#botao').on('a', 'click' function() {
  // faz alguma coisa...
});
```

Se você utiliza uma versão do **jQuery** _superior a 1.7_, deverá utilizar sempre o método **on** (ele surgiu para substituir todas as outras funções), para as versões anteriores recomenda-se o uso do **bind** e **delegate**, como acabamos de ver.

Veja o que diz a [documentação oficial do jQuery sobre o on](http://api.jquery.com/on/ "documentação oficial do jQuery sobre o on").

É isso galera, se tiverem alguma dúvida quanto a utilização desses métodos ou algo a acrescentar deixe um comentário, ficaremos felizes em lhe responder.

**REFERÊNCIAS**

* [Documentação Oficial do jQuery](http://api.jquery.com/ "Documentação Oficial do jQuery")
