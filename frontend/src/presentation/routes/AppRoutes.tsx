import React from "react";
import { Routes, Route } from "react-router-dom";
import Layout from "presentation/pages/layout/Layout";
import QuestionManagement from "presentation/pages/admin/questions/QuestionManagement";
import NotFound from "presentation/pages/NotFound";
import RegisterPage from "presentation/pages/auth/RegisterPage";
import LoginPage from "presentation/pages/auth/LoginPage";
import HomePage from "presentation/pages/home/HomePage";
import { ProtectedRoute } from "presentation/pages/ProtectedRoute";
import { AdminProtectedRoute } from "presentation/pages/AdminProtectedRoute";
import { MatchmakingProvider } from "domain/context/MatchmakingContext";
import { UserManagement } from "presentation/pages/admin/users/UserManagement";
import CollaborationRoomPage from "presentation/pages/room/CollaborationRoomPage";
import { CollaborationProvider } from "domain/context/CollaborationContext";
import { ForgotPasswordPage } from "presentation/pages/auth/ForgotPasswordPage";
import { ResetPasswordPage } from "presentation/pages/auth/ResetPasswordPage";

const AppRoutes: React.FC = () => {
    return (
        <MatchmakingProvider>
            <Layout>
                <Routes>
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                    <Route path="/reset-password" element={<ResetPasswordPage />} />

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
