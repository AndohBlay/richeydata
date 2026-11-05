import {useEffect,useState} from 'react'
import {supabase as sb} from './supabase'
import {Login,Signup,Verify,Account,Reset,Forgot,Bar,useAuth} from './Account.jsx'
import logo from './assets/logo.png'
const NETS=['MTN','AirtelTigo','Telecel'],PHONE='0558247148',WA='https://wa.me/233'+PHONE.slice(1),JOIN='https://chat.whatsapp.com/I1TInrjhKuc7diINQlk7wL'
const PRE={MTN:['024','025','053','054','055','059'],Telecel:['020','050'],AirtelTigo:['026','027','056','057']}
const COL={MTN:['#facc15','#1a1a1a'],AirtelTigo:['#2563eb','#fff'],Telecel:['#dc2626','#fff']}
const REG=['Greater Accra','Ashanti','Western','Eastern','Central','Northern','Volta','Upper East','Upper West','Bono','Bono East','Ahafo','Savannah','North East','Oti','Western North']
const MSG={pending:'Waiting for payment confirmation...',paid:'Payment received. Processing your order...',processing:'Payment received. Your order is being processed and will be completed shortly.',delivered:'Done! Your order has been completed.',failed:'Payment received but the order could not be completed. Contact us with your reference.'}
const IC={data:'<path d="M16.5 9.4 7.5 4.21"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>',
standard:'<path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/>',
airtime:'<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>',
bill:'<path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/>',
checker:'<path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>',
afa:'<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/>',
sms:'<path d="m22 2-7 20-4-9-9-4 20-7z"/><path d="M22 2 11 13"/>',
zap:'<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>',lock:'<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
inf:'<path d="M18.178 8c5.096 0 5.096 8 0 8-5.095 0-7.133-8-12.739-8-4.585 0-4.585 8 0 8 5.606 0 7.644-8 12.74-8z"/>',clock:'<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
search:'<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>'}
const Icon=({n,s=26})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" dangerouslySetInnerHTML={{__html:IC[n]}}/>
const SV=[['data','Data Bundles','MTN, Telecel and AirtelTigo data with no expiry.','#/buy','Buy now'],['standard','Standard Bundles','Ready-made bundles for every network.','#/s/standard','Buy now'],['airtime','Airtime','Top up any Ghana number in seconds.','#/s/airtime','Buy now'],['bill','Utility Bills','Pay ECG, Ghana Water, DSTV, GOtv and StarTimes.','#/s/bill','Pay a bill'],['checker','Results Checker','WAEC and BECE vouchers sent to your phone by SMS.','#/s/checker','Buy voucher'],['afa','AFA Registration','Register for MTN AFA online.','#/s/afa','Register now'],['sms','SMS Platform','Send bulk SMS to your customers.','#/s/sms','Send SMS']]
export default function App(){
 const [all,setAll]=useState([]),[net,setNet]=useState('MTN'),[sel,setSel]=useState(null),[phone,setPhone]=useState(''),[email,setEmail]=useState(''),[busy,setBusy]=useState(false),[err,setErr]=useState(''),[st,setSt]=useState(null),[tr,setTr]=useState(null),[route,setRoute]=useState(location.hash),[menu,setMenu]=useState(false),[user,setUser]=useState(null),[pm,setPm]=useState(false)
 const auth=useAuth()
 const [ref,setRef]=useState(()=>new URLSearchParams(location.search).get('reference')),r=route.replace(/^#/,'')||'/'
 useEffect(()=>{if(new URLSearchParams(location.search).get('reference')){history.replaceState(null,'','/#/');setRoute('#/')}},[]) // after payment, land on the home page; the status shows in a popup
 const nm=((auth.profile?.full_name||auth.session?.user?.email||'').split(/[ @]/)[0])||'Account'
 const acct=auth.verified?['#/account','My Account']:auth.session?['#/verify','Verify phone']:['#/login','Log in']
 const[wel,setWel]=useState(false)
 useEffect(()=>{let seen=false;try{seen=!!localStorage.getItem('rd_welcome')}catch{}if(seen)return;const t=setTimeout(()=>setWel(true),1200);return()=>clearTimeout(t)},[])
 const closeWel=()=>{try{localStorage.setItem('rd_welcome','1')}catch{}setWel(false)}
 const showWel=wel&&auth.ready&&!auth.session&&!ref&&!['/login','/signup','/verify','/reset','/forgot'].includes(r)
 useEffect(()=>{sb.from('bundles').select('*').eq('active',true).order('sort').then(({data})=>setAll(data||[]))},[])
 useEffect(()=>{sb.auth.getSession().then(({data})=>setUser(data.session?.user||null));const{data}=sb.auth.onAuthStateChange((ev,s)=>{setUser(s?.user||null);if(ev==='PASSWORD_RECOVERY')location.hash='#/reset'});return()=>data.subscription.unsubscribe()},[])
 useEffect(()=>{if(user?.email)setEmail(x=>x||user.email)},[user])
 useEffect(()=>{const h=()=>setRoute(location.hash);addEventListener('hashchange',h);return()=>removeEventListener('hashchange',h)},[])
 useEffect(()=>{if(!ref)return;let n=0;const t=setInterval(async()=>{const{data}=await sb.rpc('get_order_status',{p_ref:ref});setSt(data);if(['delivered','failed','processing'].includes(data)||++n>40)clearInterval(t)},3000);return()=>clearInterval(t)},[ref])
 const go=h=>{setMenu(false);location.hash=h;scrollTo(0,0)}
 const to=id=>{setMenu(false);const f=()=>document.getElementById(id)?.scrollIntoView({behavior:'smooth'});if(r!=='/'){location.hash='#/';setTimeout(f,200)}else f()}
 async function pay(){
  setErr('');if(!/^0\d{9}$/.test(phone))return setErr('Enter a valid 10-digit number, e.g. 0241234567.')
  if(!PRE[sel.network].includes(phone.slice(0,3)))return setErr(`That number is not a ${sel.network} number.`)
  setBusy(true);const{data,error}=await sb.functions.invoke('create-order',{body:{bundle_id:sel.id,phone,email}})
  if(error||!data?.url){setBusy(false);let m=data?.error;if(!m&&error?.context?.json)m=(await error.context.json().catch(()=>({}))).error;return setErr(m||'Could not start payment. Try again.')}
  location.href=data.url}
 const list=all.filter(b=>b.network===net)
 const Tabs=<div className="tabs">{NETS.map(n=><button key={n} className={n===net?'on':''} style={{background:COL[n][0],color:COL[n][1]}} onClick={()=>setNet(n)}>{n}</button>)}</div>
 const Cards=n=><div className="grid">{list.slice(0,n).map(b=><button key={b.id} className="card" style={{background:COL[net][0],color:COL[net][1]}} onClick={()=>{setSel(b);setErr('');if(!phone&&auth.profile?.phone)setPhone(auth.profile.phone)}}><span className="tag">{net}</span><span className="gb">{b.name}</span><span className="nm">{net} Bundle</span><span className="pr">₵{Number(b.price).toFixed(2)}<small>No Expiry</small></span></button>)}</div>
 return <>
 <nav className="nav"><div className="in"><button className="logo" onClick={()=>go('#/')}><img src={logo} alt=""/>RicheyData</button><button className="ham" aria-label="Menu" onClick={()=>setMenu(!menu)}><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M4 6h16M4 12h16M4 18h16"/></svg></button>
  <div className={'links'+(menu?' open':'')}><button onClick={()=>go('#/')}>Home</button><button onClick={()=>to('services')}>Services</button><button onClick={()=>to('bundles')}>Bundles</button><button onClick={()=>to('faq')}>FAQ</button><button onClick={()=>go('#/buy')}>Track Order</button>{auth.verified?<div className="pm"><button className="avatar" aria-label="Profile" onClick={()=>setPm(!pm)}><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/></svg></button>{pm&&<><div className="pmx" onClick={()=>setPm(false)}/><div className="pmenu"><div className="who"><b>{nm}</b><small>{auth.session.user.email}</small></div><button onClick={()=>{setPm(false);setMenu(false);go('#/account')}}>Order history</button><button onClick={()=>{setPm(false);setMenu(false);go('#/account')}}>Account & password</button><button onClick={async()=>{setPm(false);setMenu(false);await sb.auth.signOut();go('#/')}}>Log out</button></div></>}</div>:<button onClick={()=>go(acct[0])}>{acct[1]}</button>}<button className="cta" onClick={()=>go('#/buy')}>Buy Data</button></div></div></nav>
 {r==='/buy'?<main><h1>Buy Data Bundles</h1><p className="sub">No account needed • Pay via MoMo • 24/7 Service</p>
  {tr===null?<button className="btn" onClick={()=>setTr('')}><Icon n="search" s={18}/>Track Order</button>:<form className="trk" onSubmit={e=>{e.preventDefault();tr.trim()&&(location.href='/?reference='+encodeURIComponent(tr.trim()))}}><input placeholder="Order reference, e.g. RD1730..." value={tr} onChange={e=>setTr(e.target.value)}/><button className="btn">Track</button></form>}
  <details><summary>Good to know before you buy</summary><p>Data bundles have no expiry. Double-check the number before paying, because data sent to a wrong number can't be reversed. Delivery time can vary when the network is busy. Keep your order reference so you can track it.</p></details>
  {Tabs}{Cards(999)}{!list.length&&<p className="sub">No {net} bundles available right now.</p>}</main>
 :r.startsWith('/s/')?<Svc key={r} svc={r.slice(3)} user={user}/>
 :r==='/login'?<Login go={go}/>:r==='/signup'?<Signup go={go}/>:r==='/verify'?<Verify auth={auth} go={go}/>:r==='/account'?<Account auth={auth} go={go}/>:r==='/forgot'?<Forgot go={go}/>:r==='/reset'?<Reset go={go}/>
 :r==='/terms'||r==='/privacy'?<Legal k={r}/>
 :(r==='/'||r==='')?<>
  <section className="hero"><h1>Cheap data bundles,<br/><span>delivered fast.</span></h1><p>MTN, Telecel and AirtelTigo data with no expiry. No account needed. Pay with MoMo, 24/7.</p><div className="cta2"><button className="pay big" onClick={()=>go('#/buy')}>Click to buy data</button><a className="ghost" href={JOIN} target="_blank" rel="noreferrer">Join our WhatsApp</a></div><div className="chips">{NETS.map(n=><span key={n} style={{background:COL[n][0],color:COL[n][1]}}>{n}</span>)}</div></section>
  <section className="sec" id="services"><h2>Our services</h2><p className="sub">Everything you need, in one place.</p><div className="svs">{SV.map(([k,t,d,h,b])=><div className="sv" key={k}><span className="ic"><Icon n={k}/></span><b>{t}</b><small>{d}</small><button className="pay" style={{marginTop:0}} onClick={()=>go(h)}>{b}</button></div>)}</div></section>
  <section className="sec" id="bundles"><h2>Popular bundles</h2><p className="sub">Tap a bundle to buy it now.</p>{Tabs}{Cards(8)}{!list.length&&<p className="sub">Prices coming soon.</p>}<p><button className="btn" onClick={()=>go('#/buy')}>See all bundles ›</button></p></section>
  <section className="sec"><h2>How it works</h2><div className="steps">{[['Choose a service','Pick a bundle, voucher, airtime or any other service.'],['Pay with MoMo','Fill in your details and pay securely with Paystack.'],['Get it done','We complete your order straight after payment.']].map(([t,d],i)=><div className="sv" key={t}><b className="n">{i+1}</b><b>{t}</b><small>{d}</small></div>)}</div></section>
  <section className="sec"><h2>Why RicheyData</h2><div className="steps">{[['zap','Fast delivery','Orders are sent as soon as payment is confirmed.'],['lock','Secure payments','Payments are handled by Paystack.'],['inf','No expiry','Our listed data bundles come with no expiry.'],['clock','24/7 support','Chat with us on WhatsApp any time.']].map(([i,t,d])=><div className="sv" key={t}><span className="ic"><Icon n={i}/></span><b>{t}</b><small>{d}</small></div>)}</div></section>
  <section className="sec" id="faq"><h2>Questions</h2>{[['How long does delivery take?','Most orders arrive within minutes. It can take longer when the network is busy. Use Track Order with your reference to check.'],['What if I enter the wrong number?','Data sent to a wrong number cannot be reversed, so please double-check the number before you pay.'],['Do I need an account?','No. Choose a service, fill in your details and pay.'],['Who do I contact for help?','Message us on WhatsApp and quote your order reference.']].map(([q,a])=><details key={q}><summary>{q}</summary><p>{a}</p></details>)}</section></>:<main><h1>Page not found</h1><p className="sub">The page you are looking for does not exist.</p><button className="pay" style={{width:'auto'}} onClick={()=>go('#/')}>Back to home</button></main>}
 <footer className="ft"><div className="cols"><div><button className="logo" onClick={()=>go('#/')}><img src={logo} alt=""/>RicheyData</button><p>Affordable data bundles and digital services for Ghana.</p></div>
  <div><h4>Quick links</h4><button onClick={()=>go('#/')}>Home</button><button onClick={()=>go('#/buy')}>Buy data</button><button onClick={()=>go('#/buy')}>Track order</button><button onClick={()=>to('faq')}>FAQ</button></div>
  <div><h4>Services</h4>{SV.slice(1,6).map(x=><button key={x[0]} onClick={()=>go(x[3])}>{x[1]}</button>)}</div>
  <div><h4>Contact</h4><a href={WA} target="_blank" rel="noreferrer">WhatsApp {PHONE}</a><a href={JOIN} target="_blank" rel="noreferrer">Join our channel</a></div></div>
  <div className="copy">© {new Date().getFullYear()} richdata.shop · <button onClick={()=>go('#/terms')}>Terms</button> · <button onClick={()=>go('#/privacy')}>Privacy</button></div></footer>
 <a className="wafl" href={JOIN} target="_blank" rel="noreferrer" aria-label="Join our WhatsApp channel"><span>Click to join channel</span><i><svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/></svg></i></a>
 {ref&&<div className="ov" onClick={()=>setRef(null)}><div className="sheet" onClick={e=>e.stopPropagation()}><h2>{st==='failed'?'There was a problem':'Thank you!'}</h2><p>{st?MSG[st]:'Checking your order...'}</p><p className="note">Reference: {ref}</p><button className="pay" onClick={()=>setRef(null)}>Back to home</button>{auth.verified&&<button className="ghost" style={{width:'100%',marginTop:10}} onClick={()=>{setRef(null);go('#/account')}}>View my orders</button>}</div></div>}
 {showWel&&<div className="ov" onClick={closeWel}><div className="sheet" onClick={e=>e.stopPropagation()}><h2>Welcome to RicheyData</h2><p>Create a free account to track your orders and check out faster. You can also buy without an account.</p><button className="pay" onClick={()=>{closeWel();go('#/signup')}}>Create account</button><button className="ghost" style={{width:'100%',marginTop:10}} onClick={()=>{closeWel();go('#/login')}}>Log in</button><button className="x" onClick={closeWel}>Continue as guest</button></div></div>}
 {sel&&<div className="ov" onClick={()=>!busy&&setSel(null)}><div className="sheet" onClick={e=>e.stopPropagation()}><h2>{sel.name} {sel.network} Bundle</h2><p>₵{Number(sel.price).toFixed(2)} • No Expiry</p>
  <label>Number to receive data<input inputMode="tel" placeholder="0241234567" value={phone} onChange={e=>setPhone(e.target.value)}/></label>
  <label>Email (optional, for your receipt)<input type="email" value={email} onChange={e=>setEmail(e.target.value)}/></label>
  {!user&&<p className="note">Have an account? <button className="lnkb" onClick={()=>{setSel(null);go('#/login')}}>Log in</button> or <button className="lnkb" onClick={()=>{setSel(null);go('#/signup')}}>create one</button> to save your orders.</p>}
  {err&&<p className="err">{err}</p>}<Bar on={busy}/><button className={'pay'+(busy?' ld':'')} disabled={busy} onClick={pay}>{busy?'Please wait...':`Pay ₵${Number(sel.price).toFixed(2)}`}</button><button className="x" onClick={()=>setSel(null)}>Cancel</button></div></div>}</>}
const PL={checker:'Phone number to receive the voucher by SMS',afa:'Applicant phone number',airtime:'Number to top up',bill:'Your phone number',standard:'Number to receive the bundle',sms:'Your phone number'}
function Svc({svc,user}){
 const T=SV.find(x=>x[0]===svc),[items,setItems]=useState(null),[f,setF]=useState({qty:1,region:REG[0]}),[busy,setBusy]=useState(false),[err,setErr]=useState(''),[lk,setLk]=useState(null)
 const u=k=>e=>setF({...f,[k]:e.target.value})
 useEffect(()=>{if(!T)return;sb.from('service_prices').select('*').eq('service',svc).eq('active',true).then(({data})=>{const l=data||[];setItems(l);setF(x=>({...x,item:l[0]?.item_key}))})},[svc])
 useEffect(()=>{if(user?.email)setF(x=>({...x,email:x.email||user.email}))},[user])
 if(!T||svc==='data')return <main><h1>Page not found</h1><p className="sub">Please go back to the home page.</p></main>
 const it=items?.find(x=>x.item_key===f.item),price=Number(it?.price||0),amt=Number(f.amount)||0
 const rc=(f.recipients||'').split(/[\s,;]+/).filter(x=>/^0\d{9}$/.test(x)),segs=Math.ceil(((f.message||'').length||1)/(/[^\x00-\x7F]/.test(f.message||'')?70:160))
 const total=!it?0:{checker:price*Math.max(1,Math.min(5,+f.qty||1)),afa:price,standard:price,sms:price*segs*rc.length,airtime:Math.ceil(amt*(1+price/100)*100-1e-9)/100,bill:amt+price}[svc]
 const pay=async()=>{setErr('');setBusy(true);const details={phone:f.phone,qty:f.qty,amount:f.amount,account:f.account,full_name:f.full_name,id_number:f.id_number,date_of_birth:f.date_of_birth,region:f.region,location:f.location,message:f.message,recipients:rc}
  const{data,error}=await sb.functions.invoke('create-service-order',{body:{service:svc,item_key:f.item,email:f.email,details}})
  if(error||!data?.url){setBusy(false);let m=data?.error;if(!m&&error?.context?.json)m=(await error.context.json().catch(()=>({}))).error;return setErr(m||'Could not start payment. Try again.')}
  location.href=data.url}
 const look=async()=>{setLk(null);setErr('');const{data}=await sb.functions.invoke('service-lookup',{body:{biller:f.item,account:f.account||f.phone,phone:f.phone}});if(data?.error)return setErr(data.error);setLk(data)}
 return <main className="fm"><h1>{T[1]}</h1><p className="sub">{T[2]}</p>
 {items===null?<p>Loading...</p>:!items.length?<div className="box"><p>This service isn't available right now. Please check back soon.</p></div>:<div className="box">
  {['checker','airtime','bill','standard'].includes(svc)&&<label>{{checker:'Voucher type',airtime:'Network',bill:'Biller',standard:'Bundle'}[svc]}<select value={f.item||''} onChange={e=>{setF({...f,item:e.target.value});setLk(null)}}>{items.map(x=><option key={x.item_key} value={x.item_key}>{x.label}{['checker','standard'].includes(svc)?` (₵${Number(x.price).toFixed(2)})`:''}</option>)}</select></label>}
  {svc==='checker'&&<label>Quantity<select value={f.qty} onChange={u('qty')}>{[1,2,3,4,5].map(n=><option key={n}>{n}</option>)}</select></label>}
  {svc==='afa'&&<><label>Full name<input value={f.full_name||''} onChange={u('full_name')}/></label><label>Ghana Card number<input placeholder="GHA-123456789-0" value={f.id_number||''} onChange={u('id_number')}/></label><label>Date of birth<input type="date" value={f.date_of_birth||''} onChange={u('date_of_birth')}/></label><label>Region<select value={f.region} onChange={u('region')}>{REG.map(x=><option key={x}>{x}</option>)}</select></label><label>Location / town<input value={f.location||''} onChange={u('location')}/></label></>}
  {svc==='airtime'&&<label>Amount (GH₵)<input type="number" min="1" max="500" value={f.amount||''} onChange={u('amount')}/></label>}
  {svc==='bill'&&<><label>Account / meter / smartcard number<input value={f.account||''} onChange={e=>{setF({...f,account:e.target.value});setLk(null)}}/></label><button type="button" className="btn" onClick={look}>Verify account</button>
   {lk&&<p className="note">{lk.account_name?`${lk.account_name}${lk.amount_due!=null?`, amount due ₵${Number(lk.amount_due).toFixed(2)}`:''}`:'Choose your meter:'}</p>}{lk?.meters?.length>0&&<div className="mt">{lk.meters.map(m=><button key={m.meterNumber} onClick={()=>setF({...f,account:m.meterNumber})}>{m.name} {m.meterNumber}</button>)}</div>}
   <label>Amount (GH₵)<input type="number" min="1" max="1000" value={f.amount||''} onChange={u('amount')}/></label>{price>0&&<p className="note">Service fee: ₵{price.toFixed(2)}</p>}</>}
  {svc==='sms'&&<><label>Message<textarea rows="4" value={f.message||''} onChange={u('message')}/></label><label>Numbers to send to (separate with commas or new lines)<textarea rows="3" value={f.recipients||''} onChange={u('recipients')}/></label><p className="note">{rc.length} valid number(s), {segs} SMS part(s) each</p></>}
  <label>{PL[svc]}<input inputMode="tel" placeholder="0241234567" value={f.phone||''} onChange={u('phone')}/></label>
  <label>Email (optional, for your receipt)<input type="email" value={f.email||''} onChange={u('email')}/></label>
  {total>0&&<p className="tot">Total: ₵{total.toFixed(2)}</p>}{err&&<p className="err">{err}</p>}
  <Bar on={busy}/><button className={'pay'+(busy?' ld':'')} disabled={busy||!(total>0)} onClick={pay}>{busy?'Please wait...':total>0?`Pay ₵${total.toFixed(2)}`:'Fill in the details'}</button></div>}</main>}
function Legal({k}){const t=k==='/terms'
 return <main className="legal"><h1>{t?'Terms of Service':'Privacy Policy'}</h1><p className="note">Last updated: 3 November 2026</p>{t?<>
 <p>RicheyData (richdata.shop) sells data bundles and related digital services in Ghana. By placing an order or creating an account you agree to these terms.</p>
 <p><b>Accounts.</b> You can buy without an account. If you create one, give a real email address and phone number, keep your password private, and verify your phone with the code we text you. One phone number can be used on one account. We may suspend accounts that are misused.</p>
 <p><b>Orders and payments.</b> Payments are processed by Paystack. Your order is completed after payment is confirmed. Delivery time depends on the network and our service providers and can vary.</p>
 <p><b>Check your details.</b> Data, airtime, vouchers or bill payments sent to a wrong number or account cannot be reversed. Prices can change without notice, but the price you see when you pay is the price you are charged.</p>
 <p><b>Help.</b> If something goes wrong with an order, contact us on WhatsApp with your order reference and we will look into it.</p></>:<>
 <p>This policy explains what RicheyData collects and how we use it.</p>
 <p><b>What we collect.</b> For a guest order: the phone number that receives the order, an optional email address and the order details. For an account: your full name, email address, phone number and order history. Your password is handled by our authentication provider and we never see it. For AFA registration we also collect the details you enter, including your Ghana Card number, only to complete the registration.</p>
 <p><b>Phone verification.</b> When you create an account we send a one-time code by SMS (sender name "RicheyData") to confirm your phone number. The code expires after 10 minutes.</p>
 <p><b>Payments.</b> Payments are handled by Paystack. We do not see or store your card details or mobile money PIN.</p>
 <p><b>Who receives your information.</b> Only the service providers we need to complete your order: Paystack for payments, our supplier for fulfilling orders and sending SMS, and our hosting and database provider. We do not sell your information.</p>
 <p><b>Your choices.</b> You can ask us to correct or delete your account information by messaging us on WhatsApp. We keep order records as long as needed for support, accounting and legal reasons.</p>
 <p><b>Security.</b> Your account data is protected so that you can only see your own orders.</p></>}</main>}
