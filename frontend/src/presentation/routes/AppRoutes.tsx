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
import { UserManagement } from "presentation/pages/UserManagement";
import CollaborationRoomPage from "presentation/pages/CollaborationRoomPage";
import { CollaborationProvider } from "domain/context/CollaborationContext";
import { ForgotPasswordPage } from "presentation/pages/ForgotPasswordPage";
import { ResetPasswordPage } from "presentation/pages/ResetPasswordPage";

const AppRoutes: React.FC = () => {
    return (
        <MatchmakingProvider>
            <Layout>
                <Routes>
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                    <Route path="/reset-password" element={<ResetPasswordPage />} />
                    <Route path="/room/:roomId/:matchUserId" element={<QuestionPage />} />

                    <Route element={<ProtectedRoute />}>
                        <Route
                            path="/room/:urlRoomId"
                            element={
                                <CollaborationProvider>
                                    <CollaborationRoomPage />
                                </CollaborationProvider>
                            }
                        />
                        <Route path="/" element={<HomePage />} />

                        <Route element={<AdminProtectedRoute />}>
                            <Route path="/question-management" element={<QuestionManagement />} />
                            <Route path="/user-management" element={<UserManagement />} />
                        </Route>
                    </Route>

                    <Route path="*" element={<NotFound />} />
                </Routes>
            </Layout>
        </MatchmakingProvider>
    );
};

export default AppRoutes;
