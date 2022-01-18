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

const BUCKET_NAME = 'web-stories-wp-cdn-assets';

export const handleCdnRequests = functions.https.onRequest(
  async (request, response) => {
    functions.logger.info('Hello logs!', { structuredData: true });

    // "/static/123/images/path/to/image.png" => "123/images/path/to/image.png".
    const match = request.path.match(/staticnew\/(.*)/);

    if (!match) {
      response.status(404).send();
      return;
    }

    const [, requestedPath] = match;

    try {
      const bucket = admin.storage().bucket(BUCKET_NAME);
      const file = bucket.file(requestedPath);

      if ((await file.exists()) && (await file.isPublic())) {
        response.redirect(file.publicUrl());
        return;
      }
    } catch {
      response.status(404).send();
      return;
    }

    response.status(404).send();
  }
);
