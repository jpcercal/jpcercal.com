---
draft: false
author: jpcercal@gmail.com
slug: um-waf-nao-e-um-patch
title: "Um WAF Não É um Patch"
date: 2026-10-22T00:00:00+00:00
description: Um firewall de aplicações web ganha tempo e visibilidade, mas não remove a vulnerabilidade. O que um WAF e o patch virtual fazem e não fazem, e o que as equipes de engenharia ainda devem.
categories:
  - engineering
tags:
  - security
  - architecture
  - devops
---

Uma CVE crítica é divulgada. Alguém pergunta no chat da equipe se estamos expostos, e a primeira resposta é "temos um WAF, estamos cobertos".

Entendo o reflexo. O WAF é uma das formas mais rápidas de reagir, e eu não gostaria de operar uma aplicação pública sem um. Mas a frase mistura duas coisas diferentes. Um WAF muda a chance de um atacante alcançar um bug. Um patch remove o bug. Quando o primeiro é tratado como o segundo, uma ponte temporária vira, sem alarde, infraestrutura permanente.

## No que um WAF é bom

Um WAF inspeciona as requisições HTTP antes de chegarem à aplicação e decide o que fazer com elas: bloquear, desafiar, limitar a taxa ou registrar. Isso dá muito. Ele absorve o ruído de scanners e bots, oferece um ponto central de logs e visibilidade, e permite publicar uma regra emergencial na borda em minutos, em vez de distribuir uma versão por toda a frota.

Essa velocidade é o valor real. O [Virtual Patching Cheat Sheet da OWASP](https://cheatsheetseries.owasp.org/cheatsheets/Virtual_Patching_Cheat_Sheet.html) descreve o objetivo como minimizar o tempo até a correção, bloqueando o caminho de exploração conhecido enquanto uma correção permanente é preparada. Se você está exposto numa terça à tarde e o patch do fornecedor precisa de testes, o patch virtual é a primeira jogada certa.

## O que um patch virtual não faz

A mesma página da OWASP é direta sobre o limite. Um patch virtual bloqueia a exploração sem alterar o código vulnerável e, portanto, "não remove a vulnerabilidade subjacente". Ela também afirma que corrigir o código-fonte é a estratégia de remediação número um, e que os dois esforços não são mutuamente exclusivos: correm em paralelo, geralmente com times diferentes. Um único teste de payload bem-sucedido, acrescenta, não estabelece proteção completa.

Os fornecedores que vendem isso dizem o mesmo. A F5 escreve que o patch virtual [não substitui o patch real, mas é uma camada essencial que dá tempo a você e às suas equipes de desenvolvimento](https://www.f5.com/company/blog/virtual-patching-in-practice-with-f5-big-ip-advanced-waf-and-distributed-cloud-web-app), e que ele pode ser contornado se as regras forem incompletas. A [visão geral de patch virtual](https://www.f5.com/solutions/use-cases/virtual-patching) da empresa é igualmente direta: não substitui a correção do código, e os dois trabalham juntos. O próprio [texto explicativo sobre WAF](https://www.cloudflare.com/learning/ddos/glossary/web-application-firewall-waf/) da Cloudflare observa que um WAF não foi feito para defender contra todos os tipos de ataque e normalmente faz parte de um conjunto de ferramentas. Também aponta que um WAF baseado em lista de bloqueio só protege contra ataques conhecidos.

Esse último ponto é o mais importante. Um patch virtual é uma assinatura de um formato de exploit conhecido. Não é uma correção da classe de vulnerabilidade. Uma regra estreita perde variantes, e uma regra ampla bloqueia usuários reais.

## Como os WAFs são contornados

O atacante precisa de apenas uma variante que passe. Duas pesquisas recentes mostram como isso acontece, e em ambas a causa raiz é a mesma: o WAF e a aplicação interpretam a mesma requisição de formas diferentes.

**Estrutura da requisição.** O [artigo WAFFLED](https://arxiv.org/abs/2503.10846) (Akhavani et al., 2025; também publicado no [ACSAC 2025](https://doi.org/10.1109/acsac67867.2025.00062)) relata 1.207 bypasses em cinco WAFs conhecidos: AWS, Azure, Cloud Armor, Cloudflare e ModSecurity. O payload do ataque permanece inalterado. Apenas a estrutura da requisição é mutada, por meio de limites multipart, namespaces XML e JSON, de modo que o WAF interpreta mal o corpo enquanto o framework o processa sem problemas. Os autores também constataram que mais de 90% dos sites da amostra aceitam corpos urlencoded e multipart de forma intercambiável, o que torna o truque amplamente aplicável. A conclusão deles é que usuários de WAF podem acreditar, erroneamente, que estão protegidos.

**Parsing legado.** Zakhar Fedotkin, da PortSwigger, mostrou [um bypass usando o cookie fantasma `$Version`](https://portswigger.net/research/bypassing-wafs-with-the-phantom-version-cookie) (publicado em dezembro de 2024, atualizado em junho de 2025). O parsing legado de cookies da RFC 2109 permite que payloads entre aspas ou codificados escapem das assinaturas. No exemplo do AWS WAF, uma regra bloqueia `eval('test')`, mas deixa passar a forma com escape octal. Frameworks como Flask, Django, PHP, Ruby e Spring também tratam de modo diferente cabeçalhos Cookie repetidos, o que dá aos atacantes mais espaço para esconder um payload. A correção recomendada pela PortSwigger está na aplicação: validar a entrada e desativar o parsing legado de cookies. Uma regra de WAF mais forte não é a recomendação.

Nenhuma das duas descobertas diz que WAFs são inúteis. Elas dizem que o WAF enxerga uma cópia da realidade, e a aplicação enxerga a coisa real. Qualquer diferença entre as duas é onde o exploit vive.

## Um WAF pode fazer parte da falha

A [violação da Capital One em 2019](https://krebsonsecurity.com/2019/08/what-we-can-learn-from-the-capital-one-hack/) é a história de alerta de sempre, e vale lê-la com cuidado. Brian Krebs relatou que um WAF ModSecurity de código aberto mal configurado permitiu ao atacante enganar o firewall para repassar requisições ao serviço de metadados da AWS, e que o papel (role) do WAF tinha permissões suficientes para listar e ler todos os buckets de armazenamento.

Detalhes dessa história são contestados. A AWS atribuiu o incidente a uma configuração incorreta do firewall e a um papel excessivamente amplo, e analistas divergem sobre o caminho exato do ataque, então eu não a usaria como prova de que "o WAF falhou em corrigir um bug". A melhor lição vem da [análise sistemática revisada por pares na ACM](https://doi.org/10.1145/3546068). Ela identifica cinco falhas de controle distintas: o WAF mal configurado, o serviço de metadados, um papel IAM com permissões em excesso, criptografia ineficaz e monitoramento ineficaz. Nas palavras dos autores, o "firewall mal configurado" era apenas a ponta do iceberg, e a violação foi uma falha de sistemas. Qualquer um desses controles, aplicado corretamente, teria impedido o ataque ou limitado o dano.

Um WAF é uma camada. Ele também exige cuidado próprio: a [OWASP observa](https://owasp.org/www-community/Web_Application_Firewall) que adaptar um WAF a uma aplicação pode dar muito trabalho e precisa ser mantido conforme a aplicação muda.

## O que as equipes de engenharia ainda devem

O WAF protege a aplicação. A equipe protege o sistema diante do qual o WAF está. Na prática, isso significa:

- **Corrigir a causa raiz.** Validação de entrada, consultas parametrizadas, codificação de saída e privilégio mínimo não ficam redundantes por causa de uma regra na borda. São eles que tornam a regra na borda desnecessária.
- **Manter runtimes e dependências atualizados.** Saiba o que você executa e combine um prazo para CVEs críticas. Versões fora de suporte são o pior caso: não existe correção upstream, então a regra "temporária" se torna permanente.
- **Testar a correção, não só a regra.** Adicione um teste de regressão para cada vulnerabilidade corrigida e trate uma prova de conceito bloqueada como um dado, não como um veredito.
- **Pensar na fronteira de confiança.** Pergunte o que acontece se a borda for contornada e o que as credenciais da própria aplicação alcançam se ela for comprometida. A análise da Capital One é essa pergunta respondida do jeito difícil.

## Usando bem um WAF

1. **Patch primeiro, WAF depois.** Trate o patch virtual como uma ponte com responsável e data de validade, acompanhada ao lado da correção real.
2. **Passe de alerta para bloqueio.** Meça os falsos positivos e depois aplique. Regras que ficam só em modo de detecção não protegem nada.
3. **Feche a origem.** Se um atacante alcança a origem diretamente, o WAF é opcional para ele. Permita conexões apenas da sua borda.
4. **Prefira regras específicas da vulnerabilidade, com regras genéricas ao redor.** Nunca dependa de um único indicador, como a string de User-Agent, que um atacante muda em segundos.
5. **Teste de novo após mudanças.** Teste com o formato real do exploit em staging, e novamente após atualizações de regras, incluindo as variantes estruturais descritas acima.
6. **Observe atrás da borda.** Envie os eventos do WAF ao seu monitoramento e procure sinais de pós-exploração no host, não só no perímetro.
7. **Revise as exceções periodicamente.** Regras afrouxadas após um falso positivo tendem a continuar frouxas.

## Para fechar

Use o WAF. Quando uma vulnerabilidade séria aparece, uma regra na borda na primeira hora é boa engenharia, e uma equipe que não consegue fazer isso é mais lenta do que precisa ser.

Depois, gaste o tempo que ele comprou. Nesta semana, liste os problemas que o seu WAF está "cobrindo" e coloque um responsável e uma data em cada correção real. Verifique se a sua origem não é alcançável contornando a borda, e se as suas regras estão em modo de bloqueio. O WAF ganha tempo, e o patch é o que encerra o problema.

## Referências

- OWASP, [Virtual Patching Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Virtual_Patching_Cheat_Sheet.html) e [Web Application Firewall](https://owasp.org/www-community/Web_Application_Firewall).
- F5, [Virtual patching in practice](https://www.f5.com/company/blog/virtual-patching-in-practice-with-f5-big-ip-advanced-waf-and-distributed-cloud-web-app) e [Virtual patching](https://www.f5.com/solutions/use-cases/virtual-patching).
- Cloudflare, [What is a WAF?](https://www.cloudflare.com/learning/ddos/glossary/web-application-firewall-waf/)
- Akhavani et al., [WAFFLED: Exploiting Parsing Discrepancies to Bypass Web Application Firewalls](https://arxiv.org/abs/2503.10846).
- Zakhar Fedotkin, PortSwigger Research, [Bypassing WAFs with the phantom $Version cookie](https://portswigger.net/research/bypassing-wafs-with-the-phantom-version-cookie).
- Brian Krebs, [What We Can Learn from the Capital One Hack](https://krebsonsecurity.com/2019/08/what-we-can-learn-from-the-capital-one-hack/).
- ACM, [A Systematic Analysis of the Capital One Data Breach: Critical Lessons Learned](https://doi.org/10.1145/3546068).
