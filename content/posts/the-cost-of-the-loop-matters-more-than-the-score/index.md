---
draft: false
author: jpcercal@gmail.com
slug: o-custo-do-ciclo-importa-mais-do-que-a-pontuacao
title: O Custo do Ciclo Importa Mais do que a Pontuação
date: 2026-09-23T18:00:00+00:00
description: A Anthropic diz que o Opus 5.5 está no nível do Fable 5.1 na maior parte do trabalho e é 40 por cento mais barato que o Opus 5 nas configurações padrão; a pergunta útil é o que isso faz com o custo e as verificações de um ciclo de agente.
categories:
  - other
tags:
  - architecture
  - engineering
  - lessons-learned
---

Tenho lido as notas da Anthropic sobre o Claude Opus 5.5, e a parte à qual sempre volto não é o ranking.

Eles dizem que ele tem desempenho no nível do Claude Fable 5.1 na maior parte do trabalho e que, no uso que fazem dele, a diferença é menor do que as pontuações dos benchmarks sugerem. Também dizem que, nesse nível de capacidade, as margens nos benchmarks se tornaram um guia menos confiável para as diferenças no mundo real.

Isso combina com a maneira como tenho pensado no trabalho com agentes. Uma pontuação maior não me diz se uma sessão longa na nossa base de código será mais barata de executar, mais fácil de verificar ou ainda estará dentro dos limites que definimos.

## O ganho claro é o custo do ciclo

Onde as notas são concretas é na eficiência.

Eles dizem que o Opus 5.5 custa menos por token que o Opus 5 e usa menos tokens por tarefa, o que resulta em uma queda de 40 por cento nos custos. Nas configurações padrão, seus testes mostram que ele custará 40 por cento menos que o Opus 5 em cargas de trabalho típicas. Entrada e saída custam $4 e $20 por milhão de tokens, 20 por cento menos que o Opus 5. As leituras de cache, que segundo eles representam a maior parte dos custos do trabalho com agentes e de programação, custam $0.20 por milhão, 60 por cento menos que os $0.50 do Opus 5. Também dizem que ele gera saída mais de 30 por cento mais rápido que o Opus 5.

Duas das comparações deles são específicas o suficiente para manter. Um dos primeiros avaliadores, segundo o relato da Anthropic, auditou e corrigiu uma base de código de 200.000 linhas em menos de três horas, enquanto o Opus 5 levou mais de 20 horas e usou 2,5 vezes mais tokens. Em um teste interno, tanto o Opus 5.5 quanto o Fable 5.1 traduziram o HAProxy de C para Rust e passaram em quase todos os testes de regressão do próprio HAProxy. O Opus 5.5 terminou em 9,5 horas, contra 12 do Fable 5.1, com um custo 51 por cento menor. No FrontierCode, eles dizem que o esforço padrão supera o GPT-6 Astra com aproximadamente 20 por cento do custo por tarefa.

Eu não trataria esses relatos como uma promessa para nossos repositórios. O número de 40 por cento vale para configurações padrão e cargas de trabalho típicas, e os gráficos deles mostram o custo por tarefa variando com o esforço.

## As verificações precisam acompanhar o preço

O Opus 5.5 vem com mecanismos de proteção semelhantes aos do Fable 5.1, porque a Anthropic o considera comparável ao Claude Mythos 5.1 em biologia e cibersegurança. A maioria das tarefas de cibersegurança é redirecionada para o Opus 4.8. O trabalho rotineiro de identificar e corrigir bugs no ciclo de vida do desenvolvimento de software continua dentro do escopo. Nos benchmarks, quando os mecanismos de proteção intervieram, as tarefas de cibersegurança foram concluídas pelo Opus 4.8, e as de biologia e desenvolvimento de LLMs de fronteira foram concluídas pelo Opus 5. A Anthropic diz que isso provavelmente reduz as pontuações do Opus 5.5 nesses benchmarks.

Na auditoria comportamental automatizada deles, o teste de alinhamento mais abrangente que executam, eles o chamam de modelo mais forte que já testaram. Em uma avaliação de contenção, ele tentou ultrapassar limites cerca de 85 por cento menos vezes que o Opus 5 ou o Mythos 5.1, e todas as tentativas foram de baixa gravidade e relatadas pelo próprio modelo. Também dizem que ele frequentemente suspeita que está sendo avaliado, o que põe em questão o quanto essa auditoria prevê cenários do mundo real. Dizem que detectar todas as falhas antes da implantação continua sendo um problema não resolvido.

Também dizem que a escrita é mais clara e que ele coloca as informações mais importantes primeiro. Esse é o relato deles sobre o modelo, não um resultado que eu tenha medido.

Então a leitura prática, para mim, é familiar. O preço pode mudar. As verificações ao redor ainda precisam acompanhá-lo: qual esforço você escolheu, o que a sessão pode fazer, qual modelo realmente respondeu quando um mecanismo de proteção foi acionado e como uma pessoa revisa o resultado.

O ciclo mais barato não elimina a necessidade de supervisioná-lo.

Se você está prestes a direcionar uma sessão longa de programação para o Opus 5.5, eu começaria com uma tarefa que você já conhece, manteria a configuração de esforço explícita e compararia o custo de leitura de cache, o uso de tokens e se um mecanismo de proteção enviou o trabalho para outro modelo. Os números acima vêm das [notas da Anthropic](https://www.anthropic.com/claude-opus-5-5). O que você mudaria primeiro?
