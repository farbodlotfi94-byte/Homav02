import { Suspense, useState, useEffect, useCallback, useRef } from 'react';
import { Toaster, toast } from 'sonner';
import './index.css';
import { SellerLogin } from './components/SellerLogin';
import { SellerNavigation } from './components/SellerNavigation';
import { SellerDashboard } from './components/SellerDashboard';
import { ProductsPage } from './components/ProductsPage';
import { AddEditProductModal } from './components/AddEditProductModal';
import { LinkPreviewModal } from './components/LinkPreviewModal';
import { SettingsPage } from './components/SettingsPage';
import { HomaHeader } from './components/HomaHeader';
import { sellerAuthService } from '../../services/sellerAuthService';
import { sellerApiService } from '../../services/sellerApiService';
import {
  mapSettingsToSeller,
  mapBackendProductToSeller,
  mapDashboardResponse,
  createProductFormData,
} from '../../utils/sellerTypeMappers';
import type { Seller, SellerProduct, DashboardStats, ProductAnalyticsItem } from './types/seller';
import type { ProductDetailsResponse } from '../../types/seller-api';

type Page = 'dashboard' | 'products' | 'settings';

export function SellerDashboardApp() {
  console.log('[SellerDashboardApp] Component rendered');

  // Authentication state
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Page state
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');

  // Data state
  const [seller, setSeller] = useState<Seller | null>(null);
  const [products, setProducts] = useState<SellerProduct[]>([]);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [rawDashboardData, setRawDashboardData] = useState<any>(null);
  const [productAnalytics, setProductAnalytics] = useState<ProductAnalyticsItem[]>([]);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');

  // Loading states
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(false);
  const [isLoadingDashboard, setIsLoadingDashboard] = useState(false);

  // Modal state
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<SellerProduct | null>(null);
  const [linkPreviewData, setLinkPreviewData] = useState<{
    isOpen: boolean;
    tryLink: string;
    productName: string;
  }>({
    isOpen: false,
    tryLink: '',
    productName: '',
  });

  // Ref to store shopLink for use in callbacks
  const shopLinkRef = useRef<string>('');


  // Load all dashboard data
  const loadDashboardData = async () => {
    // Check if user is still authenticated before making API calls
    if (!sellerAuthService.isAuthenticated()) {
      console.log('[SellerDashboardApp] User not authenticated, skipping dashboard load');
      setIsLoggedIn(false);
      return;
    }

    console.log('[SellerDashboardApp] Loading dashboard data');
    setIsLoadingDashboard(true);

    try {
      // Fetch settings, dashboard stats, and product analytics in parallel
      const [settingsResult, dashboardResult, analyticsResult] = await Promise.all([
        sellerApiService.getSettings(),
        sellerApiService.getDashboardStats(),
        sellerApiService.getProductAnalytics({
          period: 'all',
          ordering: '-views_total',
          page_size: 10,
        }),
      ]);

      // Handle seller settings
      if (settingsResult.success && settingsResult.data) {
        const sellerData = mapSettingsToSeller(settingsResult.data);
        setSeller(sellerData);
        // Store shopLink in ref for use in callbacks
        shopLinkRef.current = sellerData.shopLink || '';
        console.log('[SellerDashboardApp] Seller data loaded:', sellerData);
        console.log('[SellerDashboardApp] Shop link:', sellerData.shopLink);
      } else {
        // Check if this is an authentication error
        if (settingsResult.error?.includes('منقضی شده') || settingsResult.error?.includes('expired')) {
          console.log('[SellerDashboardApp] Authentication error detected, logging out');
          handleLogout();
          return;
        }
        toast.error(settingsResult.error || 'خطا در بارگذاری اطلاعات فروشگاه');
      }

      // Handle dashboard stats
      if (dashboardResult.success && dashboardResult.data) {
        setRawDashboardData(dashboardResult.data);
        console.log('[SellerDashboardApp] Dashboard stats loaded');
      } else {
        // Check if this is an authentication error
        if (dashboardResult.error?.includes('منقضی شده') || dashboardResult.error?.includes('expired')) {
          console.log('[SellerDashboardApp] Authentication error detected, logging out');
          handleLogout();
          return;
        }
        toast.error(dashboardResult.error || 'خطا در بارگذاری آمار');
      }

      // Handle product analytics
      if (analyticsResult.success && analyticsResult.data) {
        setProductAnalytics(analyticsResult.data.results);
        console.log('[SellerDashboardApp] Product analytics loaded:', analyticsResult.data.results.length);
      } else {
        // Check if this is an authentication error
        if (analyticsResult.error?.includes('منقضی شده') || analyticsResult.error?.includes('expired')) {
          console.log('[SellerDashboardApp] Authentication error detected, logging out');
          handleLogout();
          return;
        }
        toast.error(analyticsResult.error || 'خطا در بارگذاری آمار محصولات');
      }
    } catch (error) {
      console.error('[SellerDashboardApp] Error loading dashboard data:', error);
      toast.error('خطا در بارگذاری اطلاعات');
    } finally {
      setIsLoadingDashboard(false);
    }
  };

  // Load products list (fetched when navigating to products page)
  const loadProducts = useCallback(async (searchTerm?: string) => {
    console.log('[SellerDashboardApp] loadProducts called with search:', searchTerm);

    console.log('[SellerDashboardApp] Loading products list');
    setIsLoadingProducts(true);

    try {
      console.log('[SellerDashboardApp] Making API call to getProductsList');
      const params: { page: number; page_size: number; search?: string } = {
        page: 1,
        page_size: 100
      };
      if (searchTerm && searchTerm.trim()) {
        params.search = searchTerm.trim();
      }
      const result = await sellerApiService.getProductsList(params);

      console.log('[SellerDashboardApp] API response:', result);

      if (result.success && result.data) {
        console.log('[SellerDashboardApp] API call successful, processing results...');
        console.log('[SellerDashboardApp] Number of products:', result.data.results.length);
        console.log('[SellerDashboardApp] First product:', result.data.results[0]);

        const productsData = result.data.results.map((item, index) => {
          const imageUrl = item.image_url;
          // Note: Backend may not return id in list endpoint - use fallback
          const productId = item.id !== undefined ? item.id.toString() : `temp-${index}`;
          console.log(`[SellerDashboardApp] Product ${index}: id=${productId}, name=${item.name}, image_url=${imageUrl}, unique_link=${item.unique_link}`);

          // Construct tryLink from frontend_link or shopLink + unique_link
          // Format: https://myhoma.ir/{shop_slug}/{unique_link}
          // shopLink from settings is like: https://myhoma.ir/carpet-market/
          const shopLink = shopLinkRef.current;
          const tryLink = item.frontend_link || (item.unique_link && shopLink ? `${shopLink}${item.unique_link}` : '');

          return {
            id: productId,
            sellerId: '',
            name: item.name,
            description: '',
            category: '',
            price: item.price,
            currency: 'IRR' as const,
            images: imageUrl ? [imageUrl] : [],
            tryLink: tryLink,
            uniqueLink: item.unique_link || '', // Store for fetching full details when editing
            specs: [],
            createdAt: '',
            updatedAt: '',
            status: 'active' as const,
            views: item.total_views,
          } as SellerProduct;
        });

        setProducts(productsData);
        console.log('[SellerDashboardApp] Products loaded:', productsData.length);
      } else {
        console.log('[SellerDashboardApp] API call failed:', result.error);
        if (result.error?.includes('منقضی شده') || result.error?.includes('expired')) {
          console.log('[SellerDashboardApp] Authentication error detected, logging out');
          handleLogout();
          return;
        }
        toast.error(result.error || 'خطا در بارگذاری محصولات');
      }
    } catch (error) {
      console.error('[SellerDashboardApp] Error loading products:', error);
      toast.error('خطا در بارگذاری محصولات');
    } finally {
      setIsLoadingProducts(false);
    }
  }, []);

  // Debounce timer ref for search
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Handle search query change with debounce
  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);

    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set new timer for debounced API call
    debounceTimerRef.current = setTimeout(() => {
      console.log('[SellerDashboardApp] Debounced search triggered:', value);
      loadProducts(value);
    }, 800);
  }, [loadProducts]);

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  // Check authentication on mount
  useEffect(() => {
    console.log('[SellerDashboardApp] Checking authentication');
    const isAuthenticated = sellerAuthService.isAuthenticated();
    setIsLoggedIn(isAuthenticated);
    setIsCheckingAuth(false);

    if (isAuthenticated) {
      loadDashboardData();
    }
  }, []);

  // Refetch data when navigating between tabs
  useEffect(() => {
    console.log('[SellerDashboardApp] Page changed:', { currentPage, isLoggedIn });
    if (!isLoggedIn) {
      console.log('[SellerDashboardApp] Not logged in, skipping data load');
      return;
    }

    // Refetch based on current page (no cache check)
    if (currentPage === 'dashboard') {
      console.log('[SellerDashboardApp] Navigated to dashboard, loading data');
      loadDashboardData();
    } else if (currentPage === 'products') {
      console.log('[SellerDashboardApp] Navigated to products page, loading products');
      loadProducts();
    }
    // Settings uses already-loaded seller data (no API call needed)
  }, [currentPage, isLoggedIn]);

  // Login success handler
  const handleLoginSuccess = () => {
    console.log('[SellerDashboardApp] Login successful');
    setIsLoggedIn(true);
    loadDashboardData();
    toast.success('خوش آمدید! 👋');
  };

  // Logout handler
  const handleLogout = () => {
    console.log('[SellerDashboardApp] Logging out');
    sellerAuthService.logout();
    setIsLoggedIn(false);
    setSeller(null);
    setProducts([]);
    setDashboardStats(null);
    setCurrentPage('dashboard');
    toast.success('با موفقیت خارج شدید');
  };

  // Product handlers
  const handleAddProduct = () => {
    setEditingProduct(null);
    setIsAddProductModalOpen(true);
  };

  const handleEditProduct = async (product: SellerProduct) => {
    console.log('[SellerDashboardApp] Edit product clicked:', product.id, product.uniqueLink);

    // If we have a uniqueLink, fetch full product details first
    if (product.uniqueLink) {
      setIsLoadingData(true);
      try {
        const result = await sellerApiService.getProductDetails(product.uniqueLink);
        console.log('[SellerDashboardApp] Fetched full product details:', result);

        if (result.success && result.data) {
          // Map full product details to SellerProduct
          const fullProduct = mapBackendProductToSeller(result.data, shopLinkRef.current);
          // Preserve the uniqueLink from the list
          fullProduct.uniqueLink = product.uniqueLink;
          console.log('[SellerDashboardApp] Full product with description:', fullProduct.description);
          setEditingProduct(fullProduct);
          setIsAddProductModalOpen(true);
        } else {
          toast.error(result.error || 'خطا در بارگذاری اطلاعات محصول');
        }
      } catch (error) {
        console.error('[SellerDashboardApp] Error fetching product details:', error);
        toast.error('خطا در بارگذاری اطلاعات محصول');
      } finally {
        setIsLoadingData(false);
      }
    } else {
      // Fallback: open modal with partial data (for temp products or when uniqueLink not available)
      console.log('[SellerDashboardApp] No uniqueLink, using partial product data');
      setEditingProduct(product);
      setIsAddProductModalOpen(true);
    }
  };

  const handleSaveProduct = async (
    productData: Partial<SellerProduct>,
    productImage?: File | null
  ) => {
    console.log('[SellerDashboardApp] Saving product:', productData);
    setIsLoadingData(true);

    try {
      // Prepare form data
      const formData = createProductFormData(
        {
          name: productData.name || '',
          description: productData.description || '',
          category: productData.category || '',
          price: productData.price || 0,
          link: productData.tryLink || null,
          extra_details: productData.specs?.reduce((acc, spec) => {
            acc[spec.key] = spec.value;
            return acc;
          }, {} as Record<string, string>),
        },
        productImage
      );

      if (editingProduct) {
        // Update existing product
        const productId = parseInt(editingProduct.id, 10);
        if (isNaN(productId)) {
          toast.error('شناسه محصول نامعتبر است');
          return;
        }

        const result = await sellerApiService.updateProduct(productId, formData);
        console.log('[SellerDashboardApp] Update response:', result.data);

        if (result.success && result.data) {
          const updatedProduct = mapBackendProductToSeller(result.data, shopLinkRef.current);

          // Preserve existing image if backend didn't return one (no new image uploaded)
          // The mapper now sets images to [] if image_url is empty
          if (updatedProduct.images.length === 0 && editingProduct.images && editingProduct.images.length > 0 && editingProduct.images[0]) {
            console.log('[SellerDashboardApp] Preserving existing image:', editingProduct.images[0]);
            updatedProduct.images = editingProduct.images;
          }

          // Preserve uniqueLink from editingProduct if not in response
          if (!updatedProduct.uniqueLink && editingProduct.uniqueLink) {
            updatedProduct.uniqueLink = editingProduct.uniqueLink;
          }

          console.log('[SellerDashboardApp] Final updated product:', updatedProduct);
          setProducts(products.map((p) => (p.id === editingProduct.id ? updatedProduct : p)));
          toast.success('محصول به‌روز شد');
        } else {
          toast.error(result.error || 'خطا در به‌روزرسانی محصول');
        }
      } else {
        // Add new product
        const result = await sellerApiService.createProduct(formData);

        console.log('[SellerDashboardApp] Create product response:', result);

        if (result.success && result.data) {
          console.log('[SellerDashboardApp] Backend response data:', result.data);
          console.log('[SellerDashboardApp] frontend_link from backend:', result.data.frontend_link);

          const newProduct = mapBackendProductToSeller(result.data, shopLinkRef.current);
          console.log('[SellerDashboardApp] Mapped product tryLink:', newProduct.tryLink);

          setProducts([...products, newProduct]);

          // Show Link Preview Modal
          setLinkPreviewData({
            isOpen: true,
            tryLink: newProduct.tryLink || result.data.frontend_link || '',
            productName: newProduct.name,
          });

          toast.success('محصول جدید اضافه شد');
        } else {
          toast.error(result.error || 'خطا در ایجاد محصول');
        }
      }

      // Reload dashboard stats
      const dashboardResult = await sellerApiService.getDashboardStats();
      if (dashboardResult.success && dashboardResult.data) {
        const stats = mapDashboardResponse(dashboardResult.data, products.length);
        setDashboardStats(stats);
        setRawDashboardData(dashboardResult.data);
      }
    } catch (error) {
      console.error('[SellerDashboardApp] Error saving product:', error);
      toast.error('خطا در ذخیره محصول');
    } finally {
      setIsLoadingData(false);
      setIsAddProductModalOpen(false);
      setEditingProduct(null);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('آیا مطمئن هستید که می‌خواهید این محصول را حذف کنید؟')) {
      return;
    }

    console.log('[SellerDashboardApp] Deleting product:', productId);
    setIsLoadingData(true);

    try {
      const numericId = parseInt(productId, 10);
      if (isNaN(numericId)) {
        toast.error('شناسه محصول نامعتبر است');
        return;
      }

      const result = await sellerApiService.deleteProduct(numericId);

      if (result.success) {
        setProducts(products.filter((p) => p.id !== productId));
        toast.success('محصول حذف شد');

        // Reload dashboard stats
        const dashboardResult = await sellerApiService.getDashboardStats();
        if (dashboardResult.success && dashboardResult.data) {
          const stats = mapDashboardResponse(dashboardResult.data, products.length - 1);
          setDashboardStats(stats);
        }
      } else {
        toast.error(result.error || 'خطا در حذف محصول');
      }
    } catch (error) {
      console.error('[SellerDashboardApp] Error deleting product:', error);
      toast.error('خطا در حذف محصول');
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleUpdateSeller = async (data: Partial<Seller>) => {
    console.log('[SellerDashboardApp] Updating seller:', data);
    setIsLoadingData(true);

    try {
      const updateData: any = {};

      // Map frontend fields to backend fields
      if (data.name !== undefined) updateData.username = data.name;
      if (data.shopName !== undefined) updateData.shop_name = data.shopName;
      if (data.shopWebsiteLink !== undefined) updateData.shop_website_link = data.shopWebsiteLink;

      // Note: These fields are READ-ONLY and cannot be updated by seller:
      // - phone_number (set during registration, requires admin intervention)
      // - shop_link (auto-generated by backend based on shop_name)

      const result = await sellerApiService.updateSettings(updateData);

      if (result.success && result.data) {
        const updatedSeller = mapSettingsToSeller(result.data);
        setSeller(updatedSeller);
        toast.success('اطلاعات به‌روز شد');
      } else {
        toast.error(result.error || 'خطا در به‌روزرسانی اطلاعات');
      }
    } catch (error) {
      console.error('[SellerDashboardApp] Error updating seller:', error);
      toast.error('خطا در به‌روزرسانی اطلاعات');
    } finally {
      setIsLoadingData(false);
    }
  };

  // Show loading while checking authentication
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p style={{ fontSize: '14px', color: 'rgba(0, 0, 0, 0.6)' }}>در حال بارگذاری...</p>
        </div>
      </div>
    );
  }

  // Show login if not logged in
  if (!isLoggedIn) {
    return (
      <div className="bg-white min-h-screen text-black">
        <Suspense fallback={<div>Loading...</div>}>
          <SellerLogin onLoginSuccess={handleLoginSuccess} />
        </Suspense>
        <Toaster position="top-center" richColors theme="light" />
      </div>
    );
  }

  // Show loading if data is being fetched
  if ((isLoadingData || isLoadingDashboard) && !seller) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p style={{ fontSize: '14px', color: 'rgba(0, 0, 0, 0.6)' }}>در حال بارگذاری داده‌ها...</p>
        </div>
      </div>
    );
  }

  // If seller data is not loaded yet, show error
  if (!seller) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <p style={{ fontSize: '16px', color: '#ef4444', marginBottom: '16px' }}>
            خطا در بارگذاری اطلاعات فروشگاه
          </p>
          <button
            onClick={loadDashboardData}
            className="px-6 py-2 rounded-lg transition-colors"
            style={{
              backgroundColor: 'var(--old-flax)',
              color: '#000000',
              fontSize: '14px',
              fontWeight: 'var(--font-weight-medium)',
            }}
          >
            تلاش مجدد
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-black">
      {/* Header - Mobile & Desktop */}
      <Suspense fallback={<div>Loading header...</div>}>
        <HomaHeader />
      </Suspense>

      {/* Desktop Sidebar / Mobile Bottom Nav */}
      <div className="flex flex-col md:flex-row">
        {/* Sidebar (Desktop) */}
        <aside
          className="hidden md:block w-64 sticky top-14 h-[calc(100vh-3.5rem)] p-5"
          style={{
            borderLeft: '1px solid rgba(0, 0, 0, 0.1)',
            background: '#ffffff',
          }}
        >
          <div className="mb-8">
            <div
              className="w-16 h-16 rounded-[20px] flex items-center justify-center mb-4"
              style={{
                background: 'var(--jet-black)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <span className="text-3xl">🏪</span>
            </div>
            <h2
              className="mb-1 text-black"
              style={{
                fontSize: '16px',
                fontWeight: 'var(--font-weight-bold)',
              }}
            >
              {seller.shopName}
            </h2>
            <p
              className="text-gray-600"
              style={{
                fontSize: '14px',
                fontWeight: 'var(--font-weight-normal)',
              }}
            >
              {seller.name}
            </p>
          </div>
          <Suspense fallback={<div>Loading navigation...</div>}>
            <SellerNavigation currentPage={currentPage} onNavigate={setCurrentPage} />
          </Suspense>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-5 md:p-8">
          <div className="max-w-7xl mx-auto">
            {currentPage === 'dashboard' && rawDashboardData && (
              <Suspense fallback={<div>Loading dashboard...</div>}>
                <SellerDashboard
                  stats={rawDashboardData || dashboardStats}
                  seller={seller}
                  productAnalytics={productAnalytics}
                  isLoadingAnalytics={isLoadingDashboard}
                  onAddProduct={handleAddProduct}
                />
              </Suspense>
            )}

            {currentPage === 'products' && (
              <Suspense fallback={<div>Loading products...</div>}>
                <ProductsPage
                  products={products}
                  seller={seller}
                  isLoadingProducts={isLoadingProducts}
                  searchQuery={searchQuery}
                  onSearchChange={handleSearchChange}
                  onAddProduct={handleAddProduct}
                  onEditProduct={handleEditProduct}
                  onDeleteProduct={handleDeleteProduct}
                />
              </Suspense>
            )}

            {currentPage === 'settings' && (
              <Suspense fallback={<div>Loading settings...</div>}>
                <SettingsPage
                  seller={seller}
                  onUpdate={handleUpdateSeller}
                  onLogout={handleLogout}
                />
              </Suspense>
            )}
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden">
        <Suspense fallback={<div>Loading navigation...</div>}>
          <SellerNavigation currentPage={currentPage} onNavigate={setCurrentPage} />
        </Suspense>
      </div>

      {/* Add/Edit Product Modal */}
      <Suspense fallback={<div>Loading modal...</div>}>
        <AddEditProductModal
          isOpen={isAddProductModalOpen}
          onClose={() => {
            setIsAddProductModalOpen(false);
            setEditingProduct(null);
          }}
          onSave={handleSaveProduct}
          product={editingProduct}
        />
      </Suspense>

      {/* Link Preview Modal */}
      <Suspense fallback={<div>Loading modal...</div>}>
        <LinkPreviewModal
          isOpen={linkPreviewData.isOpen}
          onClose={() => setLinkPreviewData({ ...linkPreviewData, isOpen: false })}
          tryLink={linkPreviewData.tryLink}
          productName={linkPreviewData.productName}
        />
      </Suspense>

      {/* Toast Notifications */}
      <Toaster position="top-center" richColors theme="light" />
    </div>
  );
}
