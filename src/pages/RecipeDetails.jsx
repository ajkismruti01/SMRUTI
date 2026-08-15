import {useState} from 'react';
import {useParams,Link,useNavigate} from 'react-router-dom';
import {Clock3,Users,Star,Play,Heart,Share2,ChevronLeft,BarChart3,Eye,Pencil,Trash2} from 'lucide-react';
import {Image} from '@/components/ui/image';
import {useHeritage} from '@/context/HeritageContext';
import AudioPlayer from '@/components/AudioPlayer';
import SectionHeader from '@/components/SectionHeader';
import ConfirmDialog from '@/components/ConfirmDialog';
import {toast} from '@/components/ui/use-toast';

export default function RecipeDetails(){
  const {id}=useParams(),nav=useNavigate(),{recipes,toggleFavorite,remove}=useHeritage(),[confirm,setConfirm]=useState(false);
  const r=recipes.find(x=>x.id===id);
  if(!r)return <div className="card p-10 text-center"><h2 className="font-display text-xl">Recipe not found</h2><Link to="/recipes" className="btn mt-4 inline-flex">Back to Recipes</Link></div>;
  const moreFromAuthor=recipes.filter(x=>x.id!==r.id&&x.sharedBy===r.sharedBy).slice(0,4);

  return <>
    <Link to="/recipes" className="inline-flex items-center gap-1 text-sm text-stone-500 hover:text-olive mb-4"><ChevronLeft className="w-4"/> Back to Recipes</Link>
    <div className="grid lg:grid-cols-2 gap-8">
      <div>
        <div className="relative rounded-2xl overflow-hidden"><Image src={r.image} alt={r.name} className="w-full h-[55vh]"/>{r.favorite&&<span className="absolute top-4 right-4 bg-white/90 rounded-full p-2"><Star className="w-5 text-[#e89538] fill-[#e89538]"/></span>}</div>
        <div className="flex gap-2 mt-4">
          <button onClick={()=>toggleFavorite('recipe',id)} className="btn-outline flex-1"><Heart className={`w-4 ${r.favorite?'fill-red-400 text-red-400':''}`}/> Favorite</button>
          <button onClick={()=>{navigator.clipboard?.writeText(window.location.href);toast({title:'Share link copied'});}} className="btn-outline flex-1"><Share2 className="w-4"/> Share</button>
          <button onClick={()=>nav('/add/recipe')} className="btn-outline" aria-label="Edit"><Pencil className="w-4"/></button>
          <button onClick={()=>setConfirm(true)} className="btn-outline text-red-600" aria-label="Delete"><Trash2 className="w-4"/></button>
        </div>
      </div>
      <div>
        <span className="badge mb-2">{r.category}</span>
        <h1 className="font-display text-4xl font-semibold">{r.name}</h1>
        <div className="flex items-center gap-2 mt-3"><img src={r.sharedByPhoto} className="w-10 h-10 rounded-full"/><div><b className="text-sm">{r.sharedBy}</b><p className="text-xs text-stone-500">Family Recipe Contributor</p></div></div>
        <div className="grid grid-cols-4 gap-3 my-5">
          <div className="card p-3 text-center"><Clock3 className="w-5 text-olive mx-auto"/><b className="block text-sm mt-1">{r.time}m</b><span className="text-xs text-stone-400">Cook</span></div>
          <div className="card p-3 text-center"><Users className="w-5 text-olive mx-auto"/><b className="block text-sm mt-1">{r.servings}</b><span className="text-xs text-stone-400">Serves</span></div>
          <div className="card p-3 text-center"><BarChart3 className="w-5 text-olive mx-auto"/><b className="block text-sm mt-1">{r.difficulty}</b><span className="text-xs text-stone-400">Level</span></div>
          <div className="card p-3 text-center"><Eye className="w-5 text-olive mx-auto"/><b className="block text-sm mt-1">{r.views}</b><span className="text-xs text-stone-400">Views</span></div>
        </div>
        <div className="bg-[#f7f8ef] rounded-xl p-4 mb-5"><p className="text-sm font-semibold text-olive mb-1">The Story Behind This Recipe</p><p className="text-sm text-stone-600 leading-7">{r.story}</p></div>
        <div className="mb-5"><AudioPlayer label={`Listen to ${r.sharedBy}'s original recipe`}/></div>
        <h2 className="font-display text-2xl font-semibold mb-3">Ingredients</h2>
        <ul className="space-y-2 mb-6">{r.ingredients.map((x,i)=><li key={i} className="flex items-center gap-2 text-sm text-stone-700"><span className="w-1.5 h-1.5 rounded-full bg-olive"/>{x}</li>)}</ul>
        <h2 className="font-display text-2xl font-semibold mb-3">Preparation Steps</h2>
        <ol className="space-y-3">{r.steps.map((x,i)=><li key={i} className="flex gap-3"><span className="w-7 h-7 rounded-full bg-olive text-white grid place-items-center text-sm font-bold shrink-0">{i+1}</span><span className="text-sm text-stone-700 pt-1">{x}</span></li>)}</ol>
        <div className="flex flex-wrap gap-2 mt-6 pt-6 border-t border-[#f0eadf]">{r.tags?.map(t=><span key={t} className="badge bg-stone-100 text-stone-600">#{t}</span>)}</div>
      </div>
    </div>
    {moreFromAuthor.length>0&&<div className="mt-10"><SectionHeader title={`More from ${r.sharedBy}`} subtitle="Other recipes from the same family member." to="/recipes"/><div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-5">{moreFromAuthor.map(x=><Link to={`/recipes/${x.id}`} key={x.id} className="card overflow-hidden hover:shadow-md transition-shadow"><Image src={x.image} className="w-full h-32"/><div className="p-3"><h3 className="font-display text-base font-semibold">{x.name}</h3><p className="text-xs text-stone-500 mt-1">By {x.sharedBy} · {x.time} min</p></div></Link>)}</div></div>}
    <ConfirmDialog open={confirm} onOpenChange={setConfirm} onConfirm={()=>{remove('recipe',id);nav('/recipes')}} title="Delete this recipe?" description="This recipe will be permanently removed from your family archive." confirmLabel="Delete Recipe"/>
  </>;
}