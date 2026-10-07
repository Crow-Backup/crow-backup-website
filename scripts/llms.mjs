import fs from 'node:fs/promises';
import path from 'node:path';
import {load} from 'cheerio';
import TurndownService from 'turndown';
import {gfm} from 'turndown-plugin-gfm';

const buildDir=process.argv[2]||'.tools/build';
const turndown=new TurndownService({headingStyle:'atx',codeBlockStyle:'fenced',bulletListMarker:'-'});
turndown.use(gfm);
turndown.addRule('faqHeading',{filter:'summary',replacement:content=>`\n\n## ${content.trim()}\n\n`});
const documents=[];
async function visit(directory){
 for(const entry of await fs.readdir(directory,{withFileTypes:true})){
  const file=path.join(directory,entry.name);
  if(entry.isDirectory()){await visit(file);continue;}
  if(entry.name!=='index.html')continue;
  const $=load(await fs.readFile(file,'utf8'));
  const edit=$('[data-edit-page]').attr('href');
  if(!edit)continue;
  const heading=$('main h1').first().clone();heading.find('br').replaceWith(' ');
  heading.find('.hero-subtitle').prepend(' ');
  const title=heading.text().replace(/\s+/g,' ').trim();
  const lang=$('html').attr('lang');
  const relative=path.relative(buildDir,directory).split(path.sep).join('/');
  const route=relative?relative+'/':'';
  const main=$('main').clone();
  main.find('.page-tools,.toc,.faq-controls,[aria-hidden="true"],svg,script,style,button').remove();
  main.find('img[alt=""]').remove();
  main.find('form').replaceWith(lang.startsWith('de')?'<p>Bitte nutze das Kontaktformular auf der Website, um eine Nachricht zu senden.</p>':'<p>Use the contact form on the website to send a message.</p>');
  main.find('video').each((i,e)=>{
   const src=$(e).attr('src');
   $(e).replaceWith($('<a>').attr('href',src).text('Video'));
  });
  const markdown=`> Language: ${lang}\n> Website: [View this page](./)\n\n${turndown.turndown(main.html())}\n\n---\n\n[Improve this page on GitHub](${edit})\n`;
  if(markdown.includes('{{<')||markdown.includes('{{%'))throw new Error(`Unrendered shortcode in ${file}`);
  await fs.writeFile(path.join(directory,'index.md'),markdown);
  documents.push({title,lang,route,group:edit.includes('/posts/')?'Articles':edit.includes('/archives/')?'Archives':'Pages and documentation'});
 }
}
await visit(buildDir);
documents.sort((a,b)=>a.route.localeCompare(b.route));
let index='# Crow Backup\n\n> Free software for encrypted backups with friends. Share storage with people you trust. Documentation is available in German and English.\n\nEach entry links to a rendered Markdown version and its website page. Markdown exports contain the published content, including expanded FAQs, tables and article listings.\n';
for(const group of ['Pages and documentation','Articles','Archives']){
 index+=`\n## ${group}\n\n`;
 for(const page of documents.filter(p=>p.group===group)){
  const title=page.title.replace(/[\[\]]/g,'');
  index+=`- [${title}](./${page.route}index.md) (${page.lang}) — [Website](./${page.route})\n`;
 }
}
await fs.writeFile(path.join(buildDir,'llms.txt'),index);
console.log(`Generated llms.txt and ${documents.length} rendered Markdown pages.`);
