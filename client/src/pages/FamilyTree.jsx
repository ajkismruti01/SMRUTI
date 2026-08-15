import { Users, Plus, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useHeritage } from '@/context/HeritageContext';
import PageHeader from '@/components/PageHeader';
import FamilyTreeCanvas from '@/components/FamilyTreeCanvas';
import SectionHeader from '@/components/SectionHeader';
import { Image } from '@/components/ui/image';

export default function FamilyTree() {
  const { members, memories, stories, recipes } = useHeritage();
  const [selected, setSelected] = useState(null);
  const [tab, setTab] = useState('About');

  useEffect(() => {
    if (members && members.length > 0 && !selected) {
      // Pick first generation or third member if available
      setSelected(members[2] || members[0]);
    }
  }, [members, selected]);

  const activeSelected = selected || members[0] || {
    name: 'Family Member',
    relationship: 'Member',
    birthYear: 2000,
    birthPlace: 'India',
    photo: 'https://i.pravatar.cc/300?img=12',
    bio: 'Family heritage member.',
    occupation: '',
    joinedDate: 'Jan 2024',
    memories: 0,
    stories: 0,
    recipes: 0,
  };

  const memberMemories = memories.filter((m) =>
    m.people?.some((p) => (p._id || p.id || p) === (activeSelected.id || activeSelected._id))
  );

  return (
    <>
      <PageHeader
        icon={Users}
        title="Family Tree"
        subtitle="Our roots, our strength."
        action={
          <Link to="/add/member" className="btn">
            <Plus className="w-4" /> Add Member
          </Link>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_300px] gap-6">
        <div>
          <div className="card p-0 overflow-hidden mb-5">
            <FamilyTreeCanvas onSelect={setSelected} />
          </div>

          <div className="card p-6">
            <div className="flex flex-col sm:flex-row gap-5">
              <img
                src={activeSelected.photo}
                className="w-28 h-28 rounded-xl object-cover border-2 border-[#58752c] shrink-0 mx-auto sm:mx-0"
                alt={activeSelected.name}
              />
              <div className="flex-1 text-center sm:text-left">
                <div className="flex flex-wrap justify-between gap-3">
                  <div>
                    <span className="badge">{activeSelected.relationship}</span>
                    <h2 className="font-display text-2xl mt-2">{activeSelected.name}</h2>
                    <p className="text-sm text-stone-500 mt-1">
                      Born {activeSelected.birthYear} · {activeSelected.birthPlace}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Link to={`/members/${activeSelected.id || activeSelected._id}`} className="btn">
                      View Profile
                    </Link>
                  </div>
                </div>
                {activeSelected.bio && (
                  <p className="text-stone-600 italic mt-3">“{activeSelected.bio}”</p>
                )}
              </div>
            </div>

            <div className="flex gap-1 mt-5 border-b pb-2 overflow-x-auto">
              {['About', 'Memories', 'Stories', 'Photos', 'Recipes', 'Documents'].map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`px-3 py-1.5 rounded-lg text-sm whitespace-nowrap ${
                    tab === t
                      ? 'bg-[#e8ecd9] text-olive font-semibold'
                      : 'text-stone-500 hover:text-stone-700'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            <div className="mt-4">
              {tab === 'About' && (
                <div className="grid sm:grid-cols-2 gap-4">
                  {[
                    ['Occupation', activeSelected.occupation || 'Family Contributor'],
                    ['Birthplace', activeSelected.birthPlace || 'India'],
                    ['Joined SMRUTI', activeSelected.joinedDate || 'Jan 2024'],
                    ['Memories', `${activeSelected.memories || memberMemories.length} memories shared`],
                    ['Stories', `${activeSelected.stories || 0} stories recorded`],
                    ['Recipes', `${activeSelected.recipes || 0} recipes contributed`],
                  ].map(([l, v]) => (
                    <div key={l} className="bg-[#f7f8ef] rounded-lg p-3">
                      <span className="text-xs text-stone-500 uppercase tracking-wide">{l}</span>
                      <p className="font-medium mt-1">{v}</p>
                    </div>
                  ))}
                </div>
              )}
              {tab === 'Memories' && (
                <div className="grid sm:grid-cols-3 gap-4">
                  {(memberMemories.length > 0 ? memberMemories : memories.slice(0, 3)).map((m) => (
                    <Link
                      to={`/memories/${m.id || m._id}`}
                      key={m.id || m._id}
                      className="rounded-xl overflow-hidden border border-[#ebe4d9] hover:shadow-md transition-shadow"
                    >
                      <Image src={m.image} className="w-full h-24" />
                      <div className="p-2">
                        <p className="text-sm font-medium">{m.title}</p>
                        <p className="text-xs text-stone-400">{m.date}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
              {tab !== 'About' && tab !== 'Memories' && (
                <p className="text-stone-500 text-sm">
                  No {tab.toLowerCase()} yet for {activeSelected.name}.
                </p>
              )}
            </div>
          </div>

          <div className="text-center mt-6 text-sm text-stone-500 flex items-center justify-center gap-2">
            <Lock className="w-4" /> This is your private family space. Your memories are safe with us.
          </div>
        </div>

        <aside className="space-y-5">
          <div className="card p-5">
            <h3 className="font-semibold mb-4">Family at a Glance</h3>
            <div className="space-y-3">
              {[
                ['Total Members', members.length],
                ['Generations', 3],
                ['Memories Shared', memories.length],
                ['Stories Recorded', stories.length],
                ['Recipes Preserved', recipes.length],
                ['Years of History', 81],
              ].map(([l, v]) => (
                <div className="flex justify-between text-sm" key={l}>
                  <span className="text-stone-600">{l}</span>
                  <b className="text-stone-800">{v}</b>
                </div>
              ))}
            </div>
          </div>

          <div className="card p-5">
            <h3 className="font-semibold mb-4">Upcoming Birthdays</h3>
            <div className="space-y-3">
              {members.slice(0, 3).map((m, idx) => (
                <div className="flex items-center gap-3" key={m.id || m._id || idx}>
                  <img src={m.photo} className="w-9 h-9 rounded-full object-cover" alt={m.name} />
                  <div className="flex-1">
                    <b className="text-sm">{m.name}</b>
                    <p className="text-xs text-stone-500">Born {m.birthYear}</p>
                  </div>
                  <button className="text-xs text-olive">Remind</button>
                </div>
              ))}
            </div>
          </div>

          <div className="card p-5">
            <h3 className="font-semibold mb-4">Shortcuts</h3>
            <div className="space-y-1">
              {[
                ['Add New Member', '/add/member'],
                ['Record Family Story', '/add/story'],
                ['Upload Old Photo', '/add/memory'],
                ['Create Family Event', '/timeline'],
                ['Share Family Tree', '/family-tree'],
              ].map(([l, to]) => (
                <Link
                  to={to}
                  key={l}
                  className="flex justify-between items-center py-2.5 text-sm hover:text-olive transition-colors"
                >
                  {l} <span className="text-stone-400">→</span>
                </Link>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}