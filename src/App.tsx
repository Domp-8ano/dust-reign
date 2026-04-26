import { useEffect, useMemo, useState } from "react";

type Page        = "home" | "inventory" | "trade" | "profile";
type Rarity      = "Consumer" | "Industrial" | "Mil-Spec" | "Restricted" | "Classified" | "Covert";
type TradeStatus = "pending" | "accepted" | "rejected";

interface InventoryItem {
  id: string; name: string; weapon: string;
  rarity: Rarity; finish: string; value: number; equipped?: boolean;
}
interface Trade {
  id: string; from: string; to: string;
  item: string; status: TradeStatus; createdAt: string;
}

const NAV: { page: Page; label: string }[] = [
  { page: "home",      label: "Home"      },
  { page: "inventory", label: "Inventory" },
  { page: "trade",     label: "Trade"     },
  { page: "profile",   label: "Profile"   },
];

const SKINS: InventoryItem[] = [
  { id:"s1", name:"High Noon Marshal",   weapon:"Rifle",   rarity:"Covert",     finish:"Sun-baked gold receiver with black iron barrel", value:7200, equipped:true },
  { id:"s2", name:"Dustline Peacemaker", weapon:"Pistol",  rarity:"Classified", finish:"Engraved brass slide with worn leather grip",    value:3600 },
  { id:"s3", name:"Canyon Breacher",     weapon:"Shotgun", rarity:"Restricted", finish:"Charcoal steel with orange clay inlay",          value:1800 },
  { id:"s4", name:"Ghost Town Varmint",  weapon:"Rifle",   rarity:"Mil-Spec",   finish:"Matte bone pattern across desert tan polymer",   value:950  },
  { id:"s5", name:"Rail Spur",           weapon:"Pistol",  rarity:"Industrial", finish:"Blued steel, brass pinstripe, serialized frame", value:520  },
  { id:"s6", name:"Claim Stake",         weapon:"Knife",   rarity:"Consumer",   finish:"Weathered wood handle and brushed iron blade",   value:260  },
];

const INIT_TRADES: Trade[] = [
  { id:"t1", from:"RanchHand",  to:"You",        item:"Rail Spur",          status:"pending",  createdAt:"2 min ago"  },
  { id:"t2", from:"You",        to:"Marshal_13", item:"Ghost Town Varmint", status:"accepted", createdAt:"Yesterday"  },
  { id:"t3", from:"Prospector", to:"You",        item:"Canyon Breacher",    status:"rejected", createdAt:"3 days ago" },
];

const API_ROUTES = [
  "POST /register","POST /login","GET /profile",
  "GET /inventory","POST /inventory/add","DELETE /inventory/remove",
  "POST /trade/send","POST /trade/respond","GET /trade/history",
];

const RARITY_CLR: Record<Rarity,string> = {
  "Consumer":"#b0b0b0","Industrial":"#70a4d8",
  "Mil-Spec":"#6080ff","Restricted":"#aa66ff",
  "Classified":"#dd44dd","Covert":"#ff5533",
};
const STATUS_CLR: Record<TradeStatus,string> = {
  pending:"#f2b84b", accepted:"#44cc77", rejected:"#dd3322",
};

const fmt = (n: number) => new Intl.NumberFormat("en-US").format(n) + " CR";

const C = {
  bg:        "#1c1306",
  bgCard:    "#2a1d0a",
  bgHover:   "#3a2810",
  border:    "#5a3e1a",
  borderHi:  "#c8892a",
  gold:      "#f2b84b",
  goldBri:   "#ffd27a",
  text:      "#ffecc8",
  textMuted: "#c4a06a",
  topbar:    "#110d04",
};

function Splash() {
  return (
    <div style={{ position:"fixed", inset:0, zIndex:9999, background:C.bg, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:"1.2rem" }}>
      <div style={{ width:"5rem", height:"5rem", background:"linear-gradient(135deg,#ffe090,#c8841e,#7c3d10)", display:"grid", placeItems:"center", color:"#1a0c00", fontWeight:900, fontSize:"1.5rem", border:`2px solid ${C.borderHi}`, boxShadow:`0 0 48px ${C.gold}`, transform:"skewX(-6deg)" }}>DR</div>
      <p style={{ margin:0, color:C.goldBri, fontFamily:"Georgia,serif", fontSize:"3rem", fontWeight:900, letterSpacing:"-0.06em", textTransform:"uppercase" }}>Dust Reign</p>
      <p style={{ margin:0, color:C.textMuted, fontSize:"0.72rem", fontWeight:700, letterSpacing:"0.3em", textTransform:"uppercase" }}>Tactical FPS Network — Loading…</p>
      <div style={{ width:"12rem", height:"3px", background:C.bgCard, borderRadius:"2px", overflow:"hidden" }}>
        <div style={{ height:"100%", background:`linear-gradient(90deg,transparent,${C.gold},${C.goldBri},transparent)`, animation:"barSweep 900ms ease-in-out forwards" }}/>
      </div>
    </div>
  );
}

export default function App() {
  const [ready,       setReady]      = useState(false);
  const [page,        setPage]       = useState<Page>("home");
  const [inventory]                  = useState(SKINS);
  const [trades,      setTrades]     = useState(INIT_TRADES);
  const [selectedId,  setSelectedId] = useState(SKINS[0].id);
  const [receiver,    setReceiver]   = useState("Marshal_13");
  const [launchState, setLaunch]     = useState("Ready to launch");

  useEffect(() => {
    document.body.style.background = C.bg;
    document.body.style.margin = "0";
    const t = setTimeout(() => setReady(true), 700);
    return () => clearTimeout(t);
  }, []);

  const selected   = inventory.find(i => i.id === selectedId) ?? inventory[0];
  const totalValue = useMemo(() => inventory.reduce((s,i) => s + i.value, 0), [inventory]);

  function launch() {
    const tok = "jwt.p1." + crypto.randomUUID().slice(0,8);
    setLaunch("Generating token…");
    setTimeout(() => setLaunch(`fps_client.exe --token=${tok}`), 500);
  }

  function sendTrade() {
    if (receiver.trim().length < 2) return;
    setTrades(prev => [{ id:"t"+Date.now(), from:"You", to:receiver.trim(), item:selected.name, status:"pending", createdAt:"Just now" }, ...prev]);
  }

  function respond(id: string, status: Exclude<TradeStatus,"pending">) {
    setTrades(prev => prev.map(t => t.id===id ? {...t,status} : t));
  }

  if (!ready) return <Splash />;

  return (
    <div style={{ minHeight:"100vh", background:C.bg, color:C.text, fontFamily:"Inter,system-ui,sans-serif", margin:0 }}>
      <header style={{ position:"fixed", top:0, left:0, right:0, zIndex:100, display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0.85rem 2rem", background:C.topbar, borderBottom:`2px solid ${C.border}`, boxShadow:"0 4px 32px rgba(0,0,0,0.6)", gap:"1rem" }}>
        <button onClick={() => setPage("home")} style={{ display:"flex", alignItems:"center", gap:"0.8rem", background:"transparent", border:0, cursor:"pointer", padding:0 }}>
          <div style={{ width:"2.6rem", height:"2.6rem", background:"linear-gradient(135deg,#ffe090,#c8841e,#7c3d10)", display:"grid", placeItems:"center", color:"#1a0c00", fontWeight:900, fontSize:"0.85rem", border:`1px solid ${C.borderHi}`, boxShadow:`0 0 20px ${C.gold}66`, transform:"skewX(-6deg)" }}>DR</div>
          <div style={{ textAlign:"left" }}>
            <div style={{ color:C.goldBri, fontWeight:900, fontSize:"0.95rem", letterSpacing:"0.12em", textTransform:"uppercase" }}>Dust Reign</div>
            <div style={{ color:C.textMuted, fontSize:"0.62rem", letterSpacing:"0.2em", textTransform:"uppercase" }}>Tactical FPS Network</div>
          </div>
        </button>
        <nav style={{ display:"flex", gap:"0.2rem" }}>
          {NAV.map(n => (
            <button key={n.page} onClick={() => setPage(n.page)} style={{ padding:"0.6rem 1rem", background:page===n.page ? C.bgHover : "transparent", border:"none", borderBottom:page===n.page ? `2px solid ${C.gold}` : "2px solid transparent", color:page===n.page ? C.goldBri : C.textMuted, fontWeight:700, fontSize:"0.76rem", letterSpacing:"0.1em", textTransform:"uppercase", cursor:"pointer", transition:"all 150ms" }}>{n.label}</button>
          ))}
        </nav>
      </header>

      <div style={{ paddingTop:"5rem" }}>
        {page==="home"      && <HomeP      launch={launch} launchState={launchState} goTo={setPage} />}
        {page==="inventory" && <InventoryP inventory={inventory} selectedId={selectedId} onSelect={setSelectedId} />}
        {page==="trade"     && <TradeP     inventory={inventory} selectedId={selectedId} receiver={receiver} trades={trades} onSelect={setSelectedId} onReceiver={setReceiver} onSend={sendTrade} onRespond={respond} />}
        {page==="profile"   && <ProfileP   totalValue={totalValue} trades={trades} />}
      </div>
    </div>
  );
}

function HomeP({ launch, launchState, goTo }: { launch:()=>void; launchState:string; goTo:(p:Page)=>void }) {
  return (
    <section style={{ minHeight:"calc(100vh - 5rem)", display:"flex", alignItems:"center", padding:"2rem clamp(1rem,6vw,5rem)", position:"relative", overflow:"hidden" }}>
      <div style={{ position:"absolute", inset:0, background:"linear-gradient(150deg,#2e1a06 0%,#1c1005 50%,#251408 100%)" }}/>
      <div style={{ position:"absolute", top:"8%", right:"10%", width:"clamp(10rem,25vw,24rem)", aspectRatio:"1", borderRadius:"50%", background:"radial-gradient(circle,rgba(255,210,100,0.55),rgba(220,110,30,0.25) 50%,transparent 72%)", filter:"blur(3px)" }}/>
      <div style={{ position:"absolute", bottom:0, left:0, right:0, height:"35%", background:"linear-gradient(to top,#1c1005,transparent)" }}/>
      <div style={{ position:"relative", zIndex:1, maxWidth:"820px" }}>
        <div style={{ display:"inline-block", padding:"0.3rem 0.8rem", background:C.bgCard, border:`1px solid ${C.border}`, marginBottom:"1.2rem" }}>
          <span style={{ color:C.gold, fontSize:"0.7rem", fontWeight:900, letterSpacing:"0.28em", textTransform:"uppercase" }}>Phase 1 · Front-End Platform</span>
        </div>
        <h1 style={{ margin:0, color:C.goldBri, fontFamily:"Georgia,'Times New Roman',serif", fontSize:"clamp(4rem,13vw,11rem)", fontWeight:900, lineHeight:0.82, letterSpacing:"-0.08em", textTransform:"uppercase", textShadow:`0 0 60px ${C.gold}44, 2px 4px 0 #00000088` }}>
          Dust<br/>Reign
        </h1>
        <p style={{ maxWidth:"44rem", margin:"1.8rem 0 0", color:C.text, fontSize:"clamp(0.95rem,1.6vw,1.18rem)", lineHeight:1.8 }}>
          A western tactical shooter hub. Launch the FPS client, inspect weapon skins, execute secure item trades and sync your JWT identity across the ecosystem.
        </p>
        <div style={{ display:"flex", flexWrap:"wrap", gap:"1rem", marginTop:"2.2rem" }}>
          <button onClick={launch} style={BtnP}>🎮 Launch Game</button>
          <button onClick={() => goTo("inventory")} style={BtnS}>View Inventory</button>
          <button onClick={() => goTo("trade")} style={BtnS}>Trade Items</button>
        </div>
        <div style={{ marginTop:"1rem", padding:"0.6rem 0.9rem", background:C.bgCard, border:`1px solid ${C.border}`, display:"inline-block" }}>
          <span style={{ color:C.textMuted, fontFamily:"monospace", fontSize:"0.8rem" }}>{launchState}</span>
        </div>
        <div style={{ marginTop:"3rem", display:"flex", alignItems:"center", gap:"0.8rem", flexWrap:"wrap" }}>
          {["Frontend","Backend API","Supabase DB","FPS Client"].map((lbl,i,arr) => (
            <span key={lbl} style={{ display:"flex", alignItems:"center", gap:"0.8rem" }}>
              <span style={{ color:C.textMuted, fontSize:"0.68rem", fontWeight:800, letterSpacing:"0.18em", textTransform:"uppercase" }}>{lbl}</span>
              {i < arr.length-1 && <span style={{ width:"2.5rem", height:"1px", background:`linear-gradient(90deg,transparent,${C.borderHi},transparent)`, display:"block" }}/>}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

function InventoryP({ inventory, selectedId, onSelect }: { inventory:InventoryItem[]; selectedId:string; onSelect:(id:string)=>void }) {
  const sel = inventory.find(i => i.id===selectedId) ?? inventory[0];
  return (
    <section style={Wrap}>
      <Heading tag="Inventory Service" title="Weapon Skins" sub="Synced from GET /inventory after JWT validation." />
      <div style={{ display:"grid", gridTemplateColumns:"1fr 300px", gap:"1rem", alignItems:"start" }}>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"0.75rem" }}>
          {inventory.map(item => (
            <button key={item.id} onClick={() => onSelect(item.id)} style={{ position:"relative", overflow:"hidden", minHeight:"11rem", padding:"1rem", textAlign:"left", cursor:"pointer", background:item.id===selectedId ? C.bgHover : C.bgCard, border:`1px solid ${item.id===selectedId ? C.borderHi : C.border}`, borderLeft:`4px solid ${RARITY_CLR[item.rarity]}`, color:C.text, transition:"all 150ms", boxShadow:item.id===selectedId ? `0 0 20px ${RARITY_CLR[item.rarity]}44` : "none" }}>
              <div style={{ position:"absolute", top:"1.8rem", left:"1.2rem", width:"72%", height:"1.8rem", background:`linear-gradient(90deg,transparent 5%,${RARITY_CLR[item.rarity]}55 6% 70%,transparent 71%)`, transform:"rotate(-4deg)", filter:`drop-shadow(0 0 8px ${RARITY_CLR[item.rarity]}88)` }}/>
              <strong style={{ display:"block", marginTop:"5.5rem", fontSize:"0.92rem", fontWeight:900, color:C.text }}>{item.name}</strong>
              <small style={{ display:"block", marginTop:"0.3rem", color:C.textMuted, fontSize:"0.76rem" }}>{item.weapon} · {item.rarity}</small>
              <span style={{ display:"block", marginTop:"0.5rem", color:C.goldBri, fontWeight:900, fontSize:"0.88rem" }}>{fmt(item.value)}</span>
            </button>
          ))}
        </div>
        <div style={{ ...Card, position:"sticky", top:"5.5rem", padding:"1.2rem" }}>
          <Tag>Selected</Tag>
          <h3 style={{ margin:"0.5rem 0 0", color:C.goldBri, fontSize:"1.5rem", fontWeight:900, lineHeight:1 }}>{sel.name}</h3>
          <p style={{ margin:"0.6rem 0 0", color:C.textMuted, fontSize:"0.86rem", lineHeight:1.6 }}>{sel.finish}</p>
          {[["Weapon",sel.weapon],["Rarity",sel.rarity],["Value",fmt(sel.value)],["Status",sel.equipped?"Equipped":"Available"]].map(([k,v])=>(
            <div key={k} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"0.65rem 0", borderTop:`1px solid ${C.border}` }}>
              <span style={{ color:C.textMuted, fontSize:"0.72rem", fontWeight:800, letterSpacing:"0.1em", textTransform:"uppercase" }}>{k}</span>
              <span style={{ color:C.text, fontWeight:700 }}>{v}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TradeP({ inventory, selectedId, receiver, trades, onSelect, onReceiver, onSend, onRespond }: {
  inventory:InventoryItem[]; selectedId:string; receiver:string; trades:Trade[];
  onSelect:(id:string)=>void; onReceiver:(v:string)=>void;
  onSend:()=>void; onRespond:(id:string,s:Exclude<TradeStatus,"pending">)=>void;
}) {
  return (
    <section style={Wrap}>
      <Heading tag="Trade Service" title="Item Exchange" sub="Trades are locked as pending until the receiver accepts or rejects via POST /trade/respond." />
      <div style={{ display:"grid", gridTemplateColumns:"320px 1fr", gap:"1rem", alignItems:"start" }}>
        <form onSubmit={e=>{e.preventDefault();onSend();}} style={{ ...Card, padding:"1.2rem", display:"grid", gap:"0.9rem" }}>
          <Tag>New Trade</Tag>
          <label style={LblS}>Receiver<input value={receiver} onChange={e=>onReceiver(e.target.value)} style={InpS} placeholder="Username…" minLength={2}/></label>
          <label style={LblS}>Item
            <select value={selectedId} onChange={e=>onSelect(e.target.value)} style={InpS}>
              {inventory.map(i=><option key={i.id} value={i.id}>{i.name}</option>)}
            </select>
          </label>
          <button type="submit" style={BtnP}>Send Trade</button>
        </form>
        <div style={{ display:"grid", gap:"0.6rem" }}>
          {trades.map(tr=>(
            <div key={tr.id} style={{ display:"flex", alignItems:"center", gap:"1rem", padding:"1rem", background:C.bgCard, border:`1px solid ${C.border}`, flexWrap:"wrap" }}>
              <div style={{ flex:1 }}>
                <strong style={{ display:"block", color:C.text, fontWeight:900 }}>{tr.item}</strong>
                <span style={{ display:"block", marginTop:"0.2rem", color:C.textMuted, fontSize:"0.82rem" }}>{tr.from} → {tr.to} · {tr.createdAt}</span>
              </div>
              <span style={{ padding:"0.28rem 0.65rem", background:STATUS_CLR[tr.status], color:"#fff", fontSize:"0.66rem", fontWeight:900, letterSpacing:"0.1em", textTransform:"uppercase" }}>{tr.status}</span>
              {tr.status==="pending" && tr.to==="You" && (
                <div style={{ display:"flex", gap:"0.4rem" }}>
                  <button onClick={()=>onRespond(tr.id,"accepted")} style={{ ...BtnP, minHeight:"2rem", padding:"0 0.65rem", fontSize:"0.68rem" }}>Accept</button>
                  <button onClick={()=>onRespond(tr.id,"rejected")} style={{ ...BtnS, minHeight:"2rem", padding:"0 0.65rem", fontSize:"0.68rem" }}>Reject</button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ProfileP({ totalValue, trades }: { totalValue:number; trades:Trade[] }) {
  const accepted = trades.filter(t=>t.status==="accepted").length;
  return (
    <section style={Wrap}>
      <Heading tag="Authenticated Operator" title="Profile" sub="JWT identity payload — this will be the live GET /profile response in Phase 2." />
      <div style={{ display:"grid", gridTemplateColumns:"340px 1fr", gap:"1rem", alignItems:"start" }}>
        <div style={{ display:"grid", gap:"0.75rem" }}>
          <div style={{ ...Card, display:"flex", alignItems:"center", gap:"1rem", padding:"1.2rem" }}>
            <div style={{ width:"4.5rem", height:"4.5rem", flexShrink:0, background:"linear-gradient(135deg,#ffe090,#c8841e)", display:"grid", placeItems:"center", color:"#1a0c00", fontSize:"1.3rem", fontWeight:900, boxShadow:`0 0 28px ${C.gold}55` }}>DR</div>
            <div>
              <h3 style={{ margin:0, color:C.goldBri, fontSize:"1.5rem", fontWeight:900 }}>Deadeye</h3>
              <p style={{ margin:"0.2rem 0 0", color:C.textMuted, fontSize:"0.84rem" }}>deadeye@dustreign.gg</p>
            </div>
          </div>
          {[["Inventory Value",fmt(totalValue)],["Accepted Trades",String(accepted)],["Rank","Frontier Elite"],["Phase","1 — Frontend"]].map(([k,v])=>(
            <div key={k} style={{ ...Card, display:"flex", justifyContent:"space-between", alignItems:"center", padding:"0.9rem 1.1rem" }}>
              <span style={{ color:C.textMuted, fontSize:"0.72rem", fontWeight:800, letterSpacing:"0.1em", textTransform:"uppercase" }}>{k}</span>
              <span style={{ color:C.text, fontWeight:900 }}>{v}</span>
            </div>
          ))}
        </div>
        <div style={{ ...Card, padding:"1.2rem" }}>
          <Tag>Phase 2 API Contract</Tag>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"0.55rem", marginTop:"1rem" }}>
            {API_ROUTES.map(r=>(
              <code key={r} style={{ display:"block", padding:"0.65rem 0.75rem", background:"#0e0a04", border:`1px solid ${C.border}`, color:C.goldBri, fontFamily:"monospace", fontSize:"0.73rem" }}>{r}</code>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Heading({ tag, title, sub }: { tag:string; title:string; sub:string }) {
  return (
    <div style={{ marginBottom:"2rem" }}>
      <Tag>{tag}</Tag>
      <h2 style={{ margin:"0.5rem 0 0", color:C.goldBri, fontFamily:"Georgia,serif", fontSize:"clamp(2.4rem,6vw,5rem)", fontWeight:900, letterSpacing:"-0.05em", textTransform:"uppercase", lineHeight:0.9 }}>{title}</h2>
      <p style={{ margin:"0.8rem 0 0", color:C.textMuted, maxWidth:"48rem", lineHeight:1.7, fontSize:"0.95rem" }}>{sub}</p>
    </div>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span style={{ display:"inline-block", padding:"0.2rem 0.6rem", background:C.bgCard, border:`1px solid ${C.border}`, color:C.gold, fontSize:"0.68rem", fontWeight:900, letterSpacing:"0.22em", textTransform:"uppercase" }}>
      {children}
    </span>
  );
}

const Wrap: React.CSSProperties = { width:"min(1180px,calc(100% - 2rem))", margin:"0 auto", padding:"2.5rem 0 5rem" };
const Card: React.CSSProperties = { background:C.bgCard, border:`1px solid ${C.border}`, boxShadow:"0 8px 40px rgba(0,0,0,0.5)" };
const BtnP: React.CSSProperties = { minHeight:"2.8rem", padding:"0 1.4rem", color:"#1a0900", background:"linear-gradient(135deg,#ffe090,#d4881e 50%,#8e3d10)", border:`1px solid ${C.goldBri}88`, fontWeight:900, fontSize:"0.76rem", letterSpacing:"0.12em", textTransform:"uppercase", cursor:"pointer", boxShadow:`0 0 18px ${C.gold}44, 0 4px 16px rgba(0,0,0,0.5)`, transition:"all 150ms" };
const BtnS: React.CSSProperties = { ...BtnP, color:C.goldBri, background:C.bgCard, border:`1px solid ${C.border}`, boxShadow:"none" };
const LblS: React.CSSProperties = { display:"grid", gap:"0.4rem", color:C.gold, fontSize:"0.7rem", fontWeight:900, letterSpacing:"0.14em", textTransform:"uppercase" };
const InpS: React.CSSProperties = { width:"100%", minHeight:"2.8rem", padding:"0 0.8rem", color:C.text, background:"#0e0a04", border:`1px solid ${C.border}`, outline:"none", fontFamily:"inherit", fontSize:"0.92rem" };