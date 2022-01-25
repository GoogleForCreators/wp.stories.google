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

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

// Start writing Firebase Functions
// https://firebase.google.com/docs/functions/typescript

admin.initializeApp();

// Use global variables to reuse objects in future invocations
// See https://firebase.google.com/docs/functions/tips#use_global_variables_to_reuse_objects_in_future_invocations
const BUCKET_NAME = 'web-stories-wp-cdn-assets';
const BUCKET_URL = `https://storage.googleapis.com/${BUCKET_NAME}`;
const bucket = admin.storage().bucket(BUCKET_NAME);

let availableVersions: string[] = [];

/**
 * Handle incoming requests to wp.stories.google/static/:version/path/to/file.jpg
 *
 * If :version is "main", the latest version is retrieved and the user redirected
 * to that version.
 *
 * If :version is numeric, the user is redirected to the version's bucket unchanged.
 */
export const handleCdnRequests = functions
  .runWith({
    minInstances: 1,
  })
  .https.onRequest(async (request, response) => {
    functions.logger.info('Serving for requested path', request.path);

    // "/static/123/images/path/to/image.png" => "123", "images/path/to/image.png".
    const match = request.path.match(/static\/(main|\d+)\/(.*)/);

    if (!match) {
      response.status(404).send();
      return;
    }

    const [, version, fileName] = match;

    if ('main' !== version) {
      // TODO: Just achieve this with a regex redirect.
      response.redirect(`${BUCKET_URL}/static/${version}/${fileName}`);
      return;
    }

    if (!availableVersions.length) {
      const topLevelBucketFiles: String[] = (
        await bucket.getFiles({
          autoPaginate: false,
          delimiter: '/',
        })
      )[2].prefixes;

      if (!Array.isArray(topLevelBucketFiles)) {
        response.status(404).send();
        return;
      }

      availableVersions = topLevelBucketFiles
        .map((name) => name.replace('/', ''))
        .sort((a, b) => Number(a) - Number(b));
    }

    functions.logger.info('Available versions: ', availableVersions.join(', '));

    if (availableVersions.length) {
      const latestVersion = availableVersions.pop();
      functions.logger.info('Latest version: ', latestVersion);

      response.redirect(`${BUCKET_URL}/static/${latestVersion}/${fileName}`);
    }

    response.status(404).send();
  });
