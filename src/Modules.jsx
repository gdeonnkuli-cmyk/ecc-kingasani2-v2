// ============================================================
// ECC KINGASANI 2 — V2 MODULES COMPLÉMENTAIRES
// Séminaire | Expressions de Besoins | Annonces | Historique
// À importer dans App.jsx et remplacer les PlaceholderModule
// ============================================================

import { useState, useEffect, useRef } from "react";

// ============================================================
// UTILS (partagés)
// ============================================================
const fmt = (n) => (parseFloat(n) || 0).toLocaleString("fr-FR");
const getTodayStr = () => { const d = new Date(), mm = d.getMonth()+1, dd = d.getDate(); return `${d.getFullYear()}-${mm<10?"0"+mm:mm}-${dd<10?"0"+dd:dd}`; };
const arrondi = (n) => Math.round(n / 50) * 50;

// ============================================================
// SÉMINAIRE MODULE
// ============================================================
const SEM_REC_DEF = ["Offrandes Ordinaires","Offrandes Orateurs","Cotisation Participants","Autres recettes"];
const SEM_DEP_DEF = [
  {l:"Collation Orateurs",c:"0,xx"},{l:"Collation Modérateurs",c:"0,xx"},
  {l:"Carburant / Transport",c:""},{l:"Achat Enveloppes",c:""},
  {l:"Impression / Supports",c:""},{l:"Rafraîchissement",c:""},
  {l:"Location Salle",c:""},{l:"Autres dépenses",c:""}
];

const newSemRow = (libelle="",cle="") => ({id:Date.now()+Math.random(), libelle, cle, cdf:"", usd:"", note:""});

function SeminaireModule({ user, taux, addToast }) {
  const [tab, setTab] = useState("recettes");
  const [titre, setTitre] = useState("");
  const [date, setDate] = useState(getTodayStr());
  const [lieu, setLieu] = useState("");
  const [theme, setTheme] = useState("");
  const [recRows, setRecRows] = useState(SEM_REC_DEF.map(l=>newSemRow(l)));
  const [depRows, setDepRows] = useState(SEM_DEP_DEF.map(d=>newSemRow(d.l,d.c)));
  const [repCDF, setRepCDF] = useState("");
  const [sessions, setSessions] = useState([]);
  const [saving, setSaving] = useState(false);
  const t = parseFloat(taux)||2800;

  const sumRows = (rows) => rows.reduce((a,r)=>({cdf:a.cdf+(parseFloat(r.cdf)||0),usd:a.usd+(parseFloat(r.usd)||0)}),{cdf:0,usd:0});
  const rec = sumRows(recRows), dep = sumRows(depRows);
  const rEq = rec.cdf + rec.usd*t, dEq = dep.cdf + dep.usd*t;
  const rep = parseFloat(repCDF)||0;
  const solde = rEq - dEq + rep;

  const updateRow = (rows, setRows, id, val) => setRows(rows.map(r=>r.id===id?val:r));
  const deleteRow = (rows, setRows, id) => setRows(rows.filter(r=>r.id!==id));

  const handleSave = async () => {
    if (!titre || !date) { addToast("Titre et date obligatoires","err"); return; }
    setSaving(true);
    await new Promise(r=>setTimeout(r,600));
    const session = { id:"sem"+Date.now(), titre, date, lieu, theme, recettes:recRows, depenses:depRows, repCDF:rep, sums:{rCDF:rec.cdf,rUSD:rec.usd,dCDF:dep.cdf,dUSD:dep.usd,solde}, savedAt: new Date().toISOString() };
    setSessions(s=>[session,...s.slice(0,51)]);
    setSaving(false);
    addToast("Session séminaire sauvegardée ✅","ok");
  };

  const handlePrint = () => {
    const win = window.open("","_blank");
    win.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Bilan Séminaire — ${titre}</title>
    <style>body{font-family:Arial,sans-serif;margin:20px;font-size:12px;color:#0d1b2a}h1{color:#1a3a5c;font-size:16px}h2{color:#2e75b6;font-size:13px;margin-top:16px}table{width:100%;border-collapse:collapse}th{background:#1a3a5c;color:#fff;padding:6px 8px;text-align:left;font-size:10px}td{padding:5px 8px;border-bottom:1px solid #eee}tr.tot td{font-weight:700;background:#eef4fb}@media print{button{display:none}}</style>
    </head><body>
    <h1>ECC / 13ème CBFC — Kingasani 2</h1>
    <p>Bilan Séminaire : <strong>${titre}</strong> | Date : ${date} | Lieu : ${lieu||"—"}</p>
    <p>Thème : <em>${theme||"—"}</em></p>
    <button onclick="window.print()" style="margin:10px 0;padding:6px 14px;background:#1a3a5c;color:#fff;border:none;border-radius:6px;cursor:pointer">🖨️ Imprimer</button>
    <h2>Recettes</h2><table><thead><tr><th>Libellé</th><th>FC</th><th>USD</th></tr></thead><tbody>
    ${recRows.map(r=>`<tr><td>${r.libelle}</td><td style="text-align:right;font-family:monospace">${fmt(r.cdf)}</td><td style="text-align:right;font-family:monospace">${fmt(r.usd)}</td></tr>`).join("")}
    <tr class="tot"><td>TOTAL</td><td style="text-align:right;font-family:monospace">${fmt(rec.cdf)}</td><td style="text-align:right;font-family:monospace">${fmt(rec.usd)}</td></tr>
    </tbody></table>
    <h2>Dépenses</h2><table><thead><tr><th>Libellé</th><th>Clé</th><th>FC</th><th>USD</th></tr></thead><tbody>
    ${depRows.map(r=>`<tr><td>${r.libelle}</td><td style="font-family:monospace">${r.cle}</td><td style="text-align:right;font-family:monospace">${fmt(r.cdf)}</td><td style="text-align:right;font-family:monospace">${fmt(r.usd)}</td></tr>`).join("")}
    <tr class="tot"><td colspan="2">TOTAL</td><td style="text-align:right;font-family:monospace">${fmt(dep.cdf)}</td><td style="text-align:right;font-family:monospace">${fmt(dep.usd)}</td></tr>
    </tbody></table>
    <h2>Bilan</h2>
    <p>Solde Reporté : <strong>${fmt(rep)} FC</strong></p>
    <p>Solde Net : <strong style="color:${solde>=0?"green":"red"}">${fmt(solde)} FC</strong></p>
    </body></html>`);
    win.document.close();
  };

  const SemRow = ({row, onChange, onDelete, placeholder}) => (
    <div style={{display:"grid",gridTemplateColumns:"1fr 70px 100px 80px 1fr 26px",gap:6,marginBottom:6,alignItems:"center"}}>
      <input className="form-input" style={{fontSize:".76rem",padding:"6px 8px"}} placeholder={placeholder} value={row.libelle} onChange={e=>onChange({...row,libelle:e.target.value})} />
      <input className="form-input" style={{fontSize:".7rem",padding:"6px 8px"}} placeholder="Clé" value={row.cle} onChange={e=>onChange({...row,cle:e.target.value})} />
      <input className="form-input amt" style={{fontSize:".76rem",padding:"6px 8px"}} placeholder="0" type="number" value={row.cdf} onChange={e=>onChange({...row,cdf:e.target.value})} />
      <input className="form-input amt" style={{fontSize:".76rem",padding:"6px 8px"}} placeholder="0" type="number" value={row.usd} onChange={e=>onChange({...row,usd:e.target.value})} />
      <input className="form-input" style={{fontSize:".76rem",padding:"6px 8px"}} placeholder="Note" value={row.note} onChange={e=>onChange({...row,note:e.target.value})} />
      <button className="btn-del" onClick={onDelete}>×</button>
    </div>
  );

  return (
    <div>
      <div className="kpi-grid">
        <div className="kpi-card blue"><div className="kpi-label">Recettes</div><div className="kpi-value">{fmt(rec.cdf)} FC</div><div className="kpi-sub">{fmt(rec.usd)} USD</div></div>
        <div className="kpi-card red"><div className="kpi-label">Dépenses</div><div className="kpi-value">{fmt(dep.cdf)} FC</div><div className="kpi-sub">{fmt(dep.usd)} USD</div></div>
        <div className={`kpi-card ${solde>=0?"green":"red"}`}><div className="kpi-label">Solde Net</div><div className="kpi-value" style={{color:solde>=0?"var(--green)":"var(--red)"}}>{fmt(solde)} FC</div><div className="kpi-sub">{solde>=0?"✅ Excédent":"❌ Déficit"}</div></div>
        <div className="kpi-card gold"><div className="kpi-label">Sessions</div><div className="kpi-value">{sessions.length}</div><div className="kpi-sub">Sauvegardées</div></div>
      </div>

      {/* Info session */}
      <div className="card">
        <div className="card-header"><h2>Informations de la session</h2></div>
        <div className="card-body">
          <div className="form-grid">
            <div className="form-group">
              <label>Titre du séminaire *</label>
              <input className="form-input" value={titre} onChange={e=>setTitre(e.target.value)} placeholder="Ex: Séminaire de Formation..." />
            </div>
            <div className="form-group">
              <label>Date *</label>
              <input className="form-input" type="date" value={date} onChange={e=>setDate(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Lieu</label>
              <input className="form-input" value={lieu} onChange={e=>setLieu(e.target.value)} placeholder="Temple, Salle..." />
            </div>
            <div className="form-group">
              <label>Thème / Sujet</label>
              <input className="form-input" value={theme} onChange={e=>setTheme(e.target.value)} placeholder="Thème de la session..." />
            </div>
            <div className="form-group">
              <label>Solde Reporté FC</label>
              <input className="form-input amt" type="number" value={repCDF} onChange={e=>setRepCDF(e.target.value)} placeholder="0" />
            </div>
          </div>
        </div>
      </div>

      <div className="tabs">
        {["recettes","depenses","bilan","historique"].map(t2=>(
          <button key={t2} className={`tab-btn ${tab===t2?"active":""}`} onClick={()=>setTab(t2)}>
            {t2==="recettes"?"💰 Recettes":t2==="depenses"?"📤 Dépenses":t2==="bilan"?"📊 Bilan":"📋 Historique"}
          </button>
        ))}
      </div>

      {tab==="recettes" && (
        <div className="card">
          <div className="card-header"><h2>Recettes du séminaire</h2><span style={{marginLeft:"auto",fontFamily:"'DM Mono',monospace",fontSize:".78rem",fontWeight:700,color:"var(--green)"}}>{fmt(rec.cdf)} FC + {fmt(rec.usd)} USD</span></div>
          <div className="card-body">
            <div style={{display:"grid",gridTemplateColumns:"1fr 70px 100px 80px 1fr 26px",gap:6,marginBottom:6}}>
              {["Libellé","Clé","FC","USD","Note",""].map(h=><span key={h} style={{fontSize:".63rem",fontWeight:700,textTransform:"uppercase",letterSpacing:".04em",color:"var(--muted)"}}>{h}</span>)}
            </div>
            {recRows.map(r=><SemRow key={r.id} row={r} placeholder="Libellé recette" onChange={v=>updateRow(recRows,setRecRows,r.id,v)} onDelete={()=>deleteRow(recRows,setRecRows,r.id)} />)}
            <button className="btn-add" onClick={()=>setRecRows([...recRows,newSemRow()])}>+ Ajouter recette</button>
          </div>
        </div>
      )}

      {tab==="depenses" && (
        <div className="card">
          <div className="card-header"><h2>Dépenses du séminaire</h2><span style={{marginLeft:"auto",fontFamily:"'DM Mono',monospace",fontSize:".78rem",fontWeight:700,color:"var(--red)"}}>{fmt(dep.cdf)} FC + {fmt(dep.usd)} USD</span></div>
          <div className="card-body">
            <div style={{display:"grid",gridTemplateColumns:"1fr 70px 100px 80px 1fr 26px",gap:6,marginBottom:6}}>
              {["Libellé","Clé","FC","USD","Note",""].map(h=><span key={h} style={{fontSize:".63rem",fontWeight:700,textTransform:"uppercase",letterSpacing:".04em",color:"var(--muted)"}}>{h}</span>)}
            </div>
            {depRows.map(r=><SemRow key={r.id} row={r} placeholder="Libellé dépense" onChange={v=>updateRow(depRows,setDepRows,r.id,v)} onDelete={()=>deleteRow(depRows,setDepRows,r.id)} />)}
            <button className="btn-add" onClick={()=>setDepRows([...depRows,newSemRow()])}>+ Ajouter dépense</button>
          </div>
        </div>
      )}

      {tab==="bilan" && (
        <div className="card">
          <div className="card-header"><h2>Bilan de la session</h2></div>
          <div className="card-body">
            <div className="kpi-grid">
              <div className="kpi-card blue"><div className="kpi-label">Recettes</div><div className="kpi-value">{fmt(rEq)} FC</div><div className="kpi-sub">équivalent unifié</div></div>
              <div className="kpi-card red"><div className="kpi-label">Dépenses</div><div className="kpi-value">{fmt(dEq)} FC</div><div className="kpi-sub">équivalent unifié</div></div>
              <div className="kpi-card blue"><div className="kpi-label">Reporté</div><div className="kpi-value">{fmt(rep)} FC</div></div>
              <div className={`kpi-card ${solde>=0?"green":"red"}`}><div className="kpi-label">Solde Final</div><div className="kpi-value" style={{color:solde>=0?"var(--green)":"var(--red)"}}>{fmt(solde)} FC</div></div>
            </div>
            <div style={{marginTop:12,display:"flex",gap:8}}>
              <button className="btn btn-gold" onClick={handlePrint}>🖨️ Imprimer bilan</button>
            </div>
          </div>
        </div>
      )}

      {tab==="historique" && (
        <div className="card">
          <div className="card-header"><h2>Historique des sessions</h2><span className="badge" style={{marginLeft:8,padding:"2px 8px",background:"var(--bg2)",borderRadius:10,fontSize:".72rem",fontWeight:700}}>{sessions.length}</span></div>
          <div className="card-body">
            {sessions.length===0 ? (
              <p style={{textAlign:"center",color:"var(--muted)",padding:"24px"}}>Aucune session sauvegardée.</p>
            ) : sessions.map(s=>(
              <div key={s.id} className="hist-item">
                <div>
                  <div className="hist-date">{s.titre}</div>
                  <div className="hist-meta">{s.date} {s.lieu && `• ${s.lieu}`}</div>
                </div>
                <div className={`hist-solde ${s.sums.solde>=0?"pos":"neg"}`}>{fmt(s.sums.solde)} FC</div>
                <button className="btn btn-ghost btn-sm">Charger</button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{display:"flex",gap:8,justifyContent:"flex-end",marginTop:8}}>
        <button className="btn btn-success" onClick={handleSave} disabled={saving}>
          {saving?"Sauvegarde...":"💾 Sauvegarder la session"}
        </button>
      </div>
    </div>
  );
}

// ============================================================
// EXPRESSIONS DE BESOINS (EB) MODULE
// ============================================================
const EB_URGENCE = [{v:"normal",l:"Normal"},{v:"urgent",l:"🔴 URGENT"},{v:"tres-urgent",l:"🚨 TRÈS URGENT"}];
const EB_STATUT_STYLES = {
  attente:  {bg:"#fef9c3",color:"#a16207",label:"⏳ En attente"},
  traitement:{bg:"#dbeafe",color:"#1d4ed8",label:"🔵 En traitement"},
  approuve: {bg:"#dcfce7",color:"#15803d",label:"✅ Approuvée"},
  rejete:   {bg:"#fee2e2",color:"#b91c1c",label:"❌ Rejetée"},
};

function EBModule({ user, addToast }) {
  const [tab, setTab] = useState(user.role==="admin"?"admin":"nouveau");
  const [demandes, setDemandes] = useState([
    {num:"EB-001",objet:"Achat chaises pour le temple",structure:"Bureau Pastoral",description:"Nous avons besoin de 50 nouvelles chaises pour agrandir la capacité d'accueil du temple lors des grands cultes.",montantFC:750000,montantUSD:0,urgence:"normal",statut:"attente",dateSoumis:"2026-05-01",soumisBy:"Pasteur Titulaire",commentaire:""},
    {num:"EB-002",objet:"Réparation système sonorisation",structure:"Équipe Technique",description:"Le système audio principal est défaillant. Remplacement urgent de l'amplificateur principal.",montantFC:0,montantUSD:350,urgence:"urgent",statut:"traitement",dateSoumis:"2026-05-08",soumisBy:"Alfred Bolenga",commentaire:"Devis reçu, en attente de fonds"},
  ]);
  const [filter, setFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);

  // Formulaire nouvelle EB
  const [objet, setObjet] = useState("");
  const [structure, setStructure] = useState("");
  const [description, setDescription] = useState("");
  const [montantFC, setMontantFC] = useState("");
  const [montantUSD, setMontantUSD] = useState("");
  const [urgence, setUrgence] = useState("normal");
  const [commentaires, setCommentaires] = useState({});

  const nextNum = () => {
    const max = demandes.reduce((m,d)=>{ const n=parseInt(d.num.replace("EB-",""))||0; return n>m?n:m; },0);
    return `EB-${String(max+1).padStart(3,"0")}`;
  };

  const submitEB = () => {
    if (!objet || !structure || !description) { addToast("Objet, structure et description obligatoires","err"); return; }
    const eb = { num:nextNum(), objet, structure, description, montantFC:parseFloat(montantFC)||0, montantUSD:parseFloat(montantUSD)||0, urgence, statut:"attente", dateSoumis:getTodayStr(), soumisBy:user.nom, commentaire:"" };
    setDemandes(d=>[eb,...d]);
    setObjet(""); setStructure(""); setDescription(""); setMontantFC(""); setMontantUSD(""); setUrgence("normal");
    addToast(`Demande ${eb.num} soumise avec succès ✅`,"ok");
    setTab(user.role==="admin"?"admin":"mes");
  };

  const validateEB = (num, newStatut) => {
    if (user.role !== "admin") { addToast("Réservé à l'administrateur","err"); return; }
    const comment = commentaires[num]||"";
    setDemandes(ds=>ds.map(d=>d.num===num?{...d,statut:newStatut,commentaire:comment,valideBy:user.nom,dateDecision:getTodayStr()}:d));
    const labels = {approuve:"Approuvée ✅",rejete:"Rejetée ❌",traitement:"En traitement 🔵",attente:"Remise en attente"};
    addToast(`${num} : ${labels[newStatut]||newStatut}`,"ok");
    if (newStatut==="approuve") addToast(`${num} sera ajoutée aux dépenses Finances`,"info");
  };

  const handlePrint = (num) => {
    const eb = demandes.find(d=>d.num===num); if(!eb) return;
    const st = EB_STATUT_STYLES[eb.statut]||{};
    const win = window.open("","_blank");
    win.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>EB ${eb.num}</title>
    <style>body{font-family:Arial,sans-serif;margin:24px;font-size:11pt;color:#0d1b2a}h1{font-size:14pt;color:#1a3a5c}
    .hdr{display:flex;align-items:center;gap:16px;border-bottom:3px solid #1a3a5c;padding-bottom:10px;margin-bottom:16px}
    .title-block{background:#1a3a5c;color:#fff;padding:10px 14px;border-radius:6px;margin-bottom:14px}
    .title-block h2{margin:0;font-size:12pt} .num{color:#c9a84c;font-size:10pt}
    .grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:14px}
    .field{border:1px solid #c5d8ed;border-radius:6px;padding:8px 11px}
    .field label{font-size:8pt;color:#6b88a4;text-transform:uppercase;display:block;margin-bottom:3px}
    .field span{font-size:10pt;font-weight:600}
    .statut{display:inline-block;padding:3px 10px;border-radius:20px;font-weight:700;font-size:9pt;background:${st.bg};color:${st.color}}
    .desc{background:#f5f8fb;border-radius:8px;padding:12px;border:1px solid #c5d8ed;margin-bottom:14px;font-size:10pt;line-height:1.5}
    .sign{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-top:30px}
    .sign-box{border-top:2px solid #1a3a5c;padding-top:8px;text-align:center;font-size:9pt;color:#6b88a4}
    @media print{button{display:none}}</style></head><body>
    <div class="hdr"><div style="width:60px;height:60px;background:#c9a84c;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:22px">✝️</div>
    <div><h1>ECC / 13ème CBFC — Kingasani 2</h1><p style="color:#6b88a4;margin:0;font-size:9pt">Expression de Besoin — Document officiel</p></div>
    <div style="margin-left:auto"><span class="statut">${st.label||eb.statut}</span></div></div>
    <button onclick="window.print()" style="margin-bottom:14px;padding:6px 14px;background:#1a3a5c;color:#fff;border:none;border-radius:6px;cursor:pointer">🖨️ Imprimer</button>
    <div class="title-block"><div class="num">${eb.num}</div><h2>${eb.objet}</h2></div>
    <div class="grid">
      <div class="field"><label>Structure</label><span>${eb.structure}</span></div>
      <div class="field"><label>Soumis par</label><span>${eb.soumisBy}</span></div>
      <div class="field"><label>Date de soumission</label><span>${eb.dateSoumis}</span></div>
      <div class="field"><label>Urgence</label><span>${eb.urgence==="urgent"?"🔴 URGENT":eb.urgence==="tres-urgent"?"🚨 TRÈS URGENT":"Normal"}</span></div>
      ${(eb.montantFC||eb.montantUSD)?`<div class="field" style="grid-column:1/-1"><label>Montant estimé</label><span>${eb.montantFC?fmt(eb.montantFC)+" FC":""}${eb.montantFC&&eb.montantUSD?" + ":""}${eb.montantUSD?eb.montantUSD+" USD":""}</span></div>`:""}
    </div>
    <div class="desc"><strong>Description :</strong><br>${eb.description}</div>
    ${eb.commentaire?`<div class="desc" style="background:#fff8e1;border-color:#fcd34d"><strong>Commentaire admin :</strong><br>${eb.commentaire}</div>`:""}
    <div class="sign">
      <div class="sign-box">Soumis par<br><strong>${eb.soumisBy}</strong></div>
      <div class="sign-box">Approuvé par<br><strong>${eb.valideBy||"__________________"}</strong></div>
    </div>
    </body></html>`);
    win.document.close();
  };

  const filtered = filter==="all" ? demandes : demandes.filter(d=>d.statut===filter);
  const pending = demandes.filter(d=>d.statut==="attente").length;

  return (
    <div>
      <div className="kpi-grid">
        <div className="kpi-card blue"><div className="kpi-label">Total demandes</div><div className="kpi-value">{demandes.length}</div></div>
        <div className="kpi-card gold"><div className="kpi-label">En attente</div><div className="kpi-value">{pending}</div><div className="kpi-sub">À valider</div></div>
        <div className="kpi-card green"><div className="kpi-label">Approuvées</div><div className="kpi-value">{demandes.filter(d=>d.statut==="approuve").length}</div></div>
        <div className="kpi-card red"><div className="kpi-label">Rejetées</div><div className="kpi-value">{demandes.filter(d=>d.statut==="rejete").length}</div></div>
      </div>

      <div className="tabs">
        <button className={`tab-btn ${tab==="nouveau"?"active":""}`} onClick={()=>setTab("nouveau")}>✏️ Nouvelle demande</button>
        <button className={`tab-btn ${tab==="mes"?"active":""}`} onClick={()=>setTab("mes")}>📋 Mes demandes</button>
        {user.role==="admin" && <button className={`tab-btn ${tab==="admin"?"active":""}`} onClick={()=>setTab("admin")}>⚙️ Admin {pending>0&&<span style={{marginLeft:4,background:"var(--red)",color:"#fff",borderRadius:10,padding:"1px 6px",fontSize:".62rem"}}>{pending}</span>}</button>}
      </div>

      {/* Nouvelle demande */}
      {tab==="nouveau" && (
        <div className="card">
          <div className="card-header"><h2>Soumettre une expression de besoin</h2></div>
          <div className="card-body">
            <div className="form-grid" style={{marginBottom:10}}>
              <div className="form-group" style={{gridColumn:"1/-1"}}>
                <label>Objet de la demande *</label>
                <input className="form-input" value={objet} onChange={e=>setObjet(e.target.value)} placeholder="Ex: Achat chaises, Réparation toiture..." />
              </div>
              <div className="form-group">
                <label>Structure / Département *</label>
                <input className="form-input" value={structure} onChange={e=>setStructure(e.target.value)} placeholder="Bureau Pastoral, Équipe Technique..." />
              </div>
              <div className="form-group">
                <label>Urgence</label>
                <select className="form-input" value={urgence} onChange={e=>setUrgence(e.target.value)}>
                  {EB_URGENCE.map(u=><option key={u.v} value={u.v}>{u.l}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Montant estimé FC</label>
                <input className="form-input amt" type="number" value={montantFC} onChange={e=>setMontantFC(e.target.value)} placeholder="0" />
              </div>
              <div className="form-group">
                <label>Montant estimé USD</label>
                <input className="form-input amt" type="number" value={montantUSD} onChange={e=>setMontantUSD(e.target.value)} placeholder="0" />
              </div>
              <div className="form-group" style={{gridColumn:"1/-1"}}>
                <label>Description détaillée *</label>
                <textarea className="form-input" rows={4} value={description} onChange={e=>setDescription(e.target.value)} placeholder="Décrivez le besoin en détail : quantités, justification, urgence..." style={{resize:"vertical"}} />
              </div>
            </div>
            <button className="btn btn-primary" onClick={submitEB}>📤 Soumettre la demande</button>
          </div>
        </div>
      )}

      {/* Mes demandes */}
      {tab==="mes" && (
        <div className="card">
          <div className="card-header"><h2>Mes demandes</h2></div>
          <div className="card-body">
            {demandes.filter(d=>d.soumisBy===user.nom).length===0 ? (
              <p style={{textAlign:"center",color:"var(--muted)",padding:24}}>Aucune demande soumise.</p>
            ) : demandes.filter(d=>d.soumisBy===user.nom).map(eb=>{
              const st = EB_STATUT_STYLES[eb.statut]||{};
              return (
                <div key={eb.num} style={{border:"1px solid var(--border)",borderRadius:10,padding:"12px 14px",marginBottom:10,background:"var(--bg)"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:6,marginBottom:6}}>
                    <div>
                      <span style={{fontWeight:700,color:"var(--navy2)",fontSize:".82rem"}}>{eb.num} — {eb.objet}</span>
                      <div style={{fontSize:".7rem",color:"var(--muted)",marginTop:2}}>{eb.structure} • {eb.dateSoumis}</div>
                    </div>
                    <span style={{padding:"3px 10px",borderRadius:20,fontSize:".68rem",fontWeight:700,background:st.bg,color:st.color}}>{st.label}</span>
                  </div>
                  {(eb.montantFC||eb.montantUSD) && <div style={{fontSize:".74rem",color:"var(--blue)",fontWeight:600,marginBottom:4}}>Montant : {eb.montantFC?fmt(eb.montantFC)+" FC":""}{eb.montantFC&&eb.montantUSD?" + ":""}{eb.montantUSD?eb.montantUSD+" USD":""}</div>}
                  {eb.commentaire && <div style={{fontSize:".72rem",color:"var(--muted)",fontStyle:"italic",marginBottom:6}}>💬 {eb.commentaire}</div>}
                  <button className="btn btn-ghost btn-sm" onClick={()=>handlePrint(eb.num)}>🖨️ Imprimer</button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Admin */}
      {tab==="admin" && user.role==="admin" && (
        <div className="card">
          <div className="card-header">
            <h2>Gestion des demandes</h2>
            <div style={{marginLeft:"auto",display:"flex",gap:4}}>
              {["all","attente","traitement","approuve","rejete"].map(f=>(
                <button key={f} className={`btn btn-sm ${filter===f?"btn-primary":"btn-ghost"}`} onClick={()=>setFilter(f)} style={{fontSize:".65rem",padding:"4px 8px"}}>
                  {f==="all"?"Tous":EB_STATUT_STYLES[f]?.label||f}
                </button>
              ))}
            </div>
          </div>
          <div className="card-body">
            {filtered.length===0 ? <p style={{textAlign:"center",color:"var(--muted)",padding:24}}>Aucune demande.</p>
            : filtered.map(eb=>{
              const st = EB_STATUT_STYLES[eb.statut]||{};
              return (
                <div key={eb.num} style={{border:"1px solid var(--border)",borderRadius:10,padding:"12px 14px",marginBottom:10,background:"var(--bg)"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:6}}>
                    <div>
                      <span style={{fontWeight:700,color:"var(--navy2)",fontSize:".85rem"}}>{eb.num} — {eb.objet}</span>
                      <div style={{fontSize:".7rem",color:"var(--muted)",marginTop:2}}>{eb.structure} • Par : <strong>{eb.soumisBy}</strong> • {eb.dateSoumis} {eb.urgence!=="normal"&&<span style={{color:"var(--red)",fontWeight:700,marginLeft:4}}>{eb.urgence==="urgent"?"🔴 URGENT":"🚨 TRÈS URGENT"}</span>}</div>
                    </div>
                    <span style={{padding:"3px 10px",borderRadius:20,fontSize:".68rem",fontWeight:700,background:st.bg,color:st.color}}>{st.label}</span>
                  </div>
                  <p style={{fontSize:".78rem",color:"var(--text)",margin:"8px 0"}}>{eb.description}</p>
                  {(eb.montantFC||eb.montantUSD) && <div style={{fontSize:".76rem",color:"var(--blue)",fontWeight:700,marginBottom:8}}>💰 Montant estimé : {eb.montantFC?fmt(eb.montantFC)+" FC":""}{eb.montantFC&&eb.montantUSD?" + ":""}{eb.montantUSD?eb.montantUSD+" USD":""}</div>}
                  {(eb.statut==="attente"||eb.statut==="traitement") && (
                    <>
                      <textarea className="form-input" rows={2} placeholder="Commentaire (optionnel)..." value={commentaires[eb.num]||""} onChange={e=>setCommentaires(c=>({...c,[eb.num]:e.target.value}))} style={{marginBottom:8,resize:"vertical"}} />
                      <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                        <button className="btn btn-success btn-sm" onClick={()=>validateEB(eb.num,"approuve")}>✅ Approuver</button>
                        <button className="btn btn-sm" style={{background:"var(--blue)",color:"#fff"}} onClick={()=>validateEB(eb.num,"traitement")}>🔵 En traitement</button>
                        <button className="btn btn-danger btn-sm" onClick={()=>validateEB(eb.num,"rejete")}>❌ Rejeter</button>
                        <button className="btn btn-ghost btn-sm" onClick={()=>handlePrint(eb.num)}>🖨️ Imprimer</button>
                      </div>
                    </>
                  )}
                  {(eb.statut==="approuve"||eb.statut==="rejete") && (
                    <div style={{display:"flex",gap:6,marginTop:6,flexWrap:"wrap"}}>
                      {eb.commentaire && <span style={{fontSize:".72rem",color:"var(--muted)",fontStyle:"italic",flex:1}}>💬 {eb.commentaire}</span>}
                      <button className="btn btn-ghost btn-sm" onClick={()=>handlePrint(eb.num)}>🖨️ Imprimer</button>
                      <button className="btn btn-ghost btn-sm" onClick={()=>validateEB(eb.num,"attente")}>↩️ Remettre en attente</button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// ANNONCES MODULE
// ============================================================
const ANN_CATS = [
  {v:"general",l:"📢 Général",color:"#2e75b6"},
  {v:"culte",l:"⛪ Culte",color:"#1e7d52"},
  {v:"reunion",l:"👥 Réunion",color:"#7c3aed"},
  {v:"finances",l:"💰 Finances",color:"#c9a84c"},
  {v:"projet",l:"🏗️ Projet",color:"#c2410c"},
  {v:"urgence",l:"🚨 Urgence",color:"#b91c1c"},
];

function AnnoncesModule({ user, addToast }) {
  const [annonces, setAnnonces] = useState([
    {id:"a1",titre:"Culte spécial — Journée des Familles",message:"Nous vous convions à notre culte spécial dédié aux familles le dimanche 1er juin 2026. Présence de tous les membres recommandée.",categorie:"culte",auteur:"Pasteur Titulaire",date:"2026-05-20",expiration:"2026-06-01",actif:true},
    {id:"a2",titre:"Réunion du Bureau Pastoral",message:"Le Bureau Pastoral se réunira le samedi 25 mai à 10h. Ordre du jour : révision du budget mai et planification juin.",categorie:"reunion",auteur:"Pasteur Titulaire",date:"2026-05-18",expiration:"2026-05-25",actif:true},
  ]);
  const [showForm, setShowForm] = useState(false);
  const [titre, setTitre] = useState("");
  const [message, setMessage] = useState("");
  const [categorie, setCategorie] = useState("general");
  const [expiration, setExpiration] = useState("");
  const [filterCat, setFilterCat] = useState("all");

  const handleAdd = () => {
    if (!titre || !message) { addToast("Titre et message obligatoires","err"); return; }
    const ann = { id:"a"+Date.now(), titre, message, categorie, auteur:user.nom, date:getTodayStr(), expiration, actif:true };
    setAnnonces(a=>[ann,...a]);
    setTitre(""); setMessage(""); setCategorie("general"); setExpiration("");
    setShowForm(false);
    addToast("Annonce publiée ✅","ok");
  };

  const handleDelete = (id) => {
    setAnnonces(a=>a.filter(x=>x.id!==id));
    addToast("Annonce supprimée","info");
  };

  const today = getTodayStr();
  const filtered = annonces.filter(a=>{
    if (filterCat!=="all" && a.categorie!==filterCat) return false;
    return true;
  });
  const actives = annonces.filter(a=>!a.expiration||a.expiration>=today).length;

  return (
    <div>
      <div className="kpi-grid">
        <div className="kpi-card blue"><div className="kpi-label">Total annonces</div><div className="kpi-value">{annonces.length}</div></div>
        <div className="kpi-card green"><div className="kpi-label">Actives</div><div className="kpi-value">{actives}</div><div className="kpi-sub">Non expirées</div></div>
        <div className="kpi-card gold"><div className="kpi-label">Expirées</div><div className="kpi-value">{annonces.length-actives}</div></div>
      </div>

      <div style={{display:"flex",gap:8,marginBottom:14,flexWrap:"wrap",alignItems:"center"}}>
        <div style={{display:"flex",gap:4,flexWrap:"wrap",flex:1}}>
          <button className={`btn btn-sm ${filterCat==="all"?"btn-primary":"btn-ghost"}`} onClick={()=>setFilterCat("all")}>Toutes</button>
          {ANN_CATS.map(c=>(
            <button key={c.v} className={`btn btn-sm ${filterCat===c.v?"btn-primary":"btn-ghost"}`} onClick={()=>setFilterCat(c.v)} style={{fontSize:".65rem"}}>{c.l}</button>
          ))}
        </div>
        {user.role==="admin" && (
          <button className="btn btn-primary" onClick={()=>setShowForm(!showForm)}>
            {showForm?"✕ Annuler":"+ Nouvelle annonce"}
          </button>
        )}
      </div>

      {showForm && user.role==="admin" && (
        <div className="card" style={{marginBottom:14,borderLeft:"4px solid var(--gold)"}}>
          <div className="card-header"><h2>Publier une annonce</h2></div>
          <div className="card-body">
            <div className="form-grid" style={{marginBottom:10}}>
              <div className="form-group" style={{gridColumn:"1/-1"}}>
                <label>Titre *</label>
                <input className="form-input" value={titre} onChange={e=>setTitre(e.target.value)} placeholder="Titre de l'annonce..." />
              </div>
              <div className="form-group">
                <label>Catégorie</label>
                <select className="form-input" value={categorie} onChange={e=>setCategorie(e.target.value)}>
                  {ANN_CATS.map(c=><option key={c.v} value={c.v}>{c.l}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Date d'expiration</label>
                <input className="form-input" type="date" value={expiration} onChange={e=>setExpiration(e.target.value)} />
              </div>
              <div className="form-group" style={{gridColumn:"1/-1"}}>
                <label>Message *</label>
                <textarea className="form-input" rows={4} value={message} onChange={e=>setMessage(e.target.value)} placeholder="Contenu de l'annonce..." style={{resize:"vertical"}} />
              </div>
            </div>
            <button className="btn btn-success" onClick={handleAdd}>📢 Publier</button>
          </div>
        </div>
      )}

      <div>
        {filtered.length===0 ? (
          <div style={{textAlign:"center",padding:"32px",color:"var(--muted)"}}>
            <div style={{fontSize:"2rem",marginBottom:8}}>📢</div>
            <p>Aucune annonce pour cette catégorie.</p>
          </div>
        ) : filtered.map(ann=>{
          const cat = ANN_CATS.find(c=>c.v===ann.categorie)||ANN_CATS[0];
          const isExpired = ann.expiration && ann.expiration < today;
          return (
            <div key={ann.id} className="card" style={{marginBottom:12,opacity:isExpired?.65:1,borderLeft:`4px solid ${cat.color}`}}>
              <div className="card-header" style={{background:isExpired?"var(--bg2)":"var(--card)"}}>
                <div style={{flex:1}}>
                  <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
                    <h2 style={{fontSize:".88rem"}}>{ann.titre}</h2>
                    <span style={{padding:"2px 8px",borderRadius:10,fontSize:".65rem",fontWeight:700,background:cat.color+"20",color:cat.color}}>{cat.l}</span>
                    {isExpired && <span style={{padding:"2px 8px",borderRadius:10,fontSize:".65rem",fontWeight:700,background:"#f3f4f6",color:"var(--muted)"}}>Expirée</span>}
                  </div>
                  <div style={{fontSize:".7rem",color:"var(--muted)",marginTop:3}}>Par {ann.auteur} • {ann.date} {ann.expiration&&`• Expire le ${ann.expiration}`}</div>
                </div>
                {user.role==="admin" && <button className="btn-del" onClick={()=>handleDelete(ann.id)}>×</button>}
              </div>
              <div className="card-body" style={{paddingTop:10}}>
                <p style={{fontSize:".82rem",lineHeight:1.6,color:"var(--text)"}}>{ann.message}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================
// HISTORIQUE MODULE (Finances)
// ============================================================
function HistoriqueModule({ taux, addToast }) {
  const t = parseFloat(taux)||2800;
  const [history, setHistory] = useState([
    {id:"h1",meta:{date:"2026-05-18",effCF:120,effCL:87,taux:2800,repCDF:0,repUSD:0},sums:{rCDF:185000,rUSD:50,dCDF:142000,dUSD:30,nCDF:43000,nUSD:20},savedAt:"2026-05-18T18:30:00"},
    {id:"h2",meta:{date:"2026-05-11",effCF:105,effCL:76,taux:2800,repCDF:43000,repUSD:20},sums:{rCDF:172000,rUSD:40,dCDF:138000,dUSD:25,nCDF:34000,nUSD:15},savedAt:"2026-05-11T18:45:00"},
    {id:"h3",meta:{date:"2026-05-04",effCF:130,effCL:92,taux:2750,repCDF:0,repUSD:0},sums:{rCDF:196000,rUSD:60,dCDF:153000,dUSD:35,nCDF:43000,nUSD:25},savedAt:"2026-05-04T17:55:00"},
    {id:"h4",meta:{date:"2026-04-27",effCF:118,effCL:82,taux:2800,repCDF:0,repUSD:0},sums:{rCDF:178000,rUSD:45,dCDF:144000,dUSD:28,nCDF:34000,nUSD:17},savedAt:"2026-04-27T18:20:00"},
  ]);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const filtered = history.filter(h=>{
    const d = h.meta.date||"";
    if (dateFrom && d < dateFrom) return false;
    if (dateTo && d > dateTo) return false;
    return true;
  }).sort((a,b)=>a.meta.date.localeCompare(b.meta.date));

  let cumul = 0;
  const rows = filtered.map(h=>{
    const tt = parseFloat(h.meta.taux)||t;
    const rEq = (h.sums.rCDF||0)+(h.sums.rUSD||0)*tt;
    const dEq = (h.sums.dCDF||0)+(h.sums.dUSD||0)*tt;
    const nEq = rEq - dEq;
    cumul += nEq;
    return {...h, rEq, dEq, nEq, cumul};
  });

  const totR = rows.reduce((s,r)=>s+r.rEq,0);
  const totD = rows.reduce((s,r)=>s+r.dEq,0);
  const totN = rows.length>0?rows[rows.length-1].cumul:0;

  const handlePrint = () => {
    if (!rows.length) { addToast("Aucune entrée à imprimer","err"); return; }
    const period = (dateFrom||"début")+" → "+(dateTo||"aujourd'hui");
    const win = window.open("","_blank");
    win.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Historique ECC Kingasani 2</title>
    <style>body{font-family:Arial,sans-serif;margin:20px;font-size:11px;color:#0d1b2a}
    h1{font-size:15px;color:#1a3a5c}table{width:100%;border-collapse:collapse}
    th{background:#1a3a5c;color:#fff;padding:6px 8px;font-size:9px;text-transform:uppercase}
    td{padding:5px 8px;border-bottom:1px solid #eee}
    tr:nth-child(even) td{background:#f8fafc}
    .tot td{background:#1a3a5c;color:#fff;font-weight:700}
    .kpis{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin:12px 0}
    .kpi{background:#eef4fb;border-radius:6px;padding:8px;border:1px solid #c5d8ed}
    .kpi-l{font-size:8px;color:#6b88a4;text-transform:uppercase;margin-bottom:3px}
    .kpi-v{font-size:13px;font-weight:800;font-family:monospace}
    @media print{button{display:none}@page{size:A4 landscape;margin:15mm}}</style>
    </head><body>
    <h1>ECC / 13ème CBFC — Kingasani 2</h1>
    <p style="color:#6b88a4;font-size:10px">Rapport Historique Finances | Période : <strong>${period}</strong> | ${rows.length} culte(s) | Imprimé le ${new Date().toLocaleDateString("fr-FR",{day:"2-digit",month:"long",year:"numeric"})}</p>
    <button onclick="window.print()" style="margin-bottom:12px;padding:6px 14px;background:#1a3a5c;color:#fff;border:none;border-radius:6px;cursor:pointer">🖨️ Imprimer / Enregistrer PDF</button>
    <div class="kpis">
      <div class="kpi"><div class="kpi-l">Total Recettes</div><div class="kpi-v">${fmt(totR)} FC</div></div>
      <div class="kpi"><div class="kpi-l">Total Dépenses</div><div class="kpi-v">${fmt(totD)} FC</div></div>
      <div class="kpi"><div class="kpi-l">Solde Cumulé Final</div><div class="kpi-v" style="color:${totN>=0?"green":"red"}">${fmt(totN)} FC</div></div>
      <div class="kpi"><div class="kpi-l">Couverture</div><div class="kpi-v">${totR>0?Math.round(totD/totR*100):0}%</div></div>
    </div>
    <table><thead><tr><th>Date</th><th>CF</th><th>CL</th><th>Rec. FC</th><th>Rec. USD</th><th>Dép. FC</th><th>Dép. USD</th><th>Reporté</th><th>Solde net</th><th style="background:#2e75b6">Solde cumulé ↗</th></tr></thead><tbody>
    ${rows.map(r=>`<tr>
      <td><strong>${r.meta.date}</strong></td>
      <td style="text-align:center">${r.meta.effCF||0}</td>
      <td style="text-align:center">${r.meta.effCL||0}</td>
      <td style="text-align:right;font-family:monospace">${fmt(r.sums.rCDF)}</td>
      <td style="text-align:right;font-family:monospace">${fmt(r.sums.rUSD)}</td>
      <td style="text-align:right;font-family:monospace">${fmt(r.sums.dCDF)}</td>
      <td style="text-align:right;font-family:monospace">${fmt(r.sums.dUSD)}</td>
      <td style="text-align:right;font-family:monospace">${fmt(r.meta.repCDF||0)}</td>
      <td style="text-align:right;font-family:monospace;font-weight:700;color:${r.nEq>=0?"green":"red"}">${fmt(r.nEq)}</td>
      <td style="text-align:right;font-family:monospace;font-weight:800;color:${r.cumul>=0?"green":"red"};background:${r.cumul>=0?"#f0faf4":"#fff0f0"}">${fmt(r.cumul)}</td>
    </tr>`).join("")}
    <tr class="tot"><td colspan="3">TOTAL — ${rows.length} cultes</td><td style="text-align:right;font-family:monospace">${fmt(rows.reduce((s,r)=>s+r.sums.rCDF,0))}</td><td style="text-align:right;font-family:monospace">${fmt(rows.reduce((s,r)=>s+r.sums.rUSD,0))}</td><td style="text-align:right;font-family:monospace">${fmt(rows.reduce((s,r)=>s+r.sums.dCDF,0))}</td><td style="text-align:right;font-family:monospace">${fmt(rows.reduce((s,r)=>s+r.sums.dUSD,0))}</td><td></td><td style="text-align:right;font-family:monospace">${fmt(totN)}</td><td style="text-align:right;font-family:monospace;background:#2e75b6;font-size:13px">${fmt(totN)} FC</td>
    </tr></tbody></table>
    <div style="margin-top:14px;font-size:9px;color:#9ca3af;border-top:1px solid #eee;padding-top:8px">ECC Kingasani 2 — Taux de référence : 1 USD = ${t} FC</div>
    </body></html>`);
    win.document.close();
  };

  return (
    <div>
      <div className="kpi-grid">
        <div className="kpi-card blue"><div className="kpi-label">Cultes enregistrés</div><div className="kpi-value">{rows.length}</div><div className="kpi-sub">{dateFrom||dateTo?"Filtrés":"Total"}</div></div>
        <div className="kpi-card green"><div className="kpi-label">Recettes cumulées</div><div className="kpi-value">{fmt(totR)} FC</div><div className="kpi-sub">équivalent unifié</div></div>
        <div className="kpi-card red"><div className="kpi-label">Dépenses cumulées</div><div className="kpi-value">{fmt(totD)} FC</div><div className="kpi-sub">équivalent unifié</div></div>
        <div className={`kpi-card ${totN>=0?"green":"red"}`}><div className="kpi-label">Solde cumulé</div><div className="kpi-value" style={{color:totN>=0?"var(--green)":"var(--red)"}}>{fmt(totN)} FC</div><div className="kpi-sub">{totN>=0?"✅ Excédent":"❌ Déficit"}</div></div>
      </div>

      {/* Filtre + bouton imprimer */}
      <div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"flex-end",marginBottom:14,padding:"10px 14px",background:"var(--card)",borderRadius:"var(--radius)",border:"1px solid var(--border)"}}>
        <div className="form-group" style={{flex:1,minWidth:130}}>
          <label>Du</label>
          <input className="form-input" type="date" value={dateFrom} onChange={e=>setDateFrom(e.target.value)} />
        </div>
        <div className="form-group" style={{flex:1,minWidth:130}}>
          <label>Au</label>
          <input className="form-input" type="date" value={dateTo} onChange={e=>setDateTo(e.target.value)} />
        </div>
        <button className="btn btn-ghost" onClick={()=>{setDateFrom("");setDateTo("");}}>Tout afficher</button>
        <button className="btn btn-gold" onClick={handlePrint}>🖨️ Imprimer</button>
      </div>

      {/* Résumé période si filtre actif */}
      {(dateFrom||dateTo) && rows.length>0 && (
        <div style={{marginBottom:12,padding:"9px 13px",background:"#f0faf4",border:"1px solid var(--green-light)",borderRadius:8,fontSize:".76rem",color:"var(--green)",fontWeight:600}}>
          📅 <strong>{(dateFrom||"début")} → {(dateTo||"aujourd'hui")}</strong> — {rows.length} culte(s) | Recettes : <strong>{fmt(totR)}</strong> FC | Dépenses : <strong>{fmt(totD)}</strong> FC | Solde : <strong style={{color:totN>=0?"var(--green)":"var(--red)"}}>{fmt(totN)}</strong> FC
        </div>
      )}

      {/* Liste */}
      <div className="card">
        <div className="card-header">
          <h2>Historique des cultes</h2>
          <span style={{marginLeft:8,padding:"2px 8px",background:"var(--bg2)",borderRadius:10,fontSize:".72rem",fontWeight:700}}>{rows.length}{(dateFrom||dateTo)?"/"+history.length:""}</span>
        </div>
        <div className="card-body">
          {rows.length===0 ? (
            <p style={{textAlign:"center",color:"var(--muted)",padding:24}}>Aucune entrée pour cette période.</p>
          ) : [...rows].reverse().map((h,i)=>(
            <div key={h.id} className="hist-item">
              <div style={{flex:1}}>
                <div className="hist-date">{h.meta.date}</div>
                <div className="hist-meta">CF:{h.meta.effCF||0} CL:{h.meta.effCL||0} | Rec: {fmt(h.sums.rCDF)} FC</div>
              </div>
              <div style={{textAlign:"right"}}>
                <div className={`hist-solde ${h.nEq>=0?"pos":"neg"}`}>Net {fmt(h.nEq)} FC</div>
                <div style={{fontSize:".68rem",fontWeight:700,color:"var(--blue)",fontFamily:"'DM Mono',monospace",marginTop:2}}>Cumul {fmt(h.cumul)} FC</div>
              </div>
              <div style={{display:"flex",gap:4}}>
                <button className="btn btn-ghost btn-sm" onClick={()=>addToast(`Culte du ${h.meta.date} chargé`,"info")}>Charger</button>
                <button className="btn btn-ghost btn-sm" style={{color:"var(--red)"}} onClick={()=>{ setHistory(hist=>hist.filter(x=>x.id!==h.id)); addToast("Entrée supprimée","info"); }}>×</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// EXPORTS
// ============================================================
export { SeminaireModule, EBModule, AnnoncesModule, HistoriqueModule };