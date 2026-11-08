import React,{useMemo,useState} from 'react';
import {CalendarDays,Plus,ChevronLeft,ChevronRight,Clock3,MapPin,Pencil,Trash2,UserRound,ExternalLink} from 'lucide-react';

const pad=n=>String(n).padStart(2,'0');
const dateKey=(d)=>`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
const today=()=>dateKey(new Date());
const uid=()=>globalThis.crypto?.randomUUID?.()||`meet_${Date.now()}_${Math.random().toString(36).slice(2)}`;
const parseDate=s=>{const [y,m,d]=String(s).split('-').map(Number);return new Date(y,m-1,d,12)};
const monthKey=s=>String(s||'').slice(0,7);
const blank=(date)=>({id:uid(),date,title:'',personId:'',personName:'',startTime:'',endTime:'',location:'',notes:'',url:'',createdAt:new Date().toISOString()});
function safeUrl(value){try{const u=new URL(value);return ['https:','http:'].includes(u.protocol)?u.href:null}catch{return null}}
export default function MeetingsCalendar({events=[],roleModels=[],onChange,notify,storageKey='meetings',isClass=false,isCareer=false,milestones=[]}){
 const [selected,setSelected]=useState(today());
 const [shownMonth,setShownMonth]=useState(monthKey(today()));
 const [editing,setEditing]=useState(null);
 const first=useMemo(()=>parseDate(shownMonth+'-01'),[shownMonth]);
 const gridStart=useMemo(()=>new Date(first.getFullYear(),first.getMonth(),1-first.getDay(),12),[first]);
 const days=useMemo(()=>Array.from({length:42},(_,i)=>dateKey(new Date(gridStart.getFullYear(),gridStart.getMonth(),gridStart.getDate()+i,12))),[gridStart]);
 const sorted=useMemo(()=>[...events].sort((a,b)=>String(a.date).localeCompare(String(b.date))||String(a.startTime||'').localeCompare(String(b.startTime||''))),[events]);
 const byDate=useMemo(()=>{const result={};for(const event of sorted){(result[event.date]??=[]).push(event)}return result},[sorted]);
 const current=byDate[selected]||[];
 const displayName=e=>roleModels.find(p=>p.id===e.personId)?.name||e.personName||'';
 const moveMonth=offset=>{const next=new Date(first.getFullYear(),first.getMonth()+offset,1,12);const key=dateKey(next).slice(0,7);setShownMonth(key);setSelected(key+'-01')};
 const selectDate=date=>{setSelected(date);setShownMonth(monthKey(date))};
 const save=e=>{e.preventDefault();if(!editing)return;const title=editing.title.trim(),personName=editing.personName.trim();if(!title){notify('일정 제목을 입력해 줘.');return}if(editing.endTime&&editing.startTime&&editing.endTime<editing.startTime){notify('종료 시간은 시작 시간 이후로 설정해 줘.');return}
  const record={...editing,title,personName};
  onChange(s=>({...s,[storageKey]:(s[storageKey]||[]).some(x=>x.id===record.id)?(s[storageKey]||[]).map(x=>x.id===record.id?record:x):[...(s[storageKey]||[]),record]}));
  selectDate(record.date);setEditing(null);notify('만남 일정을 저장했어.');
 };
 const remove=id=>{if(!window.confirm('이 만남 일정을 삭제할까?'))return;onChange(s=>({...s,[storageKey]:(s[storageKey]||[]).filter(x=>x.id!==id)}));notify('일정을 삭제했어.')};
 return <section className="screen meetings-screen">
  <div className="heading"><div><h1>{isCareer?'준비 일정':isClass?'일정':'만남'}</h1><p>{isCareer?'마일스톤 달성을 위한 학습·자격 준비 계획을 날짜별로 기록해.':isClass?'강좌·수업·체험 일정을 캘린더로 관리해.':'롤모델과의 만남, 행사, 네트워킹 일정을 기록해.'}</p></div><button type="button" className="small-btn" onClick={()=>setEditing(blank(selected))}><Plus size={16}/> 일정 추가</button></div>
  <div className="meetings-calendar">
   <div className="meetings-month"><button type="button" aria-label="이전 달" onClick={()=>moveMonth(-1)}><ChevronLeft size={20}/></button><strong>{first.getFullYear()}년 {first.getMonth()+1}월</strong><button type="button" aria-label="다음 달" onClick={()=>moveMonth(1)}><ChevronRight size={20}/></button><button type="button" className="meetings-today" onClick={()=>selectDate(today())}>오늘</button></div>
   <div className="meetings-grid" role="grid" aria-label={`${first.getFullYear()}년 ${first.getMonth()+1}월 달력`}>
    {['일','월','화','수','목','금','토'].map((label,i)=><span className="meetings-weekday" key={label} style={i===0?{color:'#bf6686'}:undefined}>{label}</span>)}
    {days.map(date=>{const count=(byDate[date]||[]).length;return <button type="button" key={date} role="gridcell" aria-selected={selected===date} aria-label={`${date}${count?`, 일정 ${count}개`:''}`} className={['meetings-day',monthKey(date)!==shownMonth?'outside':'',date===today()?'is-today':'',selected===date?'is-selected':''].filter(Boolean).join(' ')} onClick={()=>selectDate(date)}><span>{Number(date.slice(-2))}</span>{count>0&&<span className="meetings-dots" aria-hidden="true">{Array.from({length:Math.min(3,count)},(_,i)=><i key={i}/>)}</span>}</button>})}
   </div>
  </div>
  <div className="meetings-day-heading"><div><strong>{selected.slice(0,4)}년 {Number(selected.slice(5,7))}월 {Number(selected.slice(8,10))}일</strong><small>{current.length}개 일정</small></div><button type="button" className="small-btn" onClick={()=>setEditing(blank(selected))}><Plus size={16}/> 등록</button></div>
  {current.map(item=>{const person=displayName(item);const url=safeUrl(item.url);return <article className="meetings-event" key={item.id}><div className="meetings-event-main"><span className="meetings-event-time"><Clock3 size={14}/>{item.startTime||'시간 미정'}{item.endTime?' ~ '+item.endTime:''}</span><b>{item.title}</b>{person&&<span><UserRound size={14}/>{person}</span>}{item.location&&<span><MapPin size={14}/>{item.location}</span>}{item.notes&&<p>{item.notes}</p>}{url&&<a href={url} target="_blank" rel="noopener noreferrer"><ExternalLink size={14}/> 참고 링크</a>}</div><div className="meetings-event-actions"><button type="button" aria-label="일정 수정" onClick={()=>setEditing({...item})}><Pencil size={17}/></button><button type="button" aria-label="일정 삭제" onClick={()=>remove(item.id)}><Trash2 size={17}/></button></div></article>})}
  {!current.length&&<div className="empty">이날 등록된 만남 일정이 없어. 날짜를 선택하고 일정을 추가해 봐.</div>}
  {editing&&<div className="overlay" onMouseDown={e=>e.target===e.currentTarget&&setEditing(null)}><form className="dialog meetings-editor" onSubmit={save}><div className="dialog-heading"><h2>{isCareer?'준비 일정':isClass?'수업 일정':'만남 일정'} {events.some(x=>x.id===editing.id)?'수정':'등록'}</h2><button type="button" onClick={()=>setEditing(null)}>닫기</button></div>
   <label>일정 제목<input required autoFocus maxLength={120} placeholder={isCareer?"예: 자격시험 신청, 서류 준비, 강의 수강":isClass?"예: 주말 요가 클래스, 중국어 강좌":"예: 강연 참석, 커피 미팅, 네트워킹"} value={editing.title} onChange={e=>setEditing(s=>({...s,title:e.target.value}))}/></label>
   <label>날짜<input required type="date" value={editing.date} onChange={e=>setEditing(s=>({...s,date:e.target.value}))}/></label>
   <div className="meetings-time-fields"><label>시작 시간<input type="time" value={editing.startTime||''} onChange={e=>setEditing(s=>({...s,startTime:e.target.value}))}/></label><label>종료 시간<input type="time" value={editing.endTime||''} onChange={e=>setEditing(s=>({...s,endTime:e.target.value}))}/></label></div>
   <label>{isCareer?'준비할 직업 (선택)':isClass?'관련 강좌 (선택)':'연결할 롤모델 (선택)'}<select value={editing.personId||''} onChange={e=>setEditing(s=>({...s,personId:e.target.value,personName:e.target.value?'':s.personName}))}><option value="">직접 입력 / 연결 없음</option>{roleModels.map(p=><option key={p.id} value={p.id}>{p.name}{p.field?' · '+p.field:''}</option>)}</select></label>
   {!editing.personId&&<label>{isCareer?'준비 내용·기관 직접 입력 (선택)':isClass?'강사·교육기관 직접 입력 (선택)':'만날 사람·단체 직접 입력 (선택)'}<input value={editing.personName||''} placeholder="예: 강사 이름, 행사 운영팀" onChange={e=>setEditing(s=>({...s,personName:e.target.value}))}/></label>}
   {isCareer&&<label>연결할 마일스톤 (선택)<select value={editing.milestoneId||''} onChange={e=>setEditing(old=>({...old,milestoneId:e.target.value}))}><option value="">마일스톤 연결 없음</option>{milestones.filter(m=>!editing.personId||m.jobId===editing.personId).map(m=><option key={m.id} value={m.id}>{m.dueDate||''} · {m.title}</option>)}</select></label>}
   <label>장소 (선택)<input value={editing.location||''} placeholder="예: 문화센터, 온라인 미팅" onChange={e=>setEditing(s=>({...s,location:e.target.value}))}/></label>
   <label>참고 URL (선택)<input type="url" value={editing.url||''} placeholder="https://..." onChange={e=>setEditing(s=>({...s,url:e.target.value}))}/></label>
   <label>메모 (선택)<textarea rows={3} value={editing.notes||''} onChange={e=>setEditing(s=>({...s,notes:e.target.value}))}/></label>
   <button className="primary" type="submit">일정 저장</button>
  </form></div>}
 </section>;
}
