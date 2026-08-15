import {
  Image as ImageIcon,
  Mic2,
  Utensils,
  Users,
  Clock3,
  ArrowRight,
  Heart,
  Plus,
  Eye,
  MapPin,
  Calendar,
  Star,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useHeritage } from '@/context/HeritageContext';
import SectionHeader from '@/components/SectionHeader';
import { Image } from '@/components/ui/image';

const activityIcons = { memory: ImageIcon, story: Mic2, recipe: Utensils, member: Users, family: Users, event: Calendar };
const activityColors = { memory: '#E89538', story: '#4C8C3C', recipe: '#8B5CF6', member: '#3B82F6', family: '#58752c', event: '#3B82F6' };

export default function Home() {
  const { memories, stories, recipes, activity, members } = useHeritage();

  const stats = [
    { count: memories.length, label: 'Memories', icon: ImageIcon, bg: '#FDEEDD', color: '#E89538' },
    { count: stories.length, label: 'Stories', icon: Mic2, bg: '#EAF4E9', color: '#4C8C3C' },
    { count: recipes.length, label: 'Recipes', icon: Utensils, bg: '#F1EDF9', color: '#8B5CF6' },
    { count: members.length, label: 'Family Members', icon: Users, bg: '#E8F3FD', color: '#3B82F6' },
  ];

  const quickActions = [
    { label: 'Add Memory', to: '/add/memory', icon: ImageIcon, bg: '#FDEEDD', color: '#E89538' },
    { label: 'Record Story', to: '/add/story', icon: Mic2, bg: '#EAF4E9', color: '#4C8C3C' },
    { label: 'Add Recipe', to: '/add/recipe', icon: Utensils, bg: '#F1EDF9', color: '#8B5CF6' },
    { label: 'Add Member', to: '/add/member', icon: Users, bg: '#E8F3FD', color: '#3B82F6' },
  ];

  const featuredMemory = memories.find((m) => m.favorite) || memories[0];
  const recentMemories = memories.slice(0, 6);
  const recentStories = stories.slice(0, 3);
  const recentRecipes = recipes.slice(0, 4);

  const heroImage =
    featuredMemory?.image ||
    'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=1200';
  const now = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <>
      <section
        className="hero"
        style={{
          backgroundImage: `linear-gradient(95deg,rgba(74,53,37,.92),rgba(74,53,37,.15)),url(${heroImage})`,
        }}
      >
        <p className="text-sm text-white/70 mb-2">{now}</p>
        <h1>
          Every Family
          <br />
          Has a Story.
        </h1>
        <p>Save it. Share it. Cherish it forever.</p>
        <Heart className="w-6 text-white/80 mt-3" />
      </section>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 my-6">
        {stats.map((s) => (
          <div className="card p-5 flex items-center gap-4" key={s.label}>
            <div
              className="w-12 h-12 rounded-xl grid place-items-center shrink-0"
              style={{ background: s.bg, color: s.color }}
            >
              <s.icon className="w-6 h-6" />
            </div>
            <div>
              <b className="text-2xl font-display">{s.count}</b>
              <p className="text-sm text-stone-500">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        {quickActions.map((a) => (
          <Link
            to={a.to}
            key={a.label}
            className="card p-4 flex items-center gap-3 hover:shadow-md transition-shadow group"
          >
            <div
              className="w-10 h-10 rounded-lg grid place-items-center"
              style={{ background: a.bg, color: a.color }}
            >
              <a.icon className="w-5 h-5" />
            </div>
            <span className="text-sm font-semibold text-stone-700 group-hover:text-olive transition-colors">
              {a.label}
            </span>
            <Plus className="w-4 text-stone-300 ml-auto group-hover:text-olive transition-colors" />
          </Link>
        ))}
      </div>

      {featuredMemory && (
        <>
          <SectionHeader
            title="Featured Memory"
            subtitle="A moment worth reliving."
            to={`/memories/${featuredMemory?.id || featuredMemory?._id}`}
            actionLabel="View Memory"
          />
          <Link
            to={`/memories/${featuredMemory?.id || featuredMemory?._id}`}
            className="card overflow-hidden mb-8 group block hover:shadow-md transition-shadow"
          >
            <div className="grid md:grid-cols-2">
              <div className="relative h-64 md:h-80">
                <Image src={featuredMemory?.image} className="w-full h-full object-cover" />
                <span className="date-badge">{featuredMemory?.date}</span>
              </div>
              <div className="p-6 md:p-8 flex flex-col justify-center">
                <span className="badge self-start mb-3">{featuredMemory?.category}</span>
                <h2 className="font-display text-2xl md:text-3xl font-semibold">
                  {featuredMemory?.title}
                </h2>
                {featuredMemory?.location && (
                  <p className="text-sm text-stone-500 mt-2 flex items-center gap-1">
                    <MapPin className="w-4" />
                    {featuredMemory?.location}
                  </p>
                )}
                <p className="text-stone-600 mt-4 leading-7 line-clamp-4">
                  {featuredMemory?.description}
                </p>
                {featuredMemory?.people && featuredMemory.people.length > 0 && (
                  <div className="flex items-center gap-3 mt-5">
                    <div className="flex -space-x-2">
                      {featuredMemory.people.slice(0, 4).map((p, i) => (
                        <img
                          key={p._id || p.id || i}
                          src={p.photo || 'https://i.pravatar.cc/300?img=12'}
                          className="w-8 h-8 rounded-full border-2 border-white object-cover"
                          title={p.name}
                          alt={p.name}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-stone-500">
                      {featuredMemory.people.length} people in this memory
                    </span>
                  </div>
                )}
                <span className="inline-flex items-center gap-1 mt-5 rounded-full bg-[#eef3e3] text-olive px-4 py-2 text-sm font-medium w-fit">
                  View Full Memory <ArrowRight className="w-4" />
                </span>
              </div>
            </div>
          </Link>
        </>
      )}

      <SectionHeader
        title="Recent Memories"
        subtitle="The latest moments added to your archive."
        to="/memories"
        actionLabel="View All"
      />
      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5 mb-8">
        {recentMemories.map((m) => (
          <Link
            to={`/memories/${m.id || m._id}`}
            key={m.id || m._id}
            className="card overflow-hidden group hover:shadow-md transition-shadow"
          >
            <div className="relative">
              <Image src={m.image} className="w-full h-40 object-cover" />
              <span className="date-badge">{m.date}</span>
            </div>
            <div className="p-4">
              <span className="badge mb-2">{m.category}</span>
              <h3 className="font-display text-lg font-semibold">{m.title}</h3>
              {m.location && (
                <p className="text-xs text-stone-500 mt-1 flex items-center gap-1">
                  <MapPin className="w-3" />
                  {m.location}
                </p>
              )}
              <p className="text-sm text-stone-600 mt-2 line-clamp-2">{m.description}</p>
              <div className="flex justify-between items-center mt-3">
                {m.people && m.people.length > 0 && (
                  <div className="flex -space-x-2">
                    {m.people.slice(0, 3).map((p, i) => (
                      <img
                        key={p._id || p.id || i}
                        src={p.photo || 'https://i.pravatar.cc/300?img=12'}
                        className="w-6 h-6 rounded-full border-2 border-white object-cover"
                        alt="person"
                      />
                    ))}
                  </div>
                )}
                <span className="text-xs text-stone-400 flex items-center gap-1 ml-auto">
                  <Eye className="w-3" />
                  {m.views || 0}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <SectionHeader
        title="Recent Stories"
        subtitle="Voices preserved across generations."
        to="/stories"
        actionLabel="View All"
      />
      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5 mb-8">
        {recentStories.map((s) => (
          <Link
            to={`/stories/${s.id || s._id}`}
            key={s.id || s._id}
            className="card overflow-hidden group hover:shadow-md transition-shadow"
          >
            <div className="relative">
              <Image src={s.image} className="w-full h-40 object-cover" />
              {s.audio && (
                <span className="absolute top-3 right-3 bg-white/90 rounded-full p-1.5">
                  <Mic2 className="w-4 text-olive" />
                </span>
              )}
              <span className="absolute bottom-3 left-3 bg-black/60 text-white text-xs px-2 py-1 rounded-md flex items-center gap-1">
                <Clock3 className="w-3" />
                {s.duration || '5 min'}
              </span>
            </div>
            <div className="p-4">
              <span className="badge mb-2">{s.category}</span>
              <h3 className="font-display text-lg font-semibold leading-snug">{s.title}</h3>
              <div className="flex items-center gap-2 mt-2">
                <img
                  src={s.authorPhoto || 'https://i.pravatar.cc/300?img=33'}
                  className="w-6 h-6 rounded-full object-cover"
                  alt={s.author}
                />
                <span className="text-xs text-stone-500">By {s.author}</span>
              </div>
              <p className="text-sm text-stone-600 mt-2 line-clamp-2">{s.preview || s.text}</p>
            </div>
          </Link>
        ))}
      </div>

      <SectionHeader
        title="Family Recipes"
        subtitle="Cherished recipes passed down with love."
        to="/recipes"
        actionLabel="View All"
      />
      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
        {recentRecipes.map((r) => (
          <Link
            to={`/recipes/${r.id || r._id}`}
            key={r.id || r._id}
            className="card overflow-hidden group hover:shadow-md transition-shadow"
          >
            <Image src={r.image} className="w-full h-36 object-cover" />
            <div className="p-4">
              <span className="badge mb-2">{r.category}</span>
              <h3 className="font-display text-lg font-semibold">{r.name}</h3>
              <div className="flex items-center gap-2 mt-2">
                <img
                  src={r.sharedByPhoto || 'https://i.pravatar.cc/300?img=47'}
                  className="w-5 h-5 rounded-full object-cover"
                  alt={r.sharedBy}
                />
                <span className="text-xs text-stone-500">By {r.sharedBy}</span>
              </div>
              <div className="flex gap-2 mt-3">
                <span className="text-xs bg-stone-100 px-2 py-1 rounded-md flex items-center gap-1">
                  <Clock3 className="w-3" />
                  {r.time || 30} min
                </span>
                <span className="text-xs bg-stone-100 px-2 py-1 rounded-md">{r.difficulty}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {activity && activity.length > 0 && (
        <>
          <SectionHeader
            title="Family Activity"
            subtitle="What's happening in your family circle."
          />
          <div className="card p-5 mb-8">
            <div className="space-y-4">
              {activity.slice(0, 6).map((a, idx) => {
                const Icon = activityIcons[a.type] || ImageIcon;
                const color = activityColors[a.type] || '#888';
                return (
                  <div
                    key={a.id || a._id || idx}
                    className="flex items-center gap-3 pb-4 border-b border-[#f0eadf] last:border-0 last:pb-0"
                  >
                    <div
                      className="w-10 h-10 rounded-full grid place-items-center shrink-0"
                      style={{ background: `${color}15`, color }}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <img
                      src={a.memberPhoto || 'https://i.pravatar.cc/300?img=33'}
                      className="w-8 h-8 rounded-full object-cover"
                      alt={a.member}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm">
                        <b>{a.member}</b> {a.text}
                      </p>
                      <p className="text-xs text-stone-400 mt-0.5">{a.time || 'Recent'}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      <div className="text-center mt-10 py-6 border-t border-[#e8dfd1]">
        <div className="flex items-center justify-center gap-2 text-stone-500">
          <span className="text-lg">યાદો એ જિંદગીની સાચી કમાણી છે.</span>
          <Heart className="w-4 text-olive" />
        </div>
      </div>
    </>
  );
}