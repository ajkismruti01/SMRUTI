import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Brand from '@/components/Brand';
import UploadBox from '@/components/UploadBox';
import { api } from '@/api/client';
import { useAuth } from '@/lib/AuthContext';
import { toast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';

export default function FamilySetup() {
  const nav = useNavigate();
  const { checkUserAuth } = useAuth();
  const [familyName, setFamilyName] = useState('');
  const [description, setDescription] = useState('');
  const [familyPhoto, setFamilyPhoto] = useState('');
  const [members, setMembers] = useState([{ name: '', relationship: '' }]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!familyName.trim()) {
      toast({ title: 'Family name is required', variant: 'destructive' });
      return;
    }

    try {
      setLoading(true);
      const res = await api.families.create({
        name: familyName.trim(),
        description: description.trim() || 'Our private family space.',
        familyPhoto: familyPhoto || 'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=1200',
      });

      const familyId = res?.family?._id || res?.family?.id;

      // Add additional members if provided
      if (familyId) {
        for (const m of members) {
          if (m.name.trim()) {
            await api.members.create(familyId, {
              name: m.name.trim(),
              relationship: m.relationship.trim() || 'Family Member',
              generation: 1,
            });
          }
        }
      }

      await checkUserAuth();
      toast({ title: 'Family Space Created', description: `Welcome to ${familyName}!` });
      nav('/');
    } catch (error) {
      toast({ title: 'Failed to create family', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f7f2e9] p-5">
      <div className="max-w-2xl mx-auto">
        <Brand />
        <div className="card p-6 md:p-9 mt-6">
          <h1 className="font-display text-3xl text-center">Create Your Family Space</h1>
          <p className="text-center text-stone-500 mt-2">Begin your private home for shared memories.</p>

          <form onSubmit={handleSubmit}>
            <label className="block mt-6">
              <span className="label">Family Name *</span>
              <input
                required
                value={familyName}
                onChange={(e) => setFamilyName(e.target.value)}
                className="input"
                placeholder="e.g. Mehta Family"
              />
            </label>

            <label className="block mt-4">
              <span className="label">Family Description</span>
              <input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="input"
                placeholder="e.g. Our private family space across generations"
              />
            </label>

            <div className="mt-5">
              <UploadBox label="Add a family photo" onImageChange={setFamilyPhoto} />
            </div>

            <h2 className="font-display text-xl mt-7">Add family members (optional)</h2>
            {members.map((m, i) => (
              <div className="grid grid-cols-2 gap-3 mt-3" key={i}>
                <input
                  className="input"
                  placeholder="Name"
                  value={m.name}
                  onChange={(e) =>
                    setMembers((prev) =>
                      prev.map((item, idx) => (idx === i ? { ...item, name: e.target.value } : item))
                    )
                  }
                />
                <input
                  className="input"
                  placeholder="Relationship (e.g. Father, Mother)"
                  value={m.relationship}
                  onChange={(e) =>
                    setMembers((prev) =>
                      prev.map((item, idx) => (idx === i ? { ...item, relationship: e.target.value } : item))
                    )
                  }
                />
              </div>
            ))}

            <button
              type="button"
              onClick={() => setMembers([...members, { name: '', relationship: '' }])}
              className="btn-outline mt-3"
            >
              + Add another member
            </button>

            <button type="submit" className="btn w-full mt-7" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Creating Space...
                </>
              ) : (
                'Create Family Space'
              )}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}