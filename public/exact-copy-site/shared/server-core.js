(function(){
  'use strict';
  const j=async(url,opts={})=>{
    const r=await fetch(url,{credentials:'same-origin',...opts,headers:{...(opts.body?{'Content-Type':'application/json'}:{}),...(opts.headers||{})}});
    const out=await r.json().catch(()=>({ok:false,error:`HTTP ${r.status}`}));
    if(!r.ok){const e=new Error(out.error||`Request failed (${r.status})`);e.status=r.status;e.payload=out;throw e}return out;
  };
  let stateTimer=null,lastSavedState='',lastSavedObject={},stateRevision=0,stateSaveQueue=Promise.resolve();
  function clone(v){return v==null?v:JSON.parse(JSON.stringify(v))}
  function same(a,b){return JSON.stringify(a)===JSON.stringify(b)}
  function diffOps(base,next,path=[],out=[]){
    if(same(base,next))return out;
    const baseObj=base&&typeof base==='object'&&!Array.isArray(base),nextObj=next&&typeof next==='object'&&!Array.isArray(next);
    if(baseObj&&nextObj){
      const keys=new Set([...Object.keys(base),...Object.keys(next)]);
      for(const key of keys){if(!(key in next))out.push({type:'delete',path:[...path,key]});else if(!(key in base))out.push({type:'set',path:[...path,key],value:next[key]});else diffOps(base[key],next[key],[...path,key],out)}
      return out;
    }
    if(path.length)out.push({type:'set',path,value:next});
    return out;
  }
  async function me(){return (await j('/api/auth/me')).user}
  async function login(email,password,remember=false){return (await j('/api/auth/login',{method:'POST',body:JSON.stringify({email,password,remember})})).user}
  async function setup(memberId,email,password,role='member'){return (await j('/api/auth/setup',{method:'POST',body:JSON.stringify({memberId,email,password,role})})).user}
  async function logout(){return j('/api/auth/logout',{method:'POST',body:'{}'})}
  async function invite(memberId,authorized){return j('/api/auth/invite',{method:'POST',body:JSON.stringify({memberId,authorized})})}
  async function loadState(){const out=await j('/api/state'),state=out.state;stateRevision=Number(out.revision||0);if(state&&typeof state==='object'){lastSavedObject=clone(state);lastSavedState=JSON.stringify(state)}else{lastSavedObject={};lastSavedState=''}return state}
  function saveState(state){const snapshot=clone(state),text=JSON.stringify(snapshot);if(text===lastSavedState)return Promise.resolve(true);const task=stateSaveQueue.catch(()=>{}).then(async()=>{if(text===lastSavedState)return true;const ops=diffOps(lastSavedObject,snapshot);if(!ops.length)return true;const out=await j('/api/state/patch',{method:'POST',body:JSON.stringify({baseRevision:stateRevision,ops})});stateRevision=Number(out.revision||stateRevision);lastSavedObject=snapshot;lastSavedState=text;return true});stateSaveQueue=task;return task}
  function scheduleState(state){clearTimeout(stateTimer);stateTimer=setTimeout(()=>saveState(state).catch(()=>{}),450)}
  async function readiness(){return j('/api/system/readiness')}
  async function auditContract(contractKey,action,payload){return j('/api/contracts/audit',{method:'POST',body:JSON.stringify({contractKey,action,payload})})}
  async function sendEmail(payload){return j('/api/email/send',{method:'POST',body:JSON.stringify(payload)})}
  async function createCheckout(payload){return j('/api/payments/checkout',{method:'POST',body:JSON.stringify({...payload,origin:location.origin})})}
  async function route(origin,destination){return j(`/api/maps/route?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}`)}
  async function startGoogleCalendar(){return j('/api/calendar/google/start')}
  async function listMessages(channelId){return (await j(`/api/messages?channel=${encodeURIComponent(channelId||'general')}`)).messages||[]}
  async function sendMessage(channelId,body){return (await j('/api/messages',{method:'POST',body:JSON.stringify({channelId,body})})).message}
  window.PALineServer={me,login,setup,logout,invite,loadState,saveState,scheduleState,readiness,auditContract,sendEmail,createCheckout,route,startGoogleCalendar,listMessages,sendMessage};
})();
