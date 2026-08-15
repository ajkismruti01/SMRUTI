import {Image as ImageIcon,Plus,Filter,LayoutGrid,List,Star,MapPin} from 'lucide-react';
import {Link} from 'react-router-dom';
import {useState} from 'react';
import {useHeritage} from '@/context/HeritageContext';
import PageHeader from '@/components/PageHeader';
import MemoryCard from '@/components/MemoryCard';
import FilterBar from '@/components/FilterBar';
import SectionHeader from '@/components/SectionHeader';
import EmptyState from '@/components/EmptyState';
import {Image} from '@/components/ui/image';

export default function Memories(){
  const {memories,toggleFavorite}=useHeritage();
  const [filter,setFilter]=useState('All Memories');
  const [view,setView]=useState('Grid');
  const [favoritesOnly,setFavoritesOnly]=useState(false);
  const [yearFilter,setYearFilter]=useState('All Years');
  const [categoryFilter,setCategoryFilter]=useState('All Categories');

  const years=[...new Set(memories.map(m=>m.year))].sort((a,b)=>b-a);
  const categories=[...new Set(memories.map(m=>m.category))];
  const shown=memories.filter(m=>{
    if(filter!=='All Memories'&&m.type!==filter)return false;
    if(favoritesOnly&&!m.favorite)return false;
    if(yearFilter!=='All Years'&&String(m.year)!==yearFilter)return false;
    if(categoryFilter!=='All Categories'&&m.category!==categoryFilter)return false;
    return true;
  });
  const featured=memories.filter(m=>m.favorite).slice(0,2);

  return <>
    <PageHeader icon={ImageIcon} title="Memories" subtitle="Relive and cherish the precious moments of our family." action={<Link to="/add/memory" className="btn"><Plus className="w-4"/> Add Memory</Link>}/>
    <FilterBar items={['All Memories','Photos','Videos','Documents','Audio']} value={filter} onChange={setFilter}/>

    <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_280px] gap-6 mt-5">
      <div>
        {featured.length>0&&filter==='All Memories'&&!favoritesOnly&&(
          <>
            <SectionHeader title="Featured Memories" subtitle="Moments marked as family favorites."/>
            <div className="grid sm:grid-cols-2 gap-5 mb-6">
              {featured.map(m=>(
                <Link to={`/memories/${m.id}`} key={m.id} className="card overflow-hidden group hover:shadow-md transition-shadow">
                  <div className="relative">
                    <Image src={m.image} className="w-full h-44"/>
                    <span className="date-badge">{m.date}</span>
                    <span className="absolute top-3 right-3 bg-white/90 rounded-full p-1.5"><Star className="w-4 text-[#e89538] fill-[#e89538]"/></span>
                  </div>
                  <div className="p-4">
                    <span className="badge mb-2">{m.category}</span>
                    <h3 className="font-display text-lg font-semibold">{m.title}</h3>
                    <p className="text-xs text-stone-500 mt-1 flex items-center gap-1"><MapPin className="w-3"/>{m.location}</p>
                    <p className="text-sm text-stone-600 mt-2 line-clamp-2">{m.description}</p>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}

        <SectionHeader title={favoritesOnly?'Favorite Memories':'All Memories'} subtitle={`${shown.length} memories found`}/>
        <div className="flex items-center gap-2 mb-4">
          <button onClick={()=>setView('Grid')} className={`touch w-9 h-9 ${view==='Grid'?'bg-[#e8ecd9] text-olive':''}`}><LayoutGrid className="w-4"/></button>
          <button onClick={()=>setView('List')} className={`touch w-9 h-9 ${view==='List'?'bg-[#e8ecd9] text-olive':''}`}><List className="w-4"/></button>
        </div>

        {shown.length?(
          view==='Grid'?(
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {shown.map(x=><MemoryCard key={x.id} item={x} onFavorite={id=>toggleFavorite('memory',id)}/>)}
            </div>
          ):(
            <div className="space-y-3">
              {shown.map(m=>(
                <Link to={`/memories/${m.id}`} key={m.id} className="card p-3 flex gap-4 group hover:shadow-md transition-shadow">
                  <Image src={m.image} className="w-28 h-24 rounded-lg shrink-0"/>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between"><h3 className="font-display text-lg font-semibold">{m.title}</h3><span className="badge shrink-0">{m.category}</span></div>
                    <p className="text-xs text-stone-500 mt-1 flex gap-3"><span className="flex items-center gap-1"><MapPin className="w-3"/>{m.location}</span><span>{m.date}</span></p>
                    <p className="text-sm text-stone-600 mt-1 line-clamp-1">{m.description}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex -space-x-2">{m.people.slice(0,3).map(p=><img key={p.id} src={p.photo} className="w-6 h-6 rounded-full border-2 border-white"/>)}</div>
                      <span className="text-xs text-stone-400">{m.people.length} people · {m.views} views</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )
        ):<EmptyState title="No memories found" message="Try changing your search or filters." actionLabel="Add Memory" actionTo="/add/memory"/>}

        {shown.length>0&&(
          <div className="flex justify-center items-center gap-2 mt-8">
            <button className="px-3 py-2 rounded-lg border bg-white text-stone-500">‹</button>
            {[1,2,3,4].map(n=><button key={n} className={`px-3.5 py-2 rounded-lg text-sm ${n===1?'bg-[#58752c] text-white':'border bg-white'}`}>{n}</button>)}
            <span className="px-2 text-stone-400">…</span>
            <button className="px-3.5 py-2 rounded-lg border bg-white">15</button>
            <button className="px-3 py-2 rounded-lg border bg-white text-stone-500">›</button>
          </div>
        )}
      </div>

      <aside className="space-y-5">
        <div className="card p-5">
          <h3 className="font-semibold flex items-center gap-2 mb-4"><Filter className="w-5 text-olive"/> Filters</h3>
          <div className="space-y-3">
            <div><label className="text-xs text-stone-500 mb-1 block">Year</label>
              <select value={yearFilter} onChange={e=>setYearFilter(e.target.value)} className="input text-sm"><option>All Years</option>{years.map(y=><option key={y}>{y}</option>)}</select>
            </div>
            <div><label className="text-xs text-stone-500 mb-1 block">Category</label>
              <select value={categoryFilter} onChange={e=>setCategoryFilter(e.target.value)} className="input text-sm"><option>All Categories</option>{categories.map(c=><option key={c}>{c}</option>)}</select>
            </div>
            <select className="input text-sm"><option>All Members</option></select>
            <select className="input text-sm"><option>All Places</option></select>
          </div>
          <label className="flex items-center gap-2 mt-3 text-sm cursor-pointer">
            <input type="checkbox" checked={favoritesOnly} onChange={e=>setFavoritesOnly(e.target.checked)} className="w-4 h-4 accent-[#58752c]"/> Favorites only
          </label>
          <button className="btn w-full mt-3">Apply Filters</button>
          <button onClick={()=>{setYearFilter('All Years');setCategoryFilter('All Categories');setFavoritesOnly(false);}} className="text-sm text-stone-500 w-full mt-2 hover:text-olive">Reset</button>
        </div>

        <div className="card p-5">
          <h3 className="font-semibold mb-4">Memory Summary</h3>
          <div className="space-y-3">
            {[['Total Memories',245],['Photos',180],['Videos',32],['Audio',18],['Documents',15]].map(([l,v])=>
              <div className="flex justify-between text-sm" key={l}><span className="text-stone-600">{l}</span><b className="text-stone-800">{v}</b></div>
            )}
          </div>
        </div>

        <div className="card p-5">
          <div className="flex justify-between mb-4"><h3 className="font-semibold">Most Active</h3><button className="text-sm text-olive">View All</button></div>
          <div className="space-y-4">
            {[['Rohan (You)',56,100],['Mom',42,75],['Dad',38,68],['Dadi',25,45]].map(([n,v,p])=>
              <div key={n}>
                <div className="flex justify-between text-sm mb-1"><span className="text-stone-600">{n}</span><b className="text-stone-800">{v}</b></div>
                <div className="h-1.5 bg-stone-200 rounded-full overflow-hidden"><div className="h-full bg-olive rounded-full" style={{width:`${p}%`}}/></div>
              </div>
            )}
          </div>
        </div>
      </aside>
    </div>
  </>;
}