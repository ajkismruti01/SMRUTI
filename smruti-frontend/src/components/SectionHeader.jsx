import {Link} from 'react-router-dom';
import {ArrowRight} from 'lucide-react';
export default function SectionHeader({title,subtitle,to,actionLabel}){
  return <div className="flex items-end justify-between mb-4">
    <div>
      <h2 className="font-display text-xl md:text-2xl font-semibold text-[#29221c]">{title}</h2>
      {subtitle&&<p className="text-sm text-stone-500 mt-1">{subtitle}</p>}
    </div>
    {to&&<Link to={to} className="text-sm text-olive flex items-center gap-1 hover:gap-2 transition-all whitespace-nowrap">{actionLabel||'View All'} <ArrowRight className="w-3.5"/></Link>}
  </div>;
}