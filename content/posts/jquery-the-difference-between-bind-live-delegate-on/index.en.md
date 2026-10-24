---
draft: false
author: jpcercal@gmail.com
slug: jquery-the-difference-between-bind-live-delegate-on
title: jQuery the difference between bind, live, delegate, on
date: 2013-02-01T04:07:20+00:00
description: "The jQuery library lets you register events using the following methods: bind, live, delegate, on. Learn the difference between them."
categories:
  - engineering
tags:
  - javascript
  - jquery
---

The **jQuery** library lets you _register events_ using the following methods: **bind**, **live**, **delegate**,
**on**. Do you know when and where to use them? Do you know the difference between them?

If you don't yet, we suggest reading this article.

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

Registers events on the elements selected by the **jQuery** library. It only allows registration on elements
initially present in the _DOM_, meaning that if you create elements using _javascript_, _ajax_.. **bind** won't
work.

See what the [official jQuery documentation says about bind](http://api.jquery.com/bind/ "Official jQuery documentation about bind").

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

Registers events on the elements selected by the jQuery library, unlike **bind** (mentioned above),
**live** lets you register events for elements that will be loaded through _ajax_ or _javascript_. The
downside of this approach is performance, this method is deprecated and its use is not recommended by the documentation.

See what the
[official jQuery documentation says about live](http://api.jquery.com/live/ "Official jQuery documentation about live").

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

The delegate method is similar to **live** (mentioned above), because elements created after the page
loads also respond to events. The difference is that it doesn't use document as the root element, you
choose the root element yourself, matching it with the selector. So this method's performance advantage is clear.

See what the
[official jQuery documentation says about delegate](http://api.jquery.com/delegate/ "Official jQuery documentation about delegate").

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

If you use a **jQuery** version _higher than 1.7_, you should always use the **on** method (it was introduced to
replace all the other functions), for earlier versions the use of **bind** and **delegate** is recommended, as
we've just seen.

See what the
[official jQuery documentation says about on](http://api.jquery.com/on/ "Official jQuery documentation about on").

That's it folks, if you have any questions about using these methods or anything to add, leave a comment,
we'll be happy to reply.

**REFERENCES**

* [Official jQuery Documentation](http://api.jquery.com/ "Official jQuery Documentation")
