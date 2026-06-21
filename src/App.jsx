import { useState } from "react";
import Login from "./pages/Login";
import Groups from "./pages/Groups";

export default function App() {
  const [session, setSession] = useState(() => {
    const s = sessionStorage.getItem("utp_session");
    return s ? JSON.parse(s) : null;
  });

  function onLogin(data) {
    sessionStorage.setItem("utp_session", JSON.stringify(data));
    setSession(data);
  }

  function onLogout() {
    sessionStorage.removeItem("utp_session");
    setSession(null);
  }

  return session
    ? <Groups session={session} onLogout={onLogout} />
    : <Login onLogin={onLogin} />;
}
