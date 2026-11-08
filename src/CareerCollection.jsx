import React,{useMemo,useState} from 'react';
import {Plus,Search,Pencil,Trash2,ChevronDown,ChevronUp,ExternalLink,GraduationCap,Building2} from 'lucide-react';

const makeId=()=>globalThis.crypto?.randomUUID?.()||`career_${Date.now()}_${Math.random().toString(36).slice(2)}`;
const qualificationTypes=['학위','자격증','교육·수료','경력·실적','기타'];
const emptyRecord=(kind)=>kind==='qualifications'
 ? {id:makeId(),name:'',type:'자격증',field:'',personId:'',issuer:'',url:'',notes:''}
 : {id:makeId(),name:'',type:'단체',field:'',personId:'',role:'',url:'',notes:''};
const safeLink=value=>{try{const url=new URL(value);return ['http:','https:'].includes(url.protocol)?url.href:null}catch{return null}};
export default function CareerCollection({kind,roleModels=[],items=[],onChange,notify}){
 const qualifications=kind==='qualifications';
 const heading=qualifications?'자격':'협업';
 const types=qualifications?qualificationTypes:['단체','기업','기관','협회','프로젝트','기타'];
 const [filter,setFilter]=useState('전체'),[query,setQuery]=useState(''),[editing,setEditing]=useState(null),[expanded,setExpanded]=useState(null);
 const fields=useMemo(()=>['전체',...new Set(roleModels.map(p=>(p.field||'').trim()).filter(Boolean)),...new Set(items.map(x=>(x.field||'').trim()).filter(Boolean))].filter((x,i,a)=>a.indexOf(x)===i),[roleModels,items]);
 const shown=items.filter(x=>(filter==='전체'||x.field===filter)&&[x.name,x.type,x.field,x.issuer,x.role,x.notes,roleModels.find(p=>p.id===x.personId)?.name].some(v=>String(v||'').toLocaleLowerCase().includes(query.toLocaleLowerCase())));
 const openCreate=()=>{const record=emptyRecord(kind);if(filter!=='전체')record.field=filter;setEditing(record)};
 const openPerson=id=>{const person=roleModels.find(p=>p.id===id);setEditing(old=>({...old,personId:id,field:person?.field||old.field}))};
 function save(e){e.preventDefault();const name=editing.name.trim();if(!name)return notify(heading+' 이름을 입력해 줘.');
   const value={...editing,name,field:editing.field.trim()};
   onChange(s=>({...s,[kind]:(s[kind]||[]).some(x=>x.id===value.id)?(s[kind]||[]).map(x=>x.id===value.id?value:x):[...(s[kind]||[]),value]}));
   setEditing(null);notify(heading+' 자료를 저장했어.');
 }
 function remove(id){if(!window.confirm('이 '+heading+' 기록을 삭제할까?'))return;onChange(s=>({...s,[kind]:(s[kind]||[]).filter(x=>x.id!==id)}));setExpanded(null);}
 return <section className="screen">
   <div className="heading"><div><h1>{heading}</h1><p>{qualifications?'롤모델의 분야에 필요한 학위·자격증·교육을 모아봐.':'롤모델이 활동하는 단체·기업·기관과 협업 관계를 기록해.'}</p></div><button className="small-btn" onClick={openCreate}><Plus size={16}/>{heading} 추가</button></div>
   <div className="chips" role="group" aria-label="분야별 필터">{fields.map(x=><button type="button" key={x} className={filter===x?'active':''} onClick={()=>setFilter(x)} aria-pressed={filter===x}>{x}</button>)}</div>
   <label className="search"><Search size={17}/><input type="search" placeholder={qualifications?'학위·자격증·기관 검색':'단체·기업·롤모델 검색'} value={query} onChange={e=>setQuery(e.target.value)}/></label>
   <div className="list-heading"><b>{qualifications?'자격 자료':'협업처 목록'}</b><span>{shown.length}개</span></div>
   {shown.map(item=>{const person=roleModels.find(p=>p.id===item.personId),isOpen=expanded===item.id,link=safeLink(item.url);return <article className="person-card" key={item.id}>
     <button type="button" className="person-head" aria-expanded={isOpen} onClick={()=>setExpanded(isOpen?null:item.id)}><div><b>{item.name}</b><small>{[item.field||'미분류',item.type,person?.name].filter(Boolean).join(' · ')}</small></div>{isOpen?<ChevronUp size={18}/>:<ChevronDown size={18}/>}</button>
     {isOpen&&<div className="person-detail">
       {qualifications&&item.issuer&&<p><b>학교·발급 기관</b>{item.issuer}</p>}
       {!qualifications&&item.role&&<p><b>협업 내용·역할</b>{item.role}</p>}
       {item.notes&&<p><b>메모</b>{item.notes}</p>}
       {link&&<a href={link} target="_blank" rel="noopener noreferrer"><ExternalLink size={15}/> 원문 링크</a>}
       <div className="actions"><button type="button" onClick={()=>setEditing({...item})}><Pencil size={15}/> 수정</button><button type="button" onClick={()=>remove(item.id)}><Trash2 size={15}/> 삭제</button></div>
     </div>}
   </article>})}
   {!shown.length&&<div className="empty">{items.length?'검색된 기록이 없어.':'아직 자료가 없어. 롤모델의 분야를 선택해 하나씩 모아봐.'}</div>}
   {editing&&<div className="overlay" onMouseDown={e=>e.target===e.currentTarget&&setEditing(null)}><form className="dialog" onSubmit={save}><div className="dialog-heading"><h2>{heading} {items.some(x=>x.id===editing.id)?'수정':'등록'}</h2><button type="button" onClick={()=>setEditing(null)}>닫기</button></div>
     <label>연결할 롤모델<select value={editing.personId||''} onChange={e=>openPerson(e.target.value)}><option value="">특정 인물 없이 분야별로 수집</option>{roleModels.map(p=><option key={p.id} value={p.id}>{p.name} · {p.field||'분야 미지정'}</option>)}</select></label>
     <label>활동 분야<input list="career-field-options" value={editing.field} placeholder="예: 무용·문화기획·중국어교육" onChange={e=>setEditing(s=>({...s,field:e.target.value}))}/><datalist id="career-field-options">{fields.filter(f=>f!=='전체').map(f=><option key={f} value={f}/>)}</datalist></label>
     <label>유형<select value={editing.type} onChange={e=>setEditing(s=>({...s,type:e.target.value}))}>{types.map(type=><option key={type}>{type}</option>)}</select></label>
     <label>{qualifications?'학위·자격증 이름':'단체·기업·기관 이름'}<input autoFocus required maxLength={160} value={editing.name} placeholder={qualifications?'예: 문화예술교육사':'예: 축제 운영 사무국'} onChange={e=>setEditing(s=>({...s,name:e.target.value}))}/></label>
     {qualifications?<label>학교·발급 기관<input value={editing.issuer||''} onChange={e=>setEditing(s=>({...s,issuer:e.target.value}))}/></label>:<label>협업 내용·역할<input value={editing.role||''} placeholder="예: 초청 강의·공동 기획·공연" onChange={e=>setEditing(s=>({...s,role:e.target.value}))}/></label>}
     <label>참고 URL<input type="url" value={editing.url||''} placeholder="https://..." onChange={e=>setEditing(s=>({...s,url:e.target.value}))}/></label>
     <label>메모<textarea rows={4} value={editing.notes||''} onChange={e=>setEditing(s=>({...s,notes:e.target.value}))}/></label>
     <button className="primary" type="submit">저장</button>
   </form></div>}
 </section>;
}
