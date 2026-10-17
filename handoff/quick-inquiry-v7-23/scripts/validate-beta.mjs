import fs from "fs";import path from "path";import vm from "vm";import { fileURLToPath } from "url";
const here=path.dirname(fileURLToPath(import.meta.url)),root=path.resolve(here,".."),platform=path.join(root,"PA_LINE_PLATFORM");
const f={public:path.join(platform,"booking","index.html"),crew:path.join(platform,"crew","index.html"),bridge:path.join(platform,"shared","bridge.js"),vault:path.join(platform,"shared","vault.js"),server:path.join(root,"server.mjs")};let failed=false;const pass=x=>console.log("PASS",x),fail=(x,d="")=>{failed=true;console.error("FAIL",x,d)};
for(const [n,p] of Object.entries(f))fs.existsSync(p)?pass(`file ${n}`):fail(`file ${n}`,"missing");if(failed)process.exit(1);
const pub=fs.readFileSync(f.public,"utf8"),crew=fs.readFileSync(f.crew,"utf8");
const scripts=h=>[...h.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi)].map(m=>m[1]);
for(const [n,h] of [["public",pub],["crew",crew]])scripts(h).forEach((js,i)=>{try{new vm.Script(js,{filename:`${n}-${i}.js`})}catch(e){fail(`${n} inline JavaScript ${i}`,e.message)}});
for(const [n,p] of [["bridge",f.bridge],["vault",f.vault]])try{new vm.Script(fs.readFileSync(p,"utf8"),{filename:p});pass(`${n} JavaScript syntax`)}catch(e){fail(`${n} JavaScript syntax`,e.message)}
pass("server module present; syntax checked by Node in release validation")
function staticHtml(h){return h.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,"").replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi,"")}
function dupIds(h){const ids=[...staticHtml(h).matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]),m=new Map();ids.forEach(id=>m.set(id,(m.get(id)||0)+1));return [...m].filter(([,n])=>n>1).map(([id])=>id)}
for(const [n,h] of [["public",pub],["crew",crew]]){const d=dupIds(h);d.length?fail(`${n} duplicate static IDs`,d.join(", ")):pass(`${n} duplicate static IDs`)}
const markers=[[pub,"I KNOW MY DATE","original booking path"],[pub,"HELP ME FIND THE SWEET SPOT","sweet spot path"],[pub,"GET OVER HERE","demand path"],[pub,"BACK FOR MORE?","returning path"],[pub,"NOT A STANDARD SHOW?","special path"],[pub,"charity_benefit","charity path"],[pub,"other_custom","custom path"],[pub,'../crew/sw-reset.html?secure=1',"public to secure COMMAND"],[crew,'window.location.href="../booking/index.html"',"COMMAND menu to public"],[crew,"MASTER ADMIN · FULL ACCESS","Master full access"],[crew,"Master Reminder Center","Master reminders"],[crew,"__new_role__","custom roles"],[crew,"renderQuickAccess","Quick Access"],[crew,"Admin responsibilities","Weekly admin lane"],[crew,"Crew + member tasks","Weekly crew lane"],[crew,"renderDataVaultPanel","Data Vault panel"],[crew,'src="../shared/vault.js"',"CREW vault client"],[pub,'src="../shared/vault.js"',"public vault client"],[crew,"BETA v7.23","CREW version"],[pub,"BETA v7.23","public version"]];
for(const [h,needle,label] of markers)h.includes(needle)?pass(label):fail(label,needle);crew.includes("./PA_LINE_PUBLIC_BOOKING.html")?fail("stale public path"):pass("no stale public path");
const ids=new Set([...staticHtml(pub).matchAll(/\bid="([^"]+)"/g)].map(m=>m[1])),refs=new Set([...pub.matchAll(/specialVal\("([^"]+)"\)/g)].map(m=>m[1])),missing=[...refs].filter(id=>!ids.has(id));missing.length?fail("special funnel field refs",missing.join(", ")):pass("special funnel field refs");
const ms=crew.match(/function defaultMarketDatabase\(\)\{\s*return (\[[\s\S]*?\]);\s*\}/);
if(!ms)fail("Market Database seed parse");else{try{const seed=JSON.parse(ms[1]);const ca=seed.filter(m=>m.countryCode==="CA").length;const vc=seed.reduce((n,m)=>n+(m.venues||[]).length,0);seed.length===12?pass("12 starter markets"):fail("12 starter markets",String(seed.length));ca===3?pass("3 Canadian starter markets"):fail("3 Canadian starter markets",String(ca));vc===120?pass("120 seeded venue prospects"):fail("120 seeded venue prospects",String(vc));seed.every(m=>(m.venues||[]).length===10)?pass("10 venues per starter market"):fail("10 venues per starter market");}catch(e){fail("Market Database seed parse",e.message)}}
crew.includes('function marketVenueLead(venue,marketId=null)')?pass("market-scoped pipeline lookup"):fail("market-scoped pipeline lookup");
crew.includes('["Hold","Offered"].includes(lead?.stage)')?pass("Offered/Hold status mapping"):fail("Offered/Hold status mapping");
crew.includes('if(lead?.stage==="Replying")return "Follow-up"')?pass("Replying status mapping"):fail("Replying status mapping");
crew.includes('linked.organization=venue.name')?pass("venue edit pipeline sync"):fail("venue edit pipeline sync");


crew.includes("function marketTerritoryMapData()")?pass("market territory map data"):fail("market territory map data");
crew.includes("function renderMarketTerritoryMap(markets,selectedId)")?pass("market territory map renderer"):fail("market territory map renderer");
crew.includes("market-territory-shape")?pass("market territory bounded shapes"):fail("market territory bounded shapes");
crew.includes("Boundaries show booking territories")?pass("market boundary disclaimer"):fail("market boundary disclaimer");


crew.includes("function renderTourRouteBoard()")?pass("tour route board renderer"):fail("tour route board renderer");
crew.includes("data-tour-sketch-mode")?pass("tour route planning modes"):fail("tour route planning modes");
crew.includes("data-tour-territory")?pass("tour market territory selection"):fail("tour market territory selection");
crew.includes("tourCitySearch")?pass("tour city search"):fail("tour city search");
crew.includes("data-tour-custom-city")?pass("tour custom city"):fail("tour custom city");
crew.includes("tour-route-wayline")?pass("tour waypoint route"):fail("tour waypoint route");
crew.includes("tour-route-drawline")?pass("tour freehand route"):fail("tour freehand route");
crew.includes("tourSketchAllowsRoutingMarket")?pass("tour sketch smart-routing filter"):fail("tour sketch smart-routing filter");


crew.includes("function routeStrengthScore()")?pass("Route Strength Score"):fail("Route Strength Score");
crew.includes("openTourStopAnchor")?pass("Anchor Shows"):fail("Anchor Shows");
crew.includes("MUST HIT")&&crew.includes("NICE TO HIT")&&crew.includes("AVOID")?pass("Tour target priorities"):fail("Tour target priorities");
crew.includes("FILL THE GAP")&&crew.includes("data-fill-gap-index")?pass("Fill the Gap"):fail("Fill the Gap");
crew.includes('["fans","Fan Loyalty"]')?pass("Fan Loyalty menu"):fail("Fan Loyalty menu");
crew.includes("renderFanLoyaltyPage")?pass("Fan Loyalty page"):fail("Fan Loyalty page");
fs.readFileSync(f.bridge,"utf8").includes("submitDemand")&&fs.readFileSync(f.bridge,"utf8").includes("adjustLoyalty")?pass("Fan loyalty bridge"):fail("Fan loyalty bridge");
pub.includes("FAN BOOKING LOYALTY")?pass("Public fan loyalty incentive"):fail("Public fan loyalty incentive");

process.exit(failed?1:0);
