import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {updateDownloads} from './update-downloads.mjs';

const release={version:'1.126',installer:Object.fromEntries(['windows','linux','mac','macAarch64'].map(p=>[p,`https://downloads.crowbackup.ch/v1/${p}-1.126.zip`]))};
async function fixture(t){
 const dir=await fs.mkdtemp(path.join(os.tmpdir(),'crow-downloads-'));
 t.after(()=>fs.rm(dir,{recursive:true,force:true}));
 const file=path.join(dir,'downloads.json');
 const content=JSON.stringify(release,null,4)+'\r\n';
 await fs.writeFile(file,content);
 return {file,content};
}
const fetchRelease=value=>async()=>({ok:true,json:async()=>value});

test('identical data in a different key order does not rewrite the fallback',async t=>{
 const {file,content}=await fixture(t);
 const result=await updateDownloads({file,fetchImpl:fetchRelease({installer:release.installer,version:release.version})});
 assert.equal(result.changed,false);
 assert.equal(await fs.readFile(file,'utf8'),content);
});

test('a new release updates both version and all installer links',async t=>{
 const {file}=await fixture(t);
 const next={version:'1.127',installer:Object.fromEntries(Object.entries(release.installer).map(([p,url])=>[p,url.replace('1.126','1.127')]))};
 assert.equal((await updateDownloads({file,fetchImpl:fetchRelease(next)})).changed,true);
 assert.deepEqual(JSON.parse(await fs.readFile(file,'utf8')),next);
});

for(const [name,invalid] of [
 ['missing installer',{version:'1.127',installer:{windows:release.installer.windows}}],
 ['untrusted download host',{...release,installer:{...release.installer,windows:'https://example.org/installer.exe'}}],
 ['HTTP download',{...release,installer:{...release.installer,windows:'http://downloads.crowbackup.ch/installer.exe'}}],
 ['invalid version',{...release,version:null}],
])test(`${name} is rejected without changing the fallback`,async t=>{
 const {file,content}=await fixture(t);
 await assert.rejects(updateDownloads({file,fetchImpl:fetchRelease(invalid)}));
 assert.equal(await fs.readFile(file,'utf8'),content);
});
