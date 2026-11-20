import { readFileSync } from "node:fs";
const env=Object.fromEntries(readFileSync(".env","utf8").split(/\r?\n/).map(l=>l.match(/^([A-Z0-9_]+)=(.*)$/)).filter(Boolean).map(m=>[m[1],m[2].replace(/^["']|["']$/g,"")]));
const q=`{ items: allResources(locale: en, fallbackLocales: [uk], first: 100, orderBy: position_ASC) { slug title cover { url } category { title position } _allFileLocales { locale value { size format } } } f: resource(locale: el, filter:{slug:{eq:"marketynh"}}) { file { url } } }`;
const r=await fetch("https://graphql.datocms.com/",{method:"POST",headers:{Authorization:`Bearer ${env.DATOCMS_API_TOKEN}`,"Content-Type":"application/json","X-Exclude-Invalid":"true"},body:JSON.stringify({query:q})});
console.log(JSON.stringify(await r.json(),null,1).slice(0,2500));
