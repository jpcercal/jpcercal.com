---
draft: false
author: jpcercal@gmail.com
slug: revisitando-o-layout-e-o-projeto-do-blog
title: Revisitando o layout e o projeto do Blog
date: 2019-03-12T21:33:54+00:00
description: Um projeto/prova de conceito que se mostrou interessante, trata-se da migração de um site dinâmico escrito em PHP para um blog estático, sem custos com servidores e otimizado para a web. Confira alguns detalhes da implementação.
categories:
  - other
tags: 
  - news
  - cms
  - seo
  - framework
  - wordpress
  - howto
  - git
---

Olá caros leitores, tinha vontade de revisitar o layout do *blog* há muito tempo, no entanto, dar atenção para a família e escrever não são coisas que podem ser feitas ao mesmo tempo, pois, ambas requerem atenção. 

Pois bem, tecnicamente falando eu gostaria de ter o blog com o código fonte aberto no GitHub para servir de inspiração para outros nerds tomarem meu projeto como base.

> Ficou curioso e quer dar uma olhadinha no código fonte? Então aqui está o [link do repositório](https://github.com/jpcercal/cercal.io), mate sua vontade e deixe um *star* pra mim por lá. Além disto, por que não fazer um *fork* do projeto também? Encontrou algum bug? Abra uma issue ou melhor ainda manda um PR. ❤️

Quando iniciei esse projeto de migração em meados de 2017, o blog rodava em [Wordpress](https://wordpress.org/) 3.4 e dependia de um servidor para renderizar o conteúdo (nada mais nada menos que um *stack* [LAMP](https://www.ibm.com/cloud/learn/lamp-stack-explained)). Por isto, houve também a necessidade de migrar o conteúdo já existente na plataforma antiga para arquivos markdown. Assim sendo, eu buscava como objetivo final:

- Não ter um servidor próprio com scripts no lado servidor
- Não depender de um serviço de banco de dados relacional
- Ter um site estático que poderia ser servido pelo [Git Pages](https://pages.github.com/)
- Ter um sistema de busca com diferentes critérios baseado em arquivos de texto
- Ter versionamento dos posts do blog
- Ter suporte a multi-idiomas (inglês e português)
- Servir o site apenas com [SSL](https://www.cloudflare.com/learning/ssl/what-is-ssl/)
- Associar posts com autores, categorias e tags
- Escrever postagens em arquivos *markdown* 
- Migrar o conteúdo legado do banco de dados [MySQL](https://www.mysql.com/)
- Compilar e comprimir o código fonte em tempo de build
- Otimizar o tempo de carregamento do site, bem como simular o resultado de uma busca no Google
- Criar *drafts* de conteúdo
- Pré-visualizar a renderização do conteúdo
- Migrar para um domínio com a extensão `.io`
- Reorganizar a estrutura de navegação
- Ter um layout minimalista com foco no texto
- Ter um ambiente de desenvolvimento baseado em contêineres [Docker](https://www.docker.com/) 

## Just in case, it just works!

*Yeap*, é verdade que ter um servidor pode facilitar algumas tarefas, mas você tem que pagar por ele. 💰

> É aí que entra em cena esse projeto mirabolante que vai dominar o mundo! E, no meu caso, eu não preciso de um servidor. 

Ao mesmo tempo, não haveria necessidade de um banco de dados para fornecer essas informações já que, não há servidor.

Outra vantagem é que não há processamento de dados no *server-side*, os arquivos já estão lá compilados e otimizados apenas esperando para serem acessados. 🏎

Uma desvantagem, mas nem tanto, é que não há como fazer *queries* num servidor e possibilitar buscas em um banco de dados de conteúdo, então caso algum visitante queira buscar algo no site o que acontece? Bem, exatamente aqui que entra em cena o [Lunr](https://lunrjs.com/).

> Um arquivo de índice é criado em tempo de *build* por essa [task](https://github.com/jpcercal/cercal.io/blob/master/grunt-custom/lunr.js) do [grunt](https://gruntjs.com/), depois disso, um [arquivo JS implementa o módulo de busca](https://github.com/jpcercal/cercal.io/blob/master/assets/js/search.js) e faz uso do índice, atribuí peso para diferentes campos de conteúdo e faz a pesquisa. Lindo!

## Arquivos Markdown

Bem, esses arquivos que possuem a extensão `.md` ou `.markdown` nada mais são do que arquivos de texto plano.

A grande vantagem está no fato de que existem vários editores para trabalhar com esse formato, seja no seu smartphone, tablet, laptop ou PC você sempre poderá escrever algo.

Já que este formato é tão popular e fluído, porque manter um banco de dados? Decidi simplesmente juntar a flexibilidade desse arquivo com um repositório [git](https://git-scm.com/) e *kabuum*! Tenho versionamento de todo o conteúdo que vai pro blog, ou seja, consigo voltar no tempo para ver histórico de modificações dos arquivos, coisa que muitas vezes nem mesmo os gerenciadores de conteúdo mais sofisticados fazem.

Perfeito, não? Melhor ainda, é que posso criar o conteúdo no idioma que eu quiser, basta abrir um novo arquivo e começar a tradução, veja mais sobre isso no repositório, onde há arquivos estáticos de tradução que apresentam, menus, links, etc:

- [jpcercal/cercal.io/i18n/en.yaml](https://github.com/jpcercal/cercal.io/blob/master/i18n/en.yaml)
- [jpcercal/cercal.io/i18n/en.yaml](https://github.com/jpcercal/cercal.io/blob/master/i18n/en.yaml)

E, conteúdos traduzidos:

- [jpcercal/cercal.io/content/posts/composer-clear-cache/index.en.md](https://github.com/jpcercal/cercal.io/blob/master/content/posts/composer-clear-cache/index.en.md)
- [jpcercal/cercal.io/content/posts/composer-clear-cache/index.md](https://github.com/jpcercal/cercal.io/blob/master/content/posts/composer-clear-cache/index.md)

## Ambiente de desenvolvimento e testes

O ambiente de desenvolvimento é baseado em contêineres do Docker, basicamente a única coisa que você precisa ter na sua máquina pra compilar o projeto é o Docker e uma conexão ativa com a internet para baixar as imagens dos contêineres. 

> Você pode encontrar mais detalhes sobre o processo de instalação  e o guia de utilização do serviço no repositório [jpcercal/cercal.io](https://github.com/jpcercal/cercal.io/).

## Travis CI

Como todo bom desenvolvedor, eu criei uma *pipeline* que automatiza o *deploy* da aplicação, obrigado ao pessoal do [Travis CI](https://docs.travis-ci.com/user/for-beginners/) por disponibilizar um ferramenta excelente, pelo menos para o meu propósito.

> Se você estiver curioso sobre como a *pipeline* funciona a cada *commit* ou *pull-request*, não deixe de dar uma passada no [Travis-CI deste repo jpcercal/cercal.io](https://travis-ci.org/jpcercal/cercal.io).

Basicamente o TravisCI abre o arquivo [.travis.yml](https://github.com/jpcercal/cercal.io/blob/master/.travis.yml) definido na raíz do repositório e executa as *tasks* ali definidas. As partes mais importantes estão listadas abaixo:

- Instala as dependências
- Faz a build no modo de produção (isso incluí dentre outras coisas a otimização dos *assets*)
- Publica o site estático gerado pela *build*
- Faz a verificação e análise do site com o [Google Page Speed](https://developers.google.com/speed/pagespeed/insights/)

## Outras ferramentas

Vale citar que o [DNS](https://www.cloudflare.com/learning/dns/what-is-dns/) do domínio aponta para o [Cloudflare](https://www.cloudflare.com/), que oferece um serviço gratuito de otimização de recursos, proteção contra ataques [DDoS](https://www.cloudflare.com/learning/ddos/what-is-a-ddos-attack/) e certificado SSL gratuito, pois bem meus amigos você não precisa pagar pra ter SSL, agora não tem desculpas faça agora mesmo o seu setup. 😇

Hey [Hugo](https://gohugo.io/), muito obrigado! Não, ele não é uma pessoa, mas sim um dos *frameworks* mais rápidos que já vi para construção de sites estáticos, ele foi escrito em [Golang](https://golang.org/) e este blog o utiliza.

## Homepage

No decorrer do tempo percebi que a disposição dos elementos nos layouts anteriores à esta proposta não dava foco no conteúdo, ao invés disto, tentava convencer o leitor a visitar outras páginas do blog. É exatamente esse problema que este layout minimalista tenta resolver.

Veja abaixo uma *screenshot* da página inicial (tirada no momento em que escrevia essa postagem).

![Homepage](homepage.png)

> O resultado é limpo e agradável para realizar a leitura, mas com muitos tons de preto-e-branco, acho que ainda preciso ajustar isso. Aliás, sempre quero ajustar algo. 🚀

## Pontos a serem revisitados

Pois é, ainda preciso refatorar algumas partes, mas estou bem feliz com os resultados.

O que iniciou como uma prova de conceito, agora é o meu blog pessoal, funciona e funciona MUITO bem, o único ponto negativo hoje é que “preciso” do computador para *commitar* os arquivos do projeto.

> Eu poderia usar um app para gerenciamento de projetos GIT no meu smartphone, mas não quero fazer isto. 

Outro ponto que me atrapalha um pouco são os headers de cada post, que são definidos como o header abaixo:

```yaml
---
draft: false
author: jpcercal@gmail.com
slug: my-slug
title: My Title
date: 2019-03-20T10:08:56+00:00
description: My description
categories:
  - other
tags: 
  - apple
  - osx
---
```

> O ponto negativo na verdade é que meu editor [iA Writer](https://ia.net/writer) (pra Mac e iOS) não remove esses metadados, o que atrapalha a elaboração do conteúdo, se você tiver alguma dica de como solucionar isso no *iA Writer*, por favor me conte!

Enfim, queria fechar esse post com uma frase de uma pessoa que admirava muito, o senhor da maça.

> One way to remember who you are is to remember who your heroes are, Steve Jobs.

Se quiser bater um papo sobre este projeto ou até mesmo sobre o seu desafio, deixe um comentário e vamos falando, ficaria muito feliz em servir de fonte de inspiração para que outros *developers developers developers* possam se beneficiar deste trabalho. Forte abraço e até mais. 😉
