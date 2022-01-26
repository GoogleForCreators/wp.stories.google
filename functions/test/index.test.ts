/*
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const assert = require('assert');

const functionsTest = require('firebase-functions-test')({});
functionsTest.mockConfig({ assets: { versions: { latest: '456' } } });

const { handleCdnRequests, BUCKET_URL } = require('../src/index');

describe('handleCdnRequests', () => {
  it('returns 404 if there is no match', (done) => {
    const req = { path: '/soem/other/path' };
    const res = {
      status: (code) => {
        assert.equal(code, 404);
        done();
      },
    };

    handleCdnRequests(req, res);
  });

  it('redirects specific versions as-is', (done) => {
    const req = { path: '/static/123/foo/bar' };
    const res = {
      redirect: (url, code) => {
        assert.equal(code, 302);
        assert.equal(url, `${BUCKET_URL}/123/foo/bar`);
        done();
      },
    };

    handleCdnRequests(req, res);
  });

  it('redirects main to latest version', (done) => {
    const req = { path: '/static/main/foo/bar' };
    const res = {
      redirect: (url, code) => {
        assert.equal(code, 302);
        assert.equal(url, `${BUCKET_URL}/456/foo/bar`);
        done();
      },
    };

    handleCdnRequests(req, res);
  });

  it('returns 404 if there is no latest version', (done) => {
    functionsTest.mockConfig({});

    const req = { path: '/static/main/foo/bar' };
    const res = {
      status: (code) => {
        assert.equal(code, 404);
        done();
      },
    };

    handleCdnRequests(req, res);
  });
});
