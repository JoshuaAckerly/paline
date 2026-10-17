(async()=>{
  const results=[];
  for(const [id,label] of [...navItems(),...allToolNavItems()].filter(([id])=>id!=="public")){
    try{
      state.page=id;mount();await new Promise(r=>setTimeout(r,40));
      results.push({id,label,actual:state.page,ok:state.page===id&&!!document.querySelector('.content')?.textContent.trim(),width:innerWidth,scroll:document.documentElement.scrollWidth});
    }catch(e){results.push({id,error:e.stack})}
  }
  state.page='pipeline';mount();
  return JSON.stringify(results);
})()
