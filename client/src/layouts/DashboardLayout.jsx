import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';

const DashboardLayout = () => {
  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col relative overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="ambient-glow-indigo w-[600px] h-[600px] -top-48 -left-48" />
      <div className="ambient-glow-purple w-[500px] h-[500px] top-1/3 -right-48" />

      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;
