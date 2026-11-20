import { readFileSync } from "node:fs";
const env=Object.fromEntries(readFileSync(".env","utf8").split(/\r?\n/).map(l=>l.match(/^([A-Z0-9_]+)=(.*)$/)).filter(Boolean).map(m=>[m[1],m[2].replace(/^["']|["']$/g,"")]));
const API="https://site-api.datocms.com", model=env.DATOCMS_MODEL_DOWNLOAD_COUNTER;
const H={Authorization:`Bearer ${env.DATOCMS_FORMS_TOKEN}`,Accept:"application/json","Content-Type":"application/vnd.api+json","X-Api-Version":"3"};
const key="test · uk";
const q=new URLSearchParams({"filter[type]":model,"filter[fields][key][eq]":key,"page[limit]":"1"});
let r=await fetch(`${API}/items?${q}`,{headers:H}); console.log("read",r.status);
let item=(await r.json()).data?.[0];
r=item? await fetch(`${API}/items/${item.id}`,{method:"PUT",headers:H,body:JSON.stringify({data:{type:"item",id:item.id,attributes:{count:(item.attributes.count??0)+1,last_download:new Date().toISOString(),by_month:JSON.stringify({"2026-11":(item.attributes.count??0)+1})}}})})
 : await fetch(`${API}/items`,{method:"POST",headers:H,body:JSON.stringify({data:{type:"item",attributes:{key,count:1,last_download:new Date().toISOString(),by_month:JSON.stringify({"2026-11":1})},relationships:{item_type:{data:{type:"item_type",id:model}}}}})});
const j=await r.json(); console.log(item?"update":"create",r.status,JSON.stringify(j.data?.attributes??j).slice(0,300));
console.log("ID",j.data?.id);
