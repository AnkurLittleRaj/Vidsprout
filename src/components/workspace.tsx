'use client';
import { useEffect, useRef, useState } from 'react';
import { useDialogFocus } from './dialog-focus';
import { ThemeToggle } from './theme-toggle';
import { LocalCreator } from './local-creator';
import { createAuthClient } from 'better-auth/react';
import { ArrowUpRight, ArrowRight, Film, Leaf, LockKeyhole, LogOut, Monitor, Play, Plus, Smartphone, Sparkles, Sprout, Video, X } from 'lucide-react';

const authClient = createAuthClient();
type Config = {preview?:boolean;accountLessons?:boolean;authentication:boolean;renderReady:boolean};
type Job = {id:string;title:string;state:string;orientation:string;createdAt:string;playable:boolean;error?:string};
export function Workspace({config}: {config:Config}) {
  const [tab, setTab] = useState('Home'); const [user, setUser] = useState<{name:string;email:string}|null>(null);
  const [authMode, setAuthMode] = useState<'sign-up'|'sign-in'|null>(null);
  const [jobs, setJobs] = useState<Job[]>([]); const [notice, setNotice] = useState('');
  const [orientation, setOrientation] = useState<'vertical'|'landscape'>('vertical');
  const [busy, setBusy] = useState(false); const [playing, setPlaying] = useState<Job|null>(null);
  const [requestKey, setRequestKey] = useState<string|null>(null);
  useEffect(() => {
    if (!config.authentication) return;
    let active = true;
    const refreshSession=()=>authClient.getSession().then(({data,error}) => {
      if(!active)return;
      if(error){setNotice('Could not check your session. Please try signing in.');return;}
      setUser(data?{name:data.user.name,email:data.user.email}:null);
      if(!data){setJobs([]);setPlaying(null);}
    }).catch(()=>{if(active)setNotice('Could not check your session. Please try signing in.');});
    void refreshSession();
    const timer=setInterval(()=>{void refreshSession();},15000);
    const focus=()=>{void refreshSession();};window.addEventListener('focus',focus);
    return () => {active = false;clearInterval(timer);window.removeEventListener('focus',focus);};
  }, [config.authentication]);
  useEffect(() => {
    if (!user || config.preview) return;
    let active = true;
    const refresh = async () => {
      try {const response = await fetch('/api/jobs', {cache:'no-store'});
        if(response.status === 401) {if(active) {setUser(null);setJobs([]);setPlaying(null);} return;}
        const data = await response.json(); if(active && response.ok) setJobs(data.jobs);
      } catch { /* persisted status remains visible; next poll retries */ }
    };
    void refresh(); const interval = setInterval(refresh, 5000);
    return () => {active = false; clearInterval(interval);};
  }, [user]);
  async function generate() {
    if(config.accountLessons&&!user){setAuthMode('sign-up');return;}
    if(config.preview) {document.getElementById('create-video')?.scrollIntoView({behavior:'smooth'});return;}
    if(!user) {setAuthMode('sign-up');return;}
    if(!config.renderReady) {setNotice('Video creation is temporarily unavailable. Please try again later.');return;}
    setBusy(true); setNotice('');
    const key = requestKey || crypto.randomUUID(); setRequestKey(key);
    try {
      const response = await fetch('/api/jobs', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({orientation,requestKey:key})});
      const data = await response.json();
      if(!response.ok) throw new Error(data.error || 'Could not start the render.');
      setJobs(previous => [data.job, ...previous.filter(item => item.id !== data.job.id)]);
      setRequestKey(null);setTab('My videos');setNotice('Render accepted. You can leave this page and return later.');
    } catch(error) {setNotice(error instanceof Error ? error.message : 'Could not start rendering.');}
    finally {setBusy(false);}
  }
  async function signOut() {const result=await authClient.signOut();if(result.error){setNotice('Could not sign out. Please try again.');return;}setUser(null);setJobs([]);setPlaying(null);setRequestKey(null);setTab('Home');}
  const activeJobs = jobs.filter(job => !['ready','failed','needs_action'].includes(job.state));
  return <div className="app-shell">
    <aside className="sidebar">
      <a className="brand" href="/"><span className="brand-symbol"><Sprout size={23}/></span>vidsprout<span className="brand-ai">.ai</span></a>
      <div className="workspace-label">YOUR WORKSPACE <span>01</span></div>
      <nav aria-label="Main navigation">{[{name:'Home',icon:Leaf},{name:'My videos',icon:Film}].map(({name,icon:Icon}) => <button className={tab===name?'nav-item selected':'nav-item'} key={name} onClick={()=>{setTab(name);setNotice('');}}><Icon size={18}/>{name}{name==='My videos' && !config.preview && <span className="nav-count">{jobs.length}</span>}</button>)}</nav>
      <div className="sidebar-bottom"><div className="private-note"><LockKeyhole size={16}/><div><strong>Just your corner.</strong><p>{config.preview&&!config.accountLessons?'Saved in this browser’s local library.':'Your videos stay private.'}</p></div></div>
      {user ? <div className="profile"><span className="avatar">{user.name.charAt(0).toUpperCase()}</span><div><strong>{user.name}</strong><small>Personal workspace</small></div><button className="icon-button" aria-label="Sign out" onClick={signOut}><LogOut size={16}/></button></div> : (!config.preview || config.accountLessons) && <button className="login-button" onClick={()=>setAuthMode('sign-in')}>Sign in to your workspace <ArrowRight size={16}/></button>}</div>
    </aside>
    <main className="main">
      <header className="topbar"><span>Workspace <span className="slash">/</span> <strong>{tab}</strong></span><div className="topbar-actions"><span className="prototype-tag"><span/> FOUNDATION PROTOTYPE</span><ThemeToggle/></div></header>
      {notice && <div className="notice" role="status">{notice}<button aria-label="Dismiss message" className="icon-button" onClick={()=>setNotice('')}><X size={16}/></button></div>}
      {tab==='Home' && <>
        <section className="page-heading"><div><div className="eyebrow">A LITTLE IDEA. A NEW BEGINNING.</div><h1>Make something<br/><span>worth watching.</span></h1><p>Your ideas. Your voice. Your videos.<br/>A quieter place to bring what you know to life.</p></div><div className="heading-note"><span className="note-line"/><span>Made for curious minds<br/>& the people who teach them.</span></div></section>
        {config.preview && (config.accountLessons&&!user?<section className="creator-section"><h2>Your own video workspace.</h2><p>Sign in or create an account to generate and access your videos.</p><button className="primary" onClick={()=>setAuthMode('sign-up')}>Create an account</button></section>:<LocalCreator key={user?.email||'demo'} accountMode={config.accountLessons}/>)}<section className="hero-card">
          <div className="hero-content"><span className="pill"><Sparkles size={14}/> FIRST, LET’S MAKE IT MOVE</span><h2>Small ideas.<br/>Big possibilities.</h2><p>Try the first motion-graphics render.<br/>One private video, from start to finish.</p>
          <div className="orientation-switch" role="group" aria-label="Video orientation"><button className={orientation==='vertical'?'active':''} onClick={()=>{setOrientation('vertical');setRequestKey(null);}} disabled={busy}><Smartphone size={15}/>Vertical</button><button className={orientation==='landscape'?'active':''} onClick={()=>{setOrientation('landscape');setRequestKey(null);}} disabled={busy}><Monitor size={16}/>Landscape</button></div>
          <button className="primary" onClick={generate} disabled={busy || activeJobs.length>0}>{busy?'Starting…':activeJobs.length?'Render in progress':config.preview?'Create a video':'Create a test video'}<ArrowUpRight size={18}/></button>
          <small className="hero-footnote">{config.preview?'Evaporation explainer · 27 seconds · Male narration':'Silent render test · 12 seconds · No AI voiceover yet'}</small></div>
          <div className="hero-art" aria-label="Illustration of an idea growing into a video"><div className="orbit orbit-one"/><div className="orbit orbit-two"/><span className="art-star star-one">✦</span><span className="art-star star-two">✦</span><div className="art-note note-back"><span>YOUR NEXT IDEA</span><div className="note-strokes"><i/><i/><i/></div></div><div className="video-paper"><div className="video-paper-top"><span className="tiny-dot"/> A MOMENT OF GROWTH <span>01 / 03</span></div><div className="plant"><span className="plant-stem"/><span className="plant-leaf left"/><span className="plant-leaf right"/><span className="plant-seed"/></div><div className="video-paper-caption">Every great thing<br/>starts small.</div><div className="video-paper-footer"><Play size={13} fill="currentColor"/><div className="mini-track"><span/></div><span>0:12</span></div></div><div className="art-label"><span>↗</span> Watch your ideas grow.</div></div>
        </section>
        {config.preview && <section id="local-preview" className="preview-section"><div><div className="eyebrow">LOCAL VIDEO PREVIEW</div><h2>How does evaporation work?</h2><p>Narration and animation, timed together. Switch between vertical and landscape above to compare.</p><p className="fine-print">27 seconds · Science explainer · Male narration<br/>No account or database needed. This sample is not saved to a personal library. Voice: George · elevenlabs.io.</p><a className="primary" href={`/api/preview?topic=evaporation&narrated=1&orientation=${orientation}&download=1`}>Download sample <ArrowRight size={16}/></a></div><video key={orientation} controls playsInline preload="metadata" aria-label={`${orientation} motion graphics sample`} src={`/api/preview?topic=evaporation&narrated=1&orientation=${orientation}`}/></section>}
        <section className="workflow-strip"><div><span>01</span><strong>Bring an idea</strong><small>A thought, a lesson, a story</small></div><ArrowRight size={16}/><div><span>02</span><strong>Let it take shape</strong><small>Motion that makes it clear</small></div><ArrowRight size={16}/><div><span>03</span><strong>Make it yours to keep</strong><small>Watch. Download. Come back.</small></div></section>
        {!config.preview && <section className="recent-section"><div className="section-heading"><h2>Your growing collection</h2><button onClick={()=>setTab('My videos')}>View all videos <ArrowRight size={15}/></button></div>{jobs.length ? <JobGrid jobs={jobs.slice(0,3)} onPlay={setPlaying}/> : <div className="empty-state"><span className="empty-icon"><Video size={23}/></span><div><h3>Your first video belongs here.</h3><p>Start with a test render. It will be saved in your private library.</p></div><button className="circle-button" aria-label="Create first test video" onClick={generate}><Plus size={22}/></button></div>}</section>}
      </>}
      {tab==='My videos' && config.preview && (config.accountLessons&&!user?<section className="creator-section"><h2>Your videos are private.</h2><button className="primary" onClick={()=>setAuthMode('sign-in')}>Sign in</button></section>:<LocalCreator key={user?.email||'demo'} libraryOnly accountMode={config.accountLessons}/>)}
      {tab==='My videos' && !config.preview && <section className="library"><div className="page-heading compact"><div><div className="eyebrow">ONLY YOU CAN SEE THESE</div><h1>Your video garden.</h1><p>Finished videos, safely in your own corner.</p></div><button className="primary" onClick={()=>setTab('Home')}><Plus size={16}/> New test video</button></div>{jobs.length ? <JobGrid jobs={jobs} onPlay={setPlaying}/> : <div className="empty-state"><Film size={28}/><div><h3>No videos yet.</h3><p>{user?'Create a test video to start your collection.':'Sign in to see your private video library.'}</p></div></div>}</section>}
      <footer className="footer"><span><Sprout size={14}/> A little more knowledge. A little more possibility.</span><span>VidSprout.ai · Early prototype</span></footer>
    </main>
    {authMode && <AuthDialog mode={authMode} available={config.authentication} onClose={()=>setAuthMode(null)} onSwitch={()=>setAuthMode(authMode==='sign-in'?'sign-up':'sign-in')} onSuccess={async()=>{const {data}=await authClient.getSession(); if(data)setUser({name:data.user.name,email:data.user.email});setAuthMode(null);}}/>}
    {playing && <Playback job={playing} onClose={()=>setPlaying(null)}/>}
  </div>;
}
function JobGrid({jobs,onPlay}:{jobs:Job[];onPlay:(job:Job)=>void}) {
  return <div className="job-grid">{jobs.map(job=><article className="job-card" key={job.id}><div className="job-art"><Sprout size={52}/><span>Every great thing starts small.</span>{job.playable && <button className="play-button" aria-label={`Watch ${job.title}`} onClick={()=>onPlay(job)}><Play fill="currentColor" size={20}/></button>}</div><div className="job-info"><h3>{job.title}</h3><p>{job.orientation} · Silent render test</p><span className={`job-state ${job.state}`}>{job.state.replaceAll('_',' ')}</span>{job.error && <p role="status" className="error-text">{job.error}</p>}</div></article>)}</div>;
}
function AuthDialog({mode,available,onClose,onSwitch,onSuccess}:{mode:'sign-in'|'sign-up';available:boolean;onClose:()=>void;onSwitch:()=>void;onSuccess:()=>Promise<void>}) {
  const [error,setError]=useState(''); const [busy,setBusy]=useState(false);
  const dialog=useRef<HTMLDivElement>(null);useDialogFocus(dialog,onClose);
  async function submit(event:React.FormEvent<HTMLFormElement>) {
    event.preventDefault();setBusy(true);setError('');const data=new FormData(event.currentTarget);
    try { const credentials={email:String(data.get('email')),password:String(data.get('password'))};
      const result = mode==='sign-up'?await authClient.signUp.email({...credentials,name:String(data.get('name'))}):await authClient.signIn.email(credentials);
      if(result.error) {setError(result.error.message || 'Please check your details.');return;}
      await onSuccess();
    } catch {setError('Could not connect. Please try again.');} finally {setBusy(false);}
  }
  return <div className="modal-backdrop" ref={dialog}><section className="modal" role="dialog" aria-modal="true" aria-labelledby="auth-title"><button className="modal-close icon-button" aria-label="Close sign in" onClick={onClose}><X/></button><span className="brand-symbol"><Sprout/></span><h2 id="auth-title">{mode==='sign-up'?'Your ideas start here.':'Welcome back.'}</h2><p>Your own private video workspace.</p>{!available && <div className="form-warning">Account access is temporarily unavailable. Please try again later.</div>}<form onSubmit={submit}>{mode==='sign-up' && <label>Your name<input autoFocus name="name" autoComplete="name" required maxLength={100}/></label>}<label>Email address<input autoFocus={mode==='sign-in'} type="email" name="email" autoComplete="email" required/></label><label>Password<input type="password" name="password" autoComplete={mode==='sign-up'?'new-password':'current-password'} minLength={mode==='sign-up'?12:1} maxLength={128} required/>{mode==='sign-up' && <small>At least 12 characters. A passphrase works well.</small>}</label>{error && <p className="error-text" role="alert">{error}</p>}<button className="primary" disabled={!available||busy}>{busy?'Please wait…':mode==='sign-up'?'Create your account':'Sign in'}<ArrowRight size={16}/></button></form><button className="switch-auth" onClick={()=>{setError('');onSwitch();}}>{mode==='sign-up'?'Already have an account? Sign in':'New here? Create an account'}</button></section></div>;
}
function Playback({job,onClose}:{job:Job;onClose:()=>void}) {
  const dialog=useRef<HTMLDivElement>(null);useDialogFocus(dialog,onClose);
  return <div className="modal-backdrop" ref={dialog} onClick={onClose}><section role="dialog" aria-modal="true" aria-label="Video playback" className="modal video-modal" onClick={e=>e.stopPropagation()}><button className="modal-close icon-button" aria-label="Close video" onClick={onClose}><X/></button><h2>{job.title}</h2><video controls autoPlay src={`/api/videos/${job.id}/content`}/><a className="primary" href={`/api/videos/${job.id}/content?download=1`}>Download MP4 <ArrowRight size={16}/></a></section></div>;
}
