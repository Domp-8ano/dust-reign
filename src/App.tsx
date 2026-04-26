import { useEffect, useMemo, useState } from "react";

/* ─── TYPES ──────────────────────────────────────────────────────────────── */
type Page = "home" | "inventory" | "trade" | "profile";
type Rarity = "Consumer" | "Industrial" | "Mil-Spec" | "Restricted" | "Classified" | "Covert";
type TradeStatus = "pending" | "accepted" | "rejected";

type InventoryItem = {
  id: string;
  name: string;
  weapon: string;
  rarity: Rarity;
  finish: string;
  value: number;
  equipped?: boolean;
};

type Trade = {
  id: string;
  from: string;
  to: string;
  item: string;
  status: TradeStatus;
  createdAt: string;
};

/* ─── DATA ───────────────────────────────────────────────────────────────── */
const NAV: { page: Page; label: string }[] = [
  { page: "home",      label: "Home"      },
  { page: "inventory", label: "Inventory" },
  { page: "trade",     label: "Trade"     },
  { page: "profile",   label: "Profile"   },
];

const SKINS: InventoryItem[] = [
  { id: "s1", name: "High Noon Marshal",   weapon: "Rifle",   rarity: "Covert",     finish: "Sun-baked gold receiver with black iron barrel",  value: 7200, equipped: true },
  { id: "s2", name: "Dustline Peacemaker", weapon: "Pistol",  rarity: "Classified", finish: "Engraved brass slide with worn leather grip",      value: 3600 },
  { id: "s3", name: "Canyon Breacher",     weapon: "Shotgun", rarity: "Restricted", finish: "Charcoal steel with orange clay inlay",            value: 1800 },
  { id: "s4", name: "Ghost Town Varmint",  weapon: "Rifle",   rarity: "Mil-Spec",   finish: "Matte bone pattern across desert tan polymer",     value: 950  },
  { id: "s5", name: "Rail Spur",           weapon: "Pistol",  rarity: "Industrial", finish: "Blued steel, brass pinstripe, serialized frame",   value: 520  },
  { id: "s6", name: "Claim Stake",         weapon: "Knife",   rarity: "Consumer",   finish: "Weathered wood handle and brushed iron blade",     value: 260  },
];

const INIT_TRADES: Trade[] = [
  { id: "t1", from: "RanchHand",  to: "You",        item: "Rail Spur",          status: "pending",  createdAt: "2 min ago"  },
  { id: "t2", from: "You",        to: "Marshal_13", item: "Ghost Town Varmint", status: "accepted", createdAt: "Yesterday"  },
  { id: "t3", from: "Prospector", to: "You",        item: "Canyon Breacher",    status: "rejected", createdAt: "3 days ago" },
];

const API_ROUTES = [
  "POST /register", "POST /login", "GET /profile",
  "GET /inventory", "POST /inventory/add", "DELETE /inventory/remove",
  "POST /trade/send", "POST /trade/respond", "GET /trade/history",
];

const RARITY_COLOR: Record<Rarity, string> = {
  "Consumer":   "#a8a8a8",
  "Industrial": "#70a4d8",
  "Mil-Spec":   "#4d75ff",
  "Restricted": "#9a5cff",
  "Classified": "#d646d6",
  "Covert":     "#ff4c38",
};

const STATUS_COLOR: Record<TradeStatus, string> = {
  pending:  "#f2b84b",
  accepted: "#67d184",
  rejected: "#c74a2f",
};

function cr(n: number) {
  return new Intl.NumberFormat("en-US").format(n) + " CR";
}

/* ─── SPLASH ─────────────────────────────────────────────────────────────── */
function Splash() {
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9999,
      background: "#080603",
      display: "flex", alignItems: "center", justifyContent: "center",
      flexDirection: "column", gap: "1rem",
    }}>
      <div style={{
        width: "4rem", height: "4rem",
        background: "linear-gradient(135deg,#fff0bf,#d48a2a 45%,#7c3d18)",
        display: "grid", placeItems: "center",
        color: "#190e04", fontWeight: 900, fontSize: "1.3rem",
        border: "1px solid rgba(255,234,183,0.62)",
        boxShadow: "0 0 40px rgba(242,184,75,0.5)",
        transform: "skewX(-7deg)",
      }}>DR</div>
      <p style={{ margin: 0, color: "#fff4d7", fontFamily: "Georgia,serif", fontSize: "2.5rem", fontWeight: 900, letterSpacing: "-0.07em", textTransform: "uppercase" }}>
        Dust Reign
      </p>
      <p style={{ margin: 0, color: "rgba(247,234,211,0.5)", fontSize: "0.7rem", fontWeight: 900, letterSpacing: "0.26em", textTransform: "uppercase" }}>
        Loading Platform…
      </p>
      <div style={{ width: "10rem", height: "2px", background: "rgba(242,184,75,0.15)", overflow: "hidden", marginTop: "0.5rem" }}>
        <div className="splash-bar-fill" style={{ height: "100%", background: "linear-gradient(90deg,transparent,#f2b84b,#ffd27a,transparent)" }} />
      </div>
    </div>
  );
}

/* ─── APP ────────────────────────────────────────────────────────────────── */
export default function App() {
  const [ready,       setReady]      = useState(false);
  const [page,        setPage]       = useState<Page>("home");
  const [inventory]                  = useState(SKINS);
  const [trades,      setTrades]     = useState(INIT_TRADES);
  const [selectedId,  setSelectedId] = useState(SKINS[0].id);
  const [receiver,    setReceiver]   = useState("Marshal_13");
  const [launchState, setLaunchState]= useState("Ready");

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 600);
    return () => clearTimeout(t);
  }, []);

  const selected   = inventory.find(i => i.id === selectedId) ?? inventory[0];
  const totalValue = useMemo(() => inventory.reduce((s, i) => s + i.value, 0), [inventory]);

  function launch() {
    const token = "jwt.phase1." + crypto.randomUUID().slice(0, 8);
    setLaunchState("Issuing token…");
    setTimeout(() => setLaunchState(`fps_client.exe --token=${token}`), 400);
  }

  function sendTrade() {
    if (receiver.trim().length < 2) return;
    setTrades(prev => [{
      id: "t" + Date.now(),
      from: "You", to: receiver.trim(),
      item: selected.name,
      status: "pending",
      createdAt: "Just now",
    }, ...prev]);
  }

  function respond(id: string, status: Exclude<TradeStatus, "pending">) {
    setTrades(prev => prev.map(t => t.id === id ? { ...t, status } : t));
  }

  if (!ready) return <Splash />;

  const shell: React.CSSProperties = {
    minHeight: "100vh",
    background: "linear-gradient(125deg,#060504 0%,#16100a 48%,#070604 100%)",
    color: "#f7ead3",
    fontFamily: "Inter,ui-sans-serif,system-ui,sans-serif",
  };

  return (
    <div style={shell} className="app-shell">
      <div className="scanline" />

      {/* ── TOPBAR ── */}
      <header className="topbar" style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 20,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "1rem clamp(1rem,4vw,4rem)",
        background: "rgba(8,6,3,0.88)",
        borderBottom: "1px solid rgba(242,184,75,0.14)",
        backdropFilter: "blur(18px)",
        gap: "1rem",
      }}>
        <button onClick={() => setPage("home")} style={{
          display: "flex", alignItems: "center", gap: "0.85rem",
          background: "transparent", border: 0, color: "#fff3dc", cursor: "pointer",
        }}>
          <div style={{
            width: "2.85rem", height: "2.85rem",
            background: "linear-gradient(135deg,#fff0bf,#d48a2a 45%,#7c3d18)",
            display: "grid", placeItems: "center",
            color: "#190e04", fontWeight: 950, letterSpacing: "-0.06em",
            border: "1px solid rgba(255,234,183,0.62)",
            boxShadow: "0 0 30px rgba(242,184,75,0.3)",
            transform: "skewX(-7deg)", fontSize: "0.9rem",
          }}>DR</div>
          <div style={{ textAlign: "left" }}>
            <div style={{ fontWeight: 900, fontSize: "1rem", letterSpacing: "0.14em", textTransform: "uppercase" }}>Dust Reign</div>
            <div style={{ fontSize: "0.65rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(247,234,211,0.52)" }}>Tactical FPS Network</div>
          </div>
        </button>

        <nav style={{ display: "flex", gap: "0.25rem", padding: "0.3rem", background: "rgba(12,10,8,0.42)", border: "1px solid rgba(242,184,75,0.14)" }}>
          {NAV.map(n => (
            <button key={n.page} onClick={() => setPage(n.page)} style={{
              padding: "0.7rem 1rem",
              background: page === n.page ? "rgba(242,184,75,0.14)" : "transparent",
              border: 0, color: page === n.page ? "#fff6df" : "rgba(247,234,211,0.72)",
              fontWeight: 800, fontSize: "0.75rem", letterSpacing: "0.12em",
              textTransform: "uppercase", cursor: "pointer",
              borderBottom: page === n.page ? "1px solid #ffd27a" : "1px solid transparent",
              transition: "all 180ms ease",
            }}>{n.label}</button>
          ))}
        </nav>
      </header>

      {/* ── PAGES ── */}
      <div style={{ paddingTop: "5rem" }}>
        {page === "home"      && <HomePage      launch={launch} launchState={launchState} />}
        {page === "inventory" && <InventoryPage inventory={inventory} selectedId={selectedId} onSelect={setSelectedId} />}
        {page === "trade"     && <TradePage     inventory={inventory} selectedId={selectedId} receiver={receiver} trades={trades} onSelect={setSelectedId} onReceiver={setReceiver} onSend={sendTrade} onRespond={respond} />}
        {page === "profile"   && <ProfilePage   totalValue={totalValue} trades={trades} />}
      </div>
    </div>
  );
}

/* ─── HOME PAGE ──────────────────────────────────────────────────────────── */
function HomePage({ launch, launchState }: { launch: () => void; launchState: string }) {
  return (
    <section style={{
      minHeight: "calc(100vh - 5rem)",
      display: "flex", alignItems: "center",
      padding: "2rem clamp(1rem,6vw,6rem)",
      position: "relative", overflow: "hidden",
    }}>
      <div style={{
        position: "absolute", inset: 0, zIndex: 0,
        background: "radial-gradient(circle at 72% 30%, rgba(255,205,111,0.18) 0%, transparent 50%), linear-gradient(155deg,#2d1609 0%,#120c08 54%,#080503 100%)",
      }} />

      {/* sun glow */}
      <div style={{
        position: "absolute", top: "12%", right: "14%", zIndex: 0,
        width: "clamp(12rem,22vw,22rem)", aspectRatio: "1",
        borderRadius: "999px",
        background: "radial-gradient(circle,rgba(255,225,142,0.7),rgba(220,112,43,0.18) 55%,transparent 72%)",
        filter: "blur(2px)",
      }} />

      <div style={{ position: "relative", zIndex: 1, maxWidth: "760px" }}>
        <p style={{ margin: "0 0 0.8rem", color: "#ffd27a", fontSize: "0.74rem", fontWeight: 900, letterSpacing: "0.26em", textTransform: "uppercase" }}>
          Phase 1 · Front-End Platform
        </p>
        <h1 style={{
          margin: 0, color: "#fff4d7",
          fontFamily: "Georgia,'Times New Roman',serif",
          fontSize: "clamp(4.5rem,14vw,12rem)",
          fontWeight: 900, lineHeight: 0.8,
          letterSpacing: "-0.09em", textTransform: "uppercase",
          textShadow: "0 0 40px rgba(242,184,75,0.22), 0 20px 60px rgba(0,0,0,0.8)",
        }}>
          Dust<br />Reign
        </h1>
        <p style={{ maxWidth: "42rem", margin: "1.5rem 0 0", color: "rgba(255,240,211,0.8)", fontSize: "clamp(0.95rem,1.5vw,1.2rem)", lineHeight: 1.75 }}>
          A western tactical shooter hub. Launch the client, inspect weapon skins,
          send secure item trades and sync your JWT identity with the FPS engine.
        </p>

        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.85rem", marginTop: "2rem" }}>
          <button onClick={launch} style={btnPrimary}>🎮 Launch Game</button>
          <button onClick={() => {}} style={btnSecondary}>View Inventory</button>
        </div>

        <p style={{ marginTop: "1rem", minHeight: "1.4rem", color: "rgba(255,240,211,0.55)", fontFamily: "monospace", fontSize: "0.78rem" }}>
          {launchState}
        </p>

        <div style={{ marginTop: "3rem", display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
          {["Frontend", "Backend API", "Supabase DB", "FPS Client"].map((label, i, arr) => (
            <span key={label} style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <span style={{ color: "rgba(255,238,202,0.5)", fontSize: "0.7rem", fontWeight: 900, letterSpacing: "0.18em", textTransform: "uppercase" }}>{label}</span>
              {i < arr.length - 1 && <span style={{ display: "block", width: "3rem", height: "1px", background: "linear-gradient(90deg,transparent,rgba(242,184,75,0.5),transparent)" }} />}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── INVENTORY PAGE ─────────────────────────────────────────────────────── */
function InventoryPage({ inventory, selectedId, onSelect }: {
  inventory: InventoryItem[];
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  const selected = inventory.find(i => i.id === selectedId) ?? inventory[0];

  return (
    <section style={pageWrap}>
      <PageHeading tag="Inventory Service" title="Weapon Skins" sub="Synced from GET /inventory after JWT validation." />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: "1.2rem", alignItems: "start" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: "0.8rem" }}>
          {inventory.map(item => (
            <button key={item.id} onClick={() => onSelect(item.id)} style={{
              position: "relative", overflow: "hidden",
              minHeight: "12rem", padding: "1rem",
              textAlign: "left", cursor: "pointer",
              background: item.id === selectedId
                ? "linear-gradient(145deg,rgba(255,255,255,0.09),rgba(255,255,255,0.02))"
                : "linear-gradient(145deg,rgba(255,255,255,0.05),rgba(255,255,255,0.01))",
              border: `1px solid ${item.id === selectedId ? "rgba(255,210,122,0.6)" : "rgba(242,184,75,0.18)"}`,
              borderRight: `3px solid ${RARITY_COLOR[item.rarity]}`,
              color: "#fff0d0",
              transition: "all 180ms ease",
              boxShadow: item.id === selectedId ? `0 0 24px ${RARITY_COLOR[item.rarity]}33` : "none",
            }}>
              <div style={{
                position: "absolute", top: "2rem", left: "1rem",
                width: "75%", height: "2rem",
                background: "linear-gradient(to right,transparent 8%,rgba(255,236,196,0.6) 9% 72%,transparent 73%)",
                transform: "rotate(-5deg)",
                filter: `drop-shadow(0 0 12px ${RARITY_COLOR[item.rarity]}66)`,
              }} />
              <strong style={{ display: "block", marginTop: "6rem", fontSize: "0.95rem", fontWeight: 900 }}>{item.name}</strong>
              <small style={{ display: "block", marginTop: "0.3rem", color: "rgba(247,234,211,0.52)", fontSize: "0.78rem" }}>{item.weapon} · {item.rarity}</small>
              <span style={{ display: "block", marginTop: "0.6rem", color: "#ffd27a", fontWeight: 900 }}>{cr(item.value)}</span>
            </button>
          ))}
        </div>

        {/* inspect panel */}
        <div style={{ ...glassPanel, position: "sticky", top: "6rem", padding: "1.2rem" }}>
          <p style={tagStyle}>Selected Item</p>
          <h3 style={{ margin: "0.6rem 0 0", color: "#fff2d4", fontSize: "1.6rem", lineHeight: 1 }}>{selected.name}</h3>
          <p style={{ margin: "0.7rem 0 0", color: "rgba(247,234,211,0.7)", lineHeight: 1.6, fontSize: "0.9rem" }}>{selected.finish}</p>
          {[
            ["Weapon", selected.weapon],
            ["Rarity", selected.rarity],
            ["Value",  cr(selected.value)],
            ["Status", selected.equipped ? "Equipped" : "Available"],
          ].map(([k, v]) => (
            <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "0.75rem 0", borderTop: "1px solid rgba(242,184,75,0.12)" }}>
              <span style={{ color: "rgba(247,234,211,0.52)", fontSize: "0.74rem", fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase" }}>{k}</span>
              <span style={{ color: "#fff0d0", fontWeight: 900 }}>{v}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── TRADE PAGE ─────────────────────────────────────────────────────────── */
function TradePage({ inventory, selectedId, receiver, trades, onSelect, onReceiver, onSend, onRespond }: {
  inventory: InventoryItem[];
  selectedId: string;
  receiver: string;
  trades: Trade[];
  onSelect: (id: string) => void;
  onReceiver: (v: string) => void;
  onSend: () => void;
  onRespond: (id: string, status: Exclude<TradeStatus, "pending">) => void;
}) {
  return (
    <section style={pageWrap}>
      <PageHeading tag="Trade Service" title="Item Exchange" sub="Pending trades are immutable until the receiver responds via POST /trade/respond." />

      <div style={{ display: "grid", gridTemplateColumns: "340px 1fr", gap: "1.2rem", alignItems: "start" }}>
        {/* send form */}
        <form onSubmit={e => { e.preventDefault(); onSend(); }} style={{ ...glassPanel, padding: "1.2rem", display: "grid", gap: "1rem" }}>
          <p style={tagStyle}>New Trade</p>
          <label style={labelStyle}>
            Receiver
            <input value={receiver} onChange={e => onReceiver(e.target.value)}
              style={inputStyle} placeholder="Username…" minLength={2} />
          </label>
          <label style={labelStyle}>
            Item
            <select value={selectedId} onChange={e => onSelect(e.target.value)} style={inputStyle}>
              {inventory.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
            </select>
          </label>
          <button type="submit" style={btnPrimary}>Send Trade</button>
        </form>

        {/* history */}
        <div style={{ display: "grid", gap: "0.65rem" }}>
          {trades.map(trade => (
            <div key={trade.id} style={{
              display: "grid", gridTemplateColumns: "1fr auto auto",
              alignItems: "center", gap: "1rem", padding: "1rem",
              background: "rgba(255,255,255,0.035)",
              border: "1px solid rgba(242,184,75,0.14)",
              transition: "all 180ms ease",
            }}>
              <div>
                <strong style={{ display: "block", color: "#fff1d0", fontWeight: 900 }}>{trade.item}</strong>
                <span style={{ display: "block", marginTop: "0.25rem", color: "rgba(247,234,211,0.52)", fontSize: "0.84rem" }}>
                  {trade.from} → {trade.to} · {trade.createdAt}
                </span>
              </div>
              <span style={{
                padding: "0.3rem 0.6rem",
                background: STATUS_COLOR[trade.status],
                color: trade.status === "pending" ? "#130c06" : "#fff",
                fontSize: "0.66rem", fontWeight: 950,
                letterSpacing: "0.12em", textTransform: "uppercase",
              }}>{trade.status}</span>
              {trade.status === "pending" && trade.to === "You" && (
                <div style={{ display: "flex", gap: "0.4rem" }}>
                  <button onClick={() => onRespond(trade.id, "accepted")} style={{ ...btnPrimary, minHeight: "2.2rem", padding: "0 0.7rem", fontSize: "0.68rem" }}>Accept</button>
                  <button onClick={() => onRespond(trade.id, "rejected")} style={{ ...btnSecondary, minHeight: "2.2rem", padding: "0 0.7rem", fontSize: "0.68rem" }}>Reject</button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── PROFILE PAGE ───────────────────────────────────────────────────────── */
function ProfilePage({ totalValue, trades }: { totalValue: number; trades: Trade[] }) {
  const accepted = trades.filter(t => t.status === "accepted").length;

  return (
    <section style={pageWrap}>
      <PageHeading tag="Authenticated Operator" title="Profile" sub="JWT identity payload — future GET /profile response." />

      <div style={{ display: "grid", gridTemplateColumns: "360px 1fr", gap: "1.2rem", alignItems: "start" }}>
        <div style={{ display: "grid", gap: "0.8rem" }}>
          {/* operator plate */}
          <div style={{ ...glassPanel, display: "flex", alignItems: "center", gap: "1rem", padding: "1.2rem" }}>
            <div style={{
              width: "5rem", height: "5rem", flexShrink: 0,
              background: "linear-gradient(135deg,#ffe8a9,#c77727)",
              display: "grid", placeItems: "center",
              color: "#170d05", fontSize: "1.4rem", fontWeight: 950,
              boxShadow: "0 0 34px rgba(242,184,75,0.25)",
            }}>DR</div>
            <div>
              <h3 style={{ margin: 0, color: "#fff2d4", fontSize: "1.6rem", fontWeight: 900 }}>Deadeye</h3>
              <p style={{ margin: "0.25rem 0 0", color: "rgba(247,234,211,0.52)", fontSize: "0.85rem" }}>deadeye@dustreign.gg</p>
            </div>
          </div>

          {/* metrics */}
          {[
            ["Inventory Value", cr(totalValue)],
            ["Accepted Trades", String(accepted)],
            ["Rank",            "Frontier Elite"],
            ["Phase",           "1 — Frontend"],
          ].map(([k, v]) => (
            <div key={k} style={{ ...glassPanel, display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1rem 1.2rem" }}>
              <span style={{ color: "rgba(247,234,211,0.52)", fontSize: "0.74rem", fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase" }}>{k}</span>
              <span style={{ color: "#fff0d0", fontWeight: 900 }}>{v}</span>
            </div>
          ))}
        </div>

        {/* API contract */}
        <div style={{ ...glassPanel, padding: "1.2rem" }}>
          <p style={tagStyle}>Phase 2 API Contract</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "0.6rem", marginTop: "1rem" }}>
            {API_ROUTES.map(r => (
              <code key={r} style={{
                display: "block", padding: "0.7rem",
                background: "rgba(0,0,0,0.3)",
                border: "1px solid rgba(242,184,75,0.12)",
                color: "rgba(255,240,211,0.8)",
                fontFamily: "monospace", fontSize: "0.74rem",
              }}>{r}</code>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── SHARED UI HELPERS ──────────────────────────────────────────────────── */
function PageHeading({ tag, title, sub }: { tag: string; title: string; sub: string }) {
  return (
    <div style={{ marginBottom: "2rem" }}>
      <p style={tagStyle}>{tag}</p>
      <h2 style={{ margin: "0.4rem 0 0", color: "#fff2d4", fontFamily: "Georgia,serif", fontSize: "clamp(2.5rem,6vw,5rem)", fontWeight: 900, letterSpacing: "-0.06em", textTransform: "uppercase", lineHeight: 0.9 }}>{title}</h2>
      <p style={{ margin: "0.9rem 0 0", color: "rgba(247,234,211,0.7)", maxWidth: "48rem", lineHeight: 1.7 }}>{sub}</p>
    </div>
  );
}

/* ─── SHARED STYLES ──────────────────────────────────────────────────────── */
const pageWrap: React.CSSProperties = {
  width: "min(1180px, calc(100% - 2rem))",
  margin: "0 auto",
  padding: "2rem 0 4rem",
};

const glassPanel: React.CSSProperties = {
  background: "linear-gradient(145deg,rgba(23,18,12,0.82),rgba(15,11,8,0.6))",
  border: "1px solid rgba(242,184,75,0.18)",
  boxShadow: "0 22px 70px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.04)",
  backdropFilter: "blur(16px)",
};

const tagStyle: React.CSSProperties = {
  margin: 0,
  color: "#ffd27a",
  fontSize: "0.72rem",
  fontWeight: 900,
  letterSpacing: "0.22em",
  textTransform: "uppercase",
};

const labelStyle: React.CSSProperties = {
  display: "grid",
  gap: "0.4rem",
  color: "#ffd27a",
  fontSize: "0.72rem",
  fontWeight: 900,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  minHeight: "3rem",
  padding: "0 0.85rem",
  color: "#fff4d7",
  background: "rgba(5,4,3,0.6)",
  border: "1px solid rgba(242,184,75,0.24)",
  outline: "none",
  fontFamily: "inherit",
  fontSize: "0.95rem",
};

const btnPrimary: React.CSSProperties = {
  minHeight: "3rem",
  padding: "0 1.4rem",
  color: "#1b1006",
  background: "linear-gradient(135deg,#ffe3a0,#e59d33 48%,#8e471d)",
  border: "1px solid rgba(255,240,191,0.45)",
  fontWeight: 950,
  fontSize: "0.78rem",
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  cursor: "pointer",
  boxShadow: "0 0 24px rgba(242,184,75,0.2), 0 8px 24px rgba(0,0,0,0.3)",
  transition: "all 180ms ease",
};

const btnSecondary: React.CSSProperties = {
  ...btnPrimary,
  color: "#ffe8bf",
  background: "rgba(14,11,8,0.6)",
  border: "1px solid rgba(242,184,75,0.24)",
  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06)",
};

// suppress unused warning — used inline via spread
void btnSecondary;