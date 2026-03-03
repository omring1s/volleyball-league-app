import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';

import Dashboard from './pages/Dashboard';
import Auth from './pages/Auth';
import LeagueBrowser from './pages/LeagueBrowser';
import LeagueDetail from './pages/LeagueDetail';
import CreateLeague from './pages/CreateLeague';
import Schedule from './pages/Schedule';
import Invites from './pages/Invites';
import CreateInvite from './pages/CreateInvite';
import InviteDetail from './pages/InviteDetail';
import Equipment from './pages/Equipment';
import EquipmentDetail from './pages/EquipmentDetail';
import Profile from './pages/Profile';
import InviteJoin from './pages/InviteJoin';
import AddEquipment from './pages/AddEquipment';

function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="text-6xl mb-4">🏐</div>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Page not found</h1>
      <p className="text-gray-500 mb-6">This page doesn't exist or was moved.</p>
      <a href="/" className="text-blue-600 hover:underline">← Back to home</a>
    </div>
  );
}

function Layout({ children }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/leagues" element={<LeagueBrowser />} />
            <Route path="/leagues/create" element={<CreateLeague />} />
            <Route path="/leagues/:id" element={<LeagueDetail />} />
            <Route path="/schedule" element={<Schedule />} />
            <Route path="/invites" element={<Invites />} />
            <Route path="/invites/create" element={<CreateInvite />} />
            <Route path="/invites/join/:token" element={<InviteJoin />} />
            <Route path="/invites/:id" element={<InviteDetail />} />
            <Route path="/equipment" element={<Equipment />} />
            <Route path="/equipment/add" element={<AddEquipment />} />
            <Route path="/equipment/:id" element={<EquipmentDetail />} />
            <Route path="/profile/:id" element={<Profile />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
      </AuthProvider>
    </BrowserRouter>
  );
}
