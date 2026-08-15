import {BookOpen,Plus,Search} from 'lucide-react';
import {Link} from 'react-router-dom';
import {useState} from 'react';
import {useHeritage} from '@/context/HeritageContext';
import PageHeader from '@/components/PageHeader';
import StoryCard from '@/components/StoryCard';
import FilterBar from '@/components/FilterBar';
import SectionHeader from '@/components/SectionHeader';import EmptyState from '@/components/EmptyState';
import {Image} from '@/components/ui/image';

export default function Stories(){
  const {stories,toggleFavorite}=useHeritage();
  const [filter,setFilter]=useState('All Stories');
  const [sort,setSort]=useState('Newest');
  const [query,setQuery]=useState('');
  const categories=['All Stories',...new Set(stories.map(s=>s.category))];
  const featured=stories.find(s=>s.favorite)||stories[0];
  const mostLoved=stories.filter(s=>s.favorite).slice(0,3);
  let shown=stories.filter(s=>(filter==='All Stories'||s.category===filter)&&s.title.toLowerCase().includes(query.toLowerCase()));
  if(sort==='Most Viewed')shown=[...shown].sort((a,b)=>b.views-a.views);

  return <>
    <PageHeader icon={BookOpen} title="Family Stories" subtitle="Voices, wisdom and tales passed through generations." action={<Link className="btn" to="/add/story"><Plus className="w-4"/> Add Story</Link>}/>

    <div className="relative max-w-xl mb-5">
      <Search className="absolute left-4 top-3 w-4 text-stone-500"/>
      <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search stories by title, author, or theme..." className="w-full rounded-xl border bg-white py-2.5 pl-11 pr-4 text-sm"/>
    </div>

    <FilterBar items={categories} value={filter} onChange={setFilter}/>
    <div className="flex items-center gap-2 mt-3 mb-5">
      <span className="text-sm text-stone-500">Sort by:</span>
      {['Newest','Oldest','Most Viewed'].map(s=><button key={s} onClick={()=>setSort(s)} className={`text-sm px-3 py-1.5 rounded-lg ${sort===s?'bg-[#e8ecd9] text-olive font-semibold':'text-stone-500 hover:text-stone-700'}`}>{s}</button>)}
    </div>

    {filter==='All Stories'&&!query&&(
      <>
        <SectionHeader title="Featured Story" subtitle="A story worth listening to." to={`/stories/${featured?.id}`} actionLabel="Read Story"/>
        <Link to={`/stories/${featured?.id}`} className="card overflow-hidden mb-8 group block hover:shadow-md transition-shadow">
          <div className="grid md:grid-cols-2">
            <div className="relative h-56 md:h-64"><Image src={featured?.image} className="w-full h-full"/>{featured?.audio&&<span className="absolute top-3 right-3 bg-white/90 rounded-full p-1.5"><BookOpen className="w-4 text-olive"/></span>}</div>
            <div className="p-6 md:p-8 flex flex-col justify-center">
              <span className="badge self-start mb-3">{featured?.category}</span>
              <h2 className="font-display text-2xl font-semibold">{featured?.title}</h2>
              <div className="flex items-center gap-2 mt-2"><img src={featured?.authorPhoto} className="w-8 h-8 rounded-full"/><span className="text-sm text-stone-500">By {featured?.author} · {featured?.date}</span></div>
              <p className="text-stone-600 mt-4 leading-7 line-clamp-3">{featured?.preview}</p>
              <div className="flex gap-4 mt-4 text-sm text-stone-500"><span>⏱ {featured?.duration}</span><span>👁 {featured?.views} views</span></div>
            </div>
          </div>
        </Link>
      </>
    )}

    <SectionHeader title="All Stories" subtitle={`${shown.length} stories found`}/>
    {shown.length?<div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
      {shown.map(x=><StoryCard item={x} key={x.id} onFavorite={id=>toggleFavorite('story',id)}/>)}
    </div>:<EmptyState title="No stories found" message="Try a different search or category." actionLabel="Add Story" actionTo="/add/story"/>}

    {filter==='All Stories'&&!query&&mostLoved.length>0&&(
      <div className="mt-8">
        <SectionHeader title="Most Loved Stories" subtitle="Favorites cherished by the family."/>
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {mostLoved.map(x=><StoryCard item={x} key={x.id} onFavorite={id=>toggleFavorite('story',id)}/>)}
        </div>
      </div>
    )}
  </>;
}