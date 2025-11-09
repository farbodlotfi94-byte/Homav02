/**
 * ProductsTab Component
 * Manages product listing, CRUD operations, and pagination
 */

import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Alert, AlertDescription } from '../ui/alert';
import { Skeleton } from '../ui/skeleton';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye, 
  ChevronLeft, 
  ChevronRight,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import type { AdminProduct, AdminError, ProductFilters, PaginationState } from '../../types/admin';

interface ProductsTabProps {
  onEditProduct: (product: AdminProduct) => void;
  onDeleteProduct: (productId: number) => void;
  onCreateProduct: () => void;
}

export function ProductsTab({ onEditProduct, onDeleteProduct, onCreateProduct }: ProductsTabProps) {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<AdminError | null>(null);
  const [filters, setFilters] = useState<ProductFilters>({
    category: '',
    isPredefined: null,
    search: '',
  });
  
  // Convert empty category to 'all' for Select component
  const categorySelectValue = filters.category || 'all';
  const [pagination, setPagination] = useState<PaginationState>({
    currentPage: 1,
    itemsPerPage: 20,
    totalItems: 0,
  });

  const totalPages = Math.ceil(pagination.totalItems / pagination.itemsPerPage);

  // Load products on component mount and when filters/pagination change
  useEffect(() => {
    loadProducts();
  }, [filters, pagination.currentPage]);

  const loadProducts = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const skip = (pagination.currentPage - 1) * pagination.itemsPerPage;
      const response = await adminService.getProducts(skip, pagination.itemsPerPage);

      if (response.success && response.data) {
        // Handle different response structures
        let productsData: AdminProduct[] = [];
        let totalCount = 0;
        
        if (Array.isArray(response.data)) {
          // If response.data is directly an array of products
          productsData = response.data;
          totalCount = productsData.length;
        } else if (response.data.products && Array.isArray(response.data.products)) {
          // If response.data has a products property
          productsData = response.data.products;
          totalCount = response.data.total || productsData.length;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          // Nested data structure
          productsData = response.data.data;
          totalCount = response.data.total || productsData.length;
        } else {
          // Fallback: try to extract products from the response
          console.warn('[ProductsTab] Unexpected response structure:', response.data);
          productsData = [];
          totalCount = 0;
        }
        
        console.log('[ProductsTab] Loaded products:', {
          count: productsData.length,
          total: totalCount,
          products: productsData,
          rawResponse: response.data
        });
        
        setProducts(productsData);
        setPagination(prev => ({
          ...prev,
          totalItems: totalCount,
        }));

        // If server reports more total items than returned on this page and the
        // total volume is small, automatically expand the page size to fetch all
        // items so the UI list matches the shown total count.
        if (
          totalCount > 0 &&
          totalCount <= 50 &&
          productsData.length < totalCount &&
          pagination.itemsPerPage < totalCount
        ) {
          setPagination(prev => ({
            ...prev,
            currentPage: 1,
            itemsPerPage: totalCount,
          }));
        }
      } else {
        const adminError: AdminError = {
          message: response.error || 'خطا در بارگذاری محصولات',
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

  const handleSearch = (value: string) => {
    setFilters(prev => ({ ...prev, search: value }));
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const handleCategoryFilter = (category: string) => {
    setFilters(prev => ({ ...prev, category: category === 'all' ? '' : category }));
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const handlePredefinedFilter = (value: string) => {
    const isPredefined = value === 'all' ? null : value === 'predefined';
    setFilters(prev => ({ ...prev, isPredefined }));
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPagination(prev => ({ ...prev, currentPage: newPage }));
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fa-IR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getProductImageUrl = (imagePath: string) => {
    return adminService.getProductImageUrl(imagePath);
  };

  const filteredProducts = (products || []).filter(product => {
    const searchTerm = (filters.search || '').toLowerCase();
    const productName = (product.name || '').toLowerCase();
    const productDesc = (product.description || '').toLowerCase();
    const matchesSearch = !searchTerm || 
      productName.includes(searchTerm) ||
      productDesc.includes(searchTerm);
    
    const matchesCategory = !filters.category || product.category === filters.category;
    
    const matchesPredefined = filters.isPredefined === null || 
      (filters.isPredefined ? product.is_predefined === 1 : product.is_predefined === 0);

    return matchesSearch && matchesCategory && matchesPredefined;
  });

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error.message}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900">مدیریت محصولات</h3>
          <p className="text-sm text-gray-600">
            {filteredProducts.length === pagination.totalItems
              ? `${pagination.totalItems} محصول یافت شد`
              : `${filteredProducts.length} از ${pagination.totalItems} محصول نمایش داده شد`}
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-700">جستجو</label>
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="جستجو در نام یا توضیحات..."
                value={filters.search}
                onChange={(e) => handleSearch(e.target.value)}
                className="pr-10 h-9 text-sm"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-700">دسته‌بندی</label>
              <Select value={categorySelectValue} onValueChange={handleCategoryFilter}>
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder="همه دسته‌ها" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">همه دسته‌ها</SelectItem>
                  <SelectItem value="فرش و قالی">فرش و قالی</SelectItem>
                  <SelectItem value="مبلمان">مبلمان</SelectItem>
                  <SelectItem value="دکوراسیون">دکوراسیون</SelectItem>
                  <SelectItem value="روشنایی">روشنایی</SelectItem>
                  <SelectItem value="پارچه">پارچه</SelectItem>
                  <SelectItem value="هنر و دیوارکوب">هنر و دیوارکوب</SelectItem>
                  <SelectItem value="نگهداری">نگهداری</SelectItem>
                  <SelectItem value="سایر">سایر</SelectItem>
                </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-700">نوع محصول</label>
            <Select 
              value={filters.isPredefined === null ? 'all' : filters.isPredefined ? 'predefined' : 'custom'}
              onValueChange={handlePredefinedFilter}
            >
              <SelectTrigger className="h-9 text-sm">
                <SelectValue placeholder="همه انواع" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">همه انواع</SelectItem>
                <SelectItem value="predefined">پیش‌تعریف شده</SelectItem>
                <SelectItem value="custom">سفارشی</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Products Table */}
      <Card>
        {isLoading ? (
          <div className="p-4 space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4 space-x-reverse">
                <Skeleton className="h-12 w-12 rounded" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-8 w-16" />
              </div>
            ))}
          </div>
        ) : (
          <div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>تصویر</TableHead>
                  <TableHead>نام محصول</TableHead>
                  <TableHead>دسته‌بندی</TableHead>
                  <TableHead>قیمت</TableHead>
                  <TableHead>نوع</TableHead>
                  <TableHead>تاریخ ایجاد</TableHead>
                  <TableHead className="text-center">عملیات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
              {filteredProducts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                    هیچ محصولی یافت نشد
                  </TableCell>
                </TableRow>
              ) : (
                filteredProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="w-12 h-12 rounded overflow-hidden bg-gray-100">
                        <img
                          src={getProductImageUrl(product.image_path)}
                          alt={product.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                          }}
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium text-gray-900">{product.name}</div>
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {product.description}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{product.category}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-gray-700">
                      {product.price ? `${product.price.toLocaleString('fa-IR')} ریال` : '-'}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={product.is_predefined === 1 ? "default" : "outline"}
                      >
                        {product.is_predefined === 1 ? 'پیش‌تعریف شده' : 'سفارشی'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {formatDate(product.created_at)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEditProduct(product)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDeleteProduct(product.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">
            صفحه {pagination.currentPage} از {totalPages}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.currentPage - 1)}
              disabled={pagination.currentPage === 1 || isLoading}
            >
              <ChevronRight className="w-4 h-4" />
              قبلی
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.currentPage + 1)}
              disabled={pagination.currentPage === totalPages || isLoading}
            >
              بعدی
              <ChevronLeft className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

