import {
  User,
  Mail,
  Users,
  LogOut,
  KeyRound,
  Edit3,
  Calendar,
  MapPin,
  Briefcase,
} from 'lucide-react';
import { api } from '@/api/client';
import { useAuth } from '@/lib/AuthContext';
import { useHeritage } from '@/context/HeritageContext';
import { Link } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';
import PageHeader from '@/components/PageHeader';
import SectionHeader from '@/components/SectionHeader';

export default function Profile() {
  const { user, activeFamily, logout } = useAuth();
  const { memories, stories, recipes, timeline } = useHeritage();

  const userName = user?.name || 'Rohan Mehta';
  const userEmail = user?.email || 'rohan@example.com';
  const userPhoto = user?.profileImage || 'https://i.pravatar.cc/300?img=33';
  const familyName = activeFamily?.name || 'Mehta Family';

  return (
    <>
      <PageHeader
        icon={User}
        title="My Profile"
        subtitle={`Your place in the ${familyName} story.`}
      />
      <div className="grid lg:grid-cols-[1fr_300px] gap-6">
        <div>
          <div className="card overflow-hidden mb-6">
            <div className="h-28 bg-gradient-to-r from-[#4a3525] to-[#6b4d35]" />
            <div className="p-6 flex flex-col sm:flex-row gap-5 -mt-14">
              <img
                src={userPhoto}
                className="w-24 h-24 rounded-2xl border-4 border-white shadow-lg shrink-0 object-cover"
                alt={userName}
              />
              <div className="flex-1 mt-4">
                <div className="flex flex-wrap justify-between gap-3">
                  <div>
                    <h2 className="font-display text-2xl">{userName}</h2>
                    <p className="flex items-center gap-2 mt-1 text-stone-600 text-sm">
                      <Mail className="w-4" />
                      {userEmail}
                    </p>
                    <p className="flex items-center gap-2 mt-1 text-stone-600 text-sm">
                      <Users className="w-4" />
                      Member · {familyName}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        toast({
                          title: 'Profile editor ready',
                          description: 'Your profile details can now be updated.',
                        })
                      }
                      className="btn"
                    >
                      <Edit3 className="w-4" /> Edit Profile
                    </button>
                    <Link to="/forgot-password" className="btn-outline">
                      <KeyRound className="w-4" /> Change Password
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="card p-5 mb-6">
            <SectionHeader title="About Me" />
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                ['Language', user?.language === 'en' ? 'English' : 'Gujarati', Briefcase],
                ['Family Space', familyName, MapPin],
                ['Active Since', 'January 2024', Calendar],
                ['Role', 'Family Contributor & Archivist', Users],
              ].map(([l, v, I]) => (
                <div key={l} className="bg-[#f7f8ef] rounded-lg p-3 flex items-center gap-3">
                  <I className="w-5 text-stone-400" />
                  <div>
                    <span className="text-xs text-stone-500">{l}</span>
                    <p className="font-medium">{v}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card p-5">
            <SectionHeader
              title="Family Archive Overview"
              subtitle="Your contributions to the family archive"
            />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                [memories.length, 'Memories Added'],
                [stories.length, 'Stories Recorded'],
                [recipes.length, 'Recipes Shared'],
                [timeline.length, 'Timeline Events'],
              ].map(([v, l]) => (
                <div key={l} className="text-center">
                  <b className="font-display text-2xl text-olive">{v}</b>
                  <p className="text-sm text-stone-500">{l}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <aside className="space-y-5">
          <div className="card p-5">
            <h3 className="font-semibold mb-4">Account Actions</h3>
            <div className="space-y-1">
              <Link
                to="/settings"
                className="flex justify-between items-center py-2.5 text-sm hover:text-olive transition-colors"
              >
                Settings <span className="text-stone-400">→</span>
              </Link>
              <Link
                to="/privacy"
                className="flex justify-between items-center py-2.5 text-sm hover:text-olive transition-colors"
              >
                Privacy & Security <span className="text-stone-400">→</span>
              </Link>
              <Link
                to="/notifications"
                className="flex justify-between items-center py-2.5 text-sm hover:text-olive transition-colors"
              >
                Notifications <span className="text-stone-400">→</span>
              </Link>
              <button
                onClick={() => logout(true)}
                className="flex justify-between items-center py-2.5 text-sm text-red-600 w-full hover:text-red-700 transition-colors"
              >
                Logout <span>→</span>
              </button>
            </div>
          </div>
          <div className="card p-5 text-center">
            <div className="text-4xl mb-2">🌳</div>
            <p className="text-sm text-stone-500">
              You are an active part of the {familyName} archive.
            </p>
          </div>
        </aside>
      </div>
    </>
  );
}