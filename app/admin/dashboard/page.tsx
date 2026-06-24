import { CalendarCheck, Users, Wallet, TrendingUp } from "lucide-react";

export default function AdminDashboard() {
  // Ini data dummy dulu, nanti kita konek ke database real
  const stats = [
    { label: "Total Bookings", value: "24", icon: CalendarCheck, change: "+12%" },
    { label: "Active Clients", value: "18", icon: Users, change: "+5%" },
    { label: "Revenue (Month)", value: "Rp 250jt", icon: Wallet, change: "+22%" },
    { label: "Upcoming Events", value: "8", icon: TrendingUp, change: "Next 30d" },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-serif text-3xl text-dark-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Welcome back, Admin!</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white p-6 rounded-sm shadow-sm border border-gray-100 flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">{stat.label}</p>
              <h3 className="text-2xl font-bold text-dark-900">{stat.value}</h3>
              <span className="text-xs text-green-600 font-semibold">{stat.change}</span>
            </div>
            <div className="p-3 bg-gold-50 rounded-sm">
              <stat.icon className="text-gold-500" size={24} />
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity Placeholder */}
      <div className="bg-white p-6 rounded-sm shadow-sm border border-gray-100">
        <h2 className="font-serif text-xl text-dark-900 mb-4">Recent Bookings</h2>
        <div className="text-center py-10 text-gray-400">
          Data booking akan muncul disini setelah kita konek ke API
        </div>
      </div>
    </div>
  );
}