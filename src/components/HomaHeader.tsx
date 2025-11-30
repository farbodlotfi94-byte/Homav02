import { ChevronRight } from 'lucide-react';

interface HomaHeaderProps {
  title?: string;
  onBack?: () => void;
  showBackButton?: boolean;
}

export function HomaHeader({ title, onBack, showBackButton = false }: HomaHeaderProps) {
  return (
    <div
      className="sticky top-0 z-50 backdrop-blur-md"
      style={{
        background: 'rgba(255, 255, 255, 0.8)',
        borderBottom: '1px solid rgba(0, 0, 0, 0.1)'
      }}
    >
      <div className="h-14 sm:h-16 flex items-center justify-between px-5 sm:px-6">
        {/* Back Button */}
        {showBackButton && onBack ? (
          <button
            onClick={onBack}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border flex items-center justify-center transition-all duration-300"
            aria-label="بازگشت"
            style={{
              borderColor: 'rgba(0, 0, 0, 0.1)',
              background: 'transparent',
              color: '#000000'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(0, 0, 0, 0.1)';
              e.currentTarget.style.borderColor = '#000000';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.borderColor = 'rgba(0, 0, 0, 0.1)';
            }}
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        ) : (
          <div className="w-9 h-9 sm:w-10 sm:h-10" />
        )}

        {/* Logo or Title */}
        {title ? (
          <h2
            className="text-black"
            style={{
              fontSize: '16px',
              fontWeight: 'var(--font-weight-bold)'
            }}
          >
            {title}
          </h2>
        ) : (
          <div className="flex items-center">
            <p
              style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 700,
                color: '#000000',
                fontSize: '28px',
                lineHeight: '42px',
                letterSpacing: '-1.5px',
                textTransform: 'uppercase'
              }}
            >
              HOMA
            </p>
          </div>
        )}

        {/* Right Spacer */}
        <div className="w-9 h-9 sm:w-10 sm:h-10" />
      </div>
    </div>
  );
}