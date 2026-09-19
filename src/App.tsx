// src/App.tsx
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Workspaces from "./pages/Workspaces";
import Calendar from "./components/Calendar/Calendar";
import Comments from "./pages/Comments";
import Commitments from "./pages/Commitments";
import Notifications from "./pages/Notifications";
import Kanban from "./pages/Kanban";
import ProtectedRoute from "@/components/auth/components/ProtectedRoute";
import Layout from "./components/Layout";
import AuthPage from '@/components/auth/pages/AuthPage';
import VerifyPage from '@/components/auth/pages/VerifyPage';
import ResendVerificationPage from '@/components/auth/pages/ResendVerificationPage'; 
import Teamlist from "./components/Teamlist";
import TeamsPage from "./pages/team/Index";
import CommitmentsDashboard from './pages/CommitmentsDashboard';
import CommitmentsHistory from './pages/CommitmentsHistory';
import AllTasks from './pages/AllTasks';
import Users from "./Users";





const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/verify" element={<VerifyPage />} />
          <Route path="/resend-verification" element={<ResendVerificationPage />} />
          <Route path="/users-test" element= {<Users />} />
          
          {/* Redirect root to auth page */}
          <Route path="/" element={<Navigate to="/auth" replace />} />

          {/* Protected Routes */}
          <Route path="/app" element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>
            <Route index element={<Dashboard />} />
            <Route path="workspaces" element={<Workspaces />} />
            <Route path="kanban/:workspaceId" element={<Kanban />} />
            <Route path="calendar" element={<Calendar />} />
            <Route path="comments" element={<Comments />} />
            <Route path="commitments" element={<Commitments />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="Teamlist" element={<TeamsPage/>} />
            <Route path="commitments" element={<Commitments />} />
            <Route path="CommitmentsDashboard" element={<CommitmentsDashboard />} />
            <Route path="Commimentshistory" element={<CommitmentsHistory />} />
            <Route path="tasks" element={<AllTasks />} />
          </Route>

          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/app" replace />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;