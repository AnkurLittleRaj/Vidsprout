import { Composition } from 'remotion';
import { Seed } from './Seed';
import { Evaporation } from './Evaporation';
export function Root() { return <><Composition id="SeedVertical" component={Seed} durationInFrames={360} fps={30} width={720} height={1280}/><Composition id="SeedLandscape" component={Seed} durationInFrames={360} fps={30} width={1280} height={720}/><Composition id="EvaporationVertical" component={Evaporation} durationInFrames={720} fps={30} width={720} height={1280}/><Composition id="EvaporationLandscape" component={Evaporation} durationInFrames={720} fps={30} width={1280} height={720}/></>; }
