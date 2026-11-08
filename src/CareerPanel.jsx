import React,{useMemo,useState} from 'react';
import {Plus,Pencil,Trash2,ChevronDown,ChevronRight,CheckCircle2,CircleDashed,Search,Flag,ExternalLink} from 'lucide-react';
const uid=()=>globalThis.crypto?.randomUUID?.()||'career-'+Date.now()+'-'+Math.random().toString(36).slice(2);
const today=()=>{const d=new Date();return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-')};
const types=['학위','자격증','경력','교육·수료','전문 스킬','어학','포트폴리오','기타'];
const safeUrl=x=>{try{const u=new URL(x);return ['http:','https:'].includes(u.protocol)?u.href:null}catch{return null}};
export default function CareerPanel({view='requirements',jobs=[],requirements=[],milestones=[],onChange,notify}){
 const isMilestone=view==='milestones',isGap=view==='gap';
 const [editing,setEditing]=useState(null),[expanded,setExpanded]=useState(null),[search,setSearch]=useState(''),[jobFilter,setJobFilter]=useState(''),[statusFilter,setStatusFilter]=useState('all');
 const jobsById=useMemo(()=>new Map(jobs.map(j=>[j.id,j])),[jobs]);
 const key=isMilestone?'careerMilestones':'careerRequirements';
 const entries=isMilestone?milestones:requirements;
 const visible=entries.filter(x=>(!jobFilter||x.jobId===jobFilter)&&(!isGap||statusFilter==='all'||(statusFilter==='have'?x.status==='have':x.status!=='have'))&&[x.title,x.name,x.category,x.notes,jobsById.get(x.jobId)?.name].some(t=>String(t||'').toLowerCase().includes(search.toLowerCase()))).sort((a,b)=>isMilestone?String(a.dueDate||'9999').localeCompare(String(b.dueDate||'9999')):String(b.createdAt||'').localeCompare(String(a.createdAt||'')));
 const create=()=>{if(!jobs.length){notify('먼저 홈에서 희망 직업을 등록해 줘.');return}
 setEditing(isMilestone?{id:uid(),jobId:jobFilter||jobs[0].id,title:'',dueDate:today(),notes:'',done:false,createdAt:new Date().toISOString()}:{id:uid(),jobId:jobFilter||jobs[0].id,name:'',category:'자격증',status:'missing',notes:'',url:'',createdAt:new Date().toISOString()})};
 const setField=(field,value)=>setEditing(old=>({...old,[field]:value}));
 const save=e=>{e.preventDefault();if(!editing)return;const field=isMilestone?'title':'name';if(!editing[field]?.trim())return notify('이름을 입력해 줘.');const item={...editing,[field]:editing[field].trim()};onChange(s=>({...s,[key]:(s[key]||[]).some(x=>x.id===item.id)?s[key].map(x=>x.id===item.id?item:x):[...(s[key]||[]),item]}));setEditing(null);notify('저장했어.')};
 const patch=(id,fields)=>onChange(s=>({...s,[key]:(s[key]||[]).map(x=>x.id===id?{...x,...fields}:x)}));
 const remove=id=>{if(!window.confirm('이 항목을 삭제할까?'))return;onChange(s=>({...s,[key]:(s[key]||[]).filter(x=>x.id!==id)}))};
 const missing=requirements.filter(x=>x.status!=='have').length,have=requirements.length-missing;
 return <section className="screen career-panel">
 <div className="heading"><div><h1>{isMilestone?'마일스톤':isGap?'유무':'자격'}</h1><p>{isMilestone?'언제까지 무엇을 달성할지 정하고 준비 일정으로 연결해.':isGap?'내게 있는 자격과 앞으로 준비할 자격을 구분해.':'희망 직업에 요구되는 자격·학위·경력·스킬을 기록해.'}</p></div>{!isGap&&<button className="small-btn" type="button" onClick={create}><Plus size={16}/> {isMilestone?'목표 추가':'자격 추가'}</button>}</div>
 {isGap&&<div className="career-gap-stats"><div><small>보유</small><strong>{have}</strong></div><div><small>미보유</small><strong>{missing}</strong></div><div><small>요구 자격</small><strong>{requirements.length}</strong></div></div>}
 <label className="appeal-field">희망 직업<select value={jobFilter} onChange={e=>setJobFilter(e.target.value)}><option value="">전체 직업</option>{jobs.map(j=><option key={j.id} value={j.id}>{j.name}</option>)}</select></label>
 {isGap&&<div className="chips">{[['all','전체'],['have','보유'],['missing','미보유']].map(([val,label])=><button key={val} className={statusFilter===val?'active':''} onClick={()=>setStatusFilter(val)}>{label}</button>)}</div>}
 <label className="search"><Search size={16}/><input type="search" placeholder={isMilestone?'달성 목표 검색':'요구 자격 검색'} value={search} onChange={e=>setSearch(e.target.value)}/></label>
 <div className="list-heading"><b>{isMilestone?'달성 목표':isGap?'보유 현황':'필요 자격 목록'}</b><span>{visible.length}개</span></div>
 {visible.map(x=>{const opened=expanded===x.id;return <article key={x.id} className="person-card career-list-card"><div className="career-list-head"><button type="button" onClick={()=>setExpanded(opened?null:x.id)} aria-expanded={opened}><span className="career-indicator">{isMilestone?<Flag size={18}/>:x.status==='have'?<CheckCircle2 size={18}/>:<CircleDashed size={18}/>}</span><span><b>{isMilestone?x.title:x.name}</b><small>{[jobsById.get(x.jobId)?.name,isMilestone?x.dueDate:x.category].filter(Boolean).join(' · ')}</small></span>{opened?<ChevronDown size={18}/>:<ChevronRight size={18}/>}</button><button className={'career-pill '+((isMilestone?x.done:x.status==='have')?'is-complete':'')} onClick={()=>patch(x.id,isMilestone?{done:!x.done}:{status:x.status==='have'?'missing':'have'})}>{isMilestone?(x.done?'달성':'미달성'):(x.status==='have'?'보유':'미보유')}</button></div>
 {opened&&<div className="person-detail">{x.notes&&<p>{x.notes}</p>}{safeUrl(x.url)&&<a href={safeUrl(x.url)} rel="noopener noreferrer" target="_blank"><ExternalLink size={15}/> 참고 링크</a>}<div className="actions"><button onClick={()=>setEditing({...x})}><Pencil size={15}/> 수정</button><button onClick={()=>remove(x.id)}><Trash2 size={15}/> 삭제</button></div></div>}</article>})}
 {!visible.length&&<div className="empty">{jobs.length?'아직 기록이 없어. 필요한 자격과 마일스톤을 추가해 봐.':'먼저 홈에서 되고 싶은 직업을 등록해 줘.'}</div>}
 {isGap&&<p className="career-hint">미보유 자격을 확인하고 마일스톤에서 달성 목표를 설정해 봐.</p>}
 {editing&&<div className="overlay" onMouseDown={e=>e.target===e.currentTarget&&setEditing(null)}><form className="dialog career-editor" onSubmit={save}><div className="dialog-heading"><h2>{isMilestone?'마일스톤':'요구 자격'} 등록·수정</h2><button type="button" onClick={()=>setEditing(null)}>닫기</button></div>
 <label>연결할 직업<select value={editing.jobId||''} required onChange={e=>setField('jobId',e.target.value)}>{jobs.map(j=><option value={j.id} key={j.id}>{j.name}</option>)}</select></label>
 <label>{isMilestone?'언제까지 달성할 목표':'요구 자격 이름'}<input autoFocus required value={isMilestone?editing.title:editing.name} placeholder={isMilestone?'예: 2027년 3월까지 필수 자격증 취득':'예: 관련 학위·전문 자격증'} onChange={e=>setField(isMilestone?'title':'name',e.target.value)}/></label>
 {isMilestone?<><label>목표 달성일<input type="date" required value={editing.dueDate||''} onChange={e=>setField('dueDate',e.target.value)}/></label><label>상태<select value={editing.done?'done':'pending'} onChange={e=>setField('done',e.target.value==='done')}><option value="pending">미달성</option><option value="done">달성</option></select></label></>:<><label>분류<select value={editing.category} onChange={e=>setField('category',e.target.value)}>{types.map(t=><option key={t}>{t}</option>)}</select></label><label>내 보유 상태<select value={editing.status} onChange={e=>setField('status',e.target.value)}><option value="missing">미보유 · 준비 필요</option><option value="have">보유</option></select></label><label>관련 URL<input type="url" value={editing.url||''} onChange={e=>setField('url',e.target.value)} placeholder="https://..."/></label></>}
 <label>메모<textarea rows={4} value={editing.notes||''} onChange={e=>setField('notes',e.target.value)} placeholder="자격 조건 또는 달성 전략"/></label><button className="primary">저장</button>
 </form></div>}
 </section>;
}
