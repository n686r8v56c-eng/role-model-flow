import React,{useMemo,useState} from 'react';
import {Home,Video,Inbox,Plus,Pencil,Trash2,ChevronDown,ChevronUp,Link2,Copy,ExternalLink,LogOut,Check,Search,ArrowUp,ArrowDown,GraduationCap,Building2,CalendarDays,BookOpen,ClipboardList} from 'lucide-react';
import {InboxPanel} from './InboxPanel.jsx';
import CareerCollection from './CareerCollection.jsx';
import QualificationInbox from './QualificationInbox.jsx';
import MeetingsCalendar from './MeetingsCalendar.jsx';
import MeetingNotes from './MeetingNotes.jsx';
import ResearchPanel from './ResearchPanel.jsx';
import {CareerPhoto,uploadCareerPhoto} from './CareerPhoto.jsx';
const uid=()=>globalThis.crypto?.randomUUID?.() || Date.now().toString(36)+Math.random().toString(36).slice(2);
const today=()=>{const d=new Date();return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-')};
function videoData(url){try{const u=new URL(url);const host=u.hostname.replace(/^www\./,'');let id='';if(host==='youtu.be')id=u.pathname.slice(1).split('/')[0];else if(['youtube.com','m.youtube.com','music.youtube.com','youtube-nocookie.com'].includes(host))id=u.searchParams.get('v')||(/^\/(shorts|live|embed)\//.test(u.pathname)?u.pathname.split('/')[2]:'');if(/^[\w-]{11}$/.test(id||''))return {url:'https://www.youtube.com/watch?v='+id,videoId:id,type:'youtube'};if(host==='instagram.com'||host==='m.instagram.com')return {url:u.toString(),videoId:'',type:'instagram'};return {url:u.toString(),videoId:'',type:'other'}}catch{return null}}
const textCopy=async(value,notify)=>{try{await navigator.clipboard.writeText(value);notify('링크를 복사했어.')}catch{notify('복사 권한을 확인해 줘.')}};
function VideoPanel({roleModels,onChange,notify,onAddPerson,client}){
 const [opened,setOpened]=useState(null),[active,setActive]=useState({}),[editing,setEditing]=useState(false),[query,setQuery]=useState(''),[addTo,setAddTo]=useState(null),[draft,setDraft]=useState(''),[platform,setPlatform]=useState('youtube'),[selectedArea,setSelectedArea]=useState('전체');
 const areas=['전체',...new Set(roleModels.map(p=>p.field||'기타'))];
 const visible=roleModels.filter(p=>(selectedArea==='전체'||(p.field||'기타')===selectedArea)&&((p.name+' '+p.field+' '+p.career).toLowerCase().includes(query.toLowerCase())));
 function saveLink(e){e.preventDefault();const info=videoData(draft.trim());if(!info||info.type!==platform)return notify(platform==='youtube'?'YouTube 영상 주소를 입력해 줘.':'Instagram 게시물·릴스 주소를 입력해 줘.');onChange(s=>({...s,roleModels:s.roleModels.map(p=>p.id===addTo?{...p,videos:[...(p.videos||[]),{...info,id:uid(),title:'',memo:''}]}:p)}));setAddTo(null);setDraft('');notify('영상 북마크를 추가했어.');}
 function delVideo(person,id){if(!window.confirm('영상 북마크를 삭제할까?'))return;onChange(s=>({...s,roleModels:s.roleModels.map(p=>p.id===person.id?{...p,videos:(p.videos||[]).filter(v=>v.id!==id)}:p)}));}
 return <section className="screen">
  <div className="heading"><div><h1>영상 북마크</h1><p>롤모델의 영상과 커리어 자료를 모아봐.</p></div><button className="small-btn" onClick={()=>setEditing(v=>!v)}><Pencil size={15}/> 편집</button></div>
  <div className="chips">{areas.map(x=><button key={x} className={selectedArea===x?'active':''} onClick={()=>setSelectedArea(x)}>{x}</button>)}</div>
  <label className="search"><Search size={17}/><input placeholder="인물·분야 검색" value={query} onChange={e=>setQuery(e.target.value)}/></label>
  <div className="list-heading"><b>북마크 라이브러리</b><button onClick={onAddPerson}><Plus size={17}/> 인물 추가</button></div>
  <div className="video-list">{visible.map((person,i)=>{const videos=person.videos||[];const expanded=opened===person.id;const current=videos[Math.min(active[person.id]||0,videos.length-1)];
   return <article key={person.id} className="video-row">
    <div className="video-row-head"><button onClick={()=>setOpened(expanded?null:person.id)} className="video-row-toggle" aria-expanded={expanded}><span className="num">{String(i+1).padStart(2,'0')}</span><CareerPhoto client={client} path={person.photoPath} alt={person.name+' 사진'} className="role-thumb"/><span><b>{person.name}</b><small>{person.field||'분야 미지정'} · 영상 {videos.length}개</small></span>{expanded?<ChevronUp size={18}/>:<ChevronDown size={18}/>}</button><button className="icon-btn" aria-label="영상 링크 추가" title="영상 링크 추가" onClick={()=>{setAddTo(person.id);setDraft('')}}><Link2 size={19}/></button></div>
    {expanded&&<div className="video-detail">{videos.length>0?<>{videos.length>1&&<div className="video-switch">{videos.map((v,i)=><button key={v.id} onClick={()=>setActive(s=>({...s,[person.id]:i}))} className={current?.id===v.id?'selected':''}>영상 {i+1}</button>)}</div>}
      {current?.type==='youtube'?<div className="video-frame"><iframe key={current.videoId} src={'https://www.youtube-nocookie.com/embed/'+current.videoId+'?playsinline=1'} title={person.name+' 참고 영상'} loading="lazy" allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen referrerPolicy="strict-origin-when-cross-origin"/></div>:<div className="external-video"><Video size={30}/><strong>{current.type==='instagram'?'Instagram 영상 북마크':'외부 영상 북마크'}</strong><span>원본 사이트에서 영상을 열 수 있어.</span><a href={current.url} target="_blank" rel="noopener noreferrer">원본 열기 <ExternalLink size={15}/></a></div>}
      {editing&&<div className="edit-video"><input placeholder="영상 제목 (선택)" value={current.title||''} onChange={e=>onChange(s=>({...s,roleModels:s.roleModels.map(p=>p.id===person.id?{...p,videos:p.videos.map(v=>v.id===current.id?{...v,title:e.target.value}:v)}:p)}))}/><textarea rows={2} placeholder="관찰할 기술·커리어 포인트" value={current.memo||''} onChange={e=>onChange(s=>({...s,roleModels:s.roleModels.map(p=>p.id===person.id?{...p,videos:p.videos.map(v=>v.id===current.id?{...v,memo:e.target.value}:v)}:p)}))}/></div>}
      {(current.title||current.memo)&&<p className="video-note"><b>{current.title}</b>{current.memo&&<span>{current.memo}</span>}</p>}
      <div className="video-actions"><button onClick={()=>textCopy(current.url,notify)}><Copy size={15}/> 복사</button><a href={current.url} target="_blank" rel="noopener noreferrer"><ExternalLink size={15}/> 원본 열기</a><button onClick={()=>delVideo(person,current.id)}><Trash2 size={15}/> 삭제</button><button onClick={()=>{setAddTo(person.id);setDraft('')}}><Plus size={15}/> 영상 추가</button></div>
      </>:<div className="external-video">영상 링크를 추가해 줘.</div>}</div>}
   </article>})}</div>
  {!visible.length&&<div className="empty">등록된 인물이 없어. 홈에서 롤모델을 추가해 줘.</div>}
  {addTo&&<div className="overlay" onMouseDown={e=>e.target===e.currentTarget&&setAddTo(null)}><form className="dialog" onSubmit={saveLink}><div className="dialog-heading"><h2>영상 북마크 추가</h2><button type="button" onClick={()=>setAddTo(null)}>닫기</button></div><div className="auth-tabs" role="group" aria-label="영상 플랫폼"><button type="button" className={platform==='youtube'?'selected':''} onClick={()=>{setPlatform('youtube');setDraft('')}}>YouTube</button><button type="button" className={platform==='instagram'?'selected':''} onClick={()=>{setPlatform('instagram');setDraft('')}}>Instagram</button></div><label>{platform==='youtube'?'YouTube 영상 URL':'Instagram 영상 URL'}<input autoFocus required type="url" placeholder={platform==='youtube'?'https://youtu.be/...':'https://www.instagram.com/reel/...'} value={draft} onChange={e=>setDraft(e.target.value)}/></label><button className="primary">영상 추가</button></form></div>}
 </section>
}
function HomePanel({roleModels,opportunities,onAdd,onEdit,onDelete,client}){
 const [expanded,setExpanded]=useState(null);
 const areas=new Set(roleModels.map(p=>p.field?.trim()).filter(Boolean));
 return <section className="screen"><div className="heading"><div><h1>Role Model Flow</h1><p>닮고 싶은 사람의 경력에서 나의 기회를 발견하기.</p></div><button className="small-btn" onClick={onAdd}><Plus size={16}/> 롤모델</button></div>
 <div className="stat-grid"><div className="stat"><small>롤모델</small><strong>{roleModels.length}</strong></div><div className="stat"><small>활동 분야</small><strong>{areas.size}</strong></div><div className="stat"><small>영상 북마크</small><strong>{roleModels.reduce((s,p)=>s+(p.videos||[]).length,0)}</strong></div><div className="stat"><small>저장한 기회</small><strong>{opportunities.length}</strong></div></div>
 <div className="list-heading"><b>나의 롤모델</b><span>{roleModels.length}명</span></div>
 {roleModels.map(p=><article className="person-card" key={p.id}><button className="person-head" onClick={()=>setExpanded(expanded===p.id?null:p.id)}><CareerPhoto client={client} path={p.photoPath} alt={p.name+' 프로필 사진'} className="role-thumb"/><div><b>{p.name}</b><small>{p.field||'분야 미지정'}{p.career?' · '+p.career:''}</small></div>{expanded===p.id?<ChevronUp size={18}/>:<ChevronDown size={18}/>}</button>{expanded===p.id&&<div className="person-detail"><p><b>커리어 목표</b>{p.goal||'아직 등록되지 않았어.'}</p><p><b>주요 경력·활동</b>{p.notes||'메모를 추가해 줘.'}</p>{p.email&&<p><b>이메일</b><a href={'mailto:'+p.email}>{p.email}</a></p>}{p.phone&&<p><b>휴대폰</b><a href={'tel:'+p.phone.replace(/[^+0-9]/g,'')}>{p.phone}</a></p>}{p.youtubeUrl&&/^https?:\/\//i.test(p.youtubeUrl)&&<p><b>YouTube</b><a href={p.youtubeUrl} target="_blank" rel="noopener noreferrer">채널·영상 열기 <ExternalLink size={14}/></a></p>}{p.instagramUrl&&/^https?:\/\//i.test(p.instagramUrl)&&<p><b>Instagram</b><a href={p.instagramUrl} target="_blank" rel="noopener noreferrer">프로필·게시물 열기 <ExternalLink size={14}/></a></p>}{p.url&&<a href={p.url} target="_blank" rel="noopener noreferrer"><ExternalLink size={15}/> 참고 링크</a>}<div className="actions"><button onClick={()=>onEdit(p)}><Pencil size={15}/> 수정</button><button onClick={()=>onDelete(p.id)}><Trash2 size={15}/> 삭제</button></div></div>}</article>)}
 {!roleModels.length&&<div className="empty">닮고 싶은 사람부터 등록해 봐. 그 사람의 경력과 영상, 기회를 차곡차곡 모을 수 있어.</div>}
 </section>
}
export default function App({initialData,onDataChange,onLogout,client,userId}){
 const data=initialData;
 const [tab,setTab]=useState('home'),[personEdit,setPersonEdit]=useState(null),[personPhoto,setPersonPhoto]=useState(null),[personSaving,setPersonSaving]=useState(false),[personError,setPersonError]=useState(''),[notice,setNotice]=useState('');
 const alertUser=message=>{setNotice(message);setTimeout(()=>setNotice(''),2400)};
 const editPerson=p=>{setPersonPhoto(null);setPersonError('');setPersonEdit(p||{id:uid(),name:'',field:'',career:'',goal:'',notes:'',url:'',youtubeUrl:'',instagramUrl:'',email:'',phone:'',videos:[]})};
 const savePerson=async e=>{e.preventDefault();if(!personEdit?.name.trim()||personSaving)return;setPersonSaving(true);setPersonError('');
  try{const photoPath=personPhoto?await uploadCareerPhoto(client,userId,personPhoto,'role-model'):personEdit.photoPath;
    const saved={...personEdit,photoPath};
    onDataChange(s=>({...s,roleModels:(s.roleModels||[]).some(p=>p.id===saved.id)?s.roleModels.map(p=>p.id===saved.id?saved:p):[...(s.roleModels||[]),saved]}));
    setPersonEdit(null);setPersonPhoto(null);alertUser('롤모델을 저장했어.');
  }catch(err){setPersonError(err.message||'사진을 저장하지 못했어.')}finally{setPersonSaving(false)}
 };
 const removePerson=id=>{if(!window.confirm('이 인물을 삭제하면 연결된 영상도 삭제돼. 계속할까?'))return;onDataChange(s=>({...s,roleModels:s.roleModels.filter(p=>p.id!==id)}))};
 const taskSet=data.tasks||[];
 const todayTasks=taskSet.filter(t=>t.due===today());
 return <div className="app"><header className="topbar"><button className="brand" onClick={()=>setTab('home')}>Role Model Flow</button><div className="topbar-actions"><button type="button" className={'top-inbox'+(tab==='inbox'?' selected':'')} onClick={()=>setTab('inbox')} aria-current={tab==='inbox'?'page':undefined}><Inbox size={17}/> 인박스</button><button className="logout" title="로그아웃" aria-label="로그아웃" onClick={onLogout}><LogOut size={18}/></button></div></header><main>
 {tab==='home'?<HomePanel roleModels={data.roleModels||[]} opportunities={data.inboxItems||[]} client={client} onAdd={()=>editPerson()} onEdit={editPerson} onDelete={removePerson}/>:
  tab==='videos'?<VideoPanel roleModels={data.roleModels||[]} onChange={onDataChange} notify={alertUser} onAddPerson={()=>editPerson()} client={client}/>:
  tab==='research'?<ResearchPanel roleModels={data.roleModels||[]} items={data.researchItems||[]} folders={data.researchFolders||[]} onChange={onDataChange} notify={alertUser}/>:
  tab==='qualifications'?<QualificationInbox roleModels={data.roleModels||[]} items={data.qualifications||[]} folders={data.qualificationFolders||[]} onChange={onDataChange} notify={alertUser} client={client} userId={userId}/>:
  tab==='collaborations'?<CareerCollection kind="collaborations" roleModels={data.roleModels||[]} items={data.collaborations||[]} onChange={onDataChange} notify={alertUser}/>:
  tab==='meetings'?<MeetingsCalendar events={data.meetings||[]} roleModels={data.roleModels||[]} onChange={onDataChange} notify={alertUser}/>:
  tab==='minutes'?<MeetingNotes notes={data.meetingNotes||[]} meetings={data.meetings||[]} roleModels={data.roleModels||[]} onChange={onDataChange} notify={alertUser}/>:
  <InboxPanel data={data} onDataChange={onDataChange} today={today()} notify={alertUser} storageClient={client} userId={userId} onOpenTask={id=>alertUser('오늘 할 일에 저장되어 있어.')} renderToday={()=><div className="focus-panel"><h2>오늘의 기회 실행</h2>{todayTasks.map(t=><div className="today-row" key={t.id}><input type="checkbox" checked={t.status==='done'} onChange={e=>onDataChange(s=>({...s,tasks:s.tasks.map(x=>x.id===t.id?{...x,status:e.target.checked?'done':'todo'}:x)}))}/><span>{t.title}</span></div>)}{!todayTasks.length&&<p className="muted">인박스 항목을 펼쳐 ‘오늘’을 누르면 여기에 모여.</p>}</div>}/>}
 </main><nav className="bottomnav" aria-label="앱 메뉴">{[['home',Home,'홈'],['videos',Video,'영상 북마크'],['research',ClipboardList,'조사'],['qualifications',GraduationCap,'자격'],['collaborations',Building2,'협업'],['meetings',CalendarDays,'만남'],['minutes',BookOpen,'회의록']].map(([id,Icon,label])=><button key={id} className={tab===id?'selected':''} onClick={()=>setTab(id)}><Icon size={21}/><small>{label}</small></button>)}</nav>
 {personEdit&&<div className="overlay" onMouseDown={e=>e.target===e.currentTarget&&setPersonEdit(null)}><form className="dialog" onSubmit={savePerson}><div className="dialog-heading"><h2>롤모델 {data.roleModels?.some(p=>p.id===personEdit.id)?'수정':'추가'}</h2><button type="button" disabled={personSaving} onClick={()=>setPersonEdit(null)}>닫기</button></div>{[['name','이름','예: 롤모델 이름'],['field','활동 분야','예: 무용·강의·문화기획'],['career','직업·활동','예: 안무가·문화예술 강사'],['goal','내가 닮고 싶은 커리어','예: 지역 축제와 공연 기획 참여'],['url','참고 링크','https://...']].map(([key,label,placeholder])=><label key={key}>{label}<input value={personEdit[key]||''} placeholder={placeholder} onChange={e=>setPersonEdit(s=>({...s,[key]:e.target.value}))} required={key==='name'}/></label>)}<label>YouTube 링크 (선택)<input type="url" inputMode="url" placeholder="https://www.youtube.com/@..." value={personEdit.youtubeUrl||''} onChange={e=>setPersonEdit(p=>({...p,youtubeUrl:e.target.value}))}/></label>
 <label>Instagram 링크 (선택)<input type="url" inputMode="url" placeholder="https://www.instagram.com/..." value={personEdit.instagramUrl||''} onChange={e=>setPersonEdit(p=>({...p,instagramUrl:e.target.value}))}/></label>
 <label>이메일 (선택)<input type="email" inputMode="email" autoComplete="off" placeholder="example@email.com" value={personEdit.email||''} onChange={e=>setPersonEdit(p=>({...p,email:e.target.value}))}/></label>
 <label>휴대폰 (선택)<input type="tel" inputMode="tel" autoComplete="off" placeholder="010-0000-0000" value={personEdit.phone||''} onChange={e=>setPersonEdit(p=>({...p,phone:e.target.value}))}/></label>
 <label>경력·관찰 메모<textarea rows={4} value={personEdit.notes||''} onChange={e=>setPersonEdit(s=>({...s,notes:e.target.value}))}/></label>
 <label>롤모델 사진<input type="file" accept="image/*" onChange={e=>{setPersonPhoto(e.target.files?.[0]||null);e.target.value=''}}/></label>
 {personPhoto&&<p className="muted">선택한 사진: {personPhoto.name}</p>}
 {personEdit.photoPath&&!personPhoto&&<CareerPhoto client={client} path={personEdit.photoPath} alt="등록된 롤모델 사진" className="role-photo-preview"/>}
 {personError&&<p className="error" role="alert">{personError}</p>}
 <button className="primary" disabled={personSaving}>{personSaving?'사진 업로드 중…':'저장'}</button></form></div>}
 {notice&&<div className="toast">{notice}</div>}</div>;
}
