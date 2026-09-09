import { sql } from "../_lib/db.js";
import { body, method } from "../_lib/http.js";
import crypto from "node:crypto";
export default async function handler(req,res){
  if(!method(req,res,"POST"))return;
  const {name="",email="",phone="",mode="login"}=await body(req);
  const cleanEmail=String(email).trim().toLowerCase();
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail))return res.status(400).json({error:"Enter a valid email."});
  if(mode==="register" && !String(name).trim())return res.status(400).json({error:"Username is required."});
  const existing=await sql`select id from users where email=${cleanEmail} limit 1`;
  if(mode==="register" && existing.length)return res.status(409).json({error:"That email already has an account. Use Sign in."});
  if(mode==="login" && !existing.length)return res.status(404).json({error:"No account found for that email. Choose Create account."});
  const code=String(crypto.randomInt(100000,1000000));
  const hash=crypto.createHash("sha256").update(code+process.env.JWT_SECRET).digest("hex");
  await sql`delete from email_codes where email=${cleanEmail} and used=false`;
  await sql`insert into email_codes(email,code_hash,mode,expires_at) values(${cleanEmail},${hash},${mode},now()+interval '10 minutes')`;
  const r=await fetch("https://api.resend.com/emails",{method:"POST",headers:{"Authorization":`Bearer ${process.env.RESEND_API_KEY}`,"Content-Type":"application/json"},body:JSON.stringify({from:process.env.EMAIL_FROM,to:[cleanEmail],subject:"Your LOOK UP verification code",html:`<div style="font-family:Arial,sans-serif;padding:28px;background:#0b0813;color:#fff"><h2>LOOK UP verification</h2><p>Your one-time code is:</p><div style="font-size:34px;font-weight:800;letter-spacing:8px">${code}</div><p>This code expires in 10 minutes. If you didn't request it, ignore this email.</p></div>`})});
  if(!r.ok){const t=await r.text();console.error(t);return res.status(502).json({error:"Email delivery is not configured correctly yet."})}
  res.json({ok:true});
}
