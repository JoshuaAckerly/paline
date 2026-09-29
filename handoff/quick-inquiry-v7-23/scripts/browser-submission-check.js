(()=>{
 const results=[],alerts=[],originalAlert=window.alert;
 window.alert=m=>alerts.push(m);
 const check=(name,ok)=>{results.push({name,pass:!!ok});if(!ok)throw Error(name)};
 const val=(id,v)=>document.getElementById(id).value=v;
 const sign=()=>{['agreement','stage','tech','hospitality'].forEach(k=>reviewedDocuments.add(k));['sAck1','sAck2','sAck3','sAck4','sConsent','sFinal'].forEach(id=>document.getElementById(id).checked=true);val('sName','Bug Test');val('sSig','Bug Test');val('sTitle','Booker');val('sDate','2026-09-23');updateSharedGate()};
 try{
  goExact();selectExactDate(parseDate('2027-02-01'));continueExact();
  val('buyerName','Bug Test');val('buyerEmail','bug@example.com');val('buyerPhone','555-0100');val('eventVenue','Test Hall');val('eventCity','Buffalo');val('eventState','NY');val('eventAttendance','125');state.format='Solo';state.confidentialityAccepted=true;
  document.getElementById('submitBtn').disabled=false;prepareSharedDocumentGate('booking');sign();
  const originalSubmit=PALineBridge.submitBooking,before=PALineBridge.listBookings().length;
  PALineBridge.submitBooking=()=>{throw Error('quota')};document.getElementById('sSubmit').click();
  check('detailed failure preserves review page',currentVisiblePageId()==='pageDocumentGate'&&PALineBridge.listBookings().length===before);
  PALineBridge.submitBooking=originalSubmit;document.getElementById('sSubmit').click();
  let saved=PALineBridge.listBookings()[0];
  check('detailed contact and lineup retained',saved.contactName==='Bug Test'&&saved.contactEmail==='bug@example.com'&&saved.contactPhone==='555-0100'&&saved.lineupId==='solo'&&saved.attendanceProvided===125);
  document.getElementById('sSubmit').click();check('detailed cannot submit twice',PALineBridge.listBookings().length===before+1);
  goDemand();val('demandCity','Buffalo');val('demandState','NY');val('demandName','Bug Test');val('demandEmail','demand-bug@example.com');setDemandRole('fan');updateDemandState();
  const demandBefore=PALineBridge.listDemands().length;submitDemand();
  check('demand not saved before review',PALineBridge.listDemands().length===demandBefore&&currentVisiblePageId()==='pageDocumentGate');
  sign();const originalDemand=PALineBridge.submitDemand;PALineBridge.submitDemand=()=>{throw Error('quota')};document.getElementById('sSubmit').click();
  check('demand failure stays on review',currentVisiblePageId()==='pageDocumentGate');
  PALineBridge.submitDemand=originalDemand;document.getElementById('sSubmit').click();document.getElementById('sSubmit').click();
  check('demand saved once after signature',currentVisiblePageId()==='pageDemandDone'&&PALineBridge.listDemands().length===demandBefore+1);
  openSpecialBookingChannel();specialBookingType='other_custom';val('specialCustomType','Workshop');val('specialCustomRole','Music');val('specialContactName','Bug Test');val('specialContactEmail','bad-email');val('specialOrganization','Test Org');
  const specialBefore=PALineBridge.listBookings().length;submitSpecialBooking();check('special invalid email rejected',PALineBridge.listBookings().length===specialBefore);
  val('specialContactEmail','special-bug@example.com');PALineBridge.submitBooking=()=>{throw Error('quota')};submitSpecialBooking();check('special save failure keeps retry enabled',!document.getElementById('specialSubmitBtn').disabled&&PALineBridge.listBookings().length===specialBefore);
  PALineBridge.submitBooking=originalSubmit;submitSpecialBooking();submitSpecialBooking();check('special saves once',PALineBridge.listBookings().length===specialBefore+1);
  return JSON.stringify({results,alerts});
 }catch(e){return JSON.stringify({results,error:e.stack})}finally{window.alert=originalAlert}
})()
