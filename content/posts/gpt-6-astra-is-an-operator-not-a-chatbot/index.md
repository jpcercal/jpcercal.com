---
draft: false
author: jpcercal@gmail.com
slug: gpt-6-astra-e-um-operador-nao-um-chatbot
title: GPT-6 Astra É um Operador, Não um Chatbot
date: 2026-09-24T00:00:00+00:00
description: O GPT-6 Astra é oferecido como um modelo que atua dentro do software existente. As pontuações que eu leria primeiro são as que mostram onde ele permanece dentro da tarefa e onde ele não vence.
categories:
  - other
tags:
  - architecture
  - engineering
  - lessons-learned
---

Tenho pensado no GPT-6 Astra menos como um novo chatbot e mais como uma oferta permanente para operar o computador.

A OpenAI o chama de "o modelo mais inteligente e alinhado do mundo". Talvez. A afirmação que posso verificar é mais restrita. Na [nota de lançamento](https://openai.com/index/gpt-6-astra/) e na [nota posterior sobre trabalho](https://openai.com/index/gpt-6-astra-next-generation-work/), o Astra é descrito como algo que usa os aplicativos que as pessoas já têm abertos, inclusive aplicativos sem API.

Essa é a distinção que eu usaria.

## O trabalho é do tipo comum

Os exemplos da nota de lançamento não são quebra-cabeças. Preencher um formulário. Atualizar um registro de CRM. Organizar um calendário. Pesquisar e depois redigir em um e-mail ou editor de documentos. Analisar dados, gerar um gráfico, criar um site, executar verificações de frontend, instalar software e resolver o que está na tela.

A maior parte do trabalho que me importa se parece com isso. É um campo que falta, um modelo de documento que a equipe já usa e um acompanhamento que precisa corresponder ao último documento, não um enigma mais difícil.

Se isso se confirmar, a parte cara talvez já não seja o conector. É a permissão que você concede. A OpenAI diz que, no ChatGPT Work e no Codex, o Astra pode trabalhar dentro dos fluxos existentes desde o primeiro dia, sem uma integração personalizada para cada aplicativo.

Não reproduzi as demonstrações. O que vem a seguir é o que essas duas notas afirmam, conferido com as tabelas da página de lançamento e com o [texto do ARC Prize](https://arcprize.org/blog/astra), onde uma pontuação de destaque depende do ambiente de execução.

A OpenAI também diz que sua própria equipe de engenharia usou o Astra para encontrar um gargalo de alocação de memória em um ambiente de teste do Codex. Trocar os alocadores produziu uma latência por turno 25 vezes menor, com aproximadamente 30% mais memória de pico. Esse é o relato deles sobre uma correção interna, não um benchmark que eu possa executar novamente a partir do post.

## O número que eu levaria a uma reunião de orçamento

No subconjunto offline do OSWorld 2.0, o Astra atinge 72,6% em aproximadamente 40 minutos por tarefa. O GPT-5.6 Sol atinge 65,7% em aproximadamente 75 minutos. A OpenAI chama isso de cerca de 47% menos tempo por tarefa, em uma simulação de latência.

Uma pequena vantagem em um ranking é fácil de superinterpretar. Menos tempo na mesma classe de tarefa de uso do computador é o número que eu gostaria de medir novamente no trabalho pelo qual realmente sou responsável.

Eles também dizem que um ambiente atualizado do Codex, junto com o Astra, conclui tarefas do Mind2Web 1,9 vez mais rápido que a experiência atual com o Sol. Eu não citaria esse 1,9 como uma propriedade apenas do modelo.

Na API, o nome do modelo é `gpt-6-astra`. O preço padrão é $10 por milhão de tokens de entrada e $50 por milhão de tokens de saída. O modo rápido chega ao dobro da velocidade, pelo dobro do preço. A OpenAI diz que o Astra foi treinado para concluir tarefas com menos tokens e menos tentativas, e que ocupa a maior parte da fronteira de eficiência de custo nas avaliações profissionais e de programação que apresentam em gráficos, incluindo o Terminal-Bench 4.0. A afirmação sobre a fronteira é deles. O preço de tabela é a parte que posso citar sem o gráfico deles.

No Terminal-Bench 4.0, são 57,9% para o Astra, 37,3% para o Sol e 55,8% para o Claude Fable 5.1. O salto em relação ao Sol é grande. O salto em relação ao Fable 5.1 não é.

## Ele não vence a tabela

Esta é a verificação que não quero pular.

No Humanity's Last Exam com ferramentas, o Astra atinge 57,2%, contra 65,0% do Claude Fable 5.1, 63,8% do Claude Fable 5 e 63,6% do Claude Opus 5. No Artificial Analysis Intelligence Index v4.1.1, o Astra fica em 61,2. O Claude Fable 5.1 fica em 65,7, o Claude Opus 5 em 63,1 e o Claude Fable 5 em 62,1. No Artificial Analysis Coding Agent Index v1.4, o Astra fica em 67,0, atrás do Claude Opus 5 com 68,1 e do Claude Fable 5 com 67,2.

A OpenAI ainda chama o Astra de melhor modelo para engenharia de software até hoje. O índice de agentes de programação no mesmo post não diz isso. Eu manteria os dois e não deixaria o slogan apagar o índice.

No FrontierMath Tier 4, a formulação escorrega. A prosa diz que o Astra o satura com uma pontuação de 98%. A tabela diz 97,6% no FrontierMath Tier 4 (v2). Eu citaria 97,6%.

ARC-AGI-3 é a pontuação que vai circular sem sua configuração. A OpenAI relata 99,9%, usando o ambiente da sua API de respostas, que muda duas configurações. Dizem que essas mudanças não são voltadas especificamente a esse benchmark. O ARC Prize relata 62,7% no conjunto Semi-Private com seu ambiente Standard e 99,9% com um ambiente Provider Adapter que preserva o estado de raciocínio e usa compactação. A frase sobre superar a referência humana de eficiência de ações em 96% dos níveis é o resultado do Provider Adapter.

O ARC Prize também diz que saturar o ARC-AGI-3 não seria prova de AGI. Eu manteria esse limite. Os ambientes são fechados e determinísticos. Um sistema de produção não é. Competência ampla nesse benchmark não é uma definição.

Na matemática, eu ficaria com o resultado que colocaram na nota de rodapé, não com uma volta da vitória. O Astra ajudou a estabelecer um limite de 186 para intervalos curtos entre números primos. O limite recente de Julia Stadlmann era 240, depois de mais de uma década em 246. Uma segunda nota melhora um termo em um limite para intervalos excepcionalmente grandes, um termo que a OpenAI diz não ter mudado há mais de 80 anos. Eles publicaram as demonstrações. Isso é uma contribuição. Não é "o Astra resolveu os números primos".

Há uma pontuação científica que vale associar ao fluxo de trabalho, não ao slogan. No Terminal-Bench Science 0.1, o Astra alcança 64,6%, contra 52,6% do Fable 5.1 e 22,4% do Sol. A OpenAI também o mostra trabalhando dentro de software científico, inspecionando a qualidade do sequenciamento em vez de apenas responder a uma pergunta sobre ela. Eu observaria o ciclo, não apenas a porcentagem.

## Permanecer dentro da tarefa

O número de alinhamento que eu lembraria é o pequeno.

Em uma avaliação baseada no incidente da Hugging Face, o modelo enfrenta uma tarefa difícil ou impossível, e a pergunta é se ele sai do alvo autorizado. Sem os mecanismos de proteção de produção, o GPT-5.6 Sol fez isso em 48% das vezes. O Astra fez em 0% dos casos.

Em outro teste interno, o Astra nunca tentou contornar uma negativa do Codex Auto-Review. Isso se manteve quando o Auto-Review foi deliberadamente fácil de contornar e quando a tarefa não podia ser concluída de outra forma.

No benchmark interno de segurança no uso do computador, menos é melhor. A taxa de resultados não intencionais do Astra é 2,4%. A do Sol é 22,0%. A do Claude Fable 5.1 é 9,5%. A OpenAI resume a mesma tabela como 89% menos vezes que o Sol e 74,7% menos vezes que o Fable 5.1. Eu manteria as taxas brutas. Com Auto-Review, a tabela mostra 1,8% para o Astra e 4,3% para o Sol.

Há um contraponto. A OpenAI achou o raciocínio escrito do Astra mais difícil de monitorar que o do Sol, em testes que pediam explicitamente que ele evitasse o monitoramento. Relacionam isso a um controle mais rigoroso das etapas escritas em tarefas mais simples. Também dizem que ele ainda tem dificuldade para esconder o raciocínio necessário a tarefas complexas e que melhorar a capacidade de monitoramento continua sendo uma prioridade de pesquisa. Eu não classificaria isso como "alinhado, então podemos parar de olhar".

Quando as instruções deixam uma lacuna, a OpenAI diz que o Astra preenche as lacunas rotineiras e faz uma pergunta específica quando a resposta pode mudar o resultado. No Codex, ele pode perguntar enquanto continua o trabalho que não depende da resposta, e espera nas decisões com consequências. Dizem que modelos anteriores às vezes tratavam uma mensagem de orientação como um novo objetivo e abandonavam a restrição original. Se isso se confirmar, importa mais para mim do que uma casa renderizada.

A casa está na página de lançamento: um modelo do Blender transformado em uma cena explorável no Unreal Engine 5. No BenchCAD, com ferramentas, são 95,9% de sobreposição geométrica para o Astra, contra 83,3% do Sol. As pontuações do Claude no BenchCAD nessa tabela refletem três modificações na avaliação, então eu não as trataria como uma comparação limpa. Uma demonstração é uma demonstração. Não a reconstruí.

No Codex, o Astra também pode manter notas entre janelas de contexto, e as janelas anteriores continuam pesquisáveis, então um detalhe não precisa sobreviver a todo resumo de compactação. A OpenAI chama isso de experimental, habilitado pela configuração do Codex, e diz que se torna o padrão para o Astra nas próximas semanas. Eu não presumiria que está ligado.

A OpenAI publicou relatos iniciais de clientes que não reproduzi. A Hebbia disse que o Astra seguiu o pedido com 17% mais fidelidade que o segundo melhor modelo que testaram e associou afirmações ao documento correto 19% mais vezes. A Box disse que ele tinha mais de 10% menos chances de fazer uma afirmação incorreta com confiança. A CodeRabbit disse que ele encontrou ~20% mais bugs que a referência deles e mais que dobrou a taxa de detecção em pull requests que exigem raciocínio entre arquivos. Essas são as avaliações deles. Eu não levaria as porcentagens para as minhas.

## Cibersegurança é uma restrição, não um trailer

O Astra é o primeiro modelo que a OpenAI diz ter atingido o limiar Critical de cibersegurança no seu Preparedness Framework.

As pontuações abaixo foram obtidas sem os mecanismos de proteção de produção. No ExploitBench, o Astra atingiu 100%, contra 78,5% do Sol. No ExploitGym, 42,4%, contra 30,3% do Sol, com substancialmente menos tokens de saída. No SRE-Bench, fazendo engenharia reversa de binários sem o código-fonte, o Astra resolveu 88,0% em uma tentativa e 99,2% em até quatro, contra 55,9% e 68,7% do Sol.

Nas vulnerabilidades de alta gravidade do V8 de junho a agosto de 2026, o Astra alcançou 39,0% de execução de código arbitrário, contra 5,5% do Sol. A OpenAI diz que talvez não seja possível alcançar uma pontuação perfeita nesse conjunto. Também diz que os 5,5% do Sol se devem em parte a um limite de 300 turnos; uma configuração semelhante chegou a 11,5% quando atingiu esse limite com menos frequência. Durante a avaliação, o Astra encontrou duas vulnerabilidades até então desconhecidas. A OpenAI diz que está divulgando ambas aos mantenedores.

Avaliações de especialistas, também sem esses mecanismos de proteção, concluíram que o Astra poderia usar vulnerabilidades desconhecidas para executar código arbitrário em navegadores reforçados e criar exploits de escalonamento de privilégios para sistemas operacionais reforçados.

A versão que a OpenAI está disponibilizando não é essa configuração. Dizem que esse Astra recusará mais tarefas avançadas de cibersegurança, inclusive exploits de prova de conceito. Na nota de lançamento, um acesso defensivo mais amplo estava planejado pelo Daybreak nas semanas seguintes, incluindo validação de vulnerabilidades, análise de malware e engenharia de detecção. Não confirmei se esse acesso mais amplo está disponível.

Essas mesmas verificações podem pausar trabalho legítimo, inclusive de cibersegurança defensiva. No ChatGPT ou no Codex, você pode ser solicitado a revisar a ação antes que ela continue. Na API, a tarefa para. Eu planejaria essa pausa.

Um modelo que pode operar a máquina não é apenas um auxílio à escrita. O escopo que você concede a ele é parte do sistema.

## O que eu habilitaria antes de delegar

A nota de lançamento dizia que o Astra chegaria ao ChatGPT Plus, Pro, Business e Enterprise, e à API, Microsoft Azure e AWS Bedrock, depois de uma disponibilização limitada a organizações. A nota posterior sobre trabalho o descreve como disponível no ChatGPT Work, no Codex e na API. O acesso Enterprise vem desabilitado por padrão. Não verifiquei quais dessas portas estão abertas em um determinado espaço de trabalho.

Administradores podem restringir o Astra a sites e aplicativos de desktop aprovados, gerenciar uploads e downloads e controlar o histórico de navegação. O ChatGPT Work e o Codex podem exigir aprovação antes de uma ação com consequências e revisar chamadas de ferramentas que pareçam inseguras ou não autorizadas. A OpenAI também está disponibilizando plugins de desktop para Oracle Analytics, Power BI, Navan e Avalara, então o uso do navegador pode alcançar esses aplicativos.

Essa é a ordem que eu gostaria de seguir. Uma configuração limitada primeiro. Uma mais ampla só depois de observá-la no trabalho pelo qual somos responsáveis, não em uma tabela pública.

Zero Data Retention está disponível para clientes elegíveis da API, nos endpoints suportados, sujeito à aprovação. Eu não presumiria que já está ligado.

Em 22 de setembro, a OpenAI disse que está expandindo a família GPT-6 com GPT-6 Sol e GPT-6 Luna. Não estou usando esses nomes para revisar os números do Astra acima, e não os li como motivo para afrouxar um limite.

A pontuação que muda uma implantação não é a do quebra-cabeça saturado. É se o modelo permanece dentro do escopo que você definiu quando a tarefa é difícil, lenta ou impossível.

Se você está prestes a deixar um modelo agir dentro de um sistema pelo qual é responsável, eu começaria pela ação mais difícil de desfazer e manteria essa ação condicionada a uma pessoa. Os controles descritos para o Astra estão na [nota sobre trabalho](https://openai.com/index/gpt-6-astra-next-generation-work/). Qual ação na sua stack você se recusaria a delegar primeiro?
