import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "فشل تسجيل الدخول");
        return;
      }

      window.location.href = "/admin";
    } catch {
      setError("حدث خطأ، حاول مرة أخرى");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "#f0fdf4",
      fontFamily: "sans-serif",
    }}>
      <div style={{
        background: "#fff",
        borderRadius: 16,
        padding: "40px 36px",
        boxShadow: "0 4px 24px rgba(0,0,0,0.10)",
        width: "100%",
        maxWidth: 400,
        textAlign: "center",
      }}>
        <div style={{ marginBottom: 24 }}>
          <span style={{ fontSize: 40 }}>🌿</span>
          <h1 style={{ color: "#16a34a", fontSize: 24, margin: "8px 0 4px" }}>ماكس جرين</h1>
          <p style={{ color: "#6b7280", fontSize: 14 }}>تسجيل دخول الأدمن</p>
        </div>

        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <input
            type="email"
            placeholder="البريد الإلكتروني"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            dir="ltr"
            style={{
              padding: "12px 16px",
              borderRadius: 8,
              border: "1px solid #d1d5db",
              fontSize: 15,
              outline: "none",
              textAlign: "left",
            }}
          />
          <input
            type="password"
            placeholder="كلمة المرور"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            dir="ltr"
            style={{
              padding: "12px 16px",
              borderRadius: 8,
              border: "1px solid #d1d5db",
              fontSize: 15,
              outline: "none",
              textAlign: "left",
            }}
          />

          {error && (
            <div style={{
              background: "#fef2f2",
              color: "#dc2626",
              padding: "10px 14px",
              borderRadius: 8,
              fontSize: 14,
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              background: loading ? "#86efac" : "#16a34a",
              color: "#fff",
              padding: "13px",
              borderRadius: 8,
              border: "none",
              fontSize: 16,
              cursor: loading ? "not-allowed" : "pointer",
              fontWeight: 600,
              marginTop: 4,
            }}
          >
            {loading ? "جاري التحقق..." : "دخول"}
          </button>
        </form>
      </div>
    </div>
  );
}
