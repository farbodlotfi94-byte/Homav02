import { Home, Package, Settings } from 'lucide-react';

interface NavigationProps {
  currentPage: 'dashboard' | 'products' | 'settings';
  onNavigate: (page: 'dashboard' | 'products' | 'settings') => void;
}

export function SellerNavigation({ currentPage, onNavigate }: NavigationProps) {
  const navItems = [
    { id: 'dashboard' as const, label: 'خانه', icon: Home },
    { id: 'products' as const, label: 'محصولات', icon: Package },
    { id: 'settings' as const, label: 'تنظیمات', icon: Settings },
  ];

  return (
    <>
      {/* Desktop Sidebar Navigation */}
      <nav className="hidden md:block md:relative md:bg-transparent">
        <div className="flex flex-col gap-2 py-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            const inactiveColor = 'rgba(17, 24, 39, 0.6)';

            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className="flex items-center justify-start gap-3 px-4 py-3 rounded-[16px] transition-all duration-300"
                className={`flex items-center justify-start gap-3 px-4 py-3 rounded-[16px] transition-all duration-300 ${
                  isActive
                    ? 'bg-[#EEFF41] text-black border border-[#EEFF41]'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 border border-transparent'
                }`}
                style={{
                  fontWeight: isActive ? '600' : '500',
                  fontSize: '15px'
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'rgba(0, 0, 0, 0.04)';
                    e.currentTarget.style.color = '#111827';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = inactiveColor;
                  }
                }}
              >
                <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 2} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Mobile Bottom Navigation */}
      <nav
        className="md:hidden fixed bottom-4 left-4 right-4 z-50"
        dir="rtl"
      >
        <div className="bg-white rounded-[24px] px-6 flex items-center justify-between h-[64px] border border-gray-200 shadow-lg">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`flex flex-col items-center justify-center gap-1 transition-all duration-300 rounded-[16px] px-3 py-2 ${
                  isActive
                    ? 'bg-[#EEFF41] text-black'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Icon
                  className="w-5 h-5"
                  strokeWidth={isActive ? 2.5 : 2}
                />
                <span
                  className="text-xs font-medium"
                  style={{
                    fontWeight: isActive ? '600' : '500'
                  }}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}