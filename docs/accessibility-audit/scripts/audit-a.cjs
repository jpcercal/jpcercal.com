// audit-a.cjs — desktop light-mode axe scans, structure dumps, tab-order test, search flow
const path = require('path');
const fs = require('fs');
const { chromium } = require('playwright');

const WS = __dirname + '/..';
const EV = path.join(WS, 'evidence');
fs.mkdirSync(EV, { recursive: true });
const AXE = fs.readFileSync(path.join(WS, 'axe.min.js'), 'utf8');
const BASE = 'https://jpcercal.com';
const save = (name, data) => fs.writeFileSync(path.join(WS, name), JSON.stringify(data, null, 1));

async function runAxe(page) {
  await page.addScriptTag({ content: AXE });
  return await page.evaluate(async () => {
    const r = await axe.run(document, { resultTypes: ['violations', 'incomplete'] });
    const slim = list => list.map(v => ({
      id: v.id, impact: v.impact || null, help: v.help, helpUrl: v.helpUrl,
      tags: (v.tags || []).filter(t => /wcag|best-practice/.test(t)),
      count: v.nodes.length,
      nodes: v.nodes.slice(0, 12).map(n => ({
        target: n.target, html: (n.html || '').slice(0, 260),
        failureSummary: (n.failureSummary || '').slice(0, 450)
      }))
    }));
    return {
      violations: slim(r.violations),
      incompleteContrast: r.incomplete.filter(v => v.id === 'color-contrast')
        .map(v => ({ count: v.nodes.length, nodes: v.nodes.slice(0, 8).map(n => ({ target: n.target, html: (n.html || '').slice(0, 200) })) }))
    };
  });
}

async function structure(page) {
  return await page.evaluate(() => {
    const q = s => [...document.querySelectorAll(s)];
    return {
      url: location.href, title: document.title, htmlLang: document.documentElement.lang,
      viewportMeta: (document.querySelector('meta[name=viewport]') || {}).content || null,
      skipCandidates: q('a[href^="#"]').slice(0, 6).map(a => ({ href: a.getAttribute('href'), text: a.textContent.trim().slice(0, 50), cls: String(a.className).slice(0, 90) })),
      headings: q('h1,h2,h3,h4,h5,h6').map(e => ({ lvl: +e.tagName[1], text: e.textContent.trim().replace(/\s+/g, ' ').slice(0, 80) })).slice(0, 60),
      landmarks: q('header,nav,main,footer,aside,[role=banner],[role=navigation],[role=main],[role=contentinfo]').map(e => e.tagName.toLowerCase() + (e.id ? '#' + e.id : '') + (e.getAttribute('aria-label') ? '[' + e.getAttribute('aria-label') + ']' : '') + (e.className ? '.' + String(e.className).split(' ').filter(Boolean).slice(0, 2).join('.') : '')),
      imgs: {
        total: document.images.length,
        noAltAttr: [...document.images].filter(i => !i.hasAttribute('alt')).length,
        emptyAlt: [...document.images].filter(i => i.getAttribute('alt') === '').length,
        svgTotal: q('svg').length,
        svgUnlabeled: q('svg').filter(s => s.getAttribute('aria-hidden') !== 'true' && !s.getAttribute('aria-label') && !s.querySelector('title') && !(s.parentElement && s.parentElement.getAttribute('aria-hidden') === 'true')).length,
        pictureCount: q('picture').length
      },
      buttons: q('button').map(b => ({ text: b.textContent.trim().replace(/\s+/g, ' ').slice(0, 40), ariaLabel: b.getAttribute('aria-label'), ariaPressed: b.getAttribute('aria-pressed'), title: b.getAttribute('title'), html: b.outerHTML.slice(0, 220) })),
      inputs: q('input,textarea,select').map(i => ({ tag: i.tagName.toLowerCase(), type: i.type, id: i.id, name: i.name, ariaLabel: i.getAttribute('aria-label'), labelledby: i.getAttribute('aria-labelledby'), placeholder: i.placeholder || null, hasLabelFor: i.id ? !!document.querySelector(`label[for="${i.id}"]`) : false, cls: String(i.className).slice(0, 70), inForm: !!i.closest('form') })),
      langSwitch: q('a[hreflang]').map(a => ({ href: a.getAttribute('href'), hreflang: a.getAttribute('hreflang'), text: a.textContent.trim().slice(0, 24), aria: a.getAttribute('aria-label'), cls: String(a.className).slice(0, 60) })),
      themeAttr: document.documentElement.getAttribute('data-theme'),
      iframeCount: q('iframe').length
    };
  });
}

async function shot(page, name, opts = {}) {
  try { await page.screenshot({ path: path.join(EV, name), timeout: 20000, ...opts }); return true; }
  catch (e) { console.log('  shot fail', name, e.message.split('\n')[0]); return false; }
}

async function scanPage(ctx, slug, url, extra) {
  const page = await ctx.newPage();
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
    await page.waitForTimeout(2200);
    if (extra) await extra(page);
    const axe = await runAxe(page);
    const st = await structure(page);
    save(`axe-${slug}.json`, axe); save(`struct-${slug}.json`, st);
    await shot(page, `${slug}-light.png`);
    console.log(`\n=== ${slug} ${url} — "${st.title}" (lang=${st.htmlLang}, theme=${st.themeAttr})`);
    if (!axe.violations.length) console.log('  no axe violations');
    for (const v of axe.violations) console.log(`  [${v.impact}] ${v.id} x${v.count} — ${v.help}`);
    if (axe.incompleteContrast.length) console.log(`  incomplete color-contrast nodes: ${axe.incompleteContrast.reduce((a, b) => a + b.count, 0)}`);
    return { st, axe };
  } catch (e) {
    console.log('PAGE FAIL', url, e.message.split('\n')[0]);
    save(`axe-${slug}.json`, { error: e.message.split('\n').slice(0, 3).join(' | ') });
    return null;
  } finally { await page.close(); }
}

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });

  // 1) Desktop light-mode scans
  const postPt = await scanPage(ctx, 'post-pt', BASE + '/revisitando-o-layout-e-o-projeto-do-blog/');
  let enPostUrl = null;
  if (postPt) {
    // find EN alternate from the PT post page
    enPostUrl = await ctx.newPage().then(async p => {
      await p.goto(BASE + '/revisitando-o-layout-e-o-projeto-do-blog/', { waitUntil: 'domcontentloaded' });
      const href = await p.evaluate(() => { const l = document.querySelector('link[rel=alternate][hreflang^=en]'); return l ? l.href : null; });
      await p.close(); return href;
    });
    console.log('\nEN post alternate:', enPostUrl);
  }
  await scanPage(ctx, 'home-pt', BASE + '/');
  await scanPage(ctx, 'home-en', BASE + '/en/');
  if (enPostUrl) await scanPage(ctx, 'post-en', enPostUrl);
  await scanPage(ctx, 'search-pt', BASE + '/search/');
  await scanPage(ctx, 'contact-pt', BASE + '/contact/');
  await scanPage(ctx, 'authors-pt', BASE + '/authors/');
  await scanPage(ctx, 'categories-pt', BASE + '/categories/');
  await scanPage(ctx, 'tags-pt', BASE + '/tags/');
  await scanPage(ctx, '404', BASE + '/404.html');

  // 2) Keyboard tab-order test on home PT (fresh context, nothing focused)
  {
    const page = await ctx.newPage();
    await page.goto(BASE + '/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);
    const stops = [];
    for (let i = 0; i < 16; i++) {
      await page.keyboard.press('Tab');
      await page.waitForTimeout(120);
      const info = await page.evaluate(() => {
        const a = document.activeElement;
        if (!a || a === document.body) return { body: true };
        const cs = getComputedStyle(a);
        const r = a.getBoundingClientRect();
        return {
          tag: a.tagName.toLowerCase(), text: (a.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 50),
          href: a.getAttribute && a.getAttribute('href'), cls: String(a.className).slice(0, 90),
          ariaLabel: a.getAttribute && a.getAttribute('aria-label'),
          outline: `${cs.outlineStyle} ${cs.outlineWidth} ${cs.outlineColor}`, outlineOffset: cs.outlineOffset,
          boxShadow: cs.boxShadow.slice(0, 110), textDecoration: cs.textDecorationLine,
          rect: { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) },
          matchesFocusVisible: a.matches(':focus-visible')
        };
      });
      stops.push({ tab: i + 1, ...info });
      if ([1, 2, 3, 5, 8, 12, 16].includes(i + 1)) await shot(page, `focus-home-tab${String(i + 1).padStart(2, '0')}.png`);
    }
    save('tab-order-home-pt.json', stops);
    console.log('\n=== TAB ORDER home-pt ===');
    for (const s of stops) console.log(`  tab${s.tab}: ${s.body ? '<body>' : s.tag + ' "' + (s.text || s.ariaLabel || '') + '"'} outline=${s.outline} shadow=${(s.boxShadow || '').slice(0, 40)} fvis=${s.matchesFocusVisible}`);
    await page.close();
  }

  // 3) Search page interaction flow (PT)
  {
    const page = await ctx.newPage();
    await page.goto(BASE + '/search/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2500);
    const inputInfo = await page.evaluate(() => {
      const i = document.querySelector('input[type=search], input#search-input, .search-input, input[type=text]');
      if (!i) return { found: false, allInputs: [...document.querySelectorAll('input')].map(x => x.outerHTML.slice(0, 150)) };
      return { found: true, html: i.outerHTML.slice(0, 250), id: i.id, type: i.type, ariaLabel: i.getAttribute('aria-label'), placeholder: i.placeholder, labelFor: i.id ? !!document.querySelector(`label[for="${i.id}"]`) : false, resultsLive: !!document.querySelector('[aria-live]'), resultsContainer: (document.querySelector('#search-results, .search-results, [id*=result], [class*=result]') || {}).outerHTML?.slice(0, 200) || null };
    });
    await shot(page, 'search-before.png');
    const searchSel = inputInfo.found ? 'input[type=search], input#search-input, .search-input, input[type=text]' : null;
    let afterInfo = null;
    if (searchSel) {
      await page.fill(searchSel, 'layout');
      await page.waitForTimeout(3000);
      await shot(page, 'search-query-layout.png');
      afterInfo = await page.evaluate(() => {
        const res = document.querySelectorAll('[id*=result] a, [class*=result] a, #search a');
        return {
          resultLinkCount: res.length,
          firstResults: [...res].slice(0, 6).map(a => ({ text: a.textContent.trim().replace(/\s+/g, ' ').slice(0, 70), href: a.getAttribute('href') })),
          liveRegions: [...document.querySelectorAll('[aria-live]')].map(e => ({ live: e.getAttribute('aria-live'), cls: String(e.className).slice(0, 60), textLen: e.textContent.trim().length })),
          resultsHeading: (document.querySelector('h2[id*=result], h1[id*=result], [class*=result] h1, [class*=result] h2') || {}).textContent || null
        };
      });
      // focus the input via keyboard and check focus ring
      await page.evaluate(() => document.querySelector('input').blur());
      await page.click('body', { position: { x: 5, y: 400 } });
    }
    save('search-flow.json', { inputInfo, afterInfo });
    console.log('\n=== SEARCH FLOW ===');
    console.log(JSON.stringify(inputInfo, null, 1).slice(0, 900));
    console.log(JSON.stringify(afterInfo, null, 1).slice(0, 900));
    await page.close();
  }

  // 4) ARIA snapshots (screen-reader view) for key pages
  for (const [slug, url] of [['home-pt', BASE + '/'], ['post-pt', BASE + '/revisitando-o-layout-e-o-projeto-do-blog/'], ['search-pt', BASE + '/search/'], ['404', BASE + '/404.html']]) {
    const page = await ctx.newPage();
    try {
      await page.goto(url, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2000);
      const snap = await page.accessibility.snapshot({ interestingOnly: true });
      save(`aria-${slug}.json`, snap);
      console.log(`aria snapshot ${slug}: root role=${snap && snap.role} children=${snap && snap.children ? snap.children.length : 0}`);
    } catch (e) { console.log('aria fail', slug, e.message.split('\n')[0]); }
    await page.close();
  }

  await browser.close();
  console.log('\nAUDIT A DONE');
})().catch(e => { console.error('FATAL', e); process.exit(1); });
