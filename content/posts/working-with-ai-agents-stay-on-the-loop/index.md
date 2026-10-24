---
draft: false
author: jpcercal@gmail.com
slug: trabalhando-com-agentes-de-ia-supervisione-o-ciclo
title: "Trabalhando com Agentes de IA: Supervisione o Ciclo"
date: 2026-09-13T00:00:00+00:00
description: Em vez de revisar cada linha que um agente de IA produz, projete o ambiente — especificações, testes, verificações e ciclos de feedback — para que bons resultados surjam de forma confiável.
categories:
  - engineering
tags:
  - ai
  - architecture
  - lessons-learned
---

Tenho pensado recentemente em como nosso papel como engenheiros de software muda quando agentes de IA passam a fazer parte do processo de desenvolvimento.

Parece haver uma escolha tentadora entre dois extremos.

Ou deixamos o agente cuidar de tudo e confiamos no resultado, ou continuamos envolvidos em cada etapa, revisando cada trecho de código que ele produz.

Não acho que qualquer uma dessas abordagens escale particularmente bem.

## O que é produzido não é o processo inteiro

Ao construir software, muitas vezes nos concentramos bastante nos artefatos que produzimos: código, testes, projetos técnicos, configuração e documentação.

Mas eles são, na verdade, etapas intermediárias em direção a outra coisa.

O que realmente nos importa é o resultado: software funcionando, que se comporte corretamente, tenha bom desempenho, seja seguro e resolva o problema que pretendíamos resolver.

Essa distinção se torna particularmente interessante com agentes de IA.

Um agente pode produzir código muito mais rápido do que uma pessoa consegue inspecioná-lo linha por linha. Se nosso processo depende de um desenvolvedor validar manualmente cada pequena decisão do agente, simplesmente mudamos o gargalo de lugar.

O agente pode ser mais rápido na produção de código, mas o sistema como um todo não é necessariamente mais rápido.

## Dentro do ciclo vs. na supervisão do ciclo

Uma maneira útil de pensar nisso é a diferença entre estar **dentro do ciclo** e estar **na supervisão do ciclo**.

Estar dentro do ciclo significa revisar e corrigir os artefatos individuais produzidos pelo agente.

Estar na supervisão do ciclo significa projetar o ambiente em que o agente opera.

Esse ambiente pode incluir:

* especificações claras
* restrições arquiteturais
* testes
* análise estática
* verificações de segurança
* validação da implantação
* documentação
* feedback de execuções anteriores

Em vez de corrigir manualmente cada problema, melhoramos os mecanismos que ajudam o agente a detectar e evitar esses problemas.

Isso está diretamente relacionado à discussão recente de Martin Fowler sobre pessoas e agentes nos ciclos de engenharia de software. Ele descreve isso como pessoas gerenciando o ciclo do "como", em vez de microgerenciar cada resultado intermediário.

## O problema de engenharia se torna diferente

Isso muda o que considero um problema de engenharia interessante.

Em vez de perguntar:

> "Como faço a IA escrever código melhor?"

Podemos começar a perguntar:

> "Como projeto um sistema em que a IA possa produzir bons resultados de forma confiável?"

Essa é uma pergunta muito diferente.

Ela nos leva de volta a conceitos familiares de engenharia: ciclos de feedback, restrições, observabilidade, testes, tratamento de falhas e melhoria contínua.

A tecnologia é nova.

Os princípios de engenharia não são.

E talvez essa seja uma das partes mais interessantes de trabalhar com agentes de IA: não estamos substituindo a engenharia de software por algo completamente diferente.

Estamos aplicando princípios de engenharia de software a um novo tipo de participante no processo de desenvolvimento.
