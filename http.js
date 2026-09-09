export async function body(req){if(req.method==="GET")return {}; if(typeof req.body==="object")return req.body; let s="";for await(const c of req)s+=c;try{return JSON.parse(s||"{}")}catch{return {}}}
export function method(req,res,m){if(req.method!==m){res.status(405).json({error:"Method not allowed"});return false}return true}
