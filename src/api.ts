const key='moodcorp.session';
const preview=import.meta.env.DEV&&new URLSearchParams(location.search).get('preview')==='1';
let current=localStorage.getItem(key)||sessionStorage.getItem(key)||'';
export function setSession(token:string,remember=false){localStorage.removeItem(key);sessionStorage.removeItem(key);current=token;if(token)(remember?localStorage:sessionStorage).setItem(key,token);}
export const hasSession=()=>!!current||preview;
export async function api<T=any>(path:string,body?:unknown,method?:string):Promise<T>{const res=await fetch('/api'+path+(preview?'?local-preview=1':''),{method:method||(body===undefined?'GET':'POST'),headers:{'Content-Type':'application/json',...(current?{Authorization:'Bearer '+current}:{}),...(preview?{'X-MoodCorp-Preview':'local-only'}:{})},body:body===undefined?undefined:JSON.stringify(body)});const data=await res.json();if(!res.ok){if(res.status===401&&current){setSession('');window.dispatchEvent(new Event('moodcorp:logout'));}throw Error(data.error||'Não foi possível concluir.');}return data;}
