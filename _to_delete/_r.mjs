import { readFileSync } from "node:fs";
const env=Object.fromEntries(readFileSync(".env","utf8").split(/\r?\n/).map(l=>l.match(/^([A-Z0-9_]+)=(.*)$/)).filter(Boolean).map(m=>[m[1],m[2].replace(/^["']|["']$/g,"")]));
const H={Authorization:`Bearer ${env.DATOCMS_ADMIN_TOKEN}`,Accept:"application/json","Content-Type":"application/vnd.api+json","X-Api-Version":"3"};
const r=await (await fetch("https://site-api.datocms.com/roles",{headers:H})).json();
for(const x of r.data) console.log(x.id,x.attributes.name,JSON.stringify(x.attributes.positive_item_type_permissions));
