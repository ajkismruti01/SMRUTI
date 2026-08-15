import {useParams,useNavigate,Link} from 'react-router-dom';
import {Heart,MapPin,Calendar,Users,Share2,Pencil,Trash2,Eye,Tag,FolderOpen,Clock,ChevronLeft} from 'lucide-react';
import {useState} from 'react';
import {Image} from '@/components/ui/image';
import {useHeritage} from '@/context/HeritageContext';
import {toast} from '@/components/ui/use-toast';
import ConfirmDialog from '@/components/ConfirmDialog';
import SectionHeader from '@/components/SectionHeader';

export default function MemoryDetails(){
  const {id}=useParams(),nav=useNavigate(),{memories,toggleFavorite,remove}=useHeritage(),[confirm,setConfirm]=useState(false),[activeImg,setActiveImg]=useState(0);
  const m=memories.find(x=>x.id===id);
  if(!m)return <p>Memory not found.</p>;
  const related=memories.filter(x=>x.id!==m.id&&x.category===m.category).slice(0,3);
  const sameYear=memories.filter(x=>x.id!==m.id&&x.year===m.year).slice(0,3);
  const sameLocation=memories.filter(x=>x.id!==m.id&&x.location===m.location).slice(0,3);
  const gallery=m.gallery||[m.image];

  return <>
    <Link to="/memories" className="inline-flex items-center gap-1 text-sm text-stone-500 hover:text-olive mb-4"><ChevronLeft className="w-4"/> Back to Memories</Link>

    <div className="card overflow-hidden">
      <div className="relative">
        <Image src={gallery[activeImg]} alt={m.title} className="w-full h-[38vh] md:h-[55vh]"/>
        <span className="date-badge">{m.date}</span>
        <span className="absolute top-3 right-3 bg-white/90 rounded-full px-3 py-1 text-xs font-semibold flex items-center gap-1"><Eye className="w-3"/>{m.views} views</span>
      </div>
      {gallery.length>1&&(
        <div className="flex gap-2 p-4 overflow-x-auto">
          {gallery.map((g,i)=>(
            <button key={i} onClick={()=>setActiveImg(i)} className={`shrink-0 w-20 h-16 rounded-lg overflow-hidden border-2 ${activeImg===i?'border-[#58752c]':'border-transparent'}`}><img src={g} className="w-full h-full object-cover"/></button>
          ))}
        </div>
      )}
      <div className="p-5 md:p-8">
        <div className="flex flex-wrap justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2"><span className="badge">{m.category}</span><span className="badge bg-stone-100 text-stone-600">{m.type}</span></div>
            <h1 className="font-display text-3xl md:text-4xl font-semibold">{m.title}</h1>
            <p className="text-stone-500 flex flex-wrap gap-4 mt-3">
              <span className="flex gap-1 items-center"><Calendar className="w-4"/>{m.date}</span>
              <span className="flex gap-1 items-center"><MapPin className="w-4"/>{m.location}</span>
            </p>
          </div>
          <div className="flex gap-2">
            <button onClick={()=>toggleFavorite('memory',id)} className="touch"><Heart className={`w-5 ${m.favorite?'fill-red-400 text-red-400':''}`}/></button>
            <button aria-label="Share" onClick={()=>{navigator.clipboard?.writeText(window.location.href);toast({title:'Share link copied'});}} className="touch"><Share2/></button>
            <button aria-label="Edit" onClick={()=>nav('/add/memory')} className="touch"><Pencil/></button>
            <button onClick={()=>setConfirm(true)} className="touch text-red-500"><Trash2/></button>
          </div>
        </div>
        <p className="mt-6 max-w-3xl text-stone-700 leading-8 text-lg">{m.description}</p>
        <div className="grid sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-[#f0eadf]">
          <div className="flex items-center gap-2 text-sm"><FolderOpen className="w-4 text-stone-400"/><div><span className="text-stone-400 block text-xs">Uploaded by</span><b>{m.uploadedBy}</b></div></div>
          <div className="flex items-center gap-2 text-sm"><Clock className="w-4 text-stone-400"/><div><span className="text-stone-400 block text-xs">Upload date</span><b>{m.uploadDate}</b></div></div>
          <div className="flex items-center gap-2 text-sm"><Tag className="w-4 text-stone-400"/><div><span className="text-stone-400 block text-xs">Category</span><b>{m.category}</b></div></div>
        </div>
      </div>
    </div>

    <div className="mt-8">
      <SectionHeader title="People in this Memory" subtitle={`${m.people.length} family members tagged`}/>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {m.people.map(p=>(
          <Link to={`/members/${p.id}`} key={p.id} className="card p-4 flex flex-col items-center text-center hover:shadow-md transition-shadow">
            <img src={p.photo} className="w-16 h-16 rounded-full mb-2"/>
            <b className="text-sm">{p.name}</b>
            <span className="text-xs text-stone-500">{p.relationship}</span>
            <span className="text-xs text-olive mt-1">{p.memories} memories</span>
          </Link>
        ))}
      </div>
    </div>

    {related.length>0&&(
      <div className="mt-8">
        <SectionHeader title="Related Memories" subtitle={`More ${m.category.toLowerCase()} memories`} to="/memories"/>
        <div className="grid sm:grid-cols-3 gap-5">
          {related.map(rm=>(
            <Link to={`/memories/${rm.id}`} key={rm.id} className="card overflow-hidden group hover:shadow-md transition-shadow">
              <div className="relative"><Image src={rm.image} className="w-full h-32"/><span className="date-badge">{rm.date}</span></div>
              <div className="p-3"><h3 className="font-display text-base font-semibold">{rm.title}</h3><p className="text-xs text-stone-500 mt-1 flex items-center gap-1"><MapPin className="w-3"/>{rm.location}</p></div>
            </Link>
          ))}
        </div>
      </div>
    )}

    {sameYear.length>0&&(
      <div className="mt-8">
        <SectionHeader title={`From ${m.year}`} subtitle="More memories from the same year" to="/memories"/>
        <div className="grid sm:grid-cols-3 gap-5">
          {sameYear.map(rm=>(
            <Link to={`/memories/${rm.id}`} key={rm.id} className="card overflow-hidden group hover:shadow-md transition-shadow">
              <div className="relative"><Image src={rm.image} className="w-full h-32"/><span className="date-badge">{rm.date}</span></div>
              <div className="p-3"><h3 className="font-display text-base font-semibold">{rm.title}</h3><p className="text-xs text-stone-500 mt-1 flex items-center gap-1"><MapPin className="w-3"/>{rm.location}</p></div>
            </Link>
          ))}
        </div>
      </div>
    )}

    {sameLocation.length>0&&(
      <div className="mt-8">
        <SectionHeader title={`More from ${m.location}`} subtitle="Other memories in this place" to="/memories"/>
        <div className="grid sm:grid-cols-3 gap-5">
          {sameLocation.map(rm=>(
            <Link to={`/memories/${rm.id}`} key={rm.id} className="card overflow-hidden group hover:shadow-md transition-shadow">
              <div className="relative"><Image src={rm.image} className="w-full h-32"/><span className="date-badge">{rm.date}</span></div>
              <div className="p-3"><h3 className="font-display text-base font-semibold">{rm.title}</h3><p className="text-xs text-stone-500 mt-1">{rm.year}</p></div>
            </Link>
          ))}
        </div>
      </div>
    )}

    <ConfirmDialog open={confirm} onOpenChange={setConfirm} onConfirm={()=>{remove('memory',id);nav('/memories')}} title="Delete this memory?" description="This memory will be permanently removed from your family archive." confirmLabel="Delete Memory"/>
  </>;
}