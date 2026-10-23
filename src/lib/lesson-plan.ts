import { z } from 'zod';

export const lessonInput = z.object({
  requestKey:z.string().uuid(), topic:z.enum(['evaporation','photosynthesis','gravity','custom']),
  title:z.string().trim().max(80).default(''), notes:z.string().trim().max(1200).default(''),
  orientation:z.enum(['vertical','landscape']), narration:z.enum(['male','silent']),
}).strict();
export type LessonInput=z.infer<typeof lessonInput>;
export type LessonScene={title:string;text:string;symbol:string};
export type LessonPlan={title:string;scenes:LessonScene[];source:'prepared'|'notes'};
const lessons:Record<string,LessonPlan>={
  evaporation:{title:'How evaporation works',source:'prepared',scenes:[
    {title:'Where did the puddle go?',text:'Liquid water can turn into an invisible gas called water vapor. This is evaporation.',symbol:'water'},
    {title:'Molecules keep moving',text:'Water molecules are always moving. Energy from the surroundings can help them escape.',symbol:'energy'},
    {title:'Escape at the surface',text:'Some faster moving molecules escape from the surface of the liquid and enter the air as water vapor.',symbol:'vapor'},
    {title:'No boiling needed',text:'Warmth, moving air, and drier air generally help water evaporate faster. Evaporation does not require boiling.',symbol:'evaporation-heat'},
  ]},
  photosynthesis:{title:'How photosynthesis works',source:'prepared',scenes:[
    {title:'Plants make their own food',text:'Plants use energy from sunlight to make sugars. This process is called photosynthesis.',symbol:'plant'},
    {title:'Gather the ingredients',text:'Roots absorb water. Carbon dioxide enters leaves through tiny openings called stomata.',symbol:'water'},
    {title:'Capture light energy',text:'Chlorophyll in chloroplasts absorbs light. This energy helps the plant turn water and carbon dioxide into sugars.',symbol:'sun'},
    {title:'Food for growth',text:'The plant uses sugars for energy and growth. Oxygen is released as a byproduct of photosynthesis.',symbol:'plant'},
  ]},
  gravity:{title:'How gravity works',source:'prepared',scenes:[
    {title:'Why do things fall?',text:'Gravity is an attraction between objects with mass. Earth attracts objects toward its center.',symbol:'earth'},
    {title:'Mass and distance matter',text:'More mass means stronger gravitational attraction. Greater distance makes the attraction weaker.',symbol:'orbit'},
    {title:'A falling ball',text:'When you release a ball, gravity pulls it downward. Air resistance can affect how quickly different objects fall.',symbol:'fall'},
    {title:'Gravity beyond Earth',text:'Gravity also helps keep the Moon in orbit around Earth, and the planets in orbit around the Sun.',symbol:'orbit'},
  ]},
};
export function buildLesson(input:LessonInput):LessonPlan {
  if(input.topic!=='custom') return structuredClone(lessons[input.topic]);
  const lines=input.notes.split(/\r?\n/).map(s=>s.trim()).filter(Boolean);
  if(!input.title || lines.length<3 || lines.length>5 || lines.some(s=>s.length>240) || input.notes.split(/\s+/).length>140) {
    throw new Error('Add a title and 3–5 short lines of lesson notes (up to 240 characters per line and 140 words total).');
  }
  return {title:input.title,source:'notes',scenes:lines.map((text,i)=>({title:`${i===0?'Discover':i===lines.length-1?'Remember':'Explore'} · ${input.title}`,text,symbol:'idea'}))};
}
export function speechTimeline(plan:LessonPlan,alignment:{characters:string[];character_start_times_seconds:number[];character_end_times_seconds:number[]}) {
  const text=plan.scenes.map(s=>s.text).join(' ');
  if(alignment.characters.join('')!==text || alignment.character_start_times_seconds.length!==text.length || alignment.character_end_times_seconds.length!==text.length) throw new Error('Speech alignment does not match the lesson.');
  let offset=0;
  const starts=plan.scenes.map(s=>{const start=alignment.character_start_times_seconds[offset];offset+=s.text.length+1;return start;});
  const duration=alignment.character_end_times_seconds.at(-1)!+1;
  if(!Number.isFinite(duration)||duration<=0||duration>90 || starts.some((s,i)=>!Number.isFinite(s)||s<0||s>=duration||(i>0&&s<=starts[i-1]))) throw new Error('Speech timing is outside the supported bounds.');
  return {starts,duration};
}
export function silentTimeline(plan:LessonPlan) {
  let duration=0;
  const starts=plan.scenes.map(s=>{const start=duration;duration+=Math.max(4,s.text.split(/\s+/).length/2.5+1);return start;});
  if(duration>90) throw new Error('Please use shorter lesson notes.');
  return {starts,duration};
}
