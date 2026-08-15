import {Outlet} from 'react-router-dom';
import {useState} from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import MobileNavigation from './MobileNavigation';

export default function AppLayout(){
  const [collapsed,setCollapsed]=useState(false);
  return <div className="min-h-screen bg-[#fdfbf7]">
    <Sidebar collapsed={collapsed}/>
    <div className={`transition-all ${collapsed?'lg:ml-20':'lg:ml-60'}`}>
      <Header onMenu={()=>setCollapsed(!collapsed)}/>
      <main className="p-4 md:p-7 pb-24 lg:pb-8 max-w-[1480px] mx-auto">
        <Outlet/>
      </main>
    </div>
    <MobileNavigation/>
  </div>;
}