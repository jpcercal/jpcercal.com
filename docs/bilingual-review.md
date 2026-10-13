# Bilingual completion review ledger

Source revision: `501ac4677276e8fa65972ec604984842d06359d4`.
Baseline: 75 bundles, 64 PT-only, 7 EN-only, 4 already bilingual.
Result: 75 PT + 75 EN article files, 71 new counterparts.

All entries below received two full reviews (not sampled):

1. Source-first semantic/technical review: meaning, claims, examples, author,
   dates, taxonomy, links, code, captions and paragraph order.
2. Target-first editorial review: original voice, register, mood, natural target
   language and paragraph/block structure. Corrections were applied before the
   listed initial commit.

These are two passes by the same assistant, not independent human approvals.
Every translation commit records both passes, the source path/revision and
checks. The source revision plus path identifies the exact immutable source.
Before each commit an audit checked all 81 original post/section Markdown
hashes, invariant metadata, exact fenced code, ordered Markdown block skeleton,
image paths and successful Hugo rendering of the target route. Automated
checks supplement, rather than replace, the editorial reviews.

Original article files and the four existing bilingual pairs were not edited.
Historical claims, duplicated prose and source inconsistencies are intentionally
preserved. Elisete's English author route is a separate supporting commit.
PR #92 remained open/unmerged at the final inventory refresh and is excluded.

| Bundle at source revision (`content/posts/`) | Target | Translation commit |
|---|---|---|
| `understand-the-system-before-changing-it` | pt-BR | `6e1903f2` |
| `o-padrao-camelcase` | en | `bf604e27` |
| `case-sensitive` | en | `6d7db01f` |
| `o-que-e-blogosfera` | en | `c6cd6352` |
| `navegadores-ou-browsers` | en | `caa1a043` |
| `o-que-e-o-xampp-e-para-que-serve` | en | `63aa10cd` |
| `aprenda-o-basico-sobre-html` | en | `fabba258` |
| `breve-historia-da-internet` | en | `b03d322a` |
| `instalando-servidor-web-apache-no-linux` | en | `946087f4` |
| `introducao-a-linguagem-html` | en | `1c1b2839` |
| `introducao-a-linguagem-php` | en | `da571963` |
| `lancado-php-5-4` | en | `6b54038e` |
| `decidimos-mudar-de-pais-por-onde-comecar` | en | `0dba3a7a` |
| `mulheres-brasileiras-em-munique` | en | `1d91ccd3` |
| `vamos-morar-em-munique-na-alemanha` | en | `024d54fc` |
| `the-cost-of-the-loop-matters-more-than-the-score` | pt-BR | `434f6918` |
| `what-an-ai-session-can-teach-the-next-one` | pt-BR | `800caa61` |
| `when-ai-decisions-become-software-inputs` | pt-BR | `9c1d9b11` |
| `working-with-ai-agents-stay-on-the-loop` | pt-BR | `0a9076da` |
| `gpt-6-astra-is-an-operator-not-a-chatbot` | pt-BR | `dac32887` |
| `iterm2-plus-zplug-means-productivity` | pt-BR | `ffc7315e` |
| `acessando-instancias-amazon-rds-em-seu-desktop` | en | `9a860728` |
| `baixando-e-instalando-a-biblioteca-libxml` | en | `55475d2e` |
| `baixando-e-instalando-a-biblioteca-zlib` | en | `af25e7f8` |
| `como-recriar-deb-a-partir-de-pacote-instalado` | en | `56378d9d` |
| `conhecendo-e-instalando-o-servidor-samba-no-linux` | en | `e9088839` |
| `mysqldump-backup-de-base-de-dados-mysql` | en | `b2001a0a` |
| `cakephp-problema-com-mod_rewrite` | en | `e624d304` |
| `como-usar-shortcodes` | en | `39ff054f` |
| `instalando-pear-no-osx-10-8-mountain-lion` | en | `b1cd834c` |
| `instalando-phpunit-no-osx-10-8-mountain-lion` | en | `07c8fe8b` |
| `instalando-phpunit-no-windows` | en | `61480fcc` |
| `resumo-em-paginas-do-wordpress-3-0` | en | `be12079e` |
| `zend-desabilitar-o-layout-e-o-renderizador-de-visoes` | en | `65e1f0e4` |
| `campos-customizados-no-painel-do-joomla` | en | `e16b80b0` |
| `como-e-porque-voce-deve-incluir-o-jquery-do-google-cdn-no-wordpress` | en | `1c53cf55` |
| `como-pegar-um-permalink-de-uma-pagina` | en | `e068fa77` |
| `inserindo-usuarios-no-wordpress-com-wp_insert_user` | en | `ab41d21f` |
| `wordpress-dica-como-verificar-se-um-plugin-esta-ativo` | en | `d45a0ae3` |
| `wordpress-hack-como-obter-o-conteudo-de-um-post-pelo-id` | en | `3d26f457` |
| `git-hub-atinge-tres-milhoes-de-usuarios` | en | `1432a988` |
| `jquery-a-diferenca-entre-bind-live-delegate-on` | en | `02fb272f` |
| `jquery-mask-mascaras-para-campos-de-formularios` | en | `06788a3b` |
| `validando-formularios-com-o-plugin-jquery-validade` | en | `3eb75fc6` |
| `como-alterar-o-usuario-no-subversive-eclipse-svn` | en | `c7ce54d3` |
| `como-configurar-o-google-talk-para-o-google-apps-no-pidgin` | en | `d8ef26f3` |
| `como-instalar-o-driver-de-video-nvidia-no-sistema-operacional-ubuntu-10-04` | en | `39d1f4e5` |
| `instalacao-e-configuracao-conio2` | en | `7b4bf773` |
| `instalando-zeoslib-no-delphi-xe2` | en | `04348757` |
| `android-era-um-software-para-maquinas-fotograficas` | en | `eb9730d1` |
| `android-tem-79-das-ameacas-para-dispositivos-moveis` | en | `0af1ddc6` |
| `apple-macbook-pro-15-com-tela-retina` | en | `4cafcd7d` |
| `como-era-programar-em-1985` | en | `e3755d28` |
| `conheca-o-facebook-home` | en | `8f515f18` |
| `internet-explorer-tem-menos-de-cinquenta-por-cento-da-participacao-de-mercado` | en | `53d52feb` |
| `linkedin-compra-a-pulse` | en | `8b81a9c4` |
| `the-pirate-bay-e-lider-em-seu-segmento` | en | `294ee237` |
| `aumente-as-suas-vendas-com-o-e-mail-marketing` | en | `a58fd4f0` |
| `consumidores-preferem-comprar-em-lojas-virtuais` | en | `af887471` |
| `deficit-de-profissionais-de-ti-no-brasil` | en | `3f6d44df` |
| `empresas-e-redes-sociais` | en | `617adc23` |
| `ja-comprou-o-presente-do-dia-das-maes` | en | `1f0d593c` |
| `o-viral-harlem-shake` | en | `62f44715` |
| `otimizacao-dos-mecanismos-de-busca-seo` | en | `749f748a` |
| `phpsc-conf-2010` | en | `0ea57658` |
| `praga-virtual` | en | `316c2a16` |
| `sites-responsivos-ganham-pontos-no-ranking-de-pesquisas-do-google` | en | `7ee4ebab` |
| `smartphones-irao-sofrer-reducao-de-preco-no-brasil` | en | `600d0c5d` |
| `startups-no-brasil` | en | `622befe6` |
| `tablets-como-ferramentas-no-meio-corporativo` | en | `abf129e4` |
| `voce-sabe-o-que-e-coworking` | en | `d5f9b916` |

For EN targets the source is `index.md`; for pt-BR targets it is `index.en.md`.
Bundle names in the ledger are historical names at the source revision, not
necessarily current filesystem paths. Following the completion review, article
folders were renamed to their English frontmatter slugs at the user's request.
Only internal source references were updated; localized slugs, prose, code and
shared assets were preserved. All original translation commits remain intact.
Resolve a listed SHA with `git show <sha>` to inspect the translation and review
record. Supporting regression/documentation/visual commits are kept separate.

## Final verification

Verified on Linux amd64 with the pinned Nix toolchain:

- `PLAYWRIGHT_PORT=1315 npm run e2e -- --workers=2`: **19 passed** (14 smoke
  tests and 5 Linux visual comparisons, without updating snapshots).
- Clean production pipeline: `BASE_URL=https://jpcercal.com/ npm run build`,
  `npm run images` (150 cover PNGs), `npm run search:index` (75 PT + 75 EN).
- `npm run lint`, `npm run validate:html`, `npm run validate:xml`: passed.
- `lychee --config .lychee.toml --no-progress --remap
  "https://jpcercal.com file://$PWD/public" "public/**/index.html"`:
  **2,606 checks / 373 unique links / 0 errors**.
- `bin/check-artifact.sh`: production isolation and all **75 pairs / 150
  routes** passed, including per-language search counts.
- `npm run lhci -- --collect.settings.chromeFlags="--no-sandbox
  --disable-dev-shm-usage"`: configured assertions passed across 3 URLs / 9
  runs. Existing LHCI defaults use optimistic aggregation; individual
  performance scores varied from 0.74 to 0.99, not every run exceeded 0.9.
- `nix flake check`, `nixfmt --check flake.nix nix/*.nix`, `actionlint`,
  `shellcheck bin/check-artifact.sh` and `git diff --check`: passed.
- Separate draft/design-system preview under `/pr-bilingual/`: the same
  exhaustive 150-route audit plus real Chromium PT/EN search and result
  navigation passed; production output contains no design-system pages.
- Negative preview fixtures correctly rejected a missing counterpart, shared
  cover and incomplete English search index; fixtures were restored afterwards.
- Final inventory refresh: `origin/main` remained at the source revision,
  PR #92 remained open/unmerged, and all 81 original Markdown hashes and 71
  single-file translation commits were rechecked.

The first new PT search assertion omitted an `o` from the expected source
title; the assertion was corrected. A subsequent run collided with another
worktree's port 1313, so the verified full run used the configurable isolated
port 1315. No other checkout or process was changed. Existing macOS-specific
visual baselines were left untouched; only Linux baselines were generated and
verified here.

## Follow-up: English folder names

At the user's request, 62 article folders were renamed so all 75 bundle names
match the English frontmatter slug. Relative shared assets moved with their
bundles. Internal `ref` source paths changed in 32 Markdown files; all other
article bytes (including frontmatter, prose, code and original whitespace) and
all asset bytes were verified unchanged against `fdb0e630`.

After the rename, a clean production build verified byte-identical HTML at all
150 original article routes. The full browser/visual suite passed again
(**19 tests**, no snapshot updates), as did lint, HTML/XML validation, Pagefind
(75 articles per language), all **2,606 link checks / 373 unique links**, and
the exhaustive bilingual/production artifact gates. The naming guard also
correctly rejected a fixture whose folder differed from its English slug.
