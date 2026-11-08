 "use client";
import { useEffect, useState } from "react";
type Team={team:number;members:string[]};
type Data={open:boolean;revealed:boolean;count:number;names:string[];teams:Team[]};
export default function Admin(){
 const [password,setPassword]=useState("");const [logged,setLogged]=useState(false);const [data,setData]=useState<Data|null>(null);const [msg,setMsg]=useState("");const [busy,setBusy]=useState(false);
 async function load(){const r=await fetch("/api/admin",{cache:"no-store"});if(r.ok){setData(await r.json());setLogged(true)}else setLogged(false)}
 useEffect(()=>{load()},[]);
 async function login(e:React.FormEvent){e.preventDefault();setBusy(true);setMsg("");const r=await fetch("/api/admin/login",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({password})});const d=await r.json();setBusy(false);if(!r.ok){setMsg(d.error||"Login failed");return}setPassword("");await load()}
 async function action(action:string){setBusy(true);setMsg("");const r=await fetch("/api/admin",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action})});const d=await r.json();setBusy(false);if(!r.ok){setMsg(d.error||"Action failed");return}setMsg(d.message||"Updated.");await load()}
 return <main className="shell"><header className="hero"><div className="eyebrow">PRIVATE CONTROL ROOM</div><h1>Organizer dashboard</h1><p>Manage registration, generate teams privately and reveal everyone at once.</p></header>
 {!logged?<section className="panel"><h2>Organizer login</h2><form onSubmit={login}><label className="field">Organizer password</label><input className="input" type="password" value={password} onChange={e=>setPassword(e.target.value)} required/><div style={{marginTop:14}}><button className="btn" disabled={busy}>{busy?"Signing in…":"Sign in"}</button></div></form>{msg&&<p className="notice error">{msg}</p>}</section>:
 <><section className="panel"><div className="row" style={{justifyContent:"space-between"}}><h2>Event overview</h2><button className="btn secondary" onClick={()=>action("logout")}>Log out</button></div><div className="stat">{data?.count??0}</div><p className="muted">Registered participants</p><p className="notice">{data?.open?"Registration is OPEN":"Registration is CLOSED"} · {data?.revealed?"Teams are REVEALED":"Teams are HIDDEN"}</p>
 <div className="row" style={{marginTop:18}}><button className="btn secondary" disabled={busy||data?.revealed} onClick={()=>action(data?.open?"close":"open")}>{data?.open?"Close registration":"Open registration"}</button><button className="btn" disabled={busy||data?.open||!data?.count||data?.revealed} onClick={()=>action("generate")}>Generate teams</button><button className="btn" disabled={busy||!data?.teams?.length||data?.revealed} onClick={()=>action("reveal")}>Reveal teams</button></div>
 <p className="muted small">Generate is available only after registration closes. Preview below is private to organizers.</p></section>
 {msg&&<p className="notice success">{msg}</p>}
 <section className="panel"><h2>Private team preview</h2>{data?.teams?.length?<div className="teamgrid">{data.teams.map(t=><div className="team" key={t.team}><h3>Team {t.team} · {t.members.length} people</h3><ol>{t.members.map((m,i)=><li key={i}>{m}</li>)}</ol></div>)}</div>:<p className="muted">No teams generated yet.</p>}</section>
 <section className="panel"><h2>Registered participants</h2><p className="muted small">Visible only in this organizer dashboard.</p><ol>{data?.names.map((n,i)=><li key={i}>{n}</li>)}</ol></section>
 <section className="panel"><h2>Start a new event</h2><p className="muted">This permanently clears the current participant list and team assignments. Only use after saving anything you need.</p><button className="btn danger" disabled={busy} onClick={()=>{if(confirm("Reset the event and delete all registrations and teams?"))action("reset")}}>Reset event</button></section></>}
 <p className="footer"><a className="toplink" href="/">Participant registration page</a></p></main>;
}
