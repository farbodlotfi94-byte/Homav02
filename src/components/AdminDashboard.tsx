/**
 * AdminDashboard Component
 * Main admin interface with authentication and tabbed navigation
 */

import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Alert, AlertDescription } from "./ui/alert";
import { Badge } from "./ui/badge";
import {
  LogOut,
  X,
  AlertCircle,
  Settings,
  Package,
  BarChart3,
  Shield,
  Sparkles
} from "lucide-react";
import { adminService } from "../services/adminService";
import { LoginForm } from "./admin/LoginForm";
import { ProductsTab } from "./admin/ProductsTab";
import { ProductForm } from "./admin/ProductForm";
import { GeminiPromptTab } from "./admin/GeminiPromptTab";
import { GroqPromptTab } from "./admin/GroqPromptTab";
import { AnalyticsTab } from "./admin/AnalyticsTab";
import type {
  AdminDashboardState,
  AdminProduct,
  AdminError,
  ProductFormState
} from "../types/admin";

export function AdminDashboard() {
  const [state, setState] = useState<AdminDashboardState>({
    isAuthenticated: false,
    isLoading: false,
    currentTab: 'products',
    error: null,
  });

  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const [productForm, setProductForm] = useState<ProductFormState>({
    isOpen: false,
    mode: 'create',
    formData: {
      name: '',
      description: '',
      category: '',
      is_predefined: 0,
    },
    isSubmitting: false,
    errors: {},
  });

  const [editingProduct, setEditingProduct] = useState<AdminProduct | null>(null);

  // Check authentication status on mount and listen for changes
  useEffect(() => {
    const isAuth = adminService.isAuthenticated();
    setState(prev => ({ ...prev, isAuthenticated: isAuth }));

    // Subscribe to authentication state changes
    const unsubscribe = adminService.onAuthChange((isAuthenticated) => {
      console.log('[AdminDashboard] Auth state changed:', isAuthenticated);
      setState(prev => ({
        ...prev,
        isAuthenticated,
        error: isAuthenticated ? null : {
          message: 'نشست شما منقضی شده است. لطفاً دوباره وارد شوید.',
          statusCode: 401,
          type: 'auth',
        }
      }));

      // Clear forms and editing state when logged out
      if (!isAuthenticated) {
        setProductForm(prev => ({ ...prev, isOpen: false }));
        setEditingProduct(null);
      }
    });

    // Cleanup subscription on unmount
    return () => {
      unsubscribe();
    };
  }, []);

  const handleLoginSuccess = () => {
    setState(prev => ({
      ...prev,
      isAuthenticated: true,
      error: null
    }));
  };

  const handleLoginError = (error: AdminError) => {
    setState(prev => ({ ...prev, error }));
  };

  const handleLogout = () => {
    adminService.logout();
    setState(prev => ({
      ...prev,
      isAuthenticated: false,
      currentTab: 'products',
      error: null
    }));
    setProductForm(prev => ({ ...prev, isOpen: false }));
    setEditingProduct(null);
  };

  const handleCreateProduct = () => {
    setProductForm({
      isOpen: true,
      mode: 'create',
      formData: {
        name: '',
        description: '',
        category: '',
        is_predefined: 0,
      },
      isSubmitting: false,
      errors: {},
    });
    setEditingProduct(null);
  };

  const handleEditProduct = (product: AdminProduct) => {
    setEditingProduct(product);
    setProductForm({
      isOpen: true,
      mode: 'edit',
      productId: product.id,
      formData: {
        name: product.name,
        description: product.description,
        category: product.category,
        is_predefined: product.is_predefined,
      },
      isSubmitting: false,
      errors: {},
    });
  };

  const handleDeleteProduct = async (productId: number) => {
    console.log('[AdminDashboard] Delete button clicked for product:', productId);

    if (!confirm('آیا از حذف این محصول اطمینان دارید؟')) {
      console.log('[AdminDashboard] Delete cancelled by user');
      return;
    }

    console.log('[AdminDashboard] Delete confirmed, calling API...');
    try {
      const response = await adminService.deleteProduct(productId);
      console.log('[AdminDashboard] Delete response:', response);

      if (response.success) {
        console.log('[AdminDashboard] Product deleted successfully');
        // Refresh products list by calling the API
        setRefreshTrigger(prev => prev + 1);
      } else {
        console.error('[AdminDashboard] Delete failed:', response.error);
        const error: AdminError = {
          message: response.error || 'خطا در حذف محصول',
          statusCode: response.statusCode,
          type: 'server',
        };
        setState(prev => ({ ...prev, error }));
      }
    } catch (error) {
      console.error('[AdminDashboard] Delete error:', error);
      const adminError: AdminError = {
        message: 'خطای شبکه. لطفاً اتصال اینترنت خود را بررسی کنید.',
        statusCode: 0,
        type: 'network',
      };
      setState(prev => ({ ...prev, error: adminError }));
    }
  };

  const handleProductFormSuccess = () => {
    setProductForm(prev => ({ ...prev, isOpen: false }));
    setEditingProduct(null);
    // Trigger refresh by calling the API
    setRefreshTrigger(prev => prev + 1);
  };

  const handleProductFormError = (error: AdminError) => {
    setState(prev => ({ ...prev, error }));
  };

  const clearError = () => {
    setState(prev => ({ ...prev, error: null }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-[#E31E24] rounded-lg flex items-center justify-center">
                <Shield className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  پنل مدیریت HOMA
                </h1>
                <p className="text-sm text-gray-500">
                  مدیریت محصولات و تنظیمات AI
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {state.isAuthenticated && (
                <Badge variant="secondary" className="text-green-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full ml-2"></div>
                  متصل
                </Badge>
              )}

              {state.isAuthenticated && state.currentTab === 'products' && (
                <Button
                  onClick={handleCreateProduct}
                  variant="default"
                  size="sm"
                  style={{
                    backgroundColor: '#E31E24',
                    color: 'white'
                  }}
                  className="hover:opacity-90 transition-opacity"
                >
                  افزودن محصول جدید
                </Button>
              )}

              {state.isAuthenticated && (
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  size="sm"
                  className="text-red-600 hover:text-red-700"
                >
                  <LogOut className="w-4 h-4 ml-2" />
                  خروج
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {state.error && (
          <div className="mb-6">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="flex items-center justify-between">
                <span>{state.error.message}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearError}
                  className="text-red-600 hover:text-red-700"
                >
                  <X className="w-4 h-4" />
                </Button>
              </AlertDescription>
            </Alert>
          </div>
        )}

        {/* Content */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          {!state.isAuthenticated ? (
            <div className="flex items-center justify-center min-h-[500px]">
              <LoginForm
                onLoginSuccess={handleLoginSuccess}
                onError={handleLoginError}
              />
            </div>
          ) : (
            <Tabs
              value={state.currentTab}
              onValueChange={(value) => setState(prev => ({
                ...prev,
                currentTab: value as AdminDashboardState['currentTab']
              }))}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-4 mb-6">
                <TabsTrigger value="products" className="flex items-center gap-2">
                  <Package className="w-4 h-4" />
                  محصولات
                </TabsTrigger>
                <TabsTrigger value="gemini-prompt" className="flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  Gemini Prompt
                </TabsTrigger>
                <TabsTrigger value="groq-prompt" className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Groq Prompt
                </TabsTrigger>
                <TabsTrigger value="analytics" className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  تحلیل
                </TabsTrigger>
              </TabsList>

              <TabsContent value="products">
                <ProductsTab
                  onEditProduct={handleEditProduct}
                  onDeleteProduct={handleDeleteProduct}
                  onCreateProduct={handleCreateProduct}
                  refreshTrigger={refreshTrigger}
                />
              </TabsContent>

              <TabsContent value="gemini-prompt">
                <GeminiPromptTab />
              </TabsContent>

              <TabsContent value="groq-prompt">
                <GroqPromptTab />
              </TabsContent>

              <TabsContent value="analytics">
                <AnalyticsTab />
              </TabsContent>
            </Tabs>
          )}
        </div>
      </div>

      {/* Product Form Modal */}
      <ProductForm
        isOpen={productForm.isOpen}
        mode={productForm.mode}
        product={editingProduct || undefined}
        onClose={() => setProductForm(prev => ({ ...prev, isOpen: false }))}
        onSuccess={handleProductFormSuccess}
        onError={handleProductFormError}
      />
    </div>
  );
}
