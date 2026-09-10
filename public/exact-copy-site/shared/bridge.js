(function(){
  const KEY="paline_platform_bridge_v1";
  const CHANNEL="paline-platform";

  function normalizeData(data){
    data=data&&typeof data==="object"?data:{};
    for(const key of ["bookingRequests","demandRequests","loyaltyProfiles"])data[key]=Array.isArray(data[key])?data[key].filter(p=>p&&typeof p==="object"):[];
    data.loyaltyProfiles.forEach(p=>{p.activity=Array.isArray(p.activity)?p.activity.filter(a=>a&&typeof a==="object"):[];p.points=Number.isFinite(Number(p.points))?Math.max(0,Number(p.points)):0});
    return data;
  }
  function load(){
    try{return normalizeData(JSON.parse(localStorage.getItem(KEY)||'{}'))}catch(e){return normalizeData({})}
  }
  function save(data){
    data=normalizeData(data);localStorage.setItem(KEY,JSON.stringify(data));
    try{const bc=new BroadcastChannel(CHANNEL);bc.postMessage({type:"bridge-update",at:new Date().toISOString()});bc.close()}catch(e){}
  }
  function uid(prefix="req"){return prefix+"_"+Date.now()+"_"+Math.random().toString(36).slice(2,8)}
  function serverSubmit(kind,payload){try{fetch("/api/public/request",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({kind,payload}),credentials:"same-origin"}).catch(()=>{})}catch(e){}}
  function normalizeBooking(payload){
    return {id:payload.id||uid(),createdAt:payload.createdAt||new Date().toISOString(),source:"public-booking",status:"pending-command-review",venue:payload.venue||payload.venueName||payload.organization||"Booking request",city:payload.city||"",state:payload.state||"",date:payload.date||payload.eventDate||"",start:payload.start||payload.startTime||"19:00",end:payload.end||payload.endTime||"22:00",lineupId:payload.lineupId||payload.format||"full",bookingChannel:payload.bookingChannel||"standard",bookingType:payload.bookingType||"performance",bookingTypeLabel:payload.bookingTypeLabel||"",bookingTypeDetails:payload.bookingTypeDetails||{},pay:Number(payload.pay||payload.total||payload.quoteTotal||0),attendanceProvided:Number(payload.attendance||payload.expectedAttendance||0),travelBeforeHours:Number(payload.travelBeforeHours||0),travelAfterHours:Number(payload.travelAfterHours||0),contactName:payload.contactName||payload.bookerName||"",contactEmail:payload.contactEmail||payload.email||"",contactPhone:payload.contactPhone||payload.phone||"",adminNotes:payload.adminNotes||payload.notes||"",raw:payload};
  }
  function submitBooking(payload){const data=load(),item=normalizeBooking(payload),existing=data.bookingRequests.find(x=>x.id===item.id);if(existing){serverSubmit("booking",existing);return existing}data.bookingRequests.unshift(item);save(data);serverSubmit("booking",item);return item}
  function listBookings(){return load().bookingRequests||[]}
  function updateBooking(id,patch){const data=load(),item=data.bookingRequests.find(x=>x.id===id);if(!item)return null;Object.assign(item,patch,{updatedAt:new Date().toISOString()});save(data);return item}

  function loyaltyTier(points){const p=Number(points||0);return p>=120?"Hometown Hero":p>=60?"Route Builder":p>=25?"Street Team":"Supporter"}
  function loyaltyProfile(data,email,seed={}){
    const key=String(email||"").trim().toLowerCase();if(!key)return null;
    let p=data.loyaltyProfiles.find(x=>String(x.email||"").trim().toLowerCase()===key);
    if(!p){p={id:uid("fan"),name:seed.name||"",email:key,phone:seed.phone||"",city:seed.city||"",state:seed.state||"",points:0,tier:"Supporter",activity:[],createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()};data.loyaltyProfiles.unshift(p)}
    Object.assign(p,{name:seed.name||p.name,phone:seed.phone||p.phone,city:seed.city||p.city,state:seed.state||p.state});p.activity ||= [];return p;
  }
  function normalizeDemand(payload){return {id:payload.id||uid("demand"),createdAt:payload.createdAt||new Date().toISOString(),status:"pending-command-review",source:"public-demand",role:payload.role||"fan",name:payload.name||"",email:payload.email||"",phone:payload.phone||"",city:payload.city||"",state:payload.state||"",zip:payload.zip||"",venue:payload.venue||"",alternateVenue:payload.alternateVenue||"",party:Number(payload.party||1),actions:Array.isArray(payload.actions)?payload.actions:[],notes:payload.notes||"",updates:payload.updates||"Email",demandScore:Number(payload.demandScore||0),loyaltyPoints:Number(payload.loyaltyPoints||0),raw:payload}}
  function submitDemand(payload){
    const data=load(),item=normalizeDemand(payload),existing=data.demandRequests.find(x=>x.id===item.id);
    if(existing)return {item:existing,profile:getLoyaltyProfile(existing.email)};
    item.loyaltyPoints=Number.isFinite(item.loyaltyPoints)?Math.max(0,item.loyaltyPoints):0;
    data.demandRequests.unshift(item);
    const p=loyaltyProfile(data,item.email,{name:item.name,phone:item.phone,city:item.city,state:item.state});
    if(p&&["fan","connector"].includes(item.role)&&!p.activity.some(a=>a.sourceKey===`demand:${item.id}`)){
      p.points+=item.loyaltyPoints;p.tier=loyaltyTier(p.points);p.activity.unshift({id:uid("loyalty"),at:item.createdAt,points:item.loyaltyPoints,reason:`${item.city}, ${item.state} demand help`,sourceKey:`demand:${item.id}`,kind:"demand"});p.updatedAt=new Date().toISOString();
    }
    save(data);serverSubmit("demand",item);return {item,profile:p};
  }
  function listDemands(){return load().demandRequests||[]}
  function updateDemand(id,patch){const data=load(),item=data.demandRequests.find(x=>x.id===id);if(!item)return null;Object.assign(item,patch,{updatedAt:new Date().toISOString()});save(data);return item}
  function getLoyaltyProfile(email){const data=load(),key=String(email||"").trim().toLowerCase();return data.loyaltyProfiles.find(p=>String(p.email||"").trim().toLowerCase()===key)||null}
  function adjustLoyalty(email,points,reason,meta={}){const data=load(),p=loyaltyProfile(data,email);if(!p)return null;const sourceKey=meta.sourceKey||"";if(sourceKey&&p.activity.some(a=>a.sourceKey===sourceKey))return p;p.points=Math.max(0,Number(p.points||0)+Number(points||0));p.tier=loyaltyTier(p.points);p.activity.unshift({id:uid("loyalty"),at:new Date().toISOString(),points:Number(points||0),reason:reason||"Loyalty adjustment",sourceKey,kind:meta.kind||"manual"});p.updatedAt=new Date().toISOString();save(data);return p}

  window.PALineBridge={load,save,submitBooking,listBookings,updateBooking,submitDemand,listDemands,updateDemand,getLoyaltyProfile,adjustLoyalty,key:KEY};
})();
