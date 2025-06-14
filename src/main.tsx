import "./index.css";
import {StrictMode} from "react";
import {createRoot} from "react-dom/client";
import {BrowserRouter, Route, Routes} from "react-router-dom";
import App from "./App.tsx";
import FundAnalysis from "@/pages/FundAnalysis.tsx";
import Navbar from "@/components/Navbar.tsx";
import PrivacyPolicy from "./pages/PrivacyPolicy.tsx";
import Home from "./pages/Home.tsx";

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <BrowserRouter>
            <App>
                <Navbar/>
                <Routes>
                    <Route path="/" element={<Home/>}/>
                    <Route path="/retirement-fund" element={<FundAnalysis/>}/>
                    <Route path="/privacy-policy" element={<PrivacyPolicy/>}/>
                </Routes>
            </App>
        </BrowserRouter>
    </StrictMode>
);
