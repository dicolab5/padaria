import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
for(const script of ["scripts/migrate.js","scripts/seed.js","scripts/seed-system-admin.js"]){
  const result=spawnSync(process.execPath,[path.join(root,script)],{cwd:root,env:process.env,stdio:"inherit"});
  if(result.status!==0){console.error(`Inicialização interrompida em ${script}.`);process.exit(result.status||1);}
}
await import("../server.js");
