import { CalendarHeart, MapPin, Users, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { api } from '@/api/client';
import { useAuth } from '@/lib/AuthContext';
import { useHeritage } from '@/context/HeritageContext';
import PageHeader from '@/components/PageHeader';
import { Image } from '@/components/ui/image';
import { onThisDay as fallbackOnThisDay } from '@/data/mockData';

export default function OnThisDay() {
  const { activeFamily } = useAuth();
  const { memories } = useHeritage();
  const [moments, setMoments] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const familyId = activeFamily?._id || activeFamily?.id;
    if (familyId) {
      setLoading(true);
      api.onThisDay
        .get(familyId)
        .then((res) => {
          if (res && res.historicalMoments && res.historicalMoments.length > 0) {
            // Flatten or adapt grouped moments
            const flat = [];
            res.historicalMoments.forEach((group) => {
              group.items.forEach((item) => {
                flat.push({
                  ...item,
                  yearsAgo: group.yearsAgo || 1,
                });
              });
            });
            setMoments(flat);
          } else if (memories && memories.length > 0) {
            setMoments(
              memories.slice(0, 3).map((m, idx) => ({
                id: m.id || m._id,
                title: m.title,
                date: m.date,
                yearsAgo: idx === 0 ? 39 : idx === 1 ? 26 : 9,
                location: m.location,
                description: m.description,
                image: m.image,
                type: m.type || 'Photos',
                people: m.people?.map((p) => p.name || p),
              }))
            );
          } else {
            setMoments(fallbackOnThisDay);
          }
          setLoading(false);
        })
        .catch(() => {
          setMoments(fallbackOnThisDay);
          setLoading(false);
        });
    } else {
      setMoments(fallbackOnThisDay);
    }
  }, [activeFamily, memories]);

  const displayList = moments.length > 0 ? moments : fallbackOnThisDay;

  return (
    <>
      <PageHeader
        icon={CalendarHeart}
        title="On This Day"
        subtitle="A doorway back in time — moments your family still carries."
      />
      <div className="rounded-2xl bg-gradient-to-r from-[#4a3525] to-[#6b4d35] p-8 text-white mb-8">
        <p className="text-sm text-white/70">
          {new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
          })}
        </p>
        <h2 className="font-display text-3xl mt-2">Today in Family History</h2>
        <p className="text-white/80 mt-2 max-w-xl">
          Revisit the laughter, voices, and flavors shared on this date across the years. Each memory is a thread
          connecting us to those who came before.
        </p>
      </div>
      <div className="space-y-6">
        {displayList.map((item) => (
          <div key={item.id} className="card overflow-hidden group hover:shadow-md transition-shadow">
            <div className="grid md:grid-cols-2">
              <div className="relative h-56 md:h-64">
                <Image src={item.image} className="w-full h-full object-cover" />
                <span className="absolute top-4 left-4 bg-[#e89538] text-white text-xs px-3 py-1.5 rounded-md font-semibold">
                  {item.yearsAgo ? `${item.yearsAgo} years ago today` : 'Historical moment'}
                </span>
              </div>
              <div className="p-6 md:p-8 flex flex-col justify-center">
                <span className="badge self-start mb-3">{item.type || 'Memory'}</span>
                <h2 className="font-display text-2xl font-semibold">{item.title}</h2>
                <p className="text-sm text-stone-500 mt-2 flex items-center gap-1">
                  <CalendarHeart className="w-4" />
                  {item.date}
                </p>
                <p className="text-stone-600 mt-4 leading-7">{item.description}</p>
                <div className="flex flex-wrap gap-3 mt-4 text-sm text-stone-500">
                  {item.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3" />
                      {item.location}
                    </span>
                  )}
                  {item.people && item.people.length > 0 && (
                    <span className="flex items-center gap-1">
                      <Users className="w-3" />
                      {Array.isArray(item.people) ? item.people.join(', ') : String(item.people)}
                    </span>
                  )}
                </div>
                <Link
                  to={item.id ? `/memories/${item.id}` : '/memories'}
                  className="inline-flex items-center gap-1 mt-5 rounded-full bg-[#eef3e3] text-olive px-4 py-2 text-sm font-medium w-fit"
                >
                  View Full Memory <ArrowRight className="w-4" />
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}