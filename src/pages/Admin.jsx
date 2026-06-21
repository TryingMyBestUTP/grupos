import { useState, useEffect, useCallback } from "react";
import { api } from "../api";

export default function Admin({ onLogout, session }) {
  const [groups, setGroups]   = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const data = await api.groups();
      setGroups(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const registered = groups.reduce((n, g) => n + g.size, 0);
  const total = 29;

  return (
    <div style={s.page}>
      <nav style={s.nav}>
        <span style={s.navTitle}>013616 · {session.name}</span>
        <div style={s.navRight}>
          <a href={api.export()} style={s.exportBtn} target="_blank" rel="noreferrer">
            Exportar Excel ↓
          </a>
          <button style={s.logoutBtn} onClick={onLogout}>Salir</button>
        </div>
      </nav>

      <div style={s.progress}>
        <div style={s.progressInfo}>
          <span>{registered} de {total} registrados</span>
          <span style={{ color: "#71717a", fontSize: 12 }}>Solo lectura</span>
        </div>
        <div style={s.progressBar}>
          <div style={{ ...s.progressFill, width: `${(registered / total) * 100}%` }} />
        </div>
      </div>

      {loading ? (
        <p style={{ color: "#a1a1aa", textAlign: "center", padding: 40 }}>Cargando...</p>
      ) : (
        <div style={s.grid}>
          {groups.map(g => (
            <div key={g.id} style={s.card}>
              <div style={s.cardHeader}>
                <div>
                  <p style={s.cardLabel}>GRUPO {g.id}</p>
                  <p style={s.cardSlots}>{g.size}/{g.max_size}</p>
                </div>
                {g.is_full
                  ? <span style={s.badgeFull}>Completo</span>
                  : <span style={s.badgeOpen}>{g.max_size - g.size} libre{g.max_size - g.size > 1 ? "s" : ""}</span>
                }
              </div>

              <div style={s.miniBar}>
                <div style={{ ...s.miniFill, width: `${(g.size / g.max_size) * 100}%` }} />
              </div>

              <ul style={s.memberList}>
                {g.members.map(m => (
                  <li key={m.name} style={s.member}>
                    <span style={s.dot} />
                    <span style={s.memberName}>{m.name}</span>
                  </li>
                ))}
                {Array.from({ length: g.max_size - g.size }).map((_, i) => (
                  <li key={i} style={s.member}>
                    <span style={s.dotEmpty} />
                    <span style={s.memberEmpty}>Disponible</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const s = {
  page: { maxWidth: 900, margin: "0 auto", padding: "0 20px 80px" },

  nav: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "18px 0", borderBottom: "1px solid #e4e4e7", marginBottom: 28,
    position: "sticky", top: 0, background: "#fff", zIndex: 10,
  },
  navTitle: { fontWeight: 700, fontSize: 15 },
  navRight: { display: "flex", alignItems: "center", gap: 12 },
  exportBtn: {
    fontSize: 13, fontWeight: 600, padding: "6px 12px",
    border: "1px solid #0a0a0a", borderRadius: 6, color: "#0a0a0a",
  },
  logoutBtn: {
    fontSize: 13, padding: "6px 12px", border: "1px solid #e4e4e7",
    borderRadius: 6, background: "none", color: "#71717a",
  },

  progress: { marginBottom: 24 },
  progressInfo: { display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 13 },
  progressBar: { height: 4, background: "#f4f4f5", borderRadius: 4, overflow: "hidden" },
  progressFill: { height: "100%", background: "#0a0a0a", borderRadius: 4, transition: "width 600ms ease" },

  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 },
  card: {
    border: "1px solid #e4e4e7", borderRadius: 10, padding: "18px 20px",
    display: "flex", flexDirection: "column", gap: 14,
  },
  cardHeader: { display: "flex", justifyContent: "space-between", alignItems: "flex-start" },
  cardLabel: { fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", color: "#a1a1aa" },
  cardSlots: { fontSize: 18, fontWeight: 700, letterSpacing: "-0.02em", marginTop: 2 },
  badgeFull: { fontSize: 11, fontWeight: 600, padding: "3px 8px", background: "#f4f4f5", color: "#71717a", borderRadius: 20 },
  badgeOpen: { fontSize: 11, fontWeight: 600, padding: "3px 8px", background: "#f0fdf4", color: "#16a34a", borderRadius: 20 },

  miniBar: { height: 3, background: "#f4f4f5", borderRadius: 4, overflow: "hidden" },
  miniFill: { height: "100%", background: "#0a0a0a", borderRadius: 4 },

  memberList: { listStyle: "none", display: "flex", flexDirection: "column", gap: 6 },
  member: { display: "flex", alignItems: "center", gap: 8 },
  dot: { width: 6, height: 6, borderRadius: "50%", background: "#0a0a0a", flexShrink: 0 },
  dotEmpty: { width: 6, height: 6, borderRadius: "50%", border: "1px solid #d4d4d8", flexShrink: 0 },
  memberName: { fontSize: 13, color: "#3f3f46" },
  memberEmpty: { fontSize: 13, color: "#d4d4d8", fontStyle: "italic" },
};
