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
const bucket = admin.storage().bucket(BUCKET_NAME);

// Simple cache so that Firebase *might* reuse these values
// in future invocations as well.
let fileUrlCache = new Map<string, string>();

// TODO: Consider runWith() with minInstances === 1 to limit number of cold starts.
// See https://firebase.google.com/docs/functions/manage-functions#min-max-instances
export const handleCdnRequests = functions.https.onRequest(
  async (request, response) => {
    functions.logger.info('Serving for requested path', request.path);

    // "/static/123/images/path/to/image.png" => "123/images/path/to/image.png".
    const match = request.path.match(/static\/(.*)/);

    if (!match) {
      response.status(404).send();
      return;
    }

    const [, requestedPath] = match;

    try {
      if (fileUrlCache.has(requestedPath)) {
        const cachedFileUrl = fileUrlCache.get(requestedPath);
        if (cachedFileUrl) {
          response.redirect(cachedFileUrl);
          return;
        }
      }

      const file = bucket.file(requestedPath);

      if ((await file.exists()) && (await file.isPublic())) {
        const fileUrl = file.publicUrl();
        fileUrlCache.set(requestedPath, fileUrl);
        response.redirect(fileUrl);
        return;
      }
    } catch {
      response.status(404).send();
      return;
    }

    response.status(404).send();
  }
);
