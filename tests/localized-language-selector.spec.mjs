import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import React from 'react';
import * as jsxRuntime from 'react/jsx-runtime';
import {renderToStaticMarkup} from 'react-dom/server';
import {createTranslator} from 'next-intl';

function load(file, mocks = {}) {
  const code = ts.transpileModule(readFileSync(new URL('../src/' + file, import.meta.url), 'utf8'), {
    compilerOptions: {module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2022},
  }).outputText;
  const exports = {};
  vm.runInNewContext(code, {exports, Intl, require(name) {
    if (name === 'react/jsx-runtime') return jsxRuntime;
    if (name in mocks) return mocks[name];
    throw new Error('Unexpected dependency ' + name);
  }});
  return exports;
}
const languages = load('lib/translate/languages.ts');
for (const locale of ['en', 'ru', 'es', 'de', 'fr']) test(`language selector renders ${locale} labels and retains language identities`, () => {
  const messages = JSON.parse(readFileSync(new URL('../src/messages/' + locale + '.json', import.meta.url)));
  const t = createTranslator({locale, messages, namespace: 'interface'});
  const names = new Intl.DisplayNames([locale], {type: 'language'});
  const primitive = ({children, value}) => React.createElement('div', {'data-language': value}, children);
  const select = Object.fromEntries(['Select','SelectContent','SelectItem','SelectTrigger','SelectValue'].map(name => [name, primitive]));
  const {LanguageSelector} = load('components/translate/language-selector.tsx', {
    'next-intl': {useLocale: () => locale, useTranslations: () => t},
    '@/lib/translate/languages': languages, '@/components/ui/select': select,
  });
  const html = renderToStaticMarkup(React.createElement(LanguageSelector, {value: 'en', onChange() {}, languages: languages.getSourceLanguages()}));
  assert.ok(html.includes(names.of('en')));
  assert.ok(html.includes(names.of('es')));
  assert.ok(html.includes(t('m89ebfb7a88ca')));
  assert.match(html, /data-language="en"/);
  assert.match(html, /data-language="es"/);
  assert.equal(languages.getLanguageName('not_a_language', locale), 'NOT_A_LANGUAGE');
});
