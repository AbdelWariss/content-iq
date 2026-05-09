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
        {/* Coral (#e5704c) — haut gauche, dominant */}
        <div
          style={{
            position: "absolute",
            top: "-20%",
            left: "-10%",
            width: 700,
            height: 700,
            borderRadius: "50%",
            background: "rgba(229,112,76,0.16)",
            filter: "blur(110px)",
            animation: "floatA 22s ease-in-out 0s infinite",
          }}
        />

        {/* Teal (#6bb8bd) — haut droite */}
        <div
          style={{
            position: "absolute",
            top: "-10%",
            right: "-8%",
            width: 550,
            height: 550,
            borderRadius: "50%",
            background: "rgba(107,184,189,0.14)",
            filter: "blur(90px)",
            animation: "floatB 26s ease-in-out 3s infinite",
          }}
        />

        {/* Gold/Amber (#c9a24f) — centre */}
        <div
          style={{
            position: "absolute",
            top: "25%",
            left: "30%",
            width: 480,
            height: 480,
            borderRadius: "50%",
            background: "rgba(201,162,79,0.11)",
            filter: "blur(100px)",
            animation: "floatC 20s ease-in-out 7s infinite",
          }}
        />

        {/* Coral atténué (#e5704c) — bas gauche */}
        <div
          style={{
            position: "absolute",
            bottom: "-15%",
            left: "-5%",
            width: 500,
            height: 500,
            borderRadius: "50%",
            background: "rgba(229,112,76,0.09)",
            filter: "blur(100px)",
            animation: "floatB 18s ease-in-out 5s infinite",
          }}
        />

        {/* Teal doux (#6bb8bd) — bas droite */}
        <div
          style={{
            position: "absolute",
            bottom: "-10%",
            right: "-5%",
            width: 420,
            height: 420,
            borderRadius: "50%",
            background: "rgba(107,184,189,0.10)",
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
