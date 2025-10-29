/**
 * AdminDashboard Component
 * Main admin interface with authentication and tabbed navigation
 */

import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
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
  Shield
} from "lucide-react";
import { adminService } from "../services/adminService";
import { LoginForm } from "./admin/LoginForm";
import { ProductsTab } from "./admin/ProductsTab";
import { ProductForm } from "./admin/ProductForm";
import { ModelPromptTab } from "./admin/ModelPromptTab";
import { AnalyticsTab } from "./admin/AnalyticsTab";
import type { 
  AdminDashboardState, 
  AdminProduct, 
  AdminError, 
  ProductFormState
} from "../types/admin";
import { ADMIN_CONSTANTS } from "../types/admin";

export function AdminDashboard() {
  const [state, setState] = useState<AdminDashboardState>({
    isVisible: false,
    isAuthenticated: false,
    isLoading: false,
    currentTab: 'products',
    error: null,
  });

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

  // Keyboard shortcut handler: Shift + Ctrl + A
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.shiftKey && e.ctrlKey && e.key === "A") {
        setState(prev => ({ ...prev, isVisible: !prev.isVisible }));
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, []);

  // Check authentication status when dashboard opens
  useEffect(() => {
    if (state.isVisible) {
      const isAuth = adminService.isAuthenticated();
      setState(prev => ({ ...prev, isAuthenticated: isAuth }));
    }
  }, [state.isVisible]);

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (state.isVisible) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = 'unset';
      };
    }
  }, [state.isVisible]);

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

  const handleClose = () => {
    setState(prev => ({ ...prev, isVisible: false, error: null }));
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
    if (!confirm('آیا از حذف این محصول اطمینان دارید؟')) {
      return;
    }

    try {
      const response = await adminService.deleteProduct(productId);
      if (response.success) {
        // Refresh products list by triggering a re-render
        setState(prev => ({ ...prev }));
      } else {
        const error: AdminError = {
          message: response.error || 'خطا در حذف محصول',
          statusCode: response.statusCode,
          type: 'server',
        };
        setState(prev => ({ ...prev, error }));
      }
    } catch (error) {
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
    // Trigger refresh by updating state
    setState(prev => ({ ...prev }));
  };

  const handleProductFormError = (error: AdminError) => {
    setState(prev => ({ ...prev, error }));
  };

  const clearError = () => {
    setState(prev => ({ ...prev, error: null }));
  };

  if (!state.isVisible) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-hidden"
      onClick={handleClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex-shrink-0 bg-white border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#E31E24] rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  پنل مدیریت HOMA
                </h2>
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
                  className="bg-[#E31E24] hover:bg-[#C41E3A] text-white"
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
              
              <Button
                onClick={handleClose}
                variant="ghost"
                size="sm"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {state.error && (
          <div className="p-4 border-b border-red-200 bg-red-50">
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
        <div className="flex-1 overflow-y-auto p-6">
          {!state.isAuthenticated ? (
            <div className="flex items-center justify-center min-h-[400px]">
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
                currentTab: value as 'products' | 'model-prompt' | 'analytics' 
              }))}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="products" className="flex items-center gap-2">
                  <Package className="w-4 h-4" />
                  محصولات
                </TabsTrigger>
                <TabsTrigger value="model-prompt" className="flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  تنظیمات AI
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
                />
              </TabsContent>

              <TabsContent value="model-prompt">
                <ModelPromptTab />
              </TabsContent>

              <TabsContent value="analytics">
                <AnalyticsTab />
              </TabsContent>
            </Tabs>
          )}
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 bg-gray-50 border-t border-gray-200 p-4 text-center text-sm text-gray-500">
          برای دسترسی به پنل مدیریت، {ADMIN_CONSTANTS.KEYBOARD_SHORTCUT} را فشار دهید
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