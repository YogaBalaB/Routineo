import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import Dashboard from "./pages/Dashboard";
import TasksPage from "./pages/TasksPage";
import HabitsPage from "./pages/HabitsPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import ProfilePage from "./pages/ProfilePage";
import TaskDetailsPage from "./pages/TaskDetailsPage";
import Layout from "./components/Layout";
import { User } from "./types";
import { badgeEmitter } from "./components/BadgeEarnedPopup";
import BadgeEarnedPopup from "./components/BadgeEarnedPopup";
import MilestoneCelebration from "./components/MilestoneCelebration";
import { Toaster } from "react-hot-toast";
import { API_URL } from "./lib/api";

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Badge subscription
    const unsubscribe = badgeEmitter.subscribe((badge) => {
      setUser((prev) => {
        if (!prev) return prev;

        const alreadyEarned = prev.earnedBadges?.some(
          (b) => b.badgeId === badge.id
        );

        if (alreadyEarned) return prev;

        return {
          ...prev,
          earnedBadges: [
            ...(prev.earnedBadges || []),
            {
              badgeId: badge.id,
              earnedAt: new Date().toISOString(),
            },
          ],
        };
      });
    });

    // Check token
    const token = localStorage.getItem("token");

    if (!token) {
      setLoading(false);
      return () => unsubscribe();
    }

    const fetchUser = async () => {
      try {
        const res = await fetch(`${API_URL}/api/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!res.ok) {
          throw new Error(`Auth failed: ${res.status}`);
        }

        const data = await res.json();

        if (data?.id) {
          setUser(data);
        } else {
          localStorage.removeItem("token");
        }
      } catch (error) {
        console.error("Auth error:", error);
        localStorage.removeItem("token");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();

    return () => unsubscribe();
  }, []);

  // Loading screen
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-neon-purple"></div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Toaster position="top-center" />
      <BadgeEarnedPopup />
      <MilestoneCelebration />

      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage onAuth={setUser} />} />
        <Route path="/register" element={<RegisterPage onAuth={setUser} />} />

        {/* Protected Routes */}
        <Route
          element={
            user ? (
              <Layout
                user={user}
                onLogout={() => {
                  setUser(null);
                  localStorage.removeItem("token");
                }}
              />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        >
          <Route path="/dashboard" element={<Dashboard user={user} />} />
          <Route path="/tasks" element={<TasksPage />} />
          <Route path="/tasks/:id" element={<TaskDetailsPage />} />
          <Route path="/habits" element={<HabitsPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/profile" element={<ProfilePage user={user} />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}