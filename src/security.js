import crypto from "node:crypto";
import { AppError } from "./errors.js";
import { pool } from "./db.js";
const rolePermissions = {
  admin: ["*"],
  gerente: ["dashboard:read", "catalog:read", "catalog:write", "stock:write", "sales:write", "people:read", "people:write", "purchases:write", "finance:read", "finance:write", "credit:read", "credit:write", "reports:read", "settings:write"],
  caixa: ["dashboard:read", "catalog:read", "sales:write", "people:read", "credit:read", "credit:write"],
  estoque: ["dashboard:read", "catalog:read", "stock:write", "people:read"],
};
export async function requireAuth(req, _res, next) {
  if (!req.session?.user) return next(new AppError(401, "AUTH_REQUIRED", "Faça login para continuar."));
  try{const result=await pool.query("SELECT active,subscription_status,trial_ends_at,subscription_ends_at FROM tenants WHERE id=$1",[req.session.user.tenantId]),tenant=result.rows[0],now=new Date();if(!tenant?.active)return next(new AppError(403,"TENANT_INACTIVE","O acesso desta padaria está bloqueado."));if(tenant.subscription_status==="trial"&&tenant.trial_ends_at&&new Date(tenant.trial_ends_at)<=now)return next(new AppError(403,"TRIAL_EXPIRED","Seu período de degustação terminou."));if(tenant.subscription_status==="active"&&tenant.subscription_ends_at&&new Date(tenant.subscription_ends_at)<=now)return next(new AppError(403,"SUBSCRIPTION_EXPIRED","O período contratado terminou."));if(["past_due","cancelled"].includes(tenant.subscription_status))return next(new AppError(403,"SUBSCRIPTION_INACTIVE","A assinatura desta padaria está inativa."));next();}catch(error){next(error);}
}
export function authorize(permission) {
  return (req, _res, next) => {
    const allowed = rolePermissions[req.session.user.role] || [];
    if (!allowed.includes("*") && !allowed.includes(permission)) return next(new AppError(403, "FORBIDDEN", "Você não possui permissão para esta ação."));
    next();
  };
}
export function issueCsrf(req) {
  req.session.csrf = crypto.randomBytes(32).toString("base64url");
  return req.session.csrf;
}
export function verifyCsrf(req, _res, next) {
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) return next();
  const sent = req.get("x-csrf-token") || "", expected = req.session?.csrf || "";
  const a = Buffer.from(sent), b = Buffer.from(expected);
  if (!sent || a.length !== b.length || !crypto.timingSafeEqual(a, b)) return next(new AppError(403, "CSRF_INVALID", "Token de segurança inválido. Atualize a página."));
  next();
}
export const tenantId = (req) => req.session.user.tenantId;
