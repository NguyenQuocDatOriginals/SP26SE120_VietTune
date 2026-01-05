import { Outlet } from "react-router-dom";
import { useEffect } from "react";
import Header from "./Header";
import Footer from "./Footer";
import AudioPlayer from "../features/AudioPlayer";
import { initializeButtonSpotlights } from "@/utils/buttonSpotlight";

export default function MainLayout() {
  useEffect(() => {
    // Initialize spotlight effects for all liquid glass buttons
    const cleanup = initializeButtonSpotlights();
    return cleanup;
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-amber-900 via-emerald-900 to-amber-900">
      <Header />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
      <AudioPlayer />
    </div>
  );
}
