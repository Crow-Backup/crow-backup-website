import fs from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
import {load} from 'cheerio';
import TurndownService from 'turndown';
import {gfm} from 'turndown-plugin-gfm';
import {updateDownloads,validateRelease} from './update-downloads.mjs';

const releaseURL='https://downloads.crowbackup.ch/v1/current-version.json';
const notesURL='https://downloads.crowbackup.ch/docs/ReleaseNotes.html';

export function mergeNotes(original,html,version){
 const $=load(html);
 const sections=[];
 $('#content .sect3').each((_,element)=>{
  const section=$(element).clone();
  const heading=section.children('h4').first();
  const match=heading.text().match(/^Version (\S+)\s*\|/);
  if(!match||!heading.attr('id')||!section.find('li').length)throw Error('Invalid release-notes section');
  if(section.find('script,iframe,object,embed').length)throw Error('Unsafe release-notes content');
  const converter=new TurndownService({headingStyle:'atx',bulletListMarker:'-'});
  converter.addRule('releaseHeading',{filter:'h4',replacement:content=>`\n\n## ${content} {#${heading.attr('id')}}\n\n`});
  sections.push({version:match[1],markdown:converter.turndown(section.html()).replace(/[ \t]+$/gm,'')});
 });
 if(!sections.length||sections[0].version!==version)throw Error('Release notes do not match the current download version');
 const boundary=original.indexOf('\n## Version ');
 if(boundary<0)throw Error('Existing release-notes heading missing');
 const latest=original.slice(boundary).match(/^\n## Version (\S+)\s*\|/)[1];
 const position=sections.findIndex(section=>section.version===latest);
 if(position<0)throw Error('Release-notes source no longer contains the existing latest version');
 if(new Set(sections.map(section=>section.version)).size!==sections.length)throw Error('Duplicate release-notes versions');
 const additions=sections.slice(0,position).map(section=>section.markdown).join('\n\n');
 return additions?original.slice(0,boundary)+'\n'+additions+'\n'+original.slice(boundary):original;
}

export const whitepapers=[
 {file:'content/de/whitepaper.md',url:'https://downloads.crowbackup.ch/docs/WhitePaper.html'},
 {file:'content/en/en-whitepaper.md',url:'https://downloads.crowbackup.ch/docs/WhitePaper_en.html'},
];

export function convertWhitepaper(original,html,url){
 const $=load(html);
 const content=$('#content');
 if(content.length!==1||content.find('h2').length<3||content.text().trim().length<1000)throw Error('Incomplete whitepaper source');
 if(content.find('script,iframe,object,embed,form').length)throw Error('Unsafe whitepaper content');
 content.find('[href],[src]').each((_,element)=>{
  for(const attribute of ['href','src']){
   const value=$(element).attr(attribute);
   if(!value||value.startsWith('#'))continue;
   const target=new URL(value,url);
   if(!['https:','mailto:'].includes(target.protocol))throw Error('Unsafe whitepaper URL');
   $(element).attr(attribute,target.origin==='https://crowbackup.ch'?target.pathname+target.search+target.hash:target.href);
  }
 });
 const converter=new TurndownService({headingStyle:'atx',codeBlockStyle:'fenced',bulletListMarker:'-'});
 converter.use(gfm);
 converter.addRule('anchoredHeading',{
  filter:element=>/^H[2-6]$/.test(element.nodeName),
  replacement:(text,element)=>`\n\n${'#'.repeat(Number(element.nodeName.slice(1)))} ${text}${element.id?` {#${element.id}}`:''}\n\n`,
 });
 const boundary=original.indexOf('\n\n');
 if(boundary<0)throw Error('Whitepaper front matter missing');
 JSON.parse(original.slice(0,boundary));
 return original.slice(0,boundary)+'\n\n'+converter.turndown(content.html())+'\n';
}

export async function updateRelease({file='data/downloads.json',notesFile='content/en/release-notes.md',fetchImpl=fetch,documents=whitepapers}={}){
 async function request(url){
  for(let attempt=0;attempt<3;attempt++){
   try{
    const response=await fetchImpl(url,{signal:AbortSignal.timeout(10000)});
    if(!response.ok)throw Error(`Release source returned HTTP ${response.status}`);
    return url===releaseURL?await response.json():await response.text();
   }catch(error){
    if(attempt===2)throw error;
    await new Promise(resolve=>setTimeout(resolve,1000));
   }
  }
 }
 const release=validateRelease(await request(releaseURL));
 const html=await request(notesURL);
 const original=await fs.readFile(notesFile,'utf8');
 const notes=mergeNotes(original,html,release.version);
 const pages=[];
 for(const document of documents){
  const original=await fs.readFile(document.file,'utf8');
  const updated=convertWhitepaper(original,await request(document.url),document.url);
  pages.push({...document,original,updated});
 }
 // Both remote sources and the existing page are validated before either write.
 const downloads=await updateDownloads({file,fetchImpl:async()=>({ok:true,json:async()=>release})});
 if(notes!==original)await fs.writeFile(notesFile,notes);
 for(const page of pages)if(page.original!==page.updated)await fs.writeFile(page.file,page.updated);
 return {...downloads,notesChanged:notes!==original,whitepapersChanged:pages.filter(page=>page.original!==page.updated).length};
}

if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 const result=await updateRelease();
 console.log(`Release ${result.version}: downloads ${result.changed?'updated':'unchanged'}, notes ${result.notesChanged?'updated':'unchanged'}`);
}
