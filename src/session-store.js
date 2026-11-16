import session from "express-session";
export class PgSessionStore extends session.Store{
  constructor(pool){super();this.pool=pool;this.ready=pool.query("CREATE TABLE IF NOT EXISTS app_sessions (sid varchar(128) PRIMARY KEY,data jsonb NOT NULL,expires_at timestamptz NOT NULL)");this.timer=setInterval(()=>pool.query("DELETE FROM app_sessions WHERE expires_at<now()").catch(()=>{}),15*60*1000).unref();}
  async get(sid,callback){try{await this.ready;const r=await this.pool.query("SELECT data FROM app_sessions WHERE sid=$1 AND expires_at>now()",[sid]);callback(null,r.rows[0]?.data||null);}catch(e){callback(e);}}
  async set(sid,data,callback=()=>{}){try{await this.ready;const expires=data.cookie?.expires?new Date(data.cookie.expires):new Date(Date.now()+8*60*60*1000);await this.pool.query("INSERT INTO app_sessions(sid,data,expires_at) VALUES($1,$2,$3) ON CONFLICT(sid) DO UPDATE SET data=excluded.data,expires_at=excluded.expires_at",[sid,data,expires]);callback();}catch(e){callback(e);}}
  async destroy(sid,callback=()=>{}){try{await this.ready;await this.pool.query("DELETE FROM app_sessions WHERE sid=$1",[sid]);callback();}catch(e){callback(e);}}
  async touch(sid,data,callback=()=>{}){try{const expires=data.cookie?.expires?new Date(data.cookie.expires):new Date(Date.now()+8*60*60*1000);await this.pool.query("UPDATE app_sessions SET expires_at=$2 WHERE sid=$1",[sid,expires]);callback();}catch(e){callback(e);}}
}
