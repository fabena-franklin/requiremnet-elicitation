
(function(){
  /* ---------- sky ---------- */
  const cv=document.getElementById('sky'),ctx=cv.getContext('2d');
  const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  let W,H,CX,CY,SC=1;
  function size(){const d=Math.min(devicePixelRatio||1,2);W=innerWidth;H=innerHeight;cv.width=W*d;cv.height=H*d;ctx.setTransform(d,0,0,d,0,0);CX=W/2;CY=H/2;SC=Math.max(.45,Math.min(1.2,Math.min(W,H*1.1)/820))}
  size();addEventListener('resize',size);
  document.fonts.load('400 16px "Instrument Serif"');
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const stars=Array.from({length:140},()=>({x:Math.random(),y:Math.random(),r:Math.random()*1.3+.3,p:Math.random()*6.28,s:Math.random()*.02+.01}));
  const P=[
    {R:90,a:.2,v:.014,s:7,c:'157,124,245'},{R:150,a:2.1,v:.01,s:10,c:'94,234,212',moon:1},
    {R:215,a:4,v:.0075,s:15,c:'244,114,182',ring:1},{R:285,a:1.1,v:.0052,s:9,c:'255,177,94'},{R:360,a:3.3,v:.0035,s:18,c:'157,124,245'}];
  const Q=Array.from({length:34},()=>({x:Math.random()*W,y:Math.random()*H,vx:(Math.random()-.5)*.14,vy:(Math.random()-.5)*.14,z:.35+Math.random()*.65,h:Math.random()}));
  const fx=[],embers=[],trail=[],dust=Array.from({length:90},()=>({x:Math.random(),y:Math.random(),r:Math.random()*1.1+.3,vx:(Math.random()-.5)*.00006,vy:-Math.random()*.00008-.00002,p:Math.random()*6.28,c:Math.random()<.5?'255,217,168':Math.random()<.5?'94,234,212':'157,124,245'}));let spin=0,av=.0009,zoom=1,tz=1,drag=false,lastA=0,moved=0,ptr={x:-999,y:-999},frame=0;
  const ang=(x,y)=>Math.atan2(y-CY,x-CX);
  function q(x,y,s,a,c,r){ctx.save();ctx.translate(x,y);ctx.rotate(r||0);ctx.font=`400 ${s*1.25}px "Instrument Serif",Georgia,serif`;ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.shadowColor=`rgba(${c},${Math.min(a*1.4,1)})`;ctx.shadowBlur=s*.9;ctx.fillStyle=`rgba(${c},${a})`;ctx.fillText('?',0,0);ctx.restore()}
  function burst(x,y,n){for(let i=0;i<n;i++){const t=Math.random()*6.28,v=.8+Math.random()*1.8;fx.push({x,y,vx:Math.cos(t)*v,vy:Math.sin(t)*v,s:9+Math.random()*12,l:80,m:80,c:Math.random()<.5?'255,177,94':'157,124,245'})}}
  cv.addEventListener('pointerdown',e=>{cv.setPointerCapture(e.pointerId);drag=true;moved=0;lastA=ang(e.clientX,e.clientY);ptr={x:e.clientX,y:e.clientY}});
  cv.addEventListener('pointermove',e=>{
    if(drag){const a=ang(e.clientX,e.clientY);let d=a-lastA;while(d>Math.PI)d-=6.28;while(d<-Math.PI)d+=6.28;spin+=d;av=d*.6;lastA=a;moved+=Math.abs(e.movementX)+Math.abs(e.movementY);trail.push({x:e.clientX,y:e.clientY,l:26,m:26})}
    ptr={x:e.clientX,y:e.clientY}});
  cv.addEventListener('pointerup',e=>{drag=false;if(moved<6){let hit=null;
    for(const p of P)if(Math.hypot(e.clientX-p.sx,e.clientY-p.sy)<Math.max(p.s*Math.max(SC,.75)*zoom,12)+10){hit=p;break}
    if(hit){hit.pulse=1;burst(hit.sx,hit.sy,6)}else burst(e.clientX,e.clientY,8)}});
  cv.addEventListener('pointerleave',()=>ptr={x:-999,y:-999});
  cv.addEventListener('wheel',e=>{e.preventDefault();tz=clamp(tz*(1-e.deltaY*.0015),.7,2.6)},{passive:false});
  cv.addEventListener('dblclick',()=>tz=1);

  function step(){
    frame++;ctx.clearRect(0,0,W,H);
    if(!reduce){spin+=av;av*=.965;if(Math.abs(av)<.0006&&!drag)av=.0009}
    zoom+=(tz-zoom)*.1;
    ctx.save();ctx.translate(CX,CY);ctx.scale(zoom,zoom);ctx.translate(-CX,-CY);
    for(const s of stars){s.p+=s.s;ctx.fillStyle=`rgba(244,239,255,${.12+.5*(.5+.5*Math.sin(s.p))})`;ctx.beginPath();ctx.arc(s.x*W,s.y*H,s.r,0,6.28);ctx.fill()}
    for(const d of dust){if(!reduce){d.x+=d.vx;d.y+=d.vy;d.p+=.03}if(d.y<-.02)d.y=1.02;if(d.x<-.02)d.x=1.02;if(d.x>1.02)d.x=-.02;
      const a=.15+.45*(.5+.5*Math.sin(d.p));ctx.fillStyle=`rgba(${d.c},${a})`;ctx.shadowColor=`rgba(${d.c},.8)`;ctx.shadowBlur=6;ctx.beginPath();ctx.arc(d.x*W,d.y*H,d.r,0,6.28);ctx.fill()}ctx.shadowBlur=0;
    const r=26*Math.max(SC,.7)*(1+.08*Math.sin(frame*.03)),g=ctx.createRadialGradient(CX,CY,0,CX,CY,r*3.4);
    g.addColorStop(0,'rgba(255,217,168,.95)');g.addColorStop(.35,'rgba(255,177,94,.55)');g.addColorStop(1,'rgba(255,177,94,0)');
    ctx.fillStyle=g;ctx.beginPath();ctx.arc(CX,CY,r*3.4,0,6.28);ctx.fill();
    ctx.fillStyle='rgba(255,238,214,.95)';ctx.shadowColor='rgba(255,177,94,.9)';ctx.shadowBlur=30;ctx.beginPath();ctx.arc(CX,CY,r,0,6.28);ctx.fill();ctx.shadowBlur=0;
    if(!reduce&&Math.random()<.45){const t=Math.random()*6.28;embers.push({x:CX+Math.cos(t)*r,y:CY+Math.sin(t)*r,vx:Math.cos(t)*.5,vy:Math.sin(t)*.5,l:55,m:55})}
    for(let i=embers.length-1;i>=0;i--){const e=embers[i];e.x+=e.vx;e.y+=e.vy;e.l--;const k=e.l/e.m;ctx.fillStyle=`rgba(255,200,140,${k*.7})`;ctx.beginPath();ctx.arc(e.x,e.y,1.8*k+.4,0,6.28);ctx.fill();if(e.l<=0)embers.splice(i,1)}
    ctx.lineWidth=1;ctx.strokeStyle='rgba(157,124,245,.08)';
    for(const p of P){ctx.beginPath();ctx.ellipse(CX,CY,p.R*SC,p.R*SC*.55,0,0,6.28);ctx.stroke()}
    for(const p of P){
      p.a+=reduce?0:p.v;const e=p.a+spin,x=CX+Math.cos(e)*p.R*SC,y=CY+Math.sin(e)*p.R*SC*.55;
      p.pulse=(p.pulse||0)*.92;const pr=p.s*Math.max(SC,.75)*(1+p.pulse*.6);
      p.sx=CX+(x-CX)*zoom;p.sy=CY+(y-CY)*zoom;
      if(p.ring){ctx.save();ctx.translate(x,y);ctx.rotate(.5);ctx.strokeStyle=`rgba(${p.c},.5)`;ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(0,0,pr*2.1,pr*.7,0,0,6.28);ctx.stroke();ctx.restore()}
      const pg=ctx.createRadialGradient(x,y,0,x,y,pr*1.5);pg.addColorStop(0,`rgba(${p.c},.35)`);pg.addColorStop(1,`rgba(${p.c},0)`);
      ctx.fillStyle=pg;ctx.beginPath();ctx.arc(x,y,pr*1.5,0,6.28);ctx.fill();
      ctx.fillStyle=`rgba(${p.c},.9)`;ctx.shadowColor=`rgba(${p.c},.9)`;ctx.shadowBlur=5;ctx.beginPath();ctx.arc(x,y,pr,0,6.28);ctx.fill();ctx.shadowBlur=0;
      if(p.moon){p.ma=(p.ma||0)+.05;ctx.fillStyle='rgba(241,236,255,.85)';ctx.beginPath();ctx.arc(x+Math.cos(p.ma)*20*SC,y+Math.sin(p.ma)*12*SC,3,0,6.28);ctx.fill()}
    }
    for(const f of Q){
      if(!reduce){f.x+=f.vx;f.y+=f.vy}
      if(f.x<-40)f.x=W+40;if(f.x>W+40)f.x=-40;if(f.y<-40)f.y=H+40;if(f.y>H+40)f.y=-40;
      const dx=f.x-ptr.x,dy=f.y-ptr.y,d=Math.hypot(dx,dy);
      if(d<140&&d>0){const k=(1-d/140)*1500/(d*d+400);f.x+=dx/d*k;f.y+=dy/d*k}
      q(f.x,f.y,(9+f.h*14)*f.z,(.2+f.h*.45)*f.z,f.h<.5?'157,124,245':f.h<.8?'94,234,212':'244,114,182',Math.sin(frame*.006+f.x)*.3);
    }
    for(let i=fx.length-1;i>=0;i--){const b=fx[i];b.x+=b.vx;b.y+=b.vy;b.vx*=.96;b.vy*=.96;b.l--;q(b.x,b.y,b.s,b.l/b.m*.85,b.c,0);if(b.l<=0)fx.splice(i,1)}
    ctx.restore();
    for(let i=trail.length-1;i>=0;i--){const t=trail[i];t.l--;const k=t.l/t.m;ctx.fillStyle=`rgba(255,217,168,${k*.6})`;ctx.beginPath();ctx.arc(t.x+(Math.random()-.5)*4,t.y+(Math.random()-.5)*4,2.2*k,0,6.28);ctx.fill();if(t.l<=0)trail.splice(i,1)}
    requestAnimationFrame(step);
  }
  requestAnimationFrame(step);

  /* ---------- chat ---------- */
  const $=id=>document.getElementById(id),msgs=$('msgs'),inp=$('in'),shell=$('shell'),hist=$('hist');
  const API_BASE='http://127.0.0.1:8001';
  let chats=[],cur=null,sessionId=localStorage.getItem('noidea.sessionId')||null;
  try{chats=JSON.parse(localStorage.getItem('noidea.chats')||'[]')}catch(e){chats=[]}
  if(!Array.isArray(chats))chats=[];
  const save=()=>{try{localStorage.setItem('noidea.chats',JSON.stringify(chats.slice(0,50)))}catch(e){}};
  const WELCOME="Hey. Drag the sky, tap a planet, scroll to zoom in close. When you're ready, ask me something — fair warning, I probably have no idea.";
  const NEWMSG="New chat, blank sky. Ask me anything — I'll almost certainly have no idea.";
  const sendBtn=$('send'),spec=$('spec'),dlg=$('dlg'),srch=$('srch');
  const SENDI=sendBtn.innerHTML,STOP='<svg viewBox="0 0 24 24"><rect x="6" y="6" width="12" height="12" rx="2" fill="currentColor"/></svg>';
  const SECS=['Product summary','MVP scope','Functional requirements','Acceptance criteria','Build priority'];
  let job=null,tt=null;
  const esc=t=>t.replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const md=t=>esc(t).replace(/`([^`]+)`/g,'<code>$1</code>').replace(/\*\*([^*]+)\*\*/g,'<strong>$1</strong>').replace(/^- /gm,'• ').replace(/\n/g,'<br>');
  function toast(m){const e=$('toast');e.textContent=m;e.classList.add('on');clearTimeout(tt);tt=setTimeout(()=>e.classList.remove('on'),1800)}
  function copyText(t){return (navigator.clipboard?navigator.clipboard.writeText(t):Promise.reject()).catch(()=>{const a=document.createElement('textarea');a.value=t;a.style.cssText='position:fixed;opacity:0';document.body.appendChild(a);a.select();try{document.execCommand('copy')}catch(e){}a.remove()})}
  const closeMobile=()=>{if(innerWidth<=760)shell.classList.remove('open')};
  const setTitle=c=>{document.title=c?c.title+' · No Idea':'No Idea'};
  function persistSession(id){if(id){sessionId=id;try{localStorage.setItem('noidea.sessionId',id)}catch(e){}}}

  async function callBackend(message, controller){
    const response=await fetch(API_BASE+'/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({session_id:sessionId,message}),signal:controller.signal});
    const data=await response.json().catch(()=>({}));
    if(!response.ok){throw new Error(data.detail||'The backend rejected the request.');}
    if(data.session_id){persistSession(data.session_id)}
    return data.message || '';
  }

  function add(role,text){
    const g=document.createElement('div');g.className='g '+(role==='user'?'u':'bot');
    if(role==='user'){g.innerHTML='<div class="av">Y</div><div class="bub"></div>';g.querySelector('.bub').textContent=text}
    else{
      g.innerHTML='<div class="bw"><div class="bub"></div><div class="acts"><button class="cp" type="button">Copy</button></div></div>';
      const bub=g.querySelector('.bub');bub.innerHTML=md(text);bub._raw=text;
      g.querySelector('.cp').onclick=ev=>{const b=ev.currentTarget;copyText(bub._raw||bub.textContent).then(()=>{b.textContent='Copied ✓';setTimeout(()=>b.textContent='Copy',1300)})}}
    msgs.appendChild(g);msgs.scrollTo({top:msgs.scrollHeight,behavior:'smooth'});return g}
  function show(chat,intro){msgs.innerHTML='';if(!chat||!chat.msgs.length)add('bot',intro||WELCOME);else chat.msgs.forEach(m=>add(m.role,m.text))}

  function renderSpec(c){
    const u=c?c.msgs.filter(m=>m.role==='user').map(m=>m.text):[];
    $('sprog').textContent=Math.min(u.length,5)+'/5 sections';
    $('sbody').innerHTML=SECS.map((n,i)=>'<h3>'+n+'</h3><p class="'+(u[i]?'':'wait')+'">'+(u[i]?esc(u[i]):'Waiting for your answer…')+'</p>').join('')}
  const specMd=c=>{const u=c?c.msgs.filter(m=>m.role==='user').map(m=>m.text):[];return '# MVP requirements specification\n\n'+SECS.map((n,i)=>'## '+n+'\n'+(u[i]||'_Not answered yet_')).join('\n\n')+'\n'};
  const curChat=()=>chats.find(x=>x.id===cur);

  function renderHist(){
    hist.innerHTML='';const q=srch.value.trim().toLowerCase();
    const list=chats.filter(c=>c.title.toLowerCase().includes(q));
    if(!list.length){const e=document.createElement('div');e.className='empty';e.textContent=chats.length?'No chats match that.':'Your chats will show up here once you share an idea.';hist.appendChild(e);return}
    list.forEach(c=>{
      const row=document.createElement('div');row.className='hrow';
      const b=document.createElement('button');b.className='hi'+(c.id===cur?' on':'');b.textContent=c.title;b.onclick=()=>go(c.id);
      const d=document.createElement('button');d.className='del';d.setAttribute('aria-label','Delete chat');d.textContent='×';
      d.onclick=()=>{chats=chats.filter(x=>x.id!==c.id);save();if(cur===c.id)go(null);else renderHist()};
      row.append(b,d);hist.appendChild(row)})}
  function go(id){
    if(job)stopJob();cur=id;const c=curChat();
    show(c,c?undefined:NEWMSG);renderHist();renderSpec(c);setTitle(c);closeMobile()}

  function setBusy(b){sendBtn.innerHTML=b?STOP:SENDI;sendBtn.setAttribute('aria-label',b?'Stop generating':'Send message');sendBtn.classList.toggle('stop',b)}
  function stopJob(){
    if(job){
      if(job.controller)job.controller.abort();
      if(job.ty&&job.ty.parentNode)job.ty.remove();
      job=null;setBusy(false);
    }
  }
  async function send(){
    if(job){stopJob();return}
    const t=inp.value.trim();if(!t)return;
    let c=curChat();
    if(!c){c={id:Date.now(),title:t.length>32?t.slice(0,32)+'…':t,msgs:[]};chats.unshift(c);cur=c.id}
    c.msgs.push({role:'user',text:t});save();renderHist();renderSpec(c);setTitle(c);
    add('user',t);inp.value='';inp.style.height='auto';
    const ty=document.createElement('div');ty.className='g bot';ty.innerHTML='<div class="bub dots" role="status" aria-label="Thinking"><i></i><i></i><i></i></div>';
    msgs.appendChild(ty);msgs.scrollTo({top:msgs.scrollHeight,behavior:'smooth'});
    const controller=new AbortController();
    setBusy(true);job={c,ty,controller};
    try{
      const answer=await callBackend(t,controller);
      if(!job||job.controller!==controller){return;}
      ty.remove();
      const g=add('bot',answer);
      c.msgs.push({role:'bot',text:answer});
      save();renderHist();renderSpec(c);setTitle(c);
      if(g && g.querySelector('.cp')){
        g.querySelector('.cp').onclick=ev=>{const b=ev.currentTarget;copyText(answer).then(()=>{b.textContent='Copied ✓';setTimeout(()=>b.textContent='Copy',1300)})}
      }
    }catch(error){
      if(error.name==='AbortError'){toast('Request cancelled.');return;}
      ty.remove();
      const fallback='I could not reach the backend. Please make sure the FastAPI server is running on http://127.0.0.1:8001.';
      add('bot',fallback);
      c.msgs.push({role:'bot',text:fallback});
      toast('Backend connection failed');
      console.error(error);
    }finally{
      if(job&&job.controller===controller){job=null;setBusy(false)}
    }
  }

  sendBtn.onclick=send;
  inp.addEventListener('keydown',e=>{
    if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();send()}
    else if(e.key==='ArrowUp'&&!inp.value){const c=curChat();const l=c&&[...c.msgs].reverse().find(m=>m.role==='user');if(l){e.preventDefault();inp.value=l.text;inp.dispatchEvent(new Event('input'))}}});
  inp.addEventListener('input',()=>{inp.style.height='auto';inp.style.height=Math.min(inp.scrollHeight,120)+'px'});
  srch.addEventListener('input',renderHist);

  $('ren').onclick=()=>{const c=curChat();if(!c){toast("Send a message first, nothing to rename yet.");return}$('rn').value=c.title;dlg.showModal();$('rn').select()};
  const doRename=()=>{const c=curChat(),v=$('rn').value.trim();if(c&&v){c.title=v.slice(0,60);save();renderHist();setTitle(c)}dlg.close()};
  $('rns').onclick=doRename;$('rnx').onclick=()=>dlg.close();
  $('rn').addEventListener('keydown',e=>{if(e.key==='Enter')doRename()});
  $('exp').onclick=()=>{const c=curChat();if(!c){toast("Nothing to copy yet.");return}
    copyText('# '+c.title+'\n\n'+c.msgs.map(m=>(m.role==='user'?'**You:** ':'**No Idea:** ')+m.text).join('\n\n')+'\n').then(()=>toast('Chat copied as Markdown'))};
  $('specbtn').onclick=()=>spec.classList.toggle('open');
  $('specx').onclick=()=>spec.classList.remove('open');
  $('speccopy').onclick=()=>copyText(specMd(curChat())).then(()=>toast('Spec copied as Markdown'));

  addEventListener('keydown',e=>{
    const typing=/INPUT|TEXTAREA/.test((document.activeElement||{}).tagName||'');
    if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='k'){e.preventDefault();go(null);inp.focus()}
    else if(e.key==='Escape'){spec.classList.remove('open');closeMobile()}
    else if(e.key==='/'&&!typing){e.preventDefault();inp.focus()}});
  addEventListener('offline',()=>toast("You're offline. The sky still works."));
  addEventListener('online',()=>toast('Back online.'));

  $('bd').onclick=()=>shell.classList.remove('open');
  let wasM=innerWidth<=760;addEventListener('resize',()=>{const m=innerWidth<=760;if(m!==wasM){wasM=m;shell.classList.toggle('open',!m)}});
  $('menu').onclick=()=>shell.classList.toggle('open');
  $('new').onclick=()=>go(null);
  if(innerWidth>760)shell.classList.add('open');
  show(null);renderHist();renderSpec(null);
  })();
