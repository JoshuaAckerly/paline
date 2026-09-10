(function(){
  "use strict";
  const API="/api/vault";
  const PREFIXES=["PA_LINE_","paline_"];
  let suspended=false,timer=null,pending=Promise.resolve();
  const nativeSet=Storage.prototype.setItem,nativeRemove=Storage.prototype.removeItem,nativeClear=Storage.prototype.clear;
  const isKey=key=>PREFIXES.some(p=>String(key||"").startsWith(p));
  function snapshot(){
    const store={};
    try{for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(isKey(k))store[k]=localStorage.getItem(k)}}catch(e){}
    return {schema:1,localStorage:store,clientAt:new Date().toISOString()};
  }
  function restoreMissing(){
    try{
      const xhr=new XMLHttpRequest();xhr.open("GET",API,false);xhr.send();if(xhr.status!==200)return;
      const saved=JSON.parse(xhr.responseText||"{}")?.localStorage;if(!saved||typeof saved!=="object")return;
      suspended=true;
      for(const [k,v] of Object.entries(saved))if(isKey(k)&&localStorage.getItem(k)===null)nativeSet.call(localStorage,k,String(v));
      suspended=false;
    }catch(e){suspended=false}
  }
  function post(reason="auto",sync=false){
    if(suspended)return false;const body=JSON.stringify({...snapshot(),reason});
    try{
      if(sync){const xhr=new XMLHttpRequest();xhr.open("POST",API,false);xhr.setRequestHeader("Content-Type","application/json");xhr.send(body);return xhr.status>=200&&xhr.status<300}
      pending=pending.then(()=>fetch(API,{method:"POST",headers:{"Content-Type":"application/json"},body})).then(r=>r.ok).catch(()=>false);return pending;
    }catch(e){return false}
  }
  function schedule(){if(suspended)return;clearTimeout(timer);timer=setTimeout(()=>post("auto",false),350)}
  restoreMissing();
  Storage.prototype.setItem=function(k,v){const r=nativeSet.call(this,k,v);if(this===localStorage&&isKey(k))schedule();return r};
  Storage.prototype.removeItem=function(k){const r=nativeRemove.call(this,k);if(this===localStorage&&isKey(k))schedule();return r};
  Storage.prototype.clear=function(){const r=nativeClear.call(this);if(this===localStorage)schedule();return r};
  async function importBackup(file){
    const payload=JSON.parse(await file.text());const saved=payload?.localStorage;
    if(!saved||typeof saved!=="object"||Array.isArray(saved)||!Object.keys(saved).length||Object.entries(saved).some(([k,v])=>!isKey(k)||typeof v!=="string"))throw new Error("This is not a valid, non-empty PA LINE Data Vault backup.");
    clearTimeout(timer);
    if(!await post("before-import"))throw new Error("Safety backup failed. Nothing was imported. Check that the local server is running.");
    const previous=snapshot().localStorage;
    suspended=true;
    try{
      const keys=[];for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(isKey(k))keys.push(k)}
      keys.forEach(k=>nativeRemove.call(localStorage,k));
      for(const [k,v] of Object.entries(saved))if(isKey(k))nativeSet.call(localStorage,k,String(v));
      suspended=false;
      if(!await post("import"))throw new Error("The imported backup could not be saved to the Data Vault.");
    }catch(err){
      suspended=true;
      Object.keys(snapshot().localStorage).forEach(k=>nativeRemove.call(localStorage,k));
      for(const [k,v] of Object.entries(previous))nativeSet.call(localStorage,k,v);
      throw err;
    }finally{suspended=false}
    location.reload();
  }
  async function saveAudio(key,file){
    if(!key||!file)return false;
    try{return (await fetch(`/api/vault/audio?key=${encodeURIComponent(key)}`,{method:"POST",headers:{"Content-Type":file.type||"application/octet-stream","X-PA-Line-File-Name":encodeURIComponent(file.name||"practice-audio")},body:file})).ok}catch(e){return false}
  }
  async function loadAudio(key){
    if(!key)return null;
    try{const r=await fetch(`/api/vault/audio?key=${encodeURIComponent(key)}`);if(!r.ok)return null;const blob=await r.blob();let name="practice-audio";try{name=decodeURIComponent(r.headers.get("X-PA-Line-File-Name")||"")||name}catch(e){};try{return new File([blob],name,{type:blob.type||"application/octet-stream"})}catch(e){return blob}}catch(e){return null}
  }
  async function deleteAudio(key){try{return (await fetch(`/api/vault/audio?key=${encodeURIComponent(key)}`,{method:"DELETE"})).ok}catch(e){return false}}
  function download(){const a=document.createElement("a");a.href=`/api/vault/export?cb=${Date.now()}`;a.download="PA_LINE_DATA_BACKUP.json";document.body.appendChild(a);a.click();a.remove()}
  window.PALineDataVault={backupNow:(r="manual")=>post(r,false),backupNowSync:(r="manual")=>post(r,true),download,importBackup,saveAudio,loadAudio,deleteAudio,snapshot};
  setTimeout(()=>post("startup",false),0);
  document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="hidden")post("background",false)});
  window.addEventListener("beforeunload",()=>{try{navigator.sendBeacon?.(API,new Blob([JSON.stringify({...snapshot(),reason:"unload"})],{type:"application/json"}))}catch(e){}});
})();
