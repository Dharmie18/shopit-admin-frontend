'use client';
import { useEffect, useState } from 'react';
import { apiRequest } from '@/lib/api';
import { Product, Category } from '@/lib/types';
import { money } from '@/lib/utils';
import {
  Package,
  Plus,
  Edit2,
  Trash2,
  AlertTriangle,
  Search,
} from 'lucide-react';
import { Button } from './ui/button';
import { sleep } from '@/lib/utils';
import { Modal } from './ui/modal';
import { Badge } from './ui/badge';
import { Skeleton } from './ui/skeleton';

export function ProductsManager({ onNotify }: { onNotify: (msg: string) => void }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalMode, setModalMode] = useState<'add' | 'edit' | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    product_name: '',
    description: '',
    price: '',
    stock_quantity: '',
    category_id: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [prodData, catData] = await Promise.all([
        apiRequest('/api/products/products.php'),
        apiRequest('/api/categories/categories.php'),
        sleep(600),
      ]);
      setProducts(Array.isArray(prodData) ? prodData : []);
      setCategories(Array.isArray(catData) ? catData : []);
    } catch (err: any) {
      onNotify('Failed to fetch catalog: ' + err.message);
    } finally {
      setLoading(false);
    }
  }

  function openAddModal() {
    setForm({
      product_name: '',
      description: '',
      price: '',
      stock_quantity: '',
      category_id: categories[0]?.category_id ? String(categories[0].category_id) : '1',
    });
    setModalMode('add');
  }

  function openEditModal(prod: Product) {
    setEditingProduct(prod);
    setForm({
      product_name: prod.product_name,
      description: prod.description || '',
      price: String(prod.price),
      stock_quantity: String(prod.stock_quantity),
      category_id: prod.category_id ? String(prod.category_id) : '1',
    });
    setModalMode('edit');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (modalMode === 'add') {
        await apiRequest('/api/admin/product.php', 'POST', {
          product_name: form.product_name,
          description: form.description,
          price: parseFloat(form.price),
          stock_quantity: parseInt(form.stock_quantity, 10),
          category_id: parseInt(form.category_id, 10),
        });
        onNotify('Product created successfully.');
      } else if (modalMode === 'edit' && editingProduct) {
        await apiRequest('/api/admin/product.php/' + editingProduct.product_id, 'PUT', {
          product_name: form.product_name,
          description: form.description,
          price: parseFloat(form.price),
          stock_quantity: parseInt(form.stock_quantity, 10),
        });
        onNotify('Product updated successfully.');
      }
      setModalMode(null);
      loadData();
    } catch (err: any) {
      onNotify('Failed to save product: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function confirmDeleteProduct() {
    if (!productToDelete) return;
    setSubmitting(true);
    try {
      await apiRequest('/api/admin/product.php/' + productToDelete.product_id, 'DELETE');
      onNotify('Product deleted successfully.');
      setProductToDelete(null);
      loadData();
    } catch (err: any) {
      onNotify('Failed to delete product: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  }

  const filteredProducts = products.filter((p) =>
    (p.product_name + ' ' + (p.description || '') + ' ' + (p.category_name || '')).toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col justify-between gap-4 border-b border-[#14212b]/15 pb-6 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#9a4e2c]">
            Inventory & Catalog
          </p>
          <h1 className="mt-2 text-4xl sm:text-5xl font-black uppercase tracking-[-0.08em]">
            Product Management
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 size-4 text-[#14212b]/50" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products..."
              className="w-full sm:w-60 border border-[#14212b]/20 bg-[#f5f5f1] py-2 pl-9 pr-3 text-xs outline-none focus:border-[#9a4e2c]"
            />
          </div>

          <Button onClick={openAddModal} variant="primary" className="flex items-center gap-2">
            <Plus className="size-4" /> Add Product
          </Button>
        </div>
      </div>

      <div className="border border-[#14212b]/15 bg-[#f5f5f1]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[780px] text-left text-sm">
            <thead className="bg-[#e8e8e1] text-[10px] font-black uppercase tracking-[0.14em] text-[#14212b]/60 border-b border-[#14212b]/15">
              <tr>
                <th className="p-4">SKU ID</th>
                <th className="p-4">Product Name</th>
                <th className="p-4">Category</th>
                <th className="p-4">Unit Price</th>
                <th className="p-4">Stock Level</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#14212b]/10">
              {loading ? (
                <>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <tr key={i}>
                      <td className="p-4"><Skeleton className="h-4 w-10" /></td>
                      <td className="p-4"><Skeleton className="h-4 w-40" /></td>
                      <td className="p-4"><Skeleton className="h-4 w-24" /></td>
                      <td className="p-4"><Skeleton className="h-4 w-16" /></td>
                      <td className="p-4"><Skeleton className="h-4 w-16" /></td>
                      <td className="p-4"><Skeleton className="h-6 w-20" /></td>
                      <td className="p-4 text-right flex justify-end gap-2"><Skeleton className="h-8 w-16" /><Skeleton className="h-8 w-16" /></td>
                    </tr>
                  ))}
                </>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-xs text-[#14212b]/60">
                    No products matching "{search}"
                  </td>
                </tr>
              ) : (
                filteredProducts.map((prod) => {
                  const isLow = prod.stock_quantity <= 8;
                  const cat = categories.find((c) => String(c.category_id) === String(prod.category_id));
                  return (
                    <tr key={prod.product_id} className="hover:bg-[#e8e8e1]/40">
                      <td className="p-4 font-bold text-xs text-[#14212b]/60">
                        #{prod.product_id}
                      </td>
                      <td className="p-4 font-black">
                        <div>
                          <p>{prod.product_name}</p>
                          {prod.description && (
                            <p className="text-[11px] text-[#14212b]/50 truncate max-w-xs font-normal">
                              {prod.description}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="p-4 text-xs font-bold text-[#14212b]/70">
                        {prod.category_name || cat?.category_name || 'General'}
                      </td>
                      <td className="p-4 font-black text-sm">{money(prod.price)}</td>
                      <td className="p-4 font-bold text-sm">
                        <span className={isLow ? 'text-[#9a4e2c] font-black' : ''}>
                          {prod.stock_quantity} units
                        </span>
                      </td>
                      <td className="p-4">
                        <Badge variant={isLow ? 'warning' : 'success'}>
                          {isLow ? 'Low Stock' : 'In Stock'}
                        </Badge>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => openEditModal(prod)}
                            className="flex items-center gap-1"
                          >
                            <Edit2 className="size-3" /> Edit
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => setProductToDelete(prod)}
                            className="flex items-center gap-1"
                          >
                            <Trash2 className="size-3" /> Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      <Modal
        isOpen={modalMode !== null}
        onClose={() => setModalMode(null)}
        title={modalMode === 'add' ? 'Add Wholesale Product' : 'Edit Product Details'}
        subtitle="Catalog Specification"
        maxWidth="lg"
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.16em] text-[#14212b]/75 mb-1.5">
                Product Name *
              </label>
              <input
                type="text"
                required
                value={form.product_name}
                onChange={(e) => setForm({ ...form, product_name: e.target.value })}
                placeholder="e.g. Heavy Duty Canvas Tote"
                className="w-full border border-[#14212b]/25 bg-[#f5f5f1] px-4 py-2.5 text-sm outline-none focus:border-[#9a4e2c]"
              />
            </div>

            {modalMode === 'add' && (
              <div>
                <label className="block text-[10px] font-black uppercase tracking-[0.16em] text-[#14212b]/75 mb-1.5">
                  Category *
                </label>
                <select
                  required
                  value={form.category_id}
                  onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                  className="w-full border border-[#14212b]/25 bg-[#f5f5f1] px-4 py-2.5 text-sm outline-none focus:border-[#9a4e2c]"
                >
                  {categories.map((c) => (
                    <option key={c.category_id} value={c.category_id}>
                      {c.category_name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.16em] text-[#14212b]/75 mb-1.5">
                Unit Price (₦ NGN) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                placeholder="18500.00"
                className="w-full border border-[#14212b]/25 bg-[#f5f5f1] px-4 py-2.5 text-sm outline-none focus:border-[#9a4e2c]"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.16em] text-[#14212b]/75 mb-1.5">
                Current Stock Quantity *
              </label>
              <input
                type="number"
                min="0"
                required
                value={form.stock_quantity}
                onChange={(e) => setForm({ ...form, stock_quantity: e.target.value })}
                placeholder="42"
                className="w-full border border-[#14212b]/25 bg-[#f5f5f1] px-4 py-2.5 text-sm outline-none focus:border-[#9a4e2c]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase tracking-[0.16em] text-[#14212b]/75 mb-1.5">
              Description & Specifications
            </label>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Detailed product description, material composition, packaging..."
              className="w-full border border-[#14212b]/25 bg-[#f5f5f1] px-4 py-2.5 text-sm outline-none focus:border-[#9a4e2c]"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#14212b]/15">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setModalMode(null)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              loading={submitting}
              loadingText="Saving..."
            >
              {modalMode === 'add' ? 'Publish Product' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!productToDelete}
        onClose={() => setProductToDelete(null)}
        title="Confirm Product Deletion"
        subtitle="Catalog Archive"
        maxWidth="sm"
      >
        {productToDelete && (
          <div className="flex flex-col gap-5">
            <div className="flex items-start gap-3 bg-[#fee2e2] border border-[#991b1b]/20 p-4 text-xs text-[#991b1b]">
              <AlertTriangle className="size-5 shrink-0" />
              <div>
                <p className="font-black uppercase tracking-wider">Warning</p>
                <p className="mt-1 leading-relaxed">
                  Are you sure you want to delete SKU #{productToDelete.product_id} (
                  <strong>{productToDelete.product_name}</strong>)?
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setProductToDelete(null)}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={confirmDeleteProduct}
                loading={submitting}
                loadingText="Deleting..."
              >
                Confirm Delete
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
