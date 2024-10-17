import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "presentation/components/Layout";
import QuestionsPage from "presentation/pages/QuestionsPage";
import NotFound from "presentation/pages/NotFound";
import RegisterPage from "presentation/pages/RegisterPage";
import LoginPage from "presentation/pages/LoginPage";
import HomePage from "presentation/pages/HomePage";
import { ProtectedRoute } from "presentation/pages/ProtectedRoute";
import { AdminProtectedRoute } from "presentation/pages/AdminProtectedRoute";

const AppRoutes: React.FC = () => {
    return (
        <Layout>
            <Routes>
                <Route path="/" element={<Navigate to="/login" />} />
                <Route path="" element={<ProtectedRoute />}>
                    <Route path="" element={<AdminProtectedRoute />}>
                        <Route path="/questions" element={<QuestionsPage />} />
                    </Route>
                    <Route path="/home" element={<HomePage />} />
                </Route>
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="*" element={<NotFound />} />
            </Routes>
        </Layout>
    );
};

export default AppRoutes;
