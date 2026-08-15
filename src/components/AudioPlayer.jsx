import {Play,Pause,Volume2} from 'lucide-react';
import {useState,useEffect,useRef} from 'react';

const DURATION=222;

export default function AudioPlayer({label="Listen to this story"}){
  const [playing,setPlaying]=useState(false);
  const [pos,setPos]=useState(0);
  const raf=useRef(null);

  useEffect(()=>{
    if(!playing)return;
    let last=performance.now();
    const tick=(now)=>{
      const dt=(now-last)/1000;
      last=now;
      setPos(p=>{
        const np=p+dt;
        if(np>=DURATION){setPlaying(false);return 0;}
        return np;
      });
      raf.current=requestAnimationFrame(tick);
    };
    raf.current=requestAnimationFrame(tick);
    return()=>cancelAnimationFrame(raf.current);
  },[playing]);

  const fmt=(s)=>`${Math.floor(s/60)}:${String(Math.floor(s%60)).padStart(2,'0')}`;

  return <div className="rounded-xl bg-[#eef4e5] border border-[#d7e2c7] p-4 flex items-center gap-4">
    <button onClick={()=>setPlaying(!playing)} className="w-11 h-11 rounded-full bg-olive text-white grid place-items-center shrink-0" aria-label={playing?'Pause':'Play'}>{playing?<Pause className="w-5"/>:<Play className="w-5"/>}</button>
    <div className="flex-1 min-w-0">
      <b className="text-sm block truncate">{label}</b>
      <div className="h-1.5 bg-white rounded-full mt-2 overflow-hidden"><div className="h-full bg-olive rounded-full" style={{width:`${(pos/DURATION)*100}%`}}/></div>
      <div className="flex justify-between text-xs text-stone-500 mt-1"><span>{fmt(pos)}</span><span>{fmt(DURATION)}</span></div>
    </div>
    <Volume2 className="w-5 shrink-0 text-stone-400"/>
  </div>;
}