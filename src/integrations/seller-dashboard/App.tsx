import { useState } from 'react';
import { Toaster, toast } from 'sonner@2.0.3';
import { SellerLogin } from './components/SellerLogin';
import { SellerNavigation } from './components/SellerNavigation';
import { SellerDashboard } from './components/SellerDashboard';
import { ProductsPage } from './components/ProductsPage';
import { AddEditProductModal } from './components/AddEditProductModal';
import { LinkPreviewModal } from './components/LinkPreviewModal';
import { SettingsPage } from './components/SettingsPage';
import { HomaHeader } from './components/HomaHeader';
import type { Seller, SellerProduct, DashboardStats } from './types/seller';

type Page = 'dashboard' | 'products' | 'settings';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
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

  // Mock seller data
  const [seller] = useState<Seller>({
    id: 'seller_001',
    name: 'علی احمدی',
    shopName: 'فروشگاه دکور مدرن',
    instagram: 'modern_decor_shop',
    whatsapp: '09123456789',
    email: 'demo@homa.app',
    createdAt: '2025-01-01T00:00:00Z',
  });

  // Mock products
  const [products, setProducts] = useState<SellerProduct[]>([
    {
      id: 'prod_001',
      sellerId: 'seller_001',
      name: 'مبل راحتی مدرن',
      description: 'مبل راحتی سه نفره با طراحی مدرن و کیفیت عالی. مناسب برای فضاهای کوچک و بزرگ.',
      specs: [
        { key: 'رنگ', value: 'خاکستری روشن' },
        { key: 'سایز', value: '۳ نفره (۲۱۰ سانتی‌متر)' },
        { key: 'جنس', value: 'پارچه لینن' },
        { key: 'ساخت', value: 'ترکیه' },
        { key: 'گارانتی', value: '۱۸ ماه' },
      ],
      price: 25000000,
      currency: 'IRR',
      images: ['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80'],
      tryLink: 'https://homa.app/try?p=modern-sofa&ref=seller',
      createdAt: '2025-01-15T10:00:00Z',
      updatedAt: '2025-01-15T10:00:00Z',
    },
    {
      id: 'prod_002',
      sellerId: 'seller_001',
      name: 'فرش دستباف کاشان',
      description: 'فرش دستباف اصیل کاشان با نقش و نگار سنتی زیبا. محصولی منحصر به فرد برای خانه شما.',
      specs: [
        { key: 'نوع', value: 'دستباف ابریشمی' },
        { key: 'سایز', value: '۶ متری' },
        { key: 'طرح', value: 'سنتی کاشان' },
        { key: 'رنگ‌بندی', value: 'قرمز و سرمه‌ای' },
      ],
      price: 15000000,
      currency: 'IRR',
      images: ['https://images.unsplash.com/photo-1600166898405-da9535204843?w=800&q=80'],
      tryLink: 'https://homa.app/try?p=kashan-rug&ref=seller',
      createdAt: '2025-01-20T14:30:00Z',
      updatedAt: '2025-01-20T14:30:00Z',
    },
  ]);

  // Calculate dashboard stats from products
  const dashboardStats: DashboardStats = {
    totalProducts: products.length,
    totalViews: 420,
    totalUploads: 77,
    totalPurchases: 30,
    avgCTR: 7.1,
    topProduct: products.length > 0 ? {
      id: products[0].id,
      name: products[0].name,
      views: 240,
    } : undefined,
    recentActivity: [
      {
        id: 'act_001',
        type: 'purchase',
        productName: 'مبل راحتی مدرن',
        timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
      },
      {
        id: 'act_002',
        type: 'upload',
        productName: 'فرش دستباف کاشان',
        timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
      },
      {
        id: 'act_003',
        type: 'view',
        productName: 'مبل راحتی مدرن',
        timestamp: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
      },
    ],
  };

  // Login handler
  const handleLogin = (phone: string, password: string) => {
    // Simple demo login
    if (phone === '09123456789' && password === 'demo123') {
      setIsLoggedIn(true);
      toast.success('خوش آمدید! 👋');
    } else {
      toast.error('شماره تماس یا رمز عبور اشتباه است');
    }
  };

  // Register handler
  const handleRegister = (password: string, name: string, instagram: string, phone: string) => {
    // Simple demo register
    setIsLoggedIn(true);
    toast.success(`${name} عزیز، خوش آمدید! 🎉`);
  };

  // Logout handler
  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentPage('dashboard');
    toast.success('با موفقیت خارج شدید');
  };

  // Product handlers
  const handleAddProduct = () => {
    setEditingProduct(null);
    setIsAddProductModalOpen(true);
  };

  const handleEditProduct = (product: SellerProduct) => {
    setEditingProduct(product);
    setIsAddProductModalOpen(true);
  };

  const handleSaveProduct = (productData: Partial<SellerProduct>) => {
    // Generate Try Link
    const productSlug = productData.name
      ?.replace(/\s+/g, '-')
      .replace(/[^\w\-]/g, '')
      .toLowerCase() || 'product';
    
    const tryLink = `https://homa.app/try?p=${productSlug}&ref=seller`;

    if (editingProduct) {
      // Update existing product
      setProducts(
        products.map((p) =>
          p.id === editingProduct.id
            ? {
                ...p,
                ...productData,
                tryLink,
                updatedAt: new Date().toISOString(),
              }
            : p
        )
      );
      toast.success('محصول به‌روز شد');
    } else {
      // Add new product
      const newProduct: SellerProduct = {
        id: `prod_${Date.now()}`,
        sellerId: seller.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        tryLink,
        ...productData,
        ...productData as SellerProduct // Force cast for now
      } as SellerProduct;
      
      setProducts([...products, newProduct]);
      
      // Show Link Preview Modal
      setLinkPreviewData({
        isOpen: true,
        tryLink,
        productName: productData.name || 'محصول',
      });
    }
    
    setIsAddProductModalOpen(false);
    setEditingProduct(null);
  };

  const handleDeleteProduct = (productId: string) => {
    if (confirm('آیا مطمئن هستید که می‌خواهید این محصول را حذف کنید؟')) {
      setProducts(products.filter((p) => p.id !== productId));
      toast.success('محصول حذف شد');
    }
  };

  const handleUpdateSeller = (data: Partial<Seller>) => {
    // در واقعیت، اینجا به API ارسال می‌شود
    console.log('Update seller:', data);
  };

  // Show login if not logged in
  if (!isLoggedIn) {
    return (
      <div className="bg-white min-h-screen text-black">
        <SellerLogin onLogin={handleLogin} onRegister={handleRegister} />
        <Toaster position="top-center" richColors theme="light" />
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-white text-black"
    >
      {/* Header - Mobile & Desktop */}
      <HomaHeader />
      
      {/* Desktop Sidebar / Mobile Bottom Nav */}
      <div className="flex flex-col md:flex-row">
        {/* Sidebar (Desktop) */}
        <aside
          className="hidden md:block w-64 sticky top-14 h-[calc(100vh-3.5rem)] p-5"
          style={{
            borderLeft: '1px solid rgba(0, 0, 0, 0.1)',
            background: '#ffffff'
          }}
        >
          <div className="mb-8">
            <div 
              className="w-16 h-16 rounded-[20px] flex items-center justify-center mb-4"
              style={{ 
                background: 'var(--jet-black)', 
                border: '1px solid rgba(255, 255, 255, 0.1)' 
              }}
            >
              <span className="text-3xl">🏪</span>
            </div>
            <h2
              className="mb-1 text-black"
              style={{
                fontSize: '16px',
                fontWeight: 'var(--font-weight-bold)'
              }}
            >
              {seller.shopName}
            </h2>
            <p
              className="text-gray-600"
              style={{
                fontSize: '14px',
                fontWeight: 'var(--font-weight-normal)'
              }}
            >
              @{seller.instagram}
            </p>
          </div>
          <SellerNavigation currentPage={currentPage} onNavigate={setCurrentPage} />
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-5 md:p-8">
          <div className="max-w-7xl mx-auto">
            {currentPage === 'dashboard' && (
              <SellerDashboard 
                stats={dashboardStats} 
                seller={seller}
                onAddProduct={handleAddProduct} 
              />
            )}

            {currentPage === 'products' && (
              <ProductsPage
                products={products}
                seller={seller}
                onAddProduct={handleAddProduct}
                onEditProduct={handleEditProduct}
                onDeleteProduct={handleDeleteProduct}
              />
            )}

            {currentPage === 'settings' && (
              <SettingsPage
                seller={seller}
                onUpdate={handleUpdateSeller}
                onLogout={handleLogout}
              />
            )}
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden">
        <SellerNavigation currentPage={currentPage} onNavigate={setCurrentPage} />
      </div>

      {/* Add/Edit Product Modal */}
      <AddEditProductModal
        isOpen={isAddProductModalOpen}
        onClose={() => {
          setIsAddProductModalOpen(false);
          setEditingProduct(null);
        }}
        onSave={handleSaveProduct}
        product={editingProduct}
      />

      {/* Link Preview Modal */}
      <LinkPreviewModal
        isOpen={linkPreviewData.isOpen}
        onClose={() => setLinkPreviewData({ ...linkPreviewData, isOpen: false })}
        tryLink={linkPreviewData.tryLink}
        productName={linkPreviewData.productName}
      />

      {/* Toast Notifications */}
      <Toaster position="top-center" richColors theme="dark" />
    </div>
  );
}

export default App;