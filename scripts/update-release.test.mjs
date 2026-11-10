import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {mergeNotes,convertWhitepaper,updateRelease} from './update-release.mjs';
const original='{"title":"Release Notes"}\n\n## Version 1.126 | Old {#old}\n\n- Existing text\n';
const html='<div id="content">'+['1.128','1.127','1.126'].map(v=>`<div class="sect3"><h4 id="v${v}">Version ${v} | Changes</h4><ul><li>Fix ${v}</li></ul></div>`).join('')+'</div>';
test('new notes preserve historical text and anchors and are idempotent',()=>{
 const result=mergeNotes(original,html,'1.128');
 assert.ok(result.endsWith(original.slice(original.indexOf('\n##'))));
 assert.ok(result.includes('## Version 1.128 | Changes {#v1.128}'));
 assert.equal(mergeNotes(result,html,'1.128'),result);
 assert.throws(()=>mergeNotes(original,html,'1.129'),/match/);
 assert.throws(()=>mergeNotes(original,html.replaceAll('1.126','1.125'),'1.128'),/existing/);
});
const paper='<div id="content"><h2 id="encryption">Encryption</h2><p>'+ 'Technical text. '.repeat(100)+'</p><h2 id="transfer">Transfer</h2><h2 id="storage">Storage</h2><a href="https://crowbackup.ch/en/download/">Download</a></div>';
test('whitepaper conversion preserves metadata, anchors and local links',()=>{
 const source='{"url":"/en/en-whitepaper/","description":"Keep"}\n\nOld body';
 const result=convertWhitepaper(source,paper,'https://downloads.crowbackup.ch/docs/WhitePaper_en.html');
 assert.ok(result.startsWith(source.split('\n\n')[0]));
 assert.ok(result.includes('## Encryption {#encryption}'));
 assert.ok(result.includes('(/en/download/)'));
 assert.equal(convertWhitepaper(result,paper,'https://downloads.crowbackup.ch/docs/WhitePaper_en.html'),result);
 assert.throws(()=>convertWhitepaper(source,'<div id="content">Error</div>','https://example.org'),/Incomplete/);
 assert.throws(()=>convertWhitepaper(source,paper.replace('</div>','<script>alert(1)</script></div>'),'https://example.org'),/Unsafe/);
});
test('invalid documentation leaves all files unchanged',async t=>{
 const dir=await fs.mkdtemp(path.join(os.tmpdir(),'crow-release-'));
 t.after(()=>fs.rm(dir,{recursive:true,force:true}));
 const file=path.join(dir,'downloads.json'),notesFile=path.join(dir,'notes.md'),paperFile=path.join(dir,'paper.md');
 await fs.writeFile(file,'{}');await fs.writeFile(notesFile,original);await fs.writeFile(paperFile,'{}\n\nOld');
 const release={version:'1.128',installer:Object.fromEntries(['windows','linux','mac','macAarch64'].map(p=>[p,`https://downloads.crowbackup.ch/${p}`]))};
 await assert.rejects(updateRelease({file,notesFile,documents:[{file:paperFile,url:'https://example.org/paper'}],fetchImpl:async url=>({ok:true,json:async()=>release,text:async()=>url.endsWith('ReleaseNotes.html')?html:'invalid'})}),/Incomplete/);
 assert.equal(await fs.readFile(file,'utf8'),'{}');assert.equal(await fs.readFile(notesFile,'utf8'),original);
});
test('one refresh updates downloads, notes and whitepaper, then becomes a no-op',async t=>{
 const dir=await fs.mkdtemp(path.join(os.tmpdir(),'crow-release-'));
 t.after(()=>fs.rm(dir,{recursive:true,force:true}));
 const file=path.join(dir,'downloads.json'),notesFile=path.join(dir,'notes.md'),paperFile=path.join(dir,'paper.md');
 await fs.writeFile(file,'{}');await fs.writeFile(notesFile,original);await fs.writeFile(paperFile,'{}\n\nOld');
 const release={version:'1.128',installer:Object.fromEntries(['windows','linux','mac','macAarch64'].map(p=>[p,`https://downloads.crowbackup.ch/${p}`]))};
 const options={file,notesFile,documents:[{file:paperFile,url:'https://example.org/paper'}],fetchImpl:async url=>({ok:true,json:async()=>release,text:async()=>url.endsWith('ReleaseNotes.html')?html:paper})};
 const result=await updateRelease(options);
 assert.equal(result.changed,true);assert.equal(result.notesChanged,true);assert.equal(result.whitepapersChanged,1);
 const again=await updateRelease(options);
 assert.equal(again.changed,false);assert.equal(again.notesChanged,false);assert.equal(again.whitepapersChanged,0);
});
