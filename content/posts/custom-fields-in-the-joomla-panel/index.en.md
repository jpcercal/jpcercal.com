---
draft: false
author: jpcercal@gmail.com
slug: custom-fields-in-the-joomla-panel
title: Custom Fields in the Joomla panel
date: 2011-10-10T17:32:40+00:00
description: Learn to create custom fields for the Joomla 1.6 panel, to do this you must extend a Joomla class that descends from JFormField.
categories:
  - php
tags: 
  - cms
  - joomla
---

Hello, today I needed to add a custom field to the
[Joomla](http://www.joomla.org/ "Joomla") 1.6 administration panel for a component I was developing, and decided to share
the _"recipe"_ here on my blog.

This tutorial was developed based on the
[Official Joomla Documentation](http://docs.joomla.org/Creating_a_custom_form_field_type "Official Joomla Documentation").

To create a **custom field** type for _Joomla 1.6_, you must create a class that extends a field type
already defined by _Joomla_ itself (_media_, _text_, etc), or else the base class for this functionality,
which is _"JFormField"_.

The field types defined by _Joomla_ itself are in the following directory:

* _joomla/libraries/joomla/form/fields/_

We'll create a specific field to retrieve three cities, to do this, create a file called _"cidade.php"_ inside
_administrator/components/nome-do-seu-componente/models/fields/cidade.php_ and add the following code:

The class name should be prefixed with _"JFormField"_ followed by the physical file name, which in this case is
_"cidade.php"_, so the class name will be _"JFormFieldCidade"_ using the
[CamelCase]({{< ref "posts/the-camelcase-convention/index.md" >}} "The CamelCase Convention") convention.

Two methods can be implemented by our _"Cidade"_ class, they are:

* `getLabel()`
* `getInput()`

Both should return [HTML]({{< ref "posts/introduction-to-html/index.md" >}} "Introduction to HTML").

The protected `getLabel()` method will return the _label_ for our custom field, in many cases it isn't
needed because the class we extend already implements this functionality. On the other hand, the _getInput()_ method
should return the field's _html_, which could be an _input_ (_text_, _radio_, etc), or a _select_, for example.

See how our class turned out:

```php
<?php

// Importa a classe JFormField, da qual iremos extender
jimport('joomla.form.formfield');

class JFormFieldCidade extends JFormField
{
  // O valor da propriedade $type deve conter
  // o sufixo da classe nesse caso "Cidade"
  protected $type = 'Cidade';

  protected function getInput()
  {
    return '<select name="'.$this->name.'">'.
      '<option value="1" >Joinville</option>'.
      '<option value="2" >São Francisco do Sul</option>'.
      '<option value="3" >Itajaí</option>'.
      '</select>'
    ;
  }
}
?>
```

Within your code, you'll have to process the attributes defined by the user in the **XML** form definition.
Some of these attributes are accessible through protected member variables of _JFormField_.

For example, the _name_ attribute is available in your code as _$this->name_. The same goes for:
_label_, _description_, _default_, _multiple_ and _class_.

Other parameters you may have defined can be accessed through _$this->element_, which is an
_array_, the keys of this _array_ are associative and take the property's name. For example, the _size_ attribute
would be accessed like this: _$this->element['size']_.

Your _XML_ would look like this:

```xml
<field name="cidade" type="cidade" label="Cidade" description="Cidades disponíveis" />
```
