import {Settings as SettingsIcon,User,Users,Lock,Bell,Globe,Palette,Shield} from 'lucide-react';
import {useState} from 'react';
import PageHeader from '@/components/PageHeader';
import {toast} from '@/components/ui/use-toast';
import FilterBar from '@/components/FilterBar';

const tabIcons={Account:User,Family:Users,Privacy:Lock,Notifications:Bell,Language:Globe,Appearance:Palette};

export default function Settings(){
  const [tab,setTab]=useState('Account');
  const [language,setLanguage]=useState('English');
  const [theme,setTheme]=useState('Light');

  return <>
    <PageHeader icon={SettingsIcon} title="Settings" subtitle="Manage your family space and preferences."/>
    <FilterBar items={['Account','Family','Privacy','Notifications','Language','Appearance']} value={tab} onChange={setTab}/>

    <div className="grid lg:grid-cols-[1fr_280px] gap-6 mt-5">
      <section className="card p-6">
        <div className="flex items-center gap-2 mb-5">{(()=>{const I=tabIcons[tab];return <I className="w-5 text-olive"/>;})()}<h2 className="font-display text-2xl">{tab}</h2></div>

        {tab==='Account'&&(
          <div className="space-y-4">
            <div><label className="label">Full Name</label><input className="input" defaultValue="Rohan Mehta"/></div>
            <div><label className="label">Email</label><input className="input" defaultValue="rohan@example.com"/></div>
            <div><label className="label">Phone</label><input className="input" defaultValue="+91 98765 43210"/></div>
            <div><label className="label">Bio</label><textarea className="input min-h-20" defaultValue="Tech enthusiast preserving family memories for the digital age."/></div>
          </div>
        )}

        {tab==='Family'&&(
          <div className="space-y-4">
            <div><label className="label">Family Name</label><input className="input" defaultValue="Mehta Family"/></div>
            <div><label className="label">Family Description</label><textarea className="input min-h-20" defaultValue="A family rooted in Surat, Gujarat, with traditions spanning four generations."/></div>
            <div className="form-grid">
              <div><label className="label">Family Owner</label><input className="input" defaultValue="Rohan Mehta" disabled/></div>
              <div><label className="label">Total Members</label><input className="input" defaultValue="10" disabled/></div>
            </div>
          </div>
        )}

        {tab==='Privacy'&&(
          <div className="form-grid">
            <div><label className="label">Who can view memories</label><select className="input"><option>All family members</option><option>Adults only</option><option>Family owner only</option></select></div>
            <div><label className="label">Who can add memories</label><select className="input"><option>All family members</option><option>Adults only</option><option>Family owner only</option></select></div>
            <div><label className="label">Who can edit memories</label><select className="input"><option>All family members</option><option>Adults only</option><option>Family owner only</option></select></div>
            <div><label className="label">Who can invite members</label><select className="input"><option>Family owner only</option><option>Adults only</option><option>All family members</option></select></div>
          </div>
        )}

        {tab==='Notifications'&&(
          <div className="space-y-1">
            {['Family activity updates','New memory notifications','New story notifications','New recipe notifications','Weekly family digest','Birthday reminders','Tagged in memory'].map(x=>
              <label className="flex justify-between items-center border-b border-[#f0eadf] py-3.5" key={x}><span className="text-sm">{x}</span><input type="checkbox" defaultChecked className="w-5 h-5 accent-[#58752c]"/></label>
            )}
          </div>
        )}

        {tab==='Language'&&(
          <div className="space-y-4">
            <div><label className="label">Display Language</label><select value={language} onChange={e=>setLanguage(e.target.value)} className="input"><option>English</option><option>Gujarati</option><option>Hindi</option><option>Marathi</option></select></div>
            <div><label className="label">Date Format</label><select className="input"><option>DD MMM YYYY</option><option>MM/DD/YYYY</option><option>DD/MM/YYYY</option></select></div>
            <div><label className="label">Time Zone</label><select className="input"><option>India (IST)</option><option>UTC</option><option>US Eastern</option></select></div>
          </div>
        )}

        {tab==='Appearance'&&(
          <div className="space-y-4">
            <div><label className="label">Theme</label><div className="flex gap-3">
              {['Light','Warm','Sepia'].map(t=><button key={t} onClick={()=>setTheme(t)} className={`flex-1 p-4 rounded-xl border-2 ${theme===t?'border-[#58752c] bg-[#eef3e3]':'border-[#e5dcc8]'}`}><b className="text-sm">{t}</b></button>)}
            </div></div>
            <div><label className="label">Font Size</label><select className="input"><option>Small</option><option>Medium (Default)</option><option>Large</option><option>Extra Large</option></select></div>
            <div><label className="label">Reduced Motion</label><label className="flex items-center gap-2"><input type="checkbox" className="w-5 h-5 accent-[#58752c]"/> <span className="text-sm">Minimize animations</span></label></div>
          </div>
        )}

        <button onClick={()=>toast({title:'Settings saved',description:'Your family preferences are updated.'})} className="btn mt-6">Save Changes</button>
      </section>

      <aside className="space-y-5">
        <div className="card p-5">
          <h3 className="font-semibold mb-4">Settings Menu</h3>
          <div className="space-y-1">
            {Object.entries(tabIcons).map(([name,I])=>
              <button key={name} onClick={()=>setTab(name)} className={`flex items-center gap-2 w-full py-2.5 px-3 rounded-lg text-sm ${tab===name?'bg-[#e8ecd9] text-olive font-semibold':'text-stone-600 hover:bg-[#f7f2ec]'}`}><I className="w-4"/> {name}</button>
            )}
          </div>
        </div>
        <div className="card p-5 text-center">
          <Shield className="w-8 h-8 text-olive mx-auto mb-2"/>
          <p className="text-sm text-stone-500">Your data is encrypted and private. Only family members can access the archive.</p>
        </div>
      </aside>
    </div>
  </>;
}