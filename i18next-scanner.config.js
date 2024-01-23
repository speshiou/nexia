const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
// Naming rules of language codes, see https://github.com/i18next/i18next/issues/1015
const supportedLocales = require('./locales.json');
const supportedLangCodes = Object.keys(supportedLocales);
const srcDir = "dictionaries"


if (!fs.existsSync(srcDir)) {
  fs.mkdirSync(srcDir, { recursive: true });
  console.log('Directory created:', srcDir);
}

const doNotTranslate = [
  "{{val, number}}",
];

module.exports = {
  input: [
    'app/**/*.{js,jsx,ts,tsx}',
    // Use ! to filter out files or directories
    '!**/node_modules/**',
  ],
  output: './',
  options: {
    debug: true,
    func: {
      list: ['i18next.t', 'i18n.t', '_', 't'],
      extensions: ['.js', '.jsx', '.ts', 'tsx']
    },
    trans: {
      component: 'Trans',
      i18nKey: 'i18nKey',
      defaultsKey: 'defaults',
      extensions: ['.js', '.jsx'],
      fallbackKey: function (ns, value) {
        return value;
      },

      // https://react.i18next.com/latest/trans-component#usage-with-simple-html-elements-like-less-than-br-greater-than-and-others-v10.4.0
      supportBasicHtmlNodes: true, // Enables keeping the name of simple nodes (e.g. <br/>) in translations instead of indexed keys.
      keepBasicHtmlNodesFor: ['br', 'strong', 'i', 'p'], // Which nodes are allowed to be kept in translations during defaultValue generation of <Trans>.

      // https://github.com/acornjs/acorn/tree/master/acorn#interface
      acorn: {
        ecmaVersion: 2020,
        sourceType: 'module', // defaults to 'module'
      }
    },
    lngs: supportedLangCodes,
    ns: [
      'resource',
    ],
    defaultLng: 'en',
    defaultNs: 'resource',
    defaultValue: function (lng, ns, key) {
      if (lng === 'en' || doNotTranslate.indexOf(key) == 0) {
        // Return key as the default value for English language
        return key;
      }

      // Return the string '__NOT_TRANSLATED__' for other languages
      return '__NOT_TRANSLATED__';
    },
    resource: {
      loadPath: path.join(srcDir, '{{lng}}/{{ns}}.json'),
      savePath: path.join(srcDir, '{{lng}}/{{ns}}.json'),
      jsonIndent: 2,
      lineEnding: '\n'
    },
    nsSeparator: false, // namespace separator
    keySeparator: false, // key separator
    interpolation: {
      prefix: '{{',
      suffix: '}}'
    },
    metadata: {},
    allowDynamicKeys: false,
  },
  transform: function customTransform(file, enc, done) {
    "use strict";
    const parser = this.parser;
    const content = fs.readFileSync(file.path, enc);
    let count = 0;

    parser.parseFuncFromString(content, { list: ['i18next._', 'i18next.__', '_', 't'] }, (key, options) => {
      parser.set(key, Object.assign({}, options, {
        nsSeparator: false,
        keySeparator: false
      }));
      ++count;
    });

    if (count > 0) {
      console.log(`i18next-scanner: count=${chalk.cyan(count)}, file=${chalk.yellow(JSON.stringify(file.relative))}`);
    }

    done();
  }
};

// Generate the dynamic content
const dictContent = supportedLangCodes.reduce((accumulator, langCode) => {
  return `${accumulator}  "${langCode}": () => import('./${langCode}/resource.json').then((module) => module.default),\n`;
}, '').trim();
const typeDefinition = "type Dictionary = () => Promise<{ [key: string]: string }>;"
const finalContent = `${typeDefinition}\n\nexport const dictionaries: { [key: string]: Dictionary } = {\n  ${dictContent}\n}`;

// Define the output file path
const outputFile = path.join(srcDir, 'resources.ts');

// Write the content to the output file
fs.writeFileSync(outputFile, finalContent);

console.log(`JSON file generated successfully: ${outputFile}`);

