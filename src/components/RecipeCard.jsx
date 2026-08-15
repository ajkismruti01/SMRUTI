import {Clock3,Bookmark} from 'lucide-react';
import {Link} from 'react-router-dom';
import {Image} from '@/components/ui/image';

export default function RecipeCard({item,onFavorite}){
  return <article className="card overflow-hidden">
    <Link to={`/recipes/${item.id}`}>
      <Image src={item.image} alt={item.name} className="w-full h-44"/>
    </Link>
    <div className="p-4">
      <div className="flex justify-between">
        <Link to={`/recipes/${item.id}`} className="font-display text-lg font-semibold">{item.name}</Link>
        <button onClick={()=>onFavorite?.(item.id)} aria-label="Bookmark"><Bookmark className={`w-5 ${item.favorite?'fill-[#58752c] text-[#58752c]':''}`}/></button>
      </div>
      <div className="flex items-center gap-2 mt-2">
        <img src="https://i.pravatar.cc/100?img=47" className="w-6 h-6 rounded-full"/>
        <span className="text-sm text-stone-600">By {item.sharedBy}</span>
      </div>
      <div className="flex gap-2 mt-3">
        <span className="text-xs bg-stone-100 px-2 py-1 rounded-md flex items-center gap-1"><Clock3 className="w-3"/>{item.time} mins</span>
        <span className="text-xs bg-stone-100 px-2 py-1 rounded-md">Easy</span>
      </div>
    </div>
  </article>;
}