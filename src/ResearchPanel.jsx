import React,{useMemo,useState} from 'react';
import {Plus,Folder,Search,ChevronDown,ChevronRight,Pencil,Trash2,ExternalLink} from 'lucide-react';

const makeId=()=>globalThis.crypto?.randomUUID?.()||`research_${Date.now()}_${Math.random().toString(36).slice(2)}`;
const allowedUrl=value=>{try{const u=new URL(value);return ['https:','http:'].includes(u.protocol)?u.href:null}catch{return null}};
export default function ResearchPanel({roleModels=[],items=[],folders=[],onChange,notify,itemsKey='researchItems',foldersKey='researchFolders',isMen=false,isClass=false,isCareer=false}){
 const [view,setView]=useState('inbox'),[folderId,setFolderId]=useState(''),[search,setSearch]=useState(''),[edit,setEdit]=useState(null),[folderDraft,setFolderDraft]=useState(null),[expanded,setExpanded]=useState(null);
 const people=useMemo(()=>new Map(roleModels.map(p=>[p.id,p])),[roleModels]);
 const fields=useMemo(()=>[...new Set(roleModels.map(p=>p.field).concat(items.map(i=>i.field)).filter(Boolean))],[roleModels,items]);
 const visible=items.filter(x=>view==='inbox'?!x.folderId:!!x.folderId&&(!folderId||x.folderId===folderId))
 .filter(x=>[x.title,x.body,x.field,x.url,people.get(x.personId)?.name].some(v=>String(v||'').toLocaleLowerCase().includes(search.toLocaleLowerCase())))
 .sort((a,b)=>String(b.createdAt||'').localeCompare(String(a.createdAt||'')));
 const openNew=()=>setEdit({id:makeId(),personId:'',field:'',title:'',body:'',url:'',folderId:'',createdAt:new Date().toISOString()});
 const selectPerson=value=>{const person=people.get(value);setEdit(x=>({...x,personId:value,field:person?.field||x.field}))};
 const save=e=>{e.preventDefault();if(!edit?.body?.trim()&&!edit?.title?.trim())return notify('조사 내용을 입력해 줘.');
  const record={...edit,title:edit.title.trim()||edit.body.trim().split('\n')[0].slice(0,70),body:edit.body.trim(),field:edit.field.trim()};
  onChange(s=>({...s,[itemsKey]:(s[itemsKey]||[]).some(x=>x.id===record.id)?s[itemsKey].map(x=>x.id===record.id?record:x):[...(s[itemsKey]||[]),record]}));
  setEdit(null);notify('조사 자료를 저장했어.');
 };
 const move=(id,destination)=>onChange(s=>({...s,[itemsKey]:(s[itemsKey]||[]).map(x=>x.id===id?{...x,folderId:destination}:x)}));
 const remove=id=>{if(!window.confirm('이 조사 자료를 삭제할까?'))return;onChange(s=>({...s,[itemsKey]:(s[itemsKey]||[]).filter(x=>x.id!==id)}));setExpanded(null)};
 const addFolder=e=>{e.preventDefault();const name=folderDraft?.trim();if(!name)return;const existing=folders.find(f=>f.name===name);const id=existing?.id||makeId();
  if(!existing)onChange(s=>({...s,[foldersKey]:[...(s[foldersKey]||[]),{id,name}]}));setFolderId(id);setView('folders');setFolderDraft(null);
 };
 return <section className="screen research-screen">
  <div className="heading"><div><h1>조사</h1><p>{isCareer?'희망 직업의 역할, 전망, 진입 경로 등을 조사해.':isClass?'강좌 내용, 수강 조건, 강사와 커리큘럼을 조사해.':'만나기 전에 관심 있는 사람에 관해 자유롭게 조사하고 기록해.'}</p></div><button className="small-btn" type="button" onClick={openNew}><Plus size={16}/> 조사 추가</button></div>
  <nav className="focus-segments research-segments" aria-label="사전 조사 분류"><button type="button" className={view==='inbox'?'selected':''} onClick={()=>setView('inbox')}>인박스</button><button type="button" className={view==='folders'?'selected':''} onClick={()=>setView('folders')}>폴더</button></nav>
  <label className="search"><Search size={17}/><input type="search" placeholder="이름·분야·조사 내용 검색" value={search} onChange={e=>setSearch(e.target.value)}/></label>
  {view==='folders'&&<div className="research-folder-bar"><select value={folderId} aria-label="조사 폴더 선택" onChange={e=>setFolderId(e.target.value)}><option value="">모든 폴더</option>{folders.map(folder=><option key={folder.id} value={folder.id}>{folder.name}</option>)}</select><button type="button" className="small-btn" onClick={()=>setFolderDraft('')}><Plus size={16}/> 폴더</button></div>}
  <div className="list-heading"><b>{view==='inbox'?'미분류 조사':folders.find(f=>f.id===folderId)?.name||'폴더별 조사'}</b><span>{visible.length}개</span></div>
  {visible.map(x=>{const person=people.get(x.personId),open=expanded===x.id;return <article className="person-card research-card" key={x.id}>
   <button type="button" className="person-head" aria-expanded={open} onClick={()=>setExpanded(open?null:x.id)}><div><b>{x.title||'사전 조사'}</b><small>{[person?.name,x.field,folders.find(f=>f.id===x.folderId)?.name].filter(Boolean).join(' · ')||'미분류'}</small></div>{open?<ChevronDown size={18}/>:<ChevronRight size={18}/>}</button>
   {open&&<div className="person-detail research-detail">{x.body&&<p>{x.body}</p>}{allowedUrl(x.url)&&<a href={allowedUrl(x.url)} target="_blank" rel="noopener noreferrer"><ExternalLink size={15}/> 원문 링크</a>}
    <div className="research-actions"><select aria-label="조사 폴더로 이동" value={x.folderId||''} onChange={e=>move(x.id,e.target.value)}><option value="">미분류 (인박스)</option>{folders.map(f=><option key={f.id} value={f.id}>{f.name}</option>)}</select><button type="button" onClick={()=>setFolderDraft('')} title="폴더 추가"><Folder size={16}/><Plus size={12}/></button><button type="button" onClick={()=>setEdit({...x})} aria-label="조사 수정"><Pencil size={17}/></button><button type="button" onClick={()=>remove(x.id)} aria-label="조사 삭제"><Trash2 size={17}/></button></div>
   </div>}
  </article>})}
  {!visible.length&&<div className="empty">{search?'검색 결과가 없어.':view==='inbox'?'사람에 관한 조사 내용을 자유롭게 기록해 봐.':'인박스에서 자료를 폴더로 보내면 여기에 모여.'}</div>}
  {edit&&<div className="overlay" onMouseDown={e=>e.target===e.currentTarget&&setEdit(null)}><form className="dialog research-editor" onSubmit={save}>
   <div className="dialog-heading"><h2>사전 조사 {items.some(x=>x.id===edit.id)?'수정':'등록'}</h2><button type="button" onClick={()=>setEdit(null)}>닫기</button></div>
   <label>{isCareer?'연결할 직업 (선택)':isClass?'연결할 강좌 (선택)':'연결할 사람 (선택)'}<select value={edit.personId||''} onChange={e=>selectPerson(e.target.value)}><option value="">{isCareer?'직업 없이 자유 조사':isClass?'강좌 없이 자유 조사':'특정 롤모델 없이 조사'}</option>{roleModels.map(p=><option key={p.id} value={p.id}>{p.name}{p.field?' · '+p.field:''}</option>)}</select></label>
   <label>활동 분야 (선택)<input list="research-fields" value={edit.field||''} placeholder="예: 무용·문화기획·교육" onChange={e=>setEdit(x=>({...x,field:e.target.value}))}/><datalist id="research-fields">{fields.map(f=><option key={f} value={f}/>)}</datalist></label>
   <label>제목 (선택)<input value={edit.title||''} placeholder="예: 주요 경력과 활동 방식" onChange={e=>setEdit(x=>({...x,title:e.target.value}))}/></label>
   <label>{isCareer?'직업 조사 · 자유 메모':isClass?'강좌 조사 · 자유 메모':'사전 조사 · 자유 메모'}<textarea autoFocus rows={9} value={edit.body||''} placeholder="이 사람은 어떤 일을 해왔을까?\n어떤 경로로 성장했을까?\n만나면 무엇을 물어보고 싶을까?\n\n자유롭게 기록해 봐." onChange={e=>setEdit(x=>({...x,body:e.target.value}))}/></label>
   <label>참고 URL (선택)<input type="url" value={edit.url||''} placeholder="https://..." onChange={e=>setEdit(x=>({...x,url:e.target.value}))}/></label>
   <button className="primary" type="submit">인박스에 저장</button>
  </form></div>}
  {folderDraft!==null&&<div className="overlay" onMouseDown={e=>e.target===e.currentTarget&&setFolderDraft(null)}><form className="dialog" onSubmit={addFolder}><div className="dialog-heading"><h2>조사 폴더 만들기</h2><button type="button" onClick={()=>setFolderDraft(null)}>닫기</button></div><label>폴더 이름<input autoFocus required maxLength={60} value={folderDraft} onChange={e=>setFolderDraft(e.target.value)}/></label><button type="submit" className="primary">폴더 만들기</button></form></div>}
 </section>;
}
