
(function(){
  const KEY="paline_platform_bridge_v1";
  const CHANNEL="paline-platform";

  function load(){
    try{return JSON.parse(localStorage.getItem(KEY)||'{"bookingRequests":[]}')}catch(e){return {bookingRequests:[]}}
  }
  function save(data){
    localStorage.setItem(KEY,JSON.stringify(data));
    try{
      const bc=new BroadcastChannel(CHANNEL);
      bc.postMessage({type:"bridge-update",at:new Date().toISOString()});
      bc.close();
    }catch(e){}
  }
  function uid(prefix="req"){return prefix+"_"+Date.now()+"_"+Math.random().toString(36).slice(2,8)}
  function normalizeBooking(payload){
    return {
      id:payload.id||uid(),
      createdAt:payload.createdAt||new Date().toISOString(),
      source:"public-booking",
      status:"pending-command-review",
      venue:payload.venue||payload.venueName||payload.organization||"Booking request",
      city:payload.city||"",
      state:payload.state||"",
      date:payload.date||payload.eventDate||"",
      start:payload.start||payload.startTime||"19:00",
      end:payload.end||payload.endTime||"22:00",
      lineupId:payload.lineupId||payload.format||"full",
      bookingChannel:payload.bookingChannel||"standard",
      bookingType:payload.bookingType||"performance",
      bookingTypeLabel:payload.bookingTypeLabel||"",
      bookingTypeDetails:payload.bookingTypeDetails||{},
      pay:Number(payload.pay||payload.total||payload.quoteTotal||0),
      attendanceProvided:Number(payload.attendance||payload.expectedAttendance||0),
      travelBeforeHours:Number(payload.travelBeforeHours||0),
      travelAfterHours:Number(payload.travelAfterHours||0),
      contactName:payload.contactName||payload.bookerName||"",
      contactEmail:payload.contactEmail||payload.email||"",
      contactPhone:payload.contactPhone||payload.phone||"",
      adminNotes:payload.adminNotes||payload.notes||"",
      raw:payload
    }
  }
  function submitBooking(payload){
    const data=load(),item=normalizeBooking(payload);
    data.bookingRequests.unshift(item);save(data);
    return item;
  }
  function listBookings(){return load().bookingRequests||[]}
  function updateBooking(id,patch){
    const data=load(),item=data.bookingRequests.find(x=>x.id===id);
    if(!item)return null;
    Object.assign(item,patch,{updatedAt:new Date().toISOString()});save(data);return item;
  }

  window.PALineBridge={load,save,submitBooking,listBookings,updateBooking,key:KEY};
})();
