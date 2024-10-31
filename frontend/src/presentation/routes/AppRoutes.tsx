import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "presentation/pages/layout/Layout";
import QuestionManagement from "presentation/pages/QuestionManagement";
import QuestionPage from "presentation/pages/QuestionSelection";
import NotFound from "presentation/pages/NotFound";
import RegisterPage from "presentation/pages/RegisterPage";
import LoginPage from "presentation/pages/LoginPage";
import HomePage from "presentation/pages/HomePage";
import { ProtectedRoute } from "presentation/pages/ProtectedRoute";
import { AdminProtectedRoute } from "presentation/pages/AdminProtectedRoute";
import { MatchmakingProvider } from "domain/context/MatchmakingContext";
import CollaborationRoomPage from "presentation/pages/CollaborationRoomPage";
import { CollaborationProvider } from "domain/context/CollaborationContext";
import { ForgotPasswordPage } from "presentation/pages/ForgotPasswordPage";

const AppRoutes: React.FC = () => {
    return (
        <MatchmakingProvider>
            <Layout>
                <Routes>
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                    <Route path="/room/:roomId/:matchUserId" element={<QuestionPage />} />

                    <Route element={<ProtectedRoute />}>
                        <Route
                            path="/room/:roomId"
                            element={
                                <CollaborationProvider>
                                    <CollaborationRoomPage />
                                </CollaborationProvider>
                            }
                        />
                        <Route path="/" element={<HomePage />} />

                        <Route element={<AdminProtectedRoute />}>
                            <Route path="/question-management" element={<QuestionManagement />} />
                        </Route>
                    </Route>

                    <Route path="*" element={<NotFound />} />
                </Routes>
            </Layout>
        </MatchmakingProvider>
    );
};

export default AppRoutes;
