/**
 * GeminiPromptTab Component
 * Manages Gemini AI model prompt configuration with textarea editor
 */

import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Card } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import { Badge } from '../ui/badge';
import { Label } from '../ui/label';
import {
  Save,
  Loader2,
  AlertCircle,
  CheckCircle,
  Clock,
  RefreshCw
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import type { AdminError, ModelPromptFormState } from '../../types/admin';

export function GeminiPromptTab() {
  const [formState, setFormState] = useState<ModelPromptFormState>({
    prompt: '',
    isSubmitting: false,
    hasChanges: false,
  });
  const [error, setError] = useState<AdminError | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Load current prompt on component mount
  useEffect(() => {
    loadCurrentPrompt();
  }, []);

  const loadCurrentPrompt = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await adminService.getModelPrompt();

      if (response.success && response.data) {
        setFormState(prev => ({
          ...prev,
          prompt: response.data!.prompt,
          hasChanges: false,
          lastSaved: response.data!.updated_at,
        }));
      } else {
        const adminError: AdminError = {
          message: response.error || 'خطا در بارگذاری prompt',
          statusCode: response.statusCode,
          type: 'server',
        };
        setError(adminError);
      }
    } catch (error) {
      const adminError: AdminError = {
        message: 'خطای شبکه. لطفاً اتصال اینترنت خود را بررسی کنید.',
        statusCode: 0,
        type: 'network',
      };
      setError(adminError);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePromptChange = (value: string) => {
    setFormState(prev => ({
      ...prev,
      prompt: value,
      hasChanges: true,
    }));
    setError(null);
    setSuccess(null);
  };

  const handleSave = async () => {
    if (!formState.prompt.trim()) {
      setError({
        message: 'Prompt نمی‌تواند خالی باشد',
        statusCode: 400,
        type: 'validation',
      });
      return;
    }

    setFormState(prev => ({ ...prev, isSubmitting: true }));
    setError(null);
    setSuccess(null);

    try {
      const response = await adminService.updateModelPrompt(formState.prompt);

      if (response.success && response.data) {
        setFormState(prev => ({
          ...prev,
          isSubmitting: false,
          hasChanges: false,
          lastSaved: response.data!.updated_at,
        }));
        setSuccess('Prompt با موفقیت ذخیره شد');

        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(null), 3000);
      } else {
        const adminError: AdminError = {
          message: response.error || 'خطا در ذخیره prompt',
          statusCode: response.statusCode,
          type: 'server',
        };
        setError(adminError);
        setFormState(prev => ({ ...prev, isSubmitting: false }));
      }
    } catch (error) {
      const adminError: AdminError = {
        message: 'خطای شبکه. لطفاً اتصال اینترنت خود را بررسی کنید.',
        statusCode: 0,
        type: 'network',
      };
      setError(adminError);
      setFormState(prev => ({ ...prev, isSubmitting: false }));
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getWordCount = (text: string) => {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  };

  const getCharacterCount = (text: string) => {
    return text.length;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">تنظیمات Gemini Prompt</h3>
        </div>

        <Card className="p-6">
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">تنظیمات Gemini Prompt</h3>
          <p className="text-sm text-gray-600">
            مدیریت prompt برای تولید تصاویر با Gemini AI
          </p>
        </div>

        <div className="flex items-center gap-3">
          {formState.lastSaved && (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Clock className="w-4 h-4" />
              <span>آخرین ذخیره: {formatDate(formState.lastSaved)}</span>
            </div>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={loadCurrentPrompt}
            disabled={formState.isSubmitting}
          >
            <RefreshCw className="w-4 h-4 ml-2" />
            بارگذاری مجدد
          </Button>
        </div>
      </div>

      {/* Success Alert */}
      {success && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            {success}
          </AlertDescription>
        </Alert>
      )}

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      )}

      {/* Prompt Editor */}
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium text-gray-700">
              Gemini Image Generation Prompt
            </Label>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <Badge variant="outline">
                {getWordCount(formState.prompt)} کلمه
              </Badge>
              <Badge variant="outline">
                {getCharacterCount(formState.prompt)} کاراکتر
              </Badge>
            </div>
          </div>

          <Textarea
            value={formState.prompt}
            onChange={(e) => handlePromptChange(e.target.value)}
            placeholder="Prompt خود را اینجا وارد کنید..."
            className="min-h-[600px] font-mono text-sm "
            disabled={formState.isSubmitting}
          />

          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex items-center gap-2">
              {formState.hasChanges && (
                <Badge variant="secondary" className="text-orange-600">
                  تغییرات ذخیره نشده
                </Badge>
              )}
            </div>

            <Button
              onClick={handleSave}
              disabled={!formState.hasChanges || formState.isSubmitting || !formState.prompt.trim()}
              style={{
                backgroundColor: !formState.hasChanges || formState.isSubmitting || !formState.prompt.trim() ? undefined : '#E31E24',
                color: 'white'
              }}
              className="hover:opacity-90 transition-opacity"
            >
              {formState.isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  در حال ذخیره...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  ذخیره تغییرات
                </>
              )}
            </Button>
          </div>
        </div>
      </Card>

      {/* Help Text */}
      <Card className="p-4 bg-blue-50 border-blue-200">
        <div className="text-sm text-blue-800">
          <h4 className="font-medium mb-2">راهنمای استفاده:</h4>
          <ul className="space-y-1 list-disc list-inside">
            <li>Prompt شما برای تولید تصاویر با Gemini استفاده می‌شود</li>
            <li>تغییرات فوری اعمال می‌شوند و روی تصاویر جدید تأثیر می‌گذارند</li>
            <li>برای بهترین نتیجه، دستورالعمل‌های واضح و دقیق بنویسید</li>
            <li>می‌توانید از متغیرهای خاص مثل نام محصول استفاده کنید</li>
          </ul>
        </div>
      </Card>
    </div>
  );
}
