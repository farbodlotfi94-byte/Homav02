import { Store, User } from 'lucide-react';
import type { Seller } from '../types/seller';

interface SellerProfileCardProps {
  seller: Seller;
}

export function SellerProfileCard({ seller }: SellerProfileCardProps) {
  return (
    <div 
      className="rounded-[20px] sm:rounded-[24px] p-4 sm:p-5 transition-all duration-300"
      style={{
        background: 'var(--jet-black)',
        border: '1px solid rgba(255, 255, 255, 0.08)'
      }}
    >
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Avatar */}
        <div 
          className="w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ background: 'rgba(255, 255, 255, 0.1)' }}
        >
          {seller.logo ? (
            <img 
              src={seller.logo} 
              alt={seller.shopName}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <Store className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <User 
              className="w-4 h-4 flex-shrink-0"
              style={{ color: 'rgba(255, 255, 255, 0.4)' }}
            />
            <h3 
              className="text-white truncate"
              style={{
                fontSize: '15px',
                fontWeight: 'var(--font-weight-bold)'
              }}
            >
              {seller.name}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <Store 
              className="w-4 h-4 flex-shrink-0"
              style={{ color: 'rgba(255, 255, 255, 0.4)' }}
            />
            <p 
              className="text-white/60 truncate"
              style={{
                fontSize: '14px',
                fontWeight: 'var(--font-weight-normal)'
              }}
            >
              {seller.shopName}
            </p>
          </div>
        </div>

        {/* Badge */}
        <div 
          className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full"
          style={{
            background: 'var(--old-flax)',
            border: '1px solid rgba(0, 0, 0, 0.08)'
          }}
        >
          <div 
            className="w-2 h-2 rounded-full animate-pulse"
            style={{ background: '#000000' }}
          />
          <span 
            style={{
              fontSize: '13px',
              fontWeight: 'var(--font-weight-bold)',
              color: '#000000'
            }}
          >
            فعال
          </span>
        </div>
      </div>
    </div>
  );
}