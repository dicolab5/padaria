import express from "express";
import { rateLimit } from "express-rate-limit";
import { z } from "zod";
import { pool } from "./db.js";
import { AppError, asyncHandler } from "./errors.js";
import { issueCsrf, verifyCsrf } from "./security.js";
import { isValidCpf, normalizeCpf } from "./cpf.js";

export const customerRouter=express.Router();
const loginLimit=rateLimit({windowMs:15*60*1000,limit:8,standardHeaders:"draft-8",legacyHeaders:false,message:{error:{code:"RATE_LIMIT",message:"Muitas tentativas. Aguarde 15 minutos."}}});
const loginSchema=z.object({email:z.string().trim().toLowerCase().email().max(254),cpf:z.string().trim().max(20).transform(normalizeCpf)}).refine(value=>isValidCpf(value.cpf),{message:"CPF inválido.",path:["cpf"]});
const requireCustomer=(req,_res,next)=>req.session?.customer?next():next(new AppError(401,"CUSTOMER_AUTH_REQUIRED","Entre na área do cliente para continuar."));

customerRouter.post("/auth/login",loginLimit,asyncHandler(async(req,res)=>{
  const parsed=loginSchema.safeParse(req.body);
  if(!parsed.success)throw new AppError(422,"VALIDATION_ERROR","Confira o e-mail e o CPF.");
  const {email,cpf}=parsed.data;
  const result=await pool.query(`SELECT c.id,c.tenant_id,c.name,c.email,c.portal_active,c.portal_failed_attempts,c.portal_locked_until,t.name bakery_name
    FROM customers c JOIN tenants t ON t.id=c.tenant_id AND t.active
    WHERE lower(c.email)=$1 AND regexp_replace(COALESCE(c.document,''),'[^0-9]','','g')=$2 AND c.portal_active LIMIT 2`,[email,cpf]);
  const customer=result.rowCount===1?result.rows[0]:null;
  const denied=!customer||(customer.portal_locked_until&&new Date(customer.portal_locked_until)>new Date());
  if(denied){if(customer)await pool.query("UPDATE customers SET portal_failed_attempts=portal_failed_attempts+1,portal_locked_until=CASE WHEN portal_failed_attempts+1>=5 THEN now()+interval '15 minutes' ELSE portal_locked_until END WHERE id=$1",[customer.id]);throw new AppError(401,"INVALID_CREDENTIALS","Dados de acesso inválidos.");}
  await new Promise((resolve,reject)=>req.session.regenerate(error=>error?reject(error):resolve()));
  req.session.customer={id:customer.id,tenantId:customer.tenant_id,name:customer.name,email:customer.email,bakeryName:customer.bakery_name};
  const csrf=issueCsrf(req);
  await pool.query("UPDATE customers SET portal_failed_attempts=0,portal_locked_until=NULL,portal_last_login_at=now() WHERE id=$1",[customer.id]);
  res.json({customer:req.session.customer,csrf});
}));

customerRouter.get("/auth/session",asyncHandler(async(req,res)=>{if(!req.session.customer)return res.status(401).json({error:{code:"CUSTOMER_AUTH_REQUIRED",message:"Sessão do cliente não autenticada."}});res.json({customer:req.session.customer,csrf:req.session.csrf||issueCsrf(req)});}));
customerRouter.use(requireCustomer,verifyCsrf);
customerRouter.post("/auth/logout",asyncHandler(async(req,res)=>{await new Promise((resolve,reject)=>req.session.destroy(error=>error?reject(error):resolve()));res.clearCookie("pg.sid");res.status(204).end();}));

customerRouter.get("/overview",asyncHandler(async(req,res)=>{
  const {id,tenantId}=req.session.customer;
  const [profile,receivables,payments]=await Promise.all([
    pool.query(`SELECT c.id,c.name,c.email,c.phone,c.credit_limit,t.name bakery_name,t.portal_code,
      COALESCE(sum(cr.original_amount-cr.paid_amount) FILTER(WHERE cr.status IN ('open','partial')),0)::numeric balance,
      COALESCE(sum(cr.original_amount-cr.paid_amount) FILTER(WHERE cr.status IN ('open','partial') AND cr.due_at<current_date),0)::numeric overdue
      FROM customers c JOIN tenants t ON t.id=c.tenant_id LEFT JOIN customer_receivables cr ON cr.customer_id=c.id AND cr.tenant_id=c.tenant_id
      WHERE c.id=$1 AND c.tenant_id=$2 GROUP BY c.id,t.id`,[id,tenantId]),
    pool.query(`SELECT cr.id,cr.original_amount,cr.paid_amount,(cr.original_amount-cr.paid_amount)::numeric balance,cr.due_at,cr.status,cr.notes,s.number sale_number,s.created_at,
      COALESCE(jsonb_agg(jsonb_build_object('name',p.name,'quantity',si.quantity,'unitPrice',si.unit_price,'total',si.total) ORDER BY p.name) FILTER(WHERE si.id IS NOT NULL),'[]'::jsonb) items
      FROM customer_receivables cr JOIN sales s ON s.id=cr.sale_id LEFT JOIN sale_items si ON si.sale_id=s.id LEFT JOIN products p ON p.id=si.product_id
      WHERE cr.tenant_id=$1 AND cr.customer_id=$2 GROUP BY cr.id,s.id ORDER BY cr.created_at DESC LIMIT 200`,[tenantId,id]),
    pool.query(`SELECT cp.id,cp.amount,cp.payment_method,cp.created_at,s.number sale_number
      FROM customer_credit_payments cp JOIN customer_receivables cr ON cr.id=cp.receivable_id JOIN sales s ON s.id=cr.sale_id
      WHERE cp.tenant_id=$1 AND cr.customer_id=$2 ORDER BY cp.created_at DESC LIMIT 200`,[tenantId,id])
  ]);
  if(!profile.rowCount)throw new AppError(404,"NOT_FOUND","Cadastro não encontrado.");
  const data=profile.rows[0];data.availableCredit=Math.max(0,Number(data.credit_limit)-Number(data.balance));
  res.json({profile:data,receivables:receivables.rows,payments:payments.rows});
}));
