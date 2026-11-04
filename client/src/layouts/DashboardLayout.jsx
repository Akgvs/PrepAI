import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';

const DashboardLayout = () => {
  return (
    <div className="min-h-screen bg-[#0c0e14] text-[#ededed] flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;
