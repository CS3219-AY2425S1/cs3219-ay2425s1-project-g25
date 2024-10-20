import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./presentation/routes/AppRoutes";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./index.css";
import { AuthProvider } from "domain/context/AuthContext";

const rootElement = document.getElementById("root") as HTMLElement;
const root = ReactDOM.createRoot(rootElement);

root.render(
    <React.StrictMode>
        <AuthProvider>
            <BrowserRouter>
                <AppRoutes />
                <ToastContainer position="bottom-right" autoClose={5000} closeOnClick closeButton />
            </BrowserRouter>
        </AuthProvider>
    </React.StrictMode>
);
