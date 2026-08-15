import {NavLink,useLocation} from 'react-router-dom';
import {Home,Image,Mic2,Utensils,Users,Clock3,CalendarDays,Search,Settings,PlusCircle,Heart,Leaf} from 'lucide-react';
import Brand from './Brand';

const items=[
  ['/',Home,'Home'],
  ['/memories',Image,'Memories'],
  ['/stories',Mic2,'Stories'],
  ['/recipes',Utensils,'Recipes'],
  ['/family-tree',Users,'Family Tree'],
  ['/timeline',Clock3,'Timeline'],
  ['/on-this-day',CalendarDays,'On This Day'],
  ['/search',Search,'Search'],
  ['/settings',Settings,'Settings']
];

const footers={
  '/':'યાદો એ જિંદગીની સાચી કમાણી છે.',
  '/memories':'Every picture has a story. Every story has a legacy.',
  '/recipes':'Good food brings people together.',
  '/family-tree':'A family is like branches on a tree... Our roots remain as one.',
  '/stories':'Stories are the threads that weave our family together.',
  '/timeline':'Time passes but memories remain forever.',
  '/on-this-day':'Today is a gift from the past.',
  '/search':'Search and you shall find your roots.',
  '/settings':'A well-kept family is a happy family.'
};

export default function Sidebar({collapsed}){
  const loc=useLocation();
  const footer=footers[loc.pathname]||'યાદો એ જિંદગીની સાચી કમાણી છે.';
  return <aside className={`hidden lg:flex fixed inset-y-0 left-0 z-30 flex-col border-r border-[#e8dfd1] bg-[#f7f2ec] transition-all ${collapsed?'w-20':'w-60'}`}>
    <div className="py-6"><Brand compact={collapsed}/></div>
    <nav className="px-3 space-y-1 flex-1 overflow-y-auto">
      {items.map(([to,I,label])=>
        <NavLink key={to} to={to} className={({isActive})=>`nav-link ${isActive?'active':''}`} end={to==='/'}>
          <I className="w-5 h-5 shrink-0"/>
          {!collapsed&&label}
        </NavLink>
      )}
    </nav>
    {!collapsed&&<>
      <div className="mx-4 mb-3 rounded-xl border border-[#e5dac8] bg-white/70 p-4">
        <p className="font-semibold text-olive flex justify-between items-center mb-2">Quick Add <PlusCircle className="w-5"/></p>
        {[['/add/memory','Add Memory'],['/add/story','Record Story'],['/add/recipe','Add Recipe'],['/add/member','Add Member']].map(x=>
          <NavLink className="block py-2 text-sm hover:text-olive transition-colors" to={x[0]} key={x[0]}>+ {x[1]}</NavLink>
        )}
      </div>
      <div className="px-6 pb-5 pt-2 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <span className="h-px bg-[#d4c9b8] flex-1"/>
          <Leaf className="w-4 text-olive"/>
          <span className="h-px bg-[#d4c9b8] flex-1"/>
        </div>
        <p className="text-xs text-stone-500 italic leading-relaxed">{footer}</p>
        <Heart className="w-4 text-olive mx-auto mt-2"/>
      </div>
    </>}
  </aside>;
}