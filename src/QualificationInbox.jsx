import React,{useState} from 'react';
import {Plus,Folder,ImagePlus,Trash2,ChevronDown,ChevronRight,Pencil, X, Search} from 'lucide-react';
import {CareerPhoto,uploadCareerPhoto} from './CareerPhoto.jsx';
const uid=()=>globalThis.crypto?.randomUUID?.()||`qual_${Date.now()}_${Math.random().toString(36).slice(2)}`;
export default function QualificationInbox({items=[],folders=[],roleModels=[],onChange,client,userId,notify}){
 const [tab,setTab]=useState('inbox'),[filterFolder,setFilterFolder]=useState(''),[query,setQuery]=useState('');
 const [form,setForm]=useState(null),[photos,setPhotos]=useState([]),[busy,setBusy]=useState(false),[error,setError]=useState('');
 const [folderDraft,setFolderDraft]=useState(null),[expanded,setExpanded]=useState(null);
 const fields=[...new Set([...roleModels.map(x=>x.field),...items.map(x=>x.field)].filter(Boolean))];
 const found=items.filter(item=>(tab==='inbox'?!item.folderId:!!item.folderId&&(!filterFolder||filterFolder===item.folderId)))
   .filter(item=>([item.field,item.name,item.type,item.issuer,item.notes,roleModels.find(p=>p.id===item.personId)?.name].join(' ').toLowerCase().includes(query.toLowerCase())))
   .sort((a,b)=>String(b.createdAt||'').localeCompare(String(a.createdAt||'')));
 const openCreate=()=>{setForm({id:uid(),personId:'',field:'',folderId:'',images:[],createdAt:new Date().toISOString()});setPhotos([]);setError('')};
 const edit=item=>{setForm({...item,images:item.images||[]});setPhotos([]);setError('')};
 const onFiles=files=>{const chosen=Array.from(files||[]).filter(x=>x.type.startsWith('image/'));if(chosen.length+photos.length>8){setError('사진은 한 자료에 최대 8장까지 추가할 수 있어.');return}setPhotos(p=>[...p,...chosen])};
 const save=async e=>{
  e.preventDefault();if(busy||!form)return;
  if(!form.field.trim()&&!form.personId){setError('롤모델 또는 활동 분야를 선택해 줘.');return}
  if(!(form.images?.length||photos.length||form.name)){setError('사진을 첨부해 줘.');return}
  setBusy(true);setError('');
  try{
   const uploads=[];
   for(const file of photos)uploads.push(await uploadCareerPhoto(client,userId,file,'qualification'));
   const record={...form,images:[...(form.images||[]),...uploads],field:form.field.trim()};
   onChange(d=>({...d,qualifications:(d.qualifications||[]).some(x=>x.id===record.id)?d.qualifications.map(x=>x.id===record.id?record:x):[...(d.qualifications||[]),record]}));
   setForm(null);setPhotos([]);notify('자격 자료를 저장했어.');
  }catch(err){setError(err.message||'사진 저장에 실패했어.')}finally{setBusy(false)}
 };
 const move=(item,id)=>onChange(d=>({...d,qualifications:(d.qualifications||[]).map(x=>x.id===item.id?{...x,folderId:id}:x)}));
 const remove=item=>{if(!window.confirm('이 자격 자료를 삭제할까?'))return;onChange(d=>({...d,qualifications:(d.qualifications||[]).filter(x=>x.id!==item.id)}));setExpanded(null)};
 const createFolder=e=>{e.preventDefault();const name=folderDraft?.trim();if(!name)return;const already=folders.find(f=>f.name===name);const id=already?.id||uid();if(!already)onChange(d=>({...d,qualificationFolders:[...(d.qualificationFolders||[]),{id,name}]}));setFilterFolder(id);setTab('folders');setFolderDraft(null)};
 return <section className="screen qualification-page">
  <div className="heading"><div><h1>자격</h1><p>학위·자격증 등 커리어 자료를 먼저 수집하고, 나중에 폴더로 정리해.</p></div><button className="small-btn" onClick={openCreate}><Plus size={16}/> 자료 추가</button></div>
  <nav className="focus-segments" aria-label="자격 자료 분류"><button type="button" className={tab==='inbox'?'selected':''} onClick={()=>setTab('inbox')}>인박스</button><button type="button" className={tab==='folders'?'selected':''} onClick={()=>setTab('folders')}>폴더</button></nav>
  <label className="search"><Search size={17}/><input value={query} placeholder="롤모델·분야·자료 검색" type="search" onChange={e=>setQuery(e.target.value)}/></label>
  {tab==='folders'&&<div className="qualification-folder-bar"><select aria-label="폴더 선택" value={filterFolder} onChange={e=>setFilterFolder(e.target.value)}><option value="">모든 폴더</option>{folders.map(f=><option key={f.id} value={f.id}>{f.name}</option>)}</select><button className="small-btn" onClick={()=>setFolderDraft('')}><Plus size={16}/> 폴더</button></div>}
  <div className="list-heading"><b>{tab==='inbox'?'미분류 자료':folders.find(x=>x.id===filterFolder)?.name||'폴더 자료'}</b><span>{found.length}개</span></div>
  {found.map(item=>{const person=roleModels.find(p=>p.id===item.personId),folder=folders.find(f=>f.id===item.folderId),open=expanded===item.id,images=item.images||[];
   return <article className="person-card qualification-card" key={item.id}>
    <button className="qualification-card-head" onClick={()=>setExpanded(open?null:item.id)} aria-expanded={open}>
      <CareerPhoto client={client} path={images[0]} alt="자격 자료 사진" className="qualification-thumb"/>
      <span className="qualification-card-label"><b>{item.name||person?.name||item.field||'자격 자료'}</b><small>{[item.field,person?.name,folder?.name,images.length?images.length+'장':''].filter(Boolean).join(' · ')}</small></span>
      {open?<ChevronDown size={18}/>:<ChevronRight size={18}/>}
    </button>
    {open&&<div className="qualification-detail">
      {images.length>0&&<div className="qualification-photo-grid">{images.map(path=><CareerPhoto key={path} client={client} path={path} className="qualification-photo" alt="첨부한 자격 자료" />)}</div>}
      {item.notes&&<p className="muted">{item.notes}</p>}
      <div className="qualification-actions"><select aria-label="자료 폴더" value={item.folderId||''} onChange={e=>move(item,e.target.value)}><option value="">미분류 (인박스)</option>{folders.map(f=><option value={f.id} key={f.id}>{f.name}</option>)}</select><button type="button" onClick={()=>setFolderDraft('')}><Folder size={16}/><Plus size={12}/></button><button onClick={()=>edit(item)} aria-label="자료 편집"><Pencil size={17}/></button><button onClick={()=>remove(item)} aria-label="자료 삭제"><Trash2 size={17}/></button></div>
    </div>}
   </article>})}
  {!found.length&&<div className="empty">{query?'검색 결과가 없어.':tab==='inbox'?'새 자격 자료를 사진으로 담아 봐.':'인박스의 자료를 폴더로 보내면 여기에 표시돼.'}</div>}
  {form&&<div className="overlay" onMouseDown={e=>e.target===e.currentTarget&&!busy&&setForm(null)}><form className="dialog qualification-editor" onSubmit={save}>
    <div className="dialog-heading"><h2>{items.some(x=>x.id===form.id)?'자격 자료 수정':'자격 자료 등록'}</h2><button type="button" disabled={busy} onClick={()=>setForm(null)}>닫기</button></div>
    <label>연결할 롤모델<select value={form.personId||''} onChange={e=>{const id=e.target.value;const p=roleModels.find(x=>x.id===id);setForm(f=>({...f,personId:id,field:p?.field||f.field}))}}><option value="">특정 인물 없이 분야별로 수집</option>{roleModels.map(p=><option key={p.id} value={p.id}>{p.name} · {p.field||'분야 미지정'}</option>)}</select></label>
    <label>활동 분야<input list="qualification-fields" value={form.field||''} onChange={e=>setForm(f=>({...f,field:e.target.value}))} placeholder="예: AI 전문가"/><datalist id="qualification-fields">{fields.map(x=><option key={x} value={x}/>)}</datalist></label>
    <label>사진 첨부<input type="file" accept="image/*" multiple onChange={e=>{onFiles(e.target.files);e.target.value=''}}/></label>
    {(form.images?.length||photos.length)>0&&<div className="qualification-pending">
     {(form.images||[]).map(path=><span key={path}><CareerPhoto client={client} path={path} className="qualification-mini" alt="저장된 사진"/><button type="button" title="사진 제외" onClick={()=>setForm(f=>({...f,images:f.images.filter(x=>x!==path)}))}><X size={16}/></button></span>)}
     {photos.map((file,i)=><span key={i}><ImagePlus size={16}/><small>{file.name}</small><button type="button" onClick={()=>setPhotos(s=>s.filter((_,n)=>n!==i))}><X size={16}/></button></span>)}
    </div>}
    {error&&<p className="error" role="alert">{error}</p>}
    <button className="primary" disabled={busy} type="submit">{busy?'사진 업로드 중…':'인박스에 저장'}</button>
  </form></div>}
  {folderDraft!==null&&<div className="overlay" onMouseDown={e=>e.target===e.currentTarget&&setFolderDraft(null)}><form className="dialog" onSubmit={createFolder}><div className="dialog-heading"><h2>새 폴더</h2><button type="button" onClick={()=>setFolderDraft(null)}>닫기</button></div><label>폴더 이름<input autoFocus required maxLength={50} value={folderDraft} onChange={e=>setFolderDraft(e.target.value)}/></label><button className="primary">만들기</button></form></div>}
 </section>;
}
