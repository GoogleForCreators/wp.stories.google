/*
 * Copyright 2020 Google LLC
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

/**
 * Provides the default CSP.
 * Inline scripts must have the `csp-hash` attribute to be allowed.
 */

function quote(str) {
  return `'${str}'`;
}

function serialize(csp) {
  return csp.map((src) => src.join(' ')).join(';');
}

const SELF = quote('self');

const CSP = {
  regular: serialize([
    // By default only talk to same-origin
    ['default-src', SELF],
    // No plugins
    ['object-src', quote('none')],
    // Script from same-origin and inline-hashes.
    [
      'script-src',
      SELF,
      /* Replaced by csp.js plugin */ 'HASHES',
      'blob:',
      'https://cdn.ampproject.org',
    ],
    // Inline CSS is allowed.
    ['style-src', quote('unsafe-inline')],
    // Images may also come from data-URIs.
    ['img-src', SELF, 'data:'],
  ]),
};

module.exports = () => CSP;
