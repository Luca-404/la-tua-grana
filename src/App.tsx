import "./App.css";
import { ReactNode } from "react";
import { ThemeProvider } from "@/components/provider/theme-provider.tsx";
import { Footer } from "@/components/Footer";

interface AppProps {
  children: ReactNode;
}

function App({ children }: AppProps) {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <div className="min-h-screen bg-background flex flex-col">
        {children}
        <Footer />
      </div>
    </ThemeProvider>
  );
}

export default App;
