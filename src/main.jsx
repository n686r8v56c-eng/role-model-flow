import React,{useEffect,useState,useRef} from 'react';
import {createRoot} from 'react-dom/client';
import {createClient} from '@supabase/supabase-js';
import App from './App.jsx';
import {useSyncedState} from './sync.js';
import './style.css';
import './inbox.css';
const url='https://rmhbqqparycnlfsagjwi.supabase.co';
const key='sb_publishable_ZVG7jdpFM69IhQaesvo08Q_Nk-X05BF';
const ready=!!url&&!!key&&/^https:\/\//.test(url);
const supabase=ready?createClient(url,key,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}}):null;
const INITIAL={projects:[],tasks:[],sessions:[],roleModels:[],inboxItems:[],inboxFolders:[]};
function AuthGate(){
 const [session,setSession]=useState(null),[loading,setLoading]=useState(true),[email,setEmail]=useState(''),[password,setPassword]=useState(''),[signUp,setSignUp]=useState(false),[busy,setBusy]=useState(false),[message,setMessage]=useState('');
 const {data,change,loading:dataLoading,error,canLogout}=useSyncedState(supabase,session?.user?.id,INITIAL);
 useEffect(()=>{if(!supabase){setLoading(false);return}let alive=true;supabase.auth.getSession().then(({data,error})=>{if(!alive)return;setSession(data?.session||null);setMessage(error?.message||'');setLoading(false)});const {data:{subscription}}=supabase.auth.onAuthStateChange((_event,s)=>{if(alive)setSession(s)});return()=>{alive=false;subscription.unsubscribe()}},[]);
 const login=async e=>{e.preventDefault();setBusy(true);setMessage('');try{const {data,error}=signUp?await supabase.auth.signUp({email,password}):await supabase.auth.signInWithPassword({email,password});if(error)throw error;if(signUp&&!data.session)setMessage('이메일 인증을 완료한 뒤 로그인해 줘.')}catch(e){setMessage(e.message||'로그인을 확인해 줘.')}finally{setBusy(false)}};
 if(!ready)return <div className="auth-page"><section className="auth-card"><h1>Role Model Flow</h1><p>Supabase 환경변수가 아직 등록되지 않았어.</p><p>Cloudflare Pages 환경변수에 VITE_SUPABASE_URL과 VITE_SUPABASE_ANON_KEY를 설정하고 SQL을 실행해 줘.</p></section></div>;
 if(loading||dataLoading)return <div className="auth-page"><div className="auth-card"><h1>Role Model Flow</h1><p>데이터를 불러오는 중…</p></div></div>;
 if(!session)return <div className="auth-page"><form className="auth-card" onSubmit={login}><div className="auth-symbol">✳</div><h1>Role Model Flow</h1><p>롤모델을 관찰하고, 나만의 커리어 기회를 모으는 공간</p><div className="auth-tabs"><button type="button" className={!signUp?'selected':''} onClick={()=>setSignUp(false)}>로그인</button><button type="button" className={signUp?'selected':''} onClick={()=>setSignUp(true)}>회원가입</button></div><label>이메일<input type="email" required autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)}/></label><label>비밀번호<input type="password" required minLength={6} autoComplete={signUp?'new-password':'current-password'} value={password} onChange={e=>setPassword(e.target.value)}/></label>{message&&<p role="alert" className="error">{message}</p>}<button className="primary" disabled={busy}>{busy?'처리 중…':signUp?'회원가입':'로그인'}</button></form></div>;
 if(!data)return <div className="auth-page"><div className="auth-card"><h1>연결 확인 필요</h1><p>{error||'데이터를 불러오지 못했어. 기존 기록은 덮어쓰지 않았어.'}</p><button onClick={()=>supabase.auth.signOut()}>로그아웃</button></div></div>;
 return <><App key={session.user.id} initialData={data} onDataChange={change} client={supabase} userId={session.user.id} onLogout={async()=>{if(await canLogout())await supabase.auth.signOut();else setMessage('동기화가 끝난 뒤 로그아웃해 줘.')}}/>{error&&<div className="sync-error" role="alert">{error}</div>}</>;
}
createRoot(document.getElementById('root')).render(<AuthGate/>);
