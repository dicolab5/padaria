import crypto from "node:crypto";
import { AppError } from "./errors.js";
const rolePermissions = {
  admin: ["*"],
  gerente: ["dashboard:read", "catalog:read", "catalog:write", "stock:write", "sales:write", "people:read", "people:write", "purchases:write", "finance:read", "finance:write", "reports:read", "settings:write"],
  caixa: ["dashboard:read", "catalog:read", "sales:write", "people:read"],
  estoque: ["dashboard:read", "catalog:read", "stock:write", "people:read"],
};
export function requireAuth(req, _res, next) {
  if (!req.session?.user) return next(new AppError(401, "AUTH_REQUIRED", "Faça login para continuar."));
  next();
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
