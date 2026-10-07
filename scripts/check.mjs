import fs from 'node:fs/promises';
import path from 'node:path';
import {load} from 'cheerio';

const manifest=JSON.parse(await fs.readFile('migration/manifest.json','utf8'));
const audit=JSON.parse(await fs.readFile('migration/content-audit.json','utf8'));
const failures=[];let links=0,paragraphs=0;
const documents=new Map();
const buildDir=process.argv[2]||'.tools/build';
const root=load(await fs.readFile(path.join(buildDir,'index.html'),'utf8'));
const basePath=new URL(root('link[rel="canonical"]').attr('href')).pathname;
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
 for(const element of $('a[href],img[src],video[src],link[rel="stylesheet"],script[src]').toArray()){
  const value=$(element).attr('href')||$(element).attr('src');
  if(!value||/^(mailto:|tel:|https?:\/\/|data:)/.test(value))continue;
  const target=new URL(value,'https://crowbackup.ch'+page.url);links++;
  if(target.pathname.includes('.')&&!target.pathname.endsWith('/')){
   try{await fs.access(path.join(buildDir,decodeURIComponent(stripBase(target.pathname))));}catch{failures.push(`${page.url}: missing asset ${value}`);}
  }else{
   try{
    const targetDoc=await html(target.pathname);
    if(target.hash&&!targetDoc('[id]').toArray().some(e=>targetDoc(e).attr('id')===decodeURIComponent(target.hash.slice(1))))failures.push(`${page.url}: missing anchor ${value}`);
   }catch{failures.push(`${page.url}: broken link ${value}`);}
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
for(const url of ['/herunterladen/','/en/download/']){const $=await html(url);if($('[data-installer]').length!==4)failures.push(`${url}: installer links missing`);}
for(const url of ['/team/','/en/en-team/']){const $=await html(url);if($('.profile').length!==4)failures.push(`${url}: team profiles missing`);}
for(const url of ['/faq/','/en/en-faq/']){const $=await html(url);if($('details').length<10)failures.push(`${url}: FAQs missing`);}
for(const url of ['/blog/','/en/en-blog/']){const $=await html(url);if($('.post-cover img').length!==7)failures.push(`${url}: expected seven featured images`);}
if(failures.length){console.error(failures.join('\n'));process.exitCode=1;}
else console.log(`PASS: ${manifest.sitemapPaths.length} source URLs, ${paragraphs} original paragraphs, ${links} internal references, ${manifest.assets.length} migrated media, bilingual downloads, FAQs and team profiles.`);
