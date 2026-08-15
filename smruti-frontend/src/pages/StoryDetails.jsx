import {useState} from 'react';
import {useParams,Link,useNavigate} from 'react-router-dom';
import {Heart,Share2,Clock3,Eye,ChevronLeft,ArrowRight,Pencil,Trash2} from 'lucide-react';
import {Image} from '@/components/ui/image';
import {useHeritage} from '@/context/HeritageContext';
import AudioPlayer from '@/components/AudioPlayer';
import SectionHeader from '@/components/SectionHeader';
import ConfirmDialog from '@/components/ConfirmDialog';
import {toast} from '@/components/ui/use-toast';
import {members} from '@/data/mockData';

export default function StoryDetails(){
  const {id}=useParams(),nav=useNavigate(),{stories,toggleFavorite,remove}=useHeritage(),[confirm,setConfirm]=useState(false);
  const s=stories.find(x=>x.id===id);
  if(!s)return <div className="card p-10 text-center"><h2 className="font-display text-xl">Story not found</h2><Link to="/stories" className="btn mt-4 inline-flex">Back to Stories</Link></div>;
  const author=members.find(m=>m.name===s.author);
  const related=stories.filter(x=>x.id!==s.id&&x.category===s.category).slice(0,3);

  return <>
    <Link to="/stories" className="inline-flex items-center gap-1 text-sm text-stone-500 hover:text-olive mb-4"><ChevronLeft className="w-4"/> Back to Stories</Link>
    <article className="max-w-4xl mx-auto">
      <Image src={s.image} alt={s.title} className="w-full h-[42vh] rounded-2xl"/>
      <div className="max-w-3xl mx-auto card p-6 md:p-10 -mt-12 relative">
        <div className="flex justify-between items-start">
          <div>
            <span className="badge mb-2">{s.category}</span>
            <p className="text-olive text-sm">A FAMILY STORY</p>
            <h1 className="font-display text-3xl md:text-4xl font-semibold mt-2">{s.title}</h1>
          </div>
          <div className="flex gap-2">
            <button onClick={()=>toggleFavorite('story',id)} className="touch" aria-label="Favorite"><Heart className={`w-5 ${s.favorite?'fill-red-400 text-red-400':''}`}/></button>
            <button onClick={()=>{navigator.clipboard?.writeText(window.location.href);toast({title:'Share link copied'});}} className="touch" aria-label="Share"><Share2/></button>
            <button onClick={()=>nav('/add/story')} className="touch" aria-label="Edit"><Pencil/></button>
            <button onClick={()=>setConfirm(true)} className="touch text-red-500" aria-label="Delete"><Trash2/></button>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-4 mt-4 pb-4 border-b border-[#f0eadf]">
          <div className="flex items-center gap-2"><img src={s.authorPhoto} className="w-10 h-10 rounded-full"/><div><b className="text-sm">{s.author}</b><p className="text-xs text-stone-500">{author?.relationship||'Family Member'}</p></div></div>
          <span className="text-sm text-stone-500">{s.date}</span>
          <span className="text-sm text-stone-500 flex items-center gap-1"><Clock3 className="w-4"/>{s.duration}</span>
          <span className="text-sm text-stone-500 flex items-center gap-1"><Eye className="w-4"/>{s.views} views</span>
        </div>
        {s.audio&&<div className="my-6"><AudioPlayer label="Listen to this story"/></div>}
        <div className="mt-6"><p className="text-lg leading-8 text-stone-700 whitespace-pre-line">{s.text}</p></div>
        <div className="flex flex-wrap gap-2 mt-6 pt-6 border-t border-[#f0eadf]">{s.tags?.map(t=><span key={t} className="badge bg-stone-100 text-stone-600">#{t}</span>)}</div>
      </div>
    </article>
    {author&&<div className="max-w-4xl mx-auto mt-8"><SectionHeader title="About the Storyteller" subtitle="The voice behind this memory."/><Link to={`/members/${author.id}`} className="card p-5 flex items-center gap-4 hover:shadow-md transition-shadow"><img src={author.photo} className="w-16 h-16 rounded-full"/><div className="flex-1"><b>{author.name}</b><p className="text-sm text-stone-500">{author.relationship} · {author.occupation}</p><p className="text-sm text-stone-600 mt-1 line-clamp-1">{author.bio}</p></div><ArrowRight className="w-5 text-stone-400"/></Link></div>}
    {related.length>0&&<div className="max-w-4xl mx-auto mt-8"><SectionHeader title="Related Stories" subtitle={`More ${s.category.toLowerCase()} stories`} to="/stories"/><div className="grid sm:grid-cols-3 gap-5">{related.map(rs=><Link to={`/stories/${rs.id}`} key={rs.id} className="card overflow-hidden hover:shadow-md transition-shadow"><Image src={rs.image} className="w-full h-28"/><div className="p-3"><h3 className="font-display text-base font-semibold">{rs.title}</h3><p className="text-xs text-stone-500 mt-1">By {rs.author}</p></div></Link>)}</div></div>}
    <ConfirmDialog open={confirm} onOpenChange={setConfirm} onConfirm={()=>{remove('story',id);nav('/stories')}} title="Delete this story?" description="This story will be permanently removed from your family archive." confirmLabel="Delete Story"/>
  </>;
}