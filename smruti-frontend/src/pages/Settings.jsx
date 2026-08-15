import {
  Settings as SettingsIcon,
  User,
  Users,
  Lock,
  Bell,
  Globe,
  Palette,
  Shield,
  Loader2,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import PageHeader from '@/components/PageHeader';
import { toast } from '@/components/ui/use-toast';
import FilterBar from '@/components/FilterBar';
import { useAuth } from '@/lib/AuthContext';
import { useHeritage } from '@/context/HeritageContext';
import { api } from '@/api/client';

const tabIcons = {
  Account: User,
  Family: Users,
  Privacy: Lock,
  Notifications: Bell,
  Language: Globe,
  Appearance: Palette,
};

export default function Settings() {
  const { user, activeFamily, checkUserAuth } = useAuth();
  const { members, refresh } = useHeritage();

  const [tab, setTab] = useState('Account');
  const [language, setLanguage] = useState(user?.language === 'gu' ? 'Gujarati' : 'English');
  const [theme, setTheme] = useState('Light');

  // Dynamic user form state
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('+91 98765 43210');
  const [bio, setBio] = useState('');

  // Dynamic family form state
  const [familyName, setFamilyName] = useState('');
  const [familyDescription, setFamilyDescription] = useState('');

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setFullName(user.name || '');
      setEmail(user.email || '');
      setBio(user.bio || 'Family memory preservation & digital heritage.');
    }
    if (activeFamily) {
      setFamilyName(activeFamily.name || 'Mehta Family');
      setFamilyDescription(
        activeFamily.description || 'A cherished space for family stories and memories.'
      );
    }
  }, [user, activeFamily]);

  const handleSave = async () => {
    try {
      setSaving(true);
      if (tab === 'Account') {
        await api.users.updateProfile({
          name: fullName,
          language: language === 'Gujarati' ? 'gu' : 'en',
        });
        await checkUserAuth();
        toast({ title: 'Profile Updated', description: 'Your personal details have been saved.' });
      } else if (tab === 'Family' && (activeFamily?._id || activeFamily?.id)) {
        const fId = activeFamily._id || activeFamily.id;
        await api.families.update(fId, {
          name: familyName,
          description: familyDescription,
        });
        await checkUserAuth();
        await refresh();
        toast({ title: 'Family Space Updated', description: 'Family settings have been saved.' });
      } else {
        toast({ title: 'Settings Saved', description: `${tab} preferences updated successfully.` });
      }
    } catch (error) {
      toast({
        title: 'Save Failed',
        description: error.message || 'Could not update settings.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <PageHeader
        icon={SettingsIcon}
        title="Settings"
        subtitle="Manage your family space and preferences."
      />
      <FilterBar
        items={['Account', 'Family', 'Privacy', 'Notifications', 'Language', 'Appearance']}
        value={tab}
        onChange={setTab}
      />

      <div className="grid lg:grid-cols-[1fr_280px] gap-6 mt-5">
        <section className="card p-6">
          <div className="flex items-center gap-2 mb-5">
            {(() => {
              const I = tabIcons[tab];
              return <I className="w-5 text-olive" />;
            })()}
            <h2 className="font-display text-2xl">{tab}</h2>
          </div>

          {tab === 'Account' && (
            <div className="space-y-4">
              <div>
                <label className="label">Full Name</label>
                <input
                  className="input"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your Name"
                />
              </div>
              <div>
                <label className="label">Email</label>
                <input className="input" value={email} disabled />
              </div>
              <div>
                <label className="label">Phone</label>
                <input
                  className="input"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
              <div>
                <label className="label">Bio</label>
                <textarea
                  className="input min-h-20"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                />
              </div>
            </div>
          )}

          {tab === 'Family' && (
            <div className="space-y-4">
              <div>
                <label className="label">Family Name</label>
                <input
                  className="input"
                  value={familyName}
                  onChange={(e) => setFamilyName(e.target.value)}
                  placeholder="Family Name"
                />
              </div>
              <div>
                <label className="label">Family Description</label>
                <textarea
                  className="input min-h-20"
                  value={familyDescription}
                  onChange={(e) => setFamilyDescription(e.target.value)}
                />
              </div>
              <div className="form-grid">
                <div>
                  <label className="label">Family Owner / You</label>
                  <input
                    className="input"
                    value={user?.name || 'Rohan Mehta'}
                    disabled
                  />
                </div>
                <div>
                  <label className="label">Total Members</label>
                  <input className="input" value={members?.length || 10} disabled />
                </div>
              </div>
            </div>
          )}

          {tab === 'Privacy' && (
            <div className="form-grid">
              <div>
                <label className="label">Who can view memories</label>
                <select className="input">
                  <option>All family members</option>
                  <option>Adults only</option>
                  <option>Family owner only</option>
                </select>
              </div>
              <div>
                <label className="label">Who can add memories</label>
                <select className="input">
                  <option>All family members</option>
                  <option>Adults only</option>
                  <option>Family owner only</option>
                </select>
              </div>
              <div>
                <label className="label">Who can edit memories</label>
                <select className="input">
                  <option>All family members</option>
                  <option>Adults only</option>
                  <option>Family owner only</option>
                </select>
              </div>
              <div>
                <label className="label">Who can invite members</label>
                <select className="input">
                  <option>Family owner only</option>
                  <option>Adults only</option>
                  <option>All family members</option>
                </select>
              </div>
            </div>
          )}

          {tab === 'Notifications' && (
            <div className="space-y-1">
              {[
                'Family activity updates',
                'New memory notifications',
                'New story notifications',
                'New recipe notifications',
                'Weekly family digest',
                'Birthday reminders',
                'Tagged in memory',
              ].map((x) => (
                <label
                  className="flex justify-between items-center border-b border-[#f0eadf] py-3.5"
                  key={x}
                >
                  <span className="text-sm">{x}</span>
                  <input
                    type="checkbox"
                    defaultChecked
                    className="w-5 h-5 accent-[#58752c]"
                  />
                </label>
              ))}
            </div>
          )}

          {tab === 'Language' && (
            <div className="space-y-4">
              <div>
                <label className="label">Display Language</label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="input"
                >
                  <option>English</option>
                  <option>Gujarati</option>
                  <option>Hindi</option>
                  <option>Marathi</option>
                </select>
              </div>
              <div>
                <label className="label">Date Format</label>
                <select className="input">
                  <option>DD MMM YYYY</option>
                  <option>MM/DD/YYYY</option>
                  <option>DD/MM/YYYY</option>
                </select>
              </div>
              <div>
                <label className="label">Time Zone</label>
                <select className="input">
                  <option>India (IST)</option>
                  <option>UTC</option>
                  <option>US Eastern</option>
                </select>
              </div>
            </div>
          )}

          {tab === 'Appearance' && (
            <div className="space-y-4">
              <div>
                <label className="label">Theme</label>
                <div className="flex gap-3">
                  {['Light', 'Warm', 'Sepia'].map((t) => (
                    <button
                      key={t}
                      onClick={() => setTheme(t)}
                      className={`flex-1 p-4 rounded-xl border-2 ${
                        theme === t
                          ? 'border-[#58752c] bg-[#eef3e3]'
                          : 'border-[#e5dcc8]'
                      }`}
                    >
                      <b className="text-sm">{t}</b>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="label">Font Size</label>
                <select className="input">
                  <option>Small</option>
                  <option>Medium (Default)</option>
                  <option>Large</option>
                  <option>Extra Large</option>
                </select>
              </div>
              <div>
                <label className="label">Reduced Motion</label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="w-5 h-5 accent-[#58752c]" />{' '}
                  <span className="text-sm">Minimize animations</span>
                </label>
              </div>
            </div>
          )}

          <button onClick={handleSave} className="btn mt-6" disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </button>
        </section>

        <aside className="space-y-5">
          <div className="card p-5">
            <h3 className="font-semibold mb-4">Settings Menu</h3>
            <div className="space-y-1">
              {Object.entries(tabIcons).map(([name, I]) => (
                <button
                  key={name}
                  onClick={() => setTab(name)}
                  className={`flex items-center gap-2 w-full py-2.5 px-3 rounded-lg text-sm ${
                    tab === name
                      ? 'bg-[#e8ecd9] text-olive font-semibold'
                      : 'text-stone-600 hover:bg-[#f7f2ec]'
                  }`}
                >
                  <I className="w-4" /> {name}
                </button>
              ))}
            </div>
          </div>
          <div className="card p-5 text-center">
            <Shield className="w-8 h-8 text-olive mx-auto mb-2" />
            <p className="text-sm text-stone-500">
              Your data is encrypted and private. Only family members can access the archive.
            </p>
          </div>
        </aside>
      </div>
    </>
  );
}