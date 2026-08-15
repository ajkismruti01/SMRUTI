import {useParams,useNavigate} from 'react-router-dom';import {useState} from 'react';import {useHeritage} from '@/context/HeritageContext';import PageHeader from '@/components/PageHeader';import UploadBox from '@/components/UploadBox';import {Plus,Trash2,Mic2} from 'lucide-react';
const cats={memory:['Wedding','Travel','Birthday','Festival','Family','Education','Milestone','Spiritual','Sports','Celebration'],story:['Childhood','Career','Family','Wedding','Education'],recipe:['Breakfast','Main Course','Snacks','Desserts','Pickles','Beverages'],member:['Grandfather','Grandmother','Father','Mother','Uncle','Aunt','Son','Daughter','Cousin']};
const titles={memory:'Add a Memory',story:'Add a Family Story',recipe:'Add a Family Recipe',member:'Add Family Member'};
export default function AddContent(){
  const {type}=useParams(),nav=useNavigate(),{add}=useHeritage(),[image,setImage]=useState(''),[form,setForm]=useState({}),[ingredients,setIngredients]=useState(['']),[steps,setSteps]=useState(['']);
  const set=(k,v)=>setForm(f=>({...f,[k]:v}));
  const save=e=>{e.preventDefault();const img=image||'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=1000';
    if(type==='memory')add(type,{image:img,title:form.title,date:form.date||new Date().toLocaleDateString('en-US',{day:'2-digit',month:'short',year:'numeric'}),location:form.location||'Family Home',type:'Photos',category:form.category||'Family',description:form.description||'A new treasured memory.',people:[]});
    if(type==='story')add(type,{image:img,title:form.title,author:form.author||'Rohan Mehta',date:form.date||'Today',duration:'5 min',category:form.category||'Family',preview:(form.text||'').slice(0,120),text:form.text||'',audio:form.audio!==false});
    if(type==='recipe')add(type,{image:img,name:form.name,sharedBy:form.sharedBy||'Rohan Mehta',category:form.category||'Family Favorite',time:Number(form.time)||30,story:form.story||'',ingredients:ingredients.filter(Boolean),steps:steps.filter(Boolean),servings:form.servings||'4',difficulty:form.difficulty||'Easy'});
    if(type==='member')add(type,{photo:image||'https://i.pravatar.cc/300?img=5',name:form.name,relationship:form.relationship||'Family Member',bio:form.bio||'',occupation:form.occupation||'',birthYear:Number(form.birthYear)||2000,birthPlace:form.birthPlace||'India'});
    nav(type==='member'?'/members':type==='memory'?'/memories':type==='story'?'/stories':'/recipes');
  };
  return <><PageHeader title={titles[type]||titles.memory} subtitle="Preserve this for everyone who comes after us."/>
  <form onSubmit={save} className="card p-5 md:p-8 max-w-3xl">
    <UploadBox label={type==='recipe'?'Upload recipe image':'Upload photos, video or audio'} onImageChange={setImage}/>
    {type==='memory'&&<div className="form-grid mt-6">
      <label><span className="label">Memory Title *</span><input required className="input" onChange={e=>set('title',e.target.value)}/></label>
      <label><span className="label">Date</span><input type="date" className="input" onChange={e=>set('date',e.target.value)}/></label>
      <label><span className="label">Location</span><input className="input" onChange={e=>set('location',e.target.value)}/></label>
      <label><span className="label">Category</span><select className="input" onChange={e=>set('category',e.target.value)}>{cats.memory.map(c=><option key={c}>{c}</option>)}</select></label>
      <label className="md:col-span-2"><span className="label">Description</span><textarea className="input min-h-28" onChange={e=>set('description',e.target.value)}/></label>
    </div>}
    {type==='story'&&<div className="form-grid mt-6">
      <label><span className="label">Story Title *</span><input required className="input" onChange={e=>set('title',e.target.value)}/></label>
      <label><span className="label">Author</span><input className="input" defaultValue="Rohan Mehta" onChange={e=>set('author',e.target.value)}/></label>
      <label><span className="label">Category</span><select className="input" onChange={e=>set('category',e.target.value)}>{cats.story.map(c=><option key={c}>{c}</option>)}</select></label>
      <label><span className="label">Date</span><input type="date" className="input" onChange={e=>set('date',e.target.value)}/></label>
      <label className="md:col-span-2"><span className="label">Story Text *</span><textarea required className="input min-h-40" onChange={e=>set('text',e.target.value)}/></label>
      <label className="md:col-span-2 flex items-center gap-2"><input type="checkbox" defaultChecked className="w-5 h-5 accent-[#58752c]" onChange={e=>set('audio',e.target.checked)}/><Mic2 className="w-4 text-olive"/><span className="text-sm">Include audio narration</span></label>
    </div>}
    {type==='recipe'&&<div className="form-grid mt-6">
      <label><span className="label">Recipe Name *</span><input required className="input" onChange={e=>set('name',e.target.value)}/></label>
      <label><span className="label">Shared By</span><input className="input" defaultValue="Rohan Mehta" onChange={e=>set('sharedBy',e.target.value)}/></label>
      <label><span className="label">Category</span><select className="input" onChange={e=>set('category',e.target.value)}>{cats.recipe.map(c=><option key={c}>{c}</option>)}</select></label>
      <label><span className="label">Cooking Time (min)</span><input type="number" defaultValue="30" className="input" onChange={e=>set('time',e.target.value)}/></label>
      <label><span className="label">Servings</span><input className="input" defaultValue="4" onChange={e=>set('servings',e.target.value)}/></label>
      <label><span className="label">Difficulty</span><select className="input" onChange={e=>set('difficulty',e.target.value)}><option>Easy</option><option>Medium</option><option>Hard</option></select></label>
      <label className="md:col-span-2"><span className="label">Recipe Story</span><textarea className="input min-h-20" onChange={e=>set('story',e.target.value)}/></label>
      <div className="md:col-span-2"><span className="label">Ingredients</span><div className="space-y-2">{ingredients.map((ing,i)=>(<div key={i} className="flex gap-2"><input className="input" placeholder={`Ingredient ${i+1}`} value={ing} onChange={e=>setIngredients(a=>a.map((x,j)=>j===i?e.target.value:x))}/>{ingredients.length>1&&<button type="button" className="touch text-red-500" onClick={()=>setIngredients(a=>a.filter((_,j)=>j!==i))}><Trash2 className="w-4"/></button>}</div>))}</div><button type="button" className="btn-outline mt-2 text-sm" onClick={()=>setIngredients(a=>[...a,''])}><Plus className="w-4"/> Add Ingredient</button></div>
      <div className="md:col-span-2"><span className="label">Preparation Steps</span><div className="space-y-2">{steps.map((step,i)=>(<div key={i} className="flex gap-2"><span className="w-7 h-7 rounded-full bg-olive text-white grid place-items-center text-sm font-bold shrink-0 mt-1">{i+1}</span><input className="input" placeholder={`Step ${i+1}`} value={step} onChange={e=>setSteps(a=>a.map((x,j)=>j===i?e.target.value:x))}/>{steps.length>1&&<button type="button" className="touch text-red-500" onClick={()=>setSteps(a=>a.filter((_,j)=>j!==i))}><Trash2 className="w-4"/></button>}</div>))}</div><button type="button" className="btn-outline mt-2 text-sm" onClick={()=>setSteps(a=>[...a,''])}><Plus className="w-4"/> Add Step</button></div>
    </div>}
    {type==='member'&&<div className="form-grid mt-6">
      <label><span className="label">Name *</span><input required className="input" onChange={e=>set('name',e.target.value)}/></label>
      <label><span className="label">Relationship</span><select className="input" onChange={e=>set('relationship',e.target.value)}>{cats.member.map(c=><option key={c}>{c}</option>)}</select></label>
      <label><span className="label">Birth Year</span><input type="number" className="input" onChange={e=>set('birthYear',e.target.value)}/></label>
      <label><span className="label">Birthplace</span><input className="input" onChange={e=>set('birthPlace',e.target.value)}/></label>
      <label><span className="label">Occupation</span><input className="input" onChange={e=>set('occupation',e.target.value)}/></label>
      <label className="md:col-span-2"><span className="label">Short Bio</span><textarea className="input min-h-20" onChange={e=>set('bio',e.target.value)}/></label>
    </div>}
    <div className="flex justify-end gap-3 mt-6"><button type="button" className="btn-outline" onClick={()=>nav(-1)}>Cancel</button><button className="btn">Save</button></div>
  </form></>;
}