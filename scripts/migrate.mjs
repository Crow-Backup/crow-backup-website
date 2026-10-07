import fs from 'node:fs/promises';
import path from 'node:path';
import {load} from 'cheerio';
import Turndown from 'turndown';
import gfm from 'turndown-plugin-gfm';

const origin='https://crowbackup.ch';
const cache='.migration-source';
await fs.mkdir(cache,{recursive:true});
async function get(url, name){
 const file=path.join(cache,name);
 try{return await fs.readFile(file,'utf8');}catch{}
 const response=await fetch(url); if(!response.ok)throw Error(`${url}: ${response.status}`);
 const body=await response.text(); await fs.writeFile(file,body); return body;
}
async function api(kind){
 const records=[];
 for(let page=1;;page++){
  const batch=JSON.parse(await get(`${origin}/wp-json/wp/v2/${kind}?per_page=100&page=${page}`,`${kind}-${page}.json`));
  if(!Array.isArray(batch))throw Error(`Invalid ${kind} response`);
  records.push(...batch);if(batch.length<100)break;
 }
 return records;
}
const [pages,posts,categories,tags,users]=await Promise.all(['pages','posts','categories','tags','users'].map(api));
const records=[...pages,...posts];
const featured=new Map();
for(const id of new Set(records.map(x=>x.featured_media).filter(Boolean))){
 featured.set(id,JSON.parse(await get(`${origin}/wp-json/wp/v2/media/${id}`,`media-${id}.json`)));
}
const sitemapIndex=await get(`${origin}/wp-sitemap.xml`,'sitemap-index.xml');
const sitemapURLs=[...sitemapIndex.matchAll(/<loc>(.*?)<\/loc>/g)].map(m=>m[1]);
const sitemapPaths=[];
for(const [i,url] of sitemapURLs.entries()){
 const xml=await get(url,`sitemap-${i}.xml`);
 sitemapPaths.push(...[...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map(m=>new URL(m[1]).pathname));
}
const assets=new Set([`${origin}/wp-content/uploads/2024/03/Crow-Logo_4K.png`]);
const cleanText=html=>load(html).text().trim();
const paths=new Set(records.map(x=>new URL(x.link).pathname));
const pairs=[[8,29],[32,35],[38,170],[41,175],[53,188],[226,233],[9,194],[13,210],[2,184],[486,520],[558,561],[478,474],[385,389],[141,158],[66,155],[62,152],[59,150]];
function lang(record){return new URL(record.link).pathname.startsWith('/en/')?'en':'de';}
function translation(record){return pairs.find(p=>p.includes(record.id))?.[0].toString()||record.id.toString();}
function localURL(value){
 if(!value)return value;
 value=value.trim();
 if(value.startsWith('#'))return value;
 try{
  const url=new URL(value,origin);
  if(url.hostname.endsWith('crowbackup.ch') && url.pathname.startsWith('/wp-content/uploads/')){
   assets.add(origin+url.pathname);return url.pathname+url.hash;
  }
  if(url.hostname==='crowbackup.ch')return url.pathname+url.search+url.hash;
 }catch{}
 return value;
}
const td=new Turndown({headingStyle:'atx',codeBlockStyle:'fenced',bulletListMarker:'-',emDelimiter:'_'});
const escapeMarkdown=td.escape.bind(td);
td.escape=text=>escapeMarkdown(text).replaceAll('<','\\<');
td.use(gfm.gfm);
td.addRule('placeholder',{filter:node=>node.nodeName==='MIGRATION-SHORTCODE',replacement:(content,node)=>`\n\n${node.getAttribute('value')}\n\n`});
td.addRule('headingIDs',{filter:['h1','h2','h3','h4','h5','h6'],replacement:(content,node)=>`\n\n${'#'.repeat(Number(node.nodeName[1]))} ${content.trim()}${node.id?' {#'+node.id+'}':''}\n\n`});
td.addRule('anchors',{filter:node=>node.nodeName==='SPAN'&&node.id,replacement:(content,node)=>`{{< anchor ${JSON.stringify(node.id)} >}}`});
td.addRule('details',{filter:'details',replacement:(content,node)=>{
 const summary=node.querySelector('summary');const question=summary?.textContent||'';summary?.remove();
 return `\n\n{{< faq ${JSON.stringify(question)} >}}\n${td.turndown(node.innerHTML).trim()}\n{{< /faq >}}\n\n`;
}});
td.addRule('video',{filter:'video',replacement:(content,node)=>{
 const src=node.getAttribute('src')||node.querySelector('source')?.getAttribute('src');
 return src?`\n\n{{< video ${JSON.stringify(src)} >}}\n\n`:'';
}});
td.addRule('iframe',{filter:'iframe',replacement:(content,node)=>`\n\n[${node.getAttribute('title')||'Video'}](${node.getAttribute('src')})\n\n`});
td.addRule('pre',{filter:'pre',replacement:(content,node)=>`\n\n\`\`\`\n${node.textContent.trim()}\n\`\`\`\n\n`});
function placeholder($,node,value){$(node).replaceWith($('<migration-shortcode>').attr('value',value).text('shortcode'));}
function convert($,language){
 // Remove executable WordPress assets, layout spacers and obsolete plugin controls.
 $('style,script,form,.wp-block-spacer,#footer,#toc,.screen-reader-response').remove();
 $('a[href^="javascript:"]').remove();
 $('img').each((i,e)=>{$(e).attr('src',localURL($(e).attr('src')));$(e).removeAttr('srcset sizes');});
 $('source,video').each((i,e)=>{$(e).attr('src',localURL($(e).attr('src')));});
 $('a[href]').each((i,e)=>{$(e).attr('href',localURL($(e).attr('href')));});
 $('a').filter((i,e)=>$(e).text().trim()==='X').text('X (Twitter)');
 $('div[id]').each((i,e)=>{if(!$(e).text().trim() && !$(e).find('img,video').length && $(e).attr('id')!=='app')$(e).replaceWith($('<span>').attr('id',$(e).attr('id')).text('anchor'));});
 $('.wp-block-media-text').each((i,e)=>{
  const name=$(e).find('h5').text().trim();
  const image=$(e).find('img').attr('src');
  $(e).find('h5').remove();
  placeholder($,e,`{{< profile name=${JSON.stringify(name)} image=${JSON.stringify(image)} >}}\n${td.turndown($(e).find('.wp-block-media-text__content').html())}\n{{< /profile >}}`);
 });
 $('.wp-block-group.is-nowrap').filter((i,e)=>$(e).find('h5').length===1).each((i,e)=>{
  const name=$(e).find('h5').text().trim();const image=$(e).find('img').attr('src');
  const paragraphs=$(e).find('p').toArray();
  const location=paragraphs.find(p=>$(p).text().trim().endsWith(', CH'));
  const biography=paragraphs.filter(p=>p!==location).map(p=>$.html(p)).join('\n');
  placeholder($,e,`{{< profile name=${JSON.stringify(name)} image=${JSON.stringify(image)} >}}\n${td.turndown((location?$.html(location):'')+biography)}\n{{< /profile >}}`);
 });
 // Keep the original grouping while separating layout from editable Markdown.
 $('.wp-block-columns').get().reverse().forEach(e=>{
  const cols=$(e).children('.wp-block-column');
  if(!cols.length)return;
  const inner=cols.toArray().map(col=>{
   const heading=$(col).find('h3').first().text();
   const step=/^[123]\. /.test(heading);
   const icon=step?['computer','connect','folder'][Number(heading[0])-1]:'';
   return `{{< card${icon?' icon='+JSON.stringify(icon):''} >}}\n${td.turndown($(col).html()).trim()}\n{{< /card >}}`;
  }).join('\n\n');
  placeholder($,e,`{{< grid >}}\n${inner}\n{{< /grid >}}`);
 });
 $('.wp-block-buttons').each((i,e)=>{
  const links=$(e).find('a').toArray().map(a=>`{{< button href=${JSON.stringify($(a).attr('href')||(language==='en'?'/en/download/':'/herunterladen/'))} label=${JSON.stringify($(a).text().trim())} >}}`).join('\n');
  placeholder($,e,links);
 });
 // Repair skipped heading levels without changing the heading text or anchors.
 const headings=$('h2,h3,h4,h5,h6');
 if(headings.length){
  const minimum=Math.min(...headings.toArray().map(e=>Number(e.tagName[1])));
  if(minimum>2)headings.each((i,e)=>{e.tagName='h'+(Number(e.tagName[1])-minimum+2);});
 }
 return td.turndown($('body').html()).replace(/\n{3,}/g,'\n\n').trim();
}
const manifest=[];
const audit=[];
for(const record of records){
 const url=new URL(record.link).pathname; const language=lang(record);
 const $=load(record.content.rendered);
 const source=load(record.content.rendered);
 source('script,style,form,#app,#toc,#footer').remove();
 audit.push({sourceId:record.id,paragraphs:source('p').toArray().map(p=>source(p).text())});
 const front={title:cleanText(record.title.rendered),date:record.date,lastmod:record.modified,url,translationKey:translation(record),source:record.link,sourceId:record.id};
 const cover=featured.get(record.featured_media);
 if(cover){front.cover=localURL(cover.source_url);front.coverAlt=cleanText(cover.alt_text||'');front.coverWidth=cover.media_details.width;front.coverHeight=cover.media_details.height;}
 const slug=record.slug;
 let name=slug;
 if(url==='/'||url==='/en/'){
  name='_index';front.layout='home';front.hero=$('body > p').first().text().trim();
  $('body > p').first().remove();
  front.platforms=$('body > p').first().text().trim();$('body > p').first().remove();
  front.heroImage=$('body > figure').first().find('img').attr('src');
  assets.add(front.heroImage);front.heroImage=localURL(front.heroImage);
  $('body > figure').first().remove();$('body > .wp-block-buttons').first().remove();
  front.description=front.hero;
 }else if([32,35].includes(record.id)){
  front.layout='blog';front.description=language==='de'?'Gedanken, Anleitungen und Neuigkeiten rund um sichere Backups.':'Ideas, guides and news about safer backups.';
 }else if([226,233].includes(record.id)){
  placeholder($,$('#app'),'{{< downloads >}}');
  front.description=language==='de'?'Crow Backup für Windows, macOS und Linux. Kostenlos herunterladen und gemeinsam sichern.':'Crow Backup for Windows, macOS and Linux. Download for free and back up together.';
 }else if([53,188].includes(record.id)){
  placeholder($,$('.wp-block-contact-form-7-contact-form-selector'),'{{< contact >}}');
 }
 if(record.type==='post'){
  front.type='posts';name=`posts/${slug}`;
  const author=users.find(u=>u.id===record.author)?.name;
  if(author&&author.toLowerCase()!=='admin')front.author=author;
  front.categories=record.categories;front.tags=record.tags;
  front.description=cleanText(record.excerpt.rendered).replace(/\s+/g,' ').slice(0,180);
 }
 if(!front.description)front.description=$('p').filter((i,e)=>$(e).text().trim().length>30).first().text().trim().replace(/\s+/g,' ').slice(0,180);
 const markdown=convert($,language);
 const file=`content/${language}/${name}.md`;
 await fs.mkdir(path.dirname(file),{recursive:true});
 await fs.writeFile(file,`${JSON.stringify(front,null,2)}\n\n${markdown}\n`);
 manifest.push({url,file,type:record.type,language,sourceId:record.id});
}
// Preserve search-visible category, tag and author archive routes too.
for(const url of sitemapPaths.filter(p=>!paths.has(p))){
 const language=url.startsWith('/en/')?'en':'de';
 const slug=url.split('/').filter(Boolean).at(-1);
 let items=[],title=slug;
 if(url.includes('/category/')){const term=categories.find(x=>new URL(x.link).pathname===url);title=term?.name||slug;items=posts.filter(x=>x.categories.includes(term?.id)&&lang(x)===language);}
 if(url.includes('/tag/')){const term=tags.find(x=>new URL(x.link).pathname===url);title=term?.name||slug;items=posts.filter(x=>x.tags.includes(term?.id)&&lang(x)===language);}
 if(url.includes('/author/')){const author=users.find(x=>x.slug===slug);title=author?.name?.toLowerCase()==='admin'?'Crow Backup':author?.name||slug;items=posts.filter(x=>x.author===author?.id&&lang(x)===language);}
 const file=`content/${language}/archives/${url.replace(/^\/en\//,'').replaceAll('/','_')}.md`;
 await fs.mkdir(path.dirname(file),{recursive:true});
 await fs.writeFile(file,JSON.stringify({title:cleanText(title),url,layout:'archive',articles:items.map(x=>new URL(x.link).pathname),description:language==='de'?'Beiträge aus dem Crow Backup Blog.':'Articles from the Crow Backup blog.'},null,2)+'\n');
 manifest.push({url,file,type:'archive',language});
}
const failures=[];
for(const url of assets){
 const pathname=decodeURIComponent(new URL(url).pathname);const destination=`static${pathname}`;
 await fs.mkdir(path.dirname(destination),{recursive:true});
 try{await fs.access(destination);continue;}catch{}
 try{const response=await fetch(url);if(!response.ok)throw Error(response.status);await fs.writeFile(destination,Buffer.from(await response.arrayBuffer()));}
 catch(error){failures.push({url,error:String(error)});}
}
const release=JSON.parse(await get('https://downloads.crowbackup.ch/v1/current-version.json','downloads.json'));
await fs.mkdir('data',{recursive:true});await fs.writeFile('data/downloads.json',JSON.stringify(release,null,2)+'\n');
await fs.mkdir('migration',{recursive:true});
await fs.writeFile('migration/manifest.json',JSON.stringify({migratedAt:new Date().toISOString(),source:origin,sitemapPaths,pages:manifest,assets:[...assets].map(x=>new URL(x).pathname),assetFailures:failures},null,2)+'\n');
await fs.writeFile('migration/content-audit.json',JSON.stringify(audit,null,2)+'\n');
console.log(`Migrated ${pages.length} pages, ${posts.length} posts, ${manifest.length-records.length} archives and ${assets.size} assets. Asset failures: ${failures.length}`);
if(failures.length)process.exitCode=1;
