import { useEffect, useState } from "react";

const buttonStyle = {
  position: "fixed",
  right: "20px",
  bottom: "20px",
  zIndex: 1000,
  border: "1px solid rgba(255,255,255,0.14)",
  borderRadius: "999px",
  padding: "12px 16px",
  background: "linear-gradient(135deg, #0f766e, #14b8a6)",
  color: "#f8fffd",
  fontWeight: 700,
  cursor: "pointer",
  boxShadow: "0 16px 32px rgba(15,118,110,0.28)",
};

function PwaInstallButton() {
  const [installEvent, setInstallEvent] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (event) => {
      event.preventDefault();
      setInstallEvent(event);
    };

    const handleInstalled = () => {
      setIsInstalled(true);
      setInstallEvent(null);
    };

    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true;

    if (standalone) {
      setIsInstalled(true);
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!installEvent) {
      return;
    }

    installEvent.prompt();
    await installEvent.userChoice;
    setInstallEvent(null);
  };

  if (!installEvent || isInstalled) {
    return null;
  }

  return (
    <button type="button" style={buttonStyle} onClick={handleInstall}>
      Install TRACK
    </button>
  );
}

export default PwaInstallButton;
