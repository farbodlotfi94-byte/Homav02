/**
 * LoginForm Component
 * Handles admin authentication with username and password
 */

import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import { adminService } from '../../services/adminService';
import type { AdminLoginCredentials, AdminError } from '../../types/admin';

interface LoginFormProps {
  onLoginSuccess: () => void;
  onError: (error: AdminError) => void;
}

export function LoginForm({ onLoginSuccess, onError }: LoginFormProps) {
  const [credentials, setCredentials] = useState<AdminLoginCredentials>({
    username: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!credentials.username.trim()) {
      newErrors.username = 'نام کاربری الزامی است';
    }

    if (!credentials.password.trim()) {
      newErrors.password = 'رمز عبور الزامی است';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const response = await adminService.login(credentials);

      if (response.success) {
        onLoginSuccess();
      } else {
        const error: AdminError = {
          message: response.error || 'خطا در ورود',
          statusCode: response.statusCode,
          type: 'auth',
        };
        onError(error);
      }
    } catch (error) {
      const adminError: AdminError = {
        message: 'خطای شبکه. لطفاً اتصال اینترنت خود را بررسی کنید.',
        statusCode: 0,
        type: 'network',
      };
      onError(adminError);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof AdminLoginCredentials, value: string) => {
    setCredentials(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto p-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          ورود به پنل مدیریت
        </h2>
        <p className="text-gray-600">
          برای دسترسی به پنل مدیریت HOMA وارد شوید
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="username" className="text-sm font-medium text-gray-700">
            نام کاربری
          </Label>
          <Input
            id="username"
            type="text"
            value={credentials.username}
            onChange={(e) => handleInputChange('username', e.target.value)}
            placeholder="نام کاربری خود را وارد کنید"
            className={errors.username ? 'border-red-500' : ''}
            disabled={isLoading}
            autoComplete="username"
          />
          {errors.username && (
            <p className="text-sm text-red-600">{errors.username}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-sm font-medium text-gray-700">
            رمز عبور
          </Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={credentials.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              placeholder="رمز عبور خود را وارد کنید"
              className={errors.password ? 'border-red-500 pr-10' : 'pr-10'}
              disabled={isLoading}
              autoComplete="current-password"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
              onClick={() => setShowPassword(!showPassword)}
              disabled={isLoading}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4 text-gray-400" />
              ) : (
                <Eye className="h-4 w-4 text-gray-400" />
              )}
            </Button>
          </div>
          {errors.password && (
            <p className="text-sm text-red-600">{errors.password}</p>
          )}
        </div>

        <Button
          type="submit"
          className="w-full bg-[#E31E24] hover:bg-[#C41E3A] text-white"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              در حال ورود...
            </>
          ) : (
            'ورود'
          )}
        </Button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-xs text-gray-500">
          برای دسترسی به پنل مدیریت، Shift + Ctrl + A را فشار دهید
        </p>
      </div>
    </Card>
  );
}

