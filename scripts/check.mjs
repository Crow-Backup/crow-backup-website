import fs from 'node:fs/promises';
import path from 'node:path';
import {load} from 'cheerio';

const manifest=JSON.parse(await fs.readFile('migration/manifest.json','utf8'));
const audit=JSON.parse(await fs.readFile('migration/content-audit.json','utf8'));
const failures=[];let links=0,paragraphs=0;
const documents=new Map();
const buildDir=process.argv[2]||'.tools/build';
const root=load(await fs.readFile(path.join(buildDir,'index.html'),'utf8'));
const baseURL=new URL(root('link[rel="canonical"]').attr('href'));
const basePath=baseURL.pathname;
const llms=await fs.readFile(path.join(buildDir,'llms.txt'),'utf8');
function stripBase(url){return basePath!=='/'&&url.startsWith(basePath)?'/'+url.slice(basePath.length):url;}
async function html(url){
 if(documents.has(url))return documents.get(url);
 const file=path.join(buildDir,decodeURIComponent(stripBase(url)),url.endsWith('/')?'index.html':'');
 const $=load(await fs.readFile(file,'utf8'));documents.set(url,$);return $;
}
for(const url of manifest.sitemapPaths){
 try{const $=await html(url);if(!$('h1').length)failures.push(`${url}: missing heading`);}catch{failures.push(`${url}: missing migrated route`);}
}
for(const page of manifest.pages){
 const $=await html(page.url);
 if($('link[rel="stylesheet"]').length!==1)failures.push(`${page.url}: expected one bundled stylesheet`);
 for(const element of $('link[rel="preload"][as="font"]').toArray()){
  if($(element).attr('type')!=='font/woff2'||$(element).attr('crossorigin')!=='anonymous')failures.push(`${page.url}: incorrect font preload metadata`);
 }
 if($('link[rel="preload"][as="font"]').length!==2)failures.push(`${page.url}: expected two critical font preloads`);
 for(const element of $('link[rel="canonical"],link[rel="alternate"][hreflang]').toArray()){
  const value=$(element).attr('href');
  if(!value?.startsWith('https://'))failures.push(`${page.url}: production metadata must use HTTPS: ${value}`);
 }
 const markdownPath=path.join(buildDir,decodeURIComponent(page.url),'index.md');
 try{
  const markdown=await fs.readFile(markdownPath,'utf8');
  if(!markdown.trim()||markdown.includes('{{<')||markdown.includes('{{%'))failures.push(`${page.url}: invalid Markdown export`);
  if(!llms.includes(`](./${page.url.slice(1)}index.md)`))failures.push(`${page.url}: missing llms.txt entry`);
  if(!$('[data-markdown]').length||!$('[data-edit-page]').attr('href')?.startsWith('https://github.com/Crow-Backup/crow-backup-website/edit/master/content/'))failures.push(`${page.url}: missing Markdown or GitHub edit link`);
 }catch{failures.push(`${page.url}: missing Markdown export`);}
 for(const element of $('a[href],img[src],video[src],video[poster],track[src],link[rel="stylesheet"],link[rel="preload"],link[rel="icon"],script[src]').toArray()){
  const value=$(element).attr('href')||$(element).attr('src');
  if(!value||/^(mailto:|tel:|https?:\/\/|data:)/.test(value))continue;
  const target=new URL(value,'https://crowbackup.ch'+basePath+page.url.slice(1));links++;
  if(basePath!=='/'&&!target.pathname.startsWith(basePath))failures.push(`${page.url}: URL escapes deployment base path ${value}`);
  if(basePath!=='/'&&target.pathname.startsWith(basePath+basePath.slice(1)))failures.push(`${page.url}: duplicated deployment base path ${value}`);
  if(target.pathname.includes('.')&&!target.pathname.endsWith('/')){
   try{await fs.access(path.join(buildDir,decodeURIComponent(stripBase(target.pathname))));}catch{failures.push(`${page.url}: missing asset ${value}`);}
  }else{
   try{
    const targetDoc=await html(target.pathname);
    if(target.hash&&!targetDoc('[id]').toArray().some(e=>targetDoc(e).attr('id')===decodeURIComponent(target.hash.slice(1))))failures.push(`${page.url}: missing anchor ${value}`);
   }catch{failures.push(`${page.url}: broken link ${value}`);}
  }
  const poster=$(element).attr('poster');
  if(poster){
   const target=new URL(poster,'https://crowbackup.ch'+basePath+page.url.slice(1));
   if(basePath!=='/'&&!target.pathname.startsWith(basePath))failures.push(`${page.url}: poster escapes deployment base path ${poster}`);
   try{await fs.access(path.join(buildDir,decodeURIComponent(stripBase(target.pathname))));}catch{failures.push(`${page.url}: missing poster ${poster}`);}
  }
 }
 if($('main').text().includes('{{')||$.html().includes('raw HTML omitted'))failures.push(`${page.url}: unrendered content`);
 if(page.type==='archive')continue;
 if(page.type==='post'&&!$('.article-cover img').length)failures.push(`${page.url}: featured image missing`);
 const source=audit.find(x=>x.sourceId===page.sourceId);
 const normalize=text=>text.normalize('NFKC').replace(/[^\p{L}\p{N}]+/gu,'').toLowerCase();
 const rendered=normalize($('main').text());
 // Every original prose paragraph must survive in the rendered page.
 for(const paragraph of source.paragraphs){
  const text=normalize(paragraph);if(text.length<20)continue;paragraphs++;
  if(!rendered.includes(text))failures.push(`${page.url}: lost paragraph: ${paragraph.slice(0,95)}`);
 }
}
for(const asset of manifest.assets){try{await fs.access(path.join(buildDir,decodeURIComponent(asset)));}catch{failures.push(`Missing migrated media: ${asset}`);}}
for(const [url,language,download] of [['/','de-CH','herunterladen/'],['/en/','en','en/download/']]){
 const $=await html(url);
 try{
  const blocks=$('script[type="application/ld+json"]');
  if(blocks.length!==1)throw Error('expected one software description');
  const software=JSON.parse(blocks.text());
  if(software['@context']!=='https://schema.org'||software['@type']!=='SoftwareApplication'||software.name!=='Crow Backup')throw Error('incorrect software identity');
  if(software['@id']!==baseURL.href+'#software'||software.url!==baseURL.href+url.slice(1)||software.inLanguage!==language)throw Error('incorrect software URLs or language');
  if(!$('.hero-description').text().includes(software.description)||software.operatingSystem!=='Windows, macOS, Linux'||software.applicationCategory!=='UtilitiesApplication')throw Error('software facts differ from visible content');
  if(software.isAccessibleForFree!==true||software.offers?.['@type']!=='Offer'||software.offers.price!==0||software.offers.url!==baseURL.href+download)throw Error('incorrect free offer');
  if(software.aggregateRating||software.review)throw Error('ratings/reviews have not been verified');
  for(const value of [software.image,software.screenshot]){
   const asset=new URL(value);if(asset.origin!==baseURL.origin||!asset.pathname.startsWith(basePath))throw Error('image outside deployment base');
   await fs.access(path.join(buildDir,decodeURIComponent(stripBase(asset.pathname))));
  }
 }catch(error){failures.push(`${url}: invalid software structured data: ${error.message}`);}
}
for(const url of ['/herunterladen/','/en/download/']){const $=await html(url);if($('[data-installer]').length!==4)failures.push(`${url}: installer links missing`);}
for(const url of ['/team/','/en/en-team/']){const $=await html(url);if($('.profile').length!==4)failures.push(`${url}: team profiles missing`);}
for(const url of ['/faq/','/en/en-faq/']){const $=await html(url);if($('details').length<10)failures.push(`${url}: FAQs missing`);}
for(const url of ['/blog/','/en/en-blog/']){const $=await html(url);if($('.post-cover img').length!==7)failures.push(`${url}: expected seven featured images`);}
if(failures.length){console.error(failures.join('\n'));process.exitCode=1;}
else console.log(`PASS: ${manifest.sitemapPaths.length} source URLs, ${paragraphs} original paragraphs, ${links} internal references, ${manifest.assets.length} migrated media, bilingual downloads, FAQs and team profiles.`);
