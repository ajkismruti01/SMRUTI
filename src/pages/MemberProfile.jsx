import { useParams } from 'react-router-dom';
import { useState } from 'react';
import { useHeritage } from '@/context/HeritageContext';
import FilterBar from '@/components/FilterBar';
import SectionHeader from '@/components/SectionHeader';
import MemoryCard from '@/components/MemoryCard';
import StoryCard from '@/components/StoryCard';
import RecipeCard from '@/components/RecipeCard';

export default function MemberProfile() {
  const { id } = useParams();
  const { members, memories, stories, recipes } = useHeritage();
  const [tab, setTab] = useState('Memories');

  const m = members.find((x) => String(x.id || x._id) === String(id));
  if (!m) return <p className="p-8 text-center text-stone-500">Member not found.</p>;

  const memberMemories = memories.filter((mem) =>
    mem.people?.some((p) => String(p._id || p.id || p) === String(m.id || m._id))
  );
  const memberStories = stories.filter(
    (s) => s.author === m.name || String(s.authorMemberId) === String(m.id || m._id)
  );
  const memberRecipes = recipes.filter(
    (r) => r.sharedBy === m.name || String(r.sharedByMemberId) === String(m.id || m._id)
  );

  return (
    <>
      <div className="card overflow-hidden mb-6">
        <div className="h-32 bg-gradient-to-r from-[#4a3525] to-[#6b4d35]" />
        <div className="p-6 flex flex-col sm:flex-row gap-5 -mt-16">
          <img
            src={m.photo}
            className="w-28 h-28 rounded-2xl object-cover border-4 border-white shadow-lg shrink-0"
            alt={m.name}
          />
          <div className="flex-1 mt-4">
            <div className="flex flex-wrap justify-between gap-3">
              <div>
                <span className="badge">{m.relationship}</span>
                <h1 className="font-display text-3xl mt-2">{m.name}</h1>
                <p className="text-sm text-stone-500 mt-1">
                  Born {m.birthYear} · {m.birthPlace}
                </p>
              </div>
            </div>
            {m.bio && <p className="text-stone-600 mt-3 max-w-2xl">{m.bio}</p>}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          ['Memories', m.memories || memberMemories.length, '#FDEEDD'],
          ['Stories', m.stories || memberStories.length, '#EAF4E9'],
          ['Recipes', m.recipes || memberRecipes.length, '#F1EDF9'],
          ['Timeline', m.timelineEvents || 0, '#E8F3FD'],
        ].map(([label, count, bg]) => (
          <div className="card p-4" key={label}>
            <div
              className="w-10 h-10 rounded-lg grid place-items-center mb-2"
              style={{ background: bg }}
            >
              <span className="font-display text-lg font-bold">{count}</span>
            </div>
            <p className="text-sm text-stone-500">{label}</p>
          </div>
        ))}
      </div>

      <div className="card p-5 mb-6">
        <SectionHeader title="About" subtitle={`More about ${m.name}`} />
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            ['Occupation', m.occupation || 'Family Contributor'],
            ['Birthplace', m.birthPlace || 'India'],
            ['Joined SMRUTI', m.joinedDate || 'Jan 2024'],
            ['Family Role', m.relationship],
          ].map(([l, v]) => (
            <div key={l} className="bg-[#f7f8ef] rounded-lg p-3">
              <span className="text-xs text-stone-500 uppercase">{l}</span>
              <p className="font-medium mt-1">{v}</p>
            </div>
          ))}
        </div>
      </div>

      <FilterBar items={['Memories', 'Stories', 'Recipes', 'Timeline']} value={tab} onChange={setTab} />
      <div className="grid md:grid-cols-3 gap-5 mt-5">
        {tab === 'Memories' &&
          (memberMemories.length > 0 ? memberMemories : memories.slice(0, 3)).map((x) => (
            <MemoryCard item={x} key={x.id || x._id} />
          ))}
        {tab === 'Stories' &&
          (memberStories.length > 0 ? memberStories : stories.slice(0, 3)).map((x) => (
            <StoryCard item={x} key={x.id || x._id} />
          ))}
        {tab === 'Recipes' &&
          (memberRecipes.length > 0 ? memberRecipes : recipes.slice(0, 3)).map((x) => (
            <RecipeCard item={x} key={x.id || x._id} />
          ))}
        {tab === 'Timeline' && (
          <p className="card p-6 md:col-span-3 text-stone-500">
            Family milestones featuring {m.name} appear here.
          </p>
        )}
      </div>
    </>
  );
}