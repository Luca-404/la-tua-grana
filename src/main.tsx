import {StrictMode} from "react";
import {createRoot} from "react-dom/client";
import {BrowserRouter, Route, Routes} from "react-router-dom";
import "./index.css";
import App from "./App.tsx";
import FundAnalysis from "@/pages/FundAnalysis.tsx";
import Navbar from "@/components/ui/navbar.tsx";

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <BrowserRouter>
            <App>
                <Navbar/>
                <Routes>
                    <Route path="/" element={<FundAnalysis/>}/>
                </Routes>
            </App>
        </BrowserRouter>
    </StrictMode>
);
