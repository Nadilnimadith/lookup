import { sql } from "../_lib/db.js";
import { signSession,setSession } from "../_lib/auth.js";
export default async function handler(req,res){
 try{
  const u=new URL(req.url,`https://${req.headers.host}`);const code=u.searchParams.get("code");const state=u.searchParams.get("state");
  const cookie=req.headers.cookie||"";const saved=cookie.match(/lookup_oauth_state=([^;]+)/)?.[1];
  if(!code || !state || state!==saved)return res.status(400).send("OAuth state mismatch.");
  const tok=await fetch("https://oauth2.googleapis.com/token",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:new URLSearchParams({code,client_id:process.env.GOOGLE_CLIENT_ID,client_secret:process.env.GOOGLE_CLIENT_SECRET,redirect_uri:process.env.GOOGLE_REDIRECT_URI,grant_type:"authorization_code"})}).then(r=>r.json());
  if(!tok.access_token)return res.status(400).send("Google sign-in failed.");
  const profile=await fetch("https://openidconnect.googleapis.com/v1/userinfo",{headers:{Authorization:`Bearer ${tok.access_token}`}}).then(r=>r.json());
  if(!profile.email)return res.status(400).send("Google did not provide an email.");
  let urow=(await sql`select * from users where email=${profile.email.toLowerCase()} limit 1`)[0];
  if(!urow){
    const base=String(profile.name||profile.email.split("@")[0]).slice(0,24);
    const handle="@"+base.toLowerCase().replace(/[^a-z0-9_]/g,"").slice(0,20)+"_"+Math.floor(Math.random()*9999);
    urow=(await sql`insert into users(name,handle,email,avatar,google_sub) values(${base},${handle},${profile.email.toLowerCase()},${profile.picture||"https://i.pravatar.cc/100?img=12"},${profile.sub}) returning *`)[0];
  }else{
    urow=(await sql`update users set avatar=coalesce(${profile.picture||null},avatar),google_sub=coalesce(${profile.sub},google_sub) where id=${urow.id} returning *`)[0];
  }
  const stats=(await sql`select (select count(*) from follows where following_id=${urow.id}) followers,(select count(*) from follows where follower_id=${urow.id}) following,(select count(*) from posts where user_id=${urow.id}) posts`)[0];
  setSession(res,await signSession(urow.id));
  res.redirect(process.env.APP_URL||"/");
 }catch(e){console.error(e);res.status(500).send("Google sign-in is not configured correctly.")}
}
