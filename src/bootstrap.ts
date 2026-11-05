function showStartupError(){
 const heading=document.getElementById('startup-title');
 const description=document.getElementById('startup-description');
 if(heading)heading.textContent='Vamos carregar a versão atual?';
 if(description)description.textContent='A conexão ou uma atualização interrompeu o carregamento. Toque abaixo para tentar novamente.';
 document.getElementById('startup')?.classList.add('startup-failed');
}
document.getElementById('startup-reload')?.addEventListener('click',event=>{
 event.preventDefault();const url=new URL(location.href);url.searchParams.set('atualizar',String(Date.now()));location.replace(url.href);
});
window.addEventListener('vite:preloadError',event=>{event.preventDefault();showStartupError();});
import('./main.tsx').catch(showStartupError);
