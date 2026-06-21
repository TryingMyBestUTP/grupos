import { useState } from "react";
import { api } from "../api";

const DEADLINE = new Date("2026-07-21T13:45:00-05:00");

function useCountdown() {
  const [, tick] = useState(0);
  const diff = DEADLINE - Date.now();
  if (diff <= 0) return null;
  setTimeout(() => tick(n => n + 1), 1000);
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const sc = Math.floor((diff % 60000) / 1000);
  return { d, h, m, s: sc };
}

// Valida: U + exactamente 8 dígitos
const CODE_RE = /^[Uu]\d{8}$/;
const PIN_RE  = /^\d{4}$/;

export default function Login({ onLogin }) {
  const [step, setStep]       = useState("code");   // "code" | "pin"
  const [code, setCode]       = useState("");
  const [pin, setPin]         = useState("");
  const [studentName, setStudentName] = useState("");
  const [hasPIN, setHasPIN]   = useState(false);
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);
  const cd = useCountdown();

  // Paso 1: verificar código
  async function submitCode(e) {
    e.preventDefault();
    setError("");
    const trimmed = code.trim().toUpperCase();

    // Profe
    if (trimmed === "C27444") {
      onLogin({ role: "teacher", name: "Johan Max Alexander Lopez Heredia" });
      return;
    }

    if (!CODE_RE.test(trimmed)) {
      setError("El código debe ser U seguido de exactamente 8 dígitos");
      return;
    }

    setLoading(true);
    try {
      const data = await api.check(trimmed);
      setStudentName(data.name);
      setHasPIN(data.has_pin);
      setStep("pin");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // Paso 2: crear o verificar PIN
  async function submitPIN(e) {
    e.preventDefault();
    setError("");

    if (!PIN_RE.test(pin)) {
      setError("El PIN debe ser exactamente 4 dígitos");
      return;
    }

    setLoading(true);
    try {
      const data = await api.login(code.trim().toUpperCase(), pin);
      onLogin(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={s.page}>
      <header style={s.header}>
        <span style={s.tag}>Taller de Programación · 013616</span>
        <h1 style={s.title}>Registro de Grupos</h1>
        <p style={s.subtitle}>Proyecto Final · Ciclo 2026-1</p>
      </header>

      {/* Objetivo */}
      <section style={s.card}>
        <p style={s.label}>OBJETIVO</p>
        <p style={s.body}>
          Formarán <strong>6 grupos</strong> (4 de 5 integrantes y 2 de 6) para
          desarrollar un <strong>sistema en Java</strong> para un negocio real con
          RUC. El sistema debe registrar clientes y reportar ingresos.
        </p>
      </section>

      {/* Countdown */}
      {cd && (
        <section style={s.countdown}>
          <p style={{ ...s.label, color: "#71717a" }}>TIEMPO RESTANTE · SEMANA 18</p>
          <div style={s.cdRow}>
            {[["d", cd.d], ["h", cd.h], ["m", cd.m], ["s", cd.s]].map(([u, v]) => (
              <div key={u} style={s.cdUnit}>
                <span style={s.cdNum}>{String(v).padStart(2, "0")}</span>
                <span style={s.cdLabel}>{u}</span>
              </div>
            ))}
          </div>
          <p style={s.deadline}>Cierra el 21 Jul 2026 · 1:45 PM</p>
        </section>
      )}

      {/* Formulario */}
      <section style={s.loginCard}>
        {step === "code" ? (
          <>
            <p style={s.label}>INGRESAR</p>
            <form onSubmit={submitCode} style={s.form}>
              <input
                style={s.input}
                type="text"
                placeholder="ej: U12748593"
                value={code}
                onChange={e => { setCode(e.target.value); setError(""); }}
                maxLength={9}
                autoFocus
              />
              {error && <p style={s.error}>{error}</p>}
              <button style={s.btn} type="submit" disabled={loading}>
                {loading ? "Verificando..." : "Continuar →"}
              </button>
            </form>
            <p style={s.hint}>Solo estudiantes de la clase 013616 pueden ingresar.</p>
          </>
        ) : (
          <>
            <div style={s.nameRow}>
              <button style={s.back} onClick={() => { setStep("code"); setPin(""); setError(""); }}>
                ← Atrás
              </button>
              <div>
                <p style={s.label}>{hasPIN ? "INGRESA TU PIN" : "CREAR PIN"}</p>
                <p style={s.studentName}>{studentName}</p>
              </div>
            </div>
            <form onSubmit={submitPIN} style={s.form}>
              <input
                style={{ ...s.input, letterSpacing: "0.3em", textAlign: "center", fontSize: 22 }}
                type="password"
                inputMode="numeric"
                placeholder="• • • •"
                value={pin}
                onChange={e => { setPin(e.target.value.replace(/\D/g, "").slice(0, 4)); setError(""); }}
                maxLength={4}
                autoFocus
              />
              {error && <p style={s.error}>{error}</p>}
              <button style={s.btn} type="submit" disabled={loading || pin.length !== 4}>
                {loading ? "..." : hasPIN ? "Entrar →" : "Crear PIN y entrar →"}
              </button>
            </form>
            {!hasPIN && (
              <p style={s.hint}>Este PIN lo usarás siempre para entrar. No lo olvides.</p>
            )}
          </>
        )}
      </section>
    </div>
  );
}

const s = {
  page: {
    maxWidth: 520, margin: "0 auto", padding: "48px 20px 80px",
    display: "flex", flexDirection: "column", gap: 20,
  },
  header: { textAlign: "center", marginBottom: 8 },
  tag: { fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#71717a" },
  title: { fontSize: 36, fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1.1, margin: "10px 0 6px", color: "#0a0a0a" },
  subtitle: { color: "#71717a", fontSize: 14 },

  card: { border: "1px solid #e4e4e7", borderRadius: 10, padding: "20px 24px" },
  label: { fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", color: "#a1a1aa", marginBottom: 10 },
  body: { color: "#3f3f46", lineHeight: 1.7, fontSize: 14 },

  countdown: {
    border: "1px solid #0a0a0a", borderRadius: 10, padding: "20px 24px",
    background: "#0a0a0a", color: "#fff", textAlign: "center",
  },
  cdRow: { display: "flex", justifyContent: "center", gap: 24, margin: "14px 0 8px" },
  cdUnit: { display: "flex", flexDirection: "column", alignItems: "center", gap: 2 },
  cdNum: { fontSize: 42, fontWeight: 700, letterSpacing: "-0.04em", lineHeight: 1 },
  cdLabel: { fontSize: 10, fontWeight: 600, letterSpacing: "0.1em", color: "#a1a1aa" },
  deadline: { fontSize: 12, color: "#a1a1aa", marginTop: 4 },

  loginCard: { border: "1px solid #e4e4e7", borderRadius: 10, padding: "24px" },
  form: { display: "flex", flexDirection: "column", gap: 10, marginTop: 12 },
  input: {
    border: "1px solid #e4e4e7", borderRadius: 8, padding: "12px 14px",
    fontSize: 15, outline: "none", width: "100%",
  },
  error: { fontSize: 13, color: "#dc2626", padding: "8px 12px", background: "#fef2f2", borderRadius: 6 },
  btn: {
    background: "#0a0a0a", color: "#fff", border: "none", borderRadius: 8,
    padding: "12px", fontSize: 15, fontWeight: 600,
  },
  hint: { marginTop: 12, fontSize: 12, color: "#a1a1aa", textAlign: "center" },

  nameRow: { display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 4 },
  back: { background: "none", border: "none", color: "#71717a", fontSize: 13, padding: "2px 0", marginTop: 2 },
  studentName: { fontSize: 15, fontWeight: 600, color: "#0a0a0a" },
};
