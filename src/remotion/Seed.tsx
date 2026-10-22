import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig, spring } from 'remotion';
export function Seed() {
  const frame=useCurrentFrame(); const {fps,width,height}=useVideoConfig();
  const scene=Math.min(2,Math.floor(frame/120)); const local=frame-scene*120;
  const appear=spring({frame:local,fps,config:{damping:18}});
  const fade=interpolate(local,[0,10,105,119],[0,1,1,0],{extrapolateLeft:'clamp',extrapolateRight:'clamp'});
  const landscape=width>height; const size=landscape?270:360;
  const titles=['Every great thing\nstarts small.','Give your idea\nroom to grow.','Let what you know\nreach someone new.'];
  return <AbsoluteFill style={{background:'#eff2e5',fontFamily:'Arial, sans-serif',color:'#33523b',padding:landscape?60:70,justifyContent:'space-between'}}>
    <div style={{display:'flex',justifyContent:'space-between',fontSize:landscape?14:17,letterSpacing:3,color:'#80926d'}}><span>VIDSPROUT.AI</span><span>RENDER TEST · {scene+1} / 3</span></div>
    <div style={{opacity:fade,display:'flex',flexDirection:landscape?'row':'column',alignItems:'center',justifyContent:'center',gap:landscape?80:50,transform:`translateY(${(1-appear)*25}px)`}}>
      <svg width={size} height={size} viewBox="0 0 300 300" aria-hidden="true"><circle cx="150" cy="150" r="140" fill="#e5ebd8"/><ellipse cx="150" cy="252" rx="70" ry="8" fill="#d2dcc1"/><path d="M150 250 Q145 180 150 100" stroke="#6e8b50" strokeWidth="7" fill="none" style={{strokeDasharray:180,strokeDashoffset:180*(1-appear)}}/><path d="M149 180 Q60 180 70 100 Q150 95 149 180" fill="#93ac70" transform={`translate(150 180) scale(${appear}) translate(-150 -180)`}/><path d="M150 145 Q230 140 230 65 Q155 65 150 145" fill="#b5c991" transform={`translate(150 145) scale(${appear}) translate(-150 -145)`}/>{scene===2 && <><circle cx="70" cy="55" r="7" fill="#cfb95f"/><circle cx="250" cy="200" r="5" fill="#cfb95f"/></>}</svg>
      <div><h1 style={{fontSize:landscape?55:58,fontWeight:500,lineHeight:1.15,letterSpacing:-2,whiteSpace:'pre-line',textAlign:landscape?'left':'center',margin:0}}>{titles[scene]}</h1><p style={{fontSize:landscape?18:20,color:'#889978',textAlign:landscape?'left':'center',marginTop:24}}>Your ideas. Your voice. Your videos.</p></div>
    </div>
    <div style={{display:'flex',gap:8}}>{[0,1,2].map(index=><div key={index} style={{height:4,background:index<=scene?'#79945d':'#d7dfca',flex:1,borderRadius:3}}/>)}</div>
  </AbsoluteFill>;
}
