import { TreePine } from 'lucide-react';

export default function Brand({ compact = false }) {
  if (compact) {
    return (
      <div className="flex flex-col items-center justify-center w-full px-2" title="SMRUTI">
        <TreePine className="w-8 h-8 text-olive shrink-0" />
        <span className="text-[10px] font-display font-bold tracking-wider text-brown mt-1">
          SMRUTI
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center text-center px-4">
      <TreePine className="w-14 h-14 text-olive mb-1" />
      <div>
        <div className="text-2xl font-display font-bold tracking-[.18em] text-brown">
          SMRUTI
        </div>
        <div className="text-[9px] text-stone-500 mt-0.5 tracking-wide">
          Preserve Yesterday. Remember Forever.
        </div>
      </div>
    </div>
  );
}