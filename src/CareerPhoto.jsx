import React,{useEffect,useState} from 'react';
import {ImagePlus} from 'lucide-react';
const BUCKET='focus-inbox-images';
export async function uploadCareerPhoto(client,userId,file,scope='career'){
 if(!client||!userId)throw new Error('로그인 후 사진을 등록할 수 있어.');
 if(!file?.type?.startsWith('image/'))throw new Error('사진 파일을 선택해 줘.');
 if(file.size>20*1024*1024)throw new Error('사진은 20MB 이하만 가능해.');
 const source=URL.createObjectURL(file);
 let blob;
 try{
  const img=new Image();img.src=source;await img.decode();
  const scale=Math.min(1,1600/Math.max(img.naturalWidth,img.naturalHeight));
  const canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(img.naturalWidth*scale));canvas.height=Math.max(1,Math.round(img.naturalHeight*scale));
  canvas.getContext('2d').drawImage(img,0,0,canvas.width,canvas.height);
  blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/jpeg',.82));
  if(!blob)throw new Error('사진 처리에 실패했어.');
 }finally{URL.revokeObjectURL(source)}
 const id=globalThis.crypto?.randomUUID?.()||`${Date.now()}-${Math.random().toString(36).slice(2)}`;
 const path=`${userId}/${scope}-${id}.jpg`;
 const {error}=await client.storage.from(BUCKET).upload(path,blob,{contentType:'image/jpeg',upsert:false});
 if(error)throw new Error('사진 업로드 실패: '+error.message);
 return path;
}
export function CareerPhoto({client,path,alt='사진',className='',onClick}){
 const [url,setUrl]=useState('');
 useEffect(()=>{let active=true;setUrl('');if(!client||!path)return()=>{active=false};
 client.storage.from(BUCKET).createSignedUrl(path,3600).then(({data})=>{if(active)setUrl(data?.signedUrl||'')}).catch(()=>{});
 return()=>{active=false};
 },[client,path]);
 return url?<img src={url} alt={alt} className={className} loading="lazy" onClick={onClick}/>:<span className={className+' photo-placeholder'}><ImagePlus size={19}/></span>;
}
