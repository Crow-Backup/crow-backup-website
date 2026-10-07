import fs from 'node:fs';
import {load} from 'cheerio';
const pages=JSON.parse(fs.readFileSync('pages-api.json'));
for(const page of pages.filter(x=>!x.link.includes('/en/'))){
 const $=load(page.content.rendered); $('style,script').remove();
 console.log('\nPAGE '+page.link+'\n'+$.text().replace(/\s+/g,' ').slice(0,5500));
 console.log('LINKS', $('a').map((i,e)=>$(e).attr('href')).get());
}
