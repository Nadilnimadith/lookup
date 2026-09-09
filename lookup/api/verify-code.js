import { sql } from "../_lib/db.js";
import { body, method } from "../_lib/http.js";
import crypto from "node:crypto";
import { signSession, setSession } from "../_lib/auth.js";
export default async function handler(req,res){
  if(!method(req,res,"POST"))return;
  const {email="",code="",name="",phone="",mode="login"}=await body(req);
  const cleanEmail=String(email).trim().toLowerCase();
  const hash=crypto.createHash("sha256").update(String(code)+process.env.JWT_SECRET).digest("hex");
  const rows=await sql`select * from email_codes where email=${cleanEmail} and code_hash=${hash} and used=false and expires_at>now() order by id desc limit 1`;
  if(!rows.length)return res.status(400).json({error:"Invalid or expired verification code."});
  await sql`update email_codes set used=true where id=${rows[0].id}`;
  let u=(await sql`select * from users where email=${cleanEmail} limit 1`)[0];
  if(!u){
    const cleanName=String(name).trim().slice(0,30);
    if(!cleanName)return res.status(400).json({error:"Username is required."});
    const handle="@"+cleanName.toLowerCase().replace(/[^a-z0-9_]/g,"").slice(0,24);
    u=(await sql`insert into users(name,handle,email,phone) values(${cleanName},${handle},${cleanEmail},${String(phone).trim()}) returning *`)[0];
  }else if(name || phone){
    u=(await sql`update users set name=coalesce(nullif(${String(name).trim()} ,''),name), phone=coalesce(nullif(${String(phone).trim()},''),phone) where id=${u.id} returning *`)[0];
  }
  const token=await signSession(u.id);setSession(res,token);
  const stats=(await sql`select (select count(*) from follows where following_id=${u.id}) followers,(select count(*) from follows where follower_id=${u.id}) following,(select count(*) from posts where user_id=${u.id}) posts`)[0];
  res.json({user:{id:u.id,name:u.name,handle:u.handle,email:u.email,phone:u.phone,bio:u.bio,avatar:u.avatar,followers:Number(stats.followers),following:Number(stats.following),posts:Number(stats.posts)}});
}
