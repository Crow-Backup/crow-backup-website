const menu=document.querySelector('.menu-toggle');
const navigation=document.querySelector('#navigation');
function closeMenu(){menu?.setAttribute('aria-expanded','false');navigation?.classList.remove('is-open');}
menu?.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(open));navigation.classList.toggle('is-open',open);});
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&menu?.getAttribute('aria-expanded')==='true'){closeMenu();menu.focus();}});
navigation?.addEventListener('click',event=>{if(event.target.closest('a'))closeMenu();});
window.matchMedia('(min-width: 951px)').addEventListener('change',event=>{if(event.matches)closeMenu();});
document.querySelectorAll('[data-details]').forEach(button=>button.addEventListener('click',()=>{document.querySelectorAll('.faq-item').forEach(details=>details.open=button.dataset.details==='open');}));
// Build-time links work without JavaScript; this refreshes them when releases change.
if(document.querySelector('[data-installer]')){
 const controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),5000);
 fetch('https://downloads.crowbackup.ch/v1/current-version.json',{signal:controller.signal})
  .then(response=>{if(!response.ok)throw Error('Release unavailable');return response.json();})
  .then(release=>{
   document.querySelectorAll('[data-installer]').forEach(link=>{
    const value=release.installer?.[link.dataset.installer];
    if(value && new URL(value).origin==='https://downloads.crowbackup.ch')link.href=value;
   });
   if(typeof release.version==='string')document.querySelectorAll('[data-version]').forEach(element=>element.textContent=release.version);
  }).catch(()=>{/* Keep the usable build-time download links. */}).finally(()=>clearTimeout(timeout));
}
