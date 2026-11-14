const MAX_BYTES = 8 * 1024 * 1024;
const ALLOWED = new Map([["image/jpeg","jpg"],["image/png","png"],["image/webp","webp"]]);
const SECURITY_HEADERS = {
  "X-Content-Type-Options":"nosniff",
  "Referrer-Policy":"no-referrer",
  "Cache-Control":"no-store"
};
function json(data, status=200, headers={}) {
  return new Response(JSON.stringify(data), {status,headers:{"Content-Type":"application/json; charset=utf-8",...SECURITY_HEADERS,...headers}});
}
function cors(env) {return {"Access-Control-Allow-Origin":env.SITE_ORIGIN || "https://seth-oracle.github.io","Access-Control-Allow-Methods":"GET,POST,OPTIONS","Access-Control-Allow-Headers":"Authorization,Content-Type","Vary":"Origin"};}
function authorized(req, env) {
  const token=env.ADMIN_TOKEN;
  if(!token || token.length<24) return false;
  const supplied=(req.headers.get("Authorization")||"").replace(/^Bearer\s+/i,"");
  if(supplied.length!==token.length) return false;
  let diff=0; for(let i=0;i<token.length;i++)diff|=supplied.charCodeAt(i)^token.charCodeAt(i);
  return diff===0;
}
function allowedOrigin(req,env) {
  const origin=req.headers.get("Origin");
  return !origin || origin === (env.SITE_ORIGIN || "https://seth-oracle.github.io");
}
async function getReviewPhotos(env,id) {
  const r=await env.DB.prepare("SELECT photos_json FROM reviews WHERE id=?").bind(id).first();
  if(!r)return [];
  try{return JSON.parse(r.photos_json)||[];}catch{return [];}
}
export default {
 async fetch(req,env) {
  const url=new URL(req.url),path=url.pathname.replace(/\/+$/,"")||"/";
  const corsHeaders=cors(env);
  if(req.method==="OPTIONS")return new Response(null,{status:204,headers:{...corsHeaders,"Access-Control-Max-Age":"600"}});
  if(!allowedOrigin(req,env))return json({error:"Origin not allowed"},403,corsHeaders);
  try{
   if(req.method==="GET"&&path==="/api/reviews"){
    const r=await env.DB.prepare("SELECT id,nickname,rating,content,photos_json,reviewed_at FROM reviews WHERE status='approved' ORDER BY display_order ASC, reviewed_at DESC LIMIT 200").all();
    return json({reviews:r.results.map(x=>({...x,photos:JSON.parse(x.photos_json||"[]").map(p=>"/api/photo/"+encodeURIComponent(x.id)+"/"+encodeURIComponent(p.key))}))},200,corsHeaders);
   }
   const matchPhoto=path.match(/^\/api\/photo\/([a-z0-9-]+)\/([a-z0-9-]+\.(?:jpg|png|webp))$/i);
   if(req.method==="GET"&&matchPhoto){
    const [,id,name]=matchPhoto;
    const row=await env.DB.prepare("SELECT photos_json,status FROM reviews WHERE id=?").bind(id).first();
    if(!row)return new Response("Not found",{status:404});
    if(row.status!=="approved"&&!authorized(req,env))return new Response("Not found",{status:404});
    const photos=JSON.parse(row.photos_json||"[]");
    const found=photos.find(p=>p.key===name);
    if(!found)return new Response("Not found",{status:404});
    const photo=await env.PHOTOS.get(id+"/"+name);
    if(!photo)return new Response("Not found",{status:404});
    return new Response(photo.body,{headers:{"Content-Type":found.type,"X-Content-Type-Options":"nosniff","Cache-Control":"public,max-age=3600",...corsHeaders}});
   }
   if(req.method==="POST"&&path==="/api/submissions"){
    // A short-lived Cloudflare rate limiting rule/Turnstile is recommended before production.
    const type=req.headers.get("content-type")||"";
    if(!type.includes("multipart/form-data"))return json({error:"Use multipart form data"},415,corsHeaders);
    const form=await req.formData();
    const nickname=String(form.get("nickname")||"").trim();
    const content=String(form.get("content")||"").trim();
    const rating=Number(form.get("rating"));
    const consent=form.get("consent")==="yes";
    const honeypot=String(form.get("website")||"").trim();
    if(honeypot)return json({ok:true},200,corsHeaders);
    if(!consent||nickname.length<1||nickname.length>30||content.length<10||content.length>1000||!Number.isInteger(rating)||rating<1||rating>5)return json({error:"投稿欄位不完整或超過長度限制"},400,corsHeaders);
    const files=form.getAll("photos").filter(f=>f instanceof File && f.size>0);
    if(files.length>20)return json({error:"單次最多上傳 20 張。可分次投稿其他照片。"},400,corsHeaders);
    if(files.some(f=>f.size>MAX_BYTES||!ALLOWED.has(f.type)))return json({error:"每張照片須為 JPG、PNG 或 WebP 且不超過 8MB"},400,corsHeaders);
    const id=crypto.randomUUID();
    const photos=[];
    try{
      for(const f of files){
        const name=crypto.randomUUID()+"."+ALLOWED.get(f.type);
        await env.PHOTOS.put(id+"/"+name,await f.arrayBuffer(),{httpMetadata:{contentType:f.type}});
        photos.push({key:name,type:f.type});
      }
      await env.DB.prepare("INSERT INTO reviews (id,nickname,rating,content,photos_json) VALUES (?,?,?,?,?)").bind(id,nickname,rating,content,JSON.stringify(photos)).run();
    }catch(e){
      await Promise.all(photos.map(p=>env.PHOTOS.delete(id+"/"+p.key).catch(()=>{})));
      throw e;
    }
    return json({ok:true,message:"投稿已送交審核，發布前不會公開。"},201,corsHeaders);
   }
   if(path.startsWith("/api/admin/")){
     if(!authorized(req,env))return json({error:"未授權"},401,corsHeaders);
     if(req.method==="GET"&&path==="/api/admin/submissions"){
       const rows=await env.DB.prepare("SELECT id,nickname,rating,content,status,photos_json,submitted_at,reviewed_at FROM reviews ORDER BY CASE status WHEN 'pending' THEN 0 WHEN 'approved' THEN 1 ELSE 2 END, submitted_at DESC LIMIT 300").all();
       return json({reviews:rows.results.map(x=>({...x,photos:JSON.parse(x.photos_json||"[]").map(p=>"/api/photo/"+encodeURIComponent(x.id)+"/"+encodeURIComponent(p.key))}))},200,corsHeaders);
     }
     const match=path.match(/^\/api\/admin\/([a-z0-9-]+)\/(approve|reject|pending)$/);
     if(req.method==="POST"&&match){
       const [,id,action]=match;
       const status={approve:"approved",reject:"rejected",pending:"pending"}[action];
       const result=await env.DB.prepare("UPDATE reviews SET status=?,reviewed_at=datetime('now') WHERE id=?").bind(status,id).run();
       return json({ok:true,changed:result.meta.changes||0},200,corsHeaders);
     }
   }
   return json({error:"Not found"},404,corsHeaders);
  }catch(e){console.error("review-api error",e);return json({error:"系統暫時無法處理，請稍後重試"},500,corsHeaders);}
 }
};
