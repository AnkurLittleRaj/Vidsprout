'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, Download, Film, LoaderCircle, Play } from 'lucide-react';

type LocalJob={id:string;title:string;orientation:string;narration:string;source:string;state:string;duration?:number;error?:string};
const labels:Record<string,string>={queued:'Waiting to start',narrating:'Creating the narration',rendering:'Animating your lesson',ready:'Ready to watch',failed:'Could not finish'};
export function LocalCreator({libraryOnly=false}:{libraryOnly?:boolean}) {
  const [step,setStep]=useState(1);const [topic,setTopic]=useState('evaporation');const [title,setTitle]=useState('');const [notes,setNotes]=useState('');
  const [orientation,setOrientation]=useState('vertical');const [narration,setNarration]=useState('male');
  const [jobs,setJobs]=useState<LocalJob[]>([]);const [selected,setSelected]=useState<string|null>(null);const [error,setError]=useState('');const [busy,setBusy]=useState(false);const [connected,setConnected]=useState(false);
  const key=useRef<string|null>(null);
  const refresh=useCallback(async()=>{
    const response=await fetch('/api/local-lessons',{cache:'no-store'});if(!response.ok)throw new Error('Could not load your local videos.');
    const data=await response.json();setJobs(data.jobs);setConnected(true);
  },[]);
  useEffect(()=>{let active=true;const poll=async()=>{try{if(active)await refresh();}catch{if(active)setError('Connection interrupted. Your saved videos will reappear when the connection returns.');}};void poll();const timer=setInterval(poll,3000);return()=>{active=false;clearInterval(timer);};},[refresh]);
  const current=jobs.find(j=>j.id===selected);const running=jobs.find(j=>!['ready','failed'].includes(j.state));
  useEffect(()=>{if(!selected&&running){setSelected(running.id);setStep(3);}if(current?.state==='ready')setStep(4);},[current?.state,running?.id,selected]);
  function next(){if(topic==='custom'&&(!title.trim()||notes.split(/\r?\n/).filter(s=>s.trim()).length<3)){setError('Add a title and at least three short lines of notes.');return;}setError('');setStep(2);key.current=null;}
  async function generate(){
    setBusy(true);setError('');key.current??=crypto.randomUUID();
    try{const response=await fetch('/api/local-lessons',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({requestKey:key.current,topic,title,notes,orientation,narration})});const data=await response.json();if(!response.ok)throw new Error(data.error||'Could not create this video.');setJobs(prev=>[data.job,...prev.filter(j=>j.id!==data.job.id)]);setSelected(data.job.id);setStep(data.job.state==='ready'?4:3);}
    catch(e){setError((e as Error).message);}finally{setBusy(false);}
  }
  function reset(){setSelected(null);setStep(1);key.current=null;setError('');}
  return <section id="create-video" className="creator-section" aria-label="Create a lesson video">
    {!libraryOnly&&<><div className="section-heading"><div><div className="eyebrow">YOUR NEXT LESSON</div><h2>From an idea to a video.</h2></div><span className="creator-badge">Local POC</span></div>
    <ol className="creator-steps" aria-label="Creation steps">{['Topic','Voice & format','Generate','Watch'].map((s,i)=><li key={s} aria-current={step===i+1?'step':undefined} className={step>=i+1?'active':''}><span>{step>i+1?<Check size={14}/>:i+1}</span>{s}</li>)}</ol>
    {step===1&&<div className="creator-form"><label>What would you like to explain?<select value={topic} onChange={e=>{setTopic(e.target.value);key.current=null;}}><option value="evaporation">How evaporation works</option><option value="photosynthesis">How photosynthesis works</option><option value="gravity">How gravity works</option><option value="custom">My own lesson notes</option></select></label>
      <p className="fine-print">Choose a prepared science lesson, or bring your own notes. Automatic scriptwriting for arbitrary topics is not available in this local version.</p>
      {topic==='custom'&&<><label>Lesson title<input value={title} onChange={e=>setTitle(e.target.value)} maxLength={80} placeholder="For example: Why sleep matters"/></label><label>Lesson notes<textarea rows={6} value={notes} onChange={e=>setNotes(e.target.value)} maxLength={1200} placeholder={'Write 3–5 short lines, one idea per line.\nWe’ll use your words as narration.\nKeep the total under 140 words.'}/></label><p className="fine-print">Up to 240 characters per line. Your notes become animated text cards; they are not researched or fact-checked automatically.</p></>}
      <button className="primary" onClick={next} disabled={!!running||!connected}>Continue <ArrowRight size={16}/></button>{running&&<button className="creator-link" onClick={()=>{setSelected(running.id);setStep(3);}}>View your current render</button>}
    </div>}
    {step===2&&<div className="creator-form"><label>Narration<select value={narration} onChange={e=>{setNarration(e.target.value);key.current=null;}}><option value="male">Male voice · George</option><option value="silent">Silent · Text and animation</option></select></label><label>Video format<select value={orientation} onChange={e=>{setOrientation(e.target.value);key.current=null;}}><option value="vertical">Vertical · 9:16</option><option value="landscape">Landscape · 16:9</option></select></label><p className="fine-print">Length is calculated from the lesson and narration, up to 90 seconds. Narration uses available free credits only. A silent video uses no speech credits.</p><div className="creator-actions"><button className="creator-link" onClick={()=>setStep(1)} disabled={busy}><ArrowLeft size={16}/> Back</button><button className="primary" onClick={generate} disabled={busy||!!running}>{busy?<LoaderCircle className="busy-icon" size={16}/>:<Play size={16}/>} {busy?'Starting…':'Generate video'}</button></div></div>}
    {(step===3||step===4)&&current&&<div className="creator-result"><h3>{current.title}</h3>{current.state==='ready'?<><video key={current.id} controls playsInline preload="metadata" aria-label="Generated lesson video" src={`/api/local-lessons/${current.id}/video`}/><p>{current.duration?.toFixed(1)} seconds · {current.orientation} · {current.narration==='male'?'Male narration · elevenlabs.io':'Silent video'}</p><div className="creator-actions"><a className="primary" href={`/api/local-lessons/${current.id}/video?download=1`}><Download size={16}/> Download video</a><button className="creator-link" onClick={reset}>Create another</button></div></>:current.state==='failed'?<><p role="alert">{current.error}</p><button className="creator-link" onClick={reset}>Back to topics</button></>:<div role="status" className="render-status"><LoaderCircle className="busy-icon" size={25}/><strong>{labels[current.state]}</strong><p>You can leave this view and return. Your local worker will continue.</p></div>}</div>}
    </>}
    {error&&<p className="error-text" role="alert">{error}</p>}
    <div className="section-heading"><h2>{libraryOnly?'Your local videos':'Recent local videos'}</h2></div><p className="fine-print">Saved on this computer and scoped to this browser. Clearing browser cookies disconnects this local library. Account-backed storage comes later.</p>
    {jobs.length?<div className="local-video-grid">{jobs.map(job=><article className="local-video-card" key={job.id}><Film size={24}/><h3>{job.title}</h3><p>{job.orientation} · {labels[job.state]}</p>{job.state==='ready'?<details><summary>Watch video</summary><video controls playsInline preload="none" aria-label={`Watch ${job.title}`} src={`/api/local-lessons/${job.id}/video`}/><a className="creator-link" href={`/api/local-lessons/${job.id}/video?download=1`}>Download</a></details>:<p role="status">{job.error||'Your video is being prepared.'}</p>}</article>)}</div>:<p className="fine-print">Your generated videos will appear here.</p>}
  </section>;
}
