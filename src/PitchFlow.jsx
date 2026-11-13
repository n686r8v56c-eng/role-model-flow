import React,{useState} from 'react';
import {Plus,Trash2,ChevronLeft,Check,ExternalLink} from 'lucide-react';
import './PitchFlow.css';
const uid=()=>globalThis.crypto?.randomUUID?.()||Date.now().toString(36)+Math.random().toString(36).slice(2);
const fields=[
 ['person','상대방 / 조직','상대방 이름 또는 조직'],
 ['role','역할 / 관계','직책·관계·의사결정 역할'],
 ['objective','이번 만남의 목표','구체적으로 어떤 합의를 원하는가?'],
 ['facts','확인된 사실','공개 자료 또는 상대방이 직접 말한 사실'],
 ['hypotheses','검증할 가설','상대방의 니즈, 우려, 이해관계에 관한 가설'],
 ['needs','확인된 니즈','대화에서 직접 확인한 문제나 기대'],
 ['proposal','핵심 제안','상대방에게 제공하는 가치와 조건'],
 ['evidence','제안 근거','실제 사례·검증 자료·출처'],
 ['questions','질문 리스트','상대의 필요를 확인할 질문 3~5개'],
 ['objections','예상 반론과 대응','예상 질문, 확인할 내용, 근거 있는 답변'],
 ['script','30초 / 3분 피치','자연스럽고 짧은 제안 스크립트'],
 ['agenda','미팅 진행 순서','오프닝 → 질문 → 제안 → 합의'],
 ['result','실제 반응과 결과','상대가 실제로 말한 내용'],
 ['nextAction','다음 액션','자료 전달, 후속 연락, 일정 합의'],
 ['nextDate','다음 확인일','YYYY-MM-DD'],
 ['sourceUrl','참고 자료 링크','https://...']
];
const pages=[
 ['people','상대 분석',['person','role','facts','hypotheses','sourceUrl']],
 ['needs','니즈',['needs','questions']],
 ['proposal','제안',['objective','proposal','evidence','script']],
 ['practice','리허설',['objections']],
 ['meeting','미팅',['agenda','result']],
 ['followup','후속',['nextAction','nextDate']]
];
const empty=()=>({id:uid(),createdAt:new Date().toISOString(),status:'준비',...Object.fromEntries(fields.map(([k])=>[k,'']))});
export default function PitchFlow({kind='business',items=[],onChange,notify,view='home'}){
 const [selected,setSelected]=useState(null);
 const [search,setSearch]=useState('');
 const [practice,setPractice]=useState(0);
 const business=kind==='business';
 const title=business?'BUSINESS PITCH':'SOCIAL PITCH';
 const current=items.find(x=>x.id===selected);
 const page=pages.find(x=>x[0]===view)||pages[0];
 const filtered=items.filter(x=>(x.person+' '+x.role+' '+x.objective).toLowerCase().includes(search.toLowerCase()));
 const save=updater=>onChange(s=>({...s,[business?'businessPitches':'socialPitches']:updater(s[business?'businessPitches':'socialPitches']||[])}));
 const add=()=>{const entry=empty();save(arr=>[entry,...arr]);setSelected(entry.id);notify('새 미팅 전략을 만들었어.');};
 const change=(key,value)=>save(arr=>arr.map(x=>x.id===current.id?{...x,[key]:value,updatedAt:new Date().toISOString()}:x));
 const remove=()=>{if(!window.confirm('이 미팅 전략과 기록을 삭제할까?'))return;save(arr=>arr.filter(x=>x.id!==current.id));setSelected(null)};
 const practicePrompts=business?['제안을 듣기 전에 우리 회사에 어떤 도움이 되는지 설명해 주세요.','이미 다른 업체와 거래하고 있는데, 왜 바꿔야 하죠?','가격·납기·실적을 뒷받침하는 자료가 있나요?','오늘 당장 결정하기는 어렵습니다.']:['그걸 왜 나에게 제안하는 거예요?','저에게 어떤 의미나 이익이 있을까요?','지금은 시간이 별로 없는데요.','일단 생각해 볼게요.'];
 return <section className="pitch-screen">
 <div className="pitch-heading"><div><small>ROLE MODEL FLOW / {title}</small><h1>{title}</h1><p>{business?'사업·영업·협업·투자 제안을 준비하고 다음 합의까지 관리해.':'도움 요청·협업 제안·관계 형성 등 사람 사이의 제안을 준비해.'}</p></div><button type="button" onClick={add}><Plus size={16}/> 새 제안</button></div>
 {!current?<><label className="pitch-search">미팅 검색<input value={search} onChange={e=>setSearch(e.target.value)} placeholder="상대방·목표 검색"/></label><div className="pitch-list">{filtered.map(x=><button type="button" className="pitch-item" key={x.id} onClick={()=>setSelected(x.id)}><strong>{x.person||'이름 없는 제안'}</strong><small>{x.role||'상대 정보 미입력'} · {x.status||'준비'}</small><span>{x.objective||'미팅 목표를 입력해줘'}</span></button>)}</div>{!items.length&&<div className="pitch-empty">아직 준비 중인 제안이 없어.<p>새 제안을 만들면 상대 분석부터 후속 관리까지 한 건으로 누적 저장돼.</p></div>}</>:
 <><div className="pitch-actions"><button type="button" onClick={()=>setSelected(null)}><ChevronLeft size={16}/> 목록</button><select aria-label="진행 상태" value={current.status||'준비'} onChange={e=>change('status',e.target.value)}>{['준비','미팅 예정','진행 완료','후속 진행','성사','보류','종료'].map(x=><option key={x}>{x}</option>)}</select><button type="button" onClick={remove}><Trash2 size={16}/> 삭제</button></div>
 <div className="pitch-summary"><strong>{current.person||'상대방 미입력'}</strong><span>{current.objective||'이번 만남의 목표를 입력해줘'}</span></div>
 {view==='home'?<div className="pitch-overview">{pages.map(([id,label,keys])=><div className="pitch-overview-card" key={id}><b>{label}</b><span>{keys.filter(k=>String(current[k]||'').trim()).length} / {keys.length} 기록</span><p>{keys.map(k=>current[k]).find(Boolean)||'아직 기록 없음'}</p></div>)}</div>:view==='practice'?<><div className="pitch-practice"><small>가상 반론 연습 · {practice+1}/{practicePrompts.length}</small><p>“{practicePrompts[practice]}”</p><div><button type="button" onClick={()=>setPractice((practice+practicePrompts.length-1)%practicePrompts.length)}>이전 질문</button><button type="button" onClick={()=>setPractice((practice+1)%practicePrompts.length)}>다음 질문</button></div><small>실제 상대의 반응을 예측한 사실이 아닌 일반적인 연습 질문이야.</small></div>{renderFields(['objections','script','evidence'])}</>:renderFields(page[2])}
 </>}
 </section>;
 function renderFields(keys){return <div className="pitch-fields">{keys.map(key=>{const [_,label,placeholder]=fields.find(f=>f[0]===key);const url=key==='sourceUrl';const date=key==='nextDate';return <label key={key}><b>{label}</b>{date?<input type="date" value={current[key]||''} onChange={e=>change(key,e.target.value)}/>:url?<><input type="url" inputMode="url" value={current[key]||''} placeholder={placeholder} onChange={e=>change(key,e.target.value)}/>{/^https?:\/\//i.test(current[key]||'')&&<a href={current[key]} target="_blank" rel="noopener noreferrer"><ExternalLink size={14}/> 링크 열기</a>}</>:<textarea rows={key==='person'||key==='role'?2:4} value={current[key]||''} placeholder={placeholder} onChange={e=>change(key,e.target.value)}/>}</label>})}<p className="pitch-hint"><Check size={14}/> 입력 내용은 기존 Role Model Flow 계정 데이터에 저장돼. 확인된 사실과 아직 검증하지 않은 가설은 구분해 기록해줘.</p></div>}
}
