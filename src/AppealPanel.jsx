import React,{useEffect,useMemo,useState} from 'react';
import {Plus,Pencil,Trash2,Camera,Save,X,ChevronDown,ChevronUp,CheckCircle2} from 'lucide-react';
import {CareerPhoto,uploadCareerPhoto} from './CareerPhoto.jsx';

export const APPEAL_TABS=[
 {id:'appearance',label:'외모',icon:'user-round'},
 {id:'assets',label:'자산',icon:'wallet'},
 {id:'family',label:'가정',icon:'users'},
 {id:'education',label:'학위',icon:'graduation-cap'},
 {id:'skills',label:'스킬',icon:'award'},
 {id:'hobbies',label:'취미',icon:'heart'},
 {id:'personality',label:'성격',icon:'brain'}
];
const uuid=()=>globalThis.crypto?.randomUUID?.()||'appeal-'+Date.now()+'-'+Math.random().toString(36).slice(2);
const DEFAULT={
 appearance:{height:'',weight:'',photoPath:'',intro:''},
 assets:{realEstate:[],deposits:[],savings:[]},
 family:{parents:'',brother:''},
 education:{graduate:'',university:'',highschool:''},
 skills:[],hobbies:[],
 personality:{summary:'',strengths:'',style:''},
 improvements:{appearance:'',assets:'',family:'',education:'',skills:'',hobbies:'',personality:''}
};
const copy=v=>JSON.parse(JSON.stringify(v));
function TextArea({label,value,onChange,placeholder,rows=3}){return <label className="appeal-field">{label}<textarea rows={rows} value={value||''} placeholder={placeholder||''} onChange={e=>onChange(e.target.value)}/></label>}
function Input({label,value,onChange,placeholder,type='text'}){return <label className="appeal-field">{label}<input type={type} value={value??''} placeholder={placeholder||''} onChange={e=>onChange(e.target.value)}/></label>}
function Entries({title,rows=[],onChange,kind}){
 const [expanded,setExpanded]=useState(null);
 const add=()=>{const id=uuid();onChange([...(rows||[]),{id,name:'',amount:'',memo:''}]);setExpanded(id)};
 const modify=(id,key,value)=>onChange(rows.map(r=>r.id===id?{...r,[key]:value}:r));
 const remove=id=>{if(!window.confirm('이 항목을 삭제할까?'))return;onChange(rows.filter(r=>r.id!==id))};
 return <section className="appeal-entries"><div className="appeal-subheading"><h3>{title}</h3><button type="button" className="small-btn" onClick={add}><Plus size={15}/> 추가</button></div>
 {(rows||[]).map((row,i)=><article className="appeal-entry" key={row.id||i}><div className="appeal-entry-title"><button type="button" onClick={()=>setExpanded(expanded===row.id?null:row.id)} aria-expanded={expanded===row.id}><b>{row.name||'새 항목'}</b>{row.amount&&<span>{Number(row.amount).toLocaleString('ko-KR')}원</span>}{row.memo&&!row.amount&&<small>{row.memo.slice(0,36)}</small>}</button><button type="button" onClick={()=>setExpanded(expanded===row.id?null:row.id)} aria-label="편집"><Pencil size={16}/></button><button type="button" onClick={()=>remove(row.id)} aria-label="삭제"><Trash2 size={16}/></button></div>
 {expanded===row.id&&<div className="appeal-entry-form"><Input label={kind==='skills'?'자격증·전문 스킬 이름':kind==='hobbies'?'취미 이름':'항목 이름'} value={row.name} onChange={v=>modify(row.id,'name',v)} placeholder={kind==='skills'?'예: 요가 지도자 자격증':kind==='hobbies'?'예: 무용, 독서':'예: 계좌명, 부동산, 저축 목표'}/>{kind==='assets'&&<Input label="금액 (원)" type="number" value={row.amount} onChange={v=>modify(row.id,'amount',v)} placeholder="0"/>}<TextArea label="설명·메모" rows={2} value={row.memo} onChange={v=>modify(row.id,'memo',v)} placeholder="내용을 자유롭게 입력해 줘"/><button className="small-btn" type="button" onClick={()=>setExpanded(null)}><CheckCircle2 size={15}/> 닫기</button></div>}</article>)}
 {!rows?.length&&<p className="appeal-hint">아직 등록된 항목이 없어.</p>}
 </section>;
}
function Overview({record,category,onEdit,client}){
 const a=record.appearance||{},assets=record.assets||{},family=record.family||{},edu=record.education||{},personality=record.personality||{};
 const Detail=({label,value})=><div className="appeal-detail"><span>{label}</span><strong>{value||'미입력'}</strong></div>;
 return <div className="appeal-overview"><div className="appeal-subheading"><h2>{APPEAL_TABS.find(x=>x.id===category)?.label}</h2><button className="small-btn" type="button" onClick={onEdit}><Pencil size={15}/> 편집</button></div>
 {category==='appearance'&&<div className="appeal-appearance"><CareerPhoto path={a.photoPath} client={client} alt="내 프로필 사진" className="appeal-portrait"/><div className="appeal-appearance-stats"><Detail label="키" value={a.height?a.height+' cm':''}/><Detail label="몸무게" value={a.weight?a.weight+' kg':''}/></div></div>}
 {category==='appearance'&&a.intro&&<p className="appeal-prose">{a.intro}</p>}
 {category==='assets'&&<><div className="appeal-finance-summary">{[['부동산','realEstate'],['예금','deposits'],['저축','savings']].map(([label,key])=>{const entries=assets[key]||[];const total=entries.reduce((sum,e)=>sum+(Number(e.amount)||0),0);return <div key={key}><small>{label} · {entries.length}개</small><strong>{total.toLocaleString('ko-KR')}원</strong></div>})}</div>{[['부동산','realEstate'],['예금','deposits'],['저축','savings']].map(([label,key])=><section className="appeal-preview-list" key={key}><h3>{label}</h3>{(assets[key]||[]).map((x,i)=><div key={x.id||i}><b>{x.name||'항목'}</b><span>{x.amount?Number(x.amount).toLocaleString('ko-KR')+'원':''}</span>{x.memo&&<small>{x.memo}</small>}</div>)}{!assets[key]?.length&&<p className="appeal-hint">미등록</p>}</section>)}</>}
 {category==='family'&&<><Detail label="부모님" value={family.parents}/><Detail label="남동생" value={family.brother}/></>}
 {category==='education'&&<><Detail label="대학원" value={edu.graduate}/><Detail label="대학교" value={edu.university}/><Detail label="고등학교" value={edu.highschool}/></>}
 {(category==='skills'||category==='hobbies')&&<div className="appeal-preview-list">{(record[category]||[]).map((x,i)=><div key={x.id||i}><b>{x.name||'항목'}</b>{x.memo&&<small>{x.memo}</small>}</div>)}{!record[category]?.length&&<p className="appeal-hint">아직 등록된 내용이 없어.</p>}</div>}
 {category==='personality'&&<><Detail label="나의 성격" value={personality.summary}/><Detail label="강점" value={personality.strengths}/><Detail label="관계·소통 스타일" value={personality.style}/></>}
 </div>;
}
function EditDetails({record,category,onUpdate,onPhotoUpload,uploading,client}){
 const a=record.appearance||{},assets=record.assets||{},family=record.family||{},edu=record.education||{},p=record.personality||{};
 const update=(field,value)=>onUpdate({[category]:{...record[category],[field]:value}});
 return <div className="appeal-edit-fields">
 {category==='appearance'&&<><div className="appeal-edit-photo"><CareerPhoto client={client} path={a.photoPath} className="appeal-portrait" alt="현재 프로필"/><label className="small-btn appeal-photo-upload"><Camera size={16}/> {uploading?'업로드 중…':'프로필 사진 업로드'}<input type="file" disabled={uploading} accept="image/*" onChange={e=>{const f=e.target.files?.[0];if(f)onPhotoUpload(f);e.target.value=''}}/></label></div><div className="appeal-two-cols"><Input label="키 (cm)" type="number" value={a.height} onChange={v=>update('height',v)} placeholder="168"/><Input label="몸무게 (kg)" type="number" value={a.weight} onChange={v=>update('weight',v)} placeholder="60"/></div><TextArea label="프로필 소개" value={a.intro} onChange={v=>update('intro',v)} placeholder="나를 소개하는 문장"/></>}
 {category==='assets'&&[['부동산','realEstate'],['예금','deposits'],['저축','savings']].map(([label,key])=><Entries key={key} kind="assets" title={label} rows={assets[key]||[]} onChange={rows=>update(key,rows)}/>)}
 {category==='family'&&<><TextArea label="부모님" rows={5} value={family.parents} onChange={v=>update('parents',v)} placeholder="부모님에 대해 자유롭게 기록"/><TextArea label="남동생" rows={5} value={family.brother} onChange={v=>update('brother',v)} placeholder="남동생에 대해 자유롭게 기록"/></>}
 {category==='education'&&<><TextArea label="대학원" value={edu.graduate} onChange={v=>update('graduate',v)} placeholder="학교·전공·학위·기간"/><TextArea label="대학교" value={edu.university} onChange={v=>update('university',v)} placeholder="학교·전공·학위·기간"/><TextArea label="고등학교" value={edu.highschool} onChange={v=>update('highschool',v)} placeholder="학교·졸업 정보"/></>}
 {(category==='skills'||category==='hobbies')&&<Entries title={category==='skills'?'전문 자격증·스킬':'좋아하는 취미'} kind={category} rows={record[category]||[]} onChange={rows=>onUpdate({[category]:rows})}/>}
 {category==='personality'&&<><TextArea label="내 성격" rows={5} value={p.summary} onChange={v=>update('summary',v)} placeholder="성격 특징, 가치관 등을 자유롭게"/><TextArea label="나의 강점" value={p.strengths} onChange={v=>update('strengths',v)} placeholder="나의 강점과 특성"/><TextArea label="관계·소통 스타일" value={p.style} onChange={v=>update('style',v)} placeholder="사람들과 소통하는 방식"/></>}
 </div>;
}
export default function AppealPanel({tab,record={},onChange,client,userId,notify}){
 const category=APPEAL_TABS.some(x=>x.id===tab)?tab:'appearance';
 const merged=useMemo(()=>({...copy(DEFAULT),...record,appearance:{...DEFAULT.appearance,...(record.appearance||{})},assets:{...DEFAULT.assets,...(record.assets||{})},family:{...DEFAULT.family,...(record.family||{})},education:{...DEFAULT.education,...(record.education||{})},personality:{...DEFAULT.personality,...(record.personality||{})},improvements:{...DEFAULT.improvements,...(record.improvements||{})}}),[record]);
 const [editing,setEditing]=useState(false),[draft,setDraft]=useState(null),[uploading,setUploading]=useState(false),[uploadError,setUploadError]=useState('');
 useEffect(()=>{setEditing(false);setDraft(null);setUploadError('')},[category]);
 const current=draft||merged;
 const patch=fields=>setDraft(s=>({...s,...fields}));
 const start=()=>{setDraft(copy(merged));setEditing(true)};
 const save=()=>{if(!draft)return;onChange(s=>({...s,appealProfile:{...draft}}));setEditing(false);setDraft(null);notify('APPEAL 정보를 저장했어.')};
 const upload=async file=>{setUploadError('');setUploading(true);try{const path=await uploadCareerPhoto(client,userId,file,'appeal-profile');setDraft(s=>({...s,appearance:{...s.appearance,photoPath:path}}))}catch(e){setUploadError(e.message||'사진 업로드 실패')}finally{setUploading(false)}};
 const supplementCount=Object.values(merged.improvements||{}).filter(v=>v?.trim()).length;
 return <section className="screen appeal-screen"><div className="heading"><div><h1>APPEAL · {APPEAL_TABS.find(x=>x.id===category)?.label}</h1><p>지금의 나를 보여주는 프로필</p></div><span className="appeal-count">보충점 {supplementCount}개</span></div>
 {!editing?<Overview record={merged} category={category} onEdit={start} client={client}/>:<div className="appeal-editor"><div className="appeal-subheading"><h2>{APPEAL_TABS.find(x=>x.id===category)?.label} 편집</h2><button className="appeal-close" onClick={()=>{setEditing(false);setDraft(null)}} aria-label="편집 취소"><X size={19}/></button></div><EditDetails record={current} category={category} onUpdate={patch} onPhotoUpload={upload} uploading={uploading} client={client}/>{uploadError&&<p className="error" role="alert">{uploadError}</p>}</div>}
 <section className="appeal-improvement"><h2>보충할 점</h2><p>이 분야에서 더 보완하거나 준비하고 싶은 내용을 자유롭게 적어 봐.</p>
 {editing?<TextArea label="보충점" rows={5} value={current.improvements[category]} onChange={v=>patch({improvements:{...current.improvements,[category]:v}})} placeholder="보충할 내용을 작성해 줘"/>:<p className="appeal-prose">{merged.improvements[category]||'아직 보충할 점을 적지 않았어.'}</p>}
 {!editing&&<button type="button" className="small-btn" onClick={start}><Pencil size={15}/> 보충점 작성·수정</button>}
 </section>
 {editing&&<div className="appeal-save-actions"><button className="primary" type="button" disabled={uploading} onClick={save}><Save size={16}/> 저장</button><button className="small-btn" type="button" onClick={()=>{setEditing(false);setDraft(null)}}>취소</button></div>}
 </section>;
}
export function AppealImprovements({record={},onSelect,notify}){
 const items=record.improvements||{};
 const withText=APPEAL_TABS.filter(x=>String(items[x.id]||'').trim());
 return <section className="screen appeal-improvements-list"><div className="heading"><div><h1>보충점</h1><p>7개 분야에서 보완하고 싶은 내용을 한곳에 모았어.</p></div><span className="appeal-count">{withText.length}개 분야</span></div>
 {withText.map(entry=><article className="person-card appeal-improvement-entry" key={entry.id}><button className="person-head" onClick={()=>onSelect(entry.id)}><div><b>{entry.label}</b><small>탭으로 이동해 편집</small></div><ChevronDown size={18}/></button><p>{items[entry.id]}</p></article>)}
 {!withText.length&&<div className="empty">아직 등록한 보충점이 없어. 각 탭의 ‘보충할 점’에 적으면 여기에 모여.</div>}
 </section>;
}
