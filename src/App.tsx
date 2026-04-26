import { useMemo, useState } from "react";

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

const navItems: { page: Page; label: string }[] = [
  { page: "home", label: "Home" },
  { page: "inventory", label: "Inventory" },
  { page: "trade", label: "Trade" },
  { page: "profile", label: "Profile" },
];

const baseInventory: InventoryItem[] = [
  {
    id: "skin-001",
    name: "High Noon Marshal",
    weapon: "Rifle",
    rarity: "Covert",
    finish: "Sun-baked gold receiver with black iron barrel",
    value: 7200,
    equipped: true,
  },
  {
    id: "skin-002",
    name: "Dustline Peacemaker",
    weapon: "Pistol",
    rarity: "Classified",
    finish: "Engraved brass slide with worn leather grip",
    value: 3600,
  },
  {
    id: "skin-003",
    name: "Canyon Breacher",
    weapon: "Shotgun",
    rarity: "Restricted",
    finish: "Charcoal steel with orange clay inlay",
    value: 1800,
  },
  {
    id: "skin-004",
    name: "Ghost Town Varmint",
    weapon: "Rifle",
    rarity: "Mil-Spec",
    finish: "Matte bone pattern across desert tan polymer",
    value: 950,
  },
  {
    id: "skin-005",
    name: "Rail Spur",
    weapon: "Pistol",
    rarity: "Industrial",
    finish: "Blued steel, brass pinstripe, serialized frame",
    value: 520,
  },
  {
    id: "skin-006",
    name: "Claim Stake",
    weapon: "Knife",
    rarity: "Consumer",
    finish: "Weathered wood handle and brushed iron blade",
    value: 260,
  },
];

const initialTrades: Trade[] = [
  {
    id: "tr-8841",
    from: "RanchHand",
    to: "You",
    item: "Rail Spur",
    status: "pending",
    createdAt: "2 min ago",
  },
  {
    id: "tr-8816",
    from: "You",
    to: "Marshal_13",
    item: "Ghost Town Varmint",
    status: "accepted",
    createdAt: "Yesterday",
  },
  {
    id: "tr-8799",
    from: "Prospector",
    to: "You",
    item: "Canyon Breacher",
    status: "rejected",
    createdAt: "3 days ago",
  },
];

const apiContract = [
  "POST /register",
  "POST /login",
  "GET /profile",
  "GET /inventory",
  "POST /inventory/add",
  "DELETE /inventory/remove",
  "POST /trade/send",
  "POST /trade/respond",
  "GET /trade/history",
];

function formatCredits(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

export default function App() {
  const [page, setPage] = useState<Page>("home");
  const [inventory, setInventory] = useState(baseInventory);
  const [trades, setTrades] = useState(initialTrades);
  const [selectedItemId, setSelectedItemId] = useState(baseInventory[0].id);
  const [receiver, setReceiver] = useState("Marshal_13");
  const [launchState, setLaunchState] = useState("Ready");

  const selectedItem = inventory.find((item) => item.id === selectedItemId) ?? inventory[0];
  const profileValue = useMemo(
    () => inventory.reduce((total, item) => total + item.value, 0),
    [inventory],
  );

  function launchGame() {
    const fakeToken = "jwt.phase1.local." + crypto.randomUUID().slice(0, 8);
    setLaunchState("Token issued");
    window.setTimeout(() => setLaunchState(`Launch command copied: fps_client.exe --token=${fakeToken}`), 450);
  }

  function equipItem(itemId: string) {
    setInventory((items) =>
      items.map((item) => ({ ...item, equipped: item.id === itemId && item.weapon === "Rifle" })),
    );
    setSelectedItemId(itemId);
  }

  function sendTrade() {
    if (!selectedItem || receiver.trim().length < 3) return;

    const trade: Trade = {
      id: `tr-${Math.floor(9000 + Math.random() * 999)}`,
      from: "You",
      to: receiver.trim(),
      item: selectedItem.name,
      status: "pending",
      createdAt: "Just now",
    };

    setTrades((history) => [trade, ...history]);
  }

  function respondToTrade(tradeId: string, status: Exclude<TradeStatus, "pending">) {
    setTrades((history) =>
      history.map((trade) => (trade.id === tradeId ? { ...trade, status } : trade)),
    );
  }

  return (
    <main
      className="app-shell"
      style={{
        minHeight: "100vh",
        color: "#f7ead3",
        background:
          "radial-gradient(circle at 18% 14%, rgba(244,176,67,0.24), transparent 28rem), linear-gradient(125deg, #060504 0%, #16100a 48%, #070604 100%)",
      }}
    >

      <div className="scanline" />
      <header className="topbar">
        <button className="brand-mark" onClick={() => setPage("home")} aria-label="Open home">
          <span className="brand-sigil">DR</span>
          <span>
            <strong>Dust Reign</strong>
            <small>Tactical FPS Network</small>
          </span>
        </button>

        <nav className="nav-tabs" aria-label="Primary navigation">
          {navItems.map((item) => (
            <button
              key={item.page}
              className={page === item.page ? "active" : ""}
              onClick={() => setPage(item.page)}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </header>

      {page === "home" && <HomePage launchState={launchState} onLaunch={launchGame} />}
      {page === "inventory" && (
        <InventoryPage inventory={inventory} selectedItemId={selectedItemId} onEquip={equipItem} />
      )}
      {page === "trade" && (
        <TradePage
          inventory={inventory}
          selectedItemId={selectedItemId}
          receiver={receiver}
          trades={trades}
          onReceiverChange={setReceiver}
          onItemChange={setSelectedItemId}
          onSendTrade={sendTrade}
          onRespond={respondToTrade}
        />
      )}
      {page === "profile" && <ProfilePage inventoryValue={profileValue} trades={trades} />}
    </main>
  );
}

function HomePage({ launchState, onLaunch }: { launchState: string; onLaunch: () => void }) {
  return (
    <section className="hero-stage page-panel">
      <div className="desert-plane" aria-hidden="true">
        <span className="sun-core" />
        <span className="ridge ridge-one" />
        <span className="ridge ridge-two" />
        <span className="town town-left" />
        <span className="town town-right" />
        <span className="rail rail-one" />
        <span className="rail rail-two" />
        <span className="dust dust-one" />
        <span className="dust dust-two" />
      </div>

      <div className="hero-content">
        <p className="phase-label">Phase 1: Front-End Platform</p>
        <h1>Dust Reign</h1>
        <p className="hero-copy">
          A western tactical shooter hub for launching the client, inspecting skins, sending trades,
          and validating the future game-to-backend token flow.
        </p>
        <div className="hero-actions">
          <button className="primary-action" onClick={onLaunch}>Launch Game</button>
          <button className="secondary-action" onClick={() => navigator.clipboard?.writeText("/api/profile")}>Copy API Route</button>
        </div>
        <p className="launch-readout">{launchState}</p>
      </div>

      <div className="integration-ribbon">
        <span>Frontend</span>
        <i />
        <span>Backend API</span>
        <i />
        <span>Supabase</span>
        <i />
        <span>FPS Client</span>
      </div>
    </section>
  );
}

function InventoryPage({
  inventory,
  selectedItemId,
  onEquip,
}: {
  inventory: InventoryItem[];
  selectedItemId: string;
  onEquip: (itemId: string) => void;
}) {
  const selectedItem = inventory.find((item) => item.id === selectedItemId) ?? inventory[0];

  return (
    <section className="page-panel inventory-layout">
      <div className="section-heading">
        <p className="phase-label">Inventory Service</p>
        <h2>Weapon Skins</h2>
        <span>Synced from GET /inventory after JWT validation.</span>
      </div>

      <div className="inventory-grid" role="list">
        {inventory.map((item) => (
          <button
            key={item.id}
            className={`skin-tile rarity-${item.rarity.toLowerCase().replace("-", "")} ${
              item.id === selectedItemId ? "selected" : ""
            }`}
            onClick={() => onEquip(item.id)}
            role="listitem"
          >
            <span className="weapon-silhouette" />
            <strong>{item.name}</strong>
            <small>{item.weapon} / {item.rarity}</small>
            <span>{formatCredits(item.value)} CR</span>
          </button>
        ))}
      </div>

      <aside className="inspect-panel">
        <p>Selected</p>
        <h3>{selectedItem.name}</h3>
        <span>{selectedItem.finish}</span>
        <dl>
          <div>
            <dt>Weapon</dt>
            <dd>{selectedItem.weapon}</dd>
          </div>
          <div>
            <dt>Rarity</dt>
            <dd>{selectedItem.rarity}</dd>
          </div>
          <div>
            <dt>Market</dt>
            <dd>{formatCredits(selectedItem.value)} CR</dd>
          </div>
          <div>
            <dt>Status</dt>
            <dd>{selectedItem.equipped ? "Equipped" : "Available"}</dd>
          </div>
        </dl>
      </aside>
    </section>
  );
}

function TradePage({
  inventory,
  selectedItemId,
  receiver,
  trades,
  onReceiverChange,
  onItemChange,
  onSendTrade,
  onRespond,
}: {
  inventory: InventoryItem[];
  selectedItemId: string;
  receiver: string;
  trades: Trade[];
  onReceiverChange: (value: string) => void;
  onItemChange: (value: string) => void;
  onSendTrade: () => void;
  onRespond: (tradeId: string, status: Exclude<TradeStatus, "pending">) => void;
}) {
  return (
    <section className="page-panel trade-layout">
      <div className="section-heading">
        <p className="phase-label">Trade Service</p>
        <h2>Secure Item Exchange</h2>
        <span>Pending trades remain immutable until the receiver responds.</span>
      </div>

      <form className="trade-console" onSubmit={(event) => { event.preventDefault(); onSendTrade(); }}>
        <label>
          Receiver
          <input value={receiver} onChange={(event) => onReceiverChange(event.target.value)} minLength={3} />
        </label>
        <label>
          Item
          <select value={selectedItemId} onChange={(event) => onItemChange(event.target.value)}>
            {inventory.map((item) => (
              <option key={item.id} value={item.id}>{item.name}</option>
            ))}
          </select>
        </label>
        <button className="primary-action" type="submit">Send Trade</button>
      </form>

      <div className="trade-history">
        {trades.map((trade) => (
          <article key={trade.id} className={`trade-row ${trade.status}`}>
            <div>
              <strong>{trade.item}</strong>
              <span>{trade.from} to {trade.to} / {trade.createdAt}</span>
            </div>
            <mark>{trade.status}</mark>
            {trade.status === "pending" && trade.to === "You" && (
              <div className="trade-actions">
                <button onClick={() => onRespond(trade.id, "accepted")}>Accept</button>
                <button onClick={() => onRespond(trade.id, "rejected")}>Reject</button>
              </div>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}

function ProfilePage({ inventoryValue, trades }: { inventoryValue: number; trades: Trade[] }) {
  const acceptedTrades = trades.filter((trade) => trade.status === "accepted").length;

  return (
    <section className="page-panel profile-layout">
      <div className="section-heading">
        <p className="phase-label">Authenticated Operator</p>
        <h2>Profile</h2>
        <span>JWT identity payload presented as the future GET /profile response.</span>
      </div>

      <div className="operator-plate">
        <div className="operator-avatar">DR</div>
        <div>
          <h3>Deadeye</h3>
          <p>deadeye@dustreign.gg</p>
        </div>
      </div>

      <div className="profile-metrics">
        <div><span>Inventory Value</span><strong>{formatCredits(inventoryValue)} CR</strong></div>
        <div><span>Accepted Trades</span><strong>{acceptedTrades}</strong></div>
        <div><span>Rank</span><strong>Frontier Elite</strong></div>
      </div>

      <div className="api-contract">
        <h3>Phase 2 API Contract</h3>
        {apiContract.map((route) => <code key={route}>{route}</code>)}
      </div>
    </section>
  );
}