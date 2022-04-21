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

const minify = require('html-minifier').minify;
const PurgeCSS = require('purgecss').PurgeCSS;
const csso = require('csso');

/**
 * Inlines the CSS.
 * Makes font display display-swap
 * Minifies and optimizes the JS
 * Optimizes HTML
 * Optimizes AMP
 */

const purifyCss = async (rawContent, outputPath) => {
  let content = rawContent;
  if (
    outputPath &&
    outputPath.endsWith('.html') &&
    !/data-style-override/.test(content)
  ) {
    let before = require('fs').readFileSync('css/main.css', {
      encoding: 'utf-8',
    });

    before = before.replace(/@font-face {/g, '@font-face {font-display:swap;');

    const purged = await new PurgeCSS().purge({
      content: [
        {
          raw: rawContent,
          extension: 'html',
        },
      ],
      css: [
        {
          raw: before,
        },
      ],
      extractors: [
        {
          extractor: require('purge-from-html').extract,
          extensions: ['html'],
        },
      ],
      fontFace: true,
      variables: true,
    });

    const after = csso.minify(purged[0].css).css;
    //console.log("CSS reduction", before.length - after.length);

    content = content.replace(
      '</head>',
      `<style amp-custom>${after}</style></head>`
    );
    content = content.replace('<style amp-custom></style>', '');
    content = content.replace('<style amp-custom=""></style>', '');
  }
  return content;
};

const minifyHtml = (rawContent, outputPath) => {
  let content = rawContent;
  if (outputPath && outputPath.endsWith('.html') && !isAmp(content)) {
    content = minify(content, {
      removeAttributeQuotes: true,
      collapseBooleanAttributes: true,
      collapseWhitespace: true,
      removeComments: true,
      sortClassName: true,
      sortAttributes: true,
      html5: true,
      decodeEntities: true,
      removeOptionalTags: true,
    });
  }
  return content;
};

module.exports = {
  initArguments: {},
  configFunction: (eleventyConfig) => {
    eleventyConfig.addTransform('purifyCss', purifyCss);
    eleventyConfig.addTransform('minifyHtml', minifyHtml);
  },
};

function isAmp(content) {
  return /<html amp/i.test(content);
}
