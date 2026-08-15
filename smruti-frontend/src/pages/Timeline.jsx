import {Clock3,MapPin,Users,Filter} from 'lucide-react';
import {Link} from 'react-router-dom';
import {useState} from 'react';
import {timeline} from '@/data/mockData';
import PageHeader from '@/components/PageHeader';
import FilterBar from '@/components/FilterBar';
import SectionHeader from '@/components/SectionHeader';
import {Image} from '@/components/ui/image';

export default function Timeline(){
  const [view,setView]=useState('Year');
  const [categoryFilter,setCategoryFilter]=useState('All Events');
  const [jumpYear,setJumpYear]=useState('');
  const categories=['All Events',...new Set(timeline.map(t=>t.category))];
  const filtered=timeline.filter(t=>(categoryFilter==='All Events'||t.category===categoryFilter)&&(!jumpYear||t.year===jumpYear));
  const decades={};
  filtered.forEach(t=>{const d=Math.floor(Number(t.year)/10)*10+'s';if(!decades[d])decades[d]=[];decades[d].push(t);});
  const years=[...new Set(timeline.map(t=>t.year))].sort();

  return <>
    <PageHeader icon={Clock3} title="Family Timeline" subtitle="Walk through our family's journey over the years." action={
      <select value={jumpYear} onChange={e=>setJumpYear(e.target.value)} className="input text-sm w-auto"><option value="">Jump to Year</option>{years.map(y=><option key={y}>{y}</option>)}</select>
    }/>

    <div className="card p-6 mb-6 bg-[#f7f8ef]">
      <h2 className="font-display text-2xl">Our Family History</h2>
      <p className="text-stone-600 mt-2 max-w-3xl">From Dhirubhai's birth in 1945 to today, the Mehta family has built a legacy of love, resilience, and togetherness. Explore the milestones that shaped our story.</p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
        {[['81','Years of History'],['12','Major Milestones'],['4','Generations'],['3','Family Homes']].map(([v,l])=><div key={l}><b className="font-display text-2xl text-olive">{v}</b><p className="text-sm text-stone-500">{l}</p></div>)}
      </div>
    </div>

    <FilterBar items={['Year','Decade','Generation']} value={view} onChange={setView}/>
    <div className="flex items-center gap-2 mt-3 mb-6 flex-wrap">
      <Filter className="w-4 text-stone-400"/>
      {categories.map(c=><button key={c} onClick={()=>setCategoryFilter(c)} className={`filter-pill ${categoryFilter===c?'active':''}`}>{c}</button>)}
    </div>

    {view==='Decade'?(
      <div className="space-y-8">
        {Object.entries(decades).reverse().map(([decade,events])=>(
          <div key={decade}>
            <SectionHeader title={decade} subtitle={`${events.length} events`}/>
            <div className="relative pl-8 border-l-2 border-[#e5dcc8] space-y-5">{events.map(t=><TimelineEvent key={t.id} t={t}/>)}</div>
          </div>
        ))}
      </div>
    ):(
      <div className="relative pl-8 border-l-2 border-[#e5dcc8] space-y-5">{filtered.map(t=><TimelineEvent key={t.id} t={t}/>)}</div>
    )}
  </>;
}

function TimelineEvent({t}){
  return <div className="relative">
    <div className="absolute -left-[37px] w-4 h-4 rounded-full bg-olive border-4 border-[#fdfbf7]"/>
    <div className="card p-4 flex flex-col sm:flex-row gap-4 hover:shadow-md transition-shadow">
      <Image src={t.image} className="w-full sm:w-32 h-32 rounded-lg shrink-0"/>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1"><span className="badge">{t.category}</span><span className="text-xs text-stone-400">{t.date||t.year}</span></div>
        <h3 className="font-display text-lg font-semibold">{t.title}</h3>
        <p className="text-sm text-stone-600 mt-1">{t.description}</p>
        <div className="flex flex-wrap gap-3 mt-2 text-xs text-stone-500">
          <span className="flex items-center gap-1"><MapPin className="w-3"/>{t.location}</span>
          {t.people&&<span className="flex items-center gap-1"><Users className="w-3"/>{t.people.join(', ')}</span>}
        </div>
      </div>
    </div>
  </div>;
}