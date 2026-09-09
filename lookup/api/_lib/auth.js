import { SignJWT, jwtVerify } from "jose";
const secret=()=>new TextEncoder().encode(process.env.JWT_SECRET);
export async function signSession(userId){
  return new SignJWT({sub:String(userId)}).setProtectedHeader({alg:"HS256"}).setIssuedAt().setExpirationTime("30d").sign(secret());
}
export async function getUserId(req){
  const raw=req.headers.cookie?.match(/lookup_session=([^;]+)/)?.[1];
  if(!raw) return null;
  try{return (await jwtVerify(decodeURIComponent(raw),secret())).payload.sub}catch{return null}
}
export function setSession(res,token){
  res.setHeader("Set-Cookie",`lookup_session=${encodeURIComponent(token)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=2592000`);
}
export function clearSession(res){
  res.setHeader("Set-Cookie","lookup_session=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0");
}
export function json(res,status,data){res.status(status).json(data)}
