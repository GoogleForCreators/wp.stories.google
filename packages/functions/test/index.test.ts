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

const {
  handleCdnRequestsV2: handleCdnRequests,
  BUCKET_URL,
} = require('../src/index');

describe('handleCdnRequests', () => {
  afterEach(() => {
    delete process.env.LATEST_ASSETS_VERSION;
  });

  it('returns 404 if there is no match', (done) => {
    const req = { path: '/some/other/path' };
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
      redirect: (code, url) => {
        assert.equal(code, 302);
        assert.equal(url, `${BUCKET_URL}/123/foo/bar`);
        done();
      },
    };

    handleCdnRequests(req, res);
  });

  it('redirects main to latest version', (done) => {
    process.env.LATEST_ASSETS_VERSION = '456';
    const req = { path: '/static/main/foo/bar' };
    const res = {
      redirect: (code, url) => {
        assert.equal(code, 302);
        assert.equal(url, `${BUCKET_URL}/456/foo/bar`);
        done();
      },
    };

    handleCdnRequests(req, res);
  });

  it('returns 404 if there is no latest version', (done) => {
    const req = { path: '/static/main/foo/bar' };
    const res = {
      status: (code) => {
        assert.equal(code, 404);
        done();
      },
    };

    handleCdnRequests(req, res);
  });

  it('returns 404 if no path is specified', (done) => {
    process.env.LATEST_ASSETS_VERSION = '456';
    const req = { path: '/static/main/' };
    const res = {
      status: (code) => {
        assert.equal(code, 404);
        done();
      },
    };

    handleCdnRequests(req, res);
  });
});
