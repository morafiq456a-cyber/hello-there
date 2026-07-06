import { useMemo, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Eye,
  EyeOff,
  GripVertical,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { useStore } from "@/lib/store";
import { AdminShell } from "@/components/admin/AdminShell";
import { MultiImageUpload } from "@/components/admin/ImageUpload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCurrency } from "@/lib/currency";
import type { Product } from "@/lib/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/products")({
  component: AdminProducts,
  head: () => ({ meta: [{ title: "Products — Admin" }, { name: "robots", content: "noindex" }] }),
});

const emptyProduct = (): Product => ({
  id: `p${Date.now()}`,
  name: "",
  slug: "",
  description: "",
  specifications: [],
  categoryId: "",
  price: 0,
  oldPrice: undefined,
  images: [""],
  stock: 0,
  sku: "",
  barcode: "",
  weight: 0,
  dimensions: "",
  featured: false,
  isNew: false,
  bestSeller: false,
  hidden: false,
  rating: 4.5,
  reviewsCount: 0,
  sort: 999,
  createdAt: new Date().toISOString(),
});

function AdminProducts() {
  const { products, categories, saveProduct, deleteProduct, reorderProducts, settings } = useStore();
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<Product | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const dragIndex = useRef<number | null>(null);

  const sorted = useMemo(() => [...products].sort((a, b) => a.sort - b.sort), [products]);
  const filtered = sorted.filter((p) => p.name.toLowerCase().includes(query.toLowerCase()) || p.sku.toLowerCase().includes(query.toLowerCase()));

  const onDrop = (targetIndex: number) => {
    if (dragIndex.current === null || dragIndex.current === targetIndex) return;
    const ids = sorted.map((p) => p.id);
    const [moved] = ids.splice(dragIndex.current, 1);
    ids.splice(targetIndex, 0, moved);
    reorderProducts(ids);
    dragIndex.current = null;
  };

  return (
    <AdminShell
      title="Products"
      actions={<Button onClick={() => setEditing(emptyProduct())} className="gap-1.5"><Plus size={16} /> Add Product</Button>}
    >
      <div className="mb-4 relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
        <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search products..." className="pl-9" />
      </div>

      <div className="overflow-x-auto rounded-2xl border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-muted-foreground">
              <th className="p-3 font-medium"></th>
              <th className="p-3 font-medium">Product</th>
              <th className="p-3 font-medium">Category</th>
              <th className="p-3 font-medium">Price</th>
              <th className="p-3 font-medium">Stock</th>
              <th className="p-3 font-medium">Tags</th>
              <th className="p-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p, i) => {
              const cat = categories.find((c) => c.id === p.categoryId);
              return (
                <tr
                  key={p.id}
                  draggable={!query}
                  onDragStart={() => (dragIndex.current = i)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => onDrop(i)}
                  className={cn("border-b last:border-0", p.hidden && "opacity-50")}
                >
                  <td className="p-3 cursor-grab text-muted-foreground"><GripVertical size={16} /></td>
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <img src={p.images[0]} alt={p.name} className="h-10 w-10 rounded-lg object-cover" />
                      <div>
                        <p className="font-medium line-clamp-1">{p.name || "Untitled"}</p>
                        <p className="text-xs text-muted-foreground">{p.sku}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-3 text-muted-foreground">{cat?.name ?? "—"}</td>
                  <td className="p-3">{formatCurrency(p.price, settings.currency)}</td>
                  <td className="p-3"><span className={cn(p.stock <= 5 && "font-semibold text-amber-600", p.stock === 0 && "text-destructive")}>{p.stock}</span></td>
                  <td className="p-3">
                    <div className="flex flex-wrap gap-1">
                      {p.featured && <Badge variant="secondary" className="text-[10px]">Featured</Badge>}
                      {p.isNew && <Badge className="bg-brand-gradient text-[10px] text-white">New</Badge>}
                      {p.bestSeller && <Badge className="bg-amber-500 text-[10px] text-white">Best</Badge>}
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => saveProduct({ ...p, hidden: !p.hidden })} title={p.hidden ? "Show" : "Hide"}>
                        {p.hidden ? <EyeOff size={15} /> : <Eye size={15} />}
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditing(p)}><Pencil size={15} /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeleteId(p.id)}><Trash2 size={15} /></Button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && <tr><td colSpan={7} className="py-10 text-center text-muted-foreground">No products found.</td></tr>}
          </tbody>
        </table>
      </div>

      {editing && (
        <ProductDialog
          product={editing}
          onClose={() => setEditing(null)}
          onSave={(p) => {
            const slug = p.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
            saveProduct({ ...p, slug: slug || p.id, images: p.images.filter(Boolean).length ? p.images.filter(Boolean) : ["https://picsum.photos/seed/new/700/700"] });
            toast.success("Product saved");
            setEditing(null);
          }}
        />
      )}

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete product?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => { if (deleteId) { deleteProduct(deleteId); toast.success("Product deleted"); } setDeleteId(null); }}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminShell>
  );
}

function ProductDialog({ product, onClose, onSave }: { product: Product; onClose: () => void; onSave: (p: Product) => void }) {
  const { categories } = useStore();
  const [form, setForm] = useState<Product>(product);
  const set = (patch: Partial<Product>) => setForm((f) => ({ ...f, ...patch }));

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader><DialogTitle>{product.name ? "Edit Product" : "Add Product"}</DialogTitle></DialogHeader>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label>Name</Label>
            <Input value={form.name} onChange={(e) => set({ name: e.target.value })} className="mt-1" />
          </div>
          <div>
            <Label>Category</Label>
            <Select value={form.categoryId} onValueChange={(v) => set({ categoryId: v })}>
              <SelectTrigger className="mt-1"><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>{categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <Label>SKU</Label>
            <Input value={form.sku} onChange={(e) => set({ sku: e.target.value })} className="mt-1" />
          </div>
          <div>
            <Label>Price (EGP)</Label>
            <Input type="number" value={form.price} onChange={(e) => set({ price: +e.target.value })} className="mt-1" />
          </div>
          <div>
            <Label>Old Price (optional)</Label>
            <Input type="number" value={form.oldPrice ?? ""} onChange={(e) => set({ oldPrice: e.target.value ? +e.target.value : undefined })} className="mt-1" />
          </div>
          <div>
            <Label>Stock</Label>
            <Input type="number" value={form.stock} onChange={(e) => set({ stock: +e.target.value })} className="mt-1" />
          </div>
          <div>
            <Label>Barcode</Label>
            <Input value={form.barcode ?? ""} onChange={(e) => set({ barcode: e.target.value })} className="mt-1" />
          </div>
          <div>
            <Label>Weight (kg)</Label>
            <Input type="number" value={form.weight ?? 0} onChange={(e) => set({ weight: +e.target.value })} className="mt-1" />
          </div>
          <div>
            <Label>Dimensions</Label>
            <Input value={form.dimensions ?? ""} onChange={(e) => set({ dimensions: e.target.value })} className="mt-1" />
          </div>
          <div className="sm:col-span-2">
            <Label>Description</Label>
            <Textarea value={form.description} onChange={(e) => set({ description: e.target.value })} rows={3} className="mt-1" />
          </div>
          <div className="sm:col-span-2">
            <Label>Image URLs</Label>
            <div className="mt-1 space-y-2">
              {form.images.map((im, i) => (
                <div key={i} className="flex gap-2">
                  <Input value={im} onChange={(e) => set({ images: form.images.map((x, xi) => (xi === i ? e.target.value : x)) })} placeholder="https://..." />
                  <Button variant="ghost" size="icon" onClick={() => set({ images: form.images.filter((_, xi) => xi !== i) })}><X size={15} /></Button>
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={() => set({ images: [...form.images, ""] })}>Add image</Button>
            </div>
          </div>
          <div className="flex items-center justify-between rounded-lg border p-3"><Label>Featured</Label><Switch checked={form.featured} onCheckedChange={(v) => set({ featured: v })} /></div>
          <div className="flex items-center justify-between rounded-lg border p-3"><Label>New Arrival</Label><Switch checked={form.isNew} onCheckedChange={(v) => set({ isNew: v })} /></div>
          <div className="flex items-center justify-between rounded-lg border p-3"><Label>Best Seller</Label><Switch checked={form.bestSeller} onCheckedChange={(v) => set({ bestSeller: v })} /></div>
          <div className="flex items-center justify-between rounded-lg border p-3"><Label>Hidden</Label><Switch checked={form.hidden} onCheckedChange={(v) => set({ hidden: v })} /></div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => onSave(form)} disabled={!form.name || !form.categoryId}>Save Product</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
