import React,{useMemo,useState} from 'react';
import {Plus,BookOpen,Search,ChevronDown,ChevronRight,Pencil,Trash2,CalendarDays,UserRound} from 'lucide-react';

const uid=()=>globalThis.crypto?.randomUUID?.()||`minutes_${Date.now()}_${Math.random().toString(36).slice(2)}`;
const today=()=>{const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`};
const blank=()=>({id:uid(),date:today(),title:'',meetingId:'',personId:'',personName:'',conversation:'',reflection:'',lessons:'',nextSteps:'',createdAt:new Date().toISOString()});
export default function MeetingNotes({notes=[],meetings=[],roleModels=[],onChange,notify,storageKey='meetingNotes',isMen=false,isClass=false}){
 const [query,setQuery]=useState(''),[expanded,setExpanded]=useState(null),[edit,setEdit]=useState(null);
 const people=useMemo(()=>new Map(roleModels.map(p=>[p.id,p.name])),[roleModels]);
 const meetingsById=useMemo(()=>new Map(meetings.map(m=>[m.id,m])),[meetings]);
 const meetingName=m=>[m.date,m.title,m.personId?people.get(m.personId):m.personName].filter(Boolean).join(' · ');
 const displayPerson=n=>people.get(n.personId)||n.personName||'';
 const rows=[...notes].filter(n=>[n.title,n.date,n.personName,people.get(n.personId),n.conversation,n.reflection,n.lessons,n.nextSteps].some(value=>String(value||'').toLocaleLowerCase().includes(query.toLocaleLowerCase()))).sort((a,b)=>String(b.date||'').localeCompare(String(a.date||''))||String(b.createdAt||'').localeCompare(String(a.createdAt||'')));
 const selectMeeting=id=>{const meeting=meetingsById.get(id);setEdit(old=>({...old,meetingId:id, ...(meeting?{date:meeting.date,personId:meeting.personId||'',personName:meeting.personName||'',title:old.title||meeting.title}: {})}))};
 const save=e=>{e.preventDefault();const title=edit?.title?.trim();if(!title){notify((isMen?'후기':'회의록')+' 제목을 적어 줘.');return;}
 const record={...edit,title};
 onChange(s=>({...s,[storageKey]:(s[storageKey]||[]).some(n=>n.id===record.id)?(s[storageKey]||[]).map(n=>n.id===record.id?record:n):[...(s[storageKey]||[]),record]}));
 setEdit(null);setExpanded(record.id);notify((isMen?'후기':'회의록')+'를 저장했어.');
 };
 const remove=id=>{if(!window.confirm((isMen?'이 후기를':'이 회의록을')+' 삭제할까? 만남 일정은 유지돼.'))return;onChange(s=>({...s,[storageKey]:(s[storageKey]||[]).filter(n=>n.id!==id)}));if(expanded===id)setExpanded(null);notify((isMen?'후기':'회의록')+'를 삭제했어.')};
 return <section className="screen meeting-notes-screen">
 <div className="heading"><div><h1>{isMen?'후기':'회의록'}</h1><p>{isClass?'수강 후 배운 내용과 만족도, 다음에 시도할 점을 기록해.':'만났던 사람과 나눈 이야기, 배운 점, 느낀 점을 회고해.'}</p></div><button type="button" className="small-btn" onClick={()=>setEdit(blank())}><Plus size={16}/> {isMen?'후기':'회의록'}</button></div>
 <label className="search"><Search size={17}/><input type="search" placeholder="사람·제목·회고 내용 검색" value={query} onChange={e=>setQuery(e.target.value)}/></label>
 <div className="list-heading"><b>만남 기록</b><span>{rows.length}개</span></div>
 {rows.map(n=>{const open=expanded===n.id,person=displayPerson(n);return <article className="person-card meeting-note-card" key={n.id}>
  <button type="button" className="person-head" aria-expanded={open} onClick={()=>setExpanded(open?null:n.id)}>
   <span className="meeting-note-symbol"><BookOpen size={19}/></span><div><b>{n.title}</b><small>{[n.date,person].filter(Boolean).join(' · ')}</small></div>{open?<ChevronDown size={18}/>:<ChevronRight size={18}/>}
  </button>
  {open&&<div className="person-detail meeting-note-detail">
   {n.meetingId&&meetingsById.has(n.meetingId)&&<p className="meeting-note-linked"><CalendarDays size={15}/> 연결된 만남: {meetingName(meetingsById.get(n.meetingId))}</p>}
   {n.conversation&&<p><b>{isClass?'수업 내용·기록':'나눈 이야기 · 회의 내용'}</b>{n.conversation}</p>}
   {n.reflection&&<p><b>{isClass?'수강 후기 · 느낀 점':'만남 회고 · 느낀 점'}</b>{n.reflection}</p>}
   {n.lessons&&<p><b>{isClass?'배운 기술 · 인사이트':'배운 점 · 인사이트'}</b>{n.lessons}</p>}
   {n.nextSteps&&<p><b>{isClass?'다음 수업 · 실천할 점':'다음 행동 · 후속 연락'}</b>{n.nextSteps}</p>}
   {!n.conversation&&!n.reflection&&!n.lessons&&!n.nextSteps&&<p className="muted">내용을 추가해서 만남을 기록해 봐.</p>}
   <div className="actions"><button type="button" onClick={()=>setEdit({...n})}><Pencil size={15}/> 수정</button><button type="button" onClick={()=>remove(n.id)}><Trash2 size={15}/> 삭제</button></div>
  </div>}
 </article>})}
 {!rows.length&&<div className="empty">{query?'검색 결과가 없어.':isMen?'만남 후기를 쓰면 여기에 쌓여.':'만남을 기록하면 여기에 회의록과 회고가 쌓여.'}</div>}
 {edit&&<div className="overlay" onMouseDown={e=>e.target===e.currentTarget&&setEdit(null)}>
  <form className="dialog meeting-notes-editor" onSubmit={save}>
   <div className="dialog-heading"><h2>{isMen?'후기':'회의록'} {notes.some(n=>n.id===edit.id)?'수정':'등록'}</h2><button type="button" onClick={()=>setEdit(null)}>닫기</button></div>
   <label>만남 일정 연결 (선택)<select value={edit.meetingId||''} onChange={e=>selectMeeting(e.target.value)}><option value="">연결하지 않고 직접 기록</option>{[...meetings].sort((a,b)=>String(b.date).localeCompare(String(a.date))).map(m=><option key={m.id} value={m.id}>{meetingName(m)}</option>)}</select></label>
   <label>날짜<input required type="date" value={edit.date||today()} onChange={e=>setEdit(s=>({...s,date:e.target.value}))}/></label>
   <label>제목<input required maxLength={140} value={edit.title||''} placeholder="예: 문화기획자와의 대화" onChange={e=>setEdit(s=>({...s,title:e.target.value}))}/></label>
   <label>{isClass?'연결할 강좌 (선택)':'연결할 롤모델 (선택)'}<select value={edit.personId||''} onChange={e=>setEdit(s=>({...s,personId:e.target.value,personName:e.target.value?'':s.personName}))}><option value="">직접 입력 / 연결 없음</option>{roleModels.map(p=><option key={p.id} value={p.id}>{p.name}{p.field?' · '+p.field:''}</option>)}</select></label>
   {!edit.personId&&<label>만난 사람·단체 (선택)<input maxLength={140} placeholder="직접 입력" value={edit.personName||''} onChange={e=>setEdit(s=>({...s,personName:e.target.value}))}/></label>}
   <label>나눈 이야기 · 회의 내용<textarea rows={4} placeholder="무슨 이야기를 나눴는지 자유롭게 기록" value={edit.conversation||''} onChange={e=>setEdit(s=>({...s,conversation:e.target.value}))}/></label>
   <label>만남 회고 · 느낀 점<textarea rows={4} placeholder="기억에 남는 장면, 감정, 인상" value={edit.reflection||''} onChange={e=>setEdit(s=>({...s,reflection:e.target.value}))}/></label>
   <label>배운 점 · 인사이트<textarea rows={3} placeholder="내 커리어에 참고할 만한 점" value={edit.lessons||''} onChange={e=>setEdit(s=>({...s,lessons:e.target.value}))}/></label>
   <label>다음 행동 · 후속 연락<textarea rows={3} placeholder="새로 생긴 기회, 해야 할 일, 다음 만남" value={edit.nextSteps||''} onChange={e=>setEdit(s=>({...s,nextSteps:e.target.value}))}/></label>
   <button className="primary" type="submit">{isMen?'후기 저장':'회의록 저장'}</button>
  </form>
 </div>}
 </section>;
}
