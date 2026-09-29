(()=>{
 const results=[],alerts=[],oldAlert=window.alert;
 const assert=(name,ok)=>{results.push({name,pass:!!ok});if(!ok)throw Error(name)};
 const val=(id,v)=>document.getElementById(id).value=v;
 window.alert=m=>alerts.push(m);
 try{
  goExact();moveMonth(1);
  assert('full next-month calendar',document.querySelectorAll('#calendar [data-date]').length===new Date(viewMonth.getFullYear(),viewMonth.getMonth()+1,0).getDate());
  const held=[...demoHeld][0];showUnavailableAlternatives(parseDate(held));
  assert('nearby alternatives',document.querySelectorAll('[data-alt-date]').length>0);
  document.getElementById('keepUnavailableDate').click();continueExact();
  assert('fixed unavailable date retained',state.selectedDate===held&&currentVisiblePageId()==='pageInquiry');
  val('inquiryCity','Buffalo');val('inquiryState','NY');val('inquiryBudget','Less than $300');val('inquiryName','Regression Tester');val('inquiryEmail','invalid');
  const before=PALineBridge.listBookings().length;
  submitQuickInquiry();assert('invalid email rejected',PALineBridge.listBookings().length===before&&currentVisiblePageId()==='pageInquiry');
  val('inquiryEmail','regression@example.com');val('inquiryPreferred','Text');val('inquiryPhone','');submitQuickInquiry();
  assert('phone required for text',PALineBridge.listBookings().length===before);
  val('inquiryPreferred','Email');val('inquiryTiming','Weekends preferred');val('inquiryNotes','Regression inquiry notes');
  const submit=PALineBridge.submitBooking;PALineBridge.submitBooking=()=>{throw Error('simulated quota failure')};
  submitQuickInquiry();PALineBridge.submitBooking=submit;
  assert('save failure stays on form',currentVisiblePageId()==='pageInquiry'&&PALineBridge.listBookings().length===before);
  submitQuickInquiry();
  const saved=PALineBridge.listBookings()[0];
  assert('exact inquiry saved',currentVisiblePageId()==='pageInquiryDone'&&saved.date===held&&saved.bookingStep===1);
  assert('budget and timing preserved',saved.adminNotes.includes('Less than $300')&&saved.adminNotes.includes('Weekends preferred'));
  assert('no fabricated show time or format',saved.start===''&&saved.end===''&&saved.lineupId==='');
  for(const [name,fn] of [['demand',goDemand],['returning',openReturningAccess],['special',openSpecialBookingChannel]]){
   fn();submitQuickInquiry();assert(name+' inquiry saved',currentVisiblePageId()==='pageInquiryDone'&&PALineBridge.listBookings()[0].raw.source===name&&PALineBridge.listBookings()[0].date==='');
  }
  goFlexible();setFlexMode('range');val('flexCity','Buffalo');val('flexState','NY');findFlexibleDates();
  assert('flexible recommendations',document.querySelectorAll('#recommendations .rec').length>0);
  document.querySelector('#recommendations .rec').click();continueFlexible();
  assert('flexible inquiry prefills location',currentVisiblePageId()==='pageInquiry'&&document.getElementById('inquiryCity').value==='Buffalo');
  submitQuickInquiry();assert('flexible inquiry saved',PALineBridge.listBookings()[0].raw.source==='flexible');
  backFromInquiry();val('rangeStart','2020-01-01');val('rangeEnd','2020-01-02');findFlexibleDates();
  assert('empty results clear stale selected date',!state.selectedDate&&document.getElementById('flexContinue').disabled&&document.getElementById('recommendations').textContent.includes('No matching'));
  return JSON.stringify({results,alerts});
 }catch(e){return JSON.stringify({results,error:e.stack})}finally{window.alert=oldAlert}
})()
