import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "presentation/components/Layout";
import QuestionsPage from "presentation/pages/QuestionsPage";
import NotFound from "presentation/pages/NotFound";
import RegisterPage from "presentation/pages/RegisterPage";
import LoginPage from "presentation/pages/LoginPage";
import HomePage from "presentation/pages/HomePage";
import { UserProvider } from "domain/contexts/userContext";

const AppRoutes: React.FC = () => {
    return (
        <UserProvider>
            <Layout>
                <Routes>
                    <Route path="/" element={<Navigate to="/login" />} />
                    <Route path="/questions" element={<QuestionsPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/home" element={<HomePage />} />
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </Layout>
        </UserProvider>
    );
};

export default AppRoutes;
