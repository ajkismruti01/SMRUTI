import {Utensils,Plus,Star,Clock3,Users,Play,Search} from 'lucide-react';
import {Link} from 'react-router-dom';
import {useState} from 'react';
import {useHeritage} from '@/context/HeritageContext';
import PageHeader from '@/components/PageHeader';
import RecipeCard from '@/components/RecipeCard';
import FilterBar from '@/components/FilterBar';
import SectionHeader from '@/components/SectionHeader';import EmptyState from '@/components/EmptyState';

export default function Recipes(){
  const {recipes,toggleFavorite}=useHeritage();
  const [filter,setFilter]=useState('All Recipes');
  const [query,setQuery]=useState('');
  const [favoritesOnly,setFavoritesOnly]=useState(false);
  const categories=['All Recipes',...new Set(recipes.map(r=>r.category))];
  const featured=recipes.find(r=>r.favorite)||recipes[0];
  const traditional=recipes.filter(r=>r.tags?.includes('traditional'));
  const festival=recipes.filter(r=>r.tags?.includes('festival'));
  const shown=recipes.filter(r=>(filter==='All Recipes'||r.category===filter)&&r.name.toLowerCase().includes(query.toLowerCase())&&(!favoritesOnly||r.favorite));

  return <>
    <PageHeader icon={Utensils} title="Family Recipes" subtitle="Cherished recipes passed down with love." action={
      <div className="flex gap-2"><button className="btn-outline">My Recipes</button><Link to="/add/recipe" className="btn"><Plus className="w-4"/> Add Recipe</Link></div>
    }/>

    <div className="relative max-w-xl mb-5">
      <Search className="absolute left-4 top-3 w-4 text-stone-500"/>
      <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search recipes by name, ingredient, or by family member..." className="w-full rounded-xl border bg-white py-2.5 pl-11 pr-4 text-sm"/>
    </div>

    <FilterBar items={categories} value={filter} onChange={setFilter}/>
    <div className="flex items-center gap-2 mt-3 mb-5">
      <label className="flex items-center gap-2 text-sm cursor-pointer"><input type="checkbox" checked={favoritesOnly} onChange={e=>setFavoritesOnly(e.target.checked)} className="w-4 h-4 accent-[#58752c]"/> Favorites only</label>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_280px] gap-6">
      <div>
        {featured&&filter==='All Recipes'&&!query&&(
          <>
            <SectionHeader title="Featured Family Recipe" subtitle="A recipe worth passing down." to={`/recipes/${featured.id}`} actionLabel="View Recipe"/>
            <div className="card overflow-hidden mb-6">
              <div className="grid md:grid-cols-2">
                <img src={featured.image} alt={featured.name} className="w-full h-64 object-cover"/>
                <div className="p-6 flex flex-col justify-center">
                  <span className="inline-flex items-center gap-1 self-start rounded-full bg-orange-100 text-orange-700 px-3 py-1 text-xs font-semibold"><Star className="w-3"/> Family Favorite</span>
                  <h2 className="font-display text-2xl mt-3">{featured.name}</h2>
                  <div className="flex flex-wrap gap-4 text-sm text-stone-500 mt-3">
                    <span className="flex items-center gap-1"><img src={featured.sharedByPhoto} className="w-5 h-5 rounded-full"/> By {featured.sharedBy}</span>
                    <span className="flex items-center gap-1"><Clock3 className="w-4"/> {featured.time} mins</span>
                    <span className="flex items-center gap-1"><Users className="w-4"/> {featured.servings}</span>
                    <span>{featured.difficulty}</span>
                  </div>
                  <p className="text-sm text-stone-600 mt-3 line-clamp-2">{featured.story}</p>
                  <button className="btn self-start mt-4"><Play className="w-4"/> Listen to {featured.sharedBy} (Voice Recipe)</button>
                </div>
              </div>
            </div>
          </>
        )}

        <SectionHeader title="Recently Added" subtitle={`${shown.length} recipes found`}/>
        {shown.length?<div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-5">
          {shown.map(x=><RecipeCard item={x} key={x.id} onFavorite={id=>toggleFavorite('recipe',id)}/>)}
        </div>:<EmptyState title="No recipes found" message="Try a different search or category." actionLabel="Add Recipe" actionTo="/add/recipe"/>}

        {filter==='All Recipes'&&!query&&traditional.length>0&&(
          <div className="mt-8">
            <SectionHeader title="Traditional Recipes" subtitle="Time-honored recipes from our heritage."/>
            <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-5">{traditional.map(x=><RecipeCard item={x} key={x.id} onFavorite={id=>toggleFavorite('recipe',id)}/>)}</div>
          </div>
        )}

        {filter==='All Recipes'&&!query&&festival.length>0&&(
          <div className="mt-8">
            <SectionHeader title="Festival Recipes" subtitle="Special dishes for special occasions."/>
            <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-5">{festival.map(x=><RecipeCard item={x} key={x.id} onFavorite={id=>toggleFavorite('recipe',id)}/>)}</div>
          </div>
        )}

        <div className="card p-5 mt-8 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-sm text-stone-600">💡 Tip: Record your family recipes in voice to preserve the original touch.</p>
          <button className="btn-outline whitespace-nowrap">Record a Recipe</button>
        </div>
      </div>

      <aside className="space-y-5">
        <div className="card p-5">
          <h3 className="font-semibold mb-4">Recipe Categories</h3>
          <div className="space-y-3">
            {categories.filter(c=>c!=='All Recipes').map(c=>{const count=recipes.filter(r=>r.category===c).length;return <div className="flex justify-between text-sm" key={c}><span className="text-stone-600">{c}</span><b className="text-stone-800">{count}</b></div>;})}
          </div>
          <button className="text-sm text-olive mt-3">View All Categories →</button>
        </div>
        <div className="card p-5 text-center">
          <div className="text-5xl mb-3">📖</div>
          <h3 className="font-display text-lg">Family Recipe Book</h3>
          <p className="text-sm text-stone-500 mt-1">All your family recipes in one beautiful collection.</p>
          <button className="btn-outline w-full mt-3">View Recipe Book</button>
        </div>
        <div className="card p-5">
          <h3 className="font-semibold mb-4">Top Contributors</h3>
          <div className="space-y-3">
            {[['Dadi',28,'🥇','https://i.pravatar.cc/100?img=47'],['Mom',22,'🥈','https://i.pravatar.cc/100?img=45'],['Baa',18,'🥉','https://i.pravatar.cc/100?img=49']].map(([n,v,m,p])=>
              <div className="flex items-center gap-3" key={n}><img src={p} className="w-9 h-9 rounded-full"/><div className="flex-1"><b className="text-sm">{n}</b><p className="text-xs text-stone-500">{v} recipes</p></div><span className="text-lg">{m}</span></div>
            )}
          </div>
          <button className="text-sm text-olive mt-3">View All Contributors →</button>
        </div>
      </aside>
    </div>
  </>;
}