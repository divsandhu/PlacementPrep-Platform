import { Routes, Route, useParams, useLocation } from "react-router-dom";
import Landing from "./pages/Landing";
import Home from "./pages/Home";
import Room from "./pages/Room";
import Dashboard from "./pages/Dashboard";
import AdminPanel from "./pages/AdminPanel";
import Leaderboard from "./pages/Leaderboard";
import QuizHistory from "./pages/QuizHistory";
import Layout from "./components/Layout";
import Auth from "./components/Auth";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Layout>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/home" element={<Home />} />
          <Route path="/auth" element={<Auth />} />
        <Route path="/room/:roomId" element={<RoomWrapper />} />
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute requireAdmin={true}>
              <AdminPanel />
            </ProtectedRoute>
          } 
        />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route 
            path="/history" 
            element={
              <ProtectedRoute>
                <QuizHistory />
              </ProtectedRoute>
            } 
          />
        </Routes>
    </Layout>
  );
}

// Wrapper component to extract route params and location state
function RoomWrapper() {
  const { roomId } = useParams();
  const location = useLocation();
  const user = location.state?.user || "Guest";
  const isHost = location.state?.isHost || false;
  
  return <Room roomId={roomId} user={user} isHost={isHost} />;
}

export default App;
