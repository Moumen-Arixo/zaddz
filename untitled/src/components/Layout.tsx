import { Outlet } from "react-router-dom";
import { Background } from "./Background";
import { Navbar } from "./Navbar";
import { AIAssistant } from "./AIAssistant";
import { useSettings } from "../contexts/SettingsContext";

export function Layout() {
  const { settings } = useSettings();
  return (
    <div className="min-h-screen flex flex-col relative text-white">
      <Background />
      <Navbar />
      <main className="flex-1 flex flex-col w-full">
        <Outlet />
      </main>
      <footer className="border-t border-glass-border py-6 text-center text-gray-500 text-sm bg-dark-900/50 backdrop-blur-sm mt-auto z-10">
        &copy; {settings.copyrightYear} Zad DZ. جميع الحقوق محفوظة.
      </footer>
      <AIAssistant />
    </div>
  );
}
