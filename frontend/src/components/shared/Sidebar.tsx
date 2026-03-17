'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Users, GraduationCap, LayoutDashboard, Home } from 'lucide-react';
import { cn } from "@/lib/utils"; // Hàm cn cậu đã tạo

const menuItems = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Sinh viên', href: '/admin/students', icon: Users },
  { name: 'Cấp bằng SBT', href: '/admin/issue', icon: GraduationCap },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="w-64 bg-white border-r h-screen fixed left-0 top-0 flex flex-col">
      <div className="p-6 border-b">
        <h2 className="text-xl font-bold text-primary flex items-center gap-2">
          <GraduationCap className="w-8 h-8" />
          SBT Core
        </h2>
      </div>
      
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                isActive 
                  ? "bg-primary text-white shadow-md" // Màu Xanh Royal khi active
                  : "text-gray-600 hover:bg-gray-100"
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t">
        <Link href="/" className="flex items-center gap-3 px-4 py-3 text-gray-500 hover:text-primary">
          <Home className="w-5 h-5" />
          <span>Về Trang chủ</span>
        </Link>
      </div>
    </div>
  );
}