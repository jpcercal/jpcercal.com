---
draft: true
author: jpcercal@gmail.com
slug: campos-customizados-no-painel-do-joomla
title: Campos Customizados no painel do Joomla
date: 2011-10-10T17:32:40+00:00
description: Aprenda a criar campos customizados para o painel do Joomla 1.6, para isto você deve extender uma classe do Joomla que seja descendente de JFormField.
categories:
  - Joomla
  - PHP
  - Programação
tags: []
---

Olá, hoje tive a necessidade de adicionar um campo personalizado no painel de administração do [Joomla](http://www.joomla.org/ "Joomla") 1.6 para uso de um componente que estava desenvolvendo, decidi compartilhar aqui em meu blog a _"receita do bolo"_.

Este tutorial foi desenvolvido tendo como base a [Documentação Oficial do Joomla](http://docs.joomla.org/Creating_a_custom_form_field_type "Documentação Oficial do Joomla").

Para criar um tipo de **campo customizado** para o _Joomla 1.6_ você deve criar uma classe que extenda de um tipo de campo já definido pelo próprio _Joomla_ (_media_, _text_, etc), ou então, a classe base para esta funcionalidade que é _"JFormField"_.

Os tipos de campos definidos pelo próprio _Joomla_ estão presentes no seguinte diretório:

* _joomla/libraries/joomla/form/fields/_

Iremos criar um campo específico para resgatar três cidades, para isso, crie um arquivo chamado _"cidade.php"_ dentro de _administrator/components/nome-do-seu-componente/models/fields/cidade.php_ e adicione o seguinte código:

O nome da classe deve ser prefixado com _"JFormField"_ seguindo do seu nome de arquivo físico que neste caso chama-se _"cidade.php"_, logo, o nome da classe será _"JFormFieldCidade"_ utilizando o padrão [CamelCase](http://sistemas.cekurte.com/blog/o-padrao-camelcase/ "O Padrão CamelCase").

Dois métodos podem ser implementados pela nossa classe _"Cidade"_, são eles:

* `getLabel()`
* `getInput()`

Ambos devem retornar um [HTML](http://sistemas.cekurte.com/blog/introducao-a-linguagem-html/ "Introdução a Linguagem HTML").

O método protegido `getLabel()` retornará o _label_ para o nosso campo customizado, ele em muitos casos não é necessário, pois a classe de que extendemos já escreve essa funcionalidade. Em contrapartida, o método _getInput()_, deve retornar o _html_ do campo, podendo ser por exemplo um _input_(_text_, _radio_, etc), ou _select_.

Veja como ficou nossa classe:

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

Dentro do seu código, você terá que processar os atributos definidos pelo usuário na definição do formulário **XML**. Alguns desses atributos são acessíveis através de variáveis membros protegidas de _JFormField_.

Por exemplo, o atributo _name_ está disponível em seu código da seguinte forma _$this->name_. Da mesma maneira está: _label_, _description_, _default_, _multiple_ e _class_.

Outros parâmetros que você pode ter definido podem ser acessados através de _$this->element_ sendo que este é um _array_, as chaves desse _array_ são associativas e recebem o nome da propriedade. Por exemplo o atributo _size_ seria acessado assim: _$this->element['size']_.

O seu _XML_ ficaria dessa forma:

```xml
<field name="cidade" type="cidade" label="Cidade" description="Cidades disponíveis" />
```
