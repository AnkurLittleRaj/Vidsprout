import test from 'node:test';
import assert from 'node:assert/strict';
import { localDnsServers } from '../src/lib/local-dns';
import { accountLessonOwner } from '../src/lib/lesson-identity';
import { validId } from '../src/lib/local-lessons';

test('DNS override is opt-in and never used in deployed environments', () => {
  assert.deepEqual(localDnsServers({}), []);
  assert.deepEqual(localDnsServers({NODE_ENV:'production',LOCAL_DNS_SERVERS:'1.1.1.1'}), []);
  assert.deepEqual(localDnsServers({VERCEL:'1',LOCAL_DNS_SERVERS:'1.1.1.1'}), []);
  assert.deepEqual(localDnsServers({LOCAL_DNS_SERVERS:'1.1.1.1, 8.8.8.8'}), ['1.1.1.1','8.8.8.8']);
  assert.throws(() => localDnsServers({LOCAL_DNS_SERVERS:'https://resolver.invalid'}));
  assert.throws(() => localDnsServers({LOCAL_DNS_SERVERS:'1.1.1.1,'}));
});
test('account library identity is stable, path-safe and distinct between users', () => {
  assert.equal(accountLessonOwner('user-a'),accountLessonOwner('user-a'));
  assert.notEqual(accountLessonOwner('user-a'),accountLessonOwner('user-b'));
  assert.ok(validId(accountLessonOwner('../untrusted')));
  assert.throws(() => accountLessonOwner(''));
});
