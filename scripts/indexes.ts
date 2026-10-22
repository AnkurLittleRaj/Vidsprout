import { client, ensureIndexes } from '../src/lib/db';
async function main() {
  try {await ensureIndexes();console.log('Database indexes ready.');}
  finally {await client().close();}
}
main().catch(()=>{console.error('Index setup failed. Check MongoDB connectivity and permissions.');process.exitCode=1;});
