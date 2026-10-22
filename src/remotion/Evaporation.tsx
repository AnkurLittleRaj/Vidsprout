import { AbsoluteFill, Audio, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';

const scenes = [
  {title:'Where did the puddle go?',text:'Liquid water can turn into an invisible gas called water vapor.',label:'01 / LIQUID → GAS'},
  {title:'Energy keeps water moving.',text:'Water molecules are always moving. Energy from the surroundings can help them escape.',label:'02 / MOLECULES IN MOTION'},
  {title:'Escape happens at the surface.',text:'Some faster-moving molecules leave the liquid and enter the air as water vapor.',label:'03 / SURFACE ESCAPE'},
  {title:'A puddle dries. Water travels.',text:'Warmth, moving air and drier air generally help water evaporate faster. No boiling needed.',label:'04 / EVERYDAY SCIENCE'},
];
export function Evaporation({audioSrc,sceneStarts=[0,6,12,18]}:{audioSrc?:string;sceneStarts?:number[]}) {
  const frame=useCurrentFrame();const {width,height,fps,durationInFrames}=useVideoConfig();const wide=width>height;
  const scene=Math.max(0,Math.min(3,sceneStarts.findLastIndex(start=>frame>=Math.floor(start*fps))));
  const local=frame-Math.floor(sceneStarts[scene]*fps);const copy=scenes[scene];
  const appear=interpolate(local,[0,12],[0,1],{extrapolateRight:'clamp'});
  const sceneFrames=(scene===3?durationInFrames:Math.floor(sceneStarts[scene+1]*fps))-Math.floor(sceneStarts[scene]*fps);
  const level=scene===3?interpolate(local,[0,Math.max(1,sceneFrames-1)],[278,335],{extrapolateRight:'clamp'}):278;
  return <AbsoluteFill style={{background:'#092b39',color:'#f4f2dc',fontFamily:'Arial, sans-serif',padding:wide?50:54}}>
    {audioSrc && <Audio src={audioSrc}/>}
    <div style={{display:'flex',justifyContent:'space-between',fontSize:16,letterSpacing:3,color:'#9ab9b8'}}><span>VIDSPROUT · SCIENCE</span><span>EVAPORATION</span></div>
    <div style={{display:'flex',flex:1,alignItems:'center',justifyContent:'center',flexDirection:wide?'row':'column',gap:wide?42:30}}>
      <div style={{width:wide?485:'100%',opacity:appear}}><div style={{fontSize:17,color:'#f1c677',letterSpacing:2,marginBottom:24}}>{copy.label}</div><h1 style={{fontSize:wide?54:60,lineHeight:1.08,letterSpacing:-2,margin:'0 0 24px'}}>{copy.title}</h1><p style={{fontSize:wide?25:28,lineHeight:1.45,color:'#b8d1cf',margin:0}}>{copy.text}</p></div>
      <svg width={wide?560:610} height={wide?440:490} viewBox="0 0 600 470">
        <defs><linearGradient id="water" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#48c0d0"/><stop offset="1" stopColor="#167b9f"/></linearGradient><clipPath id="pool"><rect x="55" y={level} width="490" height={390-level} rx="12"/></clipPath></defs>
        <circle cx="495" cy="72" r="35" fill="#f4c878"/>
        {Array.from({length:8},(_,i)=>{const angle=i*Math.PI/4;return <line key={i} x1={495+Math.cos(angle)*46} y1={72+Math.sin(angle)*46} x2={495+Math.cos(angle)*57} y2={72+Math.sin(angle)*57} stroke="#f4c878" strokeWidth="3"/>;})}
        <text x="55" y="65" fill="#b8d1cf" fontSize="19">AIR</text>
        <rect x="55" y={level} width="490" height={390-level} rx="12" fill="url(#water)"/>
        <line x1="55" x2="545" y1={level} y2={level} stroke="#9ce9e5" strokeWidth="3"/>
        <g clipPath="url(#pool)">{Array.from({length:32},(_,i)=>{
          const x=75+(i%8)*63+Math.sin(frame*.07+i*3)*10;const y=296+Math.floor(i/8)*25+Math.cos(frame*.09+i)*7;
          return <circle key={i} cx={x} cy={y} r="5" fill="#d1f6ed" opacity=".8"/>;
        })}</g>
        {Array.from({length:7},(_,i)=>{const p=((frame+i*29)%150)/150;const x=105+i*61+Math.sin(p*6+i)*14;const y=level-p*190;return <g key={i} opacity={Math.sin(p*Math.PI)*.85}><path d={`M${x} ${y+28} l0 -14 m-4 5 l4 -5 l4 5`} stroke="#d4efcb" strokeWidth="2" fill="none"/><circle cx={x} cy={y} r="5" fill="#d4efcb"/></g>;})}
        <path d="M45 270 V400 H555 V270" fill="none" stroke="#5d929b" strokeWidth="4"/>
        <text x="300" y="432" fill="#b8d1cf" fontSize="18" textAnchor="middle">Dots represent molecules · vapor itself is invisible</text>
      </svg>
    </div>
    <div style={{display:'flex',alignItems:'center',gap:18}}><span style={{fontSize:16,color:'#9ab9b8'}}>{audioSrc?'NARRATION · elevenlabs.io':'LIQUID WATER → WATER VAPOR'}</span><div style={{flex:1,height:4,background:'#28505b'}}><div style={{height:4,width:`${(frame+1)/durationInFrames*100}%`,background:'#f4c878'}}/></div></div>
  </AbsoluteFill>;
}
