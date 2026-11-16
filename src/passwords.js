import crypto from "node:crypto";
import { promisify } from "node:util";
const scrypt=promisify(crypto.scrypt);
const params={N:32768,r:8,p:1,maxmem:64*1024*1024};
export async function hashPassword(password){const salt=crypto.randomBytes(16),derived=await scrypt(password,salt,64,params);return `scrypt$${params.N}$${params.r}$${params.p}$${salt.toString("base64url")}$${derived.toString("base64url")}`;}
export async function verifyPassword(encoded,password){try{const [algorithm,n,r,p,salt,key]=encoded.split("$");if(algorithm!=="scrypt")return false;const expected=Buffer.from(key,"base64url"),actual=await scrypt(password,Buffer.from(salt,"base64url"),expected.length,{N:Number(n),r:Number(r),p:Number(p),maxmem:64*1024*1024});return crypto.timingSafeEqual(expected,actual);}catch{return false;}}
