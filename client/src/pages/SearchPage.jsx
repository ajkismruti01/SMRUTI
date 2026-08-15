import { Search, X } from 'lucide-react';
import { useSearchParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { api } from '@/api/client';
import { useAuth } from '@/lib/AuthContext';
import { useHeritage } from '@/context/HeritageContext';
import PageHeader from '@/components/PageHeader';
import SectionHeader from '@/components/SectionHeader';
import MemoryCard from '@/components/MemoryCard';
import StoryCard from '@/components/StoryCard';
import RecipeCard from '@/components/RecipeCard';
import FamilyMemberCard from '@/components/FamilyMemberCard';
import { Image } from '@/components/ui/image';

const recentSearches = ['Diwali', 'Dadi', 'Thepla', 'Wedding'];

export default function SearchPage() {
  const [params] = useSearchParams();
  const [q, setQ] = useState(params.get('q') || '');
  const { activeFamily } = useAuth();
  const { memories: ctxMemories, stories: ctxStories, recipes: ctxRecipes, members: ctxMembers, timeline: ctxTimeline } =
    useHeritage();

  const [apiResults, setApiResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const familyId = activeFamily?._id || activeFamily?.id;

  useEffect(() => {
    const queryParam = params.get('q');
    if (queryParam) setQ(queryParam);
  }, [params]);

  useEffect(() => {
    if (!q || !q.trim() || !familyId) {
      setApiResults(null);
      return;
    }

    const timer = setTimeout(() => {
      setLoading(true);
      api.search
        .query(familyId, q.trim())
        .then((res) => {
          setApiResults(res);
          setLoading(false);
        })
        .catch(() => {
          setApiResults(null);
          setLoading(false);
        });
    }, 250);

    return () => clearTimeout(timer);
  }, [q, familyId]);

  // Client-side fallback / local filter if API result is pending
  const match = (x) => JSON.stringify(x).toLowerCase().includes(q.toLowerCase());
  const memResults = apiResults ? apiResults.memories : q ? ctxMemories.filter(match) : [];
  const storyResults = apiResults ? apiResults.stories : q ? ctxStories.filter(match) : [];
  const recipeResults = apiResults ? apiResults.recipes : q ? ctxRecipes.filter(match) : [];
  const memberResults = apiResults ? apiResults.members : q ? ctxMembers.filter(match) : [];
  const timelineResults = apiResults ? apiResults.timeline : q ? ctxTimeline.filter(match) : [];

  const total =
    memResults.length + storyResults.length + recipeResults.length + memberResults.length + timelineResults.length;

  return (
    <>
      <PageHeader
        icon={Search}
        title="Search the Family Archive"
        subtitle="Find a memory, person, story, recipe, or moment in time."
      />
      <div className="relative max-w-2xl mb-5">
        <Search className="absolute left-4 top-3.5 w-5 text-stone-500" />
        <input
          autoFocus
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="input text-lg pl-12"
          placeholder="Try 'Diwali', 'Dadi', or 'Thepla'..."
        />
        {q && (
          <button onClick={() => setQ('')} className="absolute right-4 top-3.5">
            <X className="w-5 text-stone-400" />
          </button>
        )}
      </div>

      {!q ? (
        <>
          <SectionHeader title="Recent Searches" />
          <div className="flex flex-wrap gap-2 mb-6">
            {recentSearches.map((s) => (
              <button key={s} onClick={() => setQ(s)} className="filter-pill">
                {s}
              </button>
            ))}
          </div>
          <SectionHeader title="Search Suggestions" />
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {[
              ['Search by person', 'Find all memories, stories and recipes by a family member'],
              ['Search by year', 'Explore memories from a specific year'],
              ['Search by place', 'Find memories from a particular location'],
            ].map(([title, desc]) => (
              <div className="card p-4" key={title}>
                <b className="text-sm">{title}</b>
                <p className="text-xs text-stone-500 mt-1">{desc}</p>
              </div>
            ))}
          </div>
        </>
      ) : total === 0 ? (
        <div className="card p-10 text-center">
          <Search className="w-10 h-10 text-stone-300 mx-auto mb-3" />
          <p className="text-stone-500">No results found for "{q}". Try a different search term.</p>
        </div>
      ) : (
        <>
          <p className="text-sm text-stone-500 mb-6">
            {total} results for "{q}"
          </p>
          <div className="space-y-8">
            {memResults.length > 0 && (
              <ResultSection title="Memories" count={memResults.length}>
                {memResults.map((x) => (
                  <MemoryCard item={x} key={x.id || x._id} />
                ))}
              </ResultSection>
            )}
            {storyResults.length > 0 && (
              <ResultSection title="Stories" count={storyResults.length}>
                {storyResults.map((x) => (
                  <StoryCard item={x} key={x.id || x._id} />
                ))}
              </ResultSection>
            )}
            {recipeResults.length > 0 && (
              <ResultSection title="Recipes" count={recipeResults.length}>
                {recipeResults.map((x) => (
                  <RecipeCard item={x} key={x.id || x._id} />
                ))}
              </ResultSection>
            )}
            {memberResults.length > 0 && (
              <ResultSection title="People" count={memberResults.length}>
                {memberResults.map((x) => (
                  <FamilyMemberCard item={x} key={x.id || x._id} />
                ))}
              </ResultSection>
            )}
            {timelineResults.length > 0 && (
              <ResultSection title="Timeline Events" count={timelineResults.length}>
                {timelineResults.map((t) => (
                  <Link
                    to="/timeline"
                    key={t.id || t._id}
                    className="card p-4 flex gap-3 hover:shadow-md transition-shadow"
                  >
                    {t.image ? (
                      <Image src={t.image} className="w-16 h-16 rounded-lg shrink-0 object-cover" />
                    ) : (
                      <div className="w-16 h-16 rounded-lg shrink-0 bg-stone-100 grid place-items-center text-stone-400 font-bold">
                        {t.year}
                      </div>
                    )}
                    <div>
                      <span className="badge">{t.year}</span>
                      <h3 className="font-display text-lg mt-1">{t.title}</h3>
                      <p className="text-sm text-stone-500">{t.description}</p>
                    </div>
                  </Link>
                ))}
              </ResultSection>
            )}
          </div>
        </>
      )}
    </>
  );
}

function ResultSection({ title, count, children }) {
  return (
    <section>
      <div className="flex items-center gap-2 mb-3">
        <h2 className="font-display text-xl font-semibold">{title}</h2>
        <span className="badge">{count}</span>
      </div>
      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">{children}</div>
    </section>
  );
}