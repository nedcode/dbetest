'use strict';
let token=null;let user=null;
const $=id=>document.getElementById(id);
const showAlert=(message,success=false)=>{const el=$('alert');el.textContent=message;el.hidden=false;el.className=success?'success':'';};
const clearAlert=()=>{$('alert').hidden=true;$('alert').textContent='';};
async function api(url,{method='GET',body}={}){
  const r=await fetch('/api'+url,{method,headers:{...(token?{Authorization:`Bearer ${token}`} : {}),...(body?{'content-type':'application/json'}:{})},body:body?JSON.stringify(body):undefined});
  const data=await r.json();if(!r.ok)throw new Error(data.error||`HTTP ${r.status}`);return data;
}
function elt(tag,text,className){const el=document.createElement(tag);if(text!=null)el.textContent=text;if(className)el.className=className;return el;}
function btn(text,callback,disabled=false){const b=elt('button',text);b.type='button';b.disabled=disabled;b.addEventListener('click',()=>callback());return b;}
function money(n){return new Intl.NumberFormat('de-DE',{style:'currency',currency:'EUR'}).format(n/100);}
async function reload(){await Promise.all([loadJourneys(),loadBookings(),loadNotifications()]);}
async function loadJourneys(){
  const list=$('journeys');list.replaceChildren();
  const {journeys}=await api('/journeys');
  for(const j of journeys){
    const card=elt('article',null,'journey');card.setAttribute('aria-label',`${j.origin} to ${j.destination}`);
    const left=elt('div');left.append(elt('div',`${j.origin} → ${j.destination}`,'route'),elt('p',`${j.departure.replace('T',' ')} · ${j.availableSeats} seats available`));
    const right=elt('div',null,'right');right.append(elt('div',money(j.priceCents),'fare'));
    const book=btn(j.availableSeats===0?'Sold out':'Book journey',async()=>{
      try{const {booking}=await api('/bookings',{method:'POST',body:{journeyId:j.id}});showAlert(`Reservation created: ${booking.id}`,true);await reload();}catch(e){showAlert(e.message);await loadJourneys();}
    },j.availableSeats===0||user.role!=='traveler');right.append(book);
    card.append(left,right);list.append(card);
  }
}
async function loadBookings(){
  const list=$('bookings');list.replaceChildren();const {bookings}=await api('/bookings');
  if(!bookings.length){list.append(elt('p','No reservations yet.','empty'));return;}
  for(const b of bookings){
    const card=elt('article',null,'booking');card.setAttribute('aria-label',`Reservation ${b.route}`);
    const left=elt('div');left.append(elt('span',b.status,'status'),elt('div',b.route,'route'),elt('p',`${b.id} · ${money(b.priceCents)}${b.ticketId?' · '+b.ticketId:''}`));
    const right=elt('div',null,'right');
    if(b.status==='PENDING_PAYMENT'&&b.ownerId===user.id){
      right.append(btn('Pay (demo approved)',async()=>{
        try{await api(`/bookings/${b.id}/pay`,{method:'POST',body:{paymentMethod:'demo-approved'}});showAlert('Synthetic ticket issued',true);await reload();}catch(e){showAlert(e.message);}
      }));
      right.append(document.createTextNode(' '));
      right.append(btn('Pay (demo declined)',async()=>{
        try{await api(`/bookings/${b.id}/pay`,{method:'POST',body:{paymentMethod:'demo-declined'}});await reload();}catch(e){showAlert(e.message);}
      }));
      right.append(document.createTextNode(' '));
      right.append(btn('Cancel reservation',async()=>{
        try{await api(`/bookings/${b.id}/cancel`,{method:'POST'});showAlert('Reservation cancelled',true);await reload();}catch(e){showAlert(e.message);}
      }));
    }
    card.append(left,right);list.append(card);
  }
}
async function loadNotifications(){
  const list=$('notifications');list.replaceChildren();const {messages}=await api('/notifications');
  if(!messages.length){list.append(elt('p','No notifications yet.','empty'));return;}
  for(const m of messages)list.append(elt('article',m.text,'notification'));
}
$('login-form').addEventListener('submit',async e=>{
  e.preventDefault();clearAlert();try{
    const data=await api('/auth/login',{method:'POST',body:{email:$('email').value,password:$('password').value}});
    token=data.token;user=data.user;
    $('login-panel').hidden=true;$('workspace').hidden=false;$('welcome-heading').textContent=`Welcome, ${user.displayName}`;$('current-role').textContent=user.role;
    await reload();
  }catch(e){showAlert(e.message);}
});
$('sign-out').addEventListener('click',()=>{token=null;user=null;$('workspace').hidden=true;$('login-panel').hidden=false;clearAlert();});
$('refresh-journeys').addEventListener('click',async()=>{try{await reload();}catch(e){showAlert(e.message);}});
