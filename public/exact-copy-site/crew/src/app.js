
const APP_KEY = "PA_LINE_CREW_COMMAND_V1";
const AUDIO_DB = "PA_LINE_CREW_AUDIO_V1";
const AUDIO_STORE = "audio";
const $ = id => document.getElementById(id);
const esc = value => String(value ?? "").replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const money = n => new Intl.NumberFormat("en-US",{style:"currency",currency:"USD",maximumFractionDigits:0}).format(Number(n)||0);

function isoDate(d){
  const y=d.getFullYear(),m=String(d.getMonth()+1).padStart(2,"0"),day=String(d.getDate()).padStart(2,"0");
  return `${y}-${m}-${day}`;
}
function datePlus(days){
  const d=new Date(); d.setHours(12,0,0,0); d.setDate(d.getDate()+days); return isoDate(d);
}
function dateTime(date,time){
  return new Date(`${date}T${time || "00:00"}:00`);
}
function fmtDate(date){
  if(!date)return "";
  return new Date(`${date}T12:00:00`).toLocaleDateString(undefined,{weekday:"short",month:"short",day:"numeric",year:"numeric"});
}
function fmtDateShort(date){
  if(!date)return "";
  return new Date(`${date}T12:00:00`).toLocaleDateString(undefined,{month:"short",day:"numeric"});
}
function fmtTime(t){
  if(!t)return "";
  const [h,m]=t.split(":").map(Number);
  const d=new Date(); d.setHours(h,m||0,0,0);
  return d.toLocaleTimeString(undefined,{hour:"numeric",minute:"2-digit"});
}
function uid(prefix="id"){return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,8)}`}
function nowISO(){return new Date().toISOString()}
function deepClone(v){return JSON.parse(JSON.stringify(v))}
function getMember(id){return data.members.find(m=>m.id===id)}
function getLineup(id){return data.lineups.find(l=>l.id===id)}
function currentUser(){return getMember(state.userId)}
function isAdmin(){return !!currentUser()?.isAdmin}
function memberName(id){return getMember(id)?.name || "Unknown"}
function formatName(lineupId){return getLineup(lineupId)?.name || lineupId}
function clamp(n,min,max){return Math.max(min,Math.min(max,n))}
function minutesToClock(total){
  total=Math.max(0,Math.floor(total||0));
  const h=Math.floor(total/60),m=total%60;
  return `${h}:${String(m).padStart(2,"0")}`;
}
function parseDuration(value){
  if(!value)return 0;
  if(String(value).includes(":")){
    const [m,s]=String(value).split(":").map(Number);
    return (m||0)*60+(s||0);
  }
  return Number(value)||0;
}
function humanDuration(seconds){
  seconds=Math.floor(seconds||0);
  return `${Math.floor(seconds/60)}:${String(seconds%60).padStart(2,"0")}`;
}
function roleLabel(role){
  return ({lead:"Lead / Acoustic",bass:"Bass",percussion:"Percussion",drums:"Drums",vocals:"Vocals",keys:"Keys",other:"Other"})[role] || role;
}

function defaultData(){
  const members=[
    {id:"trever",name:"Trever",fullName:"Trever Stribing",isAdmin:true,role:"Lead / Acoustic",roles:["lead","vocals"],email:"",phone:"",homeBase:"Depew, NY",notificationPrefs:{push:true,email:true,text:false},calendarConnections:[]},
    {id:"griffin",name:"Griffin",fullName:"Griffin Brady",isAdmin:false,role:"Percussion",roles:["percussion"],email:"",phone:"",homeBase:"Western New York",notificationPrefs:{push:true,email:true,text:false},calendarConnections:[]},
    {id:"andrew",name:"Andrew",fullName:"Andrew Moore",isAdmin:false,role:"Bass / Vocals",roles:["bass","vocals"],email:"",phone:"",homeBase:"Western New York",notificationPrefs:{push:true,email:true,text:false},calendarConnections:[]},
    {id:"michael",name:"Michael",fullName:"Michael Bloom",isAdmin:false,role:"Drums",roles:["drums"],email:"",phone:"",homeBase:"Western New York",notificationPrefs:{push:true,email:true,text:false},calendarConnections:[]}
  ];
  const lineups=[
    {id:"full",name:"Full PA LINE",required:["trever","griffin","andrew","michael"],active:true},
    {id:"duo",name:"Duo",required:["trever","andrew"],active:true},
    {id:"solo",name:"Solo",required:["trever"],active:true}
  ];
  const songs=[
    {
      id:"song_rubies",title:"Rubies",artist:"PA LINE",type:"Original",status:"Performable",
      key:"D",timeSig:"4/4",bpm:92,length:"6:27",tuning:"Open C",capo:"",countIn:"4 count",
      notes:"Build steadily through the middle section. Keep the final vocal entrance clean and deliberate.",
      roleNotes:{lead:"Watch the stop before the final vocal.",bass:"Lock to the kick through the build.",percussion:"Leave space in the first verse, then widen the texture.",drums:"Keep the groove restrained until the build.",vocals:"Support the final lift without crowding the lead."},
      arrangements:[{version:"v4",date:datePlus(-8),summary:"Current live arrangement",active:true},{version:"v3",date:datePlus(-90),summary:"Festival arrangement",active:false}],
      audioTracks:[],publishedAt:nowISO()
    },
    {
      id:"song_confide",title:"Confide",artist:"PA LINE",type:"Original",status:"Performable",
      key:"Em",timeSig:"4/4",bpm:86,length:"5:20",tuning:"Standard / show setup",capo:"",countIn:"Trever count",
      notes:"Keep the first half patient. Dynamics matter more than volume.",
      roleNotes:{lead:"Let the first verse breathe.",bass:"Stay simple under the vocal.",percussion:"Use texture before weight.",drums:"Avoid overplaying the opening."},
      arrangements:[{version:"v2",date:datePlus(-30),summary:"Current band arrangement",active:true}],
      audioTracks:[],publishedAt:nowISO()
    },
    {
      id:"song_shine",title:"Shine",artist:"PA LINE",type:"Original",status:"Performable",
      key:"C",timeSig:"4/4",bpm:108,length:"2:00",tuning:"Open C",capo:"",countIn:"4 count",
      notes:"Short, direct opener option. No dead air before the first vocal.",
      roleNotes:{lead:"Start confidently.",bass:"Enter exactly with the arrangement.",percussion:"Keep the pulse moving.",drums:"Compact and energetic."},
      arrangements:[{version:"v1",date:datePlus(-14),summary:"Current arrangement",active:true}],
      audioTracks:[],publishedAt:nowISO()
    },
    {
      id:"song_ghost",title:"Ghost",artist:"PA LINE",type:"Original",status:"Learning",
      key:"Eb",timeSig:"4/4",bpm:78,length:"4:45",tuning:"Show setup",capo:"",countIn:"Cue",
      notes:"Not currently in the performable pool. Rehearse transitions before publishing.",
      roleNotes:{lead:"Review transition into final section.",bass:"Watch the harmonic shift.",percussion:"Build gradually.",drums:"Hold back until final section."},
      arrangements:[{version:"draft v3",date:datePlus(-2),summary:"Rehearsal draft",active:true}],
      audioTracks:[],publishedAt:null
    }
  ];
  const offers=[
    {
      id:"offer_seed",
      venue:"Example Venue",
      city:"Albany",state:"NY",date:datePlus(12),start:"19:00",end:"22:00",
      lineupId:"full",status:"pending",pay:1200,travelBeforeHours:2,travelAfterHours:2,
      responseDeadline:datePlus(5),adminNotes:"Sample offer for testing the response flow.",
      recipients:["trever","griffin","andrew","michael"],
      responses:{trever:{status:"available",note:"",at:nowISO()}},
      notes:[],
      createdAt:nowISO()
    }
  ];
  return {
    version:2,members,lineups,songs,blocks:[],offers,shows:[],holds:[],rehearsals:[],meetings:[],chatChannels:[],
    notifications:[
      {id:uid("n"),userId:"griffin",title:"New show offer",body:"Example Venue in Albany needs your response.",type:"offer",refId:"offer_seed",read:false,createdAt:nowISO()},
      {id:uid("n"),userId:"andrew",title:"New show offer",body:"Example Venue in Albany needs your response.",type:"offer",refId:"offer_seed",read:false,createdAt:nowISO()},
      {id:uid("n"),userId:"michael",title:"New show offer",body:"Example Venue in Albany needs your response.",type:"offer",refId:"offer_seed",read:false,createdAt:nowISO()}
    ],
    memberSongState:{},
    activity:[{id:uid("a"),text:"Backend prototype initialized.",at:nowISO(),userId:"trever"}],
    settings:{calendarStaleHours:24}
  };
}

function loadData(){
  try{
    const raw=localStorage.getItem(APP_KEY);
    if(raw){
      const parsed=JSON.parse(raw);
      if(parsed && parsed.members && parsed.songs)return parsed;
    }
  }catch(e){}
  return defaultData();
}
let data=loadData();

function startOfWeek(date=new Date()){
  const d=new Date(date);d.setHours(12,0,0,0);
  const day=d.getDay();const diff=day===0?-6:1-day;
  d.setDate(d.getDate()+diff);return isoDate(d);
}
function weekEndDate(weekStart){
  const d=new Date(`${weekStart}T12:00:00`);d.setDate(d.getDate()+6);return isoDate(d);
}
function defaultWeeklyTemplates(){
  return [
    // Trever = 40 points
    {id:"w_t_checkin",ownerId:"trever",category:"Band",title:"Personal band catch-up",detail:"Check in individually with the other members. Surface schedule, morale, gear, money, or show problems before they become emergencies.",points:2,cadence:"weekly"},
    {id:"w_t_plan",ownerId:"trever",category:"Content",title:"Approve weekly content plan + goal",detail:"Pick the week's content goal, strongest live/song story, calls to action, and any show-specific promotion.",points:4,cadence:"weekly"},
    {id:"w_t_booking",ownerId:"trever",category:"Booking",title:"Booking pipeline + follow-ups",detail:"Review active leads, send priority pitches/follow-ups, answer incoming requests, and move stalled opportunities forward.",points:8,cadence:"weekly"},
    {id:"w_t_tour",ownerId:"trever",category:"Tour",title:"Tour routing + planning",detail:"Review routing gaps, target markets, holds, travel efficiency, and next booking priorities.",points:5,cadence:"weekly"},
    {id:"w_t_web",ownerId:"trever",category:"Website",title:"Website accuracy pass",detail:"Verify upcoming shows, ticket links, booking/contact links, EPK essentials, new media, and obvious broken/outdated information.",points:4,cadence:"weekly"},
    {id:"w_t_bmi",ownerId:"trever",category:"Rights",title:"BMI / PRO + catalog admin check",detail:"Review newly released/created works, registrations, splits, metadata, and anything that needs a performing-rights or catalog update.",points:3,cadence:"weekly"},
    {id:"w_t_content",ownerId:"trever",category:"Content",title:"Create 2 source content pieces",detail:"Capture or edit two reusable pieces such as original-song performance, story behind a lyric, live clip, rehearsal moment, or direct-to-camera update.",points:5,cadence:"weekly",subtasks:[{id:"source_content_1",label:"Source content piece 1",done:false,doneBy:null,doneAt:null},{id:"source_content_2",label:"Source content piece 2",done:false,doneBy:null,doneAt:null}]},
    {id:"w_t_songbook",ownerId:"trever",category:"Music",title:"Songbook / setlist admin",detail:"Publish arrangement changes, role notes, new performable songs, and show-specific setlist needs.",points:3,cadence:"weekly"},
    {id:"w_t_finance",ownerId:"trever",category:"Admin",title:"Money + receipts cleanup",detail:"Capture show income/expenses, outstanding payments, travel costs, receipts, and anything the band needs recorded.",points:3,cadence:"weekly"},
    {id:"w_t_review",ownerId:"trever",category:"Band",title:"Weekly ops review",detail:"Close the week: identify missed tasks, blockers, wins, and the top priorities for next week.",points:3,cadence:"weekly"},

    // Griffin = 20 points
    {id:"w_g_checkin",ownerId:"griffin",category:"Band",title:"Personal catch-up",detail:"Update your availability, flag conflicts, and tell the band anything affecting upcoming shows or rehearsals.",points:2,cadence:"weekly"},
    {id:"w_g_tiktok",ownerId:"griffin",category:"Social",title:"TikTok: 5 posts",detail:"Publish up to five useful short-form posts across the week. The main task checks itself when all five post boxes are complete.",points:6,cadence:"weekly",subtasks:Array.from({length:5},(_,i)=>({id:`tiktok_${i+1}`,label:`TikTok post ${i+1}`,done:false,doneBy:null,doneAt:null}))},
    {id:"w_g_capture",ownerId:"griffin",category:"Content",title:"Create 1 fresh short-form asset",detail:"Shoot or edit one vertical clip that can feed TikTok, Reels, Facebook, or Stories.",points:4,cadence:"weekly"},
    {id:"w_g_gear",ownerId:"griffin",category:"Gear",title:"Percussion equipment check",detail:"Inspect heads, hardware, cases, stands, mics/cables if assigned, consumables, and anything likely to fail at the next show.",points:3,cadence:"weekly"},
    {id:"w_g_engage",ownerId:"griffin",category:"Social",title:"Community engagement pass",detail:"Reply to meaningful comments/messages, interact with fans/venues/peer artists, and surface anything that needs admin attention.",points:2,cadence:"weekly"},
    {id:"w_g_merch",ownerId:"griffin",category:"Merch",title:"Merch count assist",detail:"Help verify physical merch quantities and flag damaged/missing stock or sizes running low.",points:3,cadence:"weekly"},

    // Andrew = 20 points
    {id:"w_a_checkin",ownerId:"andrew",category:"Band",title:"Personal catch-up",detail:"Update availability, show needs, travel issues, gear issues, and any concerns for the week.",points:2,cadence:"weekly"},
    {id:"w_a_insta",ownerId:"andrew",category:"Social",title:"Instagram: 5 feed posts",detail:"Publish five useful Reels, carousels, or photo posts across the week. The main task checks itself when all five post boxes are complete.",points:6,cadence:"weekly",subtasks:Array.from({length:5},(_,i)=>({id:`insta_${i+1}`,label:`Instagram post ${i+1}`,done:false,doneBy:null,doneAt:null}))},
    {id:"w_a_content",ownerId:"andrew",category:"Content",title:"Create/edit 1 reusable content piece",detail:"Prepare one strong vertical clip, photo carousel, rehearsal moment, gear/bass angle, or show recap asset for the content pool.",points:4,cadence:"weekly"},
    {id:"w_a_merch",ownerId:"andrew",category:"Merch",title:"Merch itemization + assessment",detail:"Record counts by item/size, identify low stock, damaged stock, dead stock, strong sellers, and what should be reordered or discontinued.",points:4,cadence:"weekly"},
    {id:"w_a_gear",ownerId:"andrew",category:"Gear",title:"Bass / vocal gear check",detail:"Verify bass rig, DI/cables, vocal gear, power, spares, batteries, and cases are show-ready.",points:2,cadence:"weekly"},
    {id:"w_a_leads",ownerId:"andrew",category:"Booking",title:"Find 5 qualified booking leads",detail:"Add five realistic venues/festivals/promoters/markets with useful contact info and why they fit PA LINE.",points:2,cadence:"weekly"},

    // Michael = 20 points
    {id:"w_m_checkin",ownerId:"michael",category:"Band",title:"Personal catch-up",detail:"Update availability, rehearsal needs, equipment issues, and anything affecting upcoming dates.",points:2,cadence:"weekly"},
    {id:"w_m_fb",ownerId:"michael",category:"Social",title:"Facebook: 7 posts",detail:"Publish one useful Facebook post most days. The main task checks itself when all seven post boxes are complete.",points:5,cadence:"weekly",subtasks:Array.from({length:7},(_,i)=>({id:`facebook_${i+1}`,label:`Facebook post ${i+1}`,done:false,doneBy:null,doneAt:null}))},
    {id:"w_m_content",ownerId:"michael",category:"Content",title:"Create 1 fresh content asset",detail:"Shoot or edit one vertical performance, rehearsal, drum, backstage, personality, or tour-life piece for the shared content pool.",points:4,cadence:"weekly"},
    {id:"w_m_gear",ownerId:"michael",category:"Gear",title:"Drum / stage equipment check",detail:"Inspect drum hardware, heads, pedals, stands, cases, spares, and any assigned stage equipment.",points:3,cadence:"weekly"},
    {id:"w_m_rehearsal",ownerId:"michael",category:"Rehearsal",title:"Rehearsal readiness check",detail:"Review current Songbook changes and flag which songs/sections need focused rehearsal time.",points:2,cadence:"weekly"},
    {id:"w_m_tour",ownerId:"michael",category:"Tour",title:"Tour / venue research",detail:"Research at least three useful venue, festival, support, or routing opportunities in current target markets.",points:2,cadence:"weekly"},
    {id:"w_m_web",ownerId:"michael",category:"Website",title:"Website proofread + event-link check",detail:"Check the public site as a fan would. Flag incorrect dates, broken links, outdated copy, or missing show information.",points:2,cadence:"weekly"}
  ];
}
function getWeeklyPlan(weekStart=startOfWeek()){
  let plan=data.weeklyPlans.find(p=>p.weekStart===weekStart);
  if(plan){
    const templates=new Map(data.weeklyTemplates.map(t=>[t.id,t]));
    plan.tasks.forEach(task=>{
      const template=templates.get(task.id);
      if(template?.subtasks&&!task.subtasks){
        task.subtasks=deepClone(template.subtasks).map(st=>({...st,done:false,doneAt:null,doneBy:null}));
        task.done=false;task.doneAt=null;task.doneBy=null;
      }
    });
  }
  if(!plan){
    plan={id:uid("week"),weekStart,weekEnd:weekEndDate(weekStart),createdAt:nowISO(),tasks:data.weeklyTemplates.map(t=>{
      const task={...deepClone(t),done:false,doneAt:null,doneBy:null,note:""};
      if(task.subtasks)task.subtasks=task.subtasks.map(st=>({...st,done:false,doneAt:null,doneBy:null}));
      return task;
    })};
    data.weeklyPlans.unshift(plan);saveData();
  }
  return plan;
}
function weeklyOwnerStats(plan){
  return data.members.map(m=>{
    const tasks=plan.tasks.filter(t=>t.ownerId===m.id),total=tasks.reduce((s,t)=>s+Number(t.points||0),0);
    const completed=tasks.filter(t=>t.done).reduce((s,t)=>s+Number(t.points||0),0);
    return {member:m,total,done:completed,pct:total?Math.round(completed/total*100):0};
  });
}
function actualCompletionCredits(plan){
  const map={};
  data.members.forEach(m=>map[m.id]={member:m,checks:0,points:0});
  plan.tasks.forEach(task=>{
    if(task.subtasks?.length){
      const perCheck=Number(task.points||0)/task.subtasks.length;
      task.subtasks.forEach(st=>{
        if(st.done&&st.doneBy&&map[st.doneBy]){
          map[st.doneBy].checks+=1;
          map[st.doneBy].points+=perCheck;
        }
      });
    }else if(task.done&&task.doneBy&&map[task.doneBy]){
      map[task.doneBy].checks+=1;
      map[task.doneBy].points+=Number(task.points||0);
    }
  });
  return Object.values(map);
}
function weeklyOverall(plan){
  const total=plan.tasks.reduce((s,t)=>s+Number(t.points||0),0),done=plan.tasks.filter(t=>t.done).reduce((s,t)=>s+Number(t.points||0),0);
  return {total,done,pct:total?Math.round(done/total*100):0};
}
function categoryClass(cat){return ({Social:"blue",Content:"purple",Booking:"warn",Tour:"warn",Merch:"good",Gear:"",Website:"blue",Rights:"purple",Rehearsal:"purple",Music:"good",Band:"",Admin:""})[cat]||""}
function renderWeeklyOpsPage(){
  const plan=getWeeklyPlan(),overall=weeklyOverall(plan),stats=weeklyOwnerStats(plan),credits=actualCompletionCredits(plan);
  return `<section class="hero"><span class="eyebrow">PA LINE · WEEKLY OPS</span><h1>One list. Everybody helps.</h1><p>The whole band sees the same weekly checklist. Planned workload still starts at Trever 40%, Griffin 20%, Andrew 20%, Michael 20%, but every checked box is credited to the member who actually completed it.</p></section>
  <div class="metric-grid">
    <div class="metric"><span>WEEK</span><strong>${fmtDateShort(plan.weekStart)}</strong><div class="sub">through ${fmtDateShort(plan.weekEnd)}</div></div>
    <div class="metric"><span>WHOLE BAND</span><strong>${overall.pct}%</strong><div class="sub">${overall.done.toFixed(1)} / ${overall.total} workload points</div></div>
    <div class="metric"><span>DONE TASKS</span><strong>${plan.tasks.filter(t=>t.done).length}</strong><div class="sub">${plan.tasks.length} parent tasks</div></div>
    <div class="metric"><span>REHEARSAL RHYTHM</span><strong>2 WKS</strong><div class="sub">Default minimum rehearsal rhythm</div></div>
  </div>
  <section class="section"><div class="section-head"><h2>Who actually did the work</h2>${isAdmin()?`<button class="btn small-btn" type="button" data-reset-week>RESET WEEK</button>`:""}</div><div class="section-body"><div class="workload-grid">${credits.map(c=>`<div class="workload-card"><div class="workload-head"><strong>${esc(c.member.name)}</strong><span>${c.checks} checks</span></div><div class="social-big">${c.points.toFixed(1)} pts</div><div class="small">Actual completion credit this week</div></div>`).join("")}</div></div></section>
  <section class="section"><div class="section-head"><h2>Planned workload</h2></div><div class="section-body"><div class="workload-grid">${stats.map(s=>`<div class="workload-card"><div class="workload-head"><strong>${esc(s.member.name)}</strong><span>${s.total}% assigned</span></div><div class="progress-track"><div class="progress-fill" style="width:${s.pct}%"></div></div><div class="small">${s.done} / ${s.total} assigned points complete</div></div>`).join("")}</div></div></section>
  <section class="section"><div class="section-head"><h2>Weekly master checklist</h2><div class="section-actions"><button class="btn small-btn" type="button" data-week-filter="all">ALL</button><button class="btn small-btn ghost" type="button" data-week-filter="open">OPEN</button><button class="btn small-btn ghost" type="button" data-week-filter="done">DONE</button></div></div><div class="section-body"><div class="weekly-task-list" id="weeklyTaskList">${renderWeeklyTasks(plan.tasks)}</div></div></section>
  <section class="section"><div class="section-head"><h2>Social growth playbook</h2><span class="badge blue">STARTING ROUTINE</span></div><div class="section-body">${renderSocialPlaybook()}</div></section>`;
}
function renderWeeklyTasks(tasks,filter="all"){
  const list=tasks.filter(t=>filter==="all"||(filter==="open"&&!t.done)||(filter==="done"&&t.done));
  if(!list.length)return `<div class="empty">Nothing in this view.</div>`;
  return list.map(t=>{
    const hasSubs=!!t.subtasks?.length;
    const doneSubs=hasSubs?t.subtasks.filter(st=>st.done).length:0;
    const completer=t.done&&t.doneBy?memberName(t.doneBy):"";
    return `<div class="weekly-task ${t.done?"done":""}" data-week-task-row="${t.id}">
      <button type="button" class="weekly-check ${hasSubs?"auto-parent":""}" data-toggle-week-task="${t.id}" aria-label="${hasSubs?"Parent task completes automatically":"Toggle task"}" ${hasSubs?"disabled":""}>${t.done?"✓":""}</button>
      <div class="weekly-task-copy">
        <div class="list-item-title"><strong>${esc(t.title)}</strong><span class="badge ${categoryClass(t.category)}">${esc(t.category)}</span><span class="badge">${t.points} PTS</span><span class="member-pill">PLAN: ${esc(memberName(t.ownerId))}</span>${completer?`<span class="badge good">DONE BY ${esc(completer)}</span>`:""}</div>
        <div class="list-item-meta">${esc(t.detail)}</div>
        ${hasSubs?`<div class="subcheck-list">${t.subtasks.map(st=>`<label class="subcheck ${st.done?"done":""}"><input type="checkbox" data-week-subtask="${t.id}:${st.id}" ${st.done?"checked":""}><span>${esc(st.label)}</span>${st.doneBy?`<small>${esc(memberName(st.doneBy))}</small>`:""}</label>`).join("")}</div><div class="small" style="margin-top:6px">${doneSubs} / ${t.subtasks.length} complete. Main box checks automatically.</div>`:""}
        ${t.note?`<div class="weekly-note">${esc(t.note)}</div>`:""}
      </div>
      <div class="list-item-actions"><button class="btn small-btn ghost" type="button" data-week-note="${t.id}">${t.note?"EDIT NOTE":"NOTE"}</button></div>
    </div>`;
  }).join("");
}
function renderSocialPlaybook(){
  return `<div class="social-playbook"><div class="social-card"><div class="list-item-title"><strong>TikTok</strong><span class="badge blue">GRIFFIN</span></div><div class="social-big">3 to 5 / week</div><p>Test Tue-Thu late afternoon and evening, plus evening/weekend slots. Start with 4-6 PM and 6-9 PM test windows, then let PA LINE's own analytics override generic benchmarks.</p><div class="small">Best bets: performance hook in first seconds, live/crowd moment, personality, song story, backstage/rehearsal, short native-feeling edits.</div></div><div class="social-card"><div class="list-item-title"><strong>Instagram</strong><span class="badge purple">ANDREW</span></div><div class="social-big">3 to 5 feed / week</div><p>Use Reels, carousels, or strong photos. Keep Stories active most days. Good benchmark tests include Wed around noon/6 PM and Thu around 9 AM, with weekday 6 PM another useful window.</p><div class="small">Prioritize Reels for discovery, carousels for story/context, Stories for low-friction daily presence.</div></div><div class="social-card"><div class="list-item-title"><strong>Facebook</strong><span class="badge good">MICHAEL</span></div><div class="social-big">5 to 7 / week</div><p>Start around weekday morning windows, especially 8 AM-noon. Use event reminders, live clips, photos, community prompts, stories, ticket links, and meaningful updates rather than filler.</p><div class="small">One good post most days is plenty for this workload. Reuse assets but tailor the caption and CTA.</div></div><div class="social-card"><div class="list-item-title"><strong>Shared rule</strong><span class="badge warn">ALL</span></div><div class="social-big">Consistency > bursts</div><p>Create a small weekly source-content pool and repurpose intelligently. Do not force unique shoots for every platform. Reply to comments and messages consistently, and review native analytics monthly.</p><div class="small">Generic “best times” are only a starting hypothesis. PA LINE audience data becomes the real schedule as enough data accumulates.</div></div></div>`;
}
function toggleWeeklyTask(id){
  const plan=getWeeklyPlan(),task=plan.tasks.find(t=>t.id===id);if(!task||task.subtasks?.length)return;
  task.done=!task.done;task.doneAt=task.done?nowISO():null;task.doneBy=task.done?state.userId:null;
  if(task.done)logActivity(`${currentUser().name} completed weekly task: ${task.title}.`);
  saveData();mount();
}
function toggleWeeklySubtask(token){
  const [taskId,subId]=token.split(":");
  const plan=getWeeklyPlan(),task=plan.tasks.find(t=>t.id===taskId);if(!task)return;
  const sub=task.subtasks?.find(st=>st.id===subId);if(!sub)return;
  sub.done=!sub.done;sub.doneAt=sub.done?nowISO():null;sub.doneBy=sub.done?state.userId:null;
  const allDone=task.subtasks.every(st=>st.done);
  task.done=allDone;
  task.doneAt=allDone?nowISO():null;
  task.doneBy=null;
  if(sub.done)logActivity(`${currentUser().name} completed: ${task.title} / ${sub.label}.`);
  saveData();mount();
}
function editWeeklyTaskNote(id){
  const plan=getWeeklyPlan(),task=plan.tasks.find(t=>t.id===id);if(!task)return;
  const note=prompt(`Note for ${task.title}:`,task.note||"");if(note===null)return;
  task.note=note.trim();saveData();mount();
}
function filterWeeklyTasks(filter){
  const plan=getWeeklyPlan();const tasks=plan.tasks;
  const host=$("weeklyTaskList");if(host)host.innerHTML=renderWeeklyTasks(tasks,filter);
  bindWeeklyTaskButtons();
}
function bindWeeklyTaskButtons(){
  document.querySelectorAll("[data-toggle-week-task]").forEach(el=>el.addEventListener("click",()=>toggleWeeklyTask(el.dataset.toggleWeekTask)));
  document.querySelectorAll("[data-week-subtask]").forEach(el=>el.addEventListener("change",()=>toggleWeeklySubtask(el.dataset.weekSubtask)));
  document.querySelectorAll("[data-week-note]").forEach(el=>el.addEventListener("click",()=>editWeeklyTaskNote(el.dataset.weekNote)));
}
function resetCurrentWeek(){
  if(!isAdmin()||!confirm("Reset every task in this week's checklist to incomplete?"))return;
  const plan=getWeeklyPlan();plan.tasks.forEach(t=>{t.done=false;t.doneAt=null;t.doneBy=null;t.note="";if(t.subtasks)t.subtasks.forEach(st=>{st.done=false;st.doneAt=null;st.doneBy=null})});saveData();mount();
}


function importPublicBookingRequests(){
  if(!window.PALineBridge)return 0;
  const incoming=window.PALineBridge.listBookings().filter(r=>r.status==="pending-command-review");
  let count=0;
  incoming.forEach(r=>{
    if(data.offers.some(o=>o.publicBookingRequestId===r.id))return;
    const lineup=data.lineups.find(l=>{
      const n=String(r.lineupId||"").toLowerCase();
      return l.id===r.lineupId || l.name.toLowerCase().includes(n) || n.includes(l.name.toLowerCase());
    }) || data.lineups.find(l=>l.id==="full") || data.lineups[0];
    const recipients=[...(lineup?.memberIds||[])];
    const offer={
      id:uid("offer"),
      publicBookingRequestId:r.id,
      source:"public-booking",
      venue:r.venue||"Booking request",
      city:r.city||"",
      state:r.state||"",
      date:r.date||isoDate(new Date()),
      start:r.start||"19:00",
      end:r.end||"22:00",
      lineupId:lineup?.id||"full",
      pay:Number(r.pay||0),
      attendanceProvided:Number(r.attendanceProvided||0),
      travelBeforeHours:Number(r.travelBeforeHours||0),
      travelAfterHours:Number(r.travelAfterHours||0),
      deadline:"",
      adminNotes:[r.adminNotes||"",r.contactName?`Booker: ${r.contactName}`:"",r.contactEmail?`Email: ${r.contactEmail}`:"",r.contactPhone?`Phone: ${r.contactPhone}`:""].filter(Boolean).join("\n"),
      recipients,
      responses:[],
      notes:[],
      status:"pending",
      setlist:{songIds:[],locked:false,lockedAt:null,lockedBy:null},
      createdAt:r.createdAt||nowISO()
    };
    data.offers.unshift(offer);
    window.PALineBridge.updateBooking(r.id,{status:"imported-to-command",commandOfferId:offer.id});
    data.notifications.unshift({id:uid("n"),memberId:"trever",text:`New public booking request from ${offer.venue}.`,createdAt:nowISO(),read:false});
    logActivity(`Imported public booking request from ${offer.venue} into COMMAND.`);
    count++;
  });
  if(count)saveData();
  return count;
}

function ensureBackendCollections(){
  data.rehearsals ||= [];
  data.meetings ||= [];
  data.chatChannels ||= [
    {id:"chat_general",name:"General",messages:[]},
    {id:"chat_rehearsal",name:"Rehearsal Talk",messages:[]},
    {id:"chat_songideas",name:"Song Ideas",messages:[]}
  ];
  data.chatChannels.forEach(c=>c.messages ||= []);
  data.weeklyPlans ||= [];
  data.weeklyTemplates ||= defaultWeeklyTemplates();
  data.offers?.forEach(o=>{
    o.setlist ||= {songIds:[],locked:false,lockedAt:null,lockedBy:null};
    o.gigLog ||= [];
  });
  data.shows?.forEach(s=>{
    s.setlist ||= {songIds:[],locked:false,lockedAt:null,lockedBy:null};
    s.gigLog ||= [];
  });
  data.version=5;
}
ensureBackendCollections();
importPublicBookingRequests();

let state={
  userId:null,page:"dashboard",calendarMonth:new Date().getMonth(),calendarYear:new Date().getFullYear(),
  selectedDate:isoDate(new Date()),songId:null,offerId:null,showId:null,sidebarOpen:false,
  chatChannelId:"chat_general",
  practice:{songId:null,trackKey:null,loopA:null,loopB:null}
};
function saveData(){localStorage.setItem(APP_KEY,JSON.stringify(data))}
function logActivity(text,userId=state.userId){
  data.activity.unshift({id:uid("a"),text,at:nowISO(),userId:userId||"system"});
  data.activity=data.activity.slice(0,200); saveData();
}
function notify(userId,title,body,type="general",refId=null){
  data.notifications.unshift({id:uid("n"),userId,title,body,type,refId,read:false,createdAt:nowISO()});
}
function notifyAdmin(title,body,type="general",refId=null){
  data.members.filter(m=>m.isAdmin).forEach(m=>notify(m.id,title,body,type,refId));
}
function memberNotifications(id=state.userId){return data.notifications.filter(n=>n.userId===id)}
function unreadCount(id=state.userId){return memberNotifications(id).filter(n=>!n.read).length}

function openAudioDB(){
  return new Promise((resolve,reject)=>{
    const req=indexedDB.open(AUDIO_DB,1);
    req.onupgradeneeded=()=>req.result.createObjectStore(AUDIO_STORE);
    req.onsuccess=()=>resolve(req.result);
    req.onerror=()=>reject(req.error);
  });
}
async function putAudio(key,file){
  const db=await openAudioDB();
  return new Promise((resolve,reject)=>{
    const tx=db.transaction(AUDIO_STORE,"readwrite");
    tx.objectStore(AUDIO_STORE).put(file,key);
    tx.oncomplete=()=>resolve(true);
    tx.onerror=()=>reject(tx.error);
  });
}
async function getAudio(key){
  const db=await openAudioDB();
  return new Promise((resolve,reject)=>{
    const tx=db.transaction(AUDIO_STORE,"readonly");
    const req=tx.objectStore(AUDIO_STORE).get(key);
    req.onsuccess=()=>resolve(req.result||null);
    req.onerror=()=>reject(req.error);
  });
}
async function deleteAudio(key){
  const db=await openAudioDB();
  return new Promise((resolve,reject)=>{
    const tx=db.transaction(AUDIO_STORE,"readwrite");
    tx.objectStore(AUDIO_STORE).delete(key);
    tx.oncomplete=()=>resolve(true);
    tx.onerror=()=>reject(tx.error);
  });
}

function app(){
  if(!state.userId)return renderLogin();
  return renderShell();
}
function mount(){
  $("app").innerHTML=app();
  bindPageEvents();
  if(state.sidebarOpen)document.querySelector(".sidebar")?.classList.add("open");
}
function renderLogin(){
  return `
  <main class="login-shell">
    <section class="login-card">
      <div class="login-rose"><img src="./assets/pa-line-rose.png" alt=""></div>
      <span class="eyebrow">PA LINE OPERATIONS</span>
      <h1 style="max-width:720px;margin:10px 0 12px">CREW + COMMAND</h1>
      <p style="max-width:690px">One backend for member availability, show offers, the master calendar, notes, and the PA LINE songbook. Choose a portal below to preview each role.</p>
      <div class="portal-grid">
        ${data.members.map(m=>`
          <button type="button" class="portal-choice ${m.isAdmin?"admin":""}" data-login="${m.id}">
            <span class="eyebrow">${m.isAdmin?"COMMAND":"CREW PORTAL"}</span>
            <strong>${esc(m.fullName)}</strong>
            <span class="role">${esc(m.role)}</span>
          </button>`).join("")}
      </div>
      <div class="small" style="margin-top:18px">Interactive backend prototype. Authentication, live calendar OAuth, push notifications, and cloud persistence are simulated until a production backend is connected.</div>
    </section>
  </main>`;
}
function navItems(){
  if(isAdmin()){
    return [
      ["dashboard","Command"],
      ["calendar","Master Calendar"],
      ["offers","Offers"],
      ["rehearsals","Rehearsals"],
      ["meetings","Band Meetings"],
      ["chat","Crew Chat"],
      ["weekly","Weekly Ops"],
      ["members","Members"],
      ["songbook","Songbook"],
      ["lineups","Lineups"],
      ["notifications","Notifications"],
      ["settings","Settings"]
    ];
  }
  return [
    ["dashboard","Home"],
    ["calendar","My Calendar"],
    ["offers","Show Offers"],
    ["shows","Confirmed Shows"],
    ["rehearsals","Rehearsals"],
    ["meetings","Band Meetings"],
    ["chat","Crew Chat"],
    ["weekly","Weekly Ops"],
    ["songbook","Songbook"],
    ["notifications","Notifications"],
    ["settings","Account + Calendars"]
  ];
}
function pageLabel(){
  return navItems().find(i=>i[0]===state.page)?.[1] || "PA LINE";
}
function renderShell(){
  const user=currentUser();
  return `
  <div class="shell">
    <aside class="sidebar ${state.sidebarOpen?"open":""}">
      <div class="brand-row">
        <img class="brand-rose" src="./assets/pa-line-rose.png" alt="">
        <div class="brand-copy"><strong>PA LINE</strong><span>${isAdmin()?"COMMAND":"CREW"}</span></div>
      </div>
      <nav class="nav">
        ${navItems().map(([id,label])=>`
          <button class="nav-btn ${state.page===id?"active":""}" type="button" data-nav="${id}">
            ${label}${id==="notifications"&&unreadCount()?`<span class="nav-count">${unreadCount()}</span>`:""}
          </button>`).join("")}
      </nav>
      <div class="sidebar-user">
        <span class="eyebrow">${isAdmin()?"ADMIN PORTAL":"MEMBER PORTAL"}</span>
        <strong>${esc(user.fullName)}</strong>
        <div class="mini">${esc(user.role)}</div>
        <div class="sidebar-actions">
          <button type="button" class="btn small-btn ghost" data-switch-user>SWITCH</button>
          <button type="button" class="btn small-btn ghost" data-reset-demo>RESET</button>
        </div>
      </div>
    </aside>
    <main class="main">
      <div class="topbar">
        <div style="display:flex;align-items:center;gap:9px">
          <button class="icon-btn mobile-menu" type="button" data-mobile-menu aria-label="Open menu">☰</button>
          <div class="page-title"><strong>${pageLabel()}</strong><span>${isAdmin()?"PA LINE operations dashboard":"Private member workspace"}</span></div>
        </div>
        <div class="top-actions">
          ${isAdmin()?`<button class="btn small-btn" type="button" data-quick-offer>+ OFFER</button>`:`<span class="badge ${unreadCount()?"warn":""}">${unreadCount()} NEW</span>`}
        </div>
      </div>
      <div class="content">${renderPage()}</div>
    </main>
  </div>`;
}
function renderPage(){
  if(state.page==="dashboard")return isAdmin()?renderAdminDashboard():renderMemberDashboard();
  if(state.page==="calendar")return renderCalendarPage();
  if(state.page==="offers")return renderOffersPage();
  if(state.page==="shows")return renderShowsPage();
  if(state.page==="rehearsals")return renderRehearsalsPage();
  if(state.page==="meetings")return renderMeetingsPage();
  if(state.page==="chat")return renderChatPage();
  if(state.page==="weekly")return renderWeeklyOpsPage();
  if(state.page==="members")return renderMembersPage();
  if(state.page==="songbook")return renderSongbookPage();
  if(state.page==="lineups")return renderLineupsPage();
  if(state.page==="notifications")return renderNotificationsPage();
  if(state.page==="settings")return renderSettingsPage();
  return renderAdminDashboard();
}

function upcomingOffers(){
  return data.offers.filter(o=>o.status==="pending").sort((a,b)=>a.date.localeCompare(b.date));
}
function upcomingShowsFor(memberId=null){
  return data.shows.filter(s=>s.status==="confirmed"&&(!memberId||s.members.includes(memberId))).sort((a,b)=>a.date.localeCompare(b.date));
}
function pendingResponseCount(memberId){
  return data.offers.filter(o=>o.status==="pending"&&o.recipients.includes(memberId)&&!o.responses?.[memberId]).length;
}

function addMinutesToDateTime(date,time,minutes){
  const d=dateTime(date,time);
  d.setMinutes(d.getMinutes()+Number(minutes||0));
  return d;
}
function fmtDateTimeClock(d){
  return d.toLocaleString(undefined,{weekday:"short",month:"short",day:"numeric",hour:"numeric",minute:"2-digit"});
}
function commitmentTimeline(ctx){
  const travelInMinutes=Math.round(Number(ctx.travelBeforeHours||0)*60);
  const travelOutMinutes=Math.round(Number(ctx.travelAfterHours||0)*60);
  const preShowMinutes=120;
  const postShowMinutes=120;

  const performanceStart=dateTime(ctx.date,ctx.start);
  let performanceEnd=dateTime(ctx.date,ctx.end);
  if(performanceEnd<=performanceStart)performanceEnd.setDate(performanceEnd.getDate()+1);

  const arrival=new Date(performanceStart.getTime()-preShowMinutes*60000);
  const leaveOrigin=new Date(arrival.getTime()-travelInMinutes*60000);
  const teardownEnd=new Date(performanceEnd.getTime()+postShowMinutes*60000);
  const returnEnd=new Date(teardownEnd.getTime()+travelOutMinutes*60000);

  return {
    travelInMinutes,travelOutMinutes,preShowMinutes,postShowMinutes,
    leaveOrigin,arrival,performanceStart,performanceEnd,teardownEnd,returnEnd,
    totalMinutes:Math.round((returnEnd-leaveOrigin)/60000)
  };
}
function renderCommitmentTimeline(o){
  const t=commitmentTimeline(o);
  return `<div class="timeline-list">
    <div class="timeline-row"><span>LEAVE / TRAVEL IN</span><strong>${fmtDateTimeClock(t.leaveOrigin)}</strong><small>${t.travelInMinutes?`${Math.round(t.travelInMinutes/6)/10} hr travel`:"No inbound travel entered"}</small></div>
    <div class="timeline-row"><span>ARRIVE / PRE-SHOW</span><strong>${fmtDateTimeClock(t.arrival)}</strong><small>2 hr before performance</small></div>
    <div class="timeline-row"><span>PERFORMANCE</span><strong>${fmtDateTimeClock(t.performanceStart)}</strong><small>to ${fmtDateTimeClock(t.performanceEnd)}</small></div>
    <div class="timeline-row"><span>POST-SHOW COMPLETE</span><strong>${fmtDateTimeClock(t.teardownEnd)}</strong><small>2 hr after performance</small></div>
    <div class="timeline-row"><span>TRAVEL COMPLETE</span><strong>${fmtDateTimeClock(t.returnEnd)}</strong><small>${t.travelOutMinutes?`${Math.round(t.travelOutMinutes/6)/10} hr outbound travel`:"No outbound travel entered"}</small></div>
  </div>
  <div class="small" style="margin-top:8px">Total commitment window: ${Math.floor(t.totalMinutes/60)} hr ${t.totalMinutes%60} min.</div>`;
}

function conflictBlocksFor(memberId,date,start,end,travelBeforeHours=0,travelAfterHours=0){
  const t=commitmentTimeline({date,start,end,travelBeforeHours,travelAfterHours});
  return data.blocks.filter(b=>{
    if(b.memberId!==memberId)return false;
    if(b.availabilityOverride==="available")return false;
    const bs=new Date(b.start),be=new Date(b.end);
    return bs<t.returnEnd && be>t.leaveOrigin;
  });
}
function showConflictsFor(memberId,date,start,end,excludeOfferId=null,travelBeforeHours=0,travelAfterHours=0){
  const t=commitmentTimeline({date,start,end,travelBeforeHours,travelAfterHours});
  return data.shows.filter(s=>{
    if(s.status!=="confirmed"||!s.members.includes(memberId))return false;
    const ss=dateTime(s.date,s.commitmentStart||s.start),se=dateTime(s.date,s.commitmentEnd||s.end);
    if(se<=ss)se.setDate(se.getDate()+1);
    return ss<t.returnEnd && se>t.leaveOrigin;
  });
}
function internalCommitmentConflictsFor(memberId,date,start,end,travelBeforeHours=0,travelAfterHours=0){
  const t=commitmentTimeline({date,start,end,travelBeforeHours,travelAfterHours});
  const all=[
    ...data.rehearsals.filter(x=>x.status!=="cancelled").map(x=>({...x,internalType:"rehearsal"})),
    ...data.meetings.filter(x=>x.status!=="cancelled").map(x=>({...x,internalType:"meeting"}))
  ];
  return all.filter(x=>{
    if(!x.blocksAvailability || !x.members?.includes(memberId))return false;
    const xs=dateTime(x.date,x.start),xe=dateTime(x.date,x.end);
    if(xe<=xs)xe.setDate(xe.getDate()+1);
    return xs<t.returnEnd && xe>t.leaveOrigin;
  });
}

function memberCalendarUnknown(memberId){
  const m=getMember(memberId);
  const connected=(m?.calendarConnections||[]).filter(c=>c.enabled!==false&&c.status==="connected");
  if(!connected.length)return false;
  const limit=(data.settings.calendarStaleHours||24)*3600000;
  return connected.some(c=>!c.lastSync || Date.now()-new Date(c.lastSync).getTime()>limit);
}
function memberAvailability(memberId,ctx){
  const blocks=conflictBlocksFor(memberId,ctx.date,ctx.start,ctx.end,ctx.travelBeforeHours??2,ctx.travelAfterHours??2);
  const shows=showConflictsFor(memberId,ctx.date,ctx.start,ctx.end,ctx.offerId,ctx.travelBeforeHours??0,ctx.travelAfterHours??0);
  const internal=internalCommitmentConflictsFor(memberId,ctx.date,ctx.start,ctx.end,ctx.travelBeforeHours??0,ctx.travelAfterHours??0);
  if(blocks.length||shows.length||internal.length)return {status:"blocked",blocks,shows,internal};
  if(memberCalendarUnknown(memberId))return {status:"unknown",blocks:[],shows:[],internal:[]};
  return {status:"available",blocks:[],shows:[],internal:[]};
}
function lineupAvailability(lineupId,ctx){
  const lineup=getLineup(lineupId);
  if(!lineup||!lineup.active)return {status:"blocked",members:[],reasons:["Lineup disabled"]};
  const members=lineup.required.map(id=>({member:getMember(id),result:memberAvailability(id,ctx)}));
  const blocked=members.filter(x=>x.result.status==="blocked");
  const unknown=members.filter(x=>x.result.status==="unknown");
  return {
    status:blocked.length?"blocked":unknown.length?"unknown":"available",
    members,blocked,unknown,
    reasons:[
      ...blocked.map(x=>`${x.member.name} has a conflict`),
      ...unknown.map(x=>`${x.member.name} calendar sync needs confirmation`)
    ]
  };
}
function availabilityCards(ctx){
  return `<div class="status-matrix">${data.lineups.filter(l=>l.active).map(l=>{
    const a=lineupAvailability(l.id,ctx);
    const cls=a.status==="available"?"available":a.status==="blocked"?"blocked":"unknown";
    const badge=a.status==="available"?"AVAILABLE":a.status==="blocked"?"UNAVAILABLE":"CHECK";
    return `<div class="status-card ${cls}">
      <strong>${esc(l.name)}</strong>
      <span class="badge ${a.status==="available"?"good":a.status==="blocked"?"bad":"warn"}">${badge}</span>
      <div class="small" style="margin-top:7px">${a.reasons.length?esc(a.reasons.join(" · ")):"Required members clear"}</div>
    </div>`;
  }).join("")}</div>`;
}

function renderAdminDashboard(){
  const offers=upcomingOffers(),shows=upcomingShowsFor();
  const needs=offers.filter(o=>o.recipients.some(id=>!o.responses?.[id])).length;
  const songs=data.songs.filter(s=>s.status==="Performable").length;
  const next=shows[0];
  return `
  <section class="hero">
    <img class="hero-watermark" src="./assets/pa-line-rose.png" alt="">
    <span class="eyebrow">PA LINE COMMAND</span>
    <h1>Run the band from one place.</h1>
    <p>See availability, collect member responses, control the master calendar, manage performable songs, and keep show information attached to the people who need it.</p>
  </section>
  <div class="metric-grid">
    <div class="metric"><span>PENDING OFFERS</span><strong>${offers.length}</strong><div class="sub">${needs} still need responses</div></div>
    <div class="metric"><span>CONFIRMED SHOWS</span><strong>${shows.length}</strong><div class="sub">${next?`Next: ${fmtDateShort(next.date)}`:"No confirmed shows yet"}</div></div>
    <div class="metric"><span>PERFORMABLE SONGS</span><strong>${songs}</strong><div class="sub">${data.songs.length} total in Songbook</div></div>
    <div class="metric"><span>CREW PORTALS</span><strong>${data.members.filter(m=>!m.isAdmin).length}</strong><div class="sub">Individual availability and notes</div></div>
  </div>
  <section class="section">
    <div class="section-head"><h2>Availability check</h2><div class="section-actions"><button class="btn small-btn" type="button" data-quick-offer>CREATE OFFER</button></div></div>
    <div class="section-body">
      <div class="small" style="margin-bottom:10px">Current date check for a 7 PM to 10 PM show with 2 hours before and after.</div>
      ${availabilityCards({date:state.selectedDate||isoDate(new Date()),start:"19:00",end:"22:00",travelBeforeHours:2,travelAfterHours:2})}
    </div>
  </section>
  <section class="section">
    <div class="section-head"><h2>Offers needing attention</h2><button class="btn small-btn ghost" type="button" data-nav="offers">VIEW ALL</button></div>
    <div class="section-body">${renderOfferList(offers.slice(0,5),true)}</div>
  </section>
  <section class="section">
    <div class="section-head"><h2>Recent activity</h2></div>
    <div class="section-body">
      <div class="list">${data.activity.slice(0,6).map(a=>`<div class="list-item"><div><div class="list-item-title"><strong>${esc(a.text)}</strong></div><div class="list-item-meta">${new Date(a.at).toLocaleString()} · ${esc(memberName(a.userId))}</div></div></div>`).join("")||`<div class="empty">No activity yet.</div>`}</div>
    </div>
  </section>`;
}
function renderMemberDashboard(){
  const user=currentUser();
  const offers=data.offers.filter(o=>o.status==="pending"&&o.recipients.includes(user.id));
  const shows=upcomingShowsFor(user.id);
  const next=shows[0];
  const due=pendingResponseCount(user.id);
  const blocks=data.blocks.filter(b=>b.memberId===user.id&&new Date(b.end)>=new Date()).length;
  return `
  <section class="hero">
    <img class="hero-watermark" src="./assets/pa-line-rose.png" alt="">
    <span class="eyebrow">PA LINE CREW</span>
    <h1>${esc(user.name)}, this is your portal.</h1>
    <p>Your offers, personal availability, confirmed shows, show notes, and current PA LINE songbook live here.</p>
  </section>
  <div class="metric-grid">
    <div class="metric"><span>NEED YOUR ANSWER</span><strong>${due}</strong><div class="sub">${offers.length} active offers</div></div>
    <div class="metric"><span>UPCOMING SHOWS</span><strong>${shows.length}</strong><div class="sub">${next?`${fmtDateShort(next.date)} · ${esc(next.city)}`:"Nothing confirmed yet"}</div></div>
    <div class="metric"><span>MY ACTIVE BLOCKS</span><strong>${blocks}</strong><div class="sub">Private reason stays private</div></div>
    <div class="metric"><span>SONGBOOK READY</span><strong>${data.songs.filter(s=>s.status==="Performable").length}</strong><div class="sub">Performable songs available</div></div>
  </div>
  ${next?`<section class="section"><div class="section-head"><h2>Next show</h2><span class="badge good">CONFIRMED</span></div><div class="section-body">${renderShowSummary(next,true)}</div></section>`:""}
  <section class="section">
    <div class="section-head"><h2>Offers needing your response</h2><button class="btn small-btn ghost" type="button" data-nav="offers">OPEN OFFERS</button></div>
    <div class="section-body">${renderOfferList(offers.filter(o=>!o.responses?.[user.id]).slice(0,4),false)}</div>
  </section>
  <section class="section">
    <div class="section-head"><h2>Quick availability</h2><button class="btn small-btn" type="button" data-block-date>BLOCK A DATE</button></div>
    <div class="section-body"><div class="small">Calendar details from connected personal calendars stay private. PA LINE only needs the busy window to calculate whether your lineup can be offered.</div></div>
  </section>`;
}

function renderOfferList(offers,admin){
  if(!offers.length)return `<div class="empty">No offers here right now.</div>`;
  return `<div class="list">${offers.map(o=>{
    const lineup=getLineup(o.lineupId);
    const responses=o.recipients.map(id=>o.responses?.[id]?.status).filter(Boolean);
    const yes=responses.filter(r=>r==="available").length,no=responses.filter(r=>r==="unavailable").length,talk=responses.filter(r=>r==="talk").length;
    const memberResp=o.responses?.[state.userId];
    return `<div class="list-item">
      <div>
        <div class="list-item-title"><strong>${esc(o.venue)}</strong><span class="badge blue">${esc(lineup?.name||"Offer")}</span>${o.status==="confirmed"?`<span class="badge good">CONFIRMED</span>`:""}</div>
        <div class="list-item-meta">${fmtDate(o.date)} · ${esc(o.city)}, ${esc(o.state)} · ${fmtTime(o.start)} to ${fmtTime(o.end)}${o.pay?` · ${money(o.pay)}`:""}</div>
        <div class="list-item-meta">${admin?`${yes} available · ${no} unavailable · ${talk} need to talk · ${o.recipients.length-responses.length} waiting`:`Your response: ${memberResp?memberResp.status.replace("talk","need to talk").toUpperCase():"WAITING"}`}</div>
        ${!admin&&o.recipients.includes(state.userId)?`<div class="list-item-meta"><strong>${currentUser()?.isAdmin?"Owner draw: no fixed cut":`Your cut: ${o.pay?money(memberOfferCut(o,state.userId)):"TBD"} · 20%`}</strong></div>`:""}
      </div>
      <div class="list-item-actions"><button class="btn small-btn" type="button" data-open-offer="${o.id}">${admin?"REVIEW":"OPEN"}</button></div>
    </div>`;
  }).join("")}</div>`;
}
function offerContext(o){return {date:o.date,start:o.start,end:o.end,travelBeforeHours:o.travelBeforeHours,travelAfterHours:o.travelAfterHours,offerId:o.id}}
function renderOffersPage(){
  const offers=isAdmin()?data.offers:data.offers.filter(o=>o.recipients.includes(state.userId));
  const active=offers.filter(o=>o.status==="pending");
  const closed=offers.filter(o=>o.status!=="pending");
  return `
  <section class="hero"><span class="eyebrow">${isAdmin()?"COMMAND":"CREW"} · OFFERS</span><h1>${isAdmin()?"Show offers":"Your show offers"}</h1><p>${isAdmin()?"Create offers, watch member responses, and confirm only when the lineup is ready.":"Respond quickly so PA LINE can make a confident decision without group-text chaos."}</p></section>
  <section class="section">
    <div class="section-head"><h2>Active offers</h2>${isAdmin()?`<button class="btn primary small-btn" type="button" data-quick-offer>+ NEW OFFER</button>`:""}</div>
    <div class="section-body">${renderOfferList(active,isAdmin())}</div>
  </section>
  ${closed.length?`<section class="section"><div class="section-head"><h2>Closed / confirmed</h2></div><div class="section-body">${renderOfferList(closed,isAdmin())}</div></section>`:""}`;
}


function showHistoryRecords(){
  return data.shows.filter(s=>s.status==="confirmed" && Number(s.attendanceActual||0)>0);
}
function attendanceEstimateFor(ctx){
  if(Number(ctx.attendanceProvided||0)>0){
    return {value:Number(ctx.attendanceProvided),source:"provided",confidence:"high",basis:"Provided attendance"};
  }
  const hist=showHistoryRecords();
  const sameVenue=hist.filter(s=>ctx.venue && s.venue?.toLowerCase()===ctx.venue.toLowerCase());
  const sameCity=hist.filter(s=>ctx.city && s.city?.toLowerCase()===ctx.city.toLowerCase());
  const sameLineup=hist.filter(s=>ctx.lineupId && s.lineupId===ctx.lineupId);
  const pools=[sameVenue,sameCity,sameLineup,hist].filter(p=>p.length);
  if(pools.length){
    const pool=pools[0];
    const avg=pool.reduce((sum,s)=>sum+Number(s.attendanceActual||0),0)/pool.length;
    const label=pool===sameVenue?"venue history":pool===sameCity?"market history":pool===sameLineup?"lineup history":"PA LINE show history";
    return {value:Math.max(1,Math.round(avg)),source:"estimated",confidence:pool.length>=3?"medium":"low",basis:`${label} · ${pool.length} prior show${pool.length===1?"":"s"}`};
  }
  // Conservative placeholder until first-party attendance history exists.
  const lineupBase={full:100,duo:65,solo:40}[ctx.lineupId]||60;
  return {value:lineupBase,source:"projected",confidence:"low",basis:"Starter projection until PA LINE attendance history is recorded"};
}
function merchForecastForAttendance(attendance,avgSpend=8){
  const people=Math.max(0,Number(attendance)||0);
  // Use a range rather than pretending precision. Low = 10% conversion at $20/order.
  // Mid = 15% conversion at $25/order. High = 20% conversion at $30/order.
  return {
    low:{buyers:Math.round(people*.10),gross:Math.round(people*.10*20)},
    mid:{buyers:Math.round(people*.15),gross:Math.round(people*.15*25)},
    high:{buyers:Math.round(people*.20),gross:Math.round(people*.20*30)}
  };
}
function merchSplit(gross,assignedMembers){
  const total=Math.max(0,Number(gross)||0);
  const restock=total*.50;
  const distributable=total-restock;
  const rows=(assignedMembers||[]).map(id=>{
    const m=getMember(id),pct=memberCutPercent(id);
    return {memberId:id,name:m?.name||"Member",isOwner:!!m?.isAdmin,percent:pct,amount:pct===null?null:distributable*(pct/100)};
  });
  const memberCuts=rows.filter(r=>r.percent!==null).reduce((sum,r)=>sum+(r.amount||0),0);
  const remaining=Math.max(0,distributable-memberCuts);
  return {gross:total,restock,distributable,rows,memberCuts,remaining};
}
function renderAttendanceMerch(o){
  const att=attendanceEstimateFor(o);
  const forecast=merchForecastForAttendance(att.value);
  const actual=Number(o.merchActualGross||0);
  const split=merchSplit(actual||forecast.mid.gross,o.recipients||[]);
  return `<section class="section">
    <div class="section-head"><h2>Attendance + merch potential</h2><span class="badge ${att.source==="provided"?"good":"warn"}">${att.source.toUpperCase()}</span></div>
    <div class="section-body">
      <div class="info-grid">
        <div class="info-box"><span>ATTENDANCE</span><strong>${att.value}</strong></div>
        <div class="info-box"><span>CONFIDENCE</span><strong>${esc(att.confidence.toUpperCase())}</strong></div>
        <div class="info-box"><span>MID MERCH GOAL</span><strong>${money(forecast.mid.gross)}</strong></div>
        <div class="info-box"><span>EST. BUYERS</span><strong>${forecast.mid.buyers}</strong></div>
      </div>
      <div class="small" style="margin-top:8px">Basis: ${esc(att.basis)}. Merch forecast range: ${money(forecast.low.gross)} low · ${money(forecast.mid.gross)} target · ${money(forecast.high.gross)} strong night.</div>
      ${actual?`<div class="note-box" style="margin-top:10px"><span class="eyebrow">ACTUAL MERCH</span><p>${money(actual)} gross. ${money(split.restock)} immediately reserved for restock. ${money(split.distributable)} enters the merch profit split.</p></div>`:`<div class="note-box" style="margin-top:10px"><span class="eyebrow">FORECAST ONLY</span><p>The merch target is planning data, not revenue. Enter actual merch gross after the show to create the real split.</p></div>`}
      <div class="payout-grid" style="margin-top:10px">
        <div class="payout-card"><span>RESTOCK RESERVE</span><strong>${money(split.restock)}</strong><div class="small">50% of ${actual?"actual":"target"} merch gross</div></div>
        ${split.rows.map(r=>`<div class="payout-card ${r.isOwner?"owner":""}"><span>${esc(r.name)}</span><strong>${r.isOwner?"OWNER DRAW":money(r.amount)}</strong><div class="small">${r.isOwner?"No fixed percentage":`${r.percent}% of remaining 50%`}</div></div>`).join("")}
      </div>
      ${isAdmin()?`<div class="section-actions" style="margin-top:10px"><button class="btn small-btn" type="button" data-edit-attendance-merch="${o.id}">UPDATE ATTENDANCE / MERCH</button></div>`:""}
    </div>
  </section>`;
}
function memberCutPercent(memberId){
  const m=getMember(memberId);
  if(!m)return 0;
  if(m.isAdmin)return null;
  return 20;
}
function memberOfferCut(o,memberId){
  const pct=memberCutPercent(memberId);
  if(pct===null)return null;
  if(!o?.pay)return 0;
  return Number(o.pay)*(pct/100);
}
function offerPayoutSummary(o){
  const recipients=o.recipients||[];
  const rows=recipients.map(id=>{
    const m=getMember(id),pct=memberCutPercent(id);
    return {
      memberId:id,
      name:m?.name||"Member",
      isOwner:!!m?.isAdmin,
      percent:pct,
      amount:pct===null?null:memberOfferCut(o,id)
    };
  });
  const memberTotal=rows.filter(r=>r.percent!==null).reduce((sum,r)=>sum+(r.amount||0),0);
  const retained=o.pay?Math.max(0,Number(o.pay)-memberTotal):0;
  return {rows,memberTotal,retained};
}
function renderOfferPayout(o){
  const summary=offerPayoutSummary(o);
  const rows=isAdmin()?summary.rows:summary.rows.filter(r=>r.memberId===state.userId);
  if(!rows.length)return "";
  return `<section class="section">
    <div class="section-head"><h2>${isAdmin()?"Member cuts":"Your show cut"}</h2><span class="badge good">${o.pay?money(o.pay):"OFFER TBD"}</span></div>
    <div class="section-body">
      <div class="payout-grid">
        ${rows.map(r=>`<div class="payout-card ${r.isOwner?"owner":""}">
          <span>${esc(r.name)}</span>
          <strong>${r.isOwner?"OWNER DRAW":o.pay?money(r.amount):"TBD"}</strong>
          <div class="small">${r.isOwner?"No fixed percentage. Owner withdrawals handled separately.":`${r.percent}% of entered show offer`}</div>
        </div>`).join("")}
      </div>
      ${isAdmin()?`<div class="payout-summary">
        <div><span>Non-owner member cuts</span><strong>${o.pay?money(summary.memberTotal):"TBD"}</strong></div>
        <div><span>Remaining before expenses / owner draw</span><strong>${o.pay?money(summary.retained):"TBD"}</strong></div>
      </div>`:""}
      <div class="small" style="margin-top:10px">Prototype calculation uses the offer/guarantee entered on this show. It does not calculate taxes, reimbursements, expenses, or accounting treatment.</div>
    </div>
  </section>`;
}


function songLengthSeconds(song){
  return parseDuration(song?.length||"0:00");
}
function setlistTotalSeconds(entity){
  return (entity.setlist?.songIds||[]).reduce((sum,id)=>sum+songLengthSeconds(data.songs.find(s=>s.id===id)),0);
}
function setlistCanEdit(entity){
  if(!entity?.setlist?.locked)return true;
  return isAdmin();
}
function renderSetlistSummary(entity,type){
  const ids=entity.setlist?.songIds||[];
  const locked=!!entity.setlist?.locked;
  return `<div class="note-box">
    <span class="eyebrow">SETLIST</span>
    <p>${ids.length} song${ids.length===1?"":"s"} · ${humanDuration(setlistTotalSeconds(entity))} total ${locked?"· LOCKED":""}</p>
    <button class="btn small-btn" type="button" data-open-setlist="${type}:${entity.id}">${ids.length?"OPEN SETLIST":"BUILD SETLIST"}</button>
  </div>`;
}
function getSetlistEntity(type,id){
  return type==="show"?data.shows.find(x=>x.id===id):data.offers.find(x=>x.id===id);
}
function renderSetlistBuilder(type,entity,filter=""){
  entity.setlist ||= {songIds:[],locked:false,lockedAt:null,lockedBy:null};
  const ids=entity.setlist.songIds;
  const locked=entity.setlist.locked;
  const query=String(filter||"").trim().toLowerCase();
  const library=data.songs.filter(s=>!query||[s.title,s.artist,s.key,s.timeSig,s.status].join(" ").toLowerCase().includes(query));
  return `<div class="setlist-shell">
    <div class="setlist-headbar">
      <div><span class="eyebrow">${type==="show"?"SHOW":"OFFER"} SETLIST</span><h2>${esc(entity.venue||entity.title||"Setlist")}</h2></div>
      <div class="section-actions">
        <span class="badge ${locked?"warn":"good"}">${locked?"LOCKED":"COLLABORATIVE"}</span>
        ${isAdmin()?`<button class="btn small-btn ${locked?"good":"warn"}" type="button" data-toggle-setlist-lock="${type}:${entity.id}">${locked?"UNLOCK":"LOCK SETLIST"}</button>`:""}
      </div>
    </div>
    <div class="setlist-stats">
      <span>${ids.length} songs</span>
      <span>${humanDuration(setlistTotalSeconds(entity))} total music</span>
      <span>${locked?`Locked by ${esc(memberName(entity.setlist.lockedBy))}`:"Anyone in the band can edit"}</span>
    </div>
    <div class="setlist-builder-grid">
      <section class="setlist-panel">
        <div class="setlist-panel-head"><strong>CURRENT SETLIST</strong><span class="small">Drag songs or use ↑ ↓</span></div>
        <div class="setlist-dropzone" id="setlistCurrent">
          ${ids.length?ids.map((id,index)=>{
            const s=data.songs.find(x=>x.id===id);
            if(!s)return "";
            return `<div class="setlist-song" draggable="${!locked}" data-setlist-index="${index}" data-setlist-song-id="${s.id}">
              <span class="setlist-number">${index+1}</span>
              <div class="setlist-song-copy"><strong>${esc(s.title)}</strong><div class="small">${esc(s.key||"Key TBD")} · ${esc(s.timeSig||"Time TBD")} · ${esc(s.length||"Length TBD")}</div></div>
              <div class="setlist-song-actions">
                <button class="btn small-btn ghost" type="button" data-move-setlist="${type}:${entity.id}:${index}:-1" ${locked||index===0?"disabled":""}>↑</button>
                <button class="btn small-btn ghost" type="button" data-move-setlist="${type}:${entity.id}:${index}:1" ${locked||index===ids.length-1?"disabled":""}>↓</button>
                <button class="btn small-btn bad" type="button" data-remove-setlist="${type}:${entity.id}:${index}" ${locked?"disabled":""}>×</button>
              </div>
            </div>`;
          }).join(""):`<div class="empty">No songs yet. Add from the discography.</div>`}
        </div>
      </section>
      <section class="setlist-panel">
        <div class="setlist-panel-head"><strong>FULL DISCOGRAPHY</strong><span class="small">${data.songs.length} songs</span></div>
        <div class="field" style="margin-bottom:9px"><input id="setlistSearch" placeholder="Search song, key, status..." value="${esc(filter)}"></div>
        <div class="discography-list">
          ${library.map(s=>{
            const inSet=ids.includes(s.id);
            return `<button class="discography-song" type="button" data-add-setlist="${type}:${entity.id}:${s.id}" ${locked||inSet?"disabled":""}>
              <div><strong>${esc(s.title)}</strong><div class="small">${esc(s.artist||"PA LINE")} · ${esc(s.status)} · ${esc(s.key||"Key TBD")} · ${esc(s.timeSig||"Time TBD")} · ${esc(s.length||"Length TBD")}</div></div>
              <span>${inSet?"ADDED":"+ ADD"}</span>
            </button>`;
          }).join("")}
        </div>
      </section>
    </div>
  </div>`;
}
function openSetlistBuilder(token,filter=""){
  const [type,id]=token.split(":");
  const entity=getSetlistEntity(type,id);if(!entity)return;
  openModal("Setlist Builder","PA LINE · COLLABORATIVE SETLIST",renderSetlistBuilder(type,entity,filter));
  bindSetlistBuilder(type,entity);
}
function bindSetlistBuilder(type,entity){
  const token=`${type}:${entity.id}`;
  document.querySelector("[data-toggle-setlist-lock]")?.addEventListener("click",()=>toggleSetlistLock(token));
  document.querySelectorAll("[data-add-setlist]").forEach(el=>el.addEventListener("click",()=>addSetlistSong(el.dataset.addSetlist)));
  document.querySelectorAll("[data-remove-setlist]").forEach(el=>el.addEventListener("click",()=>removeSetlistSong(el.dataset.removeSetlist)));
  document.querySelectorAll("[data-move-setlist]").forEach(el=>el.addEventListener("click",()=>moveSetlistSong(el.dataset.moveSetlist)));
  const search=$("setlistSearch");
  search?.addEventListener("input",()=>{const pos=search.selectionStart; $("modalBody").innerHTML=renderSetlistBuilder(type,entity,search.value);bindSetlistBuilder(type,entity); const s2=$("setlistSearch"); if(s2){s2.focus();s2.setSelectionRange(pos,pos)}});
  if(!entity.setlist.locked){
    document.querySelectorAll(".setlist-song[draggable='true']").forEach(row=>{
      row.addEventListener("dragstart",e=>{e.dataTransfer.setData("text/plain",row.dataset.setlistIndex);row.classList.add("dragging")});
      row.addEventListener("dragend",()=>row.classList.remove("dragging"));
      row.addEventListener("dragover",e=>{e.preventDefault();row.classList.add("drag-over")});
      row.addEventListener("dragleave",()=>row.classList.remove("drag-over"));
      row.addEventListener("drop",e=>{
        e.preventDefault();row.classList.remove("drag-over");
        const from=Number(e.dataTransfer.getData("text/plain")),to=Number(row.dataset.setlistIndex);
        reorderSetlistByIndex(type,entity.id,from,to);
      });
    });
  }
}
function addSetlistSong(token){
  const [type,id,songId]=token.split(":");
  const entity=getSetlistEntity(type,id);if(!entity||entity.setlist.locked&&!isAdmin())return;
  entity.setlist ||= {songIds:[],locked:false,lockedAt:null,lockedBy:null};
  if(!entity.setlist.songIds.includes(songId))entity.setlist.songIds.push(songId);
  logActivity(`${currentUser().name} added ${data.songs.find(s=>s.id===songId)?.title||"a song"} to ${entity.venue||"setlist"}.`);
  saveData();openSetlistBuilder(`${type}:${id}`);
}
function removeSetlistSong(token){
  const [type,id,indexStr]=token.split(":");const entity=getSetlistEntity(type,id);
  if(!entity||entity.setlist.locked&&!isAdmin())return;
  entity.setlist.songIds.splice(Number(indexStr),1);saveData();openSetlistBuilder(`${type}:${id}`);
}
function moveSetlistSong(token){
  const [type,id,indexStr,deltaStr]=token.split(":");const entity=getSetlistEntity(type,id);
  if(!entity||entity.setlist.locked&&!isAdmin())return;
  const from=Number(indexStr),to=clamp(from+Number(deltaStr),0,entity.setlist.songIds.length-1);
  reorderSetlistByIndex(type,id,from,to);
}
function reorderSetlistByIndex(type,id,from,to){
  const entity=getSetlistEntity(type,id);
  if(!entity||entity.setlist.locked&&!isAdmin()||from===to||from<0||to<0)return;
  const [song]=entity.setlist.songIds.splice(from,1);entity.setlist.songIds.splice(to,0,song);
  saveData();openSetlistBuilder(`${type}:${id}`);
}
function toggleSetlistLock(token){
  if(!isAdmin())return;
  const [type,id]=token.split(":");const entity=getSetlistEntity(type,id);if(!entity)return;
  entity.setlist.locked=!entity.setlist.locked;
  entity.setlist.lockedAt=entity.setlist.locked?nowISO():null;
  entity.setlist.lockedBy=entity.setlist.locked?state.userId:null;
  logActivity(`${currentUser().name} ${entity.setlist.locked?"locked":"unlocked"} the setlist for ${entity.venue||"show"}.`);
  saveData();openSetlistBuilder(token);
}



function normalizeBookingEmailLog(email){
  return {
    id:uid("glog"),
    at:email.at||email.date||nowISO(),
    kind:email.direction==="outbound"?"email":"reply",
    contact:email.contact||email.fromName||email.toName||email.email||"",
    method:"Email",
    summary:[
      email.direction?`${String(email.direction).toUpperCase()} EMAIL`:"",
      email.subject?`Subject: ${email.subject}`:"",
      email.body||email.snippet||""
    ].filter(Boolean).join("\n\n"),
    nextFollowUp:email.nextFollowUp||null,
    createdBy:state.userId,
    createdAt:nowISO(),
    updatedAt:nowISO(),
    emailThreadId:email.threadId||null,
    emailMessageId:email.messageId||null,
    emailSubject:email.subject||"",
    emailDirection:email.direction||"",
    automatic:true
  };
}
function linkBookingEmailToGig(type,id,email){
  if(!isAdmin())return false;
  const entity=gigLogEntity(type,id);if(!entity)return false;
  entity.gigLog ||= [];
  if(email.messageId && entity.gigLog.some(e=>e.emailMessageId===email.messageId))return false;
  entity.gigLog.push(normalizeBookingEmailLog(email));
  logActivity(`${currentUser().name} linked a booking email to ${entity.venue||"gig"}.`);
  saveData();
  return true;
}
function openEmailBookingLogForm(token){
  if(!isAdmin())return;
  const [type,id]=token.split(":");
  const entity=gigLogEntity(type,id);if(!entity)return;
  const nowLocal=new Date();
  const localISO=new Date(nowLocal.getTime()-nowLocal.getTimezoneOffset()*60000).toISOString().slice(0,16);
  openModal("Add booking email","COMMAND · EMAIL TIMELINE",`
    <div class="form-grid">
      <div class="field"><label>Date + time</label><input id="gbeAt" type="datetime-local" value="${localISO}"></div>
      <div class="field"><label>Direction</label><select id="gbeDirection"><option value="inbound">Inbound</option><option value="outbound">Outbound</option></select></div>
      <div class="field"><label>Who</label><input id="gbeContact" placeholder="Booker / venue contact"></div>
      <div class="field"><label>Email address</label><input id="gbeEmail" type="email" placeholder="name@example.com"></div>
      <div class="field full"><label>Subject</label><input id="gbeSubject" placeholder="Booking PA LINE - Aug 14"></div>
      <div class="field full"><label>What was said</label><textarea id="gbeBody" rows="7" placeholder="Paste the important part of the booking email here."></textarea></div>
      <div class="field"><label>Next follow-up, optional</label><input id="gbeFollow" type="datetime-local"></div>
      <div class="field full"><label>Gmail thread ID, optional</label><input id="gbeThread" placeholder="For future automatic Gmail linking"></div>
    </div>
    <div class="modal-footer"><button class="btn primary" type="button" data-save-booking-email>SAVE EMAIL TO TIMELINE</button></div>`);
  document.querySelector("[data-save-booking-email]").addEventListener("click",()=>{
    const at=$("gbeAt").value,follow=$("gbeFollow").value;
    linkBookingEmailToGig(type,id,{
      at:at?new Date(at).toISOString():nowISO(),
      direction:$("gbeDirection").value,
      contact:$("gbeContact").value.trim(),
      email:$("gbeEmail").value.trim(),
      subject:$("gbeSubject").value.trim(),
      body:$("gbeBody").value.trim(),
      threadId:$("gbeThread").value.trim()||null,
      nextFollowUp:follow?new Date(follow).toISOString():null
    });
    type==="show"?openShowModal(id):openOfferModal(id);
  });
}
function gigLogEntity(type,id){
  return type==="show"?data.shows.find(x=>x.id===id):data.offers.find(x=>x.id===id);
}
function gigLogTypeLabel(type){
  return ({outreach:"OUTREACH",reply:"REPLY",followup:"FOLLOW-UP",call:"CALL",text:"TEXT",email:"EMAIL",meeting:"MEETING",confirmed:"CONFIRMED",changed:"CHANGE",payment:"PAYMENT",note:"NOTE"})[type]||String(type||"NOTE").toUpperCase();
}
function sortedGigLog(entity){
  return [...(entity.gigLog||[])].sort((a,b)=>new Date(a.at)-new Date(b.at));
}
function renderGigLog(entity,type){
  if(!isAdmin())return "";
  const entries=sortedGigLog(entity);
  return `<section class="section gig-log-section">
    <div class="section-head">
      <div><h2>My gig timeline</h2><div class="small">Private COMMAND notes · ${entries.length} entr${entries.length===1?"y":"ies"}</div></div>
      <div class="section-actions">
        <button class="btn small-btn ghost" type="button" data-add-booking-email="${type}:${entity.id}">+ EMAIL</button>
        <button class="btn small-btn" type="button" data-add-gig-log="${type}:${entity.id}">+ LOG ENTRY</button>
      </div>
    </div>
    <div class="section-body">
      <div class="gig-timeline">
        ${entries.length?entries.map(e=>`<div class="gig-log-entry">
          <div class="gig-log-dot"></div>
          <div class="gig-log-main">
            <div class="gig-log-top">
              <span class="badge ${e.kind==="confirmed"?"good":e.kind==="followup"?"warn":"blue"}">${gigLogTypeLabel(e.kind)}</span>
              <strong>${esc(e.contact||"No contact named")}</strong>
              ${e.method?`<span class="small">via ${esc(e.method)}</span>`:""}
            </div>
            <div class="gig-log-time">${new Date(e.at).toLocaleString()}</div>
            ${e.emailSubject?`<div class="small gig-email-subject">${esc(e.emailDirection?e.emailDirection.toUpperCase()+" · ":"")}${esc(e.emailSubject)}</div>`:""}
            ${e.summary?`<div class="gig-log-summary">${esc(e.summary)}</div>`:""}
            ${e.emailThreadId?`<div class="small">Email thread linked</div>`:""}
            ${e.nextFollowUp?`<div class="small gig-followup">Next follow-up: ${new Date(e.nextFollowUp).toLocaleString()}</div>`:""}
          </div>
          <div class="list-item-actions">
            <button class="btn small-btn ghost" type="button" data-edit-gig-log="${type}:${entity.id}:${e.id}">EDIT</button>
            <button class="btn small-btn bad" type="button" data-delete-gig-log="${type}:${entity.id}:${e.id}">×</button>
          </div>
        </div>`).join(""):`<div class="empty">Nothing logged yet. Add the first outreach, call, text, email, reply, or confirmation.</div>`}
      </div>
    </div>
  </section>`;
}
function openGigLogForm(token,entryId=null){
  if(!isAdmin())return;
  const [type,id]=token.split(":");
  const entity=gigLogEntity(type,id);if(!entity)return;
  entity.gigLog ||= [];
  const entry=entryId?entity.gigLog.find(e=>e.id===entryId):null;
  const nowLocal=new Date();
  const localISO=new Date(nowLocal.getTime()-nowLocal.getTimezoneOffset()*60000).toISOString().slice(0,16);
  openModal(entry?"Edit timeline entry":"Log gig activity","COMMAND · PRIVATE NOTES",`
    <div class="form-grid">
      <div class="field"><label>Date + time</label><input id="glAt" type="datetime-local" value="${entry?.at?new Date(new Date(entry.at).getTime()-new Date(entry.at).getTimezoneOffset()*60000).toISOString().slice(0,16):localISO}"></div>
      <div class="field"><label>Activity</label><select id="glKind">
        ${["outreach","reply","followup","call","text","email","meeting","confirmed","changed","payment","note"].map(k=>`<option value="${k}" ${entry?.kind===k?"selected":""}>${gigLogTypeLabel(k)}</option>`).join("")}
      </select></div>
      <div class="field"><label>Who I talked to</label><input id="glContact" value="${esc(entry?.contact||"")}" placeholder="Name / venue / booker"></div>
      <div class="field"><label>Method</label><select id="glMethod">
        ${["","Email","Phone call","Text","Facebook","Instagram","In person","Website form","Other"].map(v=>`<option ${entry?.method===v?"selected":""}>${v}</option>`).join("")}
      </select></div>
      <div class="field full"><label>What was said / what happened</label><textarea id="glSummary" rows="5" placeholder="Example: Reached out about Aug 14. Spoke with Sarah. She said Fridays are open and asked for full-band pricing.">${esc(entry?.summary||"")}</textarea></div>
      <div class="field"><label>Next follow-up, optional</label><input id="glFollow" type="datetime-local" value="${entry?.nextFollowUp?new Date(new Date(entry.nextFollowUp).getTime()-new Date(entry.nextFollowUp).getTimezoneOffset()*60000).toISOString().slice(0,16):""}"></div>
    </div>
    <div class="modal-footer"><button class="btn primary" type="button" data-save-gig-log>SAVE ENTRY</button></div>`);
  document.querySelector("[data-save-gig-log]").addEventListener("click",()=>{
    const atVal=$("glAt").value,followVal=$("glFollow").value;
    const payload={
      id:entry?.id||uid("glog"),
      at:atVal?new Date(atVal).toISOString():nowISO(),
      kind:$("glKind").value||"note",
      contact:$("glContact").value.trim(),
      method:$("glMethod").value,
      summary:$("glSummary").value.trim(),
      nextFollowUp:followVal?new Date(followVal).toISOString():null,
      createdBy:entry?.createdBy||state.userId,
      createdAt:entry?.createdAt||nowISO(),
      updatedAt:nowISO()
    };
    if(entry)Object.assign(entry,payload);else entity.gigLog.push(payload);
    logActivity(`${currentUser().name} ${entry?"updated":"added"} a private gig timeline entry for ${entity.venue||"gig"}.`);
    saveData();
    type==="show"?openShowModal(id):openOfferModal(id);
  });
}
function editGigLog(token){
  const [type,id,entryId]=token.split(":");
  openGigLogForm(`${type}:${id}`,entryId);
}
function deleteGigLog(token){
  if(!isAdmin())return;
  const [type,id,entryId]=token.split(":");
  const entity=gigLogEntity(type,id);if(!entity)return;
  if(!confirm("Delete this timeline entry?"))return;
  entity.gigLog=(entity.gigLog||[]).filter(e=>e.id!==entryId);
  saveData();
  type==="show"?openShowModal(id):openOfferModal(id);
}
function bindGigLogButtons(){
  document.querySelectorAll("[data-add-gig-log]").forEach(el=>el.addEventListener("click",()=>openGigLogForm(el.dataset.addGigLog)));
  document.querySelectorAll("[data-edit-gig-log]").forEach(el=>el.addEventListener("click",()=>editGigLog(el.dataset.editGigLog)));
  document.querySelectorAll("[data-delete-gig-log]").forEach(el=>el.addEventListener("click",()=>deleteGigLog(el.dataset.deleteGigLog)));
  document.querySelectorAll("[data-add-booking-email]").forEach(el=>el.addEventListener("click",()=>openEmailBookingLogForm(el.dataset.addBookingEmail)));
}

function renderOfferDetail(o){
  const ctx=offerContext(o),availability=lineupAvailability(o.lineupId,ctx);
  const required=getLineup(o.lineupId)?.required||[];
  const currentResp=o.responses?.[state.userId];
  const responseRows=required.map(id=>{
    const a=memberAvailability(id,ctx),r=o.responses?.[id];
    return `<tr><td>${esc(memberName(id))}</td><td><span class="dot ${a.status==="available"?"good":a.status==="blocked"?"bad":"warn"}"></span>${a.status.toUpperCase()}</td><td>${r?esc(r.status.replace("talk","NEED TO TALK").toUpperCase()):"WAITING"}</td><td>${esc(r?.note||"")}</td></tr>`;
  }).join("");
  return `
  <div class="detail-grid">
    <div>
      <div class="info-grid">
        <div class="info-box"><span>DATE</span><strong>${fmtDateShort(o.date)}</strong></div>
        <div class="info-box"><span>SHOW</span><strong>${fmtTime(o.start)} to ${fmtTime(o.end)}</strong></div>
        <div class="info-box"><span>FORMAT</span><strong>${esc(formatName(o.lineupId))}</strong></div>
        <div class="info-box"><span>OFFER</span><strong>${o.pay?money(o.pay):"TBD"}</strong></div>
      </div>
      <div class="note-box admin" style="margin-top:10px"><span class="eyebrow">ADMIN NOTES</span><p>${esc(o.adminNotes||"No admin notes.")}</p></div>
      ${renderOfferPayout(o)}
      ${renderAttendanceMerch(o)}
      ${renderGigLog(o,"offer")}
      <div class="section" style="margin-top:12px">
        <div class="section-head"><h2>Lineup status</h2><span class="badge ${availability.status==="available"?"good":availability.status==="blocked"?"bad":"warn"}">${availability.status.toUpperCase()}</span></div>
        <div class="section-body"><table class="availability-table"><thead><tr><th>Member</th><th>Calendar</th><th>Response</th><th>Note</th></tr></thead><tbody>${responseRows}</tbody></table></div>
      </div>
      ${isAdmin()?renderAdminOfferActions(o,availability):renderMemberOfferResponse(o,currentResp)}
    </div>
    <aside>
      <div class="note-box">
        <span class="eyebrow">COMMITMENT WINDOW</span>
        ${renderCommitmentTimeline(o)}
        <div class="small" style="margin-top:8px">Includes inbound travel, 2-hour pre-show window, performance, 2-hour post-show window, and outbound travel. Personal busy details stay hidden.</div>
      </div>
      ${renderSetlistSummary(o,"offer")}
      <div class="note-box">
        <span class="eyebrow">NOTES</span>
        <div class="thread" style="margin-top:9px">${renderOfferNotes(o)}</div>
        <button class="btn small-btn" type="button" style="margin-top:9px" data-add-offer-note="${o.id}">ADD NOTE</button>
      </div>
    </aside>
  </div>`;
}
function renderMemberOfferResponse(o,currentResp){
  return `<section class="section"><div class="section-head"><h2>Your answer</h2>${currentResp?`<span class="badge">${esc(currentResp.status)}</span>`:""}</div><div class="section-body">
    <div class="offer-response-grid">
      <button class="choice ${currentResp?.status==="available"?"selected":""}" type="button" data-offer-response="${o.id}" data-response="available"><strong>I'M AVAILABLE</strong><span>Clear this date for PA LINE.</span></button>
      <button class="choice ${currentResp?.status==="unavailable"?"selected":""}" type="button" data-offer-response="${o.id}" data-response="unavailable"><strong>I CAN'T DO IT</strong><span>Mark yourself unavailable for this offer.</span></button>
      <button class="choice ${currentResp?.status==="talk"?"selected":""}" type="button" data-offer-response="${o.id}" data-response="talk"><strong>NEED TO TALK</strong><span>Flag the offer for discussion.</span></button>
    </div>
  </div></section>`;
}
function renderAdminOfferActions(o,availability){
  const required=getLineup(o.lineupId)?.required||[];
  const allAvailableResponses=required.every(id=>o.responses?.[id]?.status==="available");
  return `<section class="section"><div class="section-head"><h2>Command decision</h2></div><div class="section-body">
    <div class="small">${allAvailableResponses&&availability.status==="available"?"Required members have responded available and calendars are clear.":"Confirmation stays locked until required members are available and have responded available."}</div>
    <div class="section-actions" style="margin-top:10px">
      <button class="btn good" type="button" data-confirm-offer="${o.id}" ${allAvailableResponses&&availability.status==="available"?"":"disabled"}>CONFIRM SHOW</button>
      <button class="btn bad" type="button" data-decline-offer="${o.id}">DECLINE / CLOSE</button>
    </div>
  </div></section>`;
}
function renderOfferNotes(o){
  const notes=(o.notes||[]).filter(n=>n.visibility==="shared"||n.authorId===state.userId||isAdmin());
  if(!notes.length)return `<div class="small">No notes yet.</div>`;
  return notes.map(n=>`<div class="note-entry"><div class="byline">${esc(memberName(n.authorId))} · ${n.visibility==="private"?"PRIVATE":"SHARED"} · ${new Date(n.at).toLocaleString()}</div><p>${esc(n.text)}</p></div>`).join("");
}

function renderShowsPage(){
  const shows=upcomingShowsFor(state.userId);
  return `<section class="hero"><span class="eyebrow">PA LINE CREW · SHOWS</span><h1>Confirmed shows</h1><p>Only shows you are assigned to appear here.</p></section>
  <section class="section"><div class="section-head"><h2>Upcoming</h2></div><div class="section-body">${shows.length?`<div class="list">${shows.map(s=>`<div class="list-item"><div>${renderShowSummary(s,false)}</div><div class="list-item-actions"><button class="btn small-btn" type="button" data-open-show="${s.id}">SHOW HUB</button></div></div>`).join("")}</div>`:`<div class="empty">No confirmed shows assigned to you yet.</div>`}</div></section>`;
}
function renderShowSummary(s,compact=false){
  return `<div class="list-item-title"><strong>${esc(s.venue)}</strong><span class="badge good">CONFIRMED</span></div>
  <div class="list-item-meta">${fmtDate(s.date)} · ${esc(s.city)}, ${esc(s.state)} · ${esc(formatName(s.lineupId))}</div>
  ${compact?`<div class="list-item-meta">Commitment: ${s.commitmentStartISO?fmtDateTimeClock(new Date(s.commitmentStartISO)):fmtTime(s.commitmentStart||s.start)} to ${s.commitmentEndISO?fmtDateTimeClock(new Date(s.commitmentEndISO)):fmtTime(s.commitmentEnd||s.end)}</div>`:""}`;
}

function renderShowAttendanceMerch(s){
  const att=Number(s.attendanceActual||0)>0?{value:Number(s.attendanceActual),source:"actual",confidence:"high",basis:"Recorded after show"}:(s.attendanceEstimateSnapshot||attendanceEstimateFor(s));
  const forecast=merchForecastForAttendance(att.value);
  const split=merchSplit(Number(s.merchActualGross||0),s.members||[]);
  return `<div class="note-box" style="margin-top:10px">
    <span class="eyebrow">ATTENDANCE + MERCH</span>
    <p>Attendance: <strong>${att.value}</strong> (${esc(att.source)}). Merch target: ${money(forecast.mid.gross)}. ${s.merchActualGross?`Actual merch: ${money(s.merchActualGross)} · restock reserve ${money(split.restock)}.`:"Actual merch not entered yet."}</p>
    ${isAdmin()?`<button class="btn small-btn" type="button" data-edit-show-merch="${s.id}">UPDATE ACTUALS</button>`:""}
  </div>`;
}
function renderShowDetail(s){
  return `<div>
    <div class="info-grid">
      <div class="info-box"><span>DATE</span><strong>${fmtDateShort(s.date)}</strong></div>
      <div class="info-box"><span>SHOW</span><strong>${fmtTime(s.start)} to ${fmtTime(s.end)}</strong></div>
      <div class="info-box"><span>FORMAT</span><strong>${esc(formatName(s.lineupId))}</strong></div>
      <div class="info-box"><span>STATUS</span><strong>CONFIRMED</strong></div>
    </div>
    ${s.pay?`<div class="note-box" style="margin-top:10px"><span class="eyebrow">PAYMENT</span><p>${currentUser()?.isAdmin?`Show offer: ${money(s.pay)}. Non-owner member cuts are 20% each for assigned performing members. Trever uses owner draws rather than a fixed member cut.`:`${currentUser()?.isAdmin?"":`Your expected cut: ${currentUser()?.isAdmin?"Owner draw":money(s.pay*.20)}`}`}</p></div>`:""}
    ${renderShowAttendanceMerch(s)}
    ${renderGigLog(s,"show")}
    <div class="note-box admin" style="margin-top:10px"><span class="eyebrow">SHOW NOTES</span><p>${esc(s.adminNotes||"No show notes yet.")}</p></div>
    <div class="note-box" style="margin-top:10px"><span class="eyebrow">ASSIGNED CREW</span><div class="lineup-members">${s.members.map(id=>`<span class="member-pill">${esc(memberName(id))}</span>`).join("")}</div></div>
    <div style="margin-top:10px">${renderSetlistSummary(s,"show")}</div>
  </div>`;
}

function renderCalendarPage(){
  const label=new Date(state.calendarYear,state.calendarMonth,1).toLocaleDateString(undefined,{month:"long",year:"numeric"});
  return `
  <section class="hero"><span class="eyebrow">${isAdmin()?"MASTER CALENDAR":"MY CALENDAR"}</span><h1>${isAdmin()?"Band availability at a glance.":"Protect your availability."}</h1><p>${isAdmin()?"Member blocks, offers, and confirmed shows combine into one operational calendar.":"Block dates or time ranges here. Connected personal calendars contribute busy time without exposing event details."}</p></section>
  <section class="section">
    <div class="section-head">
      <h2>${label}</h2>
      <div class="section-actions">
        <button class="btn small-btn" type="button" data-cal-prev>←</button>
        <button class="btn small-btn" type="button" data-cal-today>TODAY</button>
        <button class="btn small-btn" type="button" data-cal-next>→</button>
        ${!isAdmin()?`<button class="btn primary small-btn" type="button" data-block-date>BLOCK TIME</button>`:""}
      </div>
    </div>
    <div class="section-body">
      <div class="calendar-scroll">${renderMonthCalendar()}</div>
    </div>
  </section>
  ${renderSelectedDay()}`;
}
function calendarEventsFor(date){
  const items=[];
  data.blocks.filter(b=>b.date===date&&(isAdmin()||b.memberId===state.userId)).forEach(b=>{
    const ignored=b.availabilityOverride==="available";
    const sourceIsPersonal=["ics","google","microsoft","personal"].includes(String(b.source||"").toLowerCase());
    let label=isAdmin()?`${memberName(b.memberId)} ${ignored?"available override":"busy"}`:(ignored?"Available despite event":"Personal calendar busy");
    if(!sourceIsPersonal && !isAdmin())label=ignored?"Available override":"Manual availability block";
    items.push({type:ignored?"ignored":"block",label,ref:b});
  });
  data.offers.filter(o=>o.date===date&&(isAdmin()||o.recipients.includes(state.userId))).forEach(o=>items.push({type:"offer",label:`Offer · ${o.venue}`,ref:o}));
  data.shows.filter(s=>s.date===date&&(isAdmin()||s.members.includes(state.userId))).forEach(s=>items.push({type:"show",label:`Show · ${s.venue}`,ref:s}));
  data.holds.filter(h=>h.date===date&&(isAdmin()||h.members?.includes(state.userId))).forEach(h=>items.push({type:"hold",label:`Hold · ${h.label}`,ref:h}));
  data.rehearsals.filter(r=>r.date===date&&r.status!=="cancelled"&&(isAdmin()||r.members?.includes(state.userId))).forEach(r=>items.push({type:"rehearsal",label:`Rehearsal · ${r.title}`,ref:r}));
  data.meetings.filter(m=>m.date===date&&m.status!=="cancelled"&&(isAdmin()||m.members?.includes(state.userId))).forEach(m=>items.push({type:"meeting",label:`Meeting · ${m.title}`,ref:m}));
  return items;
}
function renderMonthCalendar(){
  const first=new Date(state.calendarYear,state.calendarMonth,1);
  const start=new Date(first); start.setDate(1-first.getDay());
  const weekdays=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
  let html=`<div class="calendar-grid">${weekdays.map(d=>`<div class="weekday">${d}</div>`).join("")}`;
  for(let i=0;i<42;i++){
    const d=new Date(start);d.setDate(start.getDate()+i);
    const ds=isoDate(d),outside=d.getMonth()!==state.calendarMonth,events=calendarEventsFor(ds);
    html+=`<button type="button" class="day ${outside?"outside":""} ${state.selectedDate===ds?"selected":""}" data-calendar-date="${ds}">
      <div class="day-number">${d.getDate()}</div>
      <div class="day-events">${events.slice(0,3).map(e=>`<div class="day-chip ${e.type}">${esc(e.label)}</div>`).join("")}${events.length>3?`<div class="day-chip">+${events.length-3} more</div>`:""}</div>
    </button>`;
  }
  return html+`</div>`;
}
function renderSelectedDay(){
  const ds=state.selectedDate,events=calendarEventsFor(ds);
  const ctx={date:ds,start:"19:00",end:"22:00",travelBeforeHours:2,travelAfterHours:2};
  return `<section class="section">
    <div class="section-head"><h2>${fmtDate(ds)}</h2>${!isAdmin()?`<button class="btn small-btn" type="button" data-block-date="${ds}">BLOCK THIS DATE</button>`:""}</div>
    <div class="section-body">
      ${isAdmin()?`<div class="small" style="margin-bottom:10px">7 PM to 10 PM sample availability for this date.</div>${availabilityCards(ctx)}`:""}
      <div style="margin-top:${isAdmin()?"14px":"0"}">${events.length?`<div class="list">${events.map(e=>{
        const isPersonalBlock=["block","ignored"].includes(e.type);
        const canToggle=isPersonalBlock && !isAdmin() && e.ref.memberId===state.userId;
        const ignored=e.ref?.availabilityOverride==="available";
        const sourceLabel=e.ref?.source?String(e.ref.source).toUpperCase():"";
        return `<div class="list-item ${ignored?"calendar-event-ignored":""}">
          <div>
            <div class="list-item-title">
              <strong>${esc(e.label)}</strong>
              <span class="badge ${e.type==="show"?"good":e.type==="offer"?"blue":e.type==="block"?"bad":e.type==="rehearsal"?"purple":e.type==="meeting"?"blue":e.type==="ignored"?"":"warn"}">${e.type==="ignored"?"AVAILABLE":e.type.toUpperCase()}</span>
            </div>
            ${isPersonalBlock?`<div class="list-item-meta">${isAdmin()?`Private details hidden · `:""}${new Date(e.ref.start).toLocaleTimeString([], {hour:"numeric",minute:"2-digit"})} to ${new Date(e.ref.end).toLocaleTimeString([], {hour:"numeric",minute:"2-digit"})}${sourceLabel?` · ${esc(sourceLabel)}`:""}</div>`:""}
            ${canToggle?`<div class="small" style="margin-top:5px">${ignored?"Dimmed means this personal event does not block PA LINE availability.":"This personal event currently blocks PA LINE availability."}</div>`:""}
          </div>
          <div class="list-item-actions">
            ${canToggle?`<button class="btn small-btn ${ignored?"ghost":"good"}" type="button" data-toggle-personal-event="${e.ref.id}">${ignored?"MAKE BLOCKING":"I'M STILL AVAILABLE"}</button>`:""}
            ${["rehearsal","meeting"].includes(e.type)?`<button class="btn small-btn" type="button" data-open-internal-event="${e.type}:${e.ref.id}">OPEN</button>`:""}
          </div>
        </div>`;
      }).join("")}</div>`:`<div class="empty">No PA LINE activity or availability blocks on this date.</div>`}</div>
      ${!isAdmin()?`<div class="calendar-legend"><span class="legend-swatch busy"></span> Personal event blocks availability <span class="legend-swatch ignored"></span> Dimmed = you marked yourself still available</div>`:""}
    </div>
  </section>`;
}


function internalEventsFor(type){
  const src=type==="rehearsal"?data.rehearsals:data.meetings;
  return src.filter(x=>isAdmin()||x.members?.includes(state.userId)).sort((a,b)=>(a.date+a.start).localeCompare(b.date+b.start));
}
function eventRSVP(event,memberId){
  return event.rsvps?.[memberId]?.status || "waiting";
}
function renderInternalEventList(type){
  const events=internalEventsFor(type);
  if(!events.length)return `<div class="empty">No ${type==="rehearsal"?"rehearsals":"band meetings"} scheduled yet.</div>`;
  return `<div class="list">${events.map(x=>{
    const rsvp=eventRSVP(x,state.userId);
    return `<div class="list-item">
      <div>
        <div class="list-item-title">
          <strong>${esc(x.title)}</strong>
          <span class="badge ${type==="rehearsal"?"purple":"blue"}">${type==="rehearsal"?"REHEARSAL":"VIDEO MEETING"}</span>
          ${x.blocksAvailability?`<span class="badge warn">BLOCKS AVAILABILITY</span>`:`<span class="badge">NON-BLOCKING</span>`}
        </div>
        <div class="list-item-meta">${fmtDate(x.date)} · ${fmtTime(x.start)} to ${fmtTime(x.end)}${x.location?` · ${esc(x.location)}`:""}</div>
        ${!isAdmin()?`<div class="list-item-meta">Your RSVP: ${esc(rsvp.toUpperCase())}</div>`:`<div class="list-item-meta">${x.members?.length||0} invited · ${Object.values(x.rsvps||{}).filter(r=>r.status==="attending").length} attending</div>`}
      </div>
      <div class="list-item-actions"><button class="btn small-btn" type="button" data-open-internal-event="${type}:${x.id}">OPEN</button></div>
    </div>`;
  }).join("")}</div>`;
}
function renderRehearsalsPage(){
  return `<section class="hero"><span class="eyebrow">${isAdmin()?"COMMAND":"CREW"} · REHEARSALS</span><h1>${isAdmin()?"Schedule the work.":"Know when we're rehearsing."}</h1><p>${isAdmin()?"Schedule full-band or selected-member rehearsals, collect RSVPs, add notes, and choose whether the rehearsal blocks booking availability.":"See rehearsal details, RSVP, and keep rehearsal commitments on your PA LINE calendar."}</p></section>
  <section class="section"><div class="section-head"><h2>Scheduled rehearsals</h2>${isAdmin()?`<button class="btn primary small-btn" type="button" data-new-rehearsal>+ REHEARSAL</button>`:""}</div><div class="section-body">${renderInternalEventList("rehearsal")}</div></section>`;
}
function renderMeetingsPage(){
  return `<section class="hero"><span class="eyebrow">${isAdmin()?"COMMAND":"CREW"} · BAND MEETINGS</span><h1>${isAdmin()?"Get everyone in the same room.":"Join the band meeting."}</h1><p>${isAdmin()?"Schedule video meetings, add an agenda and join link, invite the right people, and decide whether the meeting should affect booking availability.":"See the agenda, RSVP, and join from your portal when the meeting starts."}</p></section>
  <section class="section"><div class="section-head"><h2>Scheduled meetings</h2>${isAdmin()?`<button class="btn primary small-btn" type="button" data-new-meeting>+ VIDEO MEETING</button>`:""}</div><div class="section-body">${renderInternalEventList("meeting")}</div></section>`;
}
function getChatChannel(id=state.chatChannelId){
  return data.chatChannels.find(c=>c.id===id)||data.chatChannels[0];
}
function renderChatPage(){
  const channel=getChatChannel();
  const messages=channel?.messages||[];
  return `<section class="hero"><span class="eyebrow">PA LINE CREW · CHAT</span><h1>Keep the casual stuff casual.</h1><p>Band conversation that does not need to become a formal show note, offer response, or rehearsal instruction can live here.</p></section>
  <div class="chat-layout">
    <aside class="section chat-channels">
      <div class="section-head"><h2>Channels</h2>${isAdmin()?`<button class="btn small-btn" type="button" data-new-chat-channel>+</button>`:""}</div>
      <div class="section-body">
        <div class="nav">${data.chatChannels.map(c=>`<button class="nav-btn ${channel?.id===c.id?"active":""}" type="button" data-chat-channel="${c.id}"># ${esc(c.name)}</button>`).join("")}</div>
      </div>
    </aside>
    <section class="section chat-main">
      <div class="section-head"><h2># ${esc(channel?.name||"General")}</h2><span class="badge">${messages.length} MESSAGES</span></div>
      <div class="section-body">
        <div class="chat-thread" id="chatThread">${messages.length?messages.map(m=>`<div class="chat-message ${m.authorId===state.userId?"mine":""}"><div class="chat-avatar">${esc(memberName(m.authorId).slice(0,1).toUpperCase())}</div><div class="chat-bubble"><div class="chat-byline"><strong>${esc(memberName(m.authorId))}</strong><span>${new Date(m.at).toLocaleString()}</span></div><div class="chat-text">${esc(m.text)}</div></div></div>`).join(""):`<div class="empty">No messages yet. Start the conversation.</div>`}</div>
        <form class="chat-compose" id="chatCompose"><input class="input" id="chatMessage" maxlength="1000" placeholder="Message #${esc(channel?.name||"General")}" autocomplete="off"><button class="btn primary" type="submit">SEND</button></form>
        <div class="small" style="margin-top:7px">Prototype chat is browser-local. Production should use authenticated realtime messages.</div>
      </div>
    </section>
  </div>`;
}
function openInternalEventForm(type,id=null){
  if(!isAdmin())return;
  const src=type==="rehearsal"?data.rehearsals:data.meetings;
  const event=id?src.find(x=>x.id===id):null;
  const defaultBlocking=type==="rehearsal";
  openModal(event?`Edit ${event.title}`:(type==="rehearsal"?"Schedule rehearsal":"Schedule video meeting"),type==="rehearsal"?"COMMAND · REHEARSAL":"COMMAND · BAND MEETING",`
    <div class="form-grid">
      <div class="field"><label>Title</label><input id="ieTitle" value="${esc(event?.title||(type==="rehearsal"?"Band Rehearsal":"PA LINE Band Meeting"))}"></div>
      <div class="field"><label>Date</label><input id="ieDate" type="date" value="${event?.date||datePlus(7)}"></div>
      <div class="field"><label>Start</label><input id="ieStart" type="time" value="${event?.start||"19:00"}"></div>
      <div class="field"><label>End</label><input id="ieEnd" type="time" value="${event?.end||"21:00"}"></div>
      <div class="field"><label>${type==="rehearsal"?"Location":"Video meeting link"}</label><input id="ieLocation" value="${esc(event?.location||"")}" placeholder="${type==="rehearsal"?"Rehearsal room / address":"https://..."}"></div>
      <div class="field"><label>Status</label><select id="ieStatus"><option value="scheduled" ${event?.status!=="cancelled"?"selected":""}>Scheduled</option><option value="cancelled" ${event?.status==="cancelled"?"selected":""}>Cancelled</option></select></div>
    </div>
    <div class="field" style="margin-top:12px"><label>${type==="rehearsal"?"Rehearsal notes":"Agenda / notes"}</label><textarea id="ieNotes">${esc(event?.notes||"")}</textarea></div>
    <label class="check-row" style="margin-top:12px"><input id="ieBlocks" type="checkbox" ${(event?event.blocksAvailability:defaultBlocking)?"checked":""}><span><strong>Blocks booking availability</strong><span class="small"> · Treat invited members as committed during this time</span></span></label>
    <div class="field" style="margin-top:12px"><label>Invite members</label><div class="list">${data.members.map(m=>`<label class="check-row"><input type="checkbox" data-ie-member value="${m.id}" ${event?.members?.includes(m.id)||(!event&&type==="rehearsal")?"checked":""}><span><strong>${esc(m.fullName)}</strong><span class="small"> · ${esc(m.role)}</span></span></label>`).join("")}</div></div>
    <div class="modal-footer"><button class="btn primary" type="button" data-save-internal-event>${event?"SAVE":"SCHEDULE"}</button></div>`);
  document.querySelector("[data-save-internal-event]").addEventListener("click",()=>saveInternalEvent(type,event));
}
function saveInternalEvent(type,event){
  const title=$("ieTitle").value.trim(),date=$("ieDate").value,start=$("ieStart").value,end=$("ieEnd").value;
  const members=[...document.querySelectorAll("[data-ie-member]:checked")].map(x=>x.value);
  if(!title||!date||!start||!end||!members.length){alert("Title, date, times, and at least one invited member are required.");return}
  const src=type==="rehearsal"?data.rehearsals:data.meetings;
  const isNew=!event;
  if(!event){event={id:uid(type==="rehearsal"?"reh":"meet"),rsvps:{},createdAt:nowISO()};src.push(event)}
  Object.assign(event,{
    title,date,start,end,location:$("ieLocation").value.trim(),notes:$("ieNotes").value.trim(),
    blocksAvailability:$("ieBlocks").checked,members,status:$("ieStatus").value,
    updatedAt:nowISO()
  });
  if(isNew){
    members.forEach(id=>notify(id,type==="rehearsal"?"Rehearsal scheduled":"Band meeting scheduled",`${title} · ${fmtDate(date)} · ${fmtTime(start)}`,type,event.id));
  }else{
    members.forEach(id=>notify(id,type==="rehearsal"?"Rehearsal updated":"Band meeting updated",`${title} · ${fmtDate(date)} · ${fmtTime(start)}`,type,event.id));
  }
  logActivity(`${isNew?"Scheduled":"Updated"} ${type} ${title}.`);
  saveData();closeModal();mount();
}
function renderInternalEventDetail(type,event){
  const my=eventRSVP(event,state.userId);
  const safeJoin=type==="meeting"&&/^https?:\/\//i.test(event.location||"");
  return `<div>
    <div class="info-grid">
      <div class="info-box"><span>DATE</span><strong>${fmtDateShort(event.date)}</strong></div>
      <div class="info-box"><span>TIME</span><strong>${fmtTime(event.start)} to ${fmtTime(event.end)}</strong></div>
      <div class="info-box"><span>TYPE</span><strong>${type==="rehearsal"?"Rehearsal":"Video meeting"}</strong></div>
      <div class="info-box"><span>BOOKING IMPACT</span><strong>${event.blocksAvailability?"Blocks availability":"Non-blocking"}</strong></div>
    </div>
    <div class="note-box admin" style="margin-top:10px"><span class="eyebrow">${type==="rehearsal"?"REHEARSAL NOTES":"AGENDA"}</span><p>${esc(event.notes||"No notes yet.")}</p></div>
    <div class="note-box" style="margin-top:10px"><span class="eyebrow">${type==="rehearsal"?"LOCATION":"VIDEO ROOM"}</span><p>${esc(event.location||"Not set")}</p>${safeJoin?`<a class="btn primary" href="${esc(event.location)}" target="_blank" rel="noopener noreferrer">JOIN VIDEO MEETING</a>`:""}</div>
    <div class="note-box" style="margin-top:10px"><span class="eyebrow">INVITED</span><div class="lineup-members">${event.members.map(id=>`<span class="member-pill">${esc(memberName(id))} · ${esc(eventRSVP(event,id).toUpperCase())}</span>`).join("")}</div></div>
    ${event.members.includes(state.userId)?`<section class="section"><div class="section-head"><h2>Your RSVP</h2><span class="badge">${esc(my.toUpperCase())}</span></div><div class="section-body"><div class="offer-response-grid"><button class="choice ${my==="attending"?"selected":""}" type="button" data-internal-rsvp="${type}:${event.id}:attending"><strong>ATTENDING</strong><span>I plan to be there.</span></button><button class="choice ${my==="tentative"?"selected":""}" type="button" data-internal-rsvp="${type}:${event.id}:tentative"><strong>MAYBE</strong><span>I need to confirm.</span></button><button class="choice ${my==="unavailable"?"selected":""}" type="button" data-internal-rsvp="${type}:${event.id}:unavailable"><strong>CAN'T MAKE IT</strong><span>Flag this for the band.</span></button></div></div></section>`:""}
    ${isAdmin()?`<div class="modal-footer"><button class="btn" type="button" data-edit-internal-event="${type}:${event.id}">EDIT</button></div>`:""}
  </div>`;
}
function openInternalEvent(token){
  const [type,id]=token.split(":");
  const src=type==="rehearsal"?data.rehearsals:data.meetings;
  const event=src.find(x=>x.id===id);if(!event)return;
  openModal(event.title,type==="rehearsal"?"REHEARSAL":"BAND MEETING",renderInternalEventDetail(type,event));
  bindInternalEventModal(type,event);
}
function bindInternalEventModal(type,event){
  document.querySelectorAll("[data-internal-rsvp]").forEach(el=>el.addEventListener("click",()=>rsvpInternalEvent(el.dataset.internalRsvp,true)));
  document.querySelector("[data-edit-internal-event]")?.addEventListener("click",()=>openInternalEventForm(type,event.id));
}
function rsvpInternalEvent(token,insideModal=false){
  const [type,id,status]=token.split(":");
  const src=type==="rehearsal"?data.rehearsals:data.meetings;
  const event=src.find(x=>x.id===id);if(!event)return;
  event.rsvps ||= {};
  event.rsvps[state.userId]={status,at:nowISO()};
  notifyAdmin(`${currentUser().name} RSVP'd`,`${event.title}: ${status.toUpperCase()}`,type,event.id);
  logActivity(`${currentUser().name} RSVP'd ${status} to ${event.title}.`);
  saveData();
  if(insideModal){$("modalBody").innerHTML=renderInternalEventDetail(type,event);bindInternalEventModal(type,event)}else mount();
}
function createChatChannel(){
  if(!isAdmin())return;
  const name=prompt("New chat channel name:","")?.trim();if(!name)return;
  const channel={id:uid("chat"),name,messages:[]};
  data.chatChannels.push(channel);state.chatChannelId=channel.id;saveData();mount();
}
function sendChatMessage(){
  const input=$("chatMessage"),text=input?.value.trim();if(!text)return;
  const channel=getChatChannel();if(!channel)return;
  channel.messages.push({id:uid("msg"),authorId:state.userId,text,at:nowISO()});
  channel.messages=channel.messages.slice(-500);
  data.members.filter(m=>m.id!==state.userId).forEach(m=>notify(m.id,`#${channel.name}`,`${currentUser().name}: ${text.slice(0,120)}`,"chat",channel.id));
  saveData();mount();
}

function renderMembersPage(){
  if(!isAdmin())return "";
  return `<section class="hero"><span class="eyebrow">COMMAND · MEMBERS</span><h1>Individual portals, one band.</h1><p>Each member controls their own availability, calendar connections, offer responses, notes, and Songbook learning state.</p></section>
  <section class="section">
    <div class="section-head"><h2>PA LINE members</h2><button class="btn primary small-btn" type="button" data-add-member>+ MEMBER</button></div>
    <div class="section-body"><div class="list">${data.members.map(m=>{
      const connections=(m.calendarConnections||[]).filter(c=>c.status==="connected").length;
      const blocks=data.blocks.filter(b=>b.memberId===m.id&&new Date(b.end)>=new Date()).length;
      return `<div class="list-item"><div><div class="list-item-title"><strong>${esc(m.fullName)}</strong>${m.isAdmin?`<span class="badge warn">ADMIN</span>`:`<span class="badge">CREW</span>`}</div><div class="list-item-meta">${esc(m.role)} · ${connections} connected calendar${connections===1?"":"s"} · ${blocks} active block${blocks===1?"":"s"}</div></div><div class="list-item-actions"><button class="btn small-btn" type="button" data-preview-member="${m.id}">OPEN PORTAL</button><button class="btn small-btn ghost" type="button" data-edit-member="${m.id}">EDIT</button></div></div>`;
    }).join("")}</div></div>
  </section>`;
}

function songState(memberId,songId){
  data.memberSongState[memberId] ||= {};
  data.memberSongState[memberId][songId] ||= {learning:"Not Started",privateNotes:"",reviewedVersion:null};
  return data.memberSongState[memberId][songId];
}
function songsVisible(){
  return isAdmin()?data.songs:data.songs.filter(s=>s.status==="Performable"||s.status==="Learning");
}
function renderSongbookPage(){
  const songs=songsVisible();
  if(state.songId){
    const song=data.songs.find(s=>s.id===state.songId);
    if(song)return renderSongDetailPage(song);
    state.songId=null;
  }
  return `
  <section class="hero"><span class="eyebrow">${isAdmin()?"COMMAND":"CREW"} · SONGBOOK</span><h1>${isAdmin()?"Control the performable library.":"Know the song before the show."}</h1><p>${isAdmin()?"Publish the songs PA LINE can currently perform, keep one active arrangement, attach notes, and upload practice audio.":"Keys, time signatures, tempos, arrangement notes, your part, private notes, and practice tracks stay in one place."}</p></section>
  <section class="section">
    <div class="section-head"><h2>${isAdmin()?"Band Songbook":"Current library"}</h2>${isAdmin()?`<button class="btn primary small-btn" type="button" data-add-song>+ SONG</button>`:""}</div>
    <div class="section-body">
      <div class="song-grid">${songs.map(s=>{
        const ms=!isAdmin()?songState(state.userId,s.id):null;
        return `<button type="button" class="song-card" data-open-song="${s.id}">
          <div class="list-item-title"><span class="song-title">${esc(s.title)}</span><span class="badge ${s.status==="Performable"?"good":s.status==="Learning"?"warn":""}">${esc(s.status)}</span></div>
          <div class="song-meta"><span class="badge">${esc(s.key||"Key TBD")}</span><span class="badge">${esc(s.timeSig||"Time TBD")}</span><span class="badge">${esc(s.length||"Length TBD")}</span></div>
          ${ms?`<div class="song-note">Your status: <strong>${esc(ms.learning)}</strong></div>`:`<div class="song-note">${esc(s.notes||"No arrangement note.")}</div>`}
        </button>`;
      }).join("")}</div>
    </div>
  </section>`;
}
function memberRoleNote(song,member){
  for(const role of member.roles||[]){
    if(song.roleNotes?.[role])return {role,text:song.roleNotes[role]};
  }
  return null;
}
function activeArrangement(song){return (song.arrangements||[]).find(a=>a.active)||(song.arrangements||[])[0]}
function renderSongDetailPage(song){
  const member=currentUser(),ms=songState(member.id,song.id),roleNote=memberRoleNote(song,member),arr=activeArrangement(song);
  return `
  <div style="margin-bottom:12px"><button class="btn small-btn ghost" type="button" data-song-back>← SONGBOOK</button></div>
  <section class="hero">
    <span class="eyebrow">${esc(song.type)} · ${esc(song.status)}</span>
    <h1>${esc(song.title)}</h1>
    <p>${esc(song.artist||"PA LINE")}${arr?` · Active arrangement ${esc(arr.version)}`:""}</p>
  </section>
  <section class="section">
    <div class="section-head"><h2>Performance data</h2>${isAdmin()?`<button class="btn small-btn" type="button" data-edit-song="${song.id}">EDIT SONG</button>`:""}</div>
    <div class="section-body">
      <div class="info-grid">
        <div class="info-box"><span>KEY</span><strong>${esc(song.key||"TBD")}</strong></div>
        <div class="info-box"><span>TIME</span><strong>${esc(song.timeSig||"TBD")}</strong></div>
        <div class="info-box"><span>TEMPO</span><strong>${song.bpm?`${esc(song.bpm)} BPM`:"TBD"}</strong></div>
        <div class="info-box"><span>LENGTH</span><strong>${esc(song.length||"TBD")}</strong></div>
        <div class="info-box"><span>TUNING</span><strong>${esc(song.tuning||"TBD")}</strong></div>
        <div class="info-box"><span>CAPO</span><strong>${esc(song.capo||"None")}</strong></div>
        <div class="info-box"><span>COUNT-IN</span><strong>${esc(song.countIn||"TBD")}</strong></div>
        <div class="info-box"><span>VERSION</span><strong>${esc(arr?.version||"TBD")}</strong></div>
      </div>
    </div>
  </section>
  <div class="detail-grid" style="margin-top:14px">
    <div>
      <div class="note-box admin"><span class="eyebrow">ADMIN ARRANGEMENT NOTES</span><p>${esc(song.notes||"No notes.")}</p></div>
      ${roleNote?`<div class="note-box role"><span class="eyebrow">YOUR PART · ${esc(roleLabel(roleNote.role))}</span><p>${esc(roleNote.text)}</p></div>`:""}
      ${!isAdmin()?`<div class="note-box private"><span class="eyebrow">MY PRIVATE NOTES</span><textarea id="memberSongNotes" style="width:100%;min-height:90px;margin-top:9px" class="input">${esc(ms.privateNotes||"")}</textarea><div class="section-actions" style="margin-top:8px"><button class="btn small-btn" type="button" data-save-song-notes="${song.id}">SAVE NOTES</button></div></div>`:""}
      <section class="section">
        <div class="section-head"><h2>Practice player</h2></div>
        <div class="section-body">${renderPracticePlayer(song)}</div>
      </section>
    </div>
    <aside>
      ${!isAdmin()?`<div class="note-box"><span class="eyebrow">MY LEARNING STATUS</span><div class="field" style="margin-top:10px"><select id="learningStatus" data-learning-song="${song.id}"><option ${ms.learning==="Not Started"?"selected":""}>Not Started</option><option ${ms.learning==="Learning"?"selected":""}>Learning</option><option ${ms.learning==="Needs Rehearsal"?"selected":""}>Needs Rehearsal</option><option ${ms.learning==="Show Ready"?"selected":""}>Show Ready</option></select></div>${arr?`<button class="btn small-btn ${ms.reviewedVersion===arr.version?"good":""}" style="margin-top:9px" type="button" data-review-arrangement="${song.id}">${ms.reviewedVersion===arr.version?"REVIEWED ✓":"MARK ARRANGEMENT REVIEWED"}</button>`:""}</div>`:""}
      <div class="note-box"><span class="eyebrow">ARRANGEMENT HISTORY</span><div class="list" style="margin-top:9px">${(song.arrangements||[]).map(a=>`<div class="list-item"><div><div class="list-item-title"><strong>${esc(a.version)}</strong>${a.active?`<span class="badge good">ACTIVE</span>`:""}</div><div class="list-item-meta">${fmtDate(a.date)} · ${esc(a.summary||"")}</div></div></div>`).join("")||`<div class="small">No arrangement versions yet.</div>`}</div></div>
    </aside>
  </div>`;
}
function renderPracticePlayer(song){
  const tracks=song.audioTracks||[];
  if(!tracks.length)return `<div class="empty">${isAdmin()?"Upload a reference track or stems from EDIT SONG.":"No practice audio has been uploaded for this song yet."}</div>`;
  const selected=state.practice.songId===song.id&&tracks.some(t=>t.key===state.practice.trackKey)?state.practice.trackKey:tracks[0].key;
  state.practice.songId=song.id;state.practice.trackKey=selected;
  return `<div class="practice-player">
    <div class="field" style="margin-bottom:10px"><label>Practice source</label><select id="practiceTrackSelect">${tracks.map(t=>`<option value="${esc(t.key)}" ${t.key===selected?"selected":""}>${esc(t.label)}</option>`).join("")}</select></div>
    <div class="player-main"><button class="btn small-btn" id="practicePlayBtn" type="button">▶ PLAY</button><input class="player-seek" id="practiceSeek" type="range" min="0" max="1000" value="0"><span class="player-time" id="practiceTime">0:00 / 0:00</span></div>
    <div class="player-controls">
      <button class="btn small-btn ghost" type="button" data-audio-skip="-10">← 10 SEC</button>
      <button class="btn small-btn ghost" type="button" data-loop-a>SET A</button>
      <button class="btn small-btn ghost" type="button" data-loop-b>SET B</button>
      <button class="btn small-btn ghost" type="button" data-loop-clear>CLEAR LOOP</button>
      <button class="btn small-btn ghost" type="button" data-audio-skip="10">10 SEC →</button>
      <select id="practiceSpeed" aria-label="Playback speed"><option value=".5">0.5x</option><option value=".75">0.75x</option><option value=".9">0.9x</option><option value="1" selected>1.0x</option><option value="1.1">1.1x</option><option value="1.25">1.25x</option></select>
    </div>
    <div class="loop-readout" id="loopReadout">Loop: off</div>
  </div>`;
}

function renderLineupsPage(){
  if(!isAdmin())return "";
  return `<section class="hero"><span class="eyebrow">COMMAND · LINEUPS</span><h1>Availability follows the lineup.</h1><p>A member being unavailable only blocks formats that actually require that member.</p></section>
  <section class="section"><div class="section-head"><h2>Active booking formats</h2></div><div class="section-body">
    <div class="list">${data.lineups.map(l=>`<div class="list-item"><div><div class="list-item-title"><strong>${esc(l.name)}</strong><span class="badge ${l.active?"good":""}">${l.active?"ACTIVE":"OFF"}</span></div><div class="lineup-members">${l.required.map(id=>`<span class="member-pill">${esc(memberName(id))}</span>`).join("")}</div></div><div class="list-item-actions"><button class="btn small-btn" type="button" data-edit-lineup="${l.id}">EDIT</button></div></div>`).join("")}</div>
  </div></section>`;
}

function renderNotificationsPage(){
  const notes=memberNotifications(state.userId);
  return `<section class="hero"><span class="eyebrow">${isAdmin()?"COMMAND":"CREW"} · NOTIFICATIONS</span><h1>Nothing gets lost in the group text.</h1><p>Offers, response changes, confirmations, availability conflicts, song updates, and calendar sync issues can all land here.</p></section>
  <section class="section"><div class="section-head"><h2>${unreadCount()} unread</h2><button class="btn small-btn" type="button" data-mark-read>MARK ALL READ</button></div><div class="section-body"><div class="list">${notes.length?notes.map(n=>`<div class="list-item notification ${n.read?"read":""}" data-notification="${n.id}"><div class="marker"></div><div><div class="list-item-title"><strong>${esc(n.title)}</strong></div><div class="list-item-meta">${esc(n.body)}</div><div class="mini">${new Date(n.createdAt).toLocaleString()}</div></div><div class="list-item-actions">${n.refId&&n.type==="offer"?`<button class="btn small-btn" type="button" data-open-notification-offer="${n.refId}">OPEN</button>`:""}</div></div>`).join(""):`<div class="empty">No notifications yet.</div>`}</div></div></section>`;
}

function renderSettingsPage(){
  const user=currentUser(),connections=user.calendarConnections||[];
  return `
  <section class="hero"><span class="eyebrow">${isAdmin()?"COMMAND SETTINGS":"ACCOUNT + CALENDARS"}</span><h1>${isAdmin()?"Backend controls.":"Your privacy, your calendar."}</h1><p>${isAdmin()?"Prototype settings for availability and data behavior.":"Connect only the calendars that should affect PA LINE. The backend should consume free/busy windows, not personal event details."}</p></section>
  ${!isAdmin()?`
  <section class="section">
    <div class="section-head"><h2>Personal calendar connections</h2></div>
    <div class="section-body">
      <div class="connection-card"><div><strong>Google Calendar</strong><div class="small">Production: OAuth free/busy connection. Event titles stay private.</div></div><button class="btn small-btn" type="button" data-connect-calendar="Google">CONNECT</button></div>
      <div class="connection-card"><div><strong>Microsoft Outlook / 365</strong><div class="small">Production: Microsoft Graph free/busy connection.</div></div><button class="btn small-btn" type="button" data-connect-calendar="Microsoft">CONNECT</button></div>
      <div class="connection-card"><div><strong>iCalendar snapshot</strong><div class="small">Prototype: import an .ics file and store only busy windows.</div></div><label class="btn small-btn">IMPORT .ICS<input type="file" id="icsImport" accept=".ics,text/calendar" hidden></label></div>
      ${connections.length?`<div class="section" style="margin-top:12px"><div class="section-head"><h2>Connected / simulated</h2></div><div class="section-body"><div class="list">${connections.map(c=>`<div class="list-item"><div><div class="list-item-title"><strong>${esc(c.provider)}</strong><span class="badge ${c.status==="connected"?"good":"warn"}">${esc(c.status)}</span></div><div class="list-item-meta">${c.lastSync?`Last synced ${new Date(c.lastSync).toLocaleString()}`:"Not synced yet"} · ${c.enabled===false?"Ignored":"Affects availability"}</div></div><div class="list-item-actions"><button class="btn small-btn ghost" type="button" data-toggle-calendar="${c.id}">${c.enabled===false?"USE":"IGNORE"}</button><button class="btn small-btn bad" type="button" data-remove-calendar="${c.id}">REMOVE</button></div></div>`).join("")}</div></div></div>`:""}
    </div>
  </section>`:`
  <section class="section"><div class="section-head"><h2>Availability safety</h2></div><div class="section-body"><div class="field"><label>Connected calendar considered stale after</label><select id="staleHours"><option value="12" ${data.settings.calendarStaleHours===12?"selected":""}>12 hours</option><option value="24" ${data.settings.calendarStaleHours===24?"selected":""}>24 hours</option><option value="48" ${data.settings.calendarStaleHours===48?"selected":""}>48 hours</option></select></div><div class="small" style="margin-top:8px">If a connected calendar becomes stale, availability becomes CHECK instead of AVAILABLE.</div></div></section>`}
  <section class="section"><div class="section-head"><h2>Portal profile</h2></div><div class="section-body"><div class="form-grid"><div class="field"><label>Full name</label><input id="profileName" value="${esc(user.fullName)}"></div><div class="field"><label>Email</label><input id="profileEmail" value="${esc(user.email||"")}"></div><div class="field"><label>Phone</label><input id="profilePhone" value="${esc(user.phone||"")}"></div><div class="field"><label>Home / travel base</label><input id="profileBase" value="${esc(user.homeBase||"")}"></div></div><button class="btn primary" type="button" style="margin-top:12px" data-save-profile>SAVE PROFILE</button></div></section>`;
}

function bindPageEvents(){
  document.querySelectorAll("[data-login]").forEach(el=>el.addEventListener("click",()=>{state.userId=el.dataset.login;state.page="dashboard";mount()}));
  document.querySelectorAll("[data-nav]").forEach(el=>el.addEventListener("click",()=>{state.page=el.dataset.nav;state.songId=null;state.sidebarOpen=false;mount()}));
  document.querySelector("[data-mobile-menu]")?.addEventListener("click",()=>{state.sidebarOpen=!state.sidebarOpen;mount()});
  document.querySelector("[data-switch-user]")?.addEventListener("click",()=>{state.userId=null;state.page="dashboard";mount()});
  document.querySelector("[data-reset-demo]")?.addEventListener("click",resetDemo);
  document.querySelectorAll("[data-quick-offer]").forEach(el=>el.addEventListener("click",openOfferForm));
  document.querySelectorAll("[data-open-offer]").forEach(el=>el.addEventListener("click",()=>openOfferModal(el.dataset.openOffer)));
  document.querySelectorAll("[data-open-show]").forEach(el=>el.addEventListener("click",()=>openShowModal(el.dataset.openShow)));
  document.querySelectorAll("[data-open-setlist]").forEach(el=>el.addEventListener("click",()=>openSetlistBuilder(el.dataset.openSetlist)));
  document.querySelectorAll("[data-offer-response]").forEach(el=>el.addEventListener("click",()=>respondToOffer(el.dataset.offerResponse,el.dataset.response)));
  document.querySelectorAll("[data-confirm-offer]").forEach(el=>el.addEventListener("click",()=>confirmOffer(el.dataset.confirmOffer)));
  document.querySelectorAll("[data-decline-offer]").forEach(el=>el.addEventListener("click",()=>declineOffer(el.dataset.declineOffer)));
  document.querySelectorAll("[data-add-offer-note]").forEach(el=>el.addEventListener("click",()=>openNoteForm(el.dataset.addOfferNote)));
  document.querySelectorAll("[data-calendar-date]").forEach(el=>el.addEventListener("click",()=>{state.selectedDate=el.dataset.calendarDate;mount()}));
  document.querySelector("[data-cal-prev]")?.addEventListener("click",()=>moveCalendar(-1));
  document.querySelector("[data-cal-next]")?.addEventListener("click",()=>moveCalendar(1));
  document.querySelector("[data-cal-today]")?.addEventListener("click",()=>{const d=new Date();state.calendarMonth=d.getMonth();state.calendarYear=d.getFullYear();state.selectedDate=isoDate(d);mount()});
  document.querySelectorAll("[data-block-date]").forEach(el=>el.addEventListener("click",()=>openBlockForm(el.dataset.blockDate||state.selectedDate)));
  document.querySelectorAll("[data-toggle-personal-event]").forEach(el=>el.addEventListener("click",()=>togglePersonalCalendarEvent(el.dataset.togglePersonalEvent)));
  document.querySelectorAll("[data-open-internal-event]").forEach(el=>el.addEventListener("click",()=>openInternalEvent(el.dataset.openInternalEvent)));
  document.querySelector("[data-new-rehearsal]")?.addEventListener("click",()=>openInternalEventForm("rehearsal"));
  document.querySelector("[data-new-meeting]")?.addEventListener("click",()=>openInternalEventForm("meeting"));
  document.querySelectorAll("[data-internal-rsvp]").forEach(el=>el.addEventListener("click",()=>rsvpInternalEvent(el.dataset.internalRsvp)));
  document.querySelector("[data-new-chat-channel]")?.addEventListener("click",createChatChannel);
  document.querySelectorAll("[data-chat-channel]").forEach(el=>el.addEventListener("click",()=>{state.chatChannelId=el.dataset.chatChannel;mount()}));
  document.querySelector("#chatCompose")?.addEventListener("submit",e=>{e.preventDefault();sendChatMessage()});
  bindWeeklyTaskButtons();
  document.querySelectorAll("[data-week-filter]").forEach(el=>el.addEventListener("click",()=>filterWeeklyTasks(el.dataset.weekFilter)));
  document.querySelector("[data-reset-week]")?.addEventListener("click",resetCurrentWeek);
  document.querySelectorAll("[data-preview-member]").forEach(el=>el.addEventListener("click",()=>{state.userId=el.dataset.previewMember;state.page="dashboard";mount()}));
  document.querySelector("[data-add-member]")?.addEventListener("click",()=>openMemberForm());
  document.querySelectorAll("[data-edit-member]").forEach(el=>el.addEventListener("click",()=>openMemberForm(el.dataset.editMember)));
  document.querySelectorAll("[data-open-song]").forEach(el=>el.addEventListener("click",()=>{state.songId=el.dataset.openSong;mount()}));
  document.querySelector("[data-song-back]")?.addEventListener("click",()=>{state.songId=null;stopPractice();mount()});
  document.querySelector("[data-add-song]")?.addEventListener("click",()=>openSongForm());
  document.querySelectorAll("[data-edit-song]").forEach(el=>el.addEventListener("click",()=>openSongForm(el.dataset.editSong)));
  document.querySelector("[data-save-song-notes]")?.addEventListener("click",saveMemberSongNotes);
  document.querySelector("[data-learning-song]")?.addEventListener("change",saveLearningStatus);
  document.querySelector("[data-review-arrangement]")?.addEventListener("click",markArrangementReviewed);
  document.querySelectorAll("[data-edit-lineup]").forEach(el=>el.addEventListener("click",()=>openLineupForm(el.dataset.editLineup)));
  document.querySelector("[data-mark-read]")?.addEventListener("click",markAllRead);
  document.querySelectorAll("[data-open-notification-offer]").forEach(el=>el.addEventListener("click",()=>openOfferModal(el.dataset.openNotificationOffer)));
  document.querySelectorAll("[data-connect-calendar]").forEach(el=>el.addEventListener("click",()=>simulateCalendarConnect(el.dataset.connectCalendar)));
  document.querySelectorAll("[data-toggle-calendar]").forEach(el=>el.addEventListener("click",()=>toggleCalendar(el.dataset.toggleCalendar)));
  document.querySelectorAll("[data-remove-calendar]").forEach(el=>el.addEventListener("click",()=>removeCalendar(el.dataset.removeCalendar)));
  document.querySelector("#icsImport")?.addEventListener("change",importICS);
  document.querySelector("[data-save-profile]")?.addEventListener("click",saveProfile);
  document.querySelector("#staleHours")?.addEventListener("change",e=>{data.settings.calendarStaleHours=Number(e.target.value);saveData();mount()});
  bindPracticePlayer();
}
function moveCalendar(delta){
  state.calendarMonth+=delta;
  if(state.calendarMonth<0){state.calendarMonth=11;state.calendarYear--}
  if(state.calendarMonth>11){state.calendarMonth=0;state.calendarYear++}
  state.selectedDate=isoDate(new Date(state.calendarYear,state.calendarMonth,1));
  mount();
}

function openModal(title,eyebrow,body){
  $("modalTitle").textContent=title;$("modalEyebrow").textContent=eyebrow;$("modalBody").innerHTML=body;
  $("modalBackdrop").classList.remove("hidden");$("modalBackdrop").setAttribute("aria-hidden","false");
  setTimeout(()=>$("modalClose").focus(),0);
}
function closeModal(){
  $("modalBackdrop").classList.add("hidden");$("modalBackdrop").setAttribute("aria-hidden","true");$("modalBody").innerHTML="";
}
$("modalClose").addEventListener("click",closeModal);
$("modalBackdrop").addEventListener("click",e=>{if(e.target===$("modalBackdrop"))closeModal()});
document.addEventListener("keydown",e=>{if(e.key==="Escape"&&!$("modalBackdrop").classList.contains("hidden"))closeModal()});

function openOfferModal(id){
  const o=data.offers.find(x=>x.id===id);if(!o)return;
  state.offerId=id;
  openModal(o.venue,"SHOW OFFER",renderOfferDetail(o));
  bindModalOfferEvents();
}
function bindModalOfferEvents(){
  document.querySelectorAll("[data-offer-response]").forEach(el=>el.addEventListener("click",()=>{respondToOffer(el.dataset.offerResponse,el.dataset.response,true)}));
  document.querySelector("[data-confirm-offer]")?.addEventListener("click",()=>confirmOffer(document.querySelector("[data-confirm-offer]").dataset.confirmOffer,true));
  document.querySelector("[data-decline-offer]")?.addEventListener("click",()=>declineOffer(document.querySelector("[data-decline-offer]").dataset.declineOffer,true));
  document.querySelector("[data-add-offer-note]")?.addEventListener("click",()=>openNoteForm(document.querySelector("[data-add-offer-note]").dataset.addOfferNote));
  document.querySelector("[data-edit-attendance-merch]")?.addEventListener("click",()=>openOfferAttendanceMerchForm(document.querySelector("[data-edit-attendance-merch]").dataset.editAttendanceMerch));
  document.querySelector("[data-open-setlist]")?.addEventListener("click",()=>openSetlistBuilder(document.querySelector("[data-open-setlist]").dataset.openSetlist));
  bindGigLogButtons();
}
function openShowModal(id){
  const s=data.shows.find(x=>x.id===id);if(!s)return;
  openModal(s.venue,"SHOW HUB",renderShowDetail(s));
  document.querySelector("[data-edit-show-merch]")?.addEventListener("click",()=>openShowActualsForm(s.id));
  document.querySelector("[data-open-setlist]")?.addEventListener("click",()=>openSetlistBuilder(document.querySelector("[data-open-setlist]").dataset.openSetlist));
  bindGigLogButtons();
}

function openOfferAttendanceMerchForm(id){
  if(!isAdmin())return;
  const o=data.offers.find(x=>x.id===id);if(!o)return;
  const current=attendanceEstimateFor(o);
  openModal("Attendance + merch planning","COMMAND · FORECAST",`
    <div class="form-grid">
      <div class="field"><label>Expected attendance</label><input id="amAttendance" type="number" min="0" step="1" value="${o.attendanceProvided||""}" placeholder="Blank = estimate from history"></div>
      <div class="field"><label>Actual merch gross, optional</label><input id="amMerch" type="number" min="0" step="1" value="${o.merchActualGross||""}" placeholder="Usually entered after show"></div>
    </div>
    <div class="small" style="margin-top:8px">Current attendance model: ${current.value} · ${esc(current.basis)}</div>
    <div class="modal-footer"><button class="btn primary" type="button" data-save-attendance-merch>SAVE</button></div>`);
  document.querySelector("[data-save-attendance-merch]").addEventListener("click",()=>{
    o.attendanceProvided=Number($("amAttendance").value||0);
    o.merchActualGross=Number($("amMerch").value||0);
    logActivity(`Updated attendance / merch planning for ${o.venue}.`);
    saveData();openOfferModal(o.id);
  });
}
function openShowActualsForm(id){
  if(!isAdmin())return;
  const s=data.shows.find(x=>x.id===id);if(!s)return;
  openModal("Show actuals","COMMAND · ATTENDANCE + MERCH",`
    <div class="form-grid">
      <div class="field"><label>Actual attendance</label><input id="saAttendance" type="number" min="0" step="1" value="${s.attendanceActual||""}" placeholder="Final/estimated actual headcount"></div>
      <div class="field"><label>Actual merch gross</label><input id="saMerch" type="number" min="0" step="1" value="${s.merchActualGross||""}" placeholder="Gross merch sales"></div>
    </div>
    <div class="small" style="margin-top:8px">Merch rule: 50% restock reserve first. Remaining 50% is the merch profit pool. Assigned non-owner performers receive 20% each of that remaining pool. Trever remains owner draw.</div>
    <div class="modal-footer"><button class="btn primary" type="button" data-save-show-actuals>SAVE ACTUALS</button></div>`);
  document.querySelector("[data-save-show-actuals]").addEventListener("click",()=>{
    s.attendanceActual=Number($("saAttendance").value||0);
    s.merchActualGross=Number($("saMerch").value||0);
    s.actualsUpdatedAt=nowISO();
    logActivity(`Updated show actuals for ${s.venue}.`);
    saveData();openShowModal(s.id);
  });
}

function openOfferForm(){
  if(!isAdmin())return;
  const defaultDate=datePlus(21);
  openModal("Create show offer","COMMAND · OFFERS",`
    <div class="form-grid">
      <div class="field"><label>Venue</label><input id="ofVenue" placeholder="Venue name"></div>
      <div class="field"><label>City</label><input id="ofCity" placeholder="City"></div>
      <div class="field"><label>State</label><input id="ofState" value="NY"></div>
      <div class="field"><label>Date</label><input id="ofDate" type="date" value="${defaultDate}"></div>
      <div class="field"><label>Start</label><input id="ofStart" type="time" value="19:00"></div>
      <div class="field"><label>End</label><input id="ofEnd" type="time" value="22:00"></div>
      <div class="field"><label>Booking format</label><select id="ofLineup">${data.lineups.filter(l=>l.active).map(l=>`<option value="${l.id}">${esc(l.name)}</option>`).join("")}</select></div>
      <div class="field"><label>Offer / guarantee</label><input id="ofPay" type="number" min="0" step="50" placeholder="Optional"></div>
      <div class="field"><label>Expected attendance, optional</label><input id="ofAttendance" type="number" min="0" step="1" placeholder="Leave blank to estimate"></div>
      <div class="field"><label>Inbound travel hours</label><input id="ofPre" type="number" min="0" step=".25" value="0"></div>
      <div class="field"><label>Outbound travel hours</label><input id="ofPost" type="number" min="0" step=".25" value="0"></div>
      <div class="field"><label>Response deadline</label><input id="ofDeadline" type="date" value="${datePlus(7)}"></div>
    </div>
    <div class="field" style="margin-top:12px"><label>Admin notes for crew</label><textarea id="ofNotes" placeholder="Load-in, lodging, routing, decision notes, anything members need to know"></textarea></div>
    <div id="offerAvailabilityPreview" style="margin-top:12px"></div>
    <div class="modal-footer"><button class="btn" type="button" data-preview-offer-availability>CHECK AVAILABILITY</button><button class="btn primary" type="button" data-save-offer>SEND OFFER TO CREW</button></div>`);
  document.querySelector("[data-preview-offer-availability]").addEventListener("click",previewOfferAvailability);
  document.querySelector("[data-save-offer]").addEventListener("click",saveOffer);
}
function offerFormValues(){
  return {
    venue:$("ofVenue").value.trim(),city:$("ofCity").value.trim(),state:$("ofState").value.trim(),
    date:$("ofDate").value,start:$("ofStart").value,end:$("ofEnd").value,lineupId:$("ofLineup").value,
    pay:Number($("ofPay").value||0),attendanceProvided:Number($("ofAttendance").value||0),travelBeforeHours:Number($("ofPre").value||0),travelAfterHours:Number($("ofPost").value||0),
    responseDeadline:$("ofDeadline").value,adminNotes:$("ofNotes").value.trim()
  };
}
function previewOfferAvailability(){
  const v=offerFormValues();
  if(!v.date||!v.start||!v.end){$("offerAvailabilityPreview").innerHTML=`<div class="small">Add date and times first.</div>`;return}
  $("offerAvailabilityPreview").innerHTML=availabilityCards(v);
}
function saveOffer(){
  const v=offerFormValues();
  if(!v.venue||!v.city||!v.state||!v.date||!v.start||!v.end){alert("Venue, city, state, date, start, and end are required.");return}
  const lineup=getLineup(v.lineupId);if(!lineup)return;
  const o={id:uid("offer"),...v,status:"pending",recipients:[...lineup.required],responses:{},notes:[],createdAt:nowISO()};
  data.offers.unshift(o);
  o.recipients.forEach(id=>notify(id,"New show offer",`${o.venue} · ${fmtDate(o.date)} · ${formatName(o.lineupId)}`,"offer",o.id));
  logActivity(`Created ${formatName(o.lineupId)} offer for ${o.venue}.`);
  saveData();closeModal();state.page="offers";mount();
}
function respondToOffer(id,status,insideModal=false){
  const o=data.offers.find(x=>x.id===id);if(!o)return;
  let note="";
  if(status==="unavailable"||status==="talk")note=prompt(status==="talk"?"What needs discussion?":"Optional note about your availability:","")||"";
  o.responses ||= {};
  o.responses[state.userId]={status,note,at:nowISO()};
  notifyAdmin(`${currentUser().name} responded to an offer`,`${o.venue}: ${status==="talk"?"NEED TO TALK":status.toUpperCase()}${note?` · ${note}`:""}`,"offer",o.id);
  logActivity(`${currentUser().name} responded ${status} to ${o.venue}.`);
  saveData();
  if(insideModal){$("modalBody").innerHTML=renderOfferDetail(o);bindModalOfferEvents()}else mount();
}
function confirmOffer(id,insideModal=false){
  const o=data.offers.find(x=>x.id===id);if(!o||o.status!=="pending")return;
  const lineup=getLineup(o.lineupId),required=lineup?.required||[];
  const ctx=offerContext(o),a=lineupAvailability(o.lineupId,ctx);
  const all=required.every(mid=>o.responses?.[mid]?.status==="available");
  if(!all||a.status!=="available"){alert("Required members must be available and respond available before confirmation.");return}
  o.status="confirmed";
  const timeline=commitmentTimeline(o);
  const attendanceSnapshot=attendanceEstimateFor(o);
  const show={id:uid("show"),offerId:o.id,venue:o.venue,city:o.city,state:o.state,date:o.date,start:o.start,end:o.end,lineupId:o.lineupId,members:[...required],status:"confirmed",pay:o.pay,payoutSnapshot:offerPayoutSummary(o),attendanceProvided:o.attendanceProvided||0,attendanceEstimateSnapshot:attendanceSnapshot,attendanceActual:0,merchActualGross:0,adminNotes:o.adminNotes,gigLog:deepClone(o.gigLog||[]),travelBeforeHours:o.travelBeforeHours||0,travelAfterHours:o.travelAfterHours||0,commitmentStart:`${String(timeline.leaveOrigin.getHours()).padStart(2,"0")}:${String(timeline.leaveOrigin.getMinutes()).padStart(2,"0")}`,commitmentEnd:`${String(timeline.returnEnd.getHours()).padStart(2,"0")}:${String(timeline.returnEnd.getMinutes()).padStart(2,"0")}`,commitmentStartISO:timeline.leaveOrigin.toISOString(),commitmentEndISO:timeline.returnEnd.toISOString(),setlist:deepClone(o.setlist||{songIds:[],locked:false,lockedAt:null,lockedBy:null}),createdAt:nowISO()};
  show.gigLog ||= [];
  show.gigLog.push({
    id:uid("glog"),
    at:nowISO(),
    kind:"confirmed",
    contact:"",
    method:"COMMAND",
    summary:`Show confirmed in PA LINE COMMAND from offer ${o.id}.`,
    nextFollowUp:null,
    createdBy:state.userId,
    createdAt:nowISO(),
    updatedAt:nowISO(),
    automatic:true
  });
  data.shows.push(show);
  required.forEach(mid=>notify(mid,"Show confirmed",`${show.venue} · ${fmtDate(show.date)} · ${formatName(show.lineupId)}`,"show",show.id));
  logActivity(`Confirmed ${show.venue} on ${fmtDateShort(show.date)}.`);
  saveData();if(insideModal)closeModal();mount();
}
function declineOffer(id,insideModal=false){
  const o=data.offers.find(x=>x.id===id);if(!o)return;
  if(!confirm("Close this offer?"))return;
  o.status="declined";o.recipients.forEach(mid=>notify(mid,"Offer closed",`${o.venue} is no longer an active PA LINE offer.`,"offer",o.id));
  logActivity(`Closed offer for ${o.venue}.`);saveData();if(insideModal)closeModal();mount();
}
function openNoteForm(offerId){
  const o=data.offers.find(x=>x.id===offerId);if(!o)return;
  openModal("Add offer note","NOTES",`
    <div class="field"><label>Note</label><textarea id="newOfferNote" placeholder="Write a note about this offer"></textarea></div>
    <div class="field" style="margin-top:10px"><label>Visibility</label><select id="newOfferNoteVisibility"><option value="shared">Shared with assigned crew</option><option value="private">Private to me</option></select></div>
    <div class="modal-footer"><button class="btn primary" type="button" data-save-offer-note>ADD NOTE</button></div>`);
  document.querySelector("[data-save-offer-note]").addEventListener("click",()=>{
    const text=$("newOfferNote").value.trim(),visibility=$("newOfferNoteVisibility").value;if(!text)return;
    o.notes ||= [];o.notes.push({id:uid("note"),authorId:state.userId,text,visibility,at:nowISO()});
    if(visibility==="shared")o.recipients.filter(id=>id!==state.userId).forEach(id=>notify(id,"New offer note",`${currentUser().name} added a note to ${o.venue}.`,"offer",o.id));
    logActivity(`${currentUser().name} added a ${visibility} note to ${o.venue}.`);saveData();closeModal();mount();
  });
}

function togglePersonalCalendarEvent(blockId){
  const b=data.blocks.find(x=>x.id===blockId);
  if(!b || b.memberId!==state.userId)return;
  const personalSources=["ics","google","microsoft","personal"];
  const isPersonal=personalSources.includes(String(b.source||"").toLowerCase());
  if(!isPersonal){
    const ok=confirm("This is a manual availability block, not a synced personal-calendar event. Toggle it anyway?");
    if(!ok)return;
  }
  b.availabilityOverride=b.availabilityOverride==="available"?null:"available";
  b.overrideUpdatedAt=nowISO();
  b.overrideUpdatedBy=state.userId;
  notifyAdmin(
    "Availability override changed",
    `${currentUser().name} ${b.availabilityOverride==="available"?"marked a personal event as still available":"restored a personal event as blocking"}.`,
    "availability",
    null
  );
  logActivity(`${currentUser().name} ${b.availabilityOverride==="available"?"ignored a personal-calendar conflict":"restored a personal-calendar conflict"} on ${fmtDateShort(b.date)}.`);
  saveData();
  mount();
}

function openBlockForm(date=state.selectedDate){
  if(isAdmin())return;
  openModal("Block availability","MY AVAILABILITY",`
    <div class="form-grid">
      <div class="field"><label>Date</label><input id="blDate" type="date" value="${date}"></div>
      <div class="field"><label>Type</label><select id="blAllDay"><option value="all">All day</option><option value="partial">Part of day</option></select></div>
      <div class="field"><label>Start</label><input id="blStart" type="time" value="00:00"></div>
      <div class="field"><label>End</label><input id="blEnd" type="time" value="23:59"></div>
    </div>
    <div class="field" style="margin-top:10px"><label>Private reason, optional</label><input id="blReason" placeholder="Only you can see this detail"></div>
    <div class="small" style="margin-top:9px">COMMAND will see that you are unavailable and the busy window. Your private reason is not displayed.</div>
    <div class="modal-footer"><button class="btn primary" type="button" data-save-block>SAVE BLOCK</button></div>`);
  $("blAllDay").addEventListener("change",e=>{const all=e.target.value==="all";$("blStart").disabled=all;$("blEnd").disabled=all;if(all){$("blStart").value="00:00";$("blEnd").value="23:59"}});
  document.querySelector("[data-save-block]").addEventListener("click",saveBlock);
}
function saveBlock(){
  const date=$("blDate").value,start=$("blStart").value,end=$("blEnd").value,reason=$("blReason").value.trim();
  if(!date||!start||!end)return;
  let s=dateTime(date,start),e=dateTime(date,end);if(e<=s)e.setDate(e.getDate()+1);
  data.blocks.push({id:uid("block"),memberId:state.userId,date,start:s.toISOString(),end:e.toISOString(),source:"manual",privateReason:reason,createdAt:nowISO()});
  notifyAdmin("Member availability changed",`${currentUser().name} blocked ${fmtDate(date)}.`,"availability",null);
  logActivity(`${currentUser().name} blocked availability on ${fmtDateShort(date)}.`);
  saveData();closeModal();state.selectedDate=date;mount();
}

function openMemberForm(id=null){
  if(!isAdmin())return;
  const m=id?getMember(id):null;
  openModal(m?"Edit member":"Add member","COMMAND · MEMBERS",`
    <div class="form-grid">
      <div class="field"><label>Full name</label><input id="memName" value="${esc(m?.fullName||"")}"></div>
      <div class="field"><label>Portal display name</label><input id="memShort" value="${esc(m?.name||"")}"></div>
      <div class="field"><label>Primary role</label><input id="memRole" value="${esc(m?.role||"")}"></div>
      <div class="field"><label>Email</label><input id="memEmail" value="${esc(m?.email||"")}"></div>
    </div>
    <div class="field" style="margin-top:10px"><label>Role tags, comma separated</label><input id="memRoles" value="${esc((m?.roles||["other"]).join(", "))}" placeholder="bass, vocals"></div>
    <div class="modal-footer"><button class="btn primary" type="button" data-save-member>${m?"SAVE":"CREATE MEMBER"}</button></div>`);
  document.querySelector("[data-save-member]").addEventListener("click",()=>{
    const fullName=$("memName").value.trim(),name=$("memShort").value.trim(),role=$("memRole").value.trim(),email=$("memEmail").value.trim(),roles=$("memRoles").value.split(",").map(x=>x.trim()).filter(Boolean);
    if(!fullName||!name)return;
    if(m){Object.assign(m,{fullName,name,role,email,roles})}
    else data.members.push({id:uid("member"),fullName,name,role,email,roles:roles.length?roles:["other"],isAdmin:false,phone:"",homeBase:"",notificationPrefs:{push:true,email:true,text:false},calendarConnections:[]});
    logActivity(`${m?"Updated":"Added"} member ${fullName}.`);saveData();closeModal();mount();
  });
}

function openLineupForm(id){
  const l=getLineup(id);if(!l||!isAdmin())return;
  openModal(`Edit ${l.name}`,"COMMAND · LINEUP",`
    <div class="field"><label>Format name</label><input id="luName" value="${esc(l.name)}"></div>
    <div class="field" style="margin-top:12px"><label>Required members</label><div class="list">${data.members.map(m=>`<label class="check-row"><input type="checkbox" value="${m.id}" data-lineup-member ${l.required.includes(m.id)?"checked":""}><span><strong>${esc(m.fullName)}</strong><span class="small"> · ${esc(m.role)}</span></span></label>`).join("")}</div></div>
    <label class="check-row" style="margin-top:12px"><input id="luActive" type="checkbox" ${l.active?"checked":""}><span><strong>Format active</strong><span class="small"> · Allow this format in availability checks</span></span></label>
    <div class="modal-footer"><button class="btn primary" type="button" data-save-lineup>SAVE LINEUP</button></div>`);
  document.querySelector("[data-save-lineup]").addEventListener("click",()=>{
    const required=[...document.querySelectorAll("[data-lineup-member]:checked")].map(x=>x.value);
    if(!required.length){alert("A lineup needs at least one required member.");return}
    l.name=$("luName").value.trim()||l.name;l.required=required;l.active=$("luActive").checked;
    logActivity(`Updated lineup ${l.name}.`);saveData();closeModal();mount();
  });
}

function songForm(song=null){
  const roleKeys=["lead","bass","percussion","drums","vocals","keys","other"];
  const currentArr=activeArrangement(song||{arrangements:[]});
  return `
  <div class="form-grid">
    <div class="field"><label>Title</label><input id="sgTitle" value="${esc(song?.title||"")}"></div>
    <div class="field"><label>Artist / writer</label><input id="sgArtist" value="${esc(song?.artist||"PA LINE")}"></div>
    <div class="field"><label>Type</label><select id="sgType"><option ${song?.type==="Original"?"selected":""}>Original</option><option ${song?.type==="Cover"?"selected":""}>Cover</option></select></div>
    <div class="field"><label>Status</label><select id="sgStatus"><option ${song?.status==="Performable"?"selected":""}>Performable</option><option ${song?.status==="Learning"?"selected":""}>Learning</option><option ${song?.status==="Rehearsal Only"?"selected":""}>Rehearsal Only</option><option ${song?.status==="Retired"?"selected":""}>Retired</option><option ${song?.status==="Archived"?"selected":""}>Archived</option></select></div>
    <div class="field"><label>Key signature</label><input id="sgKey" value="${esc(song?.key||"")}"></div>
    <div class="field"><label>Time signature</label><input id="sgTime" value="${esc(song?.timeSig||"4/4")}"></div>
    <div class="field"><label>Tempo / BPM</label><input id="sgBpm" type="number" min="1" value="${esc(song?.bpm||"")}"></div>
    <div class="field"><label>Length, m:ss</label><input id="sgLength" value="${esc(song?.length||"")}"></div>
    <div class="field"><label>Tuning</label><input id="sgTuning" value="${esc(song?.tuning||"")}"></div>
    <div class="field"><label>Capo</label><input id="sgCapo" value="${esc(song?.capo||"")}"></div>
    <div class="field"><label>Count-in / start cue</label><input id="sgCount" value="${esc(song?.countIn||"")}"></div>
    <div class="field"><label>Current arrangement version</label><input id="sgVersion" value="${esc(currentArr?.version||"v1")}"></div>
  </div>
  <div class="field" style="margin-top:12px"><label>Admin arrangement notes</label><textarea id="sgNotes">${esc(song?.notes||"")}</textarea></div>
  <div class="field" style="margin-top:12px"><label>Arrangement update summary</label><input id="sgVersionSummary" value="${esc(currentArr?.summary||"Current arrangement")}" placeholder="What changed?"></div>
  <section class="section" style="margin-top:12px"><div class="section-head"><h2>Role notes</h2></div><div class="section-body"><div class="form-grid">${roleKeys.map(r=>`<div class="field"><label>${roleLabel(r)}</label><textarea data-role-note="${r}">${esc(song?.roleNotes?.[r]||"")}</textarea></div>`).join("")}</div></div></section>
  <section class="section" style="margin-top:12px"><div class="section-head"><h2>Practice audio</h2></div><div class="section-body">
    <div class="field"><label>Reference track</label><input id="sgReferenceAudio" type="file" accept="audio/*"></div>
    <div class="field" style="margin-top:10px"><label>Optional stems, select multiple</label><input id="sgStemAudio" type="file" accept="audio/*" multiple></div>
    <div class="small" style="margin-top:7px">Prototype audio is stored locally in this browser using IndexedDB. Production should use authenticated object storage.</div>
    ${song?.audioTracks?.length?`<div class="list" style="margin-top:10px">${song.audioTracks.map(t=>`<div class="list-item"><div><strong>${esc(t.label)}</strong><div class="list-item-meta">${esc(t.kind)}</div></div><div class="list-item-actions"><button class="btn small-btn bad" type="button" data-remove-track="${t.key}">REMOVE</button></div></div>`).join("")}</div>`:""}
  </div></section>
  <div class="modal-footer"><button class="btn primary" type="button" data-save-song>${song?"SAVE SONG":"PUBLISH SONG"}</button></div>`;
}
function openSongForm(id=null){
  if(!isAdmin())return;
  const song=id?data.songs.find(s=>s.id===id):null;
  openModal(song?`Edit ${song.title}`:"Add song","COMMAND · SONGBOOK",songForm(song));
  document.querySelector("[data-save-song]").addEventListener("click",()=>saveSong(song));
  document.querySelectorAll("[data-remove-track]").forEach(el=>el.addEventListener("click",async()=>{
    const key=el.dataset.removeTrack;if(!song)return;
    await deleteAudio(key);song.audioTracks=song.audioTracks.filter(t=>t.key!==key);saveData();openSongForm(song.id);
  }));
}
async function saveSong(song){
  const title=$("sgTitle").value.trim();if(!title){alert("Song title is required.");return}
  const version=$("sgVersion").value.trim()||"v1";
  const roleNotes={};document.querySelectorAll("[data-role-note]").forEach(el=>roleNotes[el.dataset.roleNote]=el.value.trim());
  const isNew=!song;
  if(!song){
    song={id:uid("song"),arrangements:[],audioTracks:[],publishedAt:null};
    data.songs.unshift(song);
  }
  const previous=activeArrangement(song);
  if(previous&&previous.version!==version)previous.active=false;
  if(!song.arrangements.some(a=>a.version===version)){
    song.arrangements.unshift({version,date:isoDate(new Date()),summary:$("sgVersionSummary").value.trim()||"Arrangement update",active:true});
    if(!isNew){
      data.members.forEach(m=>notify(m.id,"Song arrangement updated",`${title} now has active arrangement ${version}.`,"song",song.id));
    }
  }else{
    song.arrangements.forEach(a=>a.active=a.version===version);
    const arr=song.arrangements.find(a=>a.version===version);
    if(arr)arr.summary=$("sgVersionSummary").value.trim()||arr.summary;
  }
  Object.assign(song,{
    title,artist:$("sgArtist").value.trim(),type:$("sgType").value,status:$("sgStatus").value,
    key:$("sgKey").value.trim(),timeSig:$("sgTime").value.trim(),bpm:Number($("sgBpm").value||0),
    length:$("sgLength").value.trim(),tuning:$("sgTuning").value.trim(),capo:$("sgCapo").value.trim(),
    countIn:$("sgCount").value.trim(),notes:$("sgNotes").value.trim(),roleNotes
  });
  if(song.status==="Performable"&&!song.publishedAt)song.publishedAt=nowISO();
  const ref=$("sgReferenceAudio").files[0];
  if(ref){
    const key=`${song.id}::reference::${uid("audio")}`;await putAudio(key,ref);
    song.audioTracks.push({key,label:`Reference · ${ref.name}`,kind:"reference",fileName:ref.name});
  }
  const stems=[...$("sgStemAudio").files];
  for(const file of stems){
    const key=`${song.id}::stem::${uid("audio")}`;await putAudio(key,file);
    song.audioTracks.push({key,label:`Stem · ${file.name}`,kind:"stem",fileName:file.name});
  }
  logActivity(`${isNew?"Added":"Updated"} Songbook track ${title}.`);saveData();closeModal();state.songId=song.id;mount();
}
function saveMemberSongNotes(){
  const songId=document.querySelector("[data-save-song-notes]")?.dataset.saveSongNotes;if(!songId)return;
  songState(state.userId,songId).privateNotes=$("memberSongNotes").value;saveData();
  alert("Private song notes saved.");
}
function saveLearningStatus(e){
  const songId=e.target.dataset.learningSong;songState(state.userId,songId).learning=e.target.value;
  notifyAdmin("Song learning status updated",`${currentUser().name}: ${data.songs.find(s=>s.id===songId)?.title} is ${e.target.value}.`,"song",songId);
  saveData();
}
function markArrangementReviewed(e){
  const songId=e.currentTarget.dataset.reviewArrangement,song=data.songs.find(s=>s.id===songId),arr=activeArrangement(song);
  if(arr)songState(state.userId,songId).reviewedVersion=arr.version;
  saveData();mount();
}

async function loadPracticeTrack(){
  const audio=$("practiceAudio"),track=state.practice.trackKey;if(!track||!audio)return;
  const blob=await getAudio(track);
  if(!blob){audio.removeAttribute("src");return}
  if(audio.dataset.objectUrl)URL.revokeObjectURL(audio.dataset.objectUrl);
  const url=URL.createObjectURL(blob);audio.dataset.objectUrl=url;audio.src=url;audio.load();
}
function bindPracticePlayer(){
  const select=$("practiceTrackSelect");if(!select)return;
  const audio=$("practiceAudio"),play=$("practicePlayBtn"),seek=$("practiceSeek"),time=$("practiceTime"),speed=$("practiceSpeed");
  loadPracticeTrack();
  select.addEventListener("change",()=>{state.practice.trackKey=select.value;state.practice.loopA=null;state.practice.loopB=null;loadPracticeTrack();updateLoopReadout()});
  play.addEventListener("click",()=>{if(audio.paused)audio.play();else audio.pause()});
  audio.onplay=()=>play.textContent="❚❚ PAUSE";
  audio.onpause=()=>play.textContent="▶ PLAY";
  audio.ontimeupdate=()=>{
    if(Number.isFinite(audio.duration)&&audio.duration>0){
      seek.value=Math.round((audio.currentTime/audio.duration)*1000);
      time.textContent=`${humanDuration(audio.currentTime)} / ${humanDuration(audio.duration)}`;
    }
    if(state.practice.loopA!=null&&state.practice.loopB!=null&&audio.currentTime>=state.practice.loopB)audio.currentTime=state.practice.loopA;
  };
  seek.addEventListener("input",()=>{if(Number.isFinite(audio.duration))audio.currentTime=(Number(seek.value)/1000)*audio.duration});
  speed.addEventListener("change",()=>audio.playbackRate=Number(speed.value));
  document.querySelectorAll("[data-audio-skip]").forEach(el=>el.addEventListener("click",()=>audio.currentTime=clamp(audio.currentTime+Number(el.dataset.audioSkip),0,audio.duration||999999)));
  document.querySelector("[data-loop-a]")?.addEventListener("click",()=>{state.practice.loopA=audio.currentTime;updateLoopReadout()});
  document.querySelector("[data-loop-b]")?.addEventListener("click",()=>{state.practice.loopB=audio.currentTime;if(state.practice.loopA!=null&&state.practice.loopB<state.practice.loopA)[state.practice.loopA,state.practice.loopB]=[state.practice.loopB,state.practice.loopA];updateLoopReadout()});
  document.querySelector("[data-loop-clear]")?.addEventListener("click",()=>{state.practice.loopA=null;state.practice.loopB=null;updateLoopReadout()});
}
function updateLoopReadout(){
  if(!$("loopReadout"))return;
  $("loopReadout").textContent=state.practice.loopA!=null&&state.practice.loopB!=null?`Loop: ${humanDuration(state.practice.loopA)} to ${humanDuration(state.practice.loopB)}`:state.practice.loopA!=null?`Loop A set at ${humanDuration(state.practice.loopA)}. Set B.`:"Loop: off";
}
function stopPractice(){
  const audio=$("practiceAudio");audio.pause();audio.currentTime=0;
  if(audio.dataset.objectUrl){URL.revokeObjectURL(audio.dataset.objectUrl);delete audio.dataset.objectUrl}
  audio.removeAttribute("src");state.practice={songId:null,trackKey:null,loopA:null,loopB:null};
}

function simulateCalendarConnect(provider){
  const m=currentUser();
  const existing=(m.calendarConnections||[]).find(c=>c.provider===provider);
  if(existing){existing.status="connected";existing.lastSync=nowISO();existing.enabled=true}
  else{
    m.calendarConnections ||= [];
    m.calendarConnections.push({id:uid("cal"),provider,status:"connected",lastSync:nowISO(),enabled:true,privacy:"free_busy_only"});
  }
  notifyAdmin("Calendar connection changed",`${m.name} connected ${provider} in the prototype. Personal events can be individually marked as still available.`,"calendar",null);
  logActivity(`${m.name} connected ${provider} calendar.`);saveData();mount();
}
function toggleCalendar(id){
  const c=currentUser().calendarConnections.find(x=>x.id===id);if(!c)return;
  c.enabled=c.enabled===false;saveData();mount();
}
function removeCalendar(id){
  const m=currentUser();m.calendarConnections=m.calendarConnections.filter(c=>c.id!==id);saveData();mount();
}
async function importICS(e){
  const file=e.target.files?.[0];if(!file)return;
  const text=await file.text();
  const events=parseICS(text);
  const m=currentUser();
  let added=0;
  for(const ev of events){
    const start=parseICSDate(ev.DTSTART),end=parseICSDate(ev.DTEND);
    if(!start||!end)continue;
    data.blocks.push({
      id:uid("block"),
      memberId:m.id,
      date:isoDate(start),
      start:start.toISOString(),
      end:end.toISOString(),
      source:"ics",
      sourceProvider:"iCalendar",
      providerEventId:ev.UID||null,
      availabilityOverride:null,
      privateReason:"Imported personal calendar busy time",
      createdAt:nowISO()
    });
    added++;
  }
  m.calendarConnections ||= [];
  m.calendarConnections.push({id:uid("cal"),provider:`iCalendar snapshot · ${file.name}`,status:"connected",lastSync:nowISO(),enabled:true,privacy:"free_busy_only"});
  notifyAdmin("Calendar busy time imported",`${m.name} imported ${added} busy windows. Event details were not shared.`,"calendar",null);
  logActivity(`${m.name} imported ${added} iCalendar busy windows.`);saveData();mount();
}
function parseICS(text){
  const unfolded=text.replace(/\r?\n[ \t]/g,"");
  return [...unfolded.matchAll(/BEGIN:VEVENT\r?\n([\s\S]*?)END:VEVENT/g)].map(m=>{
    const obj={};
    m[1].split(/\r?\n/).forEach(line=>{
      const idx=line.indexOf(":");if(idx<0)return;
      const key=line.slice(0,idx).split(";")[0];obj[key]=line.slice(idx+1);
    });
    return obj;
  });
}
function parseICSDate(v){
  if(!v)return null;
  if(/^\d{8}$/.test(v))return new Date(`${v.slice(0,4)}-${v.slice(4,6)}-${v.slice(6,8)}T00:00:00`);
  const z=v.endsWith("Z"),clean=v.replace("Z","");
  if(/^\d{8}T\d{6}$/.test(clean)){
    const iso=`${clean.slice(0,4)}-${clean.slice(4,6)}-${clean.slice(6,8)}T${clean.slice(9,11)}:${clean.slice(11,13)}:${clean.slice(13,15)}${z?"Z":""}`;
    return new Date(iso);
  }
  const d=new Date(v);return isNaN(d)?null:d;
}

function saveProfile(){
  const u=currentUser();u.fullName=$("profileName").value.trim()||u.fullName;u.email=$("profileEmail").value.trim();u.phone=$("profilePhone").value.trim();u.homeBase=$("profileBase").value.trim();
  saveData();mount();
}
function markAllRead(){
  memberNotifications(state.userId).forEach(n=>n.read=true);saveData();mount();
}
function resetDemo(){
  if(!confirm("Reset this backend prototype to the starting demo data?"))return;
  localStorage.removeItem(APP_KEY);data=defaultData();state={...state,userId:null,page:"dashboard",songId:null,offerId:null,showId:null,sidebarOpen:false};mount();
}

if("serviceWorker" in navigator && location.protocol!=="file:"){
  navigator.serviceWorker.register("./sw.js").catch(()=>{});
}
mount();
