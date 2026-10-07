import fs from 'node:fs/promises';
import path from 'node:path';
import {load} from 'cheerio';
import {chromium} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
const manifest=JSON.parse(await fs.readFile('migration/manifest.json','utf8'));
const browser=await chromium.launch({channel:'msedge',headless:true});
const accessibility=[];const seo=[];
for(const viewport of [{width:1440,height:1000},{width:390,height:844}]){
 const context=await browser.newContext({viewport});const page=await context.newPage();
 await page.route('**/livereload.js*',route=>route.abort());
 for(const [i,entry] of manifest.pages.entries()){
  await page.goto('http://localhost:1414'+entry.url,{waitUntil:'load'});
  await page.evaluate(async()=>{await document.fonts.ready;document.querySelectorAll('details').forEach(e=>e.open=true);});
  const result=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa','best-practice']).analyze();
  accessibility.push({url:entry.url,width:viewport.width,violations:result.violations.map(v=>({id:v.id,impact:v.impact,description:v.description,help:v.help,helpUrl:v.helpUrl,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary,html:n.html}))})),incomplete:result.incomplete.map(v=>({id:v.id,help:v.help,nodes:v.nodes.length}))});
  if((i+1)%10===0)console.log(`Accessibility: ${i+1}/${manifest.pages.length} pages at ${viewport.width}px`);
 }
 await context.close();
}
await browser.close();
for(const entry of manifest.pages){
 const $=load(await fs.readFile(path.join('.tools/build',entry.url,'index.html'),'utf8'));
 const title=$('title').text();const description=$('meta[name="description"]').attr('content')||'';
 const canonical=$('link[rel="canonical"]').attr('href');
 const issues=[];
 if(!description)issues.push('Missing meta description');
 if(description.length>180)issues.push('Long meta description; review for concision');
 if(title.length>70)issues.push('Long title; review for clarity');
 if($('h1').length!==1)issues.push('Expected exactly one primary heading');
 if(canonical!==`https://crowbackup.ch${entry.url}`)issues.push('Unexpected canonical URL');
 if(entry.type==='archive')issues.push('Thin/duplicate archive: review indexing policy');
 const h1=$('h1').text();
 const links=$('link[rel="alternate"][hreflang]').map((i,e)=>({language:$(e).attr('hreflang'),url:$(e).attr('href')})).get();
 seo.push({url:entry.url,type:entry.type,title,titleLength:title.length,description,descriptionLength:description.length,canonical,h1,hreflang:links,issues});
}
await fs.mkdir('reports',{recursive:true});
await fs.writeFile('reports/accessibility.json',JSON.stringify({date:new Date().toISOString(),standard:'WCAG 2.2 A/AA automated checks plus best practices',pages:accessibility},null,2)+'\n');
await fs.writeFile('reports/seo.json',JSON.stringify({date:new Date().toISOString(),pages:seo},null,2)+'\n');
const totals={};for(const p of accessibility)for(const v of p.violations)totals[v.id]=(totals[v.id]||0)+1;
console.log('Accessibility findings by page/viewport:',totals);
console.log('SEO recommendations:',seo.filter(p=>p.issues.length).length,'pages');
