import {Mic2,Clock3,Eye,Heart,Play} from 'lucide-react';
import {Link} from 'react-router-dom';
import {Image} from '@/components/ui/image';
export default function StoryCard({item,onFavorite,compact}){
  return <Link to={`/stories/${item.id}`} className="card overflow-hidden block group hover:shadow-md transition-shadow">
    <div className="relative">
      <Image src={item.image} alt={item.title} className="w-full h-44"/>
      {item.audio&&<span className="absolute top-3 right-3 bg-white/90 rounded-full p-1.5"><Mic2 className="w-4 text-olive"/></span>}
      <span className="absolute bottom-3 left-3 bg-black/60 text-white text-xs px-2 py-1 rounded-md flex items-center gap-1"><Clock3 className="w-3"/>{item.duration}</span>
    </div>
    <div className="p-4">
      <span className="badge mb-2">{item.category}</span>
      <h3 className="font-display text-lg font-semibold leading-snug">{item.title}</h3>
      <div className="flex items-center gap-2 mt-2">
        <img src={item.authorPhoto} className="w-6 h-6 rounded-full"/>
        <span className="text-xs text-stone-500">By {item.author} · {item.date}</span>
      </div>
      <p className="text-sm text-stone-600 mt-2 line-clamp-2">{item.preview}</p>
      <div className="flex justify-between items-center mt-3 pt-3 border-t border-[#f0eadf]">
        <span className="text-xs text-stone-400 flex items-center gap-1"><Eye className="w-3"/>{item.views} views</span>
        {onFavorite&&<button onClick={e=>{e.preventDefault();onFavorite(item.id);}} className="text-stone-400 hover:text-red-400"><Heart className={`w-4 ${item.favorite?'fill-red-400 text-red-400':''}`}/></button>}
      </div>
    </div>
  </Link>;
}