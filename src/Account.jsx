import {useEffect,useRef,useState} from 'react'
import {supabase as sb} from './supabase'
const strong=p=>p.length>=8&&/[A-Za-z]/.test(p)&&/\d/.test(p)&&/[^A-Za-z0-9]/.test(p)
const PWMSG='Password needs at least 8 characters with a letter, a number and a special character (like @ # ! $).'
const errMsg=async(data,error,d='Something went wrong. Please try again.')=>data?.error||(error?.context?.json?(await error.context.json().catch(()=>({}))).error:null)||d
export function useAuth(){
 const[session,setS]=useState(null),[profile,setP]=useState(null),[ready,setR]=useState(false)
 const load=async s=>{if(!s){setP(null);return}const{data}=await sb.from('profiles').select('full_name,phone,phone_verified,email').eq('user_id',s.user.id).maybeSingle();setP(data)}
 useEffect(()=>{sb.auth.getSession().then(({data})=>{setS(data.session);load(data.session).then(()=>setR(true))})
  const{data}=sb.auth.onAuthStateChange((e,s)=>{setS(s);setTimeout(()=>load(s),0);if(e==='PASSWORD_RECOVERY')location.hash='#/reset'});return()=>data.subscription.unsubscribe()},[])
 return{session,profile,ready,verified:!!(session&&profile?.phone_verified),reload:()=>load(session)}
}
const Eye=({on})=><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{on?<><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></>:<><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>}</svg>
function Pw({value,onChange,onKeyDown,placeholder}){const[s,setS]=useState(false);return <div className="pwf"><input type={s?'text':'password'} value={value} onChange={onChange} onKeyDown={onKeyDown} placeholder={placeholder}/><button type="button" aria-label={s?'Hide password':'Show password'} onClick={()=>setS(!s)}><Eye on={s}/></button></div>}
export const Bar=({on})=>on?<div className="topbar" role="progressbar" aria-label="Loading"><i/></div>:null
const cls=b=>'pay'+(b?' ld':'')
const Wrap=({t,sub,children})=><main className="fm"><h1>{t}</h1>{sub&&<p className="sub">{sub}</p>}<div className="box">{children}</div></main>
export function Signup({go}){
 const[f,setF]=useState({name:'',email:'',phone:'',pw:'',pw2:'',ok:false}),[err,setErr]=useState(''),[busy,setBusy]=useState(false),u=k=>e=>setF({...f,[k]:e.target.type==='checkbox'?e.target.checked:e.target.value})
 const run=async()=>{setErr('');const em=f.email.trim().toLowerCase(),nm=f.name.trim()
  if(nm.length<3)return setErr('Enter your full name.')
  if(!/^\S+@\S+\.\S+$/.test(em))return setErr('Enter a valid email address.')
  if(!/^0\d{9}$/.test(f.phone))return setErr('Enter a valid 10-digit phone number, e.g. 0241234567.')
  if(!strong(f.pw))return setErr(PWMSG);if(f.pw!==f.pw2)return setErr('Passwords do not match.')
  if(!f.ok)return setErr('Please accept the Terms and the Privacy Policy.')
  setBusy(true);const{data,error}=await sb.auth.signUp({email:em,password:f.pw,options:{data:{phone:f.phone,full_name:nm}}});setBusy(false)
  if(error){console.error('signup error',error);const c=(error.code||'')+' '+(error.message||'')
   return setErr(/already|exists|registered/i.test(c)?'This email is already registered. Log in instead, or use a different email.':/weak|password/i.test(c)?'That password was not accepted. Use at least 8 characters with letters, a number and a symbol (try adding a capital letter).':/rate|too many|seconds/i.test(c)?'Too many attempts. Please wait a minute and try again.':/database error/i.test(c)?'We could not save your account. This phone number may already be used on another account. If not, message us on WhatsApp.':'Could not create the account. Please check your details and try again.')}
  if(!data.session)return setErr('Account created. Please confirm your email, then log in.')
  go('#/verify')}
 return <main className="fm"><h1>Create account</h1><p className="sub">Join RicheyData. We text a code to your phone to verify it.</p>
  <button className="skip" onClick={()=>go('#/buy')}><span><b>Want to buy now?</b><small>Skip signup and purchase directly</small></span><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg></button>
  <div className="box"><label>Full name<input value={f.name} onChange={u('name')}/></label><label>Email<input type="email" value={f.email} onChange={u('email')}/></label><label>Phone number<input inputMode="tel" placeholder="0241234567" value={f.phone} onChange={u('phone')}/></label>
  <label>Password<Pw value={f.pw} onChange={u('pw')}/></label><p className="note">At least 8 characters with a letter, a number and a special character.</p><label>Confirm password<Pw value={f.pw2} onChange={u('pw2')}/></label>
  <label style={{fontWeight:400}}><input type="checkbox" checked={f.ok} onChange={u('ok')}/>I agree to the <a href="#/terms">Terms</a> and the <a href="#/privacy">Privacy Policy</a>.</label>
  {err&&<p className="err">{err}</p>}<Bar on={busy}/><button className={cls(busy)} disabled={busy} onClick={run}>{busy?'Creating account...':'Create account'}</button><p className="note">Already have an account? <button className="lnk" onClick={()=>go('#/login')}>Log in</button></p></div></main>}
export function Login({go}){
 const[e,setE]=useState(''),[p,setP]=useState(''),[err,setErr]=useState(''),[msg,setMsg]=useState(()=>{try{for(const[k,t]of[['rd_just_verified','Your phone number is verified. Please log in to continue.'],['rd_just_reset','Your password was changed. Please log in with your new password.']])if(sessionStorage.getItem(k)){sessionStorage.removeItem(k);return t}}catch{}return ''}),[busy,setBusy]=useState(false)
 const run=async()=>{setErr('');setMsg('');const id=e.trim().replace(/[\s-]/g,'').toLowerCase(),isPhone=/^0\d{9}$/.test(id)
  if(!id||!p)return setErr('Enter your email or phone number, and your password.')
  if(!isPhone&&!/^\S+@\S+\.\S+$/.test(id))return setErr('Enter a valid email, or a 10-digit phone number like 0241234567.')
  setBusy(true);let uid
  if(isPhone){const{data,error}=await sb.functions.invoke('phone-login',{body:{phone:id,password:p}})
   if(!data?.access_token){setBusy(false);return setErr(await errMsg(data,error,'Wrong phone number or password.'))}
   const{data:s,error:se}=await sb.auth.setSession({access_token:data.access_token,refresh_token:data.refresh_token})
   if(se||!s?.user){setBusy(false);return setErr('Could not log you in. Please try again.')}
   uid=s.user.id}
  else{const{data,error}=await sb.auth.signInWithPassword({email:id,password:p});if(error){setBusy(false);return setErr('Wrong email or password.')};uid=data.user.id}
  const{data:pr}=await sb.from('profiles').select('phone_verified').eq('user_id',uid).maybeSingle();setBusy(false);go(pr?.phone_verified?'#/':'#/verify')}
 return <Wrap t="Log in" sub="Log in to see your orders. You can still buy without an account."><label>Email or phone number<input value={e} autoComplete="username" placeholder="you@email.com or 0241234567" onChange={x=>setE(x.target.value)}/></label><label>Password<Pw value={p} onChange={x=>setP(x.target.value)} onKeyDown={x=>x.key==='Enter'&&run()}/></label>
  {err&&<p className="err">{err}</p>}{msg&&<p className="note">{msg}</p>}<Bar on={busy}/><button className={cls(busy)} disabled={busy} onClick={run}>{busy?'Logging in...':'Log in'}</button>
  <p className="note"><button className="lnk" onClick={()=>go('#/forgot')}>Forgot password?</button> · No account? <button className="lnk" onClick={()=>go('#/signup')}>Create one</button></p></Wrap>}
export function Forgot({go}){
 const[id,setId]=useState(''),[step,setStep]=useState(1),[code,setCode]=useState(''),[a,setA]=useState(''),[b,setB]=useState(''),[msg,setMsg]=useState(''),[bad,setBad]=useState(false),[busy,setBusy]=useState(false),[cool,setCool]=useState(0)
 useEffect(()=>{if(!cool)return;const t=setTimeout(()=>setCool(cool-1),1000);return()=>clearTimeout(t)},[cool])
 const norm=()=>id.trim().replace(/[\s-]/g,'').toLowerCase()
 const send=async()=>{setMsg('');setBad(false);const v=norm()
  if(!/^0\d{9}$/.test(v)&&!/^\S+@\S+\.\S+$/.test(v)){setBad(true);return setMsg('Enter your phone number (like 0241234567) or your email.')}
  setBusy(true);const{data,error}=await sb.functions.invoke('reset-request',{body:{identifier:v}});setBusy(false)
  if(data?.sent){setStep(2);setCool(60);return setMsg('If an account matches, we have sent a 6-digit code by SMS to the phone number on it. It expires in 10 minutes.')}
  setBad(true);setMsg(await errMsg(data,error))}
 const save=async()=>{setMsg('');setBad(true)
  if(!/^\d{6}$/.test(code))return setMsg('Enter the 6-digit code from the SMS.')
  if(!strong(a))return setMsg(PWMSG);if(a!==b)return setMsg('Passwords do not match.')
  setBusy(true);const{data,error}=await sb.functions.invoke('reset-confirm',{body:{identifier:norm(),code,password:a}});setBusy(false)
  if(data?.reset){try{sessionStorage.setItem('rd_just_reset','1')}catch{}return go('#/login')}
  setMsg(await errMsg(data,error,'Could not reset the password. Please try again.'))}
 return <Wrap t="Reset your password" sub={step===1?'Enter your phone number or email. We will text a 6-digit code to the phone number on your account.':'Enter the code we texted you and choose a new password.'}>
  {step===1?<><label>Phone number or email<input value={id} autoComplete="username" placeholder="0241234567 or you@email.com" onChange={e=>setId(e.target.value)} onKeyDown={e=>e.key==='Enter'&&send()}/></label>
   {msg&&<p className={bad?'err':'note'}>{msg}</p>}<Bar on={busy}/><button className={cls(busy)} disabled={busy} onClick={send}>{busy?'Sending code...':'Send code'}</button></>
  :<><label>6-digit code<input inputMode="numeric" maxLength={6} placeholder="123456" value={code} onChange={e=>setCode(e.target.value.replace(/\D/g,''))}/></label>
   <label>New password<Pw value={a} onChange={e=>setA(e.target.value)}/></label><p className="note">At least 8 characters with a letter, a number and a special character.</p><label>Confirm new password<Pw value={b} onChange={e=>setB(e.target.value)} onKeyDown={e=>e.key==='Enter'&&save()}/></label>
   {msg&&<p className={bad?'err':'note'}>{msg}</p>}<Bar on={busy}/><button className={cls(busy)} disabled={busy} onClick={save}>{busy?'Saving...':'Save new password'}</button>
   <p className="note">No code? <button className="lnk" disabled={cool>0||busy} onClick={send}>{cool>0?`Resend in ${cool}s`:'Send a new code'}</button> · <button className="lnk" onClick={()=>{setStep(1);setMsg('');setCode('')}}>Use a different number</button></p></>}
  <p className="note"><button className="lnk" onClick={()=>go('#/login')}>Back to log in</button></p></Wrap>}
export function Reset({go}){
 const[a,setA]=useState(''),[b,setB]=useState(''),[m,setM]=useState('')
 const run=async()=>{if(!strong(a))return setM(PWMSG);if(a!==b)return setM('Passwords do not match.');const{error}=await sb.auth.updateUser({password:a});if(error)return setM('Could not change the password. Open the reset link from your email again.');go('#/account')}
 return <Wrap t="Choose a new password"><label>New password<Pw value={a} onChange={x=>setA(x.target.value)}/></label><label>Confirm password<Pw value={b} onChange={x=>setB(x.target.value)}/></label>{m&&<p className="err">{m}</p>}<button className="pay" onClick={run}>Save password</button></Wrap>}
export function Verify({auth,go}){
 const[code,setCode]=useState(''),[msg,setMsg]=useState(''),[bad,setBad]=useState(false),[busy,setBusy]=useState(false),[cool,setCool]=useState(0),[sn,setSn]=useState(false),sent=useRef(false)
 const send=async auto=>{setMsg('');setBad(false);setSn(true);const{data,error}=await sb.functions.invoke('send-otp');setSn(false);if(data?.sent){setCool(60);return setMsg('Code sent by SMS. It expires in 10 minutes.')}const t=await errMsg(data,error);if(auto===true&&/wait a minute|Too many codes/i.test(t))return setMsg('A code was sent to your phone recently. Enter it below, or tap "Send code" for a new one.');setBad(true);setMsg(t)}
 useEffect(()=>{if(!cool)return;const t=setTimeout(()=>setCool(cool-1),1000);return()=>clearTimeout(t)},[cool])
 useEffect(()=>{if(auth.session&&auth.profile&&!auth.profile.phone_verified&&!sent.current){sent.current=true;send(true)}},[auth.session,auth.profile])
 const check=async()=>{setMsg('');setBad(false);if(!/^\d{6}$/.test(code)){setBad(true);return setMsg('Enter the 6-digit code.')}setBusy(true);const{data,error}=await sb.functions.invoke('verify-otp',{body:{code}});setBusy(false)
  if(data?.verified){try{sessionStorage.setItem('rd_just_verified','1')}catch{}await sb.auth.signOut();return go('#/login')}setBad(true);setMsg(await errMsg(data,error,'Wrong code. Try again.'))}
 if(!auth.ready)return <main><p>Loading...</p></main>
 if(!auth.session)return <Wrap t="Verify your phone" sub="Please log in first."><button className="pay" onClick={()=>go('#/login')}>Log in</button></Wrap>
 if(auth.profile?.phone_verified)return <Wrap t="Phone verified"><p>Your phone number is verified.</p><button className="pay" onClick={()=>go('#/account')}>Go to my account</button></Wrap>
 const ph=auth.profile?.phone||''
 return <Wrap t="Verify your phone" sub={`Your account is ready once you confirm your number. We texted a 6-digit code to ${ph?ph.slice(0,3)+'****'+ph.slice(-3):'your phone'}.`}><label>Verification code<input inputMode="numeric" maxLength={6} placeholder="123456" value={code} onChange={e=>setCode(e.target.value.replace(/\D/g,''))} onKeyDown={e=>e.key==='Enter'&&check()}/></label>
  {msg&&<p className={bad?'err':'note'}>{msg}</p>}<Bar on={busy||sn}/><button className={cls(busy)} disabled={busy} onClick={check}>{busy?'Checking...':'Verify'}</button>
  <p className="note">Did not get a code? <button className="lnk" disabled={cool>0||sn} onClick={()=>send()}>{cool>0?`Resend in ${cool}s`:'Send code'}</button></p>
  <p className="note"><button className="lnk" onClick={async()=>{await sb.auth.signOut();go('#/')}}>Log out</button></p></Wrap>}
export function Account({auth,go}){
 const[o,setO]=useState(null),[a,setA]=useState(''),[m,setM]=useState(''),[sv,setSv]=useState(false),v=auth.verified
 useEffect(()=>{if(v)sb.rpc('my_orders').then(({data})=>setO(data||[]))},[v])
 useEffect(()=>{if(auth.ready&&auth.session&&auth.profile&&!auth.profile.phone_verified)go('#/verify')},[auth.ready,auth.session,auth.profile])
 if(!auth.ready)return <main><p>Loading...</p></main>
 if(!auth.session)return <Wrap t="My account" sub="Log in to see your orders."><button className="pay" onClick={()=>go('#/login')}>Log in</button><p className="note">No account? <button className="lnk" onClick={()=>go('#/signup')}>Create one</button></p></Wrap>
 if(!v)return <main><p>Loading...</p></main>
 const lab=s=>({pending:'Awaiting payment',paid:'Paid',processing:'Processing',delivered:'Completed',failed:'Failed'}[s]||s),col=s=>({delivered:'#16a34a',failed:'#b91c1c',pending:'#6b7280'}[s]||'#b45309')
 const save=async()=>{if(!strong(a))return setM(PWMSG);setSv(true);const{error}=await sb.auth.updateUser({password:a});setSv(false);setM(error?(/same|different/i.test((error.code||'')+' '+(error.message||''))?'Choose a password different from your current one.':'Could not change the password. Try a different one.'):'Password changed.');if(!error)setA('')}
 return <main className="fm"><h1>{auth.profile?.full_name?`Hi, ${auth.profile.full_name.split(' ')[0]}`:'My account'}</h1><p className="sub">{auth.session.user.email} • {auth.profile?.phone}</p>
  <div className="box"><h2>Order history</h2>{o===null?<p>Loading...</p>:!o.length?<p className="note">No orders yet. Orders you place, and orders sent to your verified phone number, will show here.</p>:o.map(x=><div className="oh" key={x.reference}><div><b>{x.bundle_name}</b><small>{x.network} • {new Date(x.created_at).toLocaleString()}<br/>Ref {x.reference}</small></div><div className="rt"><b>₵{Number(x.amount).toFixed(2)}</b><span style={{color:col(x.status),fontWeight:700}}>{lab(x.status)}</span><button className="lnkb" onClick={()=>{location.href='/?reference='+encodeURIComponent(x.reference)}}>Track</button></div></div>)}</div>
  <div className="box" style={{marginTop:14}}><h2>Change password</h2><Pw value={a} onChange={e=>setA(e.target.value)} placeholder="New password"/><p className="note">At least 8 characters with a letter, a number and a special character.</p>{m&&<p className="note">{m}</p>}<Bar on={sv}/><button className={cls(sv)} disabled={sv} onClick={save}>{sv?'Saving...':'Save password'}</button></div>
  <button className="x" onClick={async()=>{await sb.auth.signOut();go('#/')}}>Log out</button></main>}
