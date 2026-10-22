import { configuration } from '@/lib/config';
import { Workspace } from '@/components/workspace';
export const dynamic = 'force-dynamic';
export default function Home() {
  const {authentication, renderReady, preview} = configuration();
  return <Workspace config={{authentication, renderReady, preview}} />;
}
