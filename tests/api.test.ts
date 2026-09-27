import { test } from 'node:test';
import assert from 'node:assert/strict';
import { GET as contentGet, POST as contentPost } from '../app/api/admin/content/route';
import { GET as historyGet } from '../app/api/admin/history/route';
import { GET as inboxGet } from '../app/api/admin/inquiries/route';
import { GET as mediaGet } from '../app/api/admin/media/route';
import { GET as exportGet } from '../app/api/admin/export/route';
import { POST as inquiryPost } from '../app/api/inquiries/route';

test('Unconfigured preview never authorizes protected backend reads or writes', {
  skip: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
}, async () => {
  for (const read of [contentGet, inboxGet, mediaGet, exportGet]) {
    assert.equal((await read()).status, 401);
  }
  assert.equal((await historyGet(new Request('http://localhost/api/admin/history'))).status, 401);
  assert.equal((await contentPost(new Request('http://localhost/api/admin/content', {
    method: 'POST', body: '{}', headers: {'Content-Type': 'application/json'},
  }))).status, 403);
  assert.equal((await inquiryPost(new Request('http://localhost/api/inquiries', {
    method: 'POST', body: '{}', headers: {'Content-Type': 'application/json'},
  }))).status, 503);
});
