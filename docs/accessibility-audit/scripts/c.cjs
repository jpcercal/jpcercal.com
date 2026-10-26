const {chromium}=require('/Users/jpcercal/projects/jpcercal.com/node_modules/playwright');
(async()=>{const b=await chromium.launch();const p=await (await b.newContext({viewport:{width:1280,height:800}})).newPage();
await p.goto('https://jpcercal.com/en/');await p.waitForTimeout(1500);
for(let i=0;i<3;i++)await p.keyboard.press('Tab');
const t=await p.evaluate(()=>{const a=document.activeElement;const c=getComputedStyle(a);return [a.className,c.outline,c.boxShadow,getComputedStyle(a,':focus-visible').outline]});console.log(t);
await p.screenshot({path:'evidence/focus-toggle-crop.png',clip:{x:700,y:0,width:580,height:120}});
const css=await p.evaluate(()=>[...document.styleSheets].flatMap(s=>{try{return[...s.cssRules]}catch(e){return[]}}).map(r=>r.cssText).filter(t=>/theme-toggle[^{]*:focus|sr-only|:focus-visible/.test(t)).map(t=>t.slice(0,220)).slice(0,8));console.log(css);
console.log(await p.evaluate(()=>[...document.querySelectorAll('a[target=_blank]')].length+' blank links; aria-current:'+document.querySelectorAll('[aria-current]').length+'; lang hidden text:'+[...document.querySelectorAll('nav[aria-label] a')].map(a=>a.outerHTML.slice(0,160)).join('\n')));
console.log(await p.evaluate(()=>{const g=document.querySelector('a[href*="github.com/jpcercal/jpcercal.com"]');return g.outerHTML.slice(0,300)}));
const q=await (await b.newContext({viewport:{width:320,height:640}})).newPage();await q.goto('https://jpcercal.com/en/revisiting-the-layout-and-the-blog-project/');await q.waitForTimeout(1500);
console.log(await q.evaluate(()=>({doc:document.documentElement.scrollWidth,tbl:document.querySelector('.lntable').getBoundingClientRect().right,wrap:document.querySelector('.lntable').parentElement.className, ov:getComputedStyle(document.querySelector('.lntable').parentElement).overflowX, lnt:getComputedStyle(document.querySelector('.lnt')).color})));
await q.evaluate(()=>document.querySelector('.lntable').scrollIntoView());await q.screenshot({path:'evidence/post-en-320-code.png'});
// zoomed text 200%
const z=await (await b.newContext({viewport:{width:1280,height:800}})).newPage();await z.goto('https://jpcercal.com/en/');await z.addStyleTag({content:'html{font-size:200%!important}'});await z.waitForTimeout(500);await z.screenshot({path:'evidence/home-en-text200.png'});
await b.close()})()
