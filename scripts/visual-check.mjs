import {chromium} from '@playwright/test';
import fs from 'node:fs/promises';
await fs.mkdir('.tools/screenshots',{recursive:true});
const browser=await chromium.launch({channel:'msedge',headless:true});
const issues=[];
for(const viewport of [{width:1440,height:1000},{width:390,height:844}]){
 const context=await browser.newContext({viewport});const page=await context.newPage();
 page.on('pageerror',error=>issues.push(error.message));
 for(const [name,url] of [['home','/'],['style-guide','/style-guide/'],['download','/herunterladen/'],['team','/team/'],['faq','/faq/'],['blog','/blog/'],['whitepaper','/whitepaper/'],['english','/en/'],['contact','/kontakt/']]){
  await page.goto('http://localhost:1414'+url,{waitUntil:'networkidle'});
  await page.evaluate(()=>document.fonts.ready);
  await page.evaluate(async()=>{
   const images=[...document.querySelectorAll('img')];
   images.forEach(image=>image.loading='eager');
   await Promise.all(images.map(image=>image.decode().catch(()=>{})));
  });
  await page.screenshot({path:`.tools/screenshots/${name}-${viewport.width}.png`,fullPage:true});
  if(name==='home')await page.screenshot({path:`.tools/screenshots/home-viewport-${viewport.width}.png`});
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>window.innerWidth);
  if(overflow)issues.push(`${url} overflows at ${viewport.width}px`);
  const images=await page.locator('img').evaluateAll(elements=>elements.filter(e=>e.complete&&e.naturalWidth===0).map(e=>e.src));
  if(images.length)issues.push(`${url}: broken images ${images.join(', ')}`);
  if(name==='faq'){
   await page.getByRole('button',{name:'Alle öffnen',exact:true}).click();
   if(await page.locator('details:not([open])').count())issues.push('Open all FAQs failed');
   await page.getByRole('button',{name:'Alle schliessen',exact:true}).click();
   if(await page.locator('details[open]').count())issues.push('Close all FAQs failed');
  }
  if(name==='home'&&viewport.width===390){
   const menu=page.getByRole('button',{name:'Menü'});await menu.click();
   if(await menu.getAttribute('aria-expanded')!=='true')issues.push('Mobile menu failed');
   await page.keyboard.press('Escape');
   if(await menu.getAttribute('aria-expanded')!=='false')issues.push('Escape did not close menu');
  }
 }
 await context.close();
}
await browser.close();
if(issues.length){console.error(issues.join('\n'));process.exitCode=1;}else console.log('PASS: desktop and mobile rendering, image loading, no horizontal overflow, FAQ controls, mobile menu and no JavaScript errors.');
