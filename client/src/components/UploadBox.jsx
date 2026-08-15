import { UploadCloud, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { api } from '@/api/client';
import { useAuth } from '@/lib/AuthContext';
import { toast } from '@/components/ui/use-toast';

export default function UploadBox({ label = 'Upload photos, videos or audio', onImageChange }) {
  const { activeFamily } = useAuth();
  const [preview, setPreview] = useState('');
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Show local preview immediately
    if (file.type.startsWith('image/')) {
      const localUrl = URL.createObjectURL(file);
      setPreview(localUrl);
    }

    // If active family is present, upload to server/Cloudinary
    const familyId = activeFamily?._id || activeFamily?.id;
    if (familyId) {
      try {
        setUploading(true);
        const res = await api.media.upload(familyId, file);
        if (res && res.url) {
          setPreview(res.url);
          onImageChange?.(res.url);
        }
        setUploading(false);
      } catch (error) {
        setUploading(false);
        toast({
          title: 'Upload Notice',
          description: 'Uploaded locally for this draft.',
        });
        if (file.type.startsWith('image/')) {
          onImageChange?.(URL.createObjectURL(file));
        }
      }
    } else {
      if (file.type.startsWith('image/')) {
        onImageChange?.(URL.createObjectURL(file));
      }
    }
  };

  return (
    <label className="block border-2 border-dashed rounded-xl p-6 text-center cursor-pointer bg-[#fbfaf6] hover:bg-[#f5f2ec] transition-colors relative">
      <input
        type="file"
        className="sr-only"
        accept="image/*,video/*,audio/*"
        onChange={handleFileChange}
        disabled={uploading}
      />
      {uploading ? (
        <div className="py-4">
          <Loader2 className="w-8 h-8 mx-auto text-olive animate-spin" />
          <p className="mt-2 text-sm font-medium text-stone-600">Uploading media to secure storage...</p>
        </div>
      ) : preview ? (
        <div>
          <img src={preview} className="h-36 mx-auto rounded-lg object-cover" alt="Preview" />
          <p className="text-xs text-stone-500 mt-2">Click to change media</p>
        </div>
      ) : (
        <>
          <UploadCloud className="w-8 h-8 mx-auto text-olive" />
          <p className="mt-2 font-medium">{label}</p>
          <small className="text-stone-500">Click to browse files</small>
        </>
      )}
    </label>
  );
}