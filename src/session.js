const key='moodcorp.session';
const valid=value=>typeof value==='string'&&/^[\w-]{43}$/.test(value)?value:'';
// Storage access can throw in private mode, embedded browsers and devices that
// block site data. In that case authentication still works for this open tab.
export function createSessionState(environment=globalThis){
 const storage=name=>{try{return environment[name];}catch{return null;}};
 const read=name=>{try{return valid(storage(name)?.getItem(key));}catch{return '';}};
 let current=read('localStorage')||read('sessionStorage');
 return {get:()=>current,set(value,remember=false){
  current=valid(value);
  for(const name of ['localStorage','sessionStorage'])try{storage(name)?.removeItem(key);}catch{}
  if(!current)return;
  const names=remember?['localStorage','sessionStorage']:['sessionStorage'];
  for(const name of names)try{const target=storage(name);if(target){target.setItem(key,current);return;}}catch{}
 }};
}
