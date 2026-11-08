import { useEffect, useRef, useState } from 'react';
import { CAPTCHA_LIFETIME_MS, CaptchaTicket } from '@/lib/auth-captcha';

// Public widget identifier; the secret belongs only in Supabase Auth configuration.
export const TURNSTILE_SITE_KEY = '0x4AAAAAAFJW0t8cB9alXW3B';
type Turnstile = {render:(el:HTMLElement,options:Record<string,unknown>)=>string;remove:(id:string)=>void};
declare global { interface Window {turnstile?:Turnstile} }
let scriptReady:Promise<void>|undefined;
function loadScript(){
  if(window.turnstile)return Promise.resolve();
  if(!scriptReady)scriptReady=new Promise<void>((resolve,reject)=>{
    const script=document.createElement('script');script.src='https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';script.async=true;
    script.onload=()=>resolve();script.onerror=()=>{scriptReady=undefined;reject(new Error('Não foi possível carregar a verificação de segurança.'));};document.head.append(script);
  });
  return scriptReady;
}
export function AuthCaptcha({onToken}:{onToken:(token:CaptchaTicket|null)=>void}){
  const container=useRef<HTMLDivElement>(null);const callback=useRef(onToken);callback.current=onToken;
  const [error,setError]=useState('');
  const [attempt,setAttempt]=useState(0);
  useEffect(()=>{
    let disposed=false;let id:string|undefined;
    let ticket:CaptchaTicket|undefined;
    let expiry:ReturnType<typeof setTimeout>|undefined;
    const clear=()=>{clearTimeout(expiry);ticket?.invalidate();ticket=undefined;callback.current(null);};
    const fail=()=>{if(disposed)return;clear();setError('Verificação indisponível. Tente verificar novamente.');};
    void loadScript().then(()=>{
      if(disposed||!container.current||!window.turnstile)return;
      id=window.turnstile.render(container.current,{sitekey:TURNSTILE_SITE_KEY,theme:'auto',language:'pt-br',size:'flexible',callback:(token:string)=>{
        if(disposed)return;
        clear();
        try {ticket=new CaptchaTicket(token);setError('');callback.current(ticket);expiry=setTimeout(()=>{clear();setError('Verificação expirada. Verifique novamente.');},CAPTCHA_LIFETIME_MS);}
        catch{fail();}
      },'expired-callback':()=>{if(!disposed)clear();},'timeout-callback':fail,'error-callback':fail});
    }).catch(fail);
    return()=>{disposed=true;clear();if(id)window.turnstile?.remove(id);};
  },[attempt]);
  return <div><div ref={container}/>{error&&<><p role="alert" className="text-sm text-destructive">{error}</p><button type="button" className="text-sm underline" onClick={()=>{setError('');setAttempt(v=>v+1);}}>Verificar novamente</button></>}</div>;
}
