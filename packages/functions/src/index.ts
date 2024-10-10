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

import * as express from 'express';

const {onRequest} = require("firebase-functions/https");
const {info} = require("firebase-functions/logger");

// Use global variables to reuse objects in future invocations
// See https://firebase.google.com/docs/functions/tips#use_global_variables_to_reuse_objects_in_future_invocations
const BUCKET_NAME = 'web-stories-wp-cdn-assets';
export const BUCKET_URL = `https://storage.googleapis.com/${BUCKET_NAME}`;

/**
 * Handle incoming requests to wp.stories.google/static/main/:path
 *
 * Redirects them to the GCP bucket for the latest version,
 * which is set via the .env file.
 */
export const handleCdnRequests = onRequest({
    minInstances: 1,
  }, (request: express.Request, response: express.Response) => {
    info('Serving for requested path', request.path);

    // "/static/123/images/path/to/image.png" => "123", "images/path/to/image.png".
    const match = request.path.match(/static\/(main|\d+)\/(.+)/);

    if (!match) {
      response.status(404).send();
      return;
    }

    const [, version, fileName] = match;

    if ('main' === version) {
      const latestVersion = process.env.LATEST_ASSETS_VERSION;

      info('Latest version from .env file:', latestVersion);

      if (latestVersion) {
        response.redirect(302, `${BUCKET_URL}/${latestVersion}/${fileName}`);
        return;
      }
    } else {
      response.redirect(302, `${BUCKET_URL}/${version}/${fileName}`);
      return;
    }

    response.status(404).send();
  });
