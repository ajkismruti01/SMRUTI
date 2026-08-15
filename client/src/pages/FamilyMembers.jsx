import {Users,Plus,Search} from 'lucide-react';
import {Link} from 'react-router-dom';
import {useState} from 'react';
import {useHeritage} from '@/context/HeritageContext';
import PageHeader from '@/components/PageHeader';
import SectionHeader from '@/components/SectionHeader';
import FamilyMemberCard from '@/components/FamilyMemberCard';
import FilterBar from '@/components/FilterBar';import EmptyState from '@/components/EmptyState';

export default function FamilyMembers(){
  const {members}=useHeritage();
  const [query,setQuery]=useState('');
  const [filter,setFilter]=useState('All');
  const generations=[{label:'Grandparents',gen:0},{label:'Parents & Adults',gen:1},{label:'Young Members',gen:2}];
  const shown=members.filter(m=>m.name.toLowerCase().includes(query.toLowerCase()));

  return <>
    <PageHeader icon={Users} title="Our Family" subtitle="The people who make every memory meaningful." action={<Link to="/add/member" className="btn"><Plus className="w-4"/> Add Family Member</Link>}/>

    <div className="card p-6 mb-6 bg-[#f7f8ef]">
      <h2 className="font-display text-2xl">The Mehta Family</h2>
      <p className="text-stone-600 mt-2 max-w-3xl">Ten members across three generations, each contributing their own stories, recipes, and memories to our shared heritage.</p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
        {[['10','Family Members'],['3','Generations'],['245','Shared Memories'],['52','Family Recipes']].map(([v,l])=><div key={l}><b className="font-display text-2xl text-olive">{v}</b><p className="text-sm text-stone-500">{l}</p></div>)}
      </div>
    </div>

    <div className="relative max-w-xl mb-5">
      <Search className="absolute left-4 top-3 w-4 text-stone-500"/>
      <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search family members by name..." className="w-full rounded-xl border bg-white py-2.5 pl-11 pr-4 text-sm"/>
    </div>

    <FilterBar items={['All','Grandparents','Parents & Adults','Young Members']} value={filter} onChange={setFilter}/>

    {generations.map(g=>{
      const genMembers=shown.filter(m=>m.generation===g.gen);
      if(genMembers.length===0)return null;
      if(filter!=='All'&&filter!==g.label)return null;
      return (
        <div key={g.gen} className="mt-6">
          <SectionHeader title={g.label} subtitle={`${genMembers.length} members`}/>
          <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-5">{genMembers.map(x=><FamilyMemberCard item={x} key={x.id}/>)}</div>
        </div>
      );
    })}
    {shown.length===0&&<EmptyState title="No family members found" message="Try a different search." actionLabel="Add Member" actionTo="/add/member"/>}
  </>;
}