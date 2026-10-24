---
draft: false
author: jpcercal@gmail.com
slug: quando-decisoes-de-ia-se-tornam-entradas-de-software
title: Quando Decisões de IA se Tornam Entradas de Software
date: 2026-09-23T00:00:00+00:00
description: Um julgamento tipado de IA pode ajudar o software a encaminhar trabalho, desde que a aplicação controle as regras, verifique a incerteza e mantenha as pessoas responsáveis por decisões com consequências.
categories:
  - ai
tags:
  - architecture
  - engineering
  - lessons-learned
---

Tenho pensado no que o software realmente precisa quando pergunta a um sistema de IA para onde enviar uma solicitação.

Geralmente não é mais um parágrafo. É uma resposta que ele possa inspecionar: uma categoria conhecida, uma indicação de incerteza e uma regra para o que acontece em seguida.

Considere uma mensagem de suporte: “Fui cobrado duas vezes, e a página do recibo não carrega.” Uma explicação em formato livre pode ajudar uma pessoa, mas a aplicação ainda precisa decidir qual fila recebe a mensagem. Extrair da prosa o nome de uma fila acrescenta mais um ponto em que o fluxo de trabalho pode falhar.

## Restrinja o julgamento

Jev (por exemplo, TypeSafe AI System One, um modelo de decisão, não um modelo de chat) oferece três tipos de pergunta para avaliar o estado fornecido. **Choice** seleciona uma opção de um conjunto definido por quem faz a chamada e retorna probabilidades para as opções. **Noul** responde a uma pergunta de sim ou não com um valor de zero a um que representa a probabilidade de sim, sem um campo separado de confiança. **Score** avalia o estado segundo uma rubrica ordenada e retorna uma pontuação ponderada pelas probabilidades. São maneiras diferentes de pedir um julgamento delimitado, em vez de uma explicação aberta. Os detalhes estão na introdução, no guia de início rápido e na documentação de Choice, Noul, Score e confiança.

Para a mensagem de suporte, a aplicação poderia fazer uma pergunta Choice. A estrutura abaixo segue a API de avaliação (`state` mais `questions`, enviados ao endpoint do System One com `model: jev-latest`); o identificador da pergunta é seu e não é enviado ao modelo:

```json
{
  "model": "jev-latest",
  "state": "I was charged twice, and the receipt page will not load.",
  "questions": {
    "queue": {
      "type": "choice",
      "instructions": "Which team should inspect this message first?",
      "criteria": {
        "billing": "Charges, payments, and receipts",
        "technical": "Site errors and unavailable pages",
        "other": "Neither category clearly applies"
      }
    }
  }
}
```

A estrutura da solicitação segue a API de avaliação do Jev (`state` fornece o material a julgar, e a pergunta nomeada define as respostas permitidas). A resposta tem um objeto `answers.queue` com `type`, `choice`, `probabilities` e `confidence`. Sua estrutura, mostrada aqui como um esboço de tipos e não como resultado de uma chamada real, é:

```ts
answers.queue = {
  type: "choice",
  choice: "billing" | "technical" | "other",
  probabilities: {
    billing: number,
    technical: number,
    other: number
  },
  confidence: number
}
```

A probabilidade de uma opção e o campo `confidence` são valores separados. A confiança é derivada de como a distribuição se espalha; um único pico significa alta confiança, uma divisão uniforme significa baixa confiança. A aplicação pode inspecionar a distribuição completa, em vez de tratar a categoria selecionada como um retrato completo da incerteza. A mensagem deste exemplo envolve tanto cobrança quanto um erro de página, então um caminho de revisão é útil quando a classificação é ambígua.

## Coloque o fluxo de trabalho no código

A aplicação pode validar se a resposta contém uma categoria permitida e probabilidades utilizáveis. Depois pode fazer o desvio com código simples e sem analisar prosa:

```python
if queue.confidence < 0.5:
    send_to_review(message)
elif queue.choice == "billing":
    assign(message, team="billing")
else:
    assign(message, team=queue.choice)
```

Uma classificação clara e de baixo impacto vai para uma fila, e os casos incertos vão para revisão. Também deve ser definido o que acontece quando a API falha ou retorna uma resposta inutilizável. Essas são decisões da aplicação, não decisões delegadas ao modelo.

Um limiar pode ajudar a decidir quando revisar, mas deve vir de testes com as mensagens da própria aplicação e do custo dos erros de encaminhamento. Alta confiança pode levar a uma ação automática, confiança média pode pedir confirmação ou sinalização, baixa confiança deve encaminhar para uma pessoa. Uma probabilidade não é prova de que uma determinada resposta está correta. Uma resposta tipada pode ser perfeitamente válida e ainda assim colocar uma mensagem na fila errada.

Algumas decisões nunca deveriam ser deixadas a esse julgamento. Se uma regra diz que um reembolso acima de um valor fixo precisa de aprovação, a aplicação deve comparar o valor em código determinístico e manter a etapa irreversível condicionada à aprovação humana. Jev pode ajudar a identificar o assunto de uma mensagem, mas não deve substituir uma verificação exata de política. Para ações com consequências, o fluxo de trabalho deve preservar a revisão humana apropriada antes de qualquer coisa acontecer.

O sistema ao redor pode sustentar o que o modelo não consegue.

Se você encaminha trabalho com julgamentos tipados, coloquei no desvio em Python acima a verificação exata que faço para classificações ambíguas. O que você mudaria primeiro?
