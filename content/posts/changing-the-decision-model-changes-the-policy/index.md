---
draft: false
author: jpcercal@gmail.com
slug: mudar-o-modelo-de-decisao-muda-a-politica
title: Mudar o modelo de decisão muda a política
date: 2026-10-11T00:00:00+00:00
description: Jev, Laya e Liquid d1 podem compartilhar o formato de uma requisição sem compartilhar um perfil de erros. Mudar o modelo exige revalidar os limiares, a carga de revisão e a implantação por trás da política da aplicação.
categories:
  - other
tags:
  - architecture
  - engineering
  - lessons-learned
---

Tenho lido a comparação da Vercel entre Jev, Laya e Liquid d1, e a parte útil para mim não é qual modelo vence.

O artigo não estabelece um vencedor.

Ele mostra que os três podem responder às mesmas perguntas tipadas por meio do AI Gateway. Isso facilita a comparação. Não nos diz se a aplicação deve agir sobre as respostas deles da mesma forma.

É essa distinção que eu manteria em mente antes de mudar um modelo em um sistema existente.

## A requisição pode continuar igual

Em [um post anterior]({{< relref path="posts/when-ai-decisions-become-software-inputs/index.en.md" lang="en" >}}), examinei o uso de uma avaliação tipada para encaminhar uma mensagem de suporte. A aplicação define as categorias, examina a incerteza e decide o que acontece em seguida.

A [comparação](https://vercel.com/i/jev-vs-laya-vs-liquid-d1) da Vercel aplica uma ideia semelhante a um catálogo de produtos.

Um anúncio descreve uma mochila com um compartimento para notebook e uma bolsa térmica para o lanche. A pergunta é o que está realmente sendo vendido, e não quais acessórios aparecem na descrição.

No AI Gateway, os identificadores dos modelos são `typesafe-ai/jev`, `convaiinnovations/laya` e `liquid/d1`. A interface compartilhada do AI SDK oferece suporte a perguntas Choice, Score e Boolean.

É um trabalho de integração útil que não precisamos repetir.

Mas compartilhar o formato de uma requisição não significa compartilhar um perfil de erros. Um modelo pode confundir uma capa para notebook com uma mochila. Outro pode enviar mais anúncios para revisão. Ambos podem retornar respostas válidas.

A interface facilita a organização do experimento. Não substitui o experimento.

## Um número familiar pode significar algo diferente

O detalhe que eu examinaria primeiro é o valor usado para decidir se uma resposta pode seguir adiante automaticamente.

O [contrato do AI SDK](https://ai-sdk.dev/docs/ai-sdk-core/decisions) torna as distribuições de probabilidade opcionais nas respostas Choice e Score. Se uma aplicação precisa da probabilidade da categoria selecionada, ela tem que verificar se a distribuição está presente.

Informação ausente não deve se transformar em certeza.

A confiança específica de cada provedor precisa de uma verificação separada. A [confiança de Choice](https://docs.typesafe.ai/confidence) da TypeSafe é calculada a partir da maior probabilidade e do número de opções. Com quatro opções e uma probabilidade máxima de `0.7`, a confiança é de `0.6`.

Um limiar de `0.65` aceitaria um valor e rejeitaria o outro.

Essa diferença existe antes mesmo de mudarmos de modelo.

Depois de uma mudança, manter o mesmo nome de campo e o mesmo limiar ainda não garante que aceitaremos a mesma proporção de respostas incorretas. O SDK não promete calibração entre provedores.

Eu trataria o limiar como parte da política da aplicação, testado com um modelo, uma pergunta e uma integração específicos. Não como uma configuração que se torna portátil porque a requisição compila.

## Onde ele roda faz parte do que testamos

Laya acrescenta outra consideração: checkpoints disponíveis para download e um servidor HTTP compatível com Jev oferecem um caminho para a hospedagem própria.

Isso importa se controlar o ambiente em que o modelo é servido for um requisito.

Também dá à equipe mais trabalho pelo qual se responsabilizar. Temos que escolher um checkpoint, testar os idiomas e os comprimentos das entradas que recebemos, e operar o processo de inferência e sua capacidade.

Chamar Laya por meio do AI Gateway avalia uma implantação hospedada. Não testa todos os checkpoints que poderíamos executar por conta própria.

Eu registraria a implantação junto com o nome do modelo. Caso contrário, dois resultados identificados como "Laya" poderiam descrever sistemas diferentes.

Hospedagem própria é uma opção a avaliar, não uma evidência de que o problema operacional desapareceu.

## Compare os casos que o fluxo de trabalho não pode deixar passar

O exemplo da mochila tem um rótulo esperado definido por uma pessoa. A Vercel diz explicitamente que não se trata de um resultado observado dos modelos.

De qualquer forma, um único anúncio claro não seria suficiente.

Eu começaria pelos casos de fronteira: uma capa para notebook vendida separadamente e anunciada como algo que cabe dentro de uma mochila, uma bolsa para lanche com alça de ombro e uma bolsa pequena cuja descrição não contém informação suficiente para classificá-la.

Antes dos testes, a regra do catálogo precisa dizer o que acontece com kits e produtos fora da taxonomia. Caso contrário, uma discordância pode revelar uma regra de negócio indefinida, e não uma falha do modelo.

Então eu compararia duas coisas em conjunto: as classificações incorretas entre os anúncios aceitos automaticamente e a proporção enviada para revisão.

Um modelo que parece mais seguro porque quase tudo chega a uma pessoa mudou a carga de trabalho, não necessariamente melhorou o fluxo.

Os limiares devem ser escolhidos com exemplos rotulados e avaliados em um conjunto separado. Requisições que falharam e distribuições ausentes devem continuar distinguíveis de uma resposta deliberada de `review`, mesmo que os três casos acabem precisando de atenção humana.

Essas distinções ajudam a entender o que precisa ser corrigido.

## Mude o modelo sem abrir mão da regra

Se Jev já atende aos requisitos da aplicação, eu o manteria como referência. Liquid d1 oferece outro candidato hospedado. Laya é relevante tanto para uma comparação hospedada quanto para investigar a hospedagem própria.

Eu não fiz uma avaliação comparativa desses modelos. O artigo da Vercel demonstra requisições compatíveis, não precisão ou velocidade superiores.

O próximo passo útil é menor que uma migração: manter as definições atuais, comparar os candidatos com trabalho sob nossa responsabilidade e examinar o que cada um aceitaria, rejeitaria ou deixaria sem resolver.

O modelo pode mudar.

A aplicação continua responsável pelas condições sob as quais a resposta do modelo se transforma em uma ação.

Qual limiar no seu sistema você revalidaria primeiro?
