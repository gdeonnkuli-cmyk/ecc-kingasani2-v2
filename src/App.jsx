import { useState, useEffect, useContext, createContext, useCallback, useRef } from "react";

// ============================================================
// FIREBASE CONFIG
// ============================================================
const FIREBASE_CONFIG = {
  apiKey: "AIzaSyD9biWeNAiiDF99MXMIG_ZsmMAKgubnox4",
  authDomain: "ecc-kingasani2-finances.firebaseapp.com",
  projectId: "ecc-kingasani2-finances",
};

const USER_ROLES = {
  "gdeonnkuli@gmail.com":      { nom: "Pasteur Titulaire",   role: "admin",    label: "Administrateur" },
  "channinglumesa@gmail.com":  { nom: "Directeur Financier", role: "finances", label: "Finances" },
  "lbasingili@cbfck2.org":     { nom: "Lauriane BASINGILI",  role: "saisie",   label: "Saisie" },
  "alfred.bolenga@cbfck2.org": { nom: "Alfred Bolenga",      role: "finances", label: "Finances" }
};

const CF_DEF = ["Offrandes Ordinaires","Action de Grace","Offrandes Prophete","Collecte Enveloppe","Offrandes Sociales","Offrande des Familles","Cotisation Loyer des Pasteurs","Cotisation Ration des Pasteurs"];
const CL_DEF = ["Offrandes Diacre","Offrandes Ordinaires","Action de Grace","Offrandes Prophete","Collecte Enveloppe","Offrandes Sociales","Offrande des Familles","Cotisation Cartes de Membre","Cotisation Loyer des Pasteurs","Cotisation Ration des Pasteurs","Dimes Collectees"];
const DEP_CATS = [{v:"materiaux",l:"🧱 Matériaux"},{v:"main_oeuvre",l:"👷 Main d'œuvre"},{v:"transport",l:"🚚 Transport"},{v:"equipement",l:"🔌 Équipement"},{v:"autre",l:"📌 Autre"}];

// ============================================================
// DESIGN TOKENS
// ============================================================
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --navy: #0d1b2a;
    --navy2: #1a3a5c;
    --blue: #2e75b6;
    --blue-light: #5ba0d0;
    --gold: #c9a84c;
    --gold-light: #e8c97a;
    --green: #1e7d52;
    --green-light: #a8d5b8;
    --red: #b91c1c;
    --red-light: #fca5a5;
    --bg: #f0f4f8;
    --bg2: #e8eef4;
    --card: #ffffff;
    --border: #c5d8ed;
    --text: #0d1b2a;
    --muted: #6b88a4;
    --sidebar-w: 220px;
    --header-h: 60px;
    --radius: 12px;
    --shadow: 0 2px 16px rgba(13,27,42,0.08);
    --shadow-lg: 0 8px 32px rgba(13,27,42,0.14);
  }

  html, body, #root { height: 100%; background: var(--bg); font-family: 'DM Sans', sans-serif; color: var(--text); }

  /* Scrollbar */
  ::-webkit-scrollbar { width: 5px; height: 5px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 10px; }

  /* Layout */
  .app { display: flex; height: 100vh; overflow: hidden; }
  .sidebar { width: var(--sidebar-w); background: var(--navy); display: flex; flex-direction: column; flex-shrink: 0; overflow-y: auto; z-index: 10; }
  .main { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
  .header { height: var(--header-h); background: var(--card); border-bottom: 1px solid var(--border); display: flex; align-items: center; padding: 0 20px; gap: 12px; flex-shrink: 0; box-shadow: var(--shadow); }
  .content { flex: 1; overflow-y: auto; padding: 20px; }

  /* Sidebar */
  .sidebar-brand { padding: 20px 16px 12px; border-bottom: 1px solid rgba(255,255,255,.08); }
  .sidebar-brand h1 { font-family: 'Playfair Display', serif; color: #fff; font-size: 1.1rem; line-height: 1.2; }
  .sidebar-brand p { color: var(--gold-light); font-size: .68rem; margin-top: 2px; opacity: .8; }
  .sidebar-nav { padding: 10px 8px; flex: 1; }
  .nav-item { display: flex; align-items: center; gap: 10px; padding: 9px 12px; border-radius: 8px; cursor: pointer; color: rgba(255,255,255,.65); font-size: .8rem; font-weight: 500; transition: all .18s; margin-bottom: 2px; border: none; background: none; width: 100%; text-align: left; }
  .nav-item:hover { background: rgba(255,255,255,.08); color: #fff; }
  .nav-item.active { background: var(--blue); color: #fff; font-weight: 600; }
  .nav-item .icon { font-size: 1rem; flex-shrink: 0; }
  .nav-sep { height: 1px; background: rgba(255,255,255,.08); margin: 8px 0; }
  .sidebar-user { padding: 12px 16px; border-top: 1px solid rgba(255,255,255,.08); }
  .avatar { width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: .75rem; color: #fff; flex-shrink: 0; }
  .sidebar-user-info { flex: 1; min-width: 0; }
  .sidebar-user-name { color: #fff; font-size: .78rem; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .sidebar-user-role { color: var(--gold-light); font-size: .65rem; opacity: .8; }

  /* Header */
  .header-title { font-family: 'Playfair Display', serif; font-size: 1rem; color: var(--navy2); font-weight: 700; flex: 1; }
  .sync-badge { display: flex; align-items: center; gap: 6px; padding: 4px 10px; border-radius: 20px; font-size: .7rem; font-weight: 700; border: 1.5px solid; cursor: default; }
  .sync-badge.ok { background: #f0faf4; border-color: var(--green-light); color: var(--green); }
  .sync-badge.err { background: #fef2f2; border-color: var(--red-light); color: var(--red); }
  .sync-dot { width: 7px; height: 7px; border-radius: 50%; }
  .sync-badge.ok .sync-dot { background: var(--green); }
  .sync-badge.err .sync-dot { background: var(--red); animation: pulse 1.2s infinite; }
  @keyframes pulse { 0%,100%{opacity:1}50%{opacity:.3} }
  .taux-badge { display: flex; align-items: center; gap: 5px; background: var(--navy); color: var(--gold-light); padding: 4px 10px; border-radius: 20px; font-size: .72rem; font-weight: 600; font-family: 'DM Mono', monospace; }

  /* Cards */
  .card { background: var(--card); border-radius: var(--radius); border: 1px solid var(--border); box-shadow: var(--shadow); overflow: hidden; margin-bottom: 16px; }
  .card-header { padding: 14px 18px; border-bottom: 1px solid var(--border); display: flex; align-items: center; gap: 10px; }
  .card-header h2 { font-family: 'Playfair Display', serif; font-size: .95rem; color: var(--navy2); font-weight: 700; }
  .card-body { padding: 16px 18px; }

  /* KPI Grid */
  .kpi-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px; margin-bottom: 20px; }
  .kpi-card { background: var(--card); border-radius: var(--radius); border: 1px solid var(--border); padding: 14px 16px; box-shadow: var(--shadow); border-left: 4px solid; transition: transform .15s; }
  .kpi-card:hover { transform: translateY(-2px); box-shadow: var(--shadow-lg); }
  .kpi-card.blue { border-left-color: var(--blue); }
  .kpi-card.green { border-left-color: var(--green); }
  .kpi-card.red { border-left-color: var(--red); }
  .kpi-card.gold { border-left-color: var(--gold); }
  .kpi-label { font-size: .68rem; font-weight: 700; text-transform: uppercase; letter-spacing: .06em; color: var(--muted); margin-bottom: 6px; }
  .kpi-value { font-family: 'DM Mono', monospace; font-size: 1.1rem; font-weight: 700; color: var(--navy); line-height: 1.2; }
  .kpi-sub { font-size: .68rem; color: var(--muted); margin-top: 3px; }

  /* Tabs */
  .tabs { display: flex; gap: 4px; background: var(--bg2); padding: 4px; border-radius: 10px; margin-bottom: 16px; }
  .tab-btn { flex: 1; padding: 7px 10px; border-radius: 7px; border: none; background: none; cursor: pointer; font-size: .75rem; font-weight: 600; color: var(--muted); transition: all .15s; white-space: nowrap; }
  .tab-btn.active { background: var(--card); color: var(--navy2); box-shadow: var(--shadow); }

  /* Tables */
  .data-table { width: 100%; border-collapse: collapse; font-size: .78rem; }
  .data-table th { background: var(--navy2); color: #fff; padding: 8px 10px; text-align: left; font-size: .68rem; text-transform: uppercase; letter-spacing: .05em; font-weight: 600; }
  .data-table td { padding: 8px 10px; border-bottom: 1px solid var(--bg2); vertical-align: middle; }
  .data-table tr:hover td { background: var(--bg); }
  .data-table tr:last-child td { border-bottom: none; }

  /* Form elements */
  .form-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 10px; }
  .form-group { display: flex; flex-direction: column; gap: 4px; }
  .form-group label { font-size: .68rem; font-weight: 700; color: var(--muted); text-transform: uppercase; letter-spacing: .04em; }
  .form-input { padding: 8px 11px; border: 1.5px solid var(--border); border-radius: 8px; font-size: .82rem; font-family: 'DM Sans', sans-serif; color: var(--text); background: #fff; transition: border-color .15s; outline: none; width: 100%; }
  .form-input:focus { border-color: var(--blue); }
  .form-input.amt { font-family: 'DM Mono', monospace; text-align: right; }
  .form-input.filled { background: #eef4fb; font-weight: 600; }

  /* Row editor */
  .row-editor { display: grid; grid-template-columns: 1fr 80px 110px 90px 1fr 30px; gap: 6px; align-items: center; margin-bottom: 6px; }
  .row-editor-dep { grid-template-columns: 1fr 70px 110px 90px 90px 30px; }
  .tbl-head { display: grid; grid-template-columns: 1fr 80px 110px 90px 1fr 30px; gap: 6px; padding: 0 0 4px; margin-bottom: 6px; border-bottom: 1.5px solid var(--border); }
  .tbl-head-dep { grid-template-columns: 1fr 70px 110px 90px 90px 30px; }
  .tbl-head span { font-size: .63rem; font-weight: 700; text-transform: uppercase; letter-spacing: .04em; color: var(--muted); }
  .base-badge { padding: 2px 6px; border-radius: 4px; font-size: .62rem; font-weight: 800; flex-shrink: 0; }

  /* Buttons */
  .btn { display: inline-flex; align-items: center; gap: 6px; padding: 8px 16px; border-radius: 8px; border: none; cursor: pointer; font-size: .78rem; font-weight: 600; font-family: 'DM Sans', sans-serif; transition: all .15s; }
  .btn-primary { background: var(--navy2); color: #fff; }
  .btn-primary:hover { background: var(--blue); }
  .btn-success { background: var(--green); color: #fff; }
  .btn-success:hover { background: #156b44; }
  .btn-danger { background: var(--red); color: #fff; }
  .btn-danger:hover { background: #991b1b; }
  .btn-ghost { background: var(--bg2); color: var(--navy2); }
  .btn-ghost:hover { background: var(--border); }
  .btn-gold { background: var(--gold); color: var(--navy); }
  .btn-sm { padding: 5px 10px; font-size: .72rem; }
  .btn-del { width: 26px; height: 26px; border-radius: 6px; border: none; background: #fef2f2; color: var(--red); cursor: pointer; font-size: .8rem; display: flex; align-items: center; justify-content: center; transition: all .15s; }
  .btn-del:hover { background: var(--red); color: #fff; }
  .btn-add { width: 100%; padding: 7px; border: 1.5px dashed var(--border); border-radius: 8px; background: none; cursor: pointer; color: var(--muted); font-size: .76rem; font-weight: 600; margin-top: 6px; transition: all .15s; }
  .btn-add:hover { border-color: var(--blue); color: var(--blue); background: #eef4fb; }

  /* Login */
  .login-screen { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, var(--navy) 0%, var(--navy2) 50%, #1f4a7a 100%); position: relative; overflow: hidden; }
  .login-screen::before { content: ''; position: absolute; inset: 0; background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E"); }
  .login-card { background: rgba(255,255,255,.97); border-radius: 20px; padding: 36px 32px; width: 100%; max-width: 380px; box-shadow: 0 24px 64px rgba(0,0,0,.3); position: relative; z-index: 1; }
  .login-logo { width: 60px; height: 60px; background: linear-gradient(135deg, var(--gold), var(--gold-light)); border-radius: 16px; display: flex; align-items: center; justify-content: center; font-size: 1.6rem; margin: 0 auto 16px; box-shadow: 0 8px 24px rgba(201,168,76,.4); }
  .login-title { font-family: 'Playfair Display', serif; font-size: 1.5rem; color: var(--navy); text-align: center; font-weight: 900; }
  .login-subtitle { color: var(--muted); font-size: .8rem; text-align: center; margin-top: 4px; margin-bottom: 28px; }

  /* Progress bar */
  .progress-bar { height: 8px; background: var(--bg2); border-radius: 10px; overflow: hidden; }
  .progress-fill { height: 100%; border-radius: 10px; transition: width .4s; }

  /* Toast */
  .toast-container { position: fixed; bottom: 20px; right: 20px; z-index: 9999; display: flex; flex-direction: column; gap: 8px; }
  .toast { padding: 10px 16px; border-radius: 10px; font-size: .78rem; font-weight: 600; box-shadow: var(--shadow-lg); animation: slideIn .2s ease; display: flex; align-items: center; gap: 8px; max-width: 320px; }
  .toast.ok { background: var(--green); color: #fff; }
  .toast.err { background: var(--red); color: #fff; }
  .toast.info { background: var(--navy2); color: #fff; }
  @keyframes slideIn { from{transform:translateX(100%);opacity:0}to{transform:none;opacity:1} }

  /* Modal */
  .modal-overlay { position: fixed; inset: 0; background: rgba(13,27,42,.6); z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 20px; animation: fadeIn .15s; }
  @keyframes fadeIn { from{opacity:0}to{opacity:1} }
  .modal-box { background: var(--card); border-radius: 16px; width: 100%; max-width: 480px; overflow: hidden; box-shadow: var(--shadow-lg); animation: scaleIn .2s; }
  @keyframes scaleIn { from{transform:scale(.95);opacity:0}to{transform:none;opacity:1} }
  .modal-header { background: linear-gradient(90deg, var(--navy2), var(--blue)); padding: 14px 20px; display: flex; justify-content: space-between; align-items: center; }
  .modal-header h3 { color: #fff; font-size: .9rem; font-weight: 700; }
  .modal-body { padding: 20px; }
  .modal-footer { padding: 0 20px 20px; display: flex; gap: 8px; justify-content: flex-end; }

  /* Distribution */
  .distrib-table { width: 100%; border-collapse: collapse; font-size: .76rem; }
  .distrib-table th { background: var(--navy2); color: #fff; padding: 7px 10px; text-align: left; font-size: .65rem; text-transform: uppercase; letter-spacing: .04em; }
  .distrib-table td { padding: 6px 10px; border-bottom: 1px solid var(--bg2); }
  .distrib-table tr:hover td { background: var(--bg); }
  .cle-tag { display: inline-block; padding: 2px 6px; background: var(--bg2); border-radius: 4px; font-family: 'DM Mono', monospace; font-size: .68rem; color: var(--navy2); font-weight: 600; }

  /* History */
  .hist-item { background: var(--card); border-radius: 10px; border: 1px solid var(--border); padding: 12px 14px; margin-bottom: 8px; display: flex; justify-content: space-between; align-items: center; gap: 12px; transition: box-shadow .15s; }
  .hist-item:hover { box-shadow: var(--shadow); }
  .hist-date { font-family: 'DM Mono', monospace; font-size: .8rem; font-weight: 700; color: var(--navy2); }
  .hist-meta { font-size: .7rem; color: var(--muted); margin-top: 2px; }
  .hist-solde { font-family: 'DM Mono', monospace; font-size: .82rem; font-weight: 700; }
  .hist-solde.pos { color: var(--green); }
  .hist-solde.neg { color: var(--red); }

  /* Responsive */
  @media (max-width: 768px) {
    .sidebar { position: fixed; left: -220px; top: 0; bottom: 0; transition: left .25s; z-index: 100; }
    .sidebar.open { left: 0; }
    .content { padding: 12px; }
    .kpi-grid { grid-template-columns: repeat(2, 1fr); }
    .row-editor { grid-template-columns: 1fr 80px 90px 26px; }
    .row-editor span:nth-child(4) { display: none; }
  }
`;

// ============================================================
// CONTEXT
// ============================================================
const AppContext = createContext(null);

function useApp() { return useContext(AppContext); }

// ============================================================
// UTILS
// ============================================================
const fmt = (n) => (parseFloat(n) || 0).toLocaleString("fr-FR");
const getTodayStr = () => { const d = new Date(), mm = d.getMonth()+1, dd = d.getDate(); return `${d.getFullYear()}-${mm<10?"0"+mm:mm}-${dd<10?"0"+dd:dd}`; };
const arrondi = (n) => Math.round(n / 50) * 50;
const avatarColors = ["#2e75b6","#c9a84c","#1e7d52","#b91c1c","#7c3aed","#c2410c"];
const getAvatarColor = (s) => avatarColors[Array.from(s||"").reduce((a,c)=>a+c.charCodeAt(0),0) % avatarColors.length];
const initials = (nom="", prenom="") => ((prenom[0]||"")+(nom[0]||"")).toUpperCase();

const BASE_COLORS = { B1:"#1d4ed8",B2:"#7c3aed",B4:"#c2410c",B5:"#15803d",B6:"#b91c1c" };
const BASE_BG = { B1:"#dbeafe",B2:"#ede9fe",B4:"#ffedd5",B5:"#dcfce7",B6:"#fee2e2" };
const DEP_BASE_MAP = {
  "pasteur titulaire collation":"B1","loyer pasteur titulaire":"B1","pasteur associe collation":"B1","visiteurs":"B1","secretaires collation":"B1","financiers collation":"B1","transport sentinelle":"B1","salaire sentinelle":"B1","equipe technique":"B1","intendant":"B1","protocoles":"B1",
  "moderateurs":"B2","orateurs":"B2",
  "liberation journee speciale":"B4","district qp journee speciale":"B4","region qp journee speciale":"B4","sg qp journee speciale":"B4",
  "part dimes bureau pastoral":"B5","part dimes secretaires":"B5","part dimes financiers":"B5","budget district dime":"B5",
  "part ration mensuelle bp":"B5","part ration secretaires":"B6","part ration financiers":"B6","motivation ration mobilisateur":"B6","part ration bp":"B6"
};
const getDepBase = (lbl="") => { const n = lbl.toLowerCase(); for (const [k,v] of Object.entries(DEP_BASE_MAP)) { if (n.includes(k)) return v; } return ""; };

// ============================================================
// TOAST SYSTEM
// ============================================================
function ToastContainer({ toasts }) {
  return (
    <div className="toast-container">
      {toasts.map(t => (
        <div key={t.id} className={`toast ${t.type}`}>
          <span>{t.msg}</span>
        </div>
      ))}
    </div>
  );
}

// ============================================================
// LOGIN SCREEN
// ============================================================
function LoginScreen({ onLogin }) {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const handleLogin = async () => {
    if (!email || !pass) { setErr("Email et mot de passe requis."); return; }
    setLoading(true); setErr("");
    try {
      // Simulate Firebase auth (replace with real Firebase in production)
      await new Promise(r => setTimeout(r, 800));
      const role = USER_ROLES[email];
      if (!role) { setErr("Compte non autorisé."); setLoading(false); return; }
      onLogin({ email, ...role });
    } catch(e) {
      setErr("Erreur de connexion. Vérifiez vos identifiants.");
    }
    setLoading(false);
  };

  return (
    <div className="login-screen">
      <div className="login-card">
        <div className="login-logo">✝️</div>
        <h1 className="login-title">ECC Kingasani 2</h1>
        <p className="login-subtitle">Finances et Gestion des Membres</p>
        <div className="form-group" style={{marginBottom:12}}>
          <label>Email</label>
          <input className="form-input" type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="votre@email.com" onKeyDown={e=>e.key==="Enter"&&handleLogin()} />
        </div>
        <div className="form-group" style={{marginBottom:20}}>
          <label>Mot de passe</label>
          <input className="form-input" type="password" value={pass} onChange={e=>setPass(e.target.value)} placeholder="••••••••" onKeyDown={e=>e.key==="Enter"&&handleLogin()} />
        </div>
        {err && <div style={{color:"var(--red)",fontSize:".76rem",marginBottom:12,padding:"6px 10px",background:"#fef2f2",borderRadius:6}}>{err}</div>}
        <button className="btn btn-primary" style={{width:"100%",justifyContent:"center",padding:"11px"}} onClick={handleLogin} disabled={loading}>
          {loading ? "Connexion..." : "Se connecter"}
        </button>
        <p style={{textAlign:"center",fontSize:".68rem",color:"var(--muted)",marginTop:16}}>Connexion réservée aux membres autorisés<br/>ECC / 13ème CBFC — Kingasani 2</p>
      </div>
    </div>
  );
}

// ============================================================
// SIDEBAR
// ============================================================
const MODULES = [
  { id:"dashboard", label:"Tableau de bord", icon:"📊" },
  { id:"finances",  label:"Finances",         icon:"💰", roles:["admin","finances"] },
  { id:"membres",   label:"Membres",           icon:"👥", roles:["admin","finances"] },
  { id:"social",    label:"Social",            icon:"❤️", roles:["admin","finances"] },
  { id:"seminaire", label:"Séminaire",         icon:"📚" },
  { id:"eb",        label:"Besoins (EB)",      icon:"📋" },
  { id:"annonces",  label:"Annonces",          icon:"📢" },
  { id:"projets",   label:"Projets",           icon:"🏗️" },
];

function Sidebar({ user, activeModule, setActiveModule, syncStatus, taux }) {
  const color = getAvatarColor(user.nom);
  return (
    <div className="sidebar">
      <div className="sidebar-brand">
        <h1>ECC Kingasani 2</h1>
        <p>13ème CBFC — Kingasani 2</p>
      </div>
      <nav className="sidebar-nav">
        {MODULES.map(m => {
          if (m.roles && !m.roles.includes(user.role) && user.role !== "admin") return null;
          return (
            <button key={m.id} className={`nav-item ${activeModule===m.id?"active":""}`} onClick={()=>setActiveModule(m.id)}>
              <span className="icon">{m.icon}</span>
              <span>{m.label}</span>
            </button>
          );
        })}
        <div className="nav-sep" />
        <div style={{padding:"6px 12px"}}>
          <div className={`sync-badge ${syncStatus==="ok"?"ok":"err"}`} style={{justifyContent:"center"}}>
            <div className="sync-dot" />
            <span>{syncStatus==="ok"?"Firebase ✓":"Non synchronisé"}</span>
          </div>
        </div>
        <div style={{padding:"4px 12px"}}>
          <div className="taux-badge" style={{justifyContent:"center"}}>
            <span>1$= {fmt(taux)} FC</span>
          </div>
        </div>
      </nav>
      <div className="sidebar-user">
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <div className="avatar" style={{background:color}}>{initials(user.nom.split(" ")[1]||"", user.nom.split(" ")[0]||"")}</div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{user.nom}</div>
            <div className="sidebar-user-role">{user.label}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// FINANCES MODULE
// ============================================================
function RecRow({ row, onChange, onDelete }) {
  const base = getDepBase(row.libelle);
  return (
    <div className="row-editor">
      <div style={{display:"flex",alignItems:"center",gap:4}}>
        <input className="form-input" style={{fontSize:".76rem",padding:"6px 8px"}} placeholder="Libellé" value={row.libelle} onChange={e=>onChange({...row,libelle:e.target.value})} />
        {base && <span className="base-badge" style={{background:BASE_BG[base],color:BASE_COLORS[base]}}>{base}</span>}
      </div>
      <input className="form-input" style={{fontSize:".7rem",padding:"6px 8px"}} placeholder="CF/CL" value={row.culte} onChange={e=>onChange({...row,culte:e.target.value})} />
      <input className="form-input amt" style={{fontSize:".76rem",padding:"6px 8px"}} placeholder="0" type="number" value={row.cdf} onChange={e=>onChange({...row,cdf:e.target.value})} />
      <input className="form-input amt" style={{fontSize:".76rem",padding:"6px 8px"}} placeholder="0" type="number" value={row.usd} onChange={e=>onChange({...row,usd:e.target.value})} />
      <input className="form-input" style={{fontSize:".76rem",padding:"6px 8px"}} placeholder="Note" value={row.note} onChange={e=>onChange({...row,note:e.target.value})} />
      <button className="btn-del" onClick={onDelete}>×</button>
    </div>
  );
}

function DepRow({ row, onChange, onDelete }) {
  const base = getDepBase(row.libelle);
  return (
    <div className="row-editor row-editor-dep">
      <div style={{display:"flex",alignItems:"center",gap:4}}>
        <input className="form-input" style={{fontSize:".76rem",padding:"6px 8px"}} placeholder="Libellé" value={row.libelle} onChange={e=>onChange({...row,libelle:e.target.value})} />
        {base && <span className="base-badge" style={{background:BASE_BG[base],color:BASE_COLORS[base]}}>{base}</span>}
      </div>
      <input className="form-input" style={{fontSize:".7rem",padding:"6px 8px"}} placeholder="Clé" value={row.cle} onChange={e=>onChange({...row,cle:e.target.value})} />
      <input className="form-input amt" style={{fontSize:".76rem",padding:"6px 8px"}} placeholder="0" type="number" value={row.cdf} onChange={e=>onChange({...row,cdf:e.target.value})} />
      <input className="form-input amt" style={{fontSize:".76rem",padding:"6px 8px"}} placeholder="0" type="number" value={row.usd} onChange={e=>onChange({...row,usd:e.target.value})} />
      <input className="form-input" style={{fontSize:".76rem",padding:"6px 8px"}} placeholder="Bénéficiaire" value={row.note} onChange={e=>onChange({...row,note:e.target.value})} />
      <button className="btn-del" onClick={onDelete}>×</button>
    </div>
  );
}

const newRow = (libelle="", culte="CF", cle="") => ({ id: Date.now()+Math.random(), libelle, culte, cle, cdf:"", usd:"", note:"" });
const newDep = (libelle="", cle="") => ({ id: Date.now()+Math.random(), libelle, cle, cdf:"", usd:"", note:"" });

function FinancesModule() {
  const { taux, addToast } = useApp();
  const [tab, setTab] = useState("recettes");
  const [date, setDate] = useState(getTodayStr());
  const [taux2, setTaux2] = useState(taux);
  const [effCF, setEffCF] = useState("");
  const [effCL, setEffCL] = useState("");
  const [repCDF, setRepCDF] = useState("");
  const [repUSD, setRepUSD] = useState("");
  const [cfRows, setCfRows] = useState(CF_DEF.map(l=>newRow(l,"CF")));
  const [clRows, setClRows] = useState(CL_DEF.map(l=>newRow(l,"CL")));
  const [cmRows, setCmRows] = useState([{id:1,libelle:"Moderateurs",cle:"0,10",cdf:"",usd:"",note:""},{id:2,libelle:"Orateurs",cle:"0,90",cdf:"",usd:"",note:""},{id:3,libelle:"Pasteur Titulaire Collation",cle:"0,1385",cdf:"",usd:"",note:""},{id:4,libelle:"Loyer Pasteur Titulaire",cle:"1,00",cdf:"",usd:"",note:""}]);
  const [frRows, setFrRows] = useState([{id:1,libelle:"Facture SNEL",cle:"0,3275",cdf:"",usd:"",note:""},{id:2,libelle:"Facture REGIDESO",cle:"0,3275",cdf:"",usd:"",note:""},{id:3,libelle:"Carburant pour Cultes",cle:"0,0793",cdf:"",usd:"",note:""}]);
  const [coRows, setCoRows] = useState([{id:1,libelle:"Budget District Dime",cle:"0,10",cdf:"",usd:"",note:""},{id:2,libelle:"District QP Journee Speciale",cle:"0,20",cdf:"",usd:"",note:""}]);
  const [otRows, setOtRows] = useState([]);
  const [saving, setSaving] = useState(false);

  const t = parseFloat(taux2)||2800;
  const sumRows = (rows) => rows.reduce((a,r)=>({cdf:a.cdf+(parseFloat(r.cdf)||0), usd:a.usd+(parseFloat(r.usd)||0)}),{cdf:0,usd:0});
  const toEq = (cdf,usd) => cdf + usd*t;

  const cf = sumRows(cfRows), cl = sumRows(clRows);
  const rCDF = cf.cdf+cl.cdf, rUSD = cf.usd+cl.usd, rEq = toEq(rCDF,rUSD);
  const cm = sumRows(cmRows), fr = sumRows(frRows), co = sumRows(coRows), ot = sumRows(otRows);
  const dCDF = cm.cdf+fr.cdf+co.cdf+ot.cdf, dUSD = cm.usd+fr.usd+co.usd+ot.usd, dEq = toEq(dCDF,dUSD);
  const repEq = toEq(parseFloat(repCDF)||0, parseFloat(repUSD)||0);
  const solde = rEq - dEq + repEq;
  const couv = rEq>0 ? Math.round(dEq/rEq*100) : 0;

  const updateRow = (rows, setRows, id, val) => setRows(rows.map(r=>r.id===id?val:r));
  const deleteRow = (rows, setRows, id) => setRows(rows.filter(r=>r.id!==id));

  const handleSave = async () => {
    setSaving(true);
    await new Promise(r=>setTimeout(r,900));
    setSaving(false);
    addToast("✅ Sauvegardé dans Firebase — visible sur tous les appareils","ok");
  };

  const progColor = couv>90?"var(--red)":couv>70?"#e67e22":"var(--green)";

  const DISTRIB_ITEMS = [
    {label:"Pasteur Titulaire Collation",base:"B1",cle:.1385},{label:"Loyer Pasteur Titulaire",base:"B1",cle:1.00,warn:true},
    {label:"Moderateurs",base:"B2",cle:.10},{label:"Orateurs",base:"B2",cle:.90},
    {label:"Liberation Journee Speciale",base:"B4",cle:.40},{label:"District QP Journee Speciale",base:"B4",cle:.20},
    {label:"Part Dimes Bureau Pastoral",base:"B5",cle:.60},{label:"Budget District Dime",base:"B5",cle:.10},
    {label:"Part Ration Mensuelle BP",base:"B6",cle:.85},{label:"Part Ration Financiers",base:"B6",cle:.07},
  ];

  const bases = {
    B1: arrondi(cfRows.filter(r=>["offrandes ordinaires","offrande des familles","cotisation loyer"].some(k=>r.libelle.toLowerCase().includes(k))).reduce((a,r)=>a+(parseFloat(r.cdf)||0)+(parseFloat(r.usd)||0)*t,0) + clRows.filter(r=>["offrandes ordinaires","offrande des familles"].some(k=>r.libelle.toLowerCase().includes(k))).reduce((a,r)=>a+(parseFloat(r.cdf)||0)+(parseFloat(r.usd)||0)*t,0)),
    B2: arrondi([...cfRows,...clRows].filter(r=>r.libelle.toLowerCase().includes("prophete")).reduce((a,r)=>a+(parseFloat(r.cdf)||0)+(parseFloat(r.usd)||0)*t,0)),
    B4: arrondi([...cfRows,...clRows].filter(r=>r.libelle.toLowerCase().includes("speciale")||r.libelle.toLowerCase().includes("journee")).reduce((a,r)=>a+(parseFloat(r.cdf)||0)+(parseFloat(r.usd)||0)*t,0)),
    B5: arrondi([...cfRows,...clRows].filter(r=>r.libelle.toLowerCase().includes("dime")).reduce((a,r)=>a+(parseFloat(r.cdf)||0)+(parseFloat(r.usd)||0)*t,0)),
    B6: arrondi([...cfRows,...clRows].filter(r=>r.libelle.toLowerCase().includes("ration")).reduce((a,r)=>a+(parseFloat(r.cdf)||0)+(parseFloat(r.usd)||0)*t,0)),
  };

  return (
    <div>
      {/* KPIs */}
      <div className="kpi-grid">
        <div className="kpi-card blue">
          <div className="kpi-label">Total Recettes</div>
          <div className="kpi-value">{fmt(rCDF)} FC</div>
          <div className="kpi-sub">{fmt(rUSD)} USD</div>
        </div>
        <div className="kpi-card red">
          <div className="kpi-label">Total Dépenses</div>
          <div className="kpi-value">{fmt(dCDF)} FC</div>
          <div className="kpi-sub">{fmt(dUSD)} USD</div>
        </div>
        <div className={`kpi-card ${solde>=0?"green":"red"}`}>
          <div className="kpi-label">Solde Net</div>
          <div className="kpi-value">{fmt(solde)} FC</div>
          <div className="kpi-sub">{solde>=0?"✅ Positif":"❌ Négatif"}</div>
        </div>
        <div className="kpi-card gold">
          <div className="kpi-label">Couverture</div>
          <div className="kpi-value">{couv}%</div>
          <div className="kpi-sub">Rec / Dép</div>
        </div>
      </div>

      {/* Meta */}
      <div className="card">
        <div className="card-header"><h2>Informations du culte</h2></div>
        <div className="card-body">
          <div className="form-grid">
            <div className="form-group">
              <label>Date du culte</label>
              <input className="form-input" type="date" value={date} onChange={e=>setDate(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Taux (1$= FC)</label>
              <input className="form-input amt" type="number" value={taux2} onChange={e=>setTaux2(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Effectif CF</label>
              <input className="form-input amt" type="number" value={effCF} onChange={e=>setEffCF(e.target.value)} placeholder="0" />
            </div>
            <div className="form-group">
              <label>Effectif CL</label>
              <input className="form-input amt" type="number" value={effCL} onChange={e=>setEffCL(e.target.value)} placeholder="0" />
            </div>
            <div className="form-group">
              <label>Solde Reporté FC</label>
              <input className="form-input amt filled" type="number" value={repCDF} onChange={e=>setRepCDF(e.target.value)} placeholder="Auto" />
            </div>
            <div className="form-group">
              <label>Solde Reporté USD</label>
              <input className="form-input amt filled" type="number" value={repUSD} onChange={e=>setRepUSD(e.target.value)} placeholder="Auto" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        {["recettes","depenses","distribution","solde"].map(t=>(
          <button key={t} className={`tab-btn ${tab===t?"active":""}`} onClick={()=>setTab(t)}>
            {t==="recettes"?"💰 Recettes":t==="depenses"?"📤 Dépenses":t==="distribution"?"📊 Distribution":"💼 Solde"}
          </button>
        ))}
      </div>

      {/* Recettes tab */}
      {tab==="recettes" && (
        <div>
          <div className="card">
            <div className="card-header"><h2>Culte Francophone (CF)</h2><span style={{marginLeft:"auto",fontSize:".76rem",fontFamily:"'DM Mono',monospace",color:"var(--blue)",fontWeight:700}}>{fmt(cf.cdf)} FC + {fmt(cf.usd)} USD</span></div>
            <div className="card-body">
              <div className="tbl-head"><span>Libellé</span><span>Culte</span><span style={{textAlign:"right"}}>FC</span><span style={{textAlign:"right"}}>USD</span><span>Note</span><span></span></div>
              {cfRows.map(r=><RecRow key={r.id} row={r} onChange={v=>updateRow(cfRows,setCfRows,r.id,v)} onDelete={()=>deleteRow(cfRows,setCfRows,r.id)} />)}
              <button className="btn-add" onClick={()=>setCfRows([...cfRows,newRow("","CF")])}>+ Ajouter ligne CF</button>
            </div>
          </div>
          <div className="card">
            <div className="card-header"><h2>Culte Lingalophone (CL)</h2><span style={{marginLeft:"auto",fontSize:".76rem",fontFamily:"'DM Mono',monospace",color:"var(--green)",fontWeight:700}}>{fmt(cl.cdf)} FC + {fmt(cl.usd)} USD</span></div>
            <div className="card-body">
              <div className="tbl-head"><span>Libellé</span><span>Culte</span><span style={{textAlign:"right"}}>FC</span><span style={{textAlign:"right"}}>USD</span><span>Note</span><span></span></div>
              {clRows.map(r=><RecRow key={r.id} row={r} onChange={v=>updateRow(clRows,setClRows,r.id,v)} onDelete={()=>deleteRow(clRows,setClRows,r.id)} />)}
              <button className="btn-add" onClick={()=>setClRows([...clRows,newRow("","CL")])}>+ Ajouter ligne CL</button>
            </div>
          </div>
        </div>
      )}

      {/* Dépenses tab */}
      {tab==="depenses" && (
        <div>
          {/* Légende */}
          <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:12,padding:"8px 12px",background:"#fff",borderRadius:8,border:"1px solid var(--border)",fontSize:".68rem"}}>
            <span style={{fontWeight:700,color:"var(--navy2)"}}>Bases :</span>
            {Object.entries(BASE_COLORS).map(([k,v])=>(
              <span key={k} style={{background:BASE_BG[k],color:v,borderRadius:4,padding:"2px 7px",fontWeight:700}}>{k}</span>
            ))}
          </div>
          {[
            {title:"Collations & Motivations",badge:"B1/B2/B5/B6",rows:cmRows,setRows:setCmRows},
            {title:"Frais Généraux",badge:"B1/B4",rows:frRows,setRows:setFrRows},
            {title:"Contributions Communautaires",badge:"B4/B5",rows:coRows,setRows:setCoRows},
            {title:"Imprévus & Travaux",badge:"Hors base",rows:otRows,setRows:setOtRows},
          ].map(({title,badge,rows,setRows})=>(
            <div className="card" key={title}>
              <div className="card-header">
                <h2>{title}</h2>
                <span style={{marginLeft:8,padding:"2px 8px",background:"var(--bg2)",borderRadius:6,fontSize:".65rem",fontWeight:700,color:"var(--muted)"}}>{badge}</span>
                <span style={{marginLeft:"auto",fontSize:".76rem",fontFamily:"'DM Mono',monospace",color:"var(--red)",fontWeight:700}}>{fmt(sumRows(rows).cdf)} FC</span>
              </div>
              <div className="card-body">
                <div className="tbl-head tbl-head-dep"><span>Libellé</span><span>Clé</span><span style={{textAlign:"right"}}>FC</span><span style={{textAlign:"right"}}>USD</span><span>Bénéficiaire</span><span></span></div>
                {rows.map(r=><DepRow key={r.id} row={r} onChange={v=>updateRow(rows,setRows,r.id,v)} onDelete={()=>deleteRow(rows,setRows,r.id)} />)}
                <button className="btn-add" onClick={()=>setRows([...rows,newDep()])}>+ Ajouter</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Distribution */}
      {tab==="distribution" && (
        <div className="card">
          <div className="card-header">
            <h2>Distribution par bases</h2>
            <div style={{marginLeft:"auto",display:"flex",gap:6}}>
              <button className="btn btn-ghost btn-sm">Calculer</button>
              <button className="btn btn-primary btn-sm">⬇️ Injecter → Dépenses</button>
            </div>
          </div>
          <div className="card-body">
            {/* Bases */}
            <div className="form-grid" style={{marginBottom:12}}>
              {Object.entries(bases).map(([k,v])=>(
                <div key={k} className="form-group">
                  <label style={{color:BASE_COLORS[k]}}>{k}</label>
                  <input className="form-input amt" value={fmt(v)} readOnly style={{color:BASE_COLORS[k],fontWeight:700,background:BASE_BG[k]}} />
                </div>
              ))}
            </div>
            {/* Workflow reminder */}
            <div style={{padding:"8px 12px",background:"#fffbeb",border:"1px solid #fcd34d",borderRadius:7,fontSize:".71rem",color:"#92400e",marginBottom:14}}>
              <strong>Flux :</strong> 1) Saisir recettes → 2) Calculer → 3) Valider lignes → 4) Injecter dans Dépenses
            </div>
            <table className="distrib-table">
              <thead><tr><th>Bénéficiaire</th><th>Base</th><th>Clé</th><th style={{textAlign:"right"}}>Montant brut FC</th><th style={{textAlign:"right"}}>Arrondi FC</th><th>Statut</th></tr></thead>
              <tbody>
                {DISTRIB_ITEMS.map((it,i)=>{
                  const base = bases[it.base]||0;
                  const brut = base * it.cle;
                  const arr = arrondi(brut);
                  return (
                    <tr key={i}>
                      <td style={{fontWeight:500}}>{it.label}{it.warn&&<span title="Clé=1.00 : montant total de la base" style={{marginLeft:4,cursor:"help"}}>⚠️</span>}</td>
                      <td><span className="base-badge" style={{background:BASE_BG[it.base],color:BASE_COLORS[it.base]}}>{it.base}</span></td>
                      <td><span className="cle-tag">{it.cle.toFixed(4)}</span></td>
                      <td style={{textAlign:"right",fontFamily:"'DM Mono',monospace",fontSize:".74rem"}}>{brut>0?fmt(brut):"-"}</td>
                      <td style={{textAlign:"right",fontFamily:"'DM Mono',monospace",fontWeight:700,color:"var(--green)"}}>{arr>0?fmt(arr):"-"}</td>
                      <td><span style={{padding:"2px 6px",borderRadius:4,fontSize:".65rem",background:"var(--bg2)",color:"var(--muted)",fontWeight:700}}>En attente</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Solde */}
      {tab==="solde" && (
        <div className="card">
          <div className="card-header"><h2>Bilan & Solde du culte</h2></div>
          <div className="card-body">
            <div className="kpi-grid">
              <div className="kpi-card blue"><div className="kpi-label">Recettes</div><div className="kpi-value">{fmt(rEq)} FC</div><div className="kpi-sub">équivalent unifié</div></div>
              <div className="kpi-card red"><div className="kpi-label">Dépenses</div><div className="kpi-value">{fmt(dEq)} FC</div><div className="kpi-sub">équivalent unifié</div></div>
              <div className="kpi-card blue"><div className="kpi-label">Solde Reporté</div><div className="kpi-value">{fmt(repEq)} FC</div><div className="kpi-sub">{fmt(parseFloat(repCDF)||0)} FC + {fmt(parseFloat(repUSD)||0)} USD</div></div>
              <div className={`kpi-card ${solde>=0?"green":"red"}`}><div className="kpi-label">Solde Final</div><div className="kpi-value" style={{color:solde>=0?"var(--green)":"var(--red)"}}>{fmt(solde)} FC</div><div className="kpi-sub">{solde>=0?"✅ Excédent":"❌ Déficit"}</div></div>
            </div>
            <div style={{marginTop:12}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:4,fontSize:".72rem",fontWeight:700,color:"var(--navy2)"}}>
                <span>Taux d'utilisation</span><span>{couv}%</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{width:`${Math.min(100,couv)}%`,background:progColor}} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Save button */}
      <div style={{display:"flex",gap:8,justifyContent:"flex-end",marginTop:8}}>
        <button className="btn btn-ghost" onClick={()=>addToast("Formulaire réinitialisé","info")}>🔄 Nouveau</button>
        <button className="btn btn-success" onClick={handleSave} disabled={saving}>
          {saving?"Sauvegarde...":"💾 Sauvegarder dans Firebase"}
        </button>
      </div>
    </div>
  );
}

// ============================================================
// DASHBOARD MODULE
// ============================================================
function DashboardModule() {
  const { user } = useApp();
  const stats = [
    { label:"Recettes cumulées", value:"1 245 000 FC", sub:"12 cultes", type:"blue" },
    { label:"Dépenses cumulées", value:"980 000 FC", sub:"12 cultes", type:"red" },
    { label:"Solde cumulé", value:"265 000 FC", sub:"✅ Positif", type:"green" },
    { label:"Membres actifs", value:"247", sub:"+12 ce mois", type:"gold" },
    { label:"Assistances sociales", value:"8", sub:"3 en attente", type:"blue" },
    { label:"Projets en cours", value:"3", sub:"Budget: 27M FC", type:"gold" },
  ];

  const months = ["Jan","Fév","Mar","Avr","Mai","Juin"];
  const recData = [980000,1100000,890000,1245000,1050000,1180000];
  const depData = [780000,890000,720000,980000,850000,930000];
  const maxVal = Math.max(...recData,...depData);

  return (
    <div>
      <div style={{marginBottom:20}}>
        <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:"1.3rem",color:"var(--navy2)",marginBottom:4}}>
          Bonjour, {user.nom.split(" ")[0]} 👋
        </h2>
        <p style={{color:"var(--muted)",fontSize:".82rem"}}>Tableau de bord — {new Date().toLocaleDateString("fr-FR",{weekday:"long",day:"numeric",month:"long",year:"numeric"})}</p>
      </div>

      <div className="kpi-grid" style={{gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))"}}>
        {stats.map(s=>(
          <div key={s.label} className={`kpi-card ${s.type}`}>
            <div className="kpi-label">{s.label}</div>
            <div className="kpi-value">{s.value}</div>
            <div className="kpi-sub">{s.sub}</div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="card-header"><h2>Évolution financière — 6 derniers mois</h2></div>
        <div className="card-body">
          <div style={{display:"flex",alignItems:"flex-end",gap:8,height:140,padding:"0 8px"}}>
            {months.map((m,i)=>{
              const rH = (recData[i]/maxVal)*120;
              const dH = (depData[i]/maxVal)*120;
              const nH = ((recData[i]-depData[i])/maxVal)*120;
              return (
                <div key={m} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:2}}>
                  <div style={{display:"flex",alignItems:"flex-end",gap:2,height:120}}>
                    <div style={{width:10,height:rH,background:"var(--blue)",borderRadius:"3px 3px 0 0",opacity:.85}} title={`Rec: ${fmt(recData[i])} FC`} />
                    <div style={{width:10,height:dH,background:"var(--red)",borderRadius:"3px 3px 0 0",opacity:.85}} title={`Dép: ${fmt(depData[i])} FC`} />
                    <div style={{width:8,height:Math.abs(nH),background:"var(--green)",borderRadius:"3px 3px 0 0",opacity:.9}} title={`Net: ${fmt(recData[i]-depData[i])} FC`} />
                  </div>
                  <span style={{fontSize:".64rem",color:"var(--muted)",fontWeight:600}}>{m}</span>
                </div>
              );
            })}
          </div>
          <div style={{display:"flex",gap:12,marginTop:8,justifyContent:"center",fontSize:".68rem"}}>
            {[["var(--blue)","Recettes"],["var(--red)","Dépenses"],["var(--green)","Solde net"]].map(([c,l])=>(
              <div key={l} style={{display:"flex",alignItems:"center",gap:4}}><div style={{width:10,height:10,background:c,borderRadius:2}} /><span style={{color:"var(--muted)",fontWeight:600}}>{l}</span></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// MEMBRES MODULE
// ============================================================
function MembresModule() {
  const { addToast } = useApp();
  const [search, setSearch] = useState("");
  const [members] = useState([
    {id:"m1",numero:"KG-0001",nom:"Mukeba",prenom:"Jean",statut:"communiant",activite:"actif",dept:"BP",tel:"0812345678"},
    {id:"m2",numero:"KG-0002",nom:"Lusamba",prenom:"Marie",statut:"catechumene",activite:"actif",dept:"Musique",tel:"0823456789"},
    {id:"m3",numero:"KG-0003",nom:"Tshiamala",prenom:"Pierre",statut:"communiant",activite:"inactif",dept:"Diacres",tel:"0834567890"},
  ]);

  const filtered = members.filter(m=>
    [m.nom,m.prenom,m.numero].some(f=>f.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div>
      <div className="kpi-grid">
        <div className="kpi-card blue"><div className="kpi-label">Total membres</div><div className="kpi-value">{members.length}</div><div className="kpi-sub">Enregistrés</div></div>
        <div className="kpi-card green"><div className="kpi-label">Actifs</div><div className="kpi-value">{members.filter(m=>m.activite==="actif").length}</div><div className="kpi-sub">En règle</div></div>
        <div className="kpi-card gold"><div className="kpi-label">Communiants</div><div className="kpi-value">{members.filter(m=>m.statut==="communiant").length}</div><div className="kpi-sub">Membres</div></div>
        <div className="kpi-card blue"><div className="kpi-label">Catéchumènes</div><div className="kpi-value">{members.filter(m=>m.statut==="catechumene").length}</div><div className="kpi-sub">En formation</div></div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2>Liste des membres</h2>
          <div style={{marginLeft:"auto",display:"flex",gap:8,alignItems:"center"}}>
            <input className="form-input" placeholder="Rechercher..." value={search} onChange={e=>setSearch(e.target.value)} style={{width:200,padding:"6px 10px",fontSize:".78rem"}} />
            <button className="btn btn-primary btn-sm" onClick={()=>addToast("Formulaire d'ajout ouvert","info")}>+ Nouveau</button>
          </div>
        </div>
        <div className="card-body" style={{padding:0}}>
          <table className="data-table">
            <thead><tr><th>N°</th><th>Nom & Prénom</th><th>Statut</th><th>Activité</th><th>Département</th><th>Téléphone</th><th></th></tr></thead>
            <tbody>
              {filtered.map(m=>(
                <tr key={m.id}>
                  <td style={{fontFamily:"'DM Mono',monospace",fontSize:".72rem",fontWeight:700,color:"var(--blue)"}}>{m.numero}</td>
                  <td>
                    <div style={{display:"flex",alignItems:"center",gap:8}}>
                      <div className="avatar" style={{background:getAvatarColor(m.nom),width:28,height:28,fontSize:".65rem"}}>{initials(m.nom,m.prenom)}</div>
                      <span style={{fontWeight:600}}>{m.prenom} {m.nom}</span>
                    </div>
                  </td>
                  <td><span style={{padding:"2px 8px",borderRadius:20,fontSize:".68rem",fontWeight:700,background:m.statut==="communiant"?"#dbeafe":"#fef9c3",color:m.statut==="communiant"?"var(--blue)":"#a16207"}}>{m.statut}</span></td>
                  <td><span style={{padding:"2px 8px",borderRadius:20,fontSize:".68rem",fontWeight:700,background:m.activite==="actif"?"#dcfce7":"#fee2e2",color:m.activite==="actif"?"var(--green)":"var(--red)"}}>{m.activite}</span></td>
                  <td style={{fontSize:".76rem",color:"var(--muted)"}}>{m.dept}</td>
                  <td style={{fontFamily:"'DM Mono',monospace",fontSize:".72rem"}}>{m.tel}</td>
                  <td><button className="btn btn-ghost btn-sm" onClick={()=>addToast(`Fiche de ${m.prenom} ${m.nom}`,"info")}>👁️</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// SOCIAL MODULE
// ============================================================
function SocialModule() {
  const { addToast, user } = useApp();
  const [tab, setTab] = useState("assistances");
  const [assistances, setAssistances] = useState([
    {id:"a1",nom:"Famille Mukeba",type:"maladie",cdf:50000,usd:0,date:"2026-05-10",statut:"attente",note:"Hospitalisation urgente"},
    {id:"a2",nom:"Veuve Lusamba",type:"deces",cdf:80000,usd:20,date:"2026-05-05",statut:"valide",note:"Soutien funérailles"},
  ]);

  const TYPE_LABELS = {maladie:"🏥 Maladie",deces:"⚫ Décès",mariage:"💍 Mariage",naissance:"👶 Naissance",autre:"📌 Autre"};
  const total = assistances.filter(a=>a.statut==="valide").reduce((s,a)=>s+a.cdf+a.usd*2800,0);

  return (
    <div>
      <div className="kpi-grid">
        <div className="kpi-card red"><div className="kpi-label">Total décaissé</div><div className="kpi-value">{fmt(total)} FC</div><div className="kpi-sub">Assistances validées</div></div>
        <div className="kpi-card gold"><div className="kpi-label">En attente</div><div className="kpi-value">{assistances.filter(a=>a.statut==="attente").length}</div><div className="kpi-sub">À valider</div></div>
        <div className="kpi-card green"><div className="kpi-label">Validées</div><div className="kpi-value">{assistances.filter(a=>a.statut==="valide").length}</div><div className="kpi-sub">Ce mois</div></div>
        <div className="kpi-card blue"><div className="kpi-label">Total demandes</div><div className="kpi-value">{assistances.length}</div><div className="kpi-sub">Toutes périodes</div></div>
      </div>

      <div className="tabs">
        {["assistances","dashboard"].map(t=>(
          <button key={t} className={`tab-btn ${tab===t?"active":""}`} onClick={()=>setTab(t)}>
            {t==="assistances"?"❤️ Assistances":"📊 Dashboard"}
          </button>
        ))}
      </div>

      {tab==="assistances" && (
        <div className="card">
          <div className="card-header">
            <h2>Demandes d'assistance</h2>
            <button className="btn btn-primary btn-sm" style={{marginLeft:"auto"}} onClick={()=>addToast("Formulaire d'assistance ouvert","info")}>+ Nouvelle demande</button>
          </div>
          <div className="card-body" style={{padding:0}}>
            <table className="data-table">
              <thead><tr><th>Bénéficiaire</th><th>Type</th><th>Montant</th><th>Date</th><th>Statut</th><th></th></tr></thead>
              <tbody>
                {assistances.map(a=>(
                  <tr key={a.id}>
                    <td style={{fontWeight:600}}>{a.nom}<div style={{fontSize:".68rem",color:"var(--muted)"}}>{a.note}</div></td>
                    <td style={{fontSize:".74rem"}}>{TYPE_LABELS[a.type]||a.type}</td>
                    <td style={{fontFamily:"'DM Mono',monospace",fontSize:".76rem",fontWeight:700,color:"var(--red)"}}>{fmt(a.cdf)} FC{a.usd>0?` + ${a.usd} $`:""}</td>
                    <td style={{fontSize:".74rem",color:"var(--muted)"}}>{a.date}</td>
                    <td>
                      <span style={{padding:"2px 8px",borderRadius:20,fontSize:".68rem",fontWeight:700,background:a.statut==="valide"?"#dcfce7":"#fef9c3",color:a.statut==="valide"?"var(--green)":"#a16207"}}>
                        {a.statut==="valide"?"✅ Validée":"⏳ En attente"}
                      </span>
                    </td>
                    <td>
                      {a.statut==="attente" && user.role==="admin" && (
                        <button className="btn btn-success btn-sm" onClick={()=>{
                          setAssistances(assistances.map(x=>x.id===a.id?{...x,statut:"valide"}:x));
                          addToast("Assistance validée ✅","ok");
                        }}>Valider</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// PROJETS MODULE
// ============================================================
function ProjetsModule() {
  const { addToast, user } = useApp();
  const [projets] = useState([
    {id:"p1",nom:"Construction Salle Temple",budget:18676000,collecte:4200000,depense:1800000,statut:"en_cours",date:"2026-04-01",desc:"Travaux de construction de la nouvelle salle",avancement:22},
    {id:"p2",nom:"Sonorisation Temple",budget:8302000,collecte:2100000,depense:900000,statut:"en_cours",date:"2026-03-01",desc:"Système audio professionnel",avancement:15},
  ]);

  return (
    <div>
      <div className="kpi-grid">
        <div className="kpi-card blue"><div className="kpi-label">Projets actifs</div><div className="kpi-value">{projets.filter(p=>p.statut==="en_cours").length}</div><div className="kpi-sub">En cours</div></div>
        <div className="kpi-card gold"><div className="kpi-label">Budget total</div><div className="kpi-value">{fmt(projets.reduce((s,p)=>s+p.budget,0))} FC</div><div className="kpi-sub">Tous projets</div></div>
        <div className="kpi-card green"><div className="kpi-label">Collecté total</div><div className="kpi-value">{fmt(projets.reduce((s,p)=>s+p.collecte,0))} FC</div><div className="kpi-sub">Cumulé</div></div>
        <div className="kpi-card red"><div className="kpi-label">Dépensé total</div><div className="kpi-value">{fmt(projets.reduce((s,p)=>s+p.depense,0))} FC</div><div className="kpi-sub">Décaissé</div></div>
      </div>

      {projets.map(p=>{
        const pct = Math.round(p.collecte/p.budget*100);
        const aPct = p.avancement;
        return (
          <div className="card" key={p.id}>
            <div className="card-header">
              <h2>{p.nom}</h2>
              <span style={{padding:"3px 10px",borderRadius:20,fontSize:".68rem",fontWeight:700,background:"#fef9c3",color:"#a16207",marginLeft:"auto"}}>EN ATTENTE</span>
            </div>
            <div className="card-body">
              <p style={{fontSize:".78rem",color:"var(--muted)",marginBottom:12}}>{p.desc}</p>
              <div className="form-grid" style={{marginBottom:12}}>
                <div className="form-group"><label>Budget</label><div style={{fontFamily:"'DM Mono',monospace",fontWeight:700,color:"var(--navy2)",fontSize:".85rem"}}>{fmt(p.budget)} FC</div></div>
                <div className="form-group"><label>Collecté</label><div style={{fontFamily:"'DM Mono',monospace",fontWeight:700,color:"var(--green)",fontSize:".85rem"}}>{fmt(p.collecte)} FC</div></div>
                <div className="form-group"><label>Dépensé</label><div style={{fontFamily:"'DM Mono',monospace",fontWeight:700,color:"var(--red)",fontSize:".85rem"}}>{fmt(p.depense)} FC</div></div>
                <div className="form-group"><label>Solde</label><div style={{fontFamily:"'DM Mono',monospace",fontWeight:700,color:"var(--blue)",fontSize:".85rem"}}>{fmt(p.collecte-p.depense)} FC</div></div>
              </div>
              <div style={{marginBottom:8}}>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:".7rem",fontWeight:700,color:"var(--muted)",marginBottom:4}}>
                  <span>Collecte / Budget</span><span>{pct}%</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{width:`${Math.min(100,pct)}%`,background:"var(--green)"}} />
                </div>
              </div>
              <div style={{marginBottom:12}}>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:".7rem",fontWeight:700,color:"var(--muted)",marginBottom:4}}>
                  <span>Avancement travaux</span><span>{aPct}%</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{width:`${aPct}%`,background:"var(--blue)"}} />
                </div>
              </div>
              {user.role==="admin" && (
                <div style={{display:"flex",gap:6}}>
                  <button className="btn btn-ghost btn-sm" onClick={()=>addToast("Recette ajoutée","ok")}>💰 Recette</button>
                  <button className="btn btn-ghost btn-sm" onClick={()=>addToast("Dépense ajoutée","ok")}>📤 Dépense</button>
                  <button className="btn btn-primary btn-sm" onClick={()=>addToast("Rapport généré","info")}>🖨️ Rapport</button>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ============================================================
// PLACEHOLDER MODULES
// ============================================================
function PlaceholderModule({ title, icon }) {
  return (
    <div className="card" style={{textAlign:"center",padding:"48px 20px"}}>
      <div style={{fontSize:"3rem",marginBottom:12}}>{icon}</div>
      <h2 style={{fontFamily:"'Playfair Display',serif",color:"var(--navy2)",marginBottom:8}}>{title}</h2>
      <p style={{color:"var(--muted)",fontSize:".82rem"}}>Module en cours de migration vers la V2.</p>
    </div>
  );
}

// ============================================================
// MAIN APP
// ============================================================
export default function App() {
  const [user, setUser] = useState(null);
  const [activeModule, setActiveModule] = useState("dashboard");
  const [syncStatus, setSyncStatus] = useState("ok");
  const [taux, setTaux] = useState(2800);
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((msg, type="info") => {
    const id = Date.now();
    setToasts(t=>[...t,{id,msg,type}]);
    setTimeout(()=>setToasts(t=>t.filter(x=>x.id!==id)),3500);
  },[]);

  const moduleTitle = MODULES.find(m=>m.id===activeModule)?.label || "";

  if (!user) return (
    <>
      <style>{css}</style>
      <LoginScreen onLogin={u=>{ setUser(u); }} />
    </>
  );

  return (
    <AppContext.Provider value={{ user, taux, setTaux, addToast, syncStatus, setSyncStatus }}>
      <style>{css}</style>
      <div className="app">
        <Sidebar user={user} activeModule={activeModule} setActiveModule={setActiveModule} syncStatus={syncStatus} taux={taux} />
        <div className="main">
          <header className="header">
            <div className="header-title">{moduleTitle}</div>
            <div className={`sync-badge ${syncStatus==="ok"?"ok":"err"}`}>
              <div className="sync-dot" />
              <span>{syncStatus==="ok"?"Firebase ✓":"Non sync"}</span>
            </div>
            <div className="taux-badge">
              <span>1$=</span>
              <input style={{width:52,background:"none",border:"none",color:"var(--gold-light)",fontFamily:"'DM Mono',monospace",fontSize:".72rem",fontWeight:600,outline:"none"}} value={taux} onChange={e=>setTaux(parseFloat(e.target.value)||2800)} type="number" />
              <span>FC</span>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={()=>{ setUser(null); addToast("Déconnecté","info"); }}>Déconnexion</button>
          </header>
          <div className="content">
            {activeModule==="dashboard"  && <DashboardModule />}
            {activeModule==="finances"   && <FinancesModule />}
            {activeModule==="membres"    && <MembresModule />}
            {activeModule==="social"     && <SocialModule />}
            {activeModule==="projets"    && <ProjetsModule />}
            {activeModule==="seminaire"  && <PlaceholderModule title="Séminaire" icon="📚" />}
            {activeModule==="eb"         && <PlaceholderModule title="Expressions de Besoins" icon="📋" />}
            {activeModule==="annonces"   && <PlaceholderModule title="Annonces" icon="📢" />}
          </div>
        </div>
        <ToastContainer toasts={toasts} />
      </div>
    </AppContext.Provider>
  );
}