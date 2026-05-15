import { useAppSelector } from "@/store/index";
import { Navigate, Outlet } from "react-router-dom";

export function AuthLayout() {
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        position: "relative",
        /* Quadrillage sur l'arrière-plan général */
        background: "var(--bg)",
        backgroundImage: `
          linear-gradient(rgba(58,47,37,0.028) 1px, transparent 1px),
          linear-gradient(90deg, rgba(58,47,37,0.028) 1px, transparent 1px)
        `,
        backgroundSize: "40px 40px",
      }}
    >
      {/* ── Blobs multiples — code couleur du design system ── */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 0,
          overflow: "hidden",
          pointerEvents: "none",
        }}
      >
        {/* Bleu (#3B82F6) — haut gauche, dominant */}
        <div
          style={{
            position: "absolute",
            top: "-20%",
            left: "-10%",
            width: 700,
            height: 700,
            borderRadius: "50%",
            background: "rgba(59,130,246,0.16)",
            filter: "blur(110px)",
            animation: "floatA 22s ease-in-out 0s infinite",
          }}
        />

        {/* Teal (#0891B2) — haut droite */}
        <div
          style={{
            position: "absolute",
            top: "-10%",
            right: "-8%",
            width: 550,
            height: 550,
            borderRadius: "50%",
            background: "rgba(8,145,178,0.14)",
            filter: "blur(90px)",
            animation: "floatB 26s ease-in-out 3s infinite",
          }}
        />

        {/* Bleu foncé (#2563EB) — centre */}
        <div
          style={{
            position: "absolute",
            top: "25%",
            left: "30%",
            width: 480,
            height: 480,
            borderRadius: "50%",
            background: "rgba(37,99,235,0.09)",
            filter: "blur(100px)",
            animation: "floatC 20s ease-in-out 7s infinite",
          }}
        />

        {/* Bleu atténué (#3B82F6) — bas gauche */}
        <div
          style={{
            position: "absolute",
            bottom: "-15%",
            left: "-5%",
            width: 500,
            height: 500,
            borderRadius: "50%",
            background: "rgba(59,130,246,0.09)",
            filter: "blur(100px)",
            animation: "floatB 18s ease-in-out 5s infinite",
          }}
        />

        {/* Teal doux (#0891B2) — bas droite */}
        <div
          style={{
            position: "absolute",
            bottom: "-10%",
            right: "-5%",
            width: 420,
            height: 420,
            borderRadius: "50%",
            background: "rgba(8,145,178,0.10)",
            filter: "blur(90px)",
            animation: "floatA 24s ease-in-out 12s infinite",
          }}
        />
      </div>

      <div style={{ position: "relative", zIndex: 1, width: "100%", height: "100%" }}>
        <Outlet />
      </div>
    </div>
  );
}
