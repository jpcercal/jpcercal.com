---
draft: false
author: jpcercal@gmail.com
slug: how-to-delete-all-your-git-local-branches
title: Como remover todas as branches locais do Git
date: 2019-03-12T11:31:29+00:00
description: As vezes quando você trabalha por um certo tempo todas as branches locais ficam apenas ocupando espaço e te distraindo. Você pode conferir aqui um pequeno snippet para remover todas as branches locais do seu repositório Git.
categories:
  - other
tags: 
  - git
  - tutorial
  - howto
---

Bem, de tempos em tempos eu percebo que preciso limpar minhas branches locais, isto é parte do meu workflow e se você precisa ou quer fazer o mesmo, então poderia se beneficiar desse snippet abaixo:

```shell
$ git branch --list | \
egrep --invert-match "(master|gh-pages|\*)" | \
xargs git branch -D
```

Acredito que, o comando listado acima não precisaria de explicações, mas se você não entendeu o que está sendo feito, aqui está a explicação para cada um dos comandos executados:

- `git branch --list` lista todas as branches do seu repositório git local
- `egrep --invert-match "(master|gh-pages|\*)"` filtra as branches `master`, `gh-pages`, e a branch atual dos resultados
- `xargs git branch -D` deleta cada uma das branches listadas exceto as que foram filtradas no passo anterior

Fique à vontade para modificar o comando acima e até mesmo criar um alias para o tal, compartilhe comigo nos comentários se você modifica-lo ou tiver um jeito melhor de resolver esse problema. 

Espero que essa dica tenha sido útil, até a próxima.
