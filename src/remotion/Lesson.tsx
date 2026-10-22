import { AbsoluteFill, Audio, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import type { LessonPlan } from '../lib/lesson-plan';

const sample:LessonPlan={title:'A new lesson',source:'notes',scenes:[{title:'An idea worth sharing',text:'Your lesson comes to life with clear narration and animated visuals.',symbol:'idea'}]};
export function Lesson({plan=sample,sceneStarts=[0],audioSrc}:{plan?:LessonPlan;sceneStarts?:number[];audioSrc?:string}) {
  const frame=useCurrentFrame();const {width,height,fps,durationInFrames}=useVideoConfig();const wide=width>height;
  const index=Math.max(0,sceneStarts.findLastIndex(s=>frame>=Math.floor(s*fps)));const scene=plan.scenes[index];
  const local=frame-Math.floor(sceneStarts[index]*fps);const opacity=interpolate(local,[0,10],[0,1],{extrapolateRight:'clamp'});
  return <AbsoluteFill style={{background:'#0e1828',color:'#f5f7fc',fontFamily:'Arial, sans-serif',padding:wide?48:54}}>
    {audioSrc&&<Audio src={audioSrc}/>}
    <header style={{display:'flex',justifyContent:'space-between',gap:24,color:'#a5b8d4',fontSize:16,letterSpacing:2}}><span>VIDSPROUT · LEARN</span><span>{String(index+1).padStart(2,'0')} / {String(plan.scenes.length).padStart(2,'0')}</span></header>
    <div style={{flex:1,display:'flex',flexDirection:wide?'row':'column',alignItems:'center',justifyContent:'center',gap:wide?40:24,opacity}}>
      <div style={{width:wide?'51%':'100%'}}><div style={{color:'#83c7ff',fontSize:18,marginBottom:18}}>{plan.title}</div><h1 style={{fontSize:wide?46:52,lineHeight:1.12,letterSpacing:-1.8,margin:'0 0 22px'}}>{scene.title}</h1><p style={{fontSize:wide?25:29,lineHeight:1.45,color:'#d1dbea',margin:0}}>{scene.text}</p></div>
      <svg width={wide?500:540} height={wide?400:350} viewBox="0 0 500 350" aria-hidden="true">
        <circle cx="250" cy="175" r="150" fill="#172a42"/>
        {['earth','orbit','fall'].includes(scene.symbol)?<>
          <ellipse cx="250" cy="175" rx="205" ry="88" stroke="#446589" strokeWidth="2" fill="none" transform="rotate(-18 250 175)"/>
          <circle cx="250" cy="175" r="78" fill="#338fd1"/><path d="M210 115 Q245 100 250 135 L225 160 L245 190 L220 220 L190 185Z M275 175 L309 165 L317 210 L283 238 L265 210Z" fill="#82c5a6"/>
          <circle cx={scene.symbol==='fall'?250:250+Math.cos(frame*.025)*180} cy={scene.symbol==='fall'?45+(frame%80)/80*45:175+Math.sin(frame*.025)*95} r="15" fill="#f4d58b"/>
          <text x="250" y="320" fill="#b6c9df" textAnchor="middle" fontSize="18">Attraction toward the center</text>
        </>:['plant','sun'].includes(scene.symbol)?<>
          <circle cx="380" cy="65" r="30" fill="#f4d58b"/>
          <path d="M250 285 Q240 190 250 115" stroke="#a4d6a6" strokeWidth="7" fill="none"/>
          <path d="M247 210 Q155 205 170 130 Q240 135 247 210" fill="#62b993"/><path d="M248 170 Q335 170 330 95 Q260 100 248 170" fill="#a4d6a6"/>
          <ellipse cx="250" cy="290" rx="95" ry="9" fill="#36556c"/>
          {[0,1,2].map(i=><circle key={i} cx={365-(frame+i*22)%100} cy={90+(frame+i*22)%100} r="4" fill="#f4d58b" opacity=".7"/>)}
          <text x="250" y="325" fill="#b6c9df" textAnchor="middle" fontSize="18">Light energy supports life</text>
        </>:['water','vapor','energy'].includes(scene.symbol)?<>
          <path d="M90 190 Q170 175 250 190 T410 190 V290 H90Z" fill="#287da6"/><path d="M90 190 Q170 175 250 190 T410 190" stroke="#7de3e4" strokeWidth="3" fill="none"/>
          {Array.from({length:15},(_,i)=><circle key={i} cx={115+i%5*65+Math.sin(frame*.08+i)*8} cy={215+Math.floor(i/5)*25+Math.cos(frame*.07+i)*6} r="6" fill="#b5f1ed"/>)}
          {scene.symbol!=='water'&&[0,1,2,3].map(i=>{const p=((frame+i*30)%120)/120;return <circle key={i} cx={155+i*60} cy={185-p*130} r="5" opacity={Math.sin(p*Math.PI)} fill="#b5f1ed"/>})}
          <text x="250" y="325" fill="#b6c9df" textAnchor="middle" fontSize="17">Molecules shown schematically</text>
        </>:<>
          {[0,1,2,3,4].map(i=>{const a=i*Math.PI*2/5+frame*.006;return <g key={i}><line x1="250" y1="175" x2={250+Math.cos(a)*115} y2={175+Math.sin(a)*115} stroke="#4b709b" strokeWidth="2"/><circle cx={250+Math.cos(a)*115} cy={175+Math.sin(a)*115} r="14" fill="#83c7ff"/></g>})}
          <circle cx="250" cy="175" r="48" fill="#3e79c4"/><text x="250" y="188" textAnchor="middle" fill="white" fontSize="38">{index+1}</text>
        </>}
      </svg>
    </div>
    <footer style={{color:'#a5b8d4',fontSize:14}}>{audioSrc?'Narration · elevenlabs.io':'Silent lesson · Read at your own pace'}<div style={{height:4,background:'#29405c',marginTop:18}}><div style={{height:4,background:'#83c7ff',width:`${(frame+1)/durationInFrames*100}%`}}/></div></footer>
  </AbsoluteFill>;
}
