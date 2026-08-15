import {Heart,MapPin,MoreVertical} from 'lucide-react';
import {Link} from 'react-router-dom';
import {Image} from '@/components/ui/image';

export default function MemoryCard({item,onFavorite}){
  return <article className="card overflow-hidden group">
    <Link to={`/memories/${item.id}`} className="relative block">
      <Image src={item.image} alt={item.title} className="w-full h-48"/>
      <span className="date-badge">{item.date}</span>
    </Link>
    <div className="p-4">
      <div className="flex justify-between">
        <Link to={`/memories/${item.id}`} className="font-display font-semibold text-lg">{item.title}</Link>
        <button onClick={()=>onFavorite?.(item.id)} aria-label="Favorite"><Heart className={`w-5 ${item.favorite?'fill-red-400 text-red-400':''}`}/></button>
      </div>
      <p className="text-xs text-stone-500 mt-2 flex gap-1"><MapPin className="w-3.5"/>{item.location}</p>
      <p className="text-sm text-stone-600 mt-2 line-clamp-2">{item.description}</p>
      <div className="flex justify-between items-center mt-3">
        <div className="flex -space-x-2">{item.people?.slice(0,4).map(p=><img key={p.id} src={p.photo} className="w-7 h-7 rounded-full border-2 border-white"/>)}</div>
        <MoreVertical className="w-4 text-stone-400"/>
      </div>
    </div>
  </article>;
}