---
draft: false
author: jpcercal@gmail.com
slug: php2shell-duas-vulnerabilidades-criticas-no-php
title: "PHP2Shell: Duas Vulnerabilidades Críticas no PHP e o Que Fazer Agora"
date: 2026-10-21T00:00:00+00:00
description: Duas falhas críticas no próprio runtime do PHP, CVE-2026-109618 e CVE-2026-109619, podem permitir execução remota de código sem autenticação. Veja o que os advisories e os relatórios públicos dizem, como um WAF e controles em camadas ajudam e como corrigir o PHP e as imagens Docker.
categories:
  - security
tags:
  - php
  - security
  - devops
---

Duas falhas críticas no runtime do PHP foram divulgadas em 21 de outubro de 2026: CVE-2026-109618 e CVE-2026-109619, apelidadas de “PHP2Shell”. Ambas têm CVSS 9.2 (v4.0) e permitem execução remota de código sem autenticação. A divulgação foi antecipada em um dia após o vazamento dos IDs ([PHP Foundation](https://thephp.foundation/blog/2026/10/21/todays-php-security-release-and-how-were-strengthening-php-security/)). O bug está no núcleo do PHP: o framework não importa.

**A versão curta:** atualize o PHP para 8.5.12, 8.4.27, 8.3.36 ou 8.2.35, reinicie todos os workers e confira a versão em execução. Um WAF ganha tempo; não é uma correção.

## O que é afetado

Os dois CVEs são corrigidos por **8.5.12, 8.4.27, 8.3.36 e 8.2.35**; versões anteriores dessas branches são afetadas. Nas mais antigas, as fontes divergem:

- Os advisories do GitHub ([GHSA-w8hw-w9fx-j79w](https://github.com/php/php-src/security/advisories/GHSA-w8hw-w9fx-j79w), [GHSA-6wmf-4rv5-p3rp](https://github.com/php/php-src/security/advisories/GHSA-6wmf-4rv5-p3rp)) listam 8.2 a 8.5; o Google Cloud diz que da 5.4 à 8.5.11 tudo é vulnerável ([Google Cloud](https://cloud.google.com/blog/products/identity-security/responding-to-core-php-vulnerabilities-cve-2026-109618-cve-2026-109619)).
- O upstream não tem release para 8.1 ou anteriores, só backports de código-fonte para 7.4, 8.0 e 8.1 (links abaixo).
- Alguns fornecedores fazem backport: Ubuntu (14.04 ao 26.10, os antigos via Ubuntu Pro) e Zend (ZendPHP para 7.2 a 8.1) ([Ubuntu](https://ubuntu.com/security/CVE-2026-109618), [Zend](https://www.zend.com/php-security-center/CVE-2026-109618)).

Backport de fornecedor é ponte, não plano.

## Como as falhas funcionam

**CVE-2026-109618 (corrupção por OOM).** O PHP usa `longjmp()` para abandonar uma requisição sem memória. Em alguns contextos a memória da requisição é acessível antes de inicializada; uma alocação que falha deixa o estado inválido, que o encerramento usa. A memória se esgota dentro de limites aparentes no parsing de multipart: corpos sem tamanho utilizável que escapam do `post_max_size`, partes com headers ilimitados e campos de arquivo vazios que escapam do `max_file_uploads`.

**CVE-2026-109619 (estado global obsoleto).** Um worker persistente mantém estado global apontando para memória da requisição. Se um erro fatal interrompe a requisição antes da limpeza, uma operação posterior usa o ponteiro liberado (use-after-free). Exige produtor e consumidor, em geral requisições diferentes no mesmo worker. Consumidores confirmados: diagnósticos de INI e progresso de upload de sessão (ativado por padrão).

**Impacto por SAPI:**

- **Apache mod_php** é o pior caso: no 109618 o encerramento roda mesmo com a inicialização falha, então é alcançável antes do código da aplicação, com limites padrão.
- **PHP-FPM** encerra o processo filho quando a inicialização falha, atenuando a sequência mais simples, mas caminhos da aplicação permanecem (RCE no ciclo da sessão validado para o 109619).
- **FrankenPHP** e **LSAPI** são possivelmente suscetíveis, sem validação.

Impacto: execução de código como o worker web.

## Está sendo explorado?

A equipe do PHP não achou exploit funcional entre as PoCs vazadas, mas a watchTowr relata exploração desde 21 de outubro e uma PoC em circulação ([watchTowr](https://watchtowr.com/intelligence/php-remote-code-execution-php2shell/)). Assuma exploração ativa.

## Reduza a exposição na borda

**Um WAF é um controle compensatório, não uma correção.** Não atualiza o PHP e só reconhece formatos conhecidos. A Akamai concorda: corrigir rápido é a defesa mais eficaz ([Akamai](https://www.akamai.com/blog/security-research/critical-remote-code-execution-vulnerabilities-php-core)). Veja [Um WAF Não É um Patch]({{< ref "posts/a-waf-is-not-a-patch/index.md" >}} "Um WAF Não É um Patch").

![Camadas de defesa contra o PHP2Shell: WAF de borda, proxy reverso, aplicação, runtime do PHP (o patch), contêiner e infraestrutura, monitoramento](defense-layers.pt.svg "Camadas de defesa contra o PHP2Shell. Só a camada do runtime do PHP, o patch, remove a vulnerabilidade.")

Só a quarta das seis camadas elimina a falha:

1. **Borda (WAF):** regra gerenciada, patch virtual, limites de taxa, trava da origem.
2. **Proxy/servidor web:** limites de tamanho, partes e headers; rejeitar multipart sem tamanho.
3. **Aplicação:** uploads autenticados, só onde preciso.
4. **Runtime do PHP:** patch e reinício.
5. **Contêiner:** non-root, filesystem somente leitura, limite de memória, filtro de egress.
6. **Monitoramento:** SIEM, telemetria de host, runbook.

### Akamai como exemplo prático

A Akamai lançou a regra **3000991** do Adaptive Security Engine e diz que suas regras de command injection mitigam payloads armados.

1. **Pré-requisitos:** liste políticas, hostnames e caminhos que aceitam `multipart/form-data`.
2. **Proteção gerenciada:** confirme a regra 3000991 em Deny, não Alert; a Akamai não informa o padrão.
3. **Regras customizadas, primeiro em Alert:**

| Regra | Finalidade | Confiança |
|---|---|---|
| A. Multipart fora da lista | Negar multipart onde não há upload | Forte |
| B. Multipart com chunking | Negar multipart com `Transfer-Encoding: chunked` ou sem `Content-Length` (inferência minha) | Forte, se ninguém usa chunking |
| C. Multipart grande | Negar `Content-Length` acima do limite do caminho | Forte só para o tamanho declarado |
| D. Campo de progresso de upload | Alertar sobre `PHP_SESSION_UPLOAD_PROGRESS` | Fraca, fácil de renomear |
| E. Lacuna de inspeção | Alertar sobre multipart acima do limite do WAF | Fecha um ponto cego |

4. **Política de taxa** por IP em caminhos multipart (o 109619 exige duas requisições). Comece em Alert, pelo pico observado.
5. **Implantação:** linha de base, regras em Alert, revisão diária, falsos positivos corrigidos restringindo a regra, promoção de uma por vez para Deny vigiando 4xx e sucesso de uploads.
6. **Trave a origem:** permita só a Akamai (Site Shield, ou lista de permissão com segredo compartilhado ou mTLS) e confirme que o IP da origem não responde.
7. **Logs:** envie eventos ao SIEM e alerte sobre hits de regras, volume multipart acima da base, picos de 5xx após rajadas e pares produtor-consumidor. Um shell iniciado pelo php-fpm ou Apache indica comprometimento.

Nunca teste com exploit ou a PoC pública; use requisições inofensivas em staging (como `curl -F 'a=1'`) e confirme que a regra disparou.

## Aplique o patch no PHP

Atualize para **8.5.12, 8.4.27, 8.3.36 ou 8.2.35** ([php.net](https://www.php.net/archive/2026.php#2026-10-21-5)). Em branches antigas, use backport de fornecedor, os de código-fonte ([7.4](https://github.com/php/php-src/tree/PHP-7.4-CVE-2026-109618-109619), [8.0](https://github.com/php/php-src/tree/PHP-8.0-CVE-2026-109618-109619), [8.1](https://github.com/php/php-src/tree/PHP-8.1-CVE-2026-109618-109619)) ou migre.

Pacotes de distro mantêm o número antigo; use o tracker do fornecedor ([Debian](https://security-tracker.debian.org/tracker/CVE-2026-109618), [Ubuntu](https://ubuntu.com/security/CVE-2026-109618), [Red Hat](https://access.redhat.com/security/cve/cve-2026-109618)), não o `php -v`. No Docker, fixe a tag corrigida (como `php:8.5.12-fpm-alpine`), idealmente pelo digest, e reconstrua com `docker build --pull --no-cache`. Scanners podem não detectá-las, pois o PHP das imagens oficiais não é pacote do sistema.

Reinicie PHP-FPM, Apache e workers e confira com `php -v` e `php-fpm -v` em cada host e contêiner. No CI, falhe builds abaixo do `PHP_VERSION` corrigido. Comece pelo `mod_php` exposto à internet. Se houve comprometimento, troque segredos e reconstrua de imagens limpas.

Se roda PHP 8.1 ou anterior, quanto tempo levará sua migração?

**Referências:** [GHSA-w8hw-w9fx-j79w](https://github.com/php/php-src/security/advisories/GHSA-w8hw-w9fx-j79w), [GHSA-6wmf-4rv5-p3rp](https://github.com/php/php-src/security/advisories/GHSA-6wmf-4rv5-p3rp), [PHP Foundation](https://thephp.foundation/blog/2026/10/21/todays-php-security-release-and-how-were-strengthening-php-security/), [Google Cloud](https://cloud.google.com/blog/products/identity-security/responding-to-core-php-vulnerabilities-cve-2026-109618-cve-2026-109619), [Akamai](https://www.akamai.com/blog/security-research/critical-remote-code-execution-vulnerabilities-php-core), [watchTowr](https://watchtowr.com/intelligence/php-remote-code-execution-php2shell/).
