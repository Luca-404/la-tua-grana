import {ThemeProvider} from "@/components/provider/theme-provider.tsx";
import { ReactNode } from "react";
import "./App.css";

interface AppProps {
    children: ReactNode;
}

function App({ children }: AppProps) {
    return (
        <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
            <div className="min-h-screen bg-background flex flex-col">
                {children}
            </div>
        </ThemeProvider>
    );
}

export default App;
