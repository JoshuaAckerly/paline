import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import vm from 'node:vm';
import {spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const temp=fs.mkdtempSync(path.join(os.tmpdir(),'paline-repair-test-'));
// Run a copied server, with separate port markers and a disposable vault.
fs.copyFileSync(path.join(root,'server.mjs'),path.join(temp,'server.mjs'));
fs.cpSync(path.join(root,'PA_LINE_PLATFORM'),path.join(temp,'PA_LINE_PLATFORM'),{recursive:true});
const child=spawn(process.execPath,[path.join(temp,'server.mjs')],{env:{...process.env,PA_LINE_PORT:'0',PA_LINE_VAULT_DIR:path.join(temp,'vault')},stdio:['ignore','pipe','pipe']});
let log='';child.stdout.on('data',s=>log+=s);child.stderr.on('data',s=>log+=s);
const pass=name=>console.log('PASS',name);
try{
 const deadline=Date.now()+10000;
 while(!log.includes('running at')&&Date.now()<deadline)await new Promise(r=>setTimeout(r,50));
 assert.match(log,/running at http/);const base=log.match(/http:\/\/127\.0\.0\.1:\d+/)[0];
 for(const route of ['/','/booking/','/crew/','/crew/sw-reset.html','/shared/bridge.js','/shared/vault.js','/crew/assets/pa-line-rose.png'])assert.equal((await fetch(base+route)).status,200,route);
 pass('main pages and shared assets');
 for(const route of ['/booking','/crew']){const r=await fetch(base+route,{redirect:'manual'});assert.equal(r.status,308);assert.equal(r.headers.get('location'),route+'/')}
 pass('directory URL redirects preserve relative assets');
 for(const route of ['/%ZZ','/%00','/..%5cserver.mjs'])assert.equal((await fetch(base+route)).status,403,route);
 assert.equal((await fetch(base+'/')).status,200);pass('malformed paths do not crash server');
 const post=body=>fetch(base+'/api/vault',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
 const snapshot={schema:1,reason:'manual',localStorage:{paline_test:'original'}};
 assert.equal((await post(snapshot)).status,200);
 for(const invalid of [{},{localStorage:[]},{localStorage:{paline_test:3}}])assert.equal((await post(invalid)).status,400);
 assert.equal((await(await fetch(base+'/api/vault')).json()).localStorage.paline_test,'original');
 await post({...snapshot,reason:'before-import'});await post({...snapshot,reason:'import',localStorage:{paline_test:'imported'}});
 assert.equal((await(await fetch(base+'/api/vault/export')).json()).localStorage.paline_test,'imported');
 assert.ok(fs.readdirSync(path.join(temp,'vault/backups')).some(n=>JSON.parse(fs.readFileSync(path.join(temp,'vault/backups',n))).localStorage.paline_test==='original'));
 pass('vault rejects invalid snapshots and retains safety backup');
 const audio=base+'/api/vault/audio?key=repair-test';
 assert.equal((await fetch(audio,{method:'POST',headers:{'Content-Type':'audio/wav','X-PA-Line-File-Name':'test.wav'},body:'test audio'})).status,200);
 assert.equal(await(await fetch(audio)).text(),'test audio');await fetch(audio,{method:'DELETE'});assert.equal((await fetch(audio)).status,404);pass('audio vault round trip');
 const storage=new Map();const context={window:{},localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)},console};vm.createContext(context);
 vm.runInContext(fs.readFileSync(path.join(root,'PA_LINE_PLATFORM/shared/bridge.js'),'utf8'),context);
 const bridge=context.window.PALineBridge;
 const inquiry=bridge.submitBooking({requestStage:'inquiry',source:'special',budgetText:'Not sure yet',timingNotes:'Next spring',preferredContact:'Text',contactPhone:'555-0100'});
 assert.equal(inquiry.start,'');assert.equal(inquiry.end,'');assert.equal(inquiry.lineupId,'');assert.match(inquiry.adminNotes,/Next spring/);assert.match(inquiry.adminNotes,/Not sure yet/);assert.equal(bridge.listBookings().length,1);
 context.localStorage.setItem=()=>{throw Error('quota')};assert.throws(()=>bridge.submitBooking({}),/quota/);pass('inquiry details preserved and storage errors propagate');
 for(const rel of ['booking/index.html','crew/index.html']){
  const html=fs.readFileSync(path.join(root,'PA_LINE_PLATFORM',rel),'utf8');
  for(const [i,m] of [...html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi)].entries())new vm.Script(m[1],{filename:rel+':'+i});
 }
 pass('all inline JavaScript parses');
 class Storage{constructor(){this.items=new Map()}get length(){return this.items.size}key(i){return [...this.items.keys()][i]}getItem(k){return this.items.get(k)??null}setItem(k,v){if(k==='paline_fail')throw Error('quota');this.items.set(k,String(v))}removeItem(k){this.items.delete(k)}clear(){this.items.clear()}}
 const local=new Storage();local.setItem('paline_original','keep');let backupStatus=200,reloaded=false;
 class XHR{open(method){this.method=method}setRequestHeader(){}send(){this.status=this.method==='GET'?200:backupStatus;this.responseText='{"localStorage":{}}'}}
 const vaultContext={Storage,localStorage:local,XMLHttpRequest:XHR,window:{addEventListener(){}},document:{addEventListener(){}},location:{reload(){reloaded=true}},fetch:async()=>({ok:true}),setTimeout:()=>0,clearTimeout(){},console};
 vm.createContext(vaultContext);vm.runInContext(fs.readFileSync(path.join(root,'PA_LINE_PLATFORM/shared/vault.js'),'utf8'),vaultContext);
 const importFile=obj=>vaultContext.window.PALineDataVault.importBackup({text:async()=>JSON.stringify(obj)});
 await assert.rejects(()=>importFile({localStorage:[]}),/not a PA LINE/);assert.equal(local.getItem('paline_original'),'keep');
 backupStatus=500;await assert.rejects(()=>importFile({localStorage:{paline_new:'value'}}),/safety backup failed/);assert.equal(local.getItem('paline_original'),'keep');
 backupStatus=200;await assert.rejects(()=>importFile({localStorage:{paline_new:'value',paline_fail:'quota'}}),/quota/);assert.equal(local.getItem('paline_original'),'keep');assert.equal(local.getItem('paline_new'),null);
 await importFile({localStorage:{paline_new:'value'}});assert.equal(local.getItem('paline_new'),'value');assert.equal(local.getItem('paline_original'),null);assert.equal(reloaded,true);
 pass('browser backup import validates, protects old data, rolls back quota failure, and restores valid data');
}finally{
 child.kill();await new Promise(r=>child.exitCode!==null?r():child.once('exit',r));
 console.log('Isolated test files:',temp);
}
