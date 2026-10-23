import { isIP } from 'node:net';
import { setServers, promises } from 'node:dns';

export function localDnsServers(env: Partial<NodeJS.ProcessEnv> = process.env): string[] {
  if (env.NODE_ENV === 'production' || env.VERCEL || !env.LOCAL_DNS_SERVERS) return [];
  const servers = env.LOCAL_DNS_SERVERS.split(',').map(value => value.trim());
  if (servers.length > 3 || servers.some(value => !isIP(value))) {
    throw new Error('LOCAL_DNS_SERVERS must contain up to three IP addresses');
  }
  return servers;
}

export function configureLocalDns() {
  const servers = localDnsServers();
  // Affects Node resolve* calls in this process only, never OS network settings.
  if (servers.length) {
    setServers(servers);
    promises.setServers(servers);
  }
}
