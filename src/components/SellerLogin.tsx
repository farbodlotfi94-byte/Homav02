import { useState } from 'react';
import { Lock, User, Instagram, Phone } from 'lucide-react';
import { HomaHeader } from './HomaHeader';

interface SellerLoginProps {
  onLogin: (phone: string, password: string) => void;
  onRegister?: (password: string, name: string, instagram: string, phone: string) => void;
}

export function SellerLogin({ onLogin, onRegister }: SellerLoginProps) {
  const [isRegister, setIsRegister] = useState(false);
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [instagram, setInstagram] = useState('');
  const [registerPhone, setRegisterPhone] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isRegister && onRegister) {
      onRegister(password, name, instagram, registerPhone);
    } else {
      onLogin(phone, password);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        backgroundColor: '#ffffff'
      }}
    >
      {/* Header */}
      <HomaHeader />

      {/* Centered Login Content with proper top spacing */}
      <div className="flex-1 flex items-center justify-center px-5 sm:px-6 pt-5 pb-8 sm:pt-8 sm:pb-12">
        <div className="w-full max-w-md" dir="rtl">
          {/* Decorative Element - Sparkle Icon Top Left */}
          <div className="flex justify-end mb-6">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M10 0L11.5 8.5L20 10L11.5 11.5L10 20L8.5 11.5L0 10L8.5 8.5L10 0Z" fill="var(--old-flax)"/>
            </svg>
          </div>

          {/* Title Section - Center Aligned */}
          <div className="text-center mb-8">
            <h1 style={{
              fontSize: '26px',
              fontWeight: 'var(--font-weight-bold)',
              color: '#000000',
              marginBottom: '10px',
              lineHeight: '1.3'
            }}>
              {isRegister ? 'ساخت حساب کاربری' : 'ورود به پنل'}
            </h1>
            <p style={{
              fontSize: '15px',
              fontWeight: 'var(--font-weight-normal)',
              color: 'rgba(0, 0, 0, 0.6)'
            }}>
              {isRegister ? 'فروشنده جدید هستید؟ ثبت‌نام کنید' : 'به پنل فروشنده خوش آمدید'}
            </p>
          </div>

          {/* Login/Register Form Card */}
          <div 
            className="rounded-[24px] p-7 mb-5"
            style={{
              background: '#f8f9fa',
              border: '1px solid rgba(0, 0, 0, 0.08)',
              boxShadow: 'none'
            }}
          >
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name (only for register) */}
              {isRegister && (
                <div>
                  <label htmlFor="name" style={{
                    display: 'block',
                    marginBottom: '10px',
                    fontSize: '14px',
                    fontWeight: 'var(--font-weight-medium)',
                    color: '#000000',
                    textAlign: 'right'
                  }}>
                    نام فروشگاه
                  </label>
                  <div className="relative">
                    <User 
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5"
                      style={{ color: 'rgba(0, 0, 0, 0.3)' }}
                    />
                    <input
                      id="name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full border transition-all duration-200"
                      dir="rtl"
                      style={{
                        height: '48px',
                        borderRadius: '16px',
                        borderColor: 'rgba(0, 0, 0, 0.1)',
                        fontSize: '14px',
                        fontWeight: 'var(--font-weight-normal)',
                        color: '#000000',
                        backgroundColor: 'rgba(255, 255, 255, 0.8)',
                        outline: 'none',
                        paddingRight: '44px',
                        paddingLeft: '16px',
                        textAlign: 'right'
                      }}
                      placeholder="فروشگاه من"
                      required
                      onFocus={(e) => {
                        e.target.style.borderColor = 'var(--old-flax)';
                        e.target.style.backgroundColor = 'rgba(255, 255, 255, 1)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                        e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Instagram ID (only for register) */}
              {isRegister && (
                <div>
                  <label htmlFor="instagram" style={{
                    display: 'block',
                    marginBottom: '10px',
                    fontSize: '14px',
                    fontWeight: 'var(--font-weight-medium)',
                    color: '#000000',
                    textAlign: 'right'
                  }}>
                    آی‌دی اینستاگرام
                  </label>
                  <div className="relative">
                    <Instagram 
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5"
                      style={{ color: 'rgba(0, 0, 0, 0.3)' }}
                    />
                    <input
                      id="instagram"
                      type="text"
                      value={instagram}
                      onChange={(e) => setInstagram(e.target.value)}
                      className="w-full border transition-all duration-200"
                      dir="rtl"
                      style={{
                        height: '48px',
                        borderRadius: '16px',
                        borderColor: 'rgba(0, 0, 0, 0.1)',
                        fontSize: '14px',
                        fontWeight: 'var(--font-weight-normal)',
                        color: '#000000',
                        backgroundColor: 'rgba(255, 255, 255, 0.8)',
                        outline: 'none',
                        paddingRight: '44px',
                        paddingLeft: '16px',
                        textAlign: 'right'
                      }}
                      placeholder="my_shop"
                      required
                      onFocus={(e) => {
                        e.target.style.borderColor = 'var(--old-flax)';
                        e.target.style.backgroundColor = 'rgba(255, 255, 255, 1)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                        e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Phone Number (only for register) */}
              {isRegister && (
                <div>
                  <label htmlFor="registerPhone" style={{
                    display: 'block',
                    marginBottom: '10px',
                    fontSize: '14px',
                    fontWeight: 'var(--font-weight-medium)',
                    color: '#000000',
                    textAlign: 'right'
                  }}>
                    شماره تماس
                  </label>
                  <div className="relative">
                    <Phone 
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5"
                      style={{ color: 'rgba(0, 0, 0, 0.3)' }}
                    />
                    <input
                      id="registerPhone"
                      type="tel"
                      value={registerPhone}
                      onChange={(e) => setRegisterPhone(e.target.value)}
                      className="w-full border transition-all duration-200"
                      dir="rtl"
                      style={{
                        height: '48px',
                        borderRadius: '16px',
                        borderColor: 'rgba(0, 0, 0, 0.1)',
                        fontSize: '14px',
                        fontWeight: 'var(--font-weight-normal)',
                        color: '#000000',
                        backgroundColor: 'rgba(255, 255, 255, 0.8)',
                        outline: 'none',
                        paddingRight: '44px',
                        paddingLeft: '16px',
                        textAlign: 'right'
                      }}
                      placeholder="09123456789"
                      required
                      onFocus={(e) => {
                        e.target.style.borderColor = 'var(--old-flax)';
                        e.target.style.backgroundColor = 'rgba(255, 255, 255, 1)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                        e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Phone Number (login) */}
              {!isRegister && (
                <div>
                  <label htmlFor="phone" style={{
                    display: 'block',
                    marginBottom: '10px',
                    fontSize: '14px',
                    fontWeight: 'var(--font-weight-medium)',
                    color: '#000000',
                    textAlign: 'right'
                  }}>
                    شماره تماس
                  </label>
                  <div className="relative">
                    <Phone 
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5"
                      style={{ color: 'rgba(0, 0, 0, 0.3)' }}
                    />
                    <input
                      id="phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full border transition-all duration-200"
                      dir="rtl"
                      style={{
                        height: '48px',
                        borderRadius: '16px',
                        borderColor: 'rgba(0, 0, 0, 0.1)',
                        fontSize: '14px',
                        fontWeight: 'var(--font-weight-normal)',
                        color: '#000000',
                        backgroundColor: 'rgba(255, 255, 255, 0.8)',
                        outline: 'none',
                        paddingRight: '44px',
                        paddingLeft: '16px',
                        textAlign: 'right'
                      }}
                      placeholder="09123456789"
                      required
                      onFocus={(e) => {
                        e.target.style.borderColor = 'var(--old-flax)';
                        e.target.style.backgroundColor = 'rgba(255, 255, 255, 1)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                        e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Password */}
              <div>
                <label htmlFor="password" style={{
                  display: 'block',
                  marginBottom: '10px',
                  fontSize: '14px',
                  fontWeight: 'var(--font-weight-medium)',
                  color: '#000000',
                  textAlign: 'right'
                }}>
                  رمز عبور
                </label>
                <div className="relative">
                  <Lock 
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5"
                    style={{ color: 'rgba(255, 255, 255, 0.3)' }}
                  />
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full border transition-all duration-200"
                    dir="rtl"
                    style={{
                      height: '48px',
                      borderRadius: '16px',
                      borderColor: 'rgba(255, 255, 255, 0.1)',
                      fontSize: '14px',
                      fontWeight: 'var(--font-weight-normal)',
                      color: '#000000',
                      backgroundColor: 'rgba(0, 0, 0, 0.2)',
                      outline: 'none',
                      paddingRight: '44px',
                      paddingLeft: '16px',
                      textAlign: 'right'
                    }}
                    placeholder="••••••••"
                    required
                    onFocus={(e) => {
                      e.target.style.borderColor = 'var(--old-flax)';
                      e.target.style.backgroundColor = 'rgba(0, 0, 0, 0.4)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                      e.target.style.backgroundColor = 'rgba(0, 0, 0, 0.2)';
                    }}
                  />
                </div>
              </div>

              {/* Submit Button - Yellow with Arrow */}
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 transition-all duration-300 active:scale-[0.98]"
                style={{
                  marginTop: '20px',
                  height: '50px',
                  borderRadius: '25px',
                  backgroundColor: 'var(--old-flax)',
                  color: '#000000',
                  fontSize: '15px',
                  fontWeight: 'var(--font-weight-bold)',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: 'none'
                }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
              >
                <span>{isRegister ? 'ساخت حساب' : 'ورود'}</span>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 8h10M9 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </form>

            {/* Toggle Register/Login */}
            <div className="text-center pt-5 mt-5" style={{
              borderTop: '1px solid rgba(0, 0, 0, 0.1)'
            }}>
              <button
                onClick={() => setIsRegister(!isRegister)}
                className="transition-colors duration-200"
                style={{
                  fontSize: '14px',
                  fontWeight: 'var(--font-weight-medium)',
                  color: 'rgba(0, 0, 0, 0.5)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#000000'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(0, 0, 0, 0.5)'}
              >
                {isRegister
                  ? 'قبلاً ثبت‌نام کرده‌ام - ورود'
                  : 'حساب ندارم - ثبت‌نام'}
              </button>
            </div>
          </div>

          {/* Quick Test Card - Minimal Dark */}
          <div 
            className="rounded-[20px] p-4"
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.03)',
              border: '1px solid rgba(0, 0, 0, 0.08)',
              textAlign: 'right'
            }}
          >
            <p style={{
              fontSize: '13px',
              fontWeight: 'var(--font-weight-bold)',
              color: '#000000',
              marginBottom: '6px'
            }}>
              ⚡ تست سریع
            </p>
            <div style={{
              fontSize: '13px',
              fontWeight: 'var(--font-weight-medium)',
              color: 'rgba(0, 0, 0, 0.6)'
            }}>
              <span>09123456789 | demo123</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}