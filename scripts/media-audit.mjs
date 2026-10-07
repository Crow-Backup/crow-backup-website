import fs from 'node:fs/promises';
import path from 'node:path';
import {load} from 'cheerio';
const manifest=JSON.parse(await fs.readFile('migration/manifest.json','utf8'));
const normalize=value=>decodeURIComponent(new URL(value,'https://crowbackup.ch').pathname).replace(/-\d+x\d+(?=\.[^.]+$)/,'');
const results=[];
await fs.mkdir('.migration-source/live',{recursive:true});
for(const entry of manifest.pages){
 const sourceFile=path.join('.migration-source/live',entry.url.replaceAll('/','_')+'.html');
 let source;try{source=await fs.readFile(sourceFile,'utf8');}catch{const response=await fetch('https://crowbackup.ch'+entry.url);if(!response.ok)throw Error(`${entry.url}: ${response.status}`);source=await response.text();await fs.writeFile(sourceFile,source);}
 const live=load(source);const built=load(await fs.readFile(path.join('.tools/build',entry.url,'index.html'),'utf8'));
 const original=[...new Set(live('img').map((i,e)=>live(e).attr('src')||live(e).attr('data-src')).get().filter(x=>x.includes('/wp-content/uploads/')))];
 const rendered=new Set(built('img').map((i,e)=>normalize(built(e).attr('src'))).get());
 const missing=original.filter(x=>!rendered.has(normalize(x)));
 results.push({url:entry.url,sourceImages:original.map(x=>new URL(x,'https://crowbackup.ch').pathname),missing});
}
await fs.mkdir('reports',{recursive:true});
await fs.writeFile('reports/media.json',JSON.stringify({date:new Date().toISOString(),pages:results},null,2)+'\n');
const failures=results.filter(x=>x.missing.length);
if(failures.length){console.error(JSON.stringify(failures,null,2));process.exitCode=1;}else console.log(`PASS: every upload image used on all ${results.length} live pages is present on its migrated page (responsive size variants matched to their source image).`);
