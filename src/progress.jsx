import {useEffect,useState} from 'react'
let n=0;const subs=new Set(),emit=()=>subs.forEach(f=>f(n))
export const startProgress=()=>{n++;emit()}
export const stopProgress=()=>setTimeout(()=>{n=Math.max(0,n-1);emit()},300)
export function Progress(){const[c,setC]=useState(n);useEffect(()=>{subs.add(setC);return()=>subs.delete(setC)},[]);return <div className="topbar" style={{opacity:c>0?1:0}}><i/></div>}
export function useBusy(){const[b,setB]=useState(false);useEffect(()=>{if(!b)return;startProgress();return()=>stopProgress()},[b]);return[b,setB]}
