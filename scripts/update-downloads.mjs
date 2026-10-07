import fs from 'node:fs/promises';
import {isDeepStrictEqual} from 'node:util';
import {pathToFileURL} from 'node:url';

const endpoint='https://downloads.crowbackup.ch/v1/current-version.json';

export function validateRelease(release){
 if(!release||typeof release.version!=='string'||!release.version.trim()||release.version.length>100)throw Error('Release version is missing or invalid');
 for(const platform of ['windows','linux','mac','macAarch64']){
  const value=release.installer?.[platform];
  if(typeof value!=='string')throw Error(`Missing ${platform} installer`);
  const url=new URL(value);
  if(url.origin!=='https://downloads.crowbackup.ch'||url.username||url.password||url.pathname==='/')throw Error(`Invalid ${platform} installer URL`);
 }
 return release;
}

export async function updateDownloads({file='data/downloads.json',fetchImpl=fetch}={}){
 let response;
 for(let attempt=0;attempt<3;attempt++){
  try{
   response=await fetchImpl(endpoint,{signal:AbortSignal.timeout(10000)});
   if(!response.ok)throw Error(`Release endpoint returned HTTP ${response.status}`);
   break;
  }catch(error){
   if(attempt===2)throw error;
   await new Promise(resolve=>setTimeout(resolve,1000));
  }
 }
 // Validate before touching the committed fallback. Compare parsed data so
 // formatting and key order alone cannot create an automated commit.
 const release=validateRelease(await response.json());
 const current=JSON.parse(await fs.readFile(file,'utf8'));
 const changed=!isDeepStrictEqual(current,release);
 if(changed)await fs.writeFile(file,JSON.stringify(release,null,2)+'\n');
 return {changed,version:release.version};
}

if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 const result=await updateDownloads();
 console.log(`${result.changed?'Updated':'Unchanged'} download fallback: ${result.version}`);
}
