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
                style={{
                  background: isActive ? 'var(--old-flax)' : 'transparent',
                  color: isActive ? '#000000' : inactiveColor,
                  border: '1px solid transparent',
                  fontWeight: isActive ? 'var(--font-weight-bold)' : 'var(--font-weight-medium)',
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

      {/* Mobile Bottom Navigation - Floating Dark Style */}
      <nav 
        className="md:hidden fixed bottom-4 left-4 right-4 z-50"
        dir="rtl"
      >
        <div 
          className="rounded-[24px] px-6 flex items-center justify-between h-[64px]"
          style={{
            background: '#1A1A1A',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)'
          }}
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className="flex flex-col items-center justify-center gap-1 transition-all duration-300 rounded-[16px]"
                style={{
                  padding: isActive ? '8px 16px' : '4px',
                  background: isActive ? 'var(--old-flax)' : 'transparent',
                  border: '1px solid transparent'
                }}
              >
                <Icon 
                  className="w-5 h-5" 
                  strokeWidth={isActive ? 2.5 : 2}
                  style={{ 
                    color: isActive ? '#000000' : 'rgba(255, 255, 255, 0.4)'
                  }}
                />
                <span style={{ 
                  fontSize: '12px',
                  fontWeight: isActive ? 'var(--font-weight-bold)' : 'var(--font-weight-medium)',
                  color: isActive ? '#000000' : 'rgba(255, 255, 255, 0.4)'
                }}>
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