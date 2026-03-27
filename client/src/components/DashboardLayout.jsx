import Navbar from './Navbar';

export default function DashboardLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      <Navbar />
      <main className="flex-1 p-6">
        {children}
      </main>
    </div>
  );
}