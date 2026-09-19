'use client';
import { useEffect, useState } from 'react';
import { apiRequest } from '@/lib/api';
import { Category } from '@/lib/types';
import { Layers, Plus, Edit2, Trash2, AlertTriangle } from 'lucide-react';
import { Button } from './ui/button';
import { sleep } from '@/lib/utils';
import { Modal } from './ui/modal';
import { Badge } from './ui/badge';
import { Skeleton } from './ui/skeleton';

export function CategoriesManager({ onNotify }: { onNotify: (msg: string) => void }) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalMode, setModalMode] = useState<'add' | 'edit' | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [form, setForm] = useState({ category_name: '', parent_category_id: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  async function loadCategories() {
    setLoading(true);
    try {
      const [data] = await Promise.all([apiRequest('/api/categories/categories.php'), sleep(600)]);
      setCategories(Array.isArray(data) ? data : []);
    } catch (err: any) {
      onNotify('Failed to fetch categories: ' + err.message);
    } finally {
      setLoading(false);
    }
  }

  function openAddModal() {
    setForm({ category_name: '', parent_category_id: '' });
    setModalMode('add');
  }

  function openEditModal(category: Category) {
    setEditingCategory(category);
    setForm({
      category_name: category.category_name,
      parent_category_id: category.parent_category_id ? String(category.parent_category_id) : '',
    });
    setModalMode('edit');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (modalMode === 'add') {
        await apiRequest('/api/admin/category.php', 'POST', {
          category_name: form.category_name,
          parent_category_id: form.parent_category_id ? parseInt(form.parent_category_id, 10) : null,
        });
        onNotify('Category added successfully.');
      } else if (modalMode === 'edit' && editingCategory) {
        await apiRequest('/api/admin/category.php/' + editingCategory.category_id, 'PUT', {
          category_name: form.category_name,
        });
        onNotify('Category updated successfully.');
      }
      setModalMode(null);
      loadCategories();
    } catch (err: any) {
      onNotify('Error saving category: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function confirmDeleteCategory() {
    if (!categoryToDelete) return;
    setSubmitting(true);
    try {
      await apiRequest('/api/admin/category.php/' + categoryToDelete.category_id, 'DELETE');
      onNotify('Category deleted successfully.');
      setCategoryToDelete(null);
      loadCategories();
    } catch (err: any) {
      onNotify('Error deleting category: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col justify-between gap-4 border-b border-[#14212b]/15 pb-6 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#9a4e2c]">
            Hierarchy & Taxonomy
          </p>
          <h1 className="mt-2 text-4xl sm:text-5xl font-black uppercase tracking-[-0.08em]">
            Category Management
          </h1>
        </div>

        <Button onClick={openAddModal} variant="primary" className="flex items-center gap-2">
          <Plus className="size-4" /> Add New Category
        </Button>
      </div>

      <div className="border border-[#14212b]/15 bg-[#f5f5f1]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[650px] text-left text-sm">
            <thead className="bg-[#e8e8e1] text-[10px] font-black uppercase tracking-[0.14em] text-[#14212b]/60 border-b border-[#14212b]/15">
              <tr>
                <th className="p-4">ID</th>
                <th className="p-4">Category Name</th>
                <th className="p-4">Parent Category</th>
                <th className="p-4">Structure Tier</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#14212b]/10">
              {loading ? (
                <>
                  {[1, 2, 3, 4].map((i) => (
                    <tr key={i}>
                      <td className="p-4"><Skeleton className="h-4 w-6" /></td>
                      <td className="p-4"><Skeleton className="h-4 w-36" /></td>
                      <td className="p-4"><Skeleton className="h-4 w-28" /></td>
                      <td className="p-4"><Skeleton className="h-6 w-20" /></td>
                      <td className="p-4 text-right flex justify-end gap-2"><Skeleton className="h-8 w-16" /><Skeleton className="h-8 w-16" /></td>
                    </tr>
                  ))}
                </>
              ) : categories.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-xs text-[#14212b]/60">
                    No categories defined.
                  </td>
                </tr>
              ) : (
                categories.map((cat) => {
                  const parent = categories.find((p) => p.category_id === cat.parent_category_id);
                  return (
                    <tr key={cat.category_id} className="hover:bg-[#e8e8e1]/40">
                      <td className="p-4 font-bold text-xs text-[#14212b]/60">#{cat.category_id}</td>
                      <td className="p-4 font-black">{cat.category_name}</td>
                      <td className="p-4 text-xs font-bold text-[#14212b]/70">
                        {parent ? parent.category_name : '— (Root Sector)'}
                      </td>
                      <td className="p-4">
                        <Badge variant={cat.parent_category_id ? 'default' : 'info'}>
                          {cat.parent_category_id ? 'Sub-Category' : 'Root Category'}
                        </Badge>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => openEditModal(cat)}
                            className="flex items-center gap-1"
                          >
                            <Edit2 className="size-3" /> Edit
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => setCategoryToDelete(cat)}
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

      {/* Add / Edit Modal */}
      <Modal
        isOpen={modalMode !== null}
        onClose={() => setModalMode(null)}
        title={modalMode === 'add' ? 'Add Category' : 'Edit Category'}
        subtitle="Catalog Taxonomy"
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label className="block text-[10px] font-black uppercase tracking-[0.16em] text-[#14212b]/75 mb-1.5">
              Category Name *
            </label>
            <input
              type="text"
              required
              value={form.category_name}
              onChange={(e) => setForm({ ...form, category_name: e.target.value })}
              placeholder="e.g. Industrial Supplies"
              className="w-full border border-[#14212b]/25 bg-[#f5f5f1] px-4 py-2.5 text-sm outline-none focus:border-[#9a4e2c]"
            />
          </div>

          {modalMode === 'add' && (
            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.16em] text-[#14212b]/75 mb-1.5">
                Parent Category (Optional)
              </label>
              <select
                value={form.parent_category_id}
                onChange={(e) => setForm({ ...form, parent_category_id: e.target.value })}
                className="w-full border border-[#14212b]/25 bg-[#f5f5f1] px-4 py-2.5 text-sm outline-none focus:border-[#9a4e2c]"
              >
                <option value="">None (Top-Level Root Category)</option>
                {categories.map((c) => (
                  <option key={c.category_id} value={c.category_id}>
                    {c.category_name}
                  </option>
                ))}
              </select>
            </div>
          )}

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
              {modalMode === 'add' ? 'Create Category' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!categoryToDelete}
        onClose={() => setCategoryToDelete(null)}
        title="Confirm Category Deletion"
        subtitle="Destructive Action"
        maxWidth="sm"
      >
        {categoryToDelete && (
          <div className="flex flex-col gap-5">
            <div className="flex items-start gap-3 bg-[#fee2e2] border border-[#991b1b]/20 p-4 text-xs text-[#991b1b]">
              <AlertTriangle className="size-5 shrink-0" />
              <div>
                <p className="font-black uppercase tracking-wider">Warning</p>
                <p className="mt-1 leading-relaxed">
                  Are you sure you want to delete category <strong>{categoryToDelete.category_name}</strong>?
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setCategoryToDelete(null)}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={confirmDeleteCategory}
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
