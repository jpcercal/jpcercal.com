---
draft: false
author: jpcercal@gmail.com
slug: pi-hole-adguard-home-e-blocky-uma-jornada-de-dns-no-homelab
title: "Pi-hole, AdGuard Home e Blocky: uma jornada de DNS no homelab"
date: 2026-10-26T00:00:00+00:00
description: Comecei bloqueando DNS num Raspberry Pi com Pi-hole, passei pelo AdGuard Home e hoje rodo Blocky no meu NAS. O que cada ferramenta faz bem, o que os benchmarks da comunidade realmente dizem e por que um simples arquivo de configuração venceu.
categories:
  - devops
tags:
  - dns
  - homelab
  - self-hosting
  - pihole
  - adguard-home
  - blocky
---

Um bloqueador de anúncios no navegador protege apenas aquele navegador. A smart TV, o console de videogame, a lâmpada IoT que telefona para casa duas vezes por minuto: nenhum deles aceita extensões. Se você quer que o bloqueio cubra a casa inteira, o lugar para aplicá-lo é o resolver.

Essa é a ideia por trás do bloqueio de DNS em toda a rede. Cada dispositivo da LAN aponta seu DNS para um pequeno serviço que você administra e, quando algo consulta um domínio conhecido de anúncio, rastreador ou malware, o serviço responde "não existe" em vez de um endereço. A requisição morre antes de começar, em todos os dispositivos, sem nada instalado em nenhum deles. Três nomes dominam a versão self-hosted dessa ideia: Pi-hole, AdGuard Home e Blocky. Já usei os três, nessa ordem, e é isso o que essa jornada me ensinou.

## As três ferramentas

**Pi-hole** é a ferramenta que popularizou o bloqueio de DNS em casa. É uma aplicação web completa: um atualizador agendado (gravity) baixa blocklists para um banco de dados local, uma interface de administração polida mostra estatísticas de consultas, e grupos de clientes aplicam políticas diferentes por dispositivo. A versão 6 (fevereiro de 2025) recolapsou tudo num único processo e adicionou HTTPS nativo na interface de administração.

**AdGuard Home** é um único binário Go com interface web embutida e DNS criptografado em todos os lados. Fala DoH, DoT e DoQ tanto com os resolvers upstream quanto com os clientes da LAN, e adiciona regras por cliente e filtros de controle parental diretamente na interface.

**Blocky** é o minimalista dos três. Um proxy DNS em Go configurado inteiramente por YAML: blocklists, upstreams, cache, grupos de clientes, registros DNS locais. Sem banco de dados, sem interface web. No lugar, você recebe uma pequena API HTTP, métricas Prometheus prontas para uso, upstreams criptografados (DoH/DoT/DoQ) e bloqueio em nível de CNAME, que pega apelidos de domínios bloqueados.

## Minha jornada

Comecei do jeito que muita gente começa: Pi-hole num Raspberry Pi. Um script de instalação, um assistente web, e em uma hora eu tinha gráficos mostrando quanto lixo minha rede andava consultando. Funcionou por anos. O que foi me incomodando aos poucos foi a forma do estado. Minha configuração vivia em arquivos, num banco de dados e em cliques que eu tinha dado na interface. Restaurar tudo num cartão novo significava lembrar. Depois o DNS criptografado ficou mais difícil: a Cloudflare descontinuou o recurso de DoH do cloudflared no fim de 2025 (removido em fevereiro de 2026), então o Pi-hole passou a precisar do Unbound ou do dnscrypt-proxy ao lado para ter um upstream criptografado.

O AdGuard Home resolveu isso num binário só. DoH embutido, uma interface mais limpa, regras por dispositivo sem ginástica de grupos. Usei feliz por um tempo, mas a forma subjacente continuava a mesma: a verdade sobre o meu DNS vivia dentro da aplicação.

O descompasso ficou óbvio quando o resto do meu homelab migrou para o TrueNAS e virou arquivos Compose num repositório git. Todo outro serviço era um diff que eu podia revisar. O DNS era o único que eu só conseguia descrever de memória. Foi aí que o Blocky fez sentido, e é o meu resolver desde então.

## Configuração como arquivo, sem mistério

Todo o comportamento do Blocky é definido em configuração YAML. No repositório do meu homelab, é um pequeno diretório de arquivos que o Blocky mescla: upstreams, bloqueio, cache, DNS customizado, limites de requisição, uma preocupação por arquivo. O resolver inteiro é versionado, revisável e pesquisável com grep. Uma mudança é um commit. A recuperação é um clone e um `docker compose up`. Se uma configuração não está no arquivo, ela não está configurada; não há estado oculto nem mistério.

O trade-off honesto: não há interface para um ajuste rápido de allowlist no meio do jantar. Eu edito o arquivo, ou chamo a API, e recarrego. Para mim isso é a funcionalidade. Para uma casa que quer resolver com um clique, talvez não seja.

## O que os benchmarks realmente dizem

Argumentos de desempenho sobre essas ferramentas estão por toda parte na internet, e a maioria não vale nada: sem metodologia, sem versões, números contraditórios. As medições cuidadosas convergem para uma conclusão entediante. Na escala de uma casa, os três são rápidos, e o seu resolver upstream e a taxa de acerto de cache importam mais que o bloqueador no meio do caminho. A comparação prática de longo prazo da WunderTech (atualizada em agosto de 2026) diz sem rodeios: o desempenho é "praticamente o mesmo" e, com listas idênticas, o bloqueio dá empate.

Em throughput, o harness reproduzível com dnsperf do projeto ferrous-dns (julho de 2026) mediu 118k QPS para o AdGuard Home, 85k para o Blocky e 19,5k para o Pi-hole, apenas com cache; com 1M de regras de bloqueio carregadas, AdGuard Home (111k) e Blocky (98k) ficaram a cerca de 13% um do outro. É um benchmark de fornecedor, então desconto os números do próprio produto deles, mas o harness é público e cada valor ali é ordens de magnitude maior do que uma casa gera.

O teste independente mais instrumentado que conheço é o benchmark anycast de Gino Eising, de setembro de 2026. O AdGuard Home respondeu consultas com cache quente com p50 de 2,04 ms; o Blocky atrás do Unbound levou 11,06 ms com 2,46M de regras regex e curinga carregadas. As duas pilhas atingiram o teto de 5k QPS do teste sem perder uma consulta. O que move a latência é o tamanho do conjunto de regras e o custo de regex, não a escolha da ferramenta, e 11 ms continua imperceptível em casa.

Em eficácia de bloqueio, o smarthomeperfected rodou Pi-hole e AdGuard Home por uma semana cada no tráfego real de uma casa (cerca de 600k consultas por semana, mesmo upstream). As listas padrão do AdGuard Home bloquearam 23,2% das consultas contra 12,2% de um Pi-hole deliberadamente mínimo, mas a diferença vem quase toda da cobertura das listas: um único hostname de telemetria da Roku respondeu por 48,7% dos bloqueios do AdGuard Home. Mesmas listas, mesmo bloqueio, independentemente do motor.

Os números de memória publicados variam por um fator de dez entre versões, métodos de medição, tamanhos de lista e logging. O que permanece consistente é a ordem: o Blocky é o mais leve, depois o AdGuard Home, depois o Pi-hole, todos na faixa de dezenas a poucas centenas de megabytes e irrelevantes em qualquer hardware da classe do Raspberry Pi 4. Meu container do Blocky tem um limite de 512 MB e nunca chega perto.

## Qual se encaixa no seu homelab

A instalação é fácil nos três casos: Pi-hole e AdGuard Home trazem instaladores e assistentes amigáveis; o Blocky é um binário ou container mais um arquivo YAML. Se a sua casa precisa de controle parental e regras por dispositivo numa interface, o AdGuard Home se encaixa melhor. Se você quer a maior comunidade, a melhor documentação e estatísticas de longo prazo num painel polido, o Pi-hole ainda merece sua popularidade. E se o seu homelab já é infraestrutura-como-código e clicar num formulário web para mudar política de DNS te incomoda, o Blocky se encaixa como qualquer outro serviço Compose: configuração no git, métricas no Prometheus.

Nenhum deles vai bloquear mais anúncios do que as listas que você alimentar, e nenhum é gargalo na escala de uma casa. Então a decisão normalmente nem é sobre desempenho. É sobre onde você quer que viva a verdade sobre a sua rede. Eu quero ela num arquivo que posso ler, comparar com diff e restaurar, e é por isso que minha resposta, depois de três paradas, é o Blocky.

## Referências

1. Gino Eising, "Home DNS failover, taken too far on purpose" (setembro de 2026), benchmark independente de múltiplos resolvers: https://djieno.com/blog/home-dns-failover-obsession/
2. Resultados de benchmark do ferrous-dns (julho de 2026), harness dnsperf reproduzível com Pi-hole, AdGuard Home e Blocky (benchmark de fornecedor): https://github.com/ferrous-networking/ferrous-dns/blob/main/bench/benchmark-results.md
3. SmartHomePerfected, "Pi-hole vs AdGuard Home: We Ran Both for a Week Each" (julho de 2026): https://www.smarthomeperfected.com/pi-hole-vs-adguard-home/
4. WunderTech (Frank Joseph), "AdGuard Home vs. Pi-hole in 2026" (atualizado em agosto de 2026): https://www.wundertech.net/adguard-home-vs-pi-hole-best-ad-blocker/
5. raspberry.tips, "Pi-hole vs AdGuard Home: Comparison 2026" (outubro de 2026), matriz de recursos baseada na documentação: https://raspberry.tips/en/raspberrypi-tutorials/pi-hole-vs-adguard-home-comparison
6. Documentação oficial: Blocky (https://github.com/0xERR0R/blocky), guia de benchmark do Pi-hole (https://docs.pi-hole.net/guides/misc/benchmark/), wiki do AdGuard Home (https://github.com/AdguardTeam/AdGuardHome/wiki/Comparison)
