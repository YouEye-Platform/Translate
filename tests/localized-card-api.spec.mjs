import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import {createTranslator} from 'next-intl';
const root = new URL('../', import.meta.url);
function load(path, mocks) {
  const code = ts.transpileModule(readFileSync(new URL(path, root), 'utf8'), {compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
  const exports={};
  vm.runInNewContext(code,{exports,require(name){if(name in mocks)return mocks[name];throw new Error('Unexpected dependency: '+name)},URL,Request,Response,Intl,process:{env:{}}});
  return exports;
}
for(const locale of ['en','ru','es','de','fr']) test(`card API renders real ${locale} messages`, async()=>{
  const messages=JSON.parse(readFileSync(new URL('src/messages/'+locale+'.json',root),'utf8'));
  const intl={getLocale:async()=>locale,getTranslations:async namespace=>createTranslator({locale,messages,namespace})};
  const next={NextResponse:{json:body=>Response.json(body)}};
  const {GET}=load('src/app/api/cards/translation-preview/route.ts',{
    'next-intl/server':intl,'next/server':next,
    '@/lib/auth':{getSession:async()=>({userId:'actor'})},
    '@/lib/db/client':{getOne:async()=>({source_lang:'en',target_lang:'es',source_text:'<script> & draft',translated_text:'Hola'})},
    '@/lib/db/migrate':{runMigrations:async()=>{}},'@/lib/translate/languages':{getLanguageName:x=>x},
  });
  const response=await GET(new Request('https://app.example/api/cards/translation-preview'));
  const body=await response.json();
  assert.equal(body.action.label,({en:'Open Translate',ru:'Открыть переводчик',es:'Abrir Traducir',de:'Übersetzer öffnen',fr:'Ouvrir Traduire'})[locale]);
  assert.equal(body.title,`${new Intl.DisplayNames([locale],{type:'language'}).of('en')} → ${new Intl.DisplayNames([locale],{type:'language'}).of('es')}`);
  assert.ok(body.body.includes('<script> & draft')); // JSON text remains data.

});
