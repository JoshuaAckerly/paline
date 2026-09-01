/*
  PA LINE Booking Platform - migrated source bridge
  -------------------------------------------------
  This file intentionally remains a classic browser script for v50 because the
  current UI uses inline onclick handlers that expect functions on window.
  Do not convert to ES modules until inline handlers have been replaced with
  addEventListener-based bindings or explicit window exports.
*/

const today=new Date(); today.setHours(12,0,0,0);
const $=id=>document.getElementById(id);
const pages=[...document.querySelectorAll("section.card")];
const state={
  source:null, selectedDate:null, originalDate:null, format:null, soundProvided:null,
  truePotential:false, exclusivity:null, exclusivityFee:0, techCan:null,
  preferredDays:new Set(), quote:null, additionalDates:[], demandRole:null,
  accountVerified:false, accountEmail:"", accountName:"", accountOrg:"", returningBooking:false,
  returningProfile:null, priorQualifiedShows:0, autoOpenRecurring:false, confidentialityAccepted:false,
  merchPackage:"none", merchQty:0, merchTotal:0, merchSizes:"", merchFor:"",
  routeProtection:null,
  routeSavingsEvent:null, routeSavingsElection:null,
  budgetAmount:null, budgetStatus:"unset", budgetException:false, budgetDateFlexRequested:false,
  legalSnapshot:null
};

/* v42 SHOWCASE navigation and polish */
const SHOWCASE_STAGE_MAP={
  pageStart:{p:0,count:"Choose a path"},
  pageReturningAccess:{p:8,count:"Returning access"},
  pageReturningHub:{p:12,count:"Returning portal"},
  pageRouteSavings:{p:18,count:"Route savings"},
  pageExact:{p:12,count:"1 of 8 · Date"},
  pageFlexible:{p:12,count:"1 of 8 · Date"},
  pageDemand:{p:30,count:"Demand request"},
  pageDemandDone:{p:100,count:"Submitted"},
  pageDetails:{p:25,count:"2 of 8 · Show"},
  pageReview:{p:37,count:"3 of 8 · Review"},
  pageSecureAccess:{p:45,count:"3 of 8 · Secure"},
  pageConfidentiality:{p:52,count:"3 of 8 · Secure"},
  pageQuote:{p:62,count:"4 of 8 · Pricing"},
  pageExclusive:{p:70,count:"5 of 8 · Terms"},
  pageTech:{p:78,count:"6 of 8 · Production"},
  pageBonus:{p:84,count:"6 of 8 · Additions"},
  pageCheckout:{p:91,count:"7 of 8 · Final check"},
  pageDocumentGate:{p:97,count:"8 of 8 · Review & Sign"},
  pageLegalAdmin:{p:0,count:"Admin · Legal docs"},
  pageDone:{p:100,count:"Submitted"}
};

function currentVisiblePageId(){
  const visible=pages.find(p=>!p.classList.contains("hidden"));
  return visible?visible.id:"pageStart";
}
function updateShowcaseChrome(id,label){
  const meta=SHOWCASE_STAGE_MAP[id]||{p:0,count:""};
  if($("stepLabel"))$("stepLabel").textContent=label||"Booking";
  if($("stepCount"))$("stepCount").textContent=meta.count;
  if($("journeyFill"))$("journeyFill").style.width=meta.p+"%";
  if($("startOverBtn"))$("startOverBtn").classList.toggle("hidden",id==="pageStart");
}
function startOver(){
  closeAllSuggestionLists?.();
  if(currentVisiblePageId()==="pageStart"){
    window.scrollTo({top:0,behavior:"smooth"});
    return;
  }
  try{
    window.location.reload();
  }catch(e){
    showPage("pageStart","Start");
  }
}

function showPage(id,label){
  closeAllSuggestionLists?.();
  pages.forEach(p=>{p.classList.add("hidden");p.classList.remove("showcase-enter")});
  const target=$(id);
  target.classList.remove("hidden");
  void target.offsetWidth;
  target.classList.add("showcase-enter");
  updateShowcaseChrome(id,label);
  window.scrollTo({top:0,behavior:"smooth"});
}
function iso(d){return d.toISOString().slice(0,10)}
function parseDate(s){return new Date(s+"T12:00:00")}
function money(n){return "$"+Math.round(n).toLocaleString()}
const LIVE_PA_LINE_CALENDAR = [{"date": "2026-09-12", "status": "booked", "title": "Another World Music Festival", "start": "7:00 PM", "end": "8:30 PM", "location": "Public / confirmed PA LINE calendar event"}, {"date": "2026-09-19", "status": "booked", "title": "Christian bday party gig", "start": "6:00 PM", "end": "11:00 PM", "location": "Bloomfield's Pub, Depew, NY"}];
const HOME_BASE="360 Gould Avenue, Depew, NY 14043";
const MILEAGE_RATE=0.80;

// Travel-time pricing is intentionally isolated here so it can be changed without
// touching the rest of the quote engine.
const DRIVE_TIME_HOURLY_RATE=0; // Set when PA LINE's hourly travel-time value is finalized.
const MAX_DRIVE_HOURS_PER_DAY=8;
const PROTOTYPE_AVG_MPH=55;

// Demo confirmed shows used only to exercise the route logic in this standalone file.
// The live version will pull these from the private booking calendar.
const demoConfirmedShows=[
  {date:addDays(today,5), city:"Rochester", state:"NY", zip:"14604"},
  {date:addDays(today,12), city:"Syracuse", state:"NY", zip:"13202"},
  {date:addDays(today,20), city:"Erie", state:"PA", zip:"16501"}
];

function addDays(base,n){const d=new Date(base);d.setDate(d.getDate()+n);return d}

function pseudoLegMiles(fromLabel,toLabel){
  const key=(fromLabel+"|"+toLabel).toLowerCase();let h=0;
  for(const c of key)h=(h*33+c.charCodeAt(0))>>>0;
  return 45+(h%260);
}

function locationLabel(city,stateName,zip){
  return [city,stateName,zip].filter(Boolean).join(", ");
}

function surroundingConfirmedShows(dateStr){
  const target=parseDate(dateStr);
  const sorted=[...demoConfirmedShows].sort((a,b)=>a.date-b.date);
  let prev=null,next=null;
  for(const gig of sorted){
    if(gig.date<target) prev=gig;
    if(gig.date>target){next=gig;break}
  }
  return {prev,next};
}


/* v44 confirmed-route price protection + Route Builder Credit */
function travelChargeForRoute(base,route){
  const mileageAndTime=Number(route?.totalCost)||0;
  const extendedAllowance=route?.extendedTravelAllowanceApplies?Number(base)||0:0;
  return {
    mileageAndTime,
    extendedAllowance,
    total:mileageAndTime+extendedAllowance
  };
}
function routeAdjustmentFromNewConfirmation(confirmedTravelCeiling,base,recalculatedRoute,referralAttributed=false){
  const ceiling=Math.max(0,Number(confirmedTravelCeiling)||0);
  const recalculated=travelChargeForRoute(base,recalculatedRoute);
  const adjustedTravelCharge=Math.min(ceiling,recalculated.total);
  const savings=Math.max(0,ceiling-adjustedTravelCharge);
  return {
    confirmedTravelCeiling:ceiling,
    recalculatedTravelCharge:recalculated.total,
    adjustedTravelCharge,
    savings,
    referralAttributed:!!referralAttributed,
    creditLabel:savings>0?(referralAttributed?"ROUTE BUILDER CREDIT":"ROUTE REOPTIMIZATION SAVINGS"):"NO TRAVEL ADJUSTMENT",
    mayIncrease:false
  };
}


/* v45 route savings notification + customer allocation */
function incrementalRouteSavings({
  confirmedTravelCeiling,
  savingsAlreadyGranted=0,
  recalculatedTravelCharge
}){
  const ceiling=Math.max(0,Number(confirmedTravelCeiling)||0);
  const already=Math.max(0,Math.min(ceiling,Number(savingsAlreadyGranted)||0));
  const protectedCurrent=Math.max(0,ceiling-already);
  const recalculated=Math.max(0,Number(recalculatedTravelCharge)||0);
  const adjustedTravelCharge=Math.min(protectedCurrent,recalculated);
  const newSavings=Math.max(0,protectedCurrent-adjustedTravelCharge);
  return {
    confirmedTravelCeiling:ceiling,
    savingsAlreadyGranted:already,
    protectedCurrentTravelCharge:protectedCurrent,
    recalculatedTravelCharge:recalculated,
    adjustedTravelCharge,
    newSavings,
    totalSavingsAfter:already+newSavings,
    mayIncrease:false
  };
}

function affectedExistingBookingsWhenShowConfirms(orderedConfirmedShows,newShowIndex){
  const affected=[];
  if(newShowIndex>0)affected.push(orderedConfirmedShows[newShowIndex-1]);
  if(newShowIndex<orderedConfirmedShows.length-1)affected.push(orderedConfirmedShows[newShowIndex+1]);
  return affected;
}

/*
Production confirmation transaction:
1. Insert the newly confirmed show into chronological confirmed schedule.
2. The new show's travel ceiling is the travel charge calculated with its current immediate predecessor/successor.
3. Recalculate only the previously confirmed immediate predecessor and successor, because routing for a booking is defined by those surrounding engagements.
4. For each affected prior booking, compare its currently protected travel charge to the new calculated travel charge.
5. If the new calculated charge is lower, create a RouteSavingsEvent for only the incremental savings not already granted.
6. Never reverse prior savings merely because a later route change is worse.
7. Email + in-app notify the affected booking contact.
*/

function createRouteSavingsEvent(data){
  const savings=Math.max(0,Number(data.savings)||0);
  return {
    id:data.id||("route_"+Date.now()),
    bookingVenue:data.bookingVenue||"Confirmed venue",
    bookingDate:data.bookingDate||"",
    triggerVenue:data.triggerVenue||"another confirmed venue",
    triggerDate:data.triggerDate||"",
    routeBefore:data.routeBefore||"",
    routeAfter:data.routeAfter||"",
    protectedTravelCharge:Math.max(0,Number(data.protectedTravelCharge)||0),
    recalculatedTravelCharge:Math.max(0,Number(data.recalculatedTravelCharge)||0),
    savings,
    referralAttributed:!!data.referralAttributed,
    source:data.referralAttributed?"route_builder_referral":"route_reoptimization",
    paymentStatus:data.paymentStatus||"paid",
    outstandingBalance:Math.max(0,Number(data.outstandingBalance)||0),
    status:"available",
    createdAt:new Date().toISOString()
  };
}

function openRouteSavingsDemo(){
  state.routeSavingsEvent=createRouteSavingsEvent({
    id:"demo_nyc_albany",
    bookingVenue:"New York City venue",
    bookingDate:"Saturday",
    triggerVenue:"Albany venue",
    triggerDate:"the adjacent route-friendly date",
    routeBefore:HOME_BASE+" → New York City → "+HOME_BASE,
    routeAfter:"Albany → New York City → "+HOME_BASE,
    protectedTravelCharge:620,
    recalculatedTravelCharge:380,
    savings:240,
    referralAttributed:false,
    paymentStatus:"paid",
    outstandingBalance:0
  });
  state.routeSavingsElection={preset:"return",returnPct:100,creditPct:0,reinvestPct:0};
  renderRouteSavingsPage();
  showPage("pageRouteSavings","Route Savings");
}

function routeSavingsPct(n){
  const value=Number(n);
  return Number.isFinite(value)?Math.max(0,Math.min(100,Math.round(value))):0;
}

function chooseRouteSavingsPreset(preset){
  const presets={
    return:{returnPct:100,creditPct:0,reinvestPct:0},
    credit:{returnPct:0,creditPct:100,reinvestPct:0},
    buzz:{returnPct:0,creditPct:0,reinvestPct:100},
    half:{returnPct:50,creditPct:0,reinvestPct:50},
    custom:{
      returnPct:routeSavingsPct($("routeReturnPct")?.value||100),
      creditPct:routeSavingsPct($("routeCreditPct")?.value||0),
      reinvestPct:routeSavingsPct($("routeReinvestPct")?.value||0)
    }
  };
  state.routeSavingsElection={preset,...presets[preset]};
  ["return","credit","buzz","half","custom"].forEach(key=>{
    const id={return:"routeSaveReturn",credit:"routeSaveCredit",buzz:"routeSaveBuzz",half:"routeSaveHalf",custom:"routeSaveCustom"}[key];
    if($(id)){
      $(id).classList.toggle("selected",key===preset);
      $(id).setAttribute("aria-pressed",key===preset?"true":"false");
    }
  });
  $("routeCustomPanel")?.classList.toggle("hidden",preset!=="custom");
  if(preset==="custom"){
    $("routeReturnPct").value=state.routeSavingsElection.returnPct;
    $("routeCreditPct").value=state.routeSavingsElection.creditPct;
    $("routeReinvestPct").value=state.routeSavingsElection.reinvestPct;
  }
  renderRouteSavingsAllocation();
}

function updateRouteSavingsCustom(){
  if(state.routeSavingsElection?.preset!=="custom"){
    chooseRouteSavingsPreset("custom");
    return;
  }
  state.routeSavingsElection.returnPct=routeSavingsPct($("routeReturnPct").value);
  state.routeSavingsElection.creditPct=routeSavingsPct($("routeCreditPct").value);
  state.routeSavingsElection.reinvestPct=routeSavingsPct($("routeReinvestPct").value);
  renderRouteSavingsAllocation();
}

function routeSavingsAllocation(){
  const event=state.routeSavingsEvent;
  const election=state.routeSavingsElection||{returnPct:100,creditPct:0,reinvestPct:0};
  if(!event)return null;
  const totalPct=election.returnPct+election.creditPct+election.reinvestPct;
  const savings=event.savings;
  let returnAmount=Math.round(savings*election.returnPct/100);
  let creditAmount=Math.round(savings*election.creditPct/100);
  let reinvestAmount=Math.round(savings*election.reinvestPct/100);

  /* eliminate rounding drift so exact 100% allocations equal the savings total */
  if(totalPct===100){
    const drift=savings-(returnAmount+creditAmount+reinvestAmount);
    returnAmount+=drift;
  }
  return {totalPct,returnAmount,creditAmount,reinvestAmount,savings};
}

function renderRouteSavingsAllocation(){
  const a=routeSavingsAllocation();
  if(!a)return;
  $("routeReturnAmount").textContent=money(a.returnAmount);
  $("routeCreditAmount").textContent=money(a.creditAmount);
  $("routeReinvestAmount").textContent=money(a.reinvestAmount);

  const totalEl=$("routeCustomTotal");
  if(totalEl){
    totalEl.textContent="Total: "+a.totalPct+"%";
    totalEl.classList.toggle("good",a.totalPct===100);
    totalEl.classList.toggle("bad",a.totalPct!==100);
  }
  $("routeSavingsSubmit").disabled=a.totalPct!==100;

  const event=state.routeSavingsEvent;
  let settlement="";
  if(a.returnAmount){
    if(event.paymentStatus==="unpaid"||event.outstandingBalance>0){
      const balanceReduction=Math.min(a.returnAmount,event.outstandingBalance);
      const excess=Math.max(0,a.returnAmount-balanceReduction);
      settlement="Your return portion first reduces any unpaid booking balance"+(excess?" and the remaining "+money(excess)+" is returned to you.":".");
    }else{
      settlement="Your return portion is due back to you through the applicable payment/refund method.";
    }
  }else if(a.creditAmount){
    settlement="Your booking-credit portion stays attached to the verified booking account for a future PA LINE booking.";
  }else{
    settlement="You are choosing to voluntarily let PA LINE retain the full savings for touring, routing, or promotion.";
  }
  $("routeSavingsSettlementNote").textContent=settlement;
}

function renderRouteSavingsPage(){
  const e=state.routeSavingsEvent;
  if(!e)return;
  $("routeSavingsLabel").textContent=e.referralAttributed?"ROUTE BUILDER CREDIT":"ROUTE SAVINGS";
  $("routeSavingsHeadline").textContent=e.triggerVenue+" joined the route.";
  $("routeSavingsPageTitle").textContent="Your route got better. You saved "+money(e.savings)+".";
  $("routeSavingsPageIntro").textContent="A later confirmed PA LINE show reduced the protected travel attached to your "+e.bookingVenue+" booking. The savings belongs to your booking, and you decide what happens next.";
  $("routeSavingsStoryText").innerHTML=
    "When <strong>"+escapeHTML(e.triggerVenue)+"</strong> became confirmed, it replaced part of the original one-off routing and lowered the travel attached to <strong>"+escapeHTML(e.bookingVenue)+"</strong>.";
  $("routeSavingsBeforeRoute").textContent=e.routeBefore;
  $("routeSavingsAfterRoute").textContent=e.routeAfter;
  $("routeSavingsBefore").textContent=money(e.protectedTravelCharge);
  $("routeSavingsAfter").textContent=money(e.recalculatedTravelCharge);
  $("routeSavingsAmount").textContent=money(e.savings);
  $("routeSavingsFooter").textContent=money(e.savings);
  $("routeReturnOptionValue").textContent=money(e.savings)+" back";
  $("routeCreditOptionValue").textContent=money(e.savings)+" credit";
  $("routeBuzzOptionValue").textContent=money(e.savings)+" reinvested";
  const halfBack=Math.round(e.savings/2),halfReinvest=e.savings-halfBack;
  $("routeHalfOptionValue").textContent=money(halfBack)+" back · "+money(halfReinvest)+" reinvested";
  $("routeSavingsDecisionNotice").classList.add("hidden");
  chooseRouteSavingsPreset(state.routeSavingsElection?.preset||"return");
}

function submitRouteSavingsElection(){
  const e=state.routeSavingsEvent;
  const a=routeSavingsAllocation();
  if(!e||!a||a.totalPct!==100)return;

  state.routeSavingsElection={
    ...state.routeSavingsElection,
    returnAmount:a.returnAmount,
    creditAmount:a.creditAmount,
    reinvestAmount:a.reinvestAmount,
    electedAt:new Date().toISOString()
  };
  e.status="elected";

  const parts=[];
  if(a.returnAmount)parts.push(money(a.returnAmount)+" returned / applied against balance");
  if(a.creditAmount)parts.push(money(a.creditAmount)+" saved as future booking credit");
  if(a.reinvestAmount)parts.push(money(a.reinvestAmount)+" voluntarily reinvested with PA LINE");

  $("routeSavingsDecisionNotice").innerHTML=
    "<span class='badge'>SAVINGS CHOICE SAVED</span><h2 style='margin-top:8px'>"+parts.join(" · ")+"</h2>"+
    "<div class='small'>Interactive demo complete. In the live booking system, this election is recorded to the booking account, receipted, and each amount is settled separately.</div>";
  $("routeSavingsDecisionNotice").classList.remove("hidden");
  $("routeSavingsSubmit").textContent="SAVINGS CHOICE CONFIRMED ✓";
  $("routeSavingsSubmit").disabled=true;
}


function routeFor(dateStr,city,stateName,zip){
  const targetLabel=locationLabel(city,stateName,zip);
  const {prev,next}=surroundingConfirmedShows(dateStr);

  // Inbound origin: previous confirmed gig if one exists, otherwise home.
  const inboundOrigin=prev ? locationLabel(prev.city,prev.state,prev.zip) : HOME_BASE;

  // Outbound destination: next confirmed gig if one exists, otherwise home.
  const outboundDestination=next ? locationLabel(next.city,next.state,next.zip) : HOME_BASE;

  const inboundMiles=pseudoLegMiles(inboundOrigin,targetLabel);
  const outboundMiles=pseudoLegMiles(targetLabel,outboundDestination);
  const totalMiles=inboundMiles+outboundMiles;

  const driveHours=totalMiles/PROTOTYPE_AVG_MPH;
  // PA LINE travel allowance rule:
  // Combine the inbound leg (previous confirmed gig, or home if none) and
  // outbound leg (next confirmed gig, or home if none). Mileage always applies.
  // ONE additional season-adjusted base performance rate applies only when
  // the combined drive time EXCEEDS 8 hours. Exactly 8.0 hours does not trigger it.
  const extendedTravelAllowanceApplies=driveHours>MAX_DRIVE_HOURS_PER_DAY;

  const mileageCost=Math.round(totalMiles*MILEAGE_RATE);
  const timeCost=Math.round(driveHours*DRIVE_TIME_HOURLY_RATE);
  const totalCost=mileageCost+timeCost;

  const fit=driveHours<=3?"Excellent route fit":driveHours<=6?"Good route fit":driveHours<=8?"Long route, no extra base allowance":"Extended travel allowance applies";

  return {
    inboundOrigin,outboundDestination,
    inboundMiles,outboundMiles,totalMiles,
    driveHours,extendedTravelAllowanceApplies,
    mileageCost,timeCost,totalCost,
    fit,
    hasPreviousGig:!!prev,
    hasNextGig:!!next
  };
}
function isLongRange(dateStr){const c=new Date(today);c.setMonth(c.getMonth()+12);return parseDate(dateStr)>c}

function openReturningAccess(){
  showPage("pageReturningAccess","Returning Booker");
  updateReturningAccess();
}
function updateReturningAccess(){
  const email=$("returningEmail").value.trim();
  const venue=$("returningVenue").value.trim();
  $("returningLinkBtn").disabled=!(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)&&venue);
}
function simulateReturningMagicLink(){
  if($("returningLinkBtn").disabled)return;
  $("returningLinkNotice").classList.remove("hidden");
  $("returningLinkNotice").innerHTML="<strong>Demo sign-in ready</strong><div class='small' style='margin-top:5px'>In the live booking system, the secure link arrives by email at <strong>"+$("returningEmail").value.trim()+"</strong>. Continue below to preview the verified booker portal.</div><button class='btn primary' style='margin-top:10px' onclick='completeReturningVerification()'>OPEN VERIFIED BOOKER PORTAL</button>";
}
function completeReturningVerification(){
  state.accountVerified=true;
  state.accountEmail=$("returningEmail").value.trim();
  state.accountOrg=$("returningVenue").value.trim();
  state.returningBooking=true;
  $("returnProfileVenue").value=state.accountOrg;
  setupLocationIntelligence();
  $("returningWelcome").textContent="Signed in for "+state.accountOrg+". Authorized venue details, booking history, rates, and documents stay connected to this verified account.";
  updateReturningBenefits();
  showPage("pageReturningHub","Returning Booker");
}
function captureReturningProfile(){
  state.returningProfile={
    venue:$("returnProfileVenue").value.trim()||state.accountOrg,
    address:$("returnProfileAddress").value.trim(),
    city:$("returnProfileCity").value.trim(),
    state:$("returnProfileState").value.trim(),
    zip:$("returnProfileZip").value.trim()
  };
  state.priorQualifiedShows=Math.max(0,+$("returnPriorCount").value||0);
}
function updateReturningBenefits(){
  state.priorQualifiedShows=Math.max(0,+$("returnPriorCount").value||0);
  const count=state.priorQualifiedShows;
  $("returnBenefitStatus").innerHTML=count>=4
    ? "<span class='benefit-chip'>REPEAT BOOKING ELIGIBILITY MET</span> Four or more confirmed gigs are associated with this venue / booking contact in the current year."
    : "<span class='benefit-chip pending'>"+count+" OF 4 TOWARD REPEAT STATUS</span> New dates in this request also count toward the four-gig threshold.";
}
function startReturningExact(){
  captureReturningProfile();
  state.returningBooking=true;
  state.source="exact";
  goExact();
}
function startReturningFlexible(){
  captureReturningProfile();
  state.returningBooking=true;
  state.source="flexible";
  goFlexible();
  if(state.returningProfile){
    $("flexVenue").value=state.returningProfile.venue||"";
    $("flexCity").value=state.returningProfile.city||"";
    $("flexState").value=state.returningProfile.state||"NY";
    $("flexZip").value=state.returningProfile.zip||"";
  }
}
function startReturningSeries(){
  captureReturningProfile();
  state.returningBooking=true;
  state.autoOpenRecurring=true;
  state.source="exact";
  goExact();
}
function applyReturningProfileToDetails(){
  if(!state.returningBooking||!state.returningProfile)return;
  $("eventVenue").value=state.returningProfile.venue||$("eventVenue").value;
  $("eventAddress").value=state.returningProfile.address||$("eventAddress").value;
  $("eventCity").value=state.returningProfile.city||$("eventCity").value;
  $("eventState").value=state.returningProfile.state||$("eventState").value;
  $("eventZip").value=state.returningProfile.zip||$("eventZip").value;
}
function qualifyingShowCount(){
  return Math.max(0,state.priorQualifiedShows||0)+1+(state.additionalDates?.length||0);
}
function repeatBenefitEligible(){
  return qualifyingShowCount()>=4;
}
function updateBookingBenefits(){
  if(!$("bookingBenefitPreview"))return;
  const chips=[];
  const intro=$("introVenueStatus").value;
  const referral=$("referralSource").value.trim();
  if(intro==="new")chips.push("<span class='benefit-chip'>INTRODUCTORY DISCOUNT: POTENTIAL</span>");
  if(intro==="new"&&referral)chips.push("<span class='benefit-chip'>NEW-VENUE REFERRAL: POTENTIAL</span>");
  if(referral)chips.push("<span class='benefit-chip route-credit-chip'>ROUTE BUILDER REFERRAL: TRACKED</span>");
  if(repeatBenefitEligible())chips.push("<span class='benefit-chip'>4+ GIG REPEAT STATUS: ELIGIBLE</span>");
  else chips.push("<span class='benefit-chip pending'>"+qualifyingShowCount()+" OF 4 TOWARD REPEAT STATUS</span>");
  $("bookingBenefitPreview").innerHTML=chips.join("")+"<div style='margin-top:7px'>Eligibility is evaluated by venue and by authorized booking contact. Discount amounts and stacking rules remain subject to PA LINE approval. Route Builder Credit is not a guessed discount: it equals realized travel savings after a documented referred show becomes confirmed and improves the route.</div>";
}
function renderQuoteBenefits(){
  if(!$("quoteBenefitsCard"))return;
  const intro=$("introVenueStatus").value;
  const referral=$("referralSource").value.trim();
  let rows=[];
  rows.push("<div class='req-item'><strong>Repeat booking program</strong><div class='small'>"+(repeatBenefitEligible()?"Eligible for repeat-booking review because the combined qualifying count is "+qualifyingShowCount()+" gigs.":"Current qualifying count: "+qualifyingShowCount()+" of 4 gigs needed in the year from this venue or booking contact.")+"</div></div>");
  rows.push("<div class='req-item'><strong>Introductory venue program</strong><div class='small'>"+(intro==="new"?"Potentially eligible because this was marked as the venue's first PA LINE booking.":intro==="returning"?"Not marked as a new venue.":"Venue-newness has not been confirmed.")+"</div></div>");
  rows.push("<div class='req-item'><strong>New-venue referral program</strong><div class='small'>"+(intro==="new"&&referral?"Potentially eligible. Referral source: "+escapeHTML(referral)+".":"Requires a new venue plus a valid referral source.")+"</div></div>");
  rows.push("<div class='req-item route-builder-benefit'><strong>Route Builder Credit</strong><div class='small'>"+(referral?"Referral attribution is being tracked to "+escapeHTML(referral)+". If this show becomes confirmed and improves that referring venue/booker's surrounding route, the actual travel savings are credited back to them. A lead or hold alone does not trigger a credit.":"No referring PA LINE venue/booker is linked to this request. If one helped create this booking, add them on the Event Details page so the route-building attribution is preserved.")+"</div></div>");
  $("quoteBenefitsCard").innerHTML="<span class='badge'>BOOKING BENEFITS</span><h2 style='margin-top:8px'>Preferred-pricing review</h2><div class='req-list'>"+rows.join("")+"</div><div class='small' style='margin-top:8px'>Introductory/referral/repeat discount amounts have not been deducted because those program values are not finalized. Route Builder Credit is calculated only from realized post-confirmation travel savings.</div>";
}
function continueToSecurePricing(){
  if(state.accountVerified){
    openConfidentiality();
    return;
  }
  if(!$("secureAccountOrg").value)$("secureAccountOrg").value=$("eventVenue").value.trim();
  showPage("pageSecureAccess","Secure Access");
  updateSecureAccess();
}
function updateSecureAccess(){
  const name=$("secureAccountName").value.trim();
  const email=$("secureAccountEmail").value.trim();
  const org=$("secureAccountOrg").value.trim();
  $("secureLinkBtn").disabled=!(name&&org&&/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email));
}
function simulateSecureLink(){
  if($("secureLinkBtn").disabled)return;
  $("secureLinkNotice").classList.remove("hidden");
  $("secureLinkNotice").innerHTML="<strong>Demo verification ready</strong><div class='small' style='margin-top:5px'>In the live booking system, the secure link arrives by email at <strong>"+$("secureAccountEmail").value.trim()+"</strong>. Continue below to preview the verified pricing experience.</div><button class='btn primary' style='margin-top:10px' onclick='completeSecureVerification()'>CONTINUE AS VERIFIED</button>";
}
function completeSecureVerification(){
  state.accountVerified=true;
  state.accountName=$("secureAccountName").value.trim();
  state.accountEmail=$("secureAccountEmail").value.trim();
  state.accountOrg=$("secureAccountOrg").value.trim();
  rememberContact({name:state.accountName,email:state.accountEmail,org:state.accountOrg,venue:$("eventVenue")?.value});
  openConfidentiality();
}
function openConfidentiality(){
  if(!$("pricingConfName").value)$("pricingConfName").value=state.accountName||"";
  state.confidentialityAccepted=false;
  showPage("pageConfidentiality","Confidential Pricing");
  syncDocumentReviewLock("nda");
  updateConfidentialityGate();
}
function updateConfidentialityGate(){
  const ok=$("pricingConfName").value.trim()&&$("pricingConfTitle").value.trim()&&$("pricingConfAck").checked&&$("pricingConfESign").checked;
  $("pricingConfContinue").disabled=!ok;
  $("pricingConfStatus").textContent=!reviewedDocuments.has("nda")?"Open the confidentiality terms and scroll to the bottom first.":ok?"Ready to unlock this booking's private quote.":"Complete the signer, role, confidentiality acknowledgment, and electronic acceptance.";
}
function acceptConfidentialityAndQuote(){
  if($("pricingConfContinue").disabled)return;
  state.confidentialityAccepted=true;
  openQuote();
}

function goExact(){state.source="exact";showPage("pageExact","I Know My Date");renderCalendar()}
function goFlexible(){state.source="flexible";showPage("pageFlexible","I’m Flexible");setupSeasonYears();setupWeekdays()}
function goDemand(){
  state.source="demand";
  showPage("pageDemand","Create Demand");
  setupAutocomplete();
  setupLocationIntelligence();
  setupSmartBookingAutofill();
syncAllDocumentReviewLocks();
syncLegalVersionLabels();
updateShowcaseChrome("pageStart","Start");
  updateDemandState();
}

function setDemandRole(role){
  state.demandRole=role;
  ["demandFanCard","demandConnectorCard","demandVenueCard"].forEach(id=>$(id).classList.remove("selected"));
  $(role==="fan"?"demandFanCard":role==="connector"?"demandConnectorCard":"demandVenueCard").classList.add("selected");
  updateDemandState();
}

function selectedDemandActions(){
  return [...document.querySelectorAll(".demand-action:checked")].map(x=>x.value);
}

function updateDemandState(){
  if(!$("demandSubmit"))return;
  const emailOk=/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test($("demandEmail").value.trim());
  const ok=$("demandCity").value.trim()&&$("demandState").value.trim()&&$("demandName").value.trim()&&emailOk&&state.demandRole;
  $("demandSubmit").disabled=!ok;
  $("demandSummary").textContent=ok
    ? $("demandCity").value.trim()+", "+$("demandState").value.trim()+" · "+(state.demandRole==="fan"?"Fan request":state.demandRole==="connector"?"Local connector":"Venue / promoter")
    : "Add city, contact info, and your role";
}

["demandCity","demandState","demandZip","demandVenue","demandVenue2","demandName","demandEmail","demandPhone","demandNotes"].forEach(id=>{
  const el=$(id); if(el)el.addEventListener("input",updateDemandState);
});

function submitDemand(){
  if($("demandSubmit").disabled)return;
  rememberContact({name:$("demandName").value,email:$("demandEmail").value,phone:$("demandPhone").value,org:$("demandVenue").value,venue:$("demandVenue").value});
  if($("demandVenue").value.trim())rememberVenue({name:$("demandVenue").value,city:$("demandCity").value,state:$("demandState").value,zip:$("demandZip").value});
  const party=+$("demandParty").value;
  const actions=selectedDemandActions();
  let points=party;
  if(state.demandRole==="connector")points+=8;
  if(state.demandRole==="venue")points+=15;
  points+=actions.length*3;
  if($("demandVenue").value.trim())points+=4;
  if($("demandVenue2").value.trim())points+=2;
  const level=points>=30?"HIGH":points>=15?"GROWING":"STARTING";

  $("demandDoneCard").innerHTML=
    "<strong>"+$("demandCity").value.trim()+", "+$("demandState").value.trim()+"</strong>"+
    "<div class='small' style='margin-top:4px'>Requested by "+$("demandName").value.trim()+" · "+$("demandEmail").value.trim()+"</div>"+
    ($("demandVenue").value.trim()?"<div style='margin-top:10px'><strong>Preferred venue</strong><div class='small'>"+$("demandVenue").value.trim()+"</div></div>":"")+
    "<div style='margin-top:10px'><strong>Estimated attendance signal</strong><div class='small'>"+party+" likely attendee"+(party===1?"":"s")+" from this request</div></div>"+
    (actions.length?"<div style='margin-top:10px'><strong>Ways they offered to help</strong><div class='small'>"+actions.join(", ")+"</div></div>":"");

  $("demandLevel").textContent="Demand level: "+level;
  $("demandMetrics").textContent="Prototype demand score: "+points+" · "+party+" likely attendee"+(party===1?"":"s")+" · "+actions.length+" momentum action"+(actions.length===1?"":"s");
  prepareSharedDocumentGate("demand");
}

let viewMonth=new Date(today.getFullYear(),today.getMonth(),1);
const demoHeld=new Set(),demoBooked=new Set(),demoBlocked=new Set();
for(let i=1;i<=18;i++){let d=new Date(today);d.setDate(d.getDate()+i*9);(i%3===0?demoBooked:i%3===1?demoHeld:demoBlocked).add(iso(d))}
function liveCalendarEventsFor(dateStr){
  return LIVE_PA_LINE_CALENDAR.filter(e=>e.date===dateStr&&e.status==="booked");
}
function bookedEventsForDate(dateStr){
  const live=liveCalendarEventsFor(dateStr);
  if(live.length)return live;
  if(demoBooked.has(dateStr)){
    return [{date:dateStr,status:"booked",title:"Existing confirmed PA LINE engagement",start:"7:00 PM",end:"10:00 PM",location:HOME_BASE,prototype:true}];
  }
  return [];
}
function availability(d){
  const s=iso(d),max=new Date(today);max.setMonth(max.getMonth()+24);
  if(d<today||d>max)return"blocked";
  if(bookedEventsForDate(s).length)return"limited";
  if(demoHeld.has(s))return"held";
  if(demoBlocked.has(s))return"blocked";
  return"available"
}
function renderCalendar(){
  const cal=$("calendar");cal.innerHTML="";
  ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].forEach(x=>{let e=document.createElement("div");e.className="dow";e.textContent=x;cal.appendChild(e)});
  const first=new Date(viewMonth),startDay=first.getDay(),days=new Date(first.getFullYear(),first.getMonth()+1,0).getDate();
  for(let i=0;i<startDay;i++){let e=document.createElement("div");e.className="day muted";cal.appendChild(e)}
  for(let n=1;n<=days;n++){
    const d=new Date(first.getFullYear(),first.getMonth(),n,12),st=availability(d),e=document.createElement("div");
    e.dataset.date=iso(d);
    e.className="day";
    if(st==="limited")e.classList.add("limited");
    else if(st!=="available")e.classList.add("blocked");
    if(state.selectedDate===iso(d))e.classList.add("selected");
    const label=st==="available"?(isLongRange(iso(d))?"12+ MO":"AVAILABLE"):st==="limited"?"LIMITED":st.toUpperCase();
    e.innerHTML="<strong>"+n+"</strong><div class='tag'>"+label+"</div>";
    if(st==="available"){e.onclick=()=>selectExactDate(d)}
    if(st==="limited"){e.onclick=()=>showLimitedDateModal(d)}
    cal.appendChild(e)
  }
  $("monthTitle").textContent=viewMonth.toLocaleDateString(undefined,{month:"long",year:"numeric"});
  const prev=new Date(viewMonth);prev.setMonth(prev.getMonth()-1);const next=new Date(viewMonth);next.setMonth(next.getMonth()+1);
  $("prevMonth").textContent="‹ "+prev.toLocaleDateString(undefined,{month:"long"});
  $("nextMonth").textContent=next.toLocaleDateString(undefined,{month:"long"})+" ›";
  $("prevMonth").disabled=viewMonth.getFullYear()===today.getFullYear()&&viewMonth.getMonth()===today.getMonth();
  const maxMonth=new Date(today.getFullYear(),today.getMonth()+23,1);$("nextMonth").disabled=viewMonth>=maxMonth;
}
function moveMonth(n){viewMonth.setMonth(viewMonth.getMonth()+n);renderCalendar()}

const SAME_DAY_MIN_START=10*60;
const SAME_DAY_MAX_START=23*60;
const PA_LINE_PRE_SHOW_ALLOWANCE=120;
const PA_LINE_POST_SHOW_ALLOWANCE=120;
let pendingLimitedDate=null;

function clockMinutes(value){
  if(value==null)return null;
  let s=String(value).trim();
  const ampm=s.match(/^(\d{1,2}):(\d{2})\s*([AP]M)$/i);
  if(ampm){
    let h=+ampm[1]%12;if(ampm[3].toUpperCase()==="PM")h+=12;
    return h*60+(+ampm[2]);
  }
  const h24=s.match(/^(\d{1,2}):(\d{2})$/);
  return h24?(+h24[1])*60+(+h24[2]):null;
}
function clockLabel(mins){
  mins=Math.round(mins);
  mins=((mins%1440)+1440)%1440;
  let h=Math.floor(mins/60),m=mins%60,ap=h>=12?"PM":"AM",hh=h%12||12;
  return hh+":"+String(m).padStart(2,"0")+" "+ap;
}
function clockLabelWithDay(mins){
  const raw=Math.round(mins);
  const day=Math.floor(raw/1440);
  const label=clockLabel(raw);
  if(day>0)return label+" (+"+day+" day"+(day===1?"":"s")+")";
  if(day<0)return label+" ("+Math.abs(day)+" day"+(day===-1?"":"s")+" prior)";
  return label;
}
function requestedDurationMinutes(){
  const a=clockMinutes($("eventStart")?.value),b=clockMinutes($("eventEnd")?.value);
  if(a!=null&&b!=null){
    let d=b-a;if(d<=0)d+=1440;
    if(d>0&&d<=480)return d;
  }
  return 90;
}
function travelMinutesBetween(fromLabel,toLabel){
  if(!fromLabel||!toLabel)return 0;
  return Math.round((pseudoLegMiles(fromLabel,toLabel)/PROTOTYPE_AVG_MPH)*60);
}
function sameDayWindows(dateStr,city,stateName,zip,durationMinutes=90){
  const events=bookedEventsForDate(dateStr).map(e=>{
    const startMin=clockMinutes(e.start);
    let endMin=clockMinutes(e.end);
    if(startMin!=null&&endMin!=null&&endMin<=startMin)endMin+=1440;
    return {...e,startMin,endMin};
  }).filter(e=>e.startMin!=null&&e.endMin!=null).sort((a,b)=>a.startMin-b.startMin);

  if(!events.length)return {windows:[{start:SAME_DAY_MIN_START,end:SAME_DAY_MAX_START}],events:[],preliminary:false};

  const target=locationLabel(city,stateName,zip);
  const routed=!!(city&&stateName);
  const pre=PA_LINE_PRE_SHOW_ALLOWANCE;
  const post=PA_LINE_POST_SHOW_ALLOWANCE;
  const windows=[];

  const first=events[0];
  const travelToFirst=routed?travelMinutesBetween(target,first.location||HOME_BASE):0;
  let beforeEnd=first.startMin-pre-travelToFirst-post-durationMinutes;
  if(beforeEnd>=SAME_DAY_MIN_START)windows.push({start:SAME_DAY_MIN_START,end:Math.min(beforeEnd,SAME_DAY_MAX_START),position:"before"});

  for(let i=0;i<events.length-1;i++){
    const prev=events[i],next=events[i+1];
    const travelFromPrev=routed?travelMinutesBetween(prev.location||HOME_BASE,target):0;
    const travelToNext=routed?travelMinutesBetween(target,next.location||HOME_BASE):0;
    const earliest=prev.endMin+post+travelFromPrev+pre;
    const latest=next.startMin-pre-travelToNext-post-durationMinutes;
    if(latest>=earliest&&latest>=SAME_DAY_MIN_START&&earliest<=SAME_DAY_MAX_START){
      windows.push({start:Math.max(earliest,SAME_DAY_MIN_START),end:Math.min(latest,SAME_DAY_MAX_START),position:"between"});
    }
  }

  const last=events[events.length-1];
  const travelFromLast=routed?travelMinutesBetween(last.location||HOME_BASE,target):0;
  const afterStart=last.endMin+post+travelFromLast+pre;
  if(afterStart<=SAME_DAY_MAX_START)windows.push({start:Math.max(afterStart,SAME_DAY_MIN_START),end:SAME_DAY_MAX_START,position:"after"});

  return {windows,events,preliminary:!routed,durationMinutes};
}
function windowsHTML(result){
  if(!result.windows.length)return "<div class='notice time-warning'><strong>No workable second-show start time is currently available.</strong><div class='small' style='margin-top:5px'>That may change if event duration, location, or production timing changes.</div></div>";
  return result.windows.map(w=>"<div class='time-window'><strong>"+clockLabel(w.start)+" to "+clockLabel(w.end)+" start window</strong></div>").join("");
}
function showLimitedDateModal(d){
  pendingLimitedDate=iso(d);
  const r=sameDayWindows(pendingLimitedDate,"","","",90);
  const existing=r.events.map(e=>"<div class='req-item'><strong>"+e.title+"</strong><div class='small'>"+e.start+" to "+e.end+(e.location?" · "+e.location:"")+"</div></div>").join("");
  $("limitedDateTitle").textContent=d.toLocaleDateString(undefined,{weekday:"long",month:"long",day:"numeric",year:"numeric"})+" already has a PA LINE show.";
  $("limitedDateBody").innerHTML=
    "<p>A second booking can still be requested if the full day works safely. Every PA LINE show reserves 2 hours before the performance and 2 hours after it, plus travel time between engagements.</p>"+
    "<div class='req-list'>"+existing+"</div>"+
    "<div style='margin-top:14px'><strong>Preliminary available start window"+(r.windows.length===1?"":"s")+"</strong>"+windowsHTML(r)+"</div>"+
    "<div class='small' style='margin-top:10px'>This first look assumes a 90-minute performance and no travel time yet. Each performance reserves 2 hours before showtime and 2 hours after the performance, then travel is added between venues. After you enter the new venue location and timing, the app recalculates the usable window. Performance start times are never offered before 10:00 AM or after 11:00 PM.</div>";
  $("limitedDateConfirm").disabled=r.windows.length===0;
  $("limitedDateConfirm").textContent=r.windows.length?"REQUEST THIS DATE":"NO SAFE WINDOW";
  $("limitedDateModal").classList.remove("hidden");
}
function closeLimitedDateModal(){$("limitedDateModal").classList.add("hidden");pendingLimitedDate=null}
function confirmLimitedDate(){
  if(!pendingLimitedDate||$("limitedDateConfirm").disabled)return;
  const d=parseDate(pendingLimitedDate);
  state.selectedDate=pendingLimitedDate;state.originalDate=pendingLimitedDate;
  $("exactSelectedText").textContent=d.toLocaleDateString(undefined,{weekday:"long",month:"long",day:"numeric",year:"numeric"});
  $("exactContinue").disabled=false;
  $("exactNotice").classList.remove("hidden");
  $("exactNotice").innerHTML="<strong>Limited same-day availability</strong><div class='small' style='margin-top:5px'>This date already has another PA LINE engagement. Continue to enter your venue and times. The app will calculate whether a safe second-show window remains after reserving 2 hours before and 2 hours after each performance, plus travel time.</div>";
  closeLimitedDateModal();renderCalendar();
}
function sameDayTimingStatus(){
  const events=bookedEventsForDate(state.selectedDate);
  if(!events.length)return {ok:true,limited:false};
  const duration=requestedDurationMinutes();
  const result=sameDayWindows(state.selectedDate,$("eventCity").value.trim(),$("eventState").value.trim(),$("eventZip").value.trim(),duration);
  const start=clockMinutes($("eventStart").value);
  const globalTimeOk=start!=null&&start>=SAME_DAY_MIN_START&&start<=SAME_DAY_MAX_START;
  const windowOk=globalTimeOk&&result.windows.some(w=>start>=w.start&&start<=w.end);
  return {ok:windowOk,limited:true,result,start,globalTimeOk};
}

function renderUniversalShowWindow(){
  const box=$("universalShowWindowTimes");
  if(!box)return;
  const start=clockMinutes($("eventStart").value);
  const end=clockMinutes($("eventEnd").value);
  if(start==null||end==null){
    box.textContent="Choose a start and end time to see the full scheduling window.";
    return;
  }
  let normalizedEnd=end;
  if(normalizedEnd<=start) normalizedEnd+=1440;
  const reservedStart=start-PA_LINE_PRE_SHOW_ALLOWANCE;
  const reservedEnd=normalizedEnd+PA_LINE_POST_SHOW_ALLOWANCE;
  box.innerHTML="Requested performance: <strong>"+clockLabel(start)+" to "+clockLabelWithDay(normalizedEnd)+"</strong><br>Reserved scheduling window before travel: <strong>"+clockLabelWithDay(reservedStart)+" to "+clockLabelWithDay(reservedEnd)+"</strong>";
}

function renderSameDayAvailability(){
  const box=$("limitedAvailabilityBox");if(!box)return true;
  const start=clockMinutes($("eventStart").value);
  const rawEnd=clockMinutes($("eventEnd").value);

  if(start==null||rawEnd==null){
    box.classList.remove("hidden");
    box.classList.add("time-warning");
    box.innerHTML="<strong>Performance times required</strong><div class='small' style='margin-top:5px'>Choose both a start time and an end time so the 2-hour pre-show and 2-hour post-show scheduling allowances can be checked.</div>";
    return false;
  }

  if(start<SAME_DAY_MIN_START||start>SAME_DAY_MAX_START){
    box.classList.remove("hidden");
    box.classList.add("time-warning");
    box.innerHTML="<strong>Start time outside booking hours</strong><div class='small' style='margin-top:5px'>PA LINE performance start times must be between 10:00 AM and 11:00 PM.</div>";
    return false;
  }

  const events=bookedEventsForDate(state.selectedDate);
  if(!events.length){
    box.classList.add("hidden");
    box.classList.remove("time-warning");
    return true;
  }

  box.classList.remove("hidden");
  const status=sameDayTimingStatus(),r=status.result;
  const existing=r.events.map(e=>"<div class='small'>Existing: <strong>"+e.title+"</strong> · "+e.start+" to "+e.end+"</div>").join("");
  box.classList.toggle("time-warning",!status.ok);
  box.innerHTML="<strong>Same-day scheduling check</strong>"+existing+
    "<div class='small' style='margin-top:8px'>Calculated with a 2-hour pre-show allowance and 2-hour post-show allowance for every performance, your requested performance duration, and "+(r.preliminary?"travel still pending":"prototype routed travel time")+".</div>"+
    "<div style='margin-top:8px'><strong>Available performance start window"+(r.windows.length===1?"":"s")+"</strong>"+windowsHTML(r)+"</div>"+
    "<div class='small' style='margin-top:8px'>Requested start: <strong>"+clockLabel(start)+"</strong> · "+(status.ok?"This timing fits the current same-day plan.":"Choose a start time inside one of the available windows.")+"</div>";
  return status.ok;
}

function selectExactDate(d){
  state.selectedDate=iso(d);state.originalDate=state.selectedDate;
  $("exactSelectedText").textContent=d.toLocaleDateString(undefined,{weekday:"long",month:"long",day:"numeric",year:"numeric"});
  $("exactContinue").disabled=false;
  $("exactNotice").classList.remove("hidden");
  $("exactNotice").innerHTML="<strong>Your date is available</strong><div class='small' style='margin-top:5px'>"+(isLongRange(state.selectedDate)?"This is more than 12 months away, so pricing and certain terms may be reviewed reasonably as the event approaches.":"We will keep this as your selected date while you continue.")+"</div>";
  renderCalendar()
}
function continueExact(){if(!state.selectedDate)return;openDetails()}
function setFlexMode(mode){
  $("rangeCard").classList.toggle("selected",mode==="range");$("seasonCard").classList.toggle("selected",mode==="season");
  $("rangePanel").classList.toggle("hidden",mode!=="range");$("seasonPanel").classList.toggle("hidden",mode!=="season");$("flexDetails").classList.remove("hidden");state.flexMode=mode;
  if(mode==="range"&&!$("rangeStart").value){let s=new Date(today);s.setDate(s.getDate()+14);let e=new Date(today);e.setMonth(e.getMonth()+3);$("rangeStart").value=iso(s);$("rangeEnd").value=iso(e)}
}
function setupSeasonYears(){if($("seasonYear").options.length)return;for(let y=today.getFullYear();y<=today.getFullYear()+2;y++)$("seasonYear").add(new Option(y,y))}
function setupWeekdays(){if($("weekdayButtons").children.length)return;["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].forEach((x,i)=>{let b=document.createElement("button");b.className="btn";b.textContent=x;b.onclick=()=>{state.preferredDays.has(i)?state.preferredDays.delete(i):state.preferredDays.add(i);b.classList.toggle("active")};$("weekdayButtons").appendChild(b)})}
function toggleWeekdays(){$("weekdayWrap").classList.toggle("hidden",$("flexLevel").value==="very")}
function flexWindow(){
  if(state.flexMode==="range"){if(!$("rangeStart").value||!$("rangeEnd").value)return null;return[parseDate($("rangeStart").value),parseDate($("rangeEnd").value)]}
  const y=+$("seasonYear").value,s=$("seasonSelect").value;
  if(s==="Winter")return[new Date(y,0,1,12),new Date(y,2,19,12)];
  if(s==="Spring")return[new Date(y,2,20,12),new Date(y,5,20,12)];
  if(s==="Summer")return[new Date(y,5,21,12),new Date(y,8,21,12)];
  return[new Date(y,8,22,12),new Date(y,11,20,12)]
}
function findFlexibleDates(){
  const w=flexWindow(),city=$("flexCity").value.trim(),st=$("flexState").value.trim();if(!w){alert("Choose a date range or season.");return}if(!city||!st){alert("Add city and state.");return}
  const [a,b]=w;if(b<a){alert("End date must be after start date.");return}
  let arr=[],d=new Date(a);for(let i=0;i<800&&d<=b;i++,d.setDate(d.getDate()+1)){const av=availability(d);if(!["available","limited"].includes(av))continue;const r=routeFor(iso(d),city,st,$("flexZip").value);let score=100-r.totalMiles/4-(av==="limited"?35:0);if(state.preferredDays.size){score+=state.preferredDays.has(d.getDay())?15:-15}arr.push({date:new Date(d),route:r,score})}
  arr.sort((x,y)=>y.score-x.score);const top=arr.slice(0,5),box=$("recommendations");box.innerHTML="";
  top.forEach(o=>{let e=document.createElement("div");e.className="rec";e.innerHTML="<h3>"+o.date.toLocaleDateString(undefined,{weekday:"long",month:"long",day:"numeric",year:"numeric"})+"</h3><div class='fit'>"+o.route.fit+"</div><div class='small'>Preview added travel: "+o.route.totalMiles+" miles · "+money(o.route.totalCost)+"</div>";e.onclick=()=>{[...box.children].forEach(x=>x.classList.remove("selected"));e.classList.add("selected");state.selectedDate=iso(o.date);state.originalDate=state.selectedDate;$("flexSelectedText").textContent=o.date.toLocaleDateString(undefined,{weekday:"long",month:"long",day:"numeric",year:"numeric"});$("flexContinue").disabled=false};box.appendChild(e)});
  $("flexResults").classList.remove("hidden")
}
function continueFlexible(){if(state.selectedDate)openDetails()}
function backFromDetails(){showPage(state.source==="exact"?"pageExact":"pageFlexible",state.source==="exact"?"I Know My Date":"I’m Flexible")}
function openDetails(){
  renderAdditionalDates();
  showPage("pageDetails","Event Details");$("eventDate").value=state.selectedDate;$("longRangeNotice").classList.toggle("hidden",!isLongRange(state.selectedDate));
  if(state.source==="flexible"){$("eventVenue").value=$("flexVenue").value;$("eventCity").value=$("flexCity").value;$("eventState").value=$("flexState").value;$("eventZip").value=$("flexZip").value}
  applyReturningProfileToDetails();
  if(state.autoOpenRecurring){state.autoOpenRecurring=false;if($("recurringPanel").classList.contains("hidden"))toggleRecurring();$("recurringFrequency").value="specific";updateRecurringUI();}
  updateBookingBenefits();
  $("detailsLead").textContent=state.source==="exact"?"Your chosen date stays selected. Add the location and we will show optional nearby dates only if they route substantially better.":"Great. We found a route-friendly date. Now give us the show details.";
  updateDetails()
}
["eventVenue","eventCity","eventState","eventZip","eventStart","eventEnd"].forEach(id=>$(id).addEventListener("input",updateDetails));$("performanceLength").addEventListener("change",updateDetails);
function chooseFormat(f){state.format=f;["fmtSolo","fmtDuo","fmtBand"].forEach(id=>$(id).classList.remove("selected"));$(f==="Solo"?"fmtSolo":f==="Duo"?"fmtDuo":"fmtBand").classList.add("selected");updateDetails()}
function updateDetails(){
  if($("eventCity").value.trim()&&$("eventState").value.trim()){
    const r=routeFor(state.selectedDate,$("eventCity").value,$("eventState").value,$("eventZip").value);
    $("routeBox").classList.remove("hidden");
    $("routeBox").innerHTML="<strong>"+r.fit+"</strong><div class='small' style='margin-top:5px'>Route basis: "+escapeHTML(r.inboundOrigin)+" → this venue → "+escapeHTML(r.outboundDestination)+". Preview: "+r.totalMiles+" routed miles · "+r.driveHours.toFixed(1)+" combined drive hours · mileage component "+money(r.mileageCost)+". "+(r.extendedTravelAllowanceApplies?"Because combined driving exceeds 8 hours, one additional base-rate travel allowance will apply.":"Combined driving does not exceed 8 hours, so no additional base-rate travel allowance applies.")+"</div>";
    if(state.source==="exact")renderExactSuggestions(r)
  }else{
    $("routeBox").classList.add("hidden");$("exactSuggestions").classList.add("hidden")
  }
  renderUniversalShowWindow();
  const timingOk=renderSameDayAvailability();
  const ok=state.format&&$("eventVenue").value.trim()&&$("eventCity").value.trim()&&$("eventState").value.trim()&&$("eventStart").value&&$("eventEnd").value&&state.soundProvided!==null&&timingOk;
  $("detailsContinue").disabled=!ok;
  $("detailsSummary").textContent=ok?state.format+" · "+$("eventVenue").value:(timingOk?"Complete venue, format, and sound information":"Choose a start time that fits the available schedule")
}
function renderExactSuggestions(originalRoute){
  const city=$("eventCity").value,st=$("eventState").value,zip=$("eventZip").value,orig=parseDate(state.originalDate||state.selectedDate),arr=[];
  for(let off=-3;off<=3;off++){if(off===0)continue;let d=new Date(orig);d.setDate(d.getDate()+off);if(availability(d)!=="available")continue;let r=routeFor(iso(d),city,st,zip);if(r.totalMiles+15<originalRoute.totalMiles)arr.push({d,r,diff:originalRoute.totalMiles-r.totalMiles})}
  arr.sort((a,b)=>a.r.totalMiles-b.r.totalMiles);$("exactSuggestions").classList.remove("hidden");$("exactSuggestionCards").innerHTML="";
  if(!arr.length){$("exactSuggestionText").textContent="Your selected date is available and there is no clearly better nearby routing option.";return}
  $("exactSuggestionText").textContent="We are happy to make your original date work. These nearby dates may reduce unnecessary travel.";
  arr.slice(0,2).forEach(o=>{let e=document.createElement("div");e.className="rec";e.innerHTML="<strong>"+o.d.toLocaleDateString(undefined,{weekday:"long",month:"long",day:"numeric",year:"numeric"})+"</strong><div class='small'>May reduce routed travel by about "+o.diff+" preview miles.</div>";e.onclick=()=>{state.selectedDate=iso(o.d);$("eventDate").value=state.selectedDate;updateDetails()};$("exactSuggestionCards").appendChild(e)})
}
function setSoundProvided(v){state.soundProvided=v;$("soundYes").classList.toggle("selected",v===true);$("soundNo").classList.toggle("selected",v===false);$("soundPanel").classList.remove("hidden");syncSoundTech();updateDetails()}
function syncSoundTech(){
  if(state.soundProvided===true&&$("houseEngineer").value==="yes"){$("soundGuidance").textContent="House sound and a qualified engineer are listed as provided."}
  else if(state.soundProvided===true&&$("houseEngineer").value==="no"){$("soundTechNeeded").value="yes";$("soundGuidance").textContent="House sound is provided but no engineer is included. A PA LINE sound tech may be required."}
  else if(state.soundProvided===false){$("soundGuidance").textContent="PA LINE will provide sound. Format-based sound fees apply."}
  else{$("soundGuidance").textContent="Confirm whether the venue includes a qualified engineer when possible."}
}
function toggleTruePotential(){$("tpPanel").classList.toggle("hidden");updateTP()}
function monthsUntil(s){let d=parseDate(s);return(d.getFullYear()-today.getFullYear())*12+(d.getMonth()-today.getMonth())+(d.getDate()>=today.getDate()?0:-1)}
const tpOptions=["Horn section","String section","Keys","Additional vocals","Additional percussion","Guest artist","Custom arrangements","Expanded lighting","Custom staging / visuals","Let PA LINE design the lineup"];
tpOptions.forEach(x=>{let l=document.createElement("label");l.className="addon";l.innerHTML="<input type='checkbox' class='tpOpt' value='"+x+"'><span>"+x+"</span>";$("tpAddons").appendChild(l)});
function updateTP(){if($("tpPanel").classList.contains("hidden")){state.truePotential=false;return}const eligible=monthsUntil(state.selectedDate)>=6;$("tpEligibility").innerHTML="<strong>"+(eligible?"Eligible booking window":"6+ months required")+"</strong><div class='small' style='margin-top:5px'>"+(eligible?"This event can be considered for TRUE POTENTIAL.":"This date is too close for TRUE POTENTIAL. Standard booking can still continue.")+"</div>";state.truePotential=eligible&&$("tpAck").checked}

function toggleRecurring(){
  $("recurringPanel").classList.toggle("hidden");
  $("recurringToggleBtn").textContent=$("recurringPanel").classList.contains("hidden")?"ADD MORE DATES":"HIDE ADDITIONAL BOOKING OPTIONS";
  updateRecurringUI();
}

function updateRecurringUI(){
  const auto=$("recurringFrequency").value!=="specific";
  $("recurringSpecificPanel").classList.toggle("hidden",auto);
  $("recurringAutoPanel").classList.toggle("hidden",!auto);
}

function validateAdditionalDate(dateStr){
  if(!dateStr)return {ok:false,msg:"Choose a date first."};
  if(dateStr===state.selectedDate)return {ok:false,msg:"That is already the primary booking date."};
  const d=parseDate(dateStr);
  if(d<today)return {ok:false,msg:"That date is in the past."};
  const av=availability(d);if(!["available","limited"].includes(av))return {ok:false,msg:"That date is currently held or unavailable."};
  if(state.additionalDates.includes(dateStr))return {ok:false,msg:"That date is already included."};
  return {ok:true};
}

function addAdditionalDate(){
  const dateStr=$("additionalDateInput").value;
  const check=validateAdditionalDate(dateStr);
  if(!check.ok){alert(check.msg);return}
  state.additionalDates.push(dateStr);
  state.additionalDates.sort();
  $("additionalDateInput").value="";
  renderAdditionalDates();updateBookingBenefits();
}

function removeAdditionalDate(dateStr){
  state.additionalDates=state.additionalDates.filter(d=>d!==dateStr);
  renderAdditionalDates();updateBookingBenefits();
}

function renderAdditionalDates(){
  const containers=[$("additionalDatesList"),$("generatedDatesList")];
  containers.forEach(box=>{
    if(!box)return;
    box.innerHTML="";
    state.additionalDates.forEach(dateStr=>{
      const row=document.createElement("div");
      row.className="req-item";
      row.style.display="flex";
      row.style.justifyContent="space-between";
      row.style.gap="12px";
      row.style.alignItems="center";
      row.innerHTML="<span>"+parseDate(dateStr).toLocaleDateString(undefined,{weekday:"long",month:"long",day:"numeric",year:"numeric"})+"</span><button class='btn' onclick=\"removeAdditionalDate('"+dateStr+"')\">REMOVE</button>";
      box.appendChild(row);
    });
    if(!state.additionalDates.length)box.innerHTML="<div class='small'>No additional dates added yet.</div>";
  });
}

function addMonthsClamped(date,months){
  const d=new Date(date);
  const originalDay=d.getDate();
  d.setDate(1);
  d.setMonth(d.getMonth()+months);
  const last=new Date(d.getFullYear(),d.getMonth()+1,0).getDate();
  d.setDate(Math.min(originalDay,last));
  return d;
}

function generateRecurringDates(){
  const freq=$("recurringFrequency").value;
  const count=Math.max(1,Math.min(24,+$("recurringCount").value||1));
  const primary=parseDate(state.selectedDate);
  const generated=[];
  for(let i=1;i<=count;i++){
    let d;
    if(freq==="weekly"){d=new Date(primary);d.setDate(d.getDate()+7*i)}
    else if(freq==="biweekly"){d=new Date(primary);d.setDate(d.getDate()+14*i)}
    else if(freq==="monthly"){d=addMonthsClamped(primary,i)}
    else continue;
    const s=iso(d);
    const check=validateAdditionalDate(s);
    if(check.ok)generated.push(s);
  }
  state.additionalDates=[...new Set([...state.additionalDates,...generated])].sort();
  renderAdditionalDates();
  if(!generated.length)alert("No available dates could be generated from that pattern. Try fewer dates or add specific dates.");
}

function recurringSummaryHTML(){
  if($("recurringPanel").classList.contains("hidden")||!state.additionalDates.length)return "";
  const typeLabel=$("recurringType").options[$("recurringType").selectedIndex].text;
  const dates=state.additionalDates.map(d=>parseDate(d).toLocaleDateString(undefined,{month:"short",day:"numeric",year:"numeric"})).join(", ");
  return "<div style='margin-top:10px'><strong>"+typeLabel+"</strong><div class='small'>Additional dates: "+dates+"</div></div>";
}

function openReview(){
  rememberCurrentEventAndVenue();
  const r=routeFor(state.selectedDate,$("eventCity").value,$("eventState").value,$("eventZip").value);
  $("reviewCard").innerHTML="<strong>"+$("eventVenue").value+"</strong>"+($("eventName")?.value.trim()?"<div class='small' style='margin-top:3px'><strong>"+$("eventName").value.trim()+"</strong></div>":"")+"<div>"+parseDate(state.selectedDate).toLocaleDateString(undefined,{weekday:"long",month:"long",day:"numeric",year:"numeric"})+"</div><div class='small'>"+$("eventCity").value+", "+$("eventState").value+" · "+$("eventType").value+" · "+$("eventSetting").value+"</div><div style='margin-top:10px'><strong>"+state.format+"</strong></div><div class='small'>"+$("performanceLength").value+" · "+r.fit+" · sound provided: "+(state.soundProvided?"Yes":"No")+"</div>"+(state.truePotential?"<div style='margin-top:10px'><span class='badge'>TRUE POTENTIAL</span></div>":"")+recurringSummaryHTML();
  showPage("pageReview","Review")
}
function seasonal(dateStr){
  const m=parseDate(dateStr).getMonth(),name=parseDate(dateStr).toLocaleDateString(undefined,{month:"long"});
  if([11,0,1].includes(m))return{mult:.75,label:name+" winter rate, 25% below baseline"};
  if([4,8].includes(m))return{mult:1.25,label:name+" seasonal rate, 25% above baseline"};
  if([5,6,7].includes(m))return{mult:1.4,label:name+" peak-season rate, 40% above baseline"};
  return{mult:1,label:name+" baseline pricing"}
}
function rawBase(fmt,dateStr){const dow=parseDate(dateStr).getDay();if(fmt==="Solo")return[200,200,200,250,250,300,300][dow];if(fmt==="Duo")return[350,350,350,450,450,550,550][dow];return[600,600,600,750,750,1000,1000][dow]}
function soundFee(){if(state.soundProvided)return 0;return state.format==="Solo"?25:state.format==="Duo"?50:250}
function techCost(){const needed=$("soundTechNeeded").value==="yes"||(state.format==="Full PA LINE"&&(state.soundProvided===false||$("houseEngineer").value==="no"));if(!needed)return{fee:0,miles:0,mileage:0,total:0};const miles=Math.max(0,+$("soundTechMiles").value||0),mileage=Math.round(miles*.8);return{fee:150,miles,mileage,total:150+mileage}}

function soundFeeForFormat(fmt){
  if(state.soundProvided)return 0;
  return fmt==="Solo"?25:fmt==="Duo"?50:250;
}
function techCostForFormat(fmt){
  const needed=$("soundTechNeeded").value==="yes"||(fmt==="Full PA LINE"&&(state.soundProvided===false||$("houseEngineer").value==="no"));
  if(!needed)return{fee:0,miles:0,mileage:0,total:0};
  const miles=Math.max(0,+$("soundTechMiles").value||0),mileage=Math.round(miles*.8);
  return{fee:150,miles,mileage,total:150+mileage};
}
function coreQuoteForFormat(fmt){
  if(!state.selectedDate)return null;
  const s=seasonal(state.selectedDate);
  const base=Math.round(rawBase(fmt,state.selectedDate)*s.mult);
  const route=routeFor(state.selectedDate,$("eventCity").value,$("eventState").value,$("eventZip").value);
  const travel=travelChargeForRoute(base,route);
  const sound=soundFeeForFormat(fmt);
  const tech=techCostForFormat(fmt);
  return{base,route,travel,sound,tech,total:base+travel.total+sound+tech.total,season:s};
}
function offeredCoreBreakdown(){
  if(!state.quote)return null;
  const q=state.quote;
  const required=q.total;
  let performance=q.base;
  let coreTotal=required;
  let negotiatedToBudget=false;

  if(!state.truePotential && state.budgetStatus==="fit" && Number(state.budgetAmount)>=required && !state.budgetException){
    coreTotal=Number(state.budgetAmount);
    performance=q.base+(coreTotal-required);
    negotiatedToBudget=coreTotal>required;
  }

  return{
    performance,
    mileage:Number(q.route?.totalCost)||0,
    extendedAllowance:Number(q.extendedTravelAllowance)||0,
    sound:Number(q.sound)||0,
    techFee:Number(q.tech?.fee)||0,
    techMileage:Number(q.tech?.mileage)||0,
    coreTotal,
    requiredInternal:required,
    negotiatedToBudget
  };
}
function clearBookerBudget(){
  state.budgetAmount=null;
  state.budgetStatus="unset";
  state.budgetException=false;
  state.budgetDateFlexRequested=false;
  if($("bookerBudget"))$("bookerBudget").value="";
  updateBudgetFit();
}
function renderBudgetAlternativeCard(id,textId,fmt,budget){
  const card=$(id),text=$(textId);
  if(!card||!text)return;
  const shouldShow=(state.format==="Full PA LINE"&&["Duo","Solo"].includes(fmt))||(state.format==="Duo"&&fmt==="Solo");
  card.classList.toggle("hidden",!shouldShow);
  if(!shouldShow)return;
  const alt=coreQuoteForFormat(fmt);
  const fits=alt&&budget>=alt.total;
  text.innerHTML=(fmt==="Duo"
    ?"A duo lowers the performance and production requirement."
    :"A solo show is the leanest PA LINE booking format.")
    +(fits?" <span class='budget-fit-tag'>LIKELY FITS THIS BUDGET</span>":" <span class='small'>It may still need manual review after routing.</span>");
}
function updateBudgetFit(){
  if(!$("bookerBudget")||!state.quote)return;
  const raw=$("bookerBudget").value.trim();
  const result=$("budgetFitResult"),options=$("budgetOptions"),continueBtn=$("quoteContinue"),guide=$("quoteFinalGuidance");

  if(!raw||Number(raw)<=0){
    state.budgetAmount=null;
    state.budgetStatus="unset";
    state.budgetException=false;
    result.className="budget-result hidden";
    result.innerHTML="";
    options.classList.add("hidden");
    continueBtn.disabled=false;
    guide.textContent="Shown once, immediately before submission";
    return;
  }

  const budget=Math.round(Number(raw));
  state.budgetAmount=budget;

  if(state.truePotential){
    state.budgetStatus="manual";
    state.budgetException=true;
    result.className="budget-result manual";
    result.innerHTML="<strong>Budget noted: "+money(budget)+"</strong><div class='small' style='margin-top:5px'>TRUE POTENTIAL is custom production. We will use this as the working parameter and build the production proposal around it where possible. No fixed performance quote will be attached until PA LINE reviews the scope.</div>";
    options.classList.add("hidden");
    continueBtn.disabled=false;
    guide.textContent="Custom budget review will be attached";
    return;
  }

  const required=state.quote.total;
  if(budget>=required){
    state.budgetStatus="fit";
    state.budgetException=false;
    result.className="budget-result fit";
    result.innerHTML="<strong>That budget looks workable.</strong><div class='small' style='margin-top:5px'>We can build the offered PA LINE package within the budget you gave us. The final offered price will be itemized at Review & Sign. Internal lower pricing thresholds are not displayed as part of a negotiated quote.</div>";
    options.classList.add("hidden");
    continueBtn.disabled=false;
    guide.textContent="A budget-fit package will be itemized at the final step";
  }else{
    state.budgetStatus="short";
    state.budgetException=false;
    result.className="budget-result short";
    result.innerHTML="<strong>We want to try to make this work.</strong><div class='small' style='margin-top:5px'>The current format and routing sit above the working budget you entered. Choose an adjustment below, or keep the current plan and send it to PA LINE for a no-price budget review.</div>";
    options.classList.remove("hidden");
    continueBtn.disabled=true;
    guide.textContent="Choose a budget-fit option or request manual review";
    renderBudgetAlternativeCard("budgetDuoOption","budgetDuoText","Duo",budget);
    renderBudgetAlternativeCard("budgetSoloOption","budgetSoloText","Solo",budget);
  }
}
function applyBudgetFormat(fmt){
  if(!state.budgetAmount)return;
  chooseFormat(fmt);
  openQuote();
  $("bookerBudget").value=state.budgetAmount;
  updateBudgetFit();
  $("budgetFitResult").scrollIntoView({behavior:"smooth",block:"center"});
}
function acceptManualBudgetReview(){
  if(!state.budgetAmount)return;
  state.budgetStatus="manual";
  state.budgetException=true;
  $("budgetOptions").classList.add("hidden");
  $("budgetFitResult").className="budget-result manual";
  $("budgetFitResult").innerHTML="<strong>Budget review requested at "+money(state.budgetAmount)+".</strong><div class='small' style='margin-top:5px'>Keep the current parameters. The final step will carry your budget and requested configuration, but no priced performance quote. PA LINE will be notified that you want us to work within this limitation before a firm offer is issued.</div>";
  $("quoteContinue").disabled=false;
  $("quoteFinalGuidance").textContent="No priced quote · PA LINE budget review requested";
}
function openBudgetFlexibleDates(){
  if(!state.budgetAmount)return;
  state.budgetDateFlexRequested=true;
  state.source="flexible";
  setupSeasonYears();
  setupWeekdays();
  setFlexMode("season");
  $("seasonSelect").value="Winter";
  $("flexVenue").value=$("eventVenue").value;
  $("flexCity").value=$("eventCity").value;
  $("flexState").value=$("eventState").value;
  $("flexZip").value=$("eventZip").value;
  showPage("pageFlexible","Budget-Friendly Dates");
}

function openQuote(){
  if(!state.accountVerified||!state.confidentialityAccepted){continueToSecurePricing();return;}
  const s=seasonal(state.selectedDate),
        rawPerformanceBase=rawBase(state.format,state.selectedDate),
        base=Math.round(rawPerformanceBase*s.mult),
        r=routeFor(state.selectedDate,$("eventCity").value,$("eventState").value,$("eventZip").value),
        sf=soundFee(),
        tc=techCost(),
        travel=travelChargeForRoute(base,r),
        extendedTravelAllowance=travel.extendedAllowance,
        total=base+travel.total+sf+tc.total;

  state.quote={rawPerformanceBase,base,route:r,sound:sf,tech:tc,travel,extendedTravelAllowance,total,season:s};
  state.routeProtection={
    proposedTravelCeiling:travel.total,
    mileageAtRequest:r.totalCost,
    extendedAllowanceAtRequest:travel.extendedAllowance,
    rule:"At confirmation, this travel amount becomes a ceiling. Later surrounding confirmed gigs can reduce it, never increase it."
  };

  const soundLabel=state.soundProvided
    ?"Venue / event sound is provided"
    :"PA LINE sound is included in the final calculation";
  const techLabel=tc.total
    ?"Dedicated PA LINE sound technician is included"
    :"No dedicated PA LINE sound technician currently added";

  $("quoteCard").innerHTML=
    "<div class='price-factor-grid'>"+
      "<div class='price-factor'><span>PERFORMANCE</span><strong>"+escapeHTML(state.format)+"</strong><small>"+escapeHTML(s.label.replace(/,\s*\d+% (below|above) baseline/i,""))+"</small></div>"+
      "<div class='price-factor'><span>ROUTING</span><strong>"+r.totalMiles+" preview miles</strong><small>"+r.driveHours.toFixed(1)+" combined drive hours · "+(r.extendedTravelAllowanceApplies?"additional base-rate travel allowance applies":"no additional base-rate travel allowance")+"</small></div>"+
      "<div class='price-factor'><span>SOUND</span><strong>"+escapeHTML(soundLabel)+"</strong><small>"+escapeHTML(techLabel)+"</small></div>"+
      (state.truePotential?"<div class='price-factor premium-factor'><span>TRUE POTENTIAL</span><strong>Custom production quote</strong><small>Expanded production is quoted separately.</small></div>":"")+
    "</div>";

  renderQuoteBenefits();
  showPage("pageQuote","Pricing");
  if(state.budgetAmount&&$("bookerBudget"))$("bookerBudget").value=state.budgetAmount;
  updateBudgetFit();
}
function setExclusive(v){state.exclusivity=v;$("exNo").classList.toggle("selected",v===false);$("exYes").classList.toggle("selected",v===true);$("exclusivePanel").classList.toggle("hidden",v!==true);$("exContinue").disabled=false;if(v){calcExclusive()}else{state.exclusivityFee=0;$("exSummary").textContent="No exclusivity requested"}}
function calcExclusive(){const r=+$("exRadius").value,b=+$("exBefore").value,a=+$("exAfter").value;let fee=Math.max(100,Math.round((Math.max(0,r-25)*2+Math.max(0,b+a-14)*8)/25)*25);state.exclusivityFee=fee;$("exEstimate").textContent="Preview exclusivity estimate: about "+money(fee)+". Final exclusivity pricing is reviewed manually.";$("exSummary").textContent=r+" miles · "+b+" days before · "+a+" days after"}

const MERCH_PACKAGES={
  none:{label:"No merch",qty:0,total:0},
  rep:{label:"REP THE BAND!",qty:2,total:40,retail:50},
  crew:{label:"GEAR UP THE CREW",qty:4,total:75,retail:100},
  dream:{label:"DREAM TEAM SWAG",minQty:6,unit:20}
};

function openBonusAdditions(){
  renderMerchSelection();
  showPage("pageBonus","Bonus Additions");
}

function selectMerchPackage(key){
  state.merchPackage=key;
  if(key==="rep"){state.merchQty=2;state.merchTotal=40}
  else if(key==="crew"){state.merchQty=4;state.merchTotal=75}
  else if(key==="dream"){
    const qty=Math.max(6,+$("dreamTeamQty").value||6);
    $("dreamTeamQty").value=qty;
    state.merchQty=qty;
    state.merchTotal=qty*20;
  }
  $("merchDetailsPanel").classList.remove("hidden");
  $("dreamQtyField").classList.toggle("hidden",key!=="dream");
  renderMerchSelection();
  updateMerchPackage();
}

function updateMerchPackage(){
  if(state.merchPackage==="none"){
    state.merchQty=0;
    state.merchTotal=0;
    state.merchSizes="";
    state.merchFor="";
    renderMerchSelection();
    return;
  }

  if(state.merchPackage==="dream"){
    const qty=Math.max(6,Math.min(50,+$("dreamTeamQty").value||6));
    state.merchQty=qty;
    state.merchTotal=qty*20;
  }else if(state.merchPackage==="rep"){
    state.merchQty=2;
    state.merchTotal=40;
  }else if(state.merchPackage==="crew"){
    state.merchQty=4;
    state.merchTotal=75;
  }

  state.merchSizes=$("merchSizes").value.trim();
  state.merchFor=$("merchFor").value;
  renderMerchSelection();
}

function renderMerchSelection(){
  ["rep","crew","dream"].forEach(key=>{
    const el=$("merch"+key.charAt(0).toUpperCase()+key.slice(1));
    if(el)el.classList.toggle("selected",state.merchPackage===key);
  });

  if(state.merchPackage==="none"){
    $("merchTotalDisplay").textContent="No merch selected";
    $("merchContinue").disabled=true;
    $("merchDetailsPanel").classList.add("hidden");
    return;
  }

  const p=MERCH_PACKAGES[state.merchPackage];
  const qty=state.merchQty||p.qty||p.minQty||0;
  const regular=qty*25;
  const savings=Math.max(0,regular-state.merchTotal);
  $("merchTotalDisplay").textContent=p.label+" · "+money(state.merchTotal);
  const freeBookerShirt=(state.merchPackage==="dream"&&qty>=10)?1:0;
  const deliveredShirts=qty+freeBookerShirt;
  $("merchSelectedSummary").innerHTML=
    "<strong>"+p.label+"</strong>"+
    "<div class='small' style='margin-top:5px'>"+qty+" paid shirt"+(qty===1?"":"s")+" + "+qty+" sticker"+(qty===1?"":"s")+" + "+qty+" pin"+(qty===1?"":"s")+(freeBookerShirt?" + <strong>1 FREE booker / venue-contact shirt</strong>":"")+".</div>"+
    (savings?"<div class='merch-savings'>SAVE "+money(savings)+" ON PAID SHIRTS + BONUS SWAG"+(freeBookerShirt?" + FREE EXTRA SHIRT":"")+"</div>":"");
  $("merchContinue").disabled=!($("merchSizes").value.trim());
}

function continueWithMerch(){
  updateMerchPackage();
  if($("merchContinue").disabled)return;
  openCheckout();
}

function skipMerchAndContinue(){
  state.merchPackage="none";
  state.merchQty=0;
  state.merchTotal=0;
  state.merchSizes="";
  state.merchFor="";
  renderMerchSelection();
  openCheckout();
}

function merchSummaryHTML(){
  if(!state.merchPackage||state.merchPackage==="none")return "";
  const p=MERCH_PACKAGES[state.merchPackage];
  const freeBookerShirt=(state.merchPackage==="dream"&&state.merchQty>=10)?1:0;
  return "<strong>"+p.label+"</strong>"+
    "<div class='small' style='margin-top:5px'>"+state.merchQty+" paid shirts + matching sticker/pin packs"+(freeBookerShirt?" + 1 free booker / venue-contact shirt":"")+" · "+money(state.merchTotal)+"</div>"+
    "<div class='small'>For: "+(state.merchFor||"Venue / booking team")+" · Sizes: "+(state.merchSizes||"to be confirmed")+"</div>";
}

function setTech(v){state.techCan=v;$("techYes").classList.toggle("selected",v===true);$("techDiscuss").classList.toggle("selected",v===false);$("techIssuePanel").classList.toggle("hidden",v!==false);updateTechContinue()}
function updateTechContinue(){$("techContinue").disabled=!($("techAck").checked&&state.techCan!==null&&(state.techCan===true||$("techIssue").value.trim()))}
function openCheckout(){
  const itemized=offeredCoreBreakdown();
  const budgetLine=state.budgetAmount
    ? "<div class='small' style='margin-top:6px'><strong>Working performance budget:</strong> "+money(state.budgetAmount)+(state.budgetException?" · PA LINE manual budget review requested":" · package appears workable")+"</div>"
    : "";

  let pricingPreview="";
  if(state.truePotential||state.budgetException){
    pricingPreview="<div class='small' style='margin-top:6px'><strong>Pricing:</strong> "+(state.truePotential?"TRUE POTENTIAL custom production quote":"No priced performance quote attached · budget review requested")+"</div>";
  }else{
    pricingPreview="<div class='small' style='margin-top:6px'>Final itemization is intentionally held for Review & Sign.</div>";
  }

  $("checkoutCard").innerHTML="<strong>"+$("eventVenue").value+"</strong>"
    +($("eventName")?.value.trim()?"<div class='small' style='margin-top:3px'><strong>"+$("eventName").value.trim()+"</strong></div>":"")
    +"<div>"+parseDate(state.selectedDate).toLocaleDateString(undefined,{weekday:"long",month:"long",day:"numeric",year:"numeric"})+"</div>"
    +"<div class='small'>"+$("eventCity").value+", "+$("eventState").value+" · "+state.format+"</div>"
    +budgetLine+pricingPreview
    +"<div class='small' style='margin-top:6px'>Exclusivity: "+(state.exclusivity?$("exSummary").textContent:"None")+"</div>"
    +"<div class='small' style='margin-top:6px'>Technical rider: "+(state.techCan?"can be accommodated":"needs discussion")+"</div>"
    +(state.truePotential?"<div style='margin-top:8px'><strong>TRUE POTENTIAL custom quote requested</strong></div>":"")
    +recurringSummaryHTML();

  if(state.merchPackage&&state.merchPackage!=="none"){
    $("checkoutMerchCard").classList.remove("hidden");
    $("checkoutMerchCard").innerHTML="<span class='badge'>BONUS MERCH ADD-ON</span><div style='margin-top:8px'>"+merchSummaryHTML()+"</div>";
  }else{
    $("checkoutMerchCard").classList.add("hidden");
    $("checkoutMerchCard").innerHTML="";
  }

  if(!$("buyerName").value&&state.accountName)$("buyerName").value=state.accountName;
  if(!$("buyerEmail").value&&state.accountEmail)$("buyerEmail").value=state.accountEmail;
  if(!$("buyerOrg").value&&state.accountOrg)$("buyerOrg").value=state.accountOrg;

  showPage("pageCheckout","Checkout Review");
  updateSubmit();
}
function updateSubmit(){
  if(!$("submitBtn"))return;
  const ok=/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test($("buyerEmail").value.trim());
  $("submitBtn").disabled=!($("buyerName").value.trim()&&ok);
}


/* v49 editable legal-document registry */
const LEGAL_DOC_STORE_KEY="PA_LINE_ACTIVE_LEGAL_DOCUMENTS_V1";
const LEGAL_DOC_META={
  agreement:{title:"Performance Agreement",template:"reviewDocAgreement",defaultVersion:"2026.09-v49"},
  nda:{title:"Confidential Pricing & Booking Terms Agreement",template:"reviewDocNDA",defaultVersion:"2026.09-v1"},
  stage:{title:"Stage Plot",template:"reviewDocStage",defaultVersion:"2026.09-v1"},
  tech:{title:"Technical Rider",template:"reviewDocTech",defaultVersion:"2026.09-v1"},
  hospitality:{title:"Personal / Hospitality Rider",template:"reviewDocHospitality",defaultVersion:"2026.09-v1"}
};
let legalAdminReturnPage="pageStart";

function bundledLegalDocument(key){
  const meta=LEGAL_DOC_META[key];
  const template=meta?$(meta.template):null;
  return {
    key,
    title:meta?.title||key,
    version:meta?.defaultVersion||"bundled",
    effectiveDate:"",
    html:template?template.innerHTML:"",
    source:"bundled"
  };
}
function readLegalDocumentStore(){
  try{
    const parsed=JSON.parse(localStorage.getItem(LEGAL_DOC_STORE_KEY)||"{}");
    return parsed&&typeof parsed==="object"?parsed:{};
  }catch(e){return {}}
}
function writeLegalDocumentStore(store){
  try{localStorage.setItem(LEGAL_DOC_STORE_KEY,JSON.stringify(store));return true}catch(e){return false}
}
function sanitizeLegalHTML(input){
  const box=document.createElement("div");
  box.innerHTML=String(input||"");
  box.querySelectorAll("script,iframe,object,embed").forEach(el=>el.remove());
  box.querySelectorAll("*").forEach(el=>{
    [...el.attributes].forEach(a=>{
      if(/^on/i.test(a.name))el.removeAttribute(a.name);
      if(a.name==="srcdoc")el.removeAttribute(a.name);
    });
  });
  return box.innerHTML;
}
function getActiveLegalDocument(key){
  const store=readLegalDocumentStore();
  const override=store[key];
  if(override&&override.html){
    return {...bundledLegalDocument(key),...override,key,source:"admin"};
  }
  return bundledLegalDocument(key);
}
function activeLegalDocumentSnapshot(){
  const out={};
  Object.keys(LEGAL_DOC_META).forEach(key=>{
    const d=getActiveLegalDocument(key);
    out[key]={title:d.title,version:d.version,effectiveDate:d.effectiveDate||"",source:d.source};
  });
  return out;
}
function syncLegalVersionLabels(){
  const map={
    agreement:"reviewVersionAgreement",
    nda:"reviewVersionNDA",
    stage:"reviewVersionStage",
    tech:"reviewVersionTech",
    hospitality:"reviewVersionHospitality"
  };
  Object.entries(map).forEach(([key,id])=>{
    const el=$(id);if(!el)return;
    const d=getActiveLegalDocument(key);
    el.textContent="Active version: "+d.version+(d.effectiveDate?" · effective "+d.effectiveDate:"");
  });
  renderLegalVersionTable();
}
function openLegalAdmin(){
  legalAdminReturnPage=currentVisiblePageId();
  loadLegalAdminDocument();
  syncLegalVersionLabels();
  showPage("pageLegalAdmin","Legal Documents");
}
function closeLegalAdmin(){
  const target=$(legalAdminReturnPage)?legalAdminReturnPage:"pageStart";
  showPage(target,target==="pageStart"?"Start":"Booking");
}
function loadLegalAdminDocument(){
  if(!$("legalAdminDoc"))return;
  const key=$("legalAdminDoc").value;
  const d=getActiveLegalDocument(key);
  $("legalAdminVersion").value=d.version||"";
  $("legalAdminEffective").value=d.effectiveDate||"";
  $("legalAdminTitle").value=d.title||LEGAL_DOC_META[key]?.title||"";
  $("legalAdminContent").value=d.html||"";
  $("legalAdminStatus").textContent=d.source==="admin"?"Loaded active admin version.":"Loaded bundled version.";
}
function unlockResetForChangedLegalDoc(key){
  reviewedDocuments.delete(key);
  const cfg=DOCUMENT_REVIEW_CONFIG[key];
  cfg?.inputs?.forEach(id=>{const el=$(id);if(el){el.checked=false;el.disabled=true}});
  if(key==="nda"){
    state.confidentialityAccepted=false;
    if($("pricingConfAck"))$("pricingConfAck").checked=false;
    if($("pricingConfESign"))$("pricingConfESign").checked=false;
    if($("pricingConfContinue"))$("pricingConfContinue").disabled=true;
  }
  syncDocumentReviewLock(key);
}
function saveLegalAdminDocument(){
  const key=$("legalAdminDoc").value;
  const version=$("legalAdminVersion").value.trim();
  const title=$("legalAdminTitle").value.trim();
  const effectiveDate=$("legalAdminEffective").value;
  const content=$("legalAdminContent").value.trim();
  if(!version||!title||!content){
    $("legalAdminStatus").textContent="Add a version label, title, and document content before saving.";
    return;
  }
  const store=readLegalDocumentStore();
  store[key]={
    title,
    version,
    effectiveDate,
    html:sanitizeLegalHTML(content),
    updatedAt:new Date().toISOString()
  };
  if(!writeLegalDocumentStore(store)){
    $("legalAdminStatus").textContent="This browser could not save the document override.";
    return;
  }
  unlockResetForChangedLegalDoc(key);
  syncLegalVersionLabels();
  $("legalAdminStatus").textContent=title+" "+version+" is now the active version in this browser.";
}
function resetLegalAdminDocument(){
  const key=$("legalAdminDoc").value;
  const store=readLegalDocumentStore();
  delete store[key];
  writeLegalDocumentStore(store);
  unlockResetForChangedLegalDoc(key);
  loadLegalAdminDocument();
  syncLegalVersionLabels();
  $("legalAdminStatus").textContent="Reset to the bundled "+LEGAL_DOC_META[key].title+".";
}
async function importLegalAdminFile(event){
  const file=event.target.files?.[0];
  if(!file)return;
  const text=await file.text();
  $("legalAdminContent").value=text;
  if(!$("legalAdminVersion").value.trim())$("legalAdminVersion").value=new Date().toISOString().slice(0,10)+"-import";
  $("legalAdminStatus").textContent="Imported "+file.name+". Review the content and save a new active version.";
  event.target.value="";
}
function exportLegalDocumentPackage(){
  const docs={};
  Object.keys(LEGAL_DOC_META).forEach(key=>docs[key]=getActiveLegalDocument(key));
  const blob=new Blob([JSON.stringify({exportedAt:new Date().toISOString(),documents:docs},null,2)],{type:"application/json"});
  const url=URL.createObjectURL(blob);
  const a=document.createElement("a");
  a.href=url;a.download="PA_LINE_active_legal_documents.json";a.click();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
}
function renderLegalVersionTable(){
  const box=$("legalVersionTable");if(!box)return;
  box.innerHTML=Object.keys(LEGAL_DOC_META).map(key=>{
    const d=getActiveLegalDocument(key);
    return "<div class='legal-version-row'><div><strong>"+escapeHTML(d.title)+"</strong><small>"+(d.source==="admin"?"Admin version":"Bundled version")+(d.effectiveDate?" · effective "+escapeHTML(d.effectiveDate):"")+"</small></div><strong>"+escapeHTML(d.version)+"</strong></div>";
  }).join("");
}


/* v40 enforce opening + scrolling through each legal document before acknowledgment */
const DOCUMENT_REVIEW_CONFIG={
  agreement:{title:"Performance Agreement",template:"reviewDocAgreement",inputs:["sAck1"],labels:["reviewLabelAgreement"],card:"reviewCardAgreement",button:"reviewBtnAgreement"},
  stage:{title:"Stage Plot",template:"reviewDocStage",inputs:["sAck2"],labels:["reviewLabelStage"],card:"reviewCardStage",button:"reviewBtnStage"},
  tech:{title:"Technical Rider",template:"reviewDocTech",inputs:["sAck3"],labels:["reviewLabelTech"],card:"reviewCardTech",button:"reviewBtnTech"},
  hospitality:{title:"Personal / Hospitality Rider",template:"reviewDocHospitality",inputs:["sAck4"],labels:["reviewLabelHospitality"],card:"reviewCardHospitality",button:"reviewBtnHospitality"},
  nda:{title:"Confidential Pricing & Booking Terms Agreement",template:"reviewDocNDA",inputs:["pricingConfAck","pricingConfESign"],labels:["reviewLabelNDAAck","reviewLabelNDAESign"],card:"reviewCardNDA",button:"reviewBtnNDA"}
};
const reviewedDocuments=new Set();
let activeReviewDocument=null;

function syncDocumentReviewLock(key){
  const cfg=DOCUMENT_REVIEW_CONFIG[key];
  if(!cfg)return;
  const unlocked=reviewedDocuments.has(key);
  cfg.inputs.forEach(id=>{
    const input=$(id);
    if(input)input.disabled=!unlocked;
  });
  cfg.labels.forEach(id=>{
    const label=$(id);
    if(label){
      label.classList.toggle("locked",!unlocked);
      label.classList.toggle("review-ready",unlocked);
    }
  });
  const card=$(cfg.card);
  if(card)card.classList.toggle("review-complete",unlocked);
  const btn=$(cfg.button);
  if(btn&&unlocked){
    btn.textContent="REVIEWED ✓ · OPEN AGAIN";
  }
}
function syncAllDocumentReviewLocks(){
  Object.keys(DOCUMENT_REVIEW_CONFIG).forEach(syncDocumentReviewLock);
}
function openDocumentReview(key){
  const cfg=DOCUMENT_REVIEW_CONFIG[key];
  if(!cfg)return;
  activeReviewDocument=key;
  const doc=getActiveLegalDocument(key);
  $("documentReviewTitle").textContent=doc.title+" · "+doc.version;
  $("documentReviewInstruction").textContent=reviewedDocuments.has(key)
    ?"You already reached the bottom of this active version. You can review it again at any time."
    :"Scroll all the way to the bottom of the active "+doc.version+" version to unlock the related acknowledgment checkbox"+(key==="nda"?"es":"")+".";
  $("documentReviewBody").innerHTML=doc.html||"<p>Document content unavailable.</p>";
  $("documentReviewProgress").textContent=reviewedDocuments.has(key)?"Review requirement already completed.":"Scroll through the document to continue.";
  $("documentReviewProgress").classList.toggle("complete",reviewedDocuments.has(key));
  if($("documentReviewProgressFill"))$("documentReviewProgressFill").style.width=reviewedDocuments.has(key)?"100%":"0%";
  if($("documentReviewCloseBtn"))$("documentReviewCloseBtn").textContent=reviewedDocuments.has(key)?"CLOSE":"CLOSE";
  const scroller=$("documentReviewScroll");
  scroller.scrollTop=0;
  $("documentReviewModal").classList.remove("hidden");
  document.body.style.overflow="hidden";
  requestAnimationFrame(()=>trackDocumentReviewScroll());
}
function closeDocumentReview(){
  $("documentReviewModal").classList.add("hidden");
  document.body.style.overflow="";
  activeReviewDocument=null;
}
function trackDocumentReviewScroll(){
  if(!activeReviewDocument)return;
  const scroller=$("documentReviewScroll");
  const max=Math.max(1,scroller.scrollHeight-scroller.clientHeight);
  const remaining=scroller.scrollHeight-scroller.scrollTop-scroller.clientHeight;
  const pct=Math.max(0,Math.min(100,Math.round((scroller.scrollTop/max)*100)));
  if($("documentReviewProgressFill"))$("documentReviewProgressFill").style.width=pct+"%";
  if(remaining<=12){
    if($("documentReviewProgressFill"))$("documentReviewProgressFill").style.width="100%";
    completeDocumentReview(activeReviewDocument);
  }else if(!reviewedDocuments.has(activeReviewDocument)){
    $("documentReviewProgress").textContent="Reviewed "+pct+"% · keep scrolling to the bottom.";
  }
}
function completeDocumentReview(key){
  if(reviewedDocuments.has(key))return;
  reviewedDocuments.add(key);
  syncDocumentReviewLock(key);
  $("documentReviewProgress").textContent="Review complete ✓ · the acknowledgment is now unlocked.";
  $("documentReviewProgress").classList.add("complete");
  $("documentReviewInstruction").textContent="You reached the bottom. Close this window and complete the highlighted acknowledgment.";
  if($("documentReviewCloseBtn"))$("documentReviewCloseBtn").textContent="CLOSE & ACKNOWLEDGE";
  if(key==="nda")updateConfidentialityGate();
  else updateSharedGate();
}

function finalBookingAmounts(){
  const core=offeredCoreBreakdown();
  const exclusivity=Number(state.exclusivityFee)||0;
  const merch=Number(state.merchTotal)||0;

  if(!core){
    return {performance:0,mileage:0,extendedAllowance:0,sound:0,techFee:0,techMileage:0,exclusivity,merch,total:exclusivity+merch,coreTotal:0};
  }

  return {
    performance:core.performance,
    mileage:core.mileage,
    extendedAllowance:core.extendedAllowance,
    sound:core.sound,
    techFee:core.techFee,
    techMileage:core.techMileage,
    exclusivity,
    merch,
    coreTotal:core.coreTotal,
    negotiatedToBudget:core.negotiatedToBudget,
    total:core.coreTotal+exclusivity+merch
  };
}
function renderFinalPriceConfirmation(){
  const box=$("finalPriceConfirmation");
  if(!box)return;

  if(sharedGateSource!=="booking"){
    box.classList.add("hidden");
    $("sFinalPriceEcho").textContent="";
    return;
  }

  const a=finalBookingAmounts();
  const additional=state.additionalDates?.length||0;
  const totalDates=1+additional;

  box.classList.remove("hidden");
  $("finalRequestDateCount").textContent=totalDates===1
    ? "1 requested performance date"
    : totalDates+" requested performance dates";

  const noPricedPerformance=state.truePotential||state.budgetException;

  if(noPricedPerformance){
    $("finalPriceLabel").textContent=state.budgetException?"Working budget submitted":"Performance package";
    $("finalRequestTotal").textContent=state.budgetException&&state.budgetAmount?money(state.budgetAmount)+" BUDGET":"CUSTOM QUOTE";
  }else{
    $("finalPriceLabel").textContent="Total attached to this booking request";
    $("finalRequestTotal").textContent=money(a.total);
  }

  const rows=[];

  if(state.budgetException){
    rows.push("<div class='budget-review-final'><strong>NO PRICED PERFORMANCE QUOTE ATTACHED</strong><div class='small' style='margin-top:5px'>Working performance budget: <strong>"+money(state.budgetAmount||0)+"</strong>. PA LINE is being asked to review the current date, format, routing, sound, and production parameters and determine whether a workable offer can be built within that limitation.</div></div>");
    rows.push("<div class='final-price-row'><span>Requested format</span><span>"+escapeHTML(state.format||"To be confirmed")+"</span></div>");
    rows.push("<div class='final-price-row'><span>Routing basis</span><span>"+escapeHTML(state.quote?.route?.inboundOrigin||HOME_BASE)+" → venue → "+escapeHTML(state.quote?.route?.outboundDestination||HOME_BASE)+"</span></div>");
    rows.push("<div class='final-price-row'><span>Sound / production</span><span>"+(state.soundProvided?"Venue provided":"PA LINE requested")+"</span></div>");
    if(state.exclusivity)rows.push("<div class='final-price-row'><span>Exclusivity request</span><span>Needs budget review</span></div>");
    if(state.merchPackage&&state.merchPackage!=="none")rows.push("<div class='final-price-row'><span>Merch add-on</span><span>Selected · reviewed separately</span></div>");
    rows.push("<div class='final-price-row total-row'><span>PRICE STATUS</span><span>PA LINE REVIEW REQUIRED</span></div>");
  }else if(state.truePotential){
    rows.push("<div class='final-price-row'><span>TRUE POTENTIAL performance package</span><span>Custom quote</span></div>");
    if(state.budgetAmount)rows.push("<div class='final-price-row'><span>Working performance budget</span><span>"+money(state.budgetAmount)+"</span></div>");
    if(a.exclusivity)rows.push("<div class='final-price-row'><span>Exclusivity</span><span>"+money(a.exclusivity)+"</span></div>");
    if(a.merch)rows.push("<div class='final-price-row'><span>Booking-only merch add-on</span><span>"+money(a.merch)+"</span></div>");
    rows.push("<div class='final-price-row total-row'><span>Known add-ons due with custom quote</span><span>"+money(a.exclusivity+a.merch)+"</span></div>");
  }else{
    rows.push("<div class='final-price-row itemized-detail'><span>Performance fee"+(a.negotiatedToBudget?"<small class='line-note'>Negotiated package within stated working budget</small>":"<small class='line-note'>"+escapeHTML(state.quote?.season?.label||"Current booking rate")+"</small>")+"</span><span>"+money(a.performance)+"</span></div>");
    rows.push("<div class='final-price-row itemized-detail'><span>Routed mileage<small class='line-note'>"+(state.quote?.route?.totalMiles||0)+" routed miles · "+"$"+MILEAGE_RATE.toFixed(2)+"/mile</small></span><span>"+money(a.mileage)+"</span></div>");
    if(a.extendedAllowance){
      rows.push("<div class='final-price-row itemized-detail'><span>Extended-travel allowance<small class='line-note'>One additional base rate because combined inbound + outbound driving exceeds 8 hours</small></span><span>"+money(a.extendedAllowance)+"</span></div>");
    }
    if(a.sound){
      rows.push("<div class='final-price-row itemized-detail'><span>PA LINE sound package</span><span>"+money(a.sound)+"</span></div>");
    }
    if(a.techFee){
      rows.push("<div class='final-price-row itemized-detail'><span>Dedicated sound technician</span><span>"+money(a.techFee)+"</span></div>");
    }
    if(a.techMileage){
      rows.push("<div class='final-price-row itemized-detail'><span>Sound-technician mileage<small class='line-note'>"+(state.quote?.tech?.miles||0)+" miles · "+"$"+(.8).toFixed(2)+"/mile</small></span><span>"+money(a.techMileage)+"</span></div>");
    }
    if(a.exclusivity){
      rows.push("<div class='final-price-row itemized-detail'><span>Exclusivity</span><span>"+money(a.exclusivity)+"</span></div>");
    }
    if(a.merch){
      rows.push("<div class='final-price-row itemized-detail'><span>Booking-only merch add-on</span><span>"+money(a.merch)+"</span></div>");
    }
    rows.push("<div class='final-price-row total-row'><span>FINAL REQUEST TOTAL</span><span>"+money(a.total)+"</span></div>");
  }

  rows.push("<div class='route-protection-final'><strong>TRAVEL PRICE PROTECTION</strong><div class='small'>If PA LINE later confirms a surrounding show that reduces this booking's travel component, the realized savings are applied to this booking. The confirmed travel component cannot increase solely because PA LINE later changes the surrounding route. If the route-improving show came directly through this venue/booker's documented recommendation, the savings are recorded as <strong>ROUTE BUILDER CREDIT</strong>. The affected booking contact then chooses whether the savings are returned / applied to balance, stored as future booking credit, voluntarily reinvested with PA LINE, or split between those outcomes.</div></div>");

  if(additional){
    rows.push("<div class='small' style='margin-top:6px'>This presentation still prices the primary performance as the current quote. Additional recurring dates remain subject to their own date-specific seasonal, routing, travel, sound, and production calculation before final acceptance.</div>");
  }

  $("finalPriceBreakdown").innerHTML=rows.join("");

  if(state.budgetException){
    $("sFinalPriceEcho").textContent="No priced quote is attached. PA LINE will review the request against the "+money(state.budgetAmount||0)+" working budget.";
  }else if(state.truePotential){
    $("sFinalPriceEcho").textContent="Final performance amount will be confirmed by custom quote.";
  }else{
    $("sFinalPriceEcho").textContent="You are requesting an itemized booking currently totaling "+money(a.total)+".";
  }
}

let sharedGateSource="booking";
function prepareSharedDocumentGate(source){
  sharedGateSource=source;
  $("sDate").value=new Date().toISOString().slice(0,10);
  if(source==="booking"){
    if(!$("sName").value)$("sName").value=$("buyerName").value;
    $("sLabel").textContent="Submit booking request";
    $("sSubmit").textContent="SUBMIT BOOKING REQUEST";
  }else{
    if(!$("sName").value)$("sName").value=$("demandName").value;
    $("sLabel").textContent="Submit demand request";
    $("sSubmit").textContent="SUBMIT REQUEST";
  }
  state.legalSnapshot=activeLegalDocumentSnapshot();
  syncLegalVersionLabels();
  showPage("pageDocumentGate","Review & Sign");
  ["agreement","stage","tech","hospitality"].forEach(syncDocumentReviewLock);
  if($("finalConfidentialityStatus")){
    $("finalConfidentialityStatus").classList.toggle("hidden",source!=="booking"||!state.confidentialityAccepted);
  }
  renderFinalPriceConfirmation();
  updateSharedGate();
}
function backFromDocumentGate(){
  showPage(sharedGateSource==="demand"?"pageDemand":"pageCheckout",sharedGateSource==="demand"?"Create Demand":"Checkout Review");
}
function updateSharedGate(){
  const docs=$("sAck1").checked&&$("sAck2").checked&&$("sAck3").checked&&$("sAck4").checked;
  const n=$("sName").value.trim(),sig=$("sSig").value.trim();
  const match=n&&sig&&n.toLowerCase()===sig.toLowerCase();
  const sign=n&&$("sTitle").value.trim()&&$("sDate").value&&match&&$("sConsent").checked;
  const confidentialityOk=sharedGateSource!=="booking"||state.confidentialityAccepted;
  const ok=docs&&sign&&$("sFinal").checked&&confidentialityOk;
  $("sSubmit").disabled=!ok;
  if(sharedGateSource==="booking"){
    const a=finalBookingAmounts();
    $("sSubmit").textContent=(state.truePotential||state.budgetException)
      ? (state.budgetException?"SUBMIT BUDGET REQUEST":"SUBMIT BOOKING REQUEST")
      : "REQUEST BOOKING · "+money(a.total);
  }
  const reviewsComplete=["agreement","stage","tech","hospitality"].every(key=>reviewedDocuments.has(key));
  $("sStatus").textContent=!confidentialityOk?"Complete the Confidential Pricing Agreement first.":!reviewsComplete?"Open each required document and scroll to the bottom to unlock its acknowledgment.":!docs?"Check each highlighted acknowledgment after reviewing the documents.":!sign?"Complete the electronic signature fields.":!$("sFinal").checked?"Confirm the final acknowledgment.":"Everything is complete. Review the final price below, then submit.";
}
function submitShared(){
  if($("sSubmit").disabled)return;
  if(sharedGateSource==="demand") showPage("pageDemandDone","Demand Created");
  else submitBooking();
}

function submitBooking(){
  if($("submitBtn").disabled)return;
  rememberCurrentEventAndVenue();
  rememberContact({name:$("buyerName").value,email:$("buyerEmail").value,phone:$("buyerPhone").value,org:$("buyerOrg").value,venue:$("eventVenue").value});
  const total=finalBookingAmounts().total;
  const pricingStatus=state.budgetException
    ?"Budget review requested at "+money(state.budgetAmount||0)+" · no priced quote attached"
    :state.truePotential
      ?"TRUE POTENTIAL custom quote requested"
      :"Request total: "+money(total);
  $("doneCard").innerHTML="<strong>"+$("buyerName").value+"</strong><div class='small'>"+$("buyerEmail").value+"</div><div style='margin-top:10px'><strong>"+$("eventVenue").value+"</strong></div><div>"+parseDate(state.selectedDate).toLocaleDateString(undefined,{weekday:"long",month:"long",day:"numeric",year:"numeric"})+"</div><div class='small'>"+$("eventCity").value+", "+$("eventState").value+" · "+state.format+"</div><div style='margin-top:10px'><strong>"+pricingStatus+"</strong></div><div class='small'>Inquiry only. No payment has been processed and no contract has been created.</div><div class='small' style='margin-top:8px'><strong>Route price protection:</strong> after confirmation, later route improvements can reduce this booking's travel component but cannot increase it. Documented referrals that create the route-improving confirmed show are tracked for Route Builder Credit.</div>";
  showPage("pageDone","Complete")
}



/* v41 responsive predictive-input helpers */
function paProgrammaticEvent(type){
  const ev=new Event(type,{bubbles:true});
  ev.paAutofill=true;
  return ev;
}
function paNotifyValue(input){
  if(!input)return;
  input.dispatchEvent(paProgrammaticEvent("input"));
  input.dispatchEvent(paProgrammaticEvent("change"));
}
function paSuggestionSuppressed(input){
  return input?.dataset?.paSuppressSuggestions==="1";
}
function paSuppressSuggestionsBriefly(input){
  if(!input)return;
  input.dataset.paSuppressSuggestions="1";
  requestAnimationFrame(()=>requestAnimationFrame(()=>delete input.dataset.paSuppressSuggestions));
}
function closeAllSuggestionLists(except=null){
  document.querySelectorAll(".autocomplete-list").forEach(list=>{
    if(list!==except)list.classList.add("hidden");
  });
}
function setupSuggestionKeyboard(input,list){
  if(input.dataset.paKeyboardReady)return;
  input.dataset.paKeyboardReady="1";
  let active=-1;
  const reset=()=>{
    active=-1;
    list.querySelectorAll(".autocomplete-item").forEach(x=>x.classList.remove("keyboard-active"));
  };
  const move=delta=>{
    const items=[...list.querySelectorAll(".autocomplete-item:not(.nonselectable)")];
    if(!items.length)return;
    active=(active+delta+items.length)%items.length;
    items.forEach((x,i)=>x.classList.toggle("keyboard-active",i===active));
    items[active].scrollIntoView({block:"nearest"});
  };
  input.addEventListener("keydown",e=>{
    if(list.classList.contains("hidden"))return;
    if(e.key==="ArrowDown"){e.preventDefault();move(1)}
    else if(e.key==="ArrowUp"){e.preventDefault();move(-1)}
    else if(e.key==="Escape"){e.preventDefault();list.classList.add("hidden");reset()}
    else if(e.key==="Enter"&&active>=0){
      const items=[...list.querySelectorAll(".autocomplete-item:not(.nonselectable)")];
      const chosen=items[active];
      if(chosen){e.preventDefault();chosen.dispatchEvent(new MouseEvent("mousedown",{bubbles:true}))}
      reset();
    }
  });
  input.addEventListener("input",reset);
}

/* v34 location intelligence
   Built-in routing markets provide instant suggestions.
   Online fallback uses postal-code and geocoding lookups when internet is available. */

const LOCATION_DIRECTORY=[
  {city:"Buffalo",state:"NY",zip:"14202"},
  {city:"Depew",state:"NY",zip:"14043"},
  {city:"Lancaster",state:"NY",zip:"14086"},
  {city:"East Aurora",state:"NY",zip:"14052"},
  {city:"Orchard Park",state:"NY",zip:"14127"},
  {city:"Hamburg",state:"NY",zip:"14075"},
  {city:"West Seneca",state:"NY",zip:"14224"},
  {city:"Cheektowaga",state:"NY",zip:"14225"},
  {city:"Williamsville",state:"NY",zip:"14221"},
  {city:"Amherst",state:"NY",zip:"14226"},
  {city:"Kenmore",state:"NY",zip:"14217"},
  {city:"Tonawanda",state:"NY",zip:"14150"},
  {city:"North Tonawanda",state:"NY",zip:"14120"},
  {city:"Lockport",state:"NY",zip:"14094"},
  {city:"Batavia",state:"NY",zip:"14020"},
  {city:"Rochester",state:"NY",zip:"14604"},
  {city:"Canandaigua",state:"NY",zip:"14424"},
  {city:"Geneva",state:"NY",zip:"14456"},
  {city:"Penn Yan",state:"NY",zip:"14527"},
  {city:"Watkins Glen",state:"NY",zip:"14891"},
  {city:"Hammondsport",state:"NY",zip:"14840"},
  {city:"Burdett",state:"NY",zip:"14818"},
  {city:"Olean",state:"NY",zip:"14760"},
  {city:"Jamestown",state:"NY",zip:"14701"},
  {city:"Bemus Point",state:"NY",zip:"14712"},
  {city:"Mayville",state:"NY",zip:"14757"},
  {city:"Fredonia",state:"NY",zip:"14063"},
  {city:"Dunkirk",state:"NY",zip:"14048"},
  {city:"Syracuse",state:"NY",zip:"13202"},
  {city:"Ithaca",state:"NY",zip:"14850"},
  {city:"Albany",state:"NY",zip:"12207"},
  {city:"Binghamton",state:"NY",zip:"13901"},
  {city:"Erie",state:"PA",zip:"16501"},
  {city:"Pittsburgh",state:"PA",zip:"15222"},
  {city:"Philadelphia",state:"PA",zip:"19107"},
  {city:"Harrisburg",state:"PA",zip:"17101"},
  {city:"State College",state:"PA",zip:"16801"},
  {city:"Scranton",state:"PA",zip:"18503"},
  {city:"Cleveland",state:"OH",zip:"44114"},
  {city:"Akron",state:"OH",zip:"44308"},
  {city:"Columbus",state:"OH",zip:"43215"},
  {city:"Cincinnati",state:"OH",zip:"45202"},
  {city:"Toledo",state:"OH",zip:"43604"},
  {city:"Morgantown",state:"WV",zip:"26505"},
  {city:"Thomas",state:"WV",zip:"26292"},
  {city:"Charleston",state:"WV",zip:"25301"},
  {city:"Frederick",state:"MD",zip:"21701"},
  {city:"Baltimore",state:"MD",zip:"21202"},
  {city:"Richmond",state:"VA",zip:"23219"},
  {city:"Charlottesville",state:"VA",zip:"22902"},
  {city:"Arlington",state:"VA",zip:"22201"},
  {city:"Burlington",state:"VT",zip:"05401"},
  {city:"Boston",state:"MA",zip:"02108"},
  {city:"Hartford",state:"CT",zip:"06103"},
  {city:"Newark",state:"NJ",zip:"07102"},
  {city:"Detroit",state:"MI",zip:"48226"},
  {city:"Ann Arbor",state:"MI",zip:"48104"},
  {city:"Grand Rapids",state:"MI",zip:"49503"},
  {city:"Indianapolis",state:"IN",zip:"46204"},
  {city:"Louisville",state:"KY",zip:"40202"},
  {city:"Nashville",state:"TN",zip:"37201"}
];

const STATE_NAME_TO_CODE={
  "Alabama":"AL","Alaska":"AK","Arizona":"AZ","Arkansas":"AR","California":"CA","Colorado":"CO","Connecticut":"CT",
  "Delaware":"DE","District of Columbia":"DC","Florida":"FL","Georgia":"GA","Hawaii":"HI","Idaho":"ID","Illinois":"IL",
  "Indiana":"IN","Iowa":"IA","Kansas":"KS","Kentucky":"KY","Louisiana":"LA","Maine":"ME","Maryland":"MD","Massachusetts":"MA",
  "Michigan":"MI","Minnesota":"MN","Mississippi":"MS","Missouri":"MO","Montana":"MT","Nebraska":"NE","Nevada":"NV",
  "New Hampshire":"NH","New Jersey":"NJ","New Mexico":"NM","New York":"NY","North Carolina":"NC","North Dakota":"ND",
  "Ohio":"OH","Oklahoma":"OK","Oregon":"OR","Pennsylvania":"PA","Rhode Island":"RI","South Carolina":"SC","South Dakota":"SD",
  "Tennessee":"TN","Texas":"TX","Utah":"UT","Vermont":"VT","Virginia":"VA","Washington":"WA","West Virginia":"WV",
  "Wisconsin":"WI","Wyoming":"WY"
};

const COMMON_STREETS=[
  "Main Street","Broadway","Market Street","Lake Avenue","Transit Road","Elmwood Avenue","Delaware Avenue",
  "Seneca Street","Genesee Street","Pine Street","Washington Street","State Street","Center Street",
  "Church Street","Park Avenue","Mill Street","Water Street","Front Street","Route 5","Route 20","Route 219"
];

const LOCATION_GROUPS=[
  {address:"returnProfileAddress",city:"returnProfileCity",state:"returnProfileState",zip:"returnProfileZip"},
  {city:"flexCity",state:"flexState",zip:"flexZip"},
  {city:"demandCity",state:"demandState",zip:"demandZip"},
  {address:"eventAddress",city:"eventCity",state:"eventState",zip:"eventZip"}
];

function stateCode(value){
  const v=(value||"").trim();
  if(v.length===2)return v.toUpperCase();
  return STATE_NAME_TO_CODE[v]||v.slice(0,2).toUpperCase();
}
function normalizeZip(value){
  const m=String(value||"").match(/\d{5}/);
  return m?m[0]:"";
}
function findGroupByElement(el){
  return LOCATION_GROUPS.find(g=>Object.values(g).some(id=>id&&$(id)===el));
}
function getGroupFields(group){
  return {
    address:group.address?$(group.address):null,
    city:group.city?$(group.city):null,
    state:group.state?$(group.state):null,
    zip:group.zip?$(group.zip):null
  };
}
function markLocationField(input,valid){
  if(!input)return;
  const field=input.closest(".field");
  if(field)field.classList.toggle("location-valid",!!valid);
}
function fireLocationChange(input){paNotifyValue(input)}
function setLocationFields(group,data,{keepAddress=false}={}){
  const f=getGroupFields(group),changed=[];
  const set=(input,value)=>{
    if(!input||value==null||value==="")return;
    const next=String(value);
    if(input.value===next){markLocationField(input,true);return}
    input.value=next;
    markLocationField(input,true);
    paSuppressSuggestionsBriefly(input);
    changed.push(input);
  };
  if(data.address&&f.address&&!keepAddress)set(f.address,data.address);
  if(data.city&&f.city)set(f.city,data.city);
  if(data.state&&f.state)set(f.state,stateCode(data.state));
  if(data.zip&&f.zip)set(f.zip,normalizeZip(data.zip));
  changed.forEach(fireLocationChange);
}
function localCityMatches(query,state){
  const q=(query||"").trim().toLowerCase();
  const st=stateCode(state||"");
  return LOCATION_DIRECTORY.filter(x=>
    (!st||x.state===st) &&
    (!q||x.city.toLowerCase().includes(q)||x.zip.startsWith(q))
  ).slice(0,8);
}
function localZipMatch(zip){
  const z=normalizeZip(zip);
  return LOCATION_DIRECTORY.find(x=>x.zip===z)||null;
}
function ensureLocationList(input){
  let wrap=input.closest(".autocomplete-wrap");
  if(!wrap){
    wrap=document.createElement("div");
    wrap.className="autocomplete-wrap";
    input.parentNode.insertBefore(wrap,input);
    wrap.appendChild(input);
  }
  let list=wrap.querySelector(".autocomplete-list.location-list");
  if(!list){
    list=document.createElement("div");
    list.className="autocomplete-list location-list hidden";
    wrap.appendChild(list);
  }
  return list;
}
function hideLocationList(input){
  const list=input.closest(".autocomplete-wrap")?.querySelector(".location-list");
  if(list)list.classList.add("hidden");
}
function renderLocationItems(input,items,onSelect){
  const list=ensureLocationList(input);
  list.innerHTML="";
  if(document.activeElement!==input||paSuggestionSuppressed(input)||!items.length){
    list.classList.add("hidden");
    return;
  }
  items.slice(0,6).forEach(item=>{
    const row=document.createElement("div");
    row.className="autocomplete-item location-result";
    row.innerHTML="<div class='location-main'><strong>"+escapeHTML(item.primary||"")+"</strong>"+(item.secondary?"<div class='location-sub'>"+escapeHTML(item.secondary)+"</div>":"")+"</div>"+(item.meta?"<div class='location-meta'>"+escapeHTML(item.meta)+"</div>":"");
    row.onmousedown=e=>{
      e.preventDefault();e.stopPropagation();
      paSuppressSuggestionsBriefly(input);
      onSelect(item);
      list.classList.add("hidden");
    };
    list.appendChild(row);
  });
  closeAllSuggestionLists(list);
  list.classList.remove("hidden");
  setupSuggestionKeyboard(input,list);
}
function escapeHTML(s){
  return String(s||"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"}[c]));
}
function debounce(fn,wait=250){
  let t;
  return (...args)=>{clearTimeout(t);t=setTimeout(()=>fn(...args),wait)};
}

async function zipToPlaceRemote(zip){
  const z=normalizeZip(zip);
  if(z.length!==5)return null;
  try{
    const r=await fetch("https://api.zippopotam.us/us/"+encodeURIComponent(z));
    if(!r.ok)return null;
    const data=await r.json();
    const p=data.places&&data.places[0];
    if(!p)return null;
    return {city:p["place name"],state:p["state abbreviation"],zip:z};
  }catch(e){return null}
}
async function cityToZipRemote(city,state){
  const c=(city||"").trim(),st=stateCode(state);
  if(!c||st.length!==2)return null;
  try{
    const r=await fetch("https://api.zippopotam.us/us/"+encodeURIComponent(st)+"/"+encodeURIComponent(c));
    if(!r.ok)return null;
    const data=await r.json();
    const p=data.places&&data.places[0];
    if(!p)return null;
    return {city:c,state:st,zip:p["post code"]};
  }catch(e){return null}
}
async function remoteCitySuggestions(query,state){
  const q=(query||"").trim();
  if(q.length<2)return [];
  try{
    let url="https://photon.komoot.io/api/?limit=7&lang=en&countrycode=US&layer=city&layer=locality&q="+encodeURIComponent(q+(state?" "+stateCode(state):""));
    const r=await fetch(url);
    if(!r.ok)return [];
    const data=await r.json();
    const seen=new Set(),out=[];
    for(const feature of data.features||[]){
      const p=feature.properties||{};
      const city=p.city||p.name||p.locality;
      const st=stateCode(p.state||"");
      if(!city||!st)continue;
      const key=(city+"|"+st+"|"+(p.postcode||"")).toLowerCase();
      if(seen.has(key))continue;seen.add(key);
      out.push({city,state:st,zip:normalizeZip(p.postcode),source:"online"});
    }
    return out.slice(0,7);
  }catch(e){return []}
}
async function remoteAddressSuggestions(query,group){
  const q=(query||"").trim();
  if(q.length<3)return [];
  const f=getGroupFields(group);
  const context=[f.city?.value.trim(),f.state?.value.trim()].filter(Boolean).join(" ");
  try{
    const url="https://photon.komoot.io/api/?limit=7&lang=en&countrycode=US&q="+encodeURIComponent(q+(context?" "+context:""));
    const r=await fetch(url);
    if(!r.ok)return [];
    const data=await r.json();
    const seen=new Set(),out=[];
    for(const feature of data.features||[]){
      const p=feature.properties||{};
      const street=p.street||((p.osm_value==="house"||p.type==="house")?p.name:"");
      const number=p.housenumber||"";
      const address=[number,street].filter(Boolean).join(" ").trim();
      const city=p.city||p.locality||p.district||"";
      const st=stateCode(p.state||"");
      const zip=normalizeZip(p.postcode);
      if(!address||!city)continue;
      const key=(address+"|"+city+"|"+st+"|"+zip).toLowerCase();
      if(seen.has(key))continue;seen.add(key);
      out.push({address,city,state:st,zip,source:"online"});
    }
    return out.slice(0,7);
  }catch(e){return []}
}
function localAddressSuggestions(query,group){
  const q=(query||"").trim();
  if(q.length<2)return [];
  const f=getGroupFields(group);
  const city=f.city?.value.trim()||"";
  const st=stateCode(f.state?.value||"");
  const zip=f.zip?.value.trim()||"";
  const number=(q.match(/^\d+/)||[""])[0];
  const streetQ=q.replace(/^\d+\s*/,"").toLowerCase();
  return COMMON_STREETS
    .filter(s=>!streetQ||s.toLowerCase().includes(streetQ))
    .slice(0,5)
    .map(street=>({
      address:[number,street].filter(Boolean).join(" "),
      city,state:st,zip,source:"built-in"
    }));
}

function setupCityPredictive(input,group){
  if(input.dataset.locationReady)return;
  input.dataset.locationReady="1";
  const list=ensureLocationList(input);
  let requestToken=0;

  const render=debounce(async(allowRemote=true)=>{
    if(paSuggestionSuppressed(input))return;
    const q=input.value.trim();
    if(q.length<2){list.classList.add("hidden");return}
    const stateInput=group.state?$(group.state):null;
    const local=localCityMatches(q,stateInput?.value||"");
    let merged=local.map(x=>({...x,source:"built-in"}));

    if(allowRemote&&q.length>=3&&merged.length<4){
      const token=++requestToken,original=q;
      const remote=await remoteCitySuggestions(q,stateInput?.value||"");
      if(token!==requestToken||input.value.trim()!==original||document.activeElement!==input)return;
      const keys=new Set(merged.map(x=>(x.city+"|"+x.state+"|"+x.zip).toLowerCase()));
      remote.forEach(x=>{
        const k=(x.city+"|"+x.state+"|"+x.zip).toLowerCase();
        if(!keys.has(k)){keys.add(k);merged.push(x)}
      });
    }

    renderLocationItems(input,merged.map(x=>({
      ...x,
      primary:x.city+", "+x.state,
      secondary:x.zip?"ZIP "+x.zip:"ZIP fills when available",
      meta:x.source==="online"?"LOOKUP":"KNOWN"
    })),async item=>{
      setLocationFields(group,item);
      if(!item.zip){
        const found=await cityToZipRemote(item.city,item.state);
        if(found)setLocationFields(group,found);
      }
    });
  },320);

  input.addEventListener("input",e=>{
    if(e.paAutofill||paSuggestionSuppressed(input))return;
    markLocationField(input,false);
    render(true);
  });
  input.addEventListener("focus",()=>render(false));
  input.addEventListener("blur",()=>setTimeout(()=>hideLocationList(input),180));
  input.addEventListener("change",async e=>{
    if(e.paAutofill||paSuggestionSuppressed(input))return;
    const f=getGroupFields(group),value=input.value.trim();
    if(!value)return;
    const exact=LOCATION_DIRECTORY.find(x=>x.city.toLowerCase()===value.toLowerCase()&&(!f.state?.value||x.state===stateCode(f.state.value)));
    if(exact){setLocationFields(group,exact);return}
    if(f.state?.value){
      const found=await cityToZipRemote(value,f.state.value);
      if(found&&input.value.trim()===value)setLocationFields(group,found);
    }
  });
  setupSuggestionKeyboard(input,list);
}
function setupZipLink(input,group){
  if(input.dataset.locationReady)return;
  input.dataset.locationReady="1";
  let requestToken=0;
  const resolveZip=debounce(async()=>{
    if(paSuggestionSuppressed(input))return;
    const zip=normalizeZip(input.value);
    if(zip.length!==5)return;
    const token=++requestToken;
    const local=localZipMatch(zip);
    if(local){setLocationFields(group,local);return}
    const found=await zipToPlaceRemote(zip);
    if(token!==requestToken||normalizeZip(input.value)!==zip)return;
    if(found)setLocationFields(group,found);
  },280);

  input.addEventListener("input",e=>{
    if(e.paAutofill||paSuggestionSuppressed(input))return;
    markLocationField(input,false);
    resolveZip();
  });
  input.addEventListener("blur",()=>{
    if(normalizeZip(input.value).length===5)resolveZip();
  });
}
function setupAddressPredictive(input,group){
  if(input.dataset.locationReady)return;
  input.dataset.locationReady="1";
  const list=ensureLocationList(input);
  let token=0;

  const render=debounce(async(allowRemote=true)=>{
    if(paSuggestionSuppressed(input))return;
    const q=input.value.trim();
    if(q.length<3){list.classList.add("hidden");return}

    const local=localAddressSuggestions(q,group);
    let items=[...local];

    renderLocationItems(input,items.map(x=>({
      ...x,
      primary:x.address,
      secondary:[x.city,x.state,x.zip].filter(Boolean).join(", ").replace(/, ([A-Z]{2}), /,", $1 "),
      meta:"STREET"
    })),item=>setLocationFields(group,item));

    if(allowRemote&&q.length>=4){
      const myToken=++token,original=q;
      const remote=await remoteAddressSuggestions(q,group);
      if(myToken!==token||input.value.trim()!==original||document.activeElement!==input)return;
      if(remote.length){
        const seen=new Set();
        items=[...remote,...local].filter(x=>{
          const k=(x.address+"|"+x.city+"|"+x.state+"|"+x.zip).toLowerCase();
          if(seen.has(k))return false;
          seen.add(k);return true;
        }).slice(0,6);
        renderLocationItems(input,items.map(x=>({
          ...x,
          primary:x.address,
          secondary:[x.city,x.state,x.zip].filter(Boolean).join(", ").replace(/, ([A-Z]{2}), /,", $1 "),
          meta:x.source==="online"?"ADDRESS":"STREET"
        })),item=>setLocationFields(group,item));
      }
    }
  },380);

  input.addEventListener("input",e=>{
    if(e.paAutofill||paSuggestionSuppressed(input))return;
    markLocationField(input,false);
    render(true);
  });
  input.addEventListener("focus",()=>render(false));
  input.addEventListener("blur",()=>setTimeout(()=>hideLocationList(input),180));
  setupSuggestionKeyboard(input,list);
}
function setupLocationIntelligence(){
  LOCATION_GROUPS.forEach(group=>{
    const f=getGroupFields(group);
    if(f.city)setupCityPredictive(f.city,group);
    if(f.zip)setupZipLink(f.zip,group);
    if(f.address)setupAddressPredictive(f.address,group);
    if(f.state&&!f.state.dataset.locationStateReady){
      f.state.dataset.locationStateReady="1";
      f.state.addEventListener("input",e=>{
        f.state.value=f.state.value.toUpperCase().slice(0,2);
        markLocationField(f.state,f.state.value.length===2);
      });
      f.state.addEventListener("change",e=>{
        if(e.paAutofill)return;
        const city=f.city?.value.trim();
        if(city)f.city.dispatchEvent(new Event("change",{bubbles:true}));
      });
    }
  });
}


/* v37 smart venue, booking-contact, and event memory */
const SMART_BOOKING_DB_KEY="PA_LINE_SMART_BOOKING_MEMORY_V1";
let SMART_BOOKING_MEMORY={venues:[],contacts:[],events:[]};

const SMART_SEED_VENUES=[
  {name:"42 North Brewing Company",city:"East Aurora",state:"NY",zip:"14052",source:"PA LINE history"},
  {name:"Two Goats Brewing",address:"5027 State Route 414",city:"Burdett",state:"NY",zip:"14818",source:"Verified venue data"},
  {name:"Laurentide Beer Company",city:"Penn Yan",state:"NY",zip:"14527",source:"PA LINE history"},
  {name:"Keuka Spring Vineyards",city:"Penn Yan",state:"NY",zip:"14527",source:"PA LINE history"},
  {name:"The Landing at Bemus Point",city:"Bemus Point",state:"NY",zip:"14712",source:"PA LINE history"},
  {name:"Bully Hill Vineyards",city:"Hammondsport",state:"NY",zip:"14840",source:"PA LINE history"},
  {name:"Molly Maguire's",city:"Olean",state:"NY",zip:"14760",source:"PA LINE history"},
  {name:"Papi Grande's",city:"Lancaster",state:"NY",zip:"14086",source:"PA LINE history"},
  {name:"16 Ellicott",city:"Depew",state:"NY",zip:"14043",source:"PA LINE history"}
];

const SMART_SEED_EVENTS=[
  {name:"Taste of Buffalo",type:"Festival",city:"Buffalo",state:"NY",source:"PA LINE history"},
  {name:"Olean Irish Festival",type:"Festival",city:"Olean",state:"NY",zip:"14760",source:"PA LINE history"},
  {name:"Kenmore Porchfest",type:"Festival",city:"Kenmore",state:"NY",zip:"14217",source:"PA LINE history"},
  {name:"Music is Art",type:"Festival",city:"Buffalo",state:"NY",source:"PA LINE history"},
  {name:"South Buffalo Irish Festival",type:"Festival",city:"Buffalo",state:"NY",source:"PA LINE history"}
];

function smartClean(value){return String(value||"").trim()}
function smartKey(value){return smartClean(value).toLowerCase()}
function smartUnique(items,keyFn){
  const seen=new Set(),out=[];
  items.forEach(item=>{
    const key=keyFn(item);
    if(!key||seen.has(key))return;
    seen.add(key);out.push(item);
  });
  return out;
}
function loadSmartBookingMemory(){
  try{
    const raw=localStorage.getItem(SMART_BOOKING_DB_KEY);
    if(raw){
      const parsed=JSON.parse(raw);
      if(parsed&&typeof parsed==="object"){
        SMART_BOOKING_MEMORY.venues=Array.isArray(parsed.venues)?parsed.venues:[];
        SMART_BOOKING_MEMORY.contacts=Array.isArray(parsed.contacts)?parsed.contacts:[];
        SMART_BOOKING_MEMORY.events=Array.isArray(parsed.events)?parsed.events:[];
      }
    }
  }catch(e){}
}
function saveSmartBookingMemory(){
  try{localStorage.setItem(SMART_BOOKING_DB_KEY,JSON.stringify(SMART_BOOKING_MEMORY))}catch(e){}
}
function upsertSmart(collection,item,keyFn){
  const key=keyFn(item);
  if(!key)return;
  const idx=collection.findIndex(x=>keyFn(x)===key);
  const stamped={...item,savedAt:Date.now(),source:item.source||"Saved booking"};
  if(idx>=0)collection[idx]={...collection[idx],...stamped};
  else collection.unshift(stamped);
  collection.splice(60);
  saveSmartBookingMemory();
}
function rememberVenue(data){
  const name=smartClean(data?.name);
  if(!name)return;
  upsertSmart(SMART_BOOKING_MEMORY.venues,{
    name,
    address:smartClean(data.address),
    city:smartClean(data.city),
    state:stateCode(data.state),
    zip:normalizeZip(data.zip),
    source:"Saved booking"
  },x=>smartKey(x.name));
}
function rememberContact(data){
  const name=smartClean(data?.name),email=smartClean(data?.email);
  if(!name)return;
  upsertSmart(SMART_BOOKING_MEMORY.contacts,{
    name,email,
    phone:smartClean(data.phone),
    org:smartClean(data.org),
    venue:smartClean(data.venue),
    source:"Saved contact"
  },x=>smartKey(x.email||x.name));
}
function rememberEvent(data){
  const name=smartClean(data?.name);
  if(!name)return;
  upsertSmart(SMART_BOOKING_MEMORY.events,{
    name,
    type:smartClean(data.type),
    setting:smartClean(data.setting),
    attendance:smartClean(data.attendance),
    start:smartClean(data.start),
    end:smartClean(data.end),
    venue:smartClean(data.venue),
    address:smartClean(data.address),
    city:smartClean(data.city),
    state:stateCode(data.state),
    zip:normalizeZip(data.zip),
    source:"Saved event"
  },x=>smartKey(x.name)+"|"+smartKey(x.venue));
}
function rememberCurrentEventAndVenue(){
  const venue={
    name:$("eventVenue")?.value,
    address:$("eventAddress")?.value,
    city:$("eventCity")?.value,
    state:$("eventState")?.value,
    zip:$("eventZip")?.value
  };
  rememberVenue(venue);
  if($("eventName")?.value.trim()){
    rememberEvent({
      name:$("eventName").value,
      type:$("eventType")?.value,
      setting:$("eventSetting")?.value,
      attendance:$("eventAttendance")?.value,
      start:$("eventStart")?.value,
      end:$("eventEnd")?.value,
      venue:$("eventVenue")?.value,
      address:$("eventAddress")?.value,
      city:$("eventCity")?.value,
      state:$("eventState")?.value,
      zip:$("eventZip")?.value
    });
  }
}
function smartRank(items,query,field="name"){
  const q=smartKey(query);
  return items
    .filter(x=>smartKey(x[field]).includes(q))
    .sort((a,b)=>{
      const av=smartKey(a[field]),bv=smartKey(b[field]);
      const as=av.startsWith(q)?0:1,bs=bv.startsWith(q)?0:1;
      if(as!==bs)return as-bs;
      return av.localeCompare(bv);
    });
}
function allSmartVenues(){
  return smartUnique([...SMART_BOOKING_MEMORY.venues,...SMART_SEED_VENUES],x=>smartKey(x.name));
}
function allSmartEvents(){
  return smartUnique([...SMART_BOOKING_MEMORY.events,...SMART_SEED_EVENTS],x=>smartKey(x.name)+"|"+smartKey(x.venue));
}
function allSmartContacts(){
  return smartUnique([...SMART_BOOKING_MEMORY.contacts],x=>smartKey(x.email||x.name));
}
function smartVenueLocationGroup(input){
  const map={
    returnProfileVenue:{address:"returnProfileAddress",city:"returnProfileCity",state:"returnProfileState",zip:"returnProfileZip"},
    flexVenue:{city:"flexCity",state:"flexState",zip:"flexZip"},
    demandVenue:{city:"demandCity",state:"demandState",zip:"demandZip"},
    demandVenue2:{city:"demandCity",state:"demandState",zip:"demandZip"},
    eventVenue:{address:"eventAddress",city:"eventCity",state:"eventState",zip:"eventZip"}
  };
  return map[input.id]||null;
}
function fillVenueSelection(input,item){
  paSuppressSuggestionsBriefly(input);
  input.value=item.name||input.value;
  const group=smartVenueLocationGroup(input);
  if(group)setLocationFields(group,item);
  if(input.id==="eventVenue"&&$("buyerOrg")&&!$("buyerOrg").value)$("buyerOrg").value=item.name||"";
  if(input.id==="buyerOrg"&&$("eventVenue")&&!$("eventVenue").value)$("eventVenue").value=item.name||"";
  if(input.id==="secureAccountOrg"&&$("eventVenue")&&!$("eventVenue").value)$("eventVenue").value=item.name||"";
  paNotifyValue(input);
}
function fillEventSelection(input,item){
  paSuppressSuggestionsBriefly(input);
  input.value=item.name||input.value;
  if(item.type&&$("eventType")){
    const option=[...$("eventType").options].find(o=>o.value.toLowerCase()===item.type.toLowerCase());
    if(option)$("eventType").value=option.value;
  }
  if(item.setting&&$("eventSetting")){
    const option=[...$("eventSetting").options].find(o=>o.value.toLowerCase()===item.setting.toLowerCase());
    if(option)$("eventSetting").value=option.value;
  }
  if(item.attendance&&$("eventAttendance"))$("eventAttendance").value=item.attendance;
  if(item.start&&$("eventStart"))$("eventStart").value=item.start;
  if(item.end&&$("eventEnd"))$("eventEnd").value=item.end;
  if(item.venue&&$("eventVenue")){
    $("eventVenue").value=item.venue;
    paNotifyValue($("eventVenue"));
  }
  setLocationFields({address:"eventAddress",city:"eventCity",state:"eventState",zip:"eventZip"},item);
  ["eventType","eventSetting","eventAttendance","eventStart","eventEnd"].forEach(id=>{
    const el=$(id);if(el)paNotifyValue(el);
  });
  paNotifyValue(input);
}
function fillContactSelection(input,item){
  paSuppressSuggestionsBriefly(input);
  input.value=item.name||input.value;
  const maps={
    buyerName:{email:"buyerEmail",phone:"buyerPhone",org:"buyerOrg"},
    secureAccountName:{email:"secureAccountEmail",org:"secureAccountOrg"},
    demandName:{email:"demandEmail",phone:"demandPhone",org:"demandVenue"}
  };
  const map=maps[input.id]||{};
  const set=(id,value)=>{
    const el=id?$(id):null;
    if(!el||!value)return;
    el.value=value;
    paSuppressSuggestionsBriefly(el);
    paNotifyValue(el);
  };
  set(map.email,item.email);
  set(map.phone,item.phone);
  set(map.org,item.org||item.venue);
  if(input.id==="buyerName"&&item.venue&&$("eventVenue")&&!$("eventVenue").value)set("eventVenue",item.venue);
  paNotifyValue(input);
}
function ensureSmartList(input){
  let wrap=input.closest(".autocomplete-wrap");
  if(!wrap){
    wrap=document.createElement("div");
    wrap.className="autocomplete-wrap";
    input.parentNode.insertBefore(wrap,input);
    wrap.appendChild(input);
  }
  let list=wrap.querySelector(".autocomplete-list.smart-autofill-list");
  if(!list){
    list=document.createElement("div");
    list.className="autocomplete-list smart-autofill-list hidden";
    wrap.appendChild(list);
  }
  return list;
}
function renderSmartList(input,items,type,onSelect){
  const list=ensureSmartList(input);
  list.innerHTML="";
  if(document.activeElement!==input||paSuggestionSuppressed(input)||!items.length){
    list.classList.add("hidden");
    return;
  }
  items.slice(0,6).forEach(item=>{
    const row=document.createElement("div");
    row.className="autocomplete-item";
    let title="",sub="",tag="";
    if(type==="venue"){
      title=item.name;
      sub=[item.address,item.city,item.state,item.zip].filter(Boolean).join(", ");
      tag=item.source==="Online venue lookup"?"LOOKUP":item.source==="Saved booking"?"SAVED":"KNOWN";
    }else if(type==="contact"){
      title=item.name;
      sub=[item.org||item.venue,item.email,item.phone].filter(Boolean).join(" · ");
      tag="SAVED";
    }else{
      title=item.name;
      sub=[item.venue,item.city,item.state,item.type].filter(Boolean).join(" · ");
      tag=item.source==="Saved event"?"SAVED":"KNOWN";
    }
    row.innerHTML="<div class='smart-main'><div class='smart-title'>"+escapeHTML(title)+"</div>"+(sub?"<div class='smart-sub'>"+escapeHTML(sub)+"</div>":"")+"</div><span class='smart-tag'>"+escapeHTML(tag)+"</span>";
    row.onmousedown=e=>{
      e.preventDefault();e.stopPropagation();
      paSuppressSuggestionsBriefly(input);
      onSelect(item);
      list.classList.add("hidden");
    };
    list.appendChild(row);
  });
  closeAllSuggestionLists(list);
  list.classList.remove("hidden");
  setupSuggestionKeyboard(input,list);
}
async function remoteVenueSuggestionsSmart(query,input){
  const q=smartClean(query);
  if(q.length<3)return [];
  const group=smartVenueLocationGroup(input);
  let context="";
  if(group){
    const f=getGroupFields(group);
    context=[f.city?.value,f.state?.value].filter(Boolean).join(" ");
  }
  try{
    const url="https://photon.komoot.io/api/?limit=8&lang=en&countrycode=US&q="+encodeURIComponent(q+(context?" "+context:""));
    const r=await fetch(url);
    if(!r.ok)return [];
    const data=await r.json();
    const out=[],seen=new Set();
    for(const feature of data.features||[]){
      const p=feature.properties||{};
      const name=smartClean(p.name);
      if(!name)continue;
      const city=smartClean(p.city||p.locality||p.district);
      const state=stateCode(p.state||"");
      const address=[p.housenumber,p.street].filter(Boolean).join(" ").trim();
      const zip=normalizeZip(p.postcode);
      const key=smartKey(name)+"|"+smartKey(city)+"|"+zip;
      if(seen.has(key))continue;seen.add(key);
      out.push({name,address,city,state,zip,source:"Online venue lookup"});
    }
    return out.slice(0,8);
  }catch(e){return []}
}
async function enrichVenueSelection(input,item){
  fillVenueSelection(input,item);
  if(item.address&&item.city&&item.zip)return;

  const remote=await remoteVenueSuggestionsSmart(item.name,input);
  const best=remote.find(x=>smartKey(x.name)===smartKey(item.name))||remote[0];
  if(!best)return;

  /*
    Remote place data may fill blanks, but must never overwrite known venue
    city/state/ZIP/address values already stored in PA LINE's venue record.
  */
  const enriched={
    ...best,
    ...item,
    name:item.name,
    address:item.address||best.address||"",
    city:item.city||best.city||"",
    state:item.state||best.state||"",
    zip:item.zip||best.zip||""
  };
  fillVenueSelection(input,enriched);
}
function setupSmartAutocompleteInput(input){
  if(input.dataset.smartReady)return;
  input.dataset.smartReady="1";
  const type=input.dataset.smartAutocomplete;
  const list=ensureSmartList(input);
  let token=0;

  const render=debounce(async(allowRemote=true)=>{
    if(paSuggestionSuppressed(input))return;
    const q=input.value.trim();
    if(q.length<2){list.classList.add("hidden");return}

    if(type==="contact"){
      renderSmartList(input,smartRank(allSmartContacts(),q),"contact",item=>fillContactSelection(input,item));
      return;
    }
    if(type==="event"){
      renderSmartList(input,smartRank(allSmartEvents(),q),"event",item=>fillEventSelection(input,item));
      return;
    }

    let matches=smartRank(allSmartVenues(),q);
    renderSmartList(input,matches,"venue",item=>enrichVenueSelection(input,item));

    if(allowRemote&&q.length>=4&&matches.length<4){
      const currentToken=++token,original=q;
      const remote=await remoteVenueSuggestionsSmart(q,input);
      if(currentToken!==token||input.value.trim()!==original||document.activeElement!==input)return;
      const keys=new Set(matches.map(x=>smartKey(x.name)+"|"+smartKey(x.city)));
      remote.forEach(x=>{
        const k=smartKey(x.name)+"|"+smartKey(x.city);
        if(!keys.has(k)){keys.add(k);matches.push(x)}
      });
      renderSmartList(input,matches,"venue",item=>enrichVenueSelection(input,item));
    }
  },type==="venue"?420:120);

  input.addEventListener("input",e=>{
    if(e.paAutofill||paSuggestionSuppressed(input))return;
    render(true);
  });
  input.addEventListener("focus",()=>render(false));
  input.addEventListener("blur",()=>setTimeout(()=>list.classList.add("hidden"),180));
  setupSuggestionKeyboard(input,list);
}
function setupSmartBookingAutofill(){
  loadSmartBookingMemory();
  document.querySelectorAll("[data-smart-autocomplete]").forEach(setupSmartAutocompleteInput);
}

const AUTOCOMPLETE_DATA={
  venue:[
    "Festival","Brewery","Winery","Music venue","Private residence","Wedding venue",
    "Corporate event","Community event","Irish festival","Arts festival","Concert series",
    "Town park","Public park","Theater","Bar / restaurant","Taproom","Distillery","Hotel ballroom"
  ],
  city:[
    "Buffalo","Depew","Lancaster","East Aurora","Orchard Park","Hamburg","West Seneca","Cheektowaga",
    "Williamsville","Amherst","Kenmore","Tonawanda","North Tonawanda","Lockport","Batavia","Rochester",
    "Canandaigua","Geneva","Penn Yan","Watkins Glen","Hammondsport","Olean","Jamestown","Bemus Point",
    "Mayville","Erie","Syracuse","Ithaca","Fredonia","Dunkirk"
  ],
  state:[
    "NY","PA","OH","WV","MD","VA","VT","MA","CT","NJ","MI","IN","KY","TN"
  ],
  address:[
    "Main Street","Broadway","Market Street","Lake Avenue","Transit Road","Elmwood Avenue",
    "Delaware Avenue","Seneca Street","Genesee Street"
  ],
  timing:[
    "Strict curfew","Festival changeover","Ceremony before performance","Opener before PA LINE",
    "Early load-in required","Soundcheck before doors","Multiple sets","One continuous set",
    "Private event timeline","Flexible performance window"
  ],
  sound:[
    "House PA provided","House engineer provided","PA LINE to provide full sound",
    "Subwoofers available","Monitors available","Digital console available","Festival production provided",
    "Shared backline","Short changeover","Dedicated soundcheck available","Outdoor PA required"
  ],
  creative:[
    "Horn section","String section","Additional vocals","Keys","Guest artist","Custom arrangements",
    "Expanded lighting","Custom staging","Visual production","Additional percussion",
    "Let PA LINE design the lineup","Special encore","Event-specific arrangement"
  ]
};

function setupAutocomplete(){
  document.querySelectorAll("[data-autocomplete]").forEach(input=>{
    if(input.dataset.smartAutocomplete)return;
    if(input.dataset.locationRole==="city"||input.dataset.locationRole==="address"||input.dataset.locationRole==="zip")return;
    if(input.dataset.autocompleteReady)return;
    input.dataset.autocompleteReady="1";

    const wrap=document.createElement("div");
    wrap.className="autocomplete-wrap";
    input.parentNode.insertBefore(wrap,input);
    wrap.appendChild(input);
    const list=document.createElement("div");
    list.className="autocomplete-list hidden";
    wrap.appendChild(list);

    const render=()=>{
      if(paSuggestionSuppressed(input))return;
      const key=input.dataset.autocomplete;
      const q=input.value.trim().toLowerCase();
      const base=AUTOCOMPLETE_DATA[key]||[];
      if(q.length<2){list.classList.add("hidden");list.innerHTML="";return}
      const matches=base.filter(x=>x.toLowerCase().includes(q)).slice(0,5);
      list.innerHTML="";
      if(document.activeElement!==input||!matches.length){list.classList.add("hidden");return}
      matches.forEach(text=>{
        const item=document.createElement("div");
        item.className="autocomplete-item";
        const idx=text.toLowerCase().indexOf(q);
        item.innerHTML=idx>=0
          ? escapeHTML(text.slice(0,idx))+"<strong>"+escapeHTML(text.slice(idx,idx+q.length))+"</strong>"+escapeHTML(text.slice(idx+q.length))
          : escapeHTML(text);
        item.onmousedown=e=>{
          e.preventDefault();e.stopPropagation();
          paSuppressSuggestionsBriefly(input);
          input.value=text;
          list.classList.add("hidden");
          paNotifyValue(input);
        };
        list.appendChild(item);
      });
      closeAllSuggestionLists(list);
      list.classList.remove("hidden");
      setupSuggestionKeyboard(input,list);
    };

    input.addEventListener("input",e=>{
      if(e.paAutofill||paSuggestionSuppressed(input))return;
      render();
    });
    input.addEventListener("focus",render);
    input.addEventListener("blur",()=>setTimeout(()=>list.classList.add("hidden"),180));
    setupSuggestionKeyboard(input,list);
  });
}
setupAutocomplete();setupAutocomplete();
setupLocationIntelligence();
setupSmartBookingAutofill();



/* v32 unified interaction system + deterministic PA LINE date picker */
let activeCustomDateInput=null;
let customPickerViewMonth=null;

function localDateString(d){
  return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");
}
function dateFromInputValue(value){
  if(!value)return null;
  const p=value.split("-").map(Number);
  if(p.length!==3||p.some(Number.isNaN))return null;
  return new Date(p[0],p[1]-1,p[2],12);
}
function dateWithinInputBounds(input,dateStr){
  if(input.min&&dateStr<input.min)return false;
  if(input.max&&dateStr>input.max)return false;
  return true;
}
function openCustomDatePicker(input){
  if(!input||input.disabled)return;
  activeCustomDateInput=input;
  const chosen=dateFromInputValue(input.value);
  const fallback=new Date();
  const basis=chosen||fallback;
  customPickerViewMonth=new Date(basis.getFullYear(),basis.getMonth(),1,12);
  renderCustomDatePicker();
  $("customDatePicker").classList.remove("hidden");
}
function closeCustomDatePicker(){
  $("customDatePicker").classList.add("hidden");
  activeCustomDateInput=null;
}
function moveCustomDatePicker(delta){
  if(!customPickerViewMonth)return;
  customPickerViewMonth.setMonth(customPickerViewMonth.getMonth()+delta);
  renderCustomDatePicker();
}
function chooseTodayForCustomPicker(){
  if(!activeCustomDateInput)return;
  const d=localDateString(new Date());
  if(dateWithinInputBounds(activeCustomDateInput,d))selectCustomPickerDate(d);
}
function selectCustomPickerDate(dateStr){
  if(!activeCustomDateInput||!dateWithinInputBounds(activeCustomDateInput,dateStr))return;
  activeCustomDateInput.value=dateStr;
  activeCustomDateInput.dispatchEvent(new Event("input",{bubbles:true}));
  activeCustomDateInput.dispatchEvent(new Event("change",{bubbles:true}));
  closeCustomDatePicker();
}
function renderCustomDatePicker(){
  if(!activeCustomDateInput||!customPickerViewMonth)return;
  const month=$("customDatePickerMonth");
  month.innerHTML="";
  $("customDatePickerTitle").textContent=customPickerViewMonth.toLocaleDateString(undefined,{month:"long",year:"numeric"});

  ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].forEach(function(name){
    const el=document.createElement("div");
    el.className="custom-date-picker-dow";
    el.textContent=name;
    month.appendChild(el);
  });

  const y=customPickerViewMonth.getFullYear();
  const m=customPickerViewMonth.getMonth();
  const firstDay=new Date(y,m,1,12).getDay();
  const count=new Date(y,m+1,0,12).getDate();
  const selected=activeCustomDateInput.value;
  const todayStr=localDateString(new Date());

  for(let i=0;i<firstDay;i++){
    const blank=document.createElement("div");
    blank.className="custom-date-picker-blank";
    month.appendChild(blank);
  }

  for(let day=1;day<=count;day++){
    const d=new Date(y,m,day,12);
    const value=localDateString(d);
    const btn=document.createElement("button");
    btn.type="button";
    btn.className="custom-date-picker-day";
    btn.textContent=String(day);
    btn.disabled=!dateWithinInputBounds(activeCustomDateInput,value);
    if(value===selected)btn.classList.add("selected");
    if(value===todayStr)btn.classList.add("today");
    btn.addEventListener("click",function(){selectCustomPickerDate(value)});
    month.appendChild(btn);
  }
}

document.addEventListener("click",function(event){
  if(event.target.id==="customDatePicker"){
    closeCustomDatePicker();
    return;
  }
  if(event.target.closest(".autocomplete-list,.autocomplete-item"))return;

  const field=event.target.closest(".field");
  if(!field)return;
  if(event.target.closest("button,a"))return;

  const dateInput=field.querySelector('input[type="date"]:not(:disabled)');
  if(dateInput){
    event.preventDefault();
    openCustomDatePicker(dateInput);
    return;
  }

  if(event.target.closest("input,select,textarea"))return;
  const control=field.querySelector("input:not(:disabled),select:not(:disabled),textarea:not(:disabled)");
  if(!control)return;
  try{control.focus({preventScroll:true})}catch(e){control.focus()}
  const type=(control.type||"").toLowerCase();
  if(type==="checkbox"||type==="radio")control.click();
  else if(control.tagName==="SELECT"){
    try{if(typeof control.showPicker==="function")control.showPicker()}catch(e){}
  }
});

document.addEventListener("DOMContentLoaded",function(){
  syncLegalVersionLabels();
  document.querySelectorAll(".choice[onclick],.rec[onclick],.day[onclick],[onclick].addon").forEach(function(el){
    if(!el.hasAttribute("tabindex"))el.setAttribute("tabindex","0");
    if(!el.hasAttribute("role"))el.setAttribute("role","button");
  });

  document.querySelectorAll('input[type="date"]').forEach(function(input){
    input.classList.add("custom-date-input");
    input.readOnly=true;

    const field=input.closest(".field");
    if(!field||field.querySelector(".date-picker-button"))return;

    const button=document.createElement("button");
    button.type="button";
    button.className="date-picker-button";
    button.setAttribute("aria-label","Open date picker");
    button.setAttribute("title","Choose date");
    button.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2"></rect><path d="M16 3v4M8 3v4M3 10h18"></path><path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01"></path></svg>';
    button.addEventListener("click",function(event){
      event.preventDefault();
      event.stopPropagation();
      openCustomDatePicker(input);
    });
    field.appendChild(button);

    input.addEventListener("click",function(event){
      event.preventDefault();
      openCustomDatePicker(input);
    });
  });
});

document.addEventListener("keydown",function(event){
  if(event.key==="Escape"&&!$("customDatePicker").classList.contains("hidden")){
    closeCustomDatePicker();
    return;
  }
  if(event.key!=="Enter"&&event.key!==" ")return;
  const el=event.target.closest('[role="button"][onclick]');
  if(!el||el.matches("button,a,input,select,textarea"))return;
  event.preventDefault();
  el.click();
});


document.addEventListener("click",function(event){
  if(event.target.id==="documentReviewModal")closeDocumentReview();
});
document.addEventListener("keydown",function(event){
  if(event.key==="Escape"&&!$("documentReviewModal").classList.contains("hidden")){
    closeDocumentReview();
  }
});


document.addEventListener("mousedown",function(event){
  if(!event.target.closest(".autocomplete-wrap"))closeAllSuggestionLists();
});
