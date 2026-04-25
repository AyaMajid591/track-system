import { Outlet } from "react-router-dom";
import { useState } from "react";
import Sidebar from "./Sidebar";
import PwaInstallButton from "./PwaInstallButton";
import useResponsive from "../hooks/useResponsive";

export default function AppShell() {
  const { isPhone, isTablet } = useResponsive();
  const [menuOpen, setMenuOpen] = useState(false);
  const showDrawer = isPhone;
  const showCompactSidebar = isTablet;

  return (
    <div style={{ display: "flex", minHeight: "100vh", width: "100%", overflow: "hidden", position: "relative" }}>
      {showDrawer && menuOpen && (
        <div
          onClick={() => setMenuOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(2, 6, 23, 0.62)",
            backdropFilter: "blur(6px)",
            zIndex: 40,
          }}
        />
      )}

      {showDrawer ? (
        <Sidebar mobile isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
      ) : (
        <Sidebar compact={showCompactSidebar} />
      )}

      <div style={{ flex: 1, minWidth: 0, overflow: "auto" }}>
        {showDrawer && (
          <div
            style={{
              position: "sticky",
              top: 0,
              zIndex: 30,
              display: "flex",
              alignItems: "center",
              gap: "14px",
              padding: "16px 16px 10px",
              background: "linear-gradient(180deg, rgba(11,8,32,0.96), rgba(11,8,32,0.78), transparent)",
              backdropFilter: "blur(10px)",
            }}
          >
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "14px",
                border: "1px solid rgba(255,255,255,0.1)",
                background: "rgba(255,255,255,0.06)",
                color: "white",
                fontSize: "20px",
                cursor: "pointer",
              }}
            >
              ☰
            </button>
            <div>
              <div style={{ fontWeight: 800, fontSize: "18px" }}>TRACK</div>
              <div style={{ fontSize: "12px", opacity: 0.72 }}>Smart Finance Manager</div>
            </div>
          </div>
        )}

        <div style={{ padding: showDrawer ? "0 12px 18px" : isTablet ? "18px" : "20px", minWidth: 0 }}>
        <Outlet />
        </div>
      </div>
      <PwaInstallButton />
    </div>
  );
}
