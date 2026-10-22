import { existsSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import { loadEnvFile } from 'node:process';

if (existsSync('.env.local')) loadEnvFile('.env.local');
const paragraphs = [
  'Where did the puddle go? Liquid water can turn into an invisible gas called water vapor. This is evaporation.',
  'Water molecules are always moving. Energy from the surroundings can help them escape.',
  'Some faster moving molecules escape from the surface of the liquid and enter the air as water vapor.',
  'Warmth, moving air, and drier air generally help water evaporate faster. Evaporation does not require boiling.',
];
const text=paragraphs.join(' ');
const directory='.local-media/narration';
await mkdir(directory,{recursive:true});
await writeFile(`${directory}/evaporation-script.txt`,paragraphs.join('\n\n'));
if (!process.env.ELEVENLABS_API_KEY) {
  console.error('Narration script prepared. Add ELEVENLABS_API_KEY to .env.local; no audio was generated.');process.exit(1);
}
if (existsSync(`${directory}/evaporation-response.json`)) {
  console.error('A generation response already exists. Reuse it; no additional credits were spent.');process.exit(1);
}
const key=process.env.ELEVENLABS_API_KEY;
const headers={'xi-api-key':key,'Content-Type':'application/json'};
// Stop before synthesis unless the account is free and has enough included quota.
const subscription=await fetch('https://api.elevenlabs.io/v1/user/subscription',{headers,signal:AbortSignal.timeout(30000)});
if(!subscription.ok) throw new Error(`Cannot verify included quota (${subscription.status}); no synthesis requested.`);
const quota=await subscription.json();
if(quota.tier!=='free' || !Number.isFinite(quota.character_limit) || !Number.isFinite(quota.character_count) || quota.character_limit-quota.character_count<text.length) throw new Error('A free account with sufficient included quota is required for this POC command.');
const voice=process.env.ELEVENLABS_VOICE_ID || '21m00Tcm4TlvDq8ikWAM';
// One request, no automatic retries: an uncertain response may already consume credits.
const response=await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(voice)}/with-timestamps?output_format=mp3_44100_128`,{
  method:'POST',headers,signal:AbortSignal.timeout(120000),body:JSON.stringify({text,model_id:'eleven_multilingual_v2'}),
});
if(!response.ok) throw new Error(`Speech generation failed (${response.status}). No automatic retry was made.`);
const result=await response.json();
await writeFile(`${directory}/evaporation-response.json`,JSON.stringify(result));
const alignment=result.alignment;
if(!result.audio_base64 || !alignment || alignment.characters.join('')!==text) throw new Error('Audio response saved, but exact text alignment is unavailable. Review before rendering; do not regenerate.');
let offset=0;
const starts=paragraphs.map(paragraph=>{const seconds=alignment.character_start_times_seconds[offset];offset+=paragraph.length+1;return seconds;});
const ends=alignment.character_end_times_seconds;
const duration=ends[ends.length-1]+1;
if(!starts.every(Number.isFinite) || !Number.isFinite(duration) || duration<=0 || duration>90) throw new Error('Audio response saved, but timing exceeds the supported bounds.');
await writeFile(`${directory}/evaporation.mp3`,Buffer.from(result.audio_base64,'base64'));
await writeFile(`${directory}/evaporation-timing.json`,JSON.stringify({starts,duration,text,provider:'ElevenLabs',attribution:'elevenlabs.io'},null,2));
console.log(`Narration saved with scene timestamps (${duration.toFixed(1)}s). Next: render and verify the voiced preview.`);
