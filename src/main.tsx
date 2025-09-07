import "./index.css";
import {StrictMode} from "react";
import {createRoot} from "react-dom/client";
import {BrowserRouter, Route, Routes} from "react-router-dom";
import App from "./App.tsx";
import RetirementFund from "@/pages/RetirementFund.tsx";
import Navbar from "@/components/Navbar.tsx";
import PrivacyPolicy from "./pages/PrivacyPolicy.tsx";
import Home from "./pages/Home.tsx";
import MortgageVsRent from "./pages/MortgageVsRent.tsx";
import { PAGE_LINK } from "./lib/constants.ts";
import { Analytics } from "@vercel/analytics/react";

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <BrowserRouter>
            <App>
                <Navbar/>
                <Routes>
                    <Route path={PAGE_LINK.home} element={<Home/>}/>
                    <Route path={PAGE_LINK.retirementFund} element={<RetirementFund/>}/>
                    <Route path={PAGE_LINK.mortgageVsRent} element={<MortgageVsRent/>}/>
                    <Route path={PAGE_LINK.privacyPolicy} element={<PrivacyPolicy/>}/>
                </Routes>
                <Analytics />
            </App>
        </BrowserRouter>
    </StrictMode>
);
