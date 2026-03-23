import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "./context/ThemeContext.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { ProtectedRoute } from "./components/ProtectedRoute.jsx";
import ProxyLayout from "./components/layout/ProxyLayout.jsx";
import RegistrationPage from "./pages/RegistrationPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import ExaminationsPage from "./pages/ExaminationsPage.jsx";
import MonitorPage from "./pages/MonitorPage.jsx";
import CodeTesterPage from "./pages/CodeTesterPage.jsx";
import ClientsPage from "./pages/ClientsPage.jsx";
import SyncQueuePage from "./pages/SyncQueuePage.jsx";
import StudentsPage from "./pages/StudentsPage.jsx";
import { Toaster } from "react-hot-toast";


const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 6 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider>
          <Toaster position="top-right" reverseOrder={false} />
          <BrowserRouter>
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<LoginPage />} />

              {/* Protected Routes inside ProxyLayout */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <ProxyLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Navigate to="/registration" replace />} />
                <Route path="registration" element={<RegistrationPage />} />
                <Route path="examinations" element={<ExaminationsPage />} />
                <Route path="monitor" element={<MonitorPage />} />
                <Route path="code-tester" element={<CodeTesterPage />} />
                <Route path="clients" element={<ClientsPage />} />
                <Route path="sync-queue" element={<SyncQueuePage />} />
                <Route path="students" element={<StudentsPage />} />

                {/* Future protected routes can go here */}
              </Route>

              {/* Redirect any other route to registration */}
              <Route path="*" element={<Navigate to="/registration" replace />} />
            </Routes>
          </BrowserRouter>
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
