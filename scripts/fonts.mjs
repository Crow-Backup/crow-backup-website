import fs from 'node:fs/promises';
const families=[['Manrope','Manrope:wght@400;500;600;700;800'],['IBM Plex Sans','IBM+Plex+Sans:wght@400;500;600']];
await fs.mkdir('static/fonts',{recursive:true});
let output='/* Self-hosted Google Fonts. Both families use the SIL Open Font License. */\n';
for(const [name,query] of families){
 const response=await fetch(`https://fonts.googleapis.com/css2?family=${query}&display=swap`,{headers:{'User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36'}});
 if(!response.ok)throw Error(`Font CSS: ${response.status}`);
 const css=await response.text();const blocks=[...css.matchAll(/\/\* (latin(?:-ext)?) \*\/\s*(@font-face\s*\{[^}]+\})/g)];
 if(!blocks.length)throw Error(`Missing Latin subset for ${name}`);
 for(const [,subset,block] of blocks){
  const remote=block.match(/url\(([^)]+)\)/)[1];const weight=block.match(/font-weight:\s*([^;]+)/)[1].replaceAll(' ','-');
  const filename=`${name.toLowerCase().replaceAll(' ','-')}-${subset}-${weight}.woff2`;
  const data=await fetch(remote);if(!data.ok)throw Error(`Font binary: ${data.status}`);
  await fs.writeFile(`static/fonts/${filename}`,Buffer.from(await data.arrayBuffer()));
  output+=`/* ${subset} */\n${block.replace(remote,`../fonts/${filename}`)}\n`;
 }
 const license=await fetch(`https://raw.githubusercontent.com/google/fonts/main/ofl/${name.toLowerCase().replaceAll(' ','')}/OFL.txt`);
 if(!license.ok)throw Error(`Font license: ${license.status}`);
 await fs.writeFile(`static/fonts/${name.replaceAll(' ','-')}-OFL.txt`,await license.text());
}
await fs.mkdir('static/css',{recursive:true});await fs.writeFile('static/css/fonts.css',output);
console.log('Downloaded self-hosted Latin and Latin Extended fonts and licenses.');
