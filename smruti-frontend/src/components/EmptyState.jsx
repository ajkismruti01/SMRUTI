import {Archive} from 'lucide-react';import {Link} from 'react-router-dom';
export default function EmptyState({title='No family keepsakes found',message='Try changing your search or filters.',actionLabel,actionTo}){
  return <div className="py-16 text-center">
    <Archive className="w-10 h-10 mx-auto text-stone-400"/>
    <h3 className="font-display text-xl mt-3">{title}</h3>
    <p className="text-stone-500 text-sm mt-1">{message}</p>
    {actionLabel&&actionTo&&<Link to={actionTo} className="btn mt-4 inline-flex">{actionLabel}</Link>}
  </div>;
}