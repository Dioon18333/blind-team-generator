 "use client";
import { useEffect, useState } from "react";
type Team = { team: number; members: string[] };
type PublicState = { registrationOpen: boolean; revealed: boolean; count: number; teams?: Team[] };
export default function Home() {
  const [name,setName]=useState(""); const [state,setState]=useState<PublicState|null>(null);
  const [message,setMessage]=useState(""); const [busy,setBusy]=useState(false);
  async function refresh() {
    try { const r=await fetch("/api/public",{cache:"no-store"}); if(r.ok) setState(await r.json()); }
    catch {}
  }
  useEffect(()=>{ refresh(); const t=setInterval(refresh,5000); return ()=>clearInterval(t); },[]);
  async function register(e:React.FormEvent) {
    e.preventDefault(); setBusy(true); setMessage("");
    try {
      const r=await fetch("/api/register",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({name})});
      const d=await r.json(); if(!r.ok) throw new Error(d.error||"Could not register.");
      setName(""); setMessage("You're registered! Your team will stay secret until the reveal."); await refresh();
    } catch(err) { setMessage(err instanceof Error?err.message:"Something went wrong."); }
    finally { setBusy(false); }
  }
  return <main className="shell">
    <header className="hero"><div className="eyebrow">RANDOM TEAMS • SECRET UNTIL REVEAL</div><h1>Blind Team Generator</h1><p>Four people. One team. Zero spoilers. Register your name and wait for the organizer to reveal the teams.</p></header>
    <section className="panel">
      <h2>Participant registration</h2>
      {!state ? <p className="muted">Loading event…</p> : state.revealed ?
        <div className="notice success"><b>The teams have been revealed!</b><p>Scroll down to find your team.</p></div> :
        state.registrationOpen ?
          <><p className="muted">Registration is open. Your name will not be shown to other participants.</p>
          <form onSubmit={register}><label className="field" htmlFor="name">Your full name</label><input id="name" className="input" maxLength={70} value={name} onChange={e=>setName(e.target.value)} placeholder="Enter your name" required />
          <div style={{marginTop:14}}><button className="btn" disabled={busy||!name.trim()}>{busy?"Registering…":"Join the draw"}</button></div></form></> :
          <div className="notice">Registration is currently closed. Please check with the event organizer.</div>}
      {message&&<p className={"notice "+(message.startsWith("You're")?"success":"error")} style={{marginTop:14}}>{message}</p>}
      {state&&<p className="muted small">Registered participants: <b>{state.count}</b> · This page refreshes automatically.</p>}
    </section>
    {state?.revealed&&<section className="panel"><h2>Meet your teams</h2><div className="teamgrid">{state.teams?.map(t=><div className="team" key={t.team}><h3>Team {t.team}</h3><ol>{t.members.map((m,i)=><li key={i}>{m}</li>)}</ol></div>)}</div></section>}
    <p className="footer">Blind Team Generator · Team membership stays private until the organizer reveals it.</p>
  </main>;
}
