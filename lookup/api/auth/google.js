import crypto from "node:crypto";
export default async function handler(req,res){
 const state=crypto.randomUUID();
 res.setHeader("Set-Cookie",`lookup_oauth_state=${state}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=600`);
 const p=new URLSearchParams({client_id:process.env.GOOGLE_CLIENT_ID,redirect_uri:process.env.GOOGLE_REDIRECT_URI,response_type:"code",scope:"openid email profile",state,access_type:"offline",prompt:"select_account"});
 res.redirect("https://accounts.google.com/o/oauth2/v2/auth?"+p.toString());
}
