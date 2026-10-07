import fs from 'node:fs/promises';
import path from 'node:path';
import {load} from 'cheerio';

const buildDir=process.argv[2]||'.tools/build';
const home=load(await fs.readFile(path.join(buildDir,'index.html'),'utf8'));
const basePath=new URL(home('link[rel="canonical"]').attr('href')).pathname;
let count=0;
async function visit(directory){
 for(const entry of await fs.readdir(directory,{withFileTypes:true})){
  const file=path.join(directory,entry.name);
  if(entry.isDirectory()){await visit(file);continue;}
  if(!entry.name.endsWith('.html'))continue;
  const $=load(await fs.readFile(file,'utf8'));
  const from=path.relative(buildDir,directory).split(path.sep).join('/');
  for(const element of $('[href],[src],[poster],[action]').toArray()){
   for(const attr of ['href','src','poster','action']){
    const value=$(element).attr(attr);
    if(!value?.startsWith('/')||value.startsWith('//'))continue;
    const url=new URL(value,'https://site.invalid');
    if(basePath!=='/'&&!url.pathname.startsWith(basePath))throw new Error(`${file}: URL outside base path: ${value}`);
    const target=url.pathname.slice(basePath.length);
    let relative=path.posix.relative(from,target)||'.';
    if(url.pathname.endsWith('/')&&!relative.endsWith('/'))relative+='/';
    $(element).attr(attr,relative+url.search+url.hash);
   }
  }
  await fs.writeFile(file,$.html());count++;
 }
}
await visit(buildDir);
console.log(`Made HTML asset and navigation paths portable in ${count} pages.`);
