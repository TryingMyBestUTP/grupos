import { useState, useEffect, useCallback } from "react";
import { api } from "../api";

const DEADLINE = new Date("2026-07-21T13:45:00-05:00");
const closed = () => Date.now() > DEADLINE;

export default function Groups({ session, onLogout }) {
  const [groups, setGroups]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy]       = useState(false);
  const [msg, setMsg]         = useState(null); // { text, ok }

  const myGroup = session.group_id;

  const load = useCallback(async () => {
    try {
      const data = await api.groups();
      setGroups(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  function notify(text, ok = true) {
    setMsg({ text, ok });
    setTimeout(() => setMsg(null), 3000);
  }

  async function join(id) {
    setBusy(true);
    try {
      await api.join(id, session.token);
      session.group_id = id;
      sessionStorage.setItem("utp_session", JSON.stringify(session));
      notify("¡Te uniste al grupo!");
      await load();
    } catch (e) {
      notify(e.message, false);
    } finally {
      setBusy(false);
    }
  }

  async function leave(id) {
    setBusy(true);
    try {
      await api.leave(id, session.token);
      session.group_id = 0;
      sessionStorage.setItem("utp_session", JSON.stringify(session));
      notify("Saliste del grupo.");
      await load();
    } catch (e) {
      notify(e.message, false);
    } finally {
      setBusy(false);
    }
  }

  // Cuántos están sin grupo aún
  const registered = groups.reduce((n, g) => n + g.size, 0);
  const total = 29;

  return (
    <div style={s.page}>
      {/* Nav */}
      <nav style={s.nav}>
        <span style={s.navTitle}>013616 · Grupos</span>
        <div style={s.navRight}>
          <span style={s.navName}>{session.name}</span>
          <a href={api.export()} style={s.exportBtn} target="_blank" rel="noreferrer">
            Exportar Excel ↓
          </a>
          <button style={s.logoutBtn} onClick={onLogout}>Salir</button>
        </div>
      </nav>

      {/* Toast */}
      {msg && (
        <div style={{ ...s.toast, background: msg.ok ? "#0a0a0a" : "#dc2626" }}>
          {msg.text}
        </div>
      )}

      {/* Progreso */}
      <div style={s.progress}>
        <div style={s.progressInfo}>
          <span>{registered} de {total} estudiantes registrados</span>
          <span style={{ color: "#71717a", fontSize: 12 }}>
            {closed() ? "Registro cerrado" : "Abierto hasta 21 Jul 2026 · 1:45 PM"}
          </span>
        </div>
        <div style={s.progressBar}>
          <div style={{ ...s.progressFill, width: `${(registered / total) * 100}%` }} />
        </div>
      </div>

      {/* Status */}
      {myGroup
        ? <div style={s.statusOk}>✓ Estás en el Grupo {myGroup}</div>
        : <div style={s.statusPending}>Aún no te has unido a ningún grupo</div>
      }

      {/* Grupos */}
      {loading ? (
        <p style={{ color: "#a1a1aa", textAlign: "center", padding: 40 }}>Cargando...</p>
      ) : (
        <div style={s.grid}>
          {groups.map(g => {
            const isMine   = myGroup === g.id;
            const inOther  = myGroup && !isMine;
            const canJoin  = !closed() && !myGroup && !g.is_full;
            const canLeave = !closed() && isMine;

            return (
              <div key={g.id} style={{ ...s.card, ...(isMine ? s.cardMine : {}) }}>
                {/* Header */}
                <div style={s.cardHeader}>
                  <div>
                    <p style={s.cardLabel}>GRUPO {g.id}</p>
                    <p style={s.cardSlots}>
                      {g.size}/{g.max_size} integrantes
                    </p>
                  </div>
                  {g.is_full
                    ? <span style={s.badgeFull}>Lleno</span>
                    : <span style={s.badgeOpen}>{g.max_size - g.size} disponible{g.max_size - g.size > 1 ? "s" : ""}</span>
                  }
                </div>

                {/* Barra */}
                <div style={s.miniBar}>
                  <div style={{ ...s.miniFill, width: `${(g.size / g.max_size) * 100}%` }} />
                </div>

                {/* Miembros */}
                <ul style={s.memberList}>
                  {g.members.map(m => (
                    <li key={m.name} style={s.member}>
                      <span style={s.memberDot} />
                      <span style={m.name === session.name ? s.memberMe : s.memberName}>
                        {m.name}
                        {m.name === session.name && " (tú)"}
                      </span>
                    </li>
                  ))}
                  {Array.from({ length: g.max_size - g.size }).map((_, i) => (
                    <li key={`empty-${i}`} style={s.member}>
                      <span style={s.memberDotEmpty} />
                      <span style={s.memberEmpty}>Disponible</span>
                    </li>
                  ))}
                </ul>

                {/* Acciones */}
                {canJoin && (
                  <button
                    style={s.btnJoin}
                    onClick={() => join(g.id)}
                    disabled={busy}
                  >
                    Unirme →
                  </button>
                )}
                {canLeave && (
                  <button
                    style={s.btnLeave}
                    onClick={() => leave(g.id)}
                    disabled={busy}
                  >
                    Salir del grupo
                  </button>
                )}
                {inOther && !g.is_full && (
                  <p style={s.inOther}>Ya estás en el Grupo {myGroup}</p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

const s = {
  page: { maxWidth: 900, margin: "0 auto", padding: "0 20px 80px" },

  nav: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "18px 0",
    borderBottom: "1px solid #e4e4e7",
    marginBottom: 28,
    position: "sticky",
    top: 0,
    background: "#fff",
    zIndex: 10,
  },
  navTitle: { fontWeight: 700, fontSize: 15, letterSpacing: "-0.01em" },
  navRight: { display: "flex", alignItems: "center", gap: 12 },
  navName: { fontSize: 13, color: "#71717a" },
  exportBtn: {
    fontSize: 13,
    fontWeight: 600,
    padding: "6px 12px",
    border: "1px solid #e4e4e7",
    borderRadius: 6,
    color: "#0a0a0a",
    transition: "background 160ms",
  },
  logoutBtn: {
    fontSize: 13,
    padding: "6px 12px",
    border: "1px solid #e4e4e7",
    borderRadius: 6,
    background: "none",
    color: "#71717a",
  },

  toast: {
    position: "fixed",
    bottom: 24,
    left: "50%",
    transform: "translateX(-50%)",
    color: "#fff",
    padding: "12px 20px",
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 500,
    zIndex: 100,
    whiteSpace: "nowrap",
  },

  progress: { marginBottom: 16 },
  progressInfo: { display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 13 },
  progressBar: { height: 4, background: "#f4f4f5", borderRadius: 4, overflow: "hidden" },
  progressFill: { height: "100%", background: "#0a0a0a", borderRadius: 4, transition: "width 600ms ease" },

  statusOk: {
    display: "inline-block",
    background: "#f0fdf4",
    color: "#16a34a",
    border: "1px solid #bbf7d0",
    borderRadius: 6,
    padding: "6px 14px",
    fontSize: 13,
    fontWeight: 600,
    marginBottom: 24,
  },
  statusPending: {
    display: "inline-block",
    background: "#fffbeb",
    color: "#b45309",
    border: "1px solid #fde68a",
    borderRadius: 6,
    padding: "6px 14px",
    fontSize: 13,
    fontWeight: 600,
    marginBottom: 24,
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
    gap: 16,
  },
  card: {
    border: "1px solid #e4e4e7",
    borderRadius: 10,
    padding: "18px 20px",
    display: "flex",
    flexDirection: "column",
    gap: 14,
    transition: "box-shadow 160ms",
  },
  cardMine: {
    border: "2px solid #0a0a0a",
  },

  cardHeader: { display: "flex", justifyContent: "space-between", alignItems: "flex-start" },
  cardLabel: { fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", color: "#a1a1aa" },
  cardSlots: { fontSize: 18, fontWeight: 700, letterSpacing: "-0.02em", marginTop: 2 },
  badgeFull: {
    fontSize: 11, fontWeight: 600, padding: "3px 8px",
    background: "#f4f4f5", color: "#71717a", borderRadius: 20,
  },
  badgeOpen: {
    fontSize: 11, fontWeight: 600, padding: "3px 8px",
    background: "#f0fdf4", color: "#16a34a", borderRadius: 20,
  },

  miniBar: { height: 3, background: "#f4f4f5", borderRadius: 4, overflow: "hidden" },
  miniFill: { height: "100%", background: "#0a0a0a", borderRadius: 4 },

  memberList: { listStyle: "none", display: "flex", flexDirection: "column", gap: 6, flex: 1 },
  member: { display: "flex", alignItems: "center", gap: 8 },
  memberDot: { width: 6, height: 6, borderRadius: "50%", background: "#0a0a0a", flexShrink: 0 },
  memberDotEmpty: { width: 6, height: 6, borderRadius: "50%", border: "1px solid #d4d4d8", flexShrink: 0 },
  memberName: { fontSize: 13, color: "#3f3f46" },
  memberMe: { fontSize: 13, fontWeight: 600, color: "#0a0a0a" },
  memberEmpty: { fontSize: 13, color: "#d4d4d8", fontStyle: "italic" },

  btnJoin: {
    width: "100%", padding: "9px", borderRadius: 8,
    background: "#0a0a0a", color: "#fff", border: "none",
    fontSize: 13, fontWeight: 600,
  },
  btnLeave: {
    width: "100%", padding: "9px", borderRadius: 8,
    background: "none", color: "#ef4444",
    border: "1px solid #fca5a5", fontSize: 13, fontWeight: 500,
  },
  inOther: { fontSize: 12, color: "#a1a1aa", textAlign: "center" },
};
