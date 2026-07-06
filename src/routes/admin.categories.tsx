import { useMemo, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Eye, EyeOff, GripVertical, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useStore } from "@/lib/store";
import { AdminShell } from "@/components/admin/AdminShell";
import { CategoryIcon } from "@/components/storefront/CategoryIcon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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
import type { Category } from "@/lib/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/categories")({
  component: AdminCategories,
  head: () => ({ meta: [{ title: "Categories — Admin" }, { name: "robots", content: "noindex" }] }),
});

const ICONS = ["Smartphone", "Shirt", "Home", "Sparkles", "Dumbbell", "ToyBrick", "Watch", "Headphones", "Camera", "Book", "Gift", "Utensils", "Car", "Heart", "Tag"];

const emptyCategory = (): Category => ({
  id: `c${Date.now()}`,
  name: "",
  slug: "",
  description: "",
  image: "https://picsum.photos/seed/newcat/700/700",
  icon: "Tag",
  hidden: false,
  sort: 999,
});

function AdminCategories() {
  const { categories, products, saveCategory, deleteCategory, reorderCategories } = useStore();
  const [editing, setEditing] = useState<Category | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const dragIndex = useRef<number | null>(null);

  const sorted = useMemo(() => [...categories].sort((a, b) => a.sort - b.sort), [categories]);

  const onDrop = (target: number) => {
    if (dragIndex.current === null || dragIndex.current === target) return;
    const ids = sorted.map((c) => c.id);
    const [moved] = ids.splice(dragIndex.current, 1);
    ids.splice(target, 0, moved);
    reorderCategories(ids);
    dragIndex.current = null;
  };

  return (
    <AdminShell title="Categories" actions={<Button onClick={() => setEditing(emptyCategory())} className="gap-1.5"><Plus size={16} /> Add Category</Button>}>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sorted.map((c, i) => {
          const count = products.filter((p) => p.categoryId === c.id).length;
          return (
            <div
              key={c.id}
              draggable
              onDragStart={() => (dragIndex.current = i)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => onDrop(i)}
              className={cn("overflow-hidden rounded-2xl border bg-card", c.hidden && "opacity-50")}
            >
              <div className="relative aspect-[16/9] bg-muted">
                <img src={c.image} alt={c.name} className="h-full w-full object-cover" />
                <span className="absolute left-2 top-2 flex h-9 w-9 items-center justify-center rounded-lg glass"><GripVertical size={16} className="cursor-grab" /></span>
                <span className="absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-lg bg-brand-gradient text-white"><CategoryIcon name={c.icon} size={18} /></span>
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">{c.name}</h3>
                  <span className="text-xs text-muted-foreground">{count} products</span>
                </div>
                <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">{c.description}</p>
                <div className="mt-3 flex gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => saveCategory({ ...c, hidden: !c.hidden })}>{c.hidden ? <EyeOff size={15} /> : <Eye size={15} />}</Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditing(c)}><Pencil size={15} /></Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeleteId(c.id)}><Trash2 size={15} /></Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {editing && (
        <Dialog open onOpenChange={(o) => !o && setEditing(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>{editing.name ? "Edit Category" : "Add Category"}</DialogTitle></DialogHeader>
            <CategoryForm category={editing} onChange={setEditing} />
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
              <Button
                disabled={!editing.name}
                onClick={() => {
                  const slug = editing.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
                  saveCategory({ ...editing, slug: slug || editing.id });
                  toast.success("Category saved");
                  setEditing(null);
                }}
              >
                Save
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete category?</AlertDialogTitle>
            <AlertDialogDescription>Products in this category will remain but become uncategorized.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => { if (deleteId) { deleteCategory(deleteId); toast.success("Deleted"); } setDeleteId(null); }}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminShell>
  );
}

function CategoryForm({ category, onChange }: { category: Category; onChange: (c: Category) => void }) {
  const set = (patch: Partial<Category>) => onChange({ ...category, ...patch });
  return (
    <div className="space-y-4">
      <div><Label>Name</Label><Input value={category.name} onChange={(e) => set({ name: e.target.value })} className="mt-1" /></div>
      <div><Label>Description</Label><Textarea value={category.description ?? ""} onChange={(e) => set({ description: e.target.value })} rows={2} className="mt-1" /></div>
      <div><Label>Image URL</Label><Input value={category.image} onChange={(e) => set({ image: e.target.value })} className="mt-1" /></div>
      <div>
        <Label>Icon</Label>
        <Select value={category.icon} onValueChange={(v) => set({ icon: v })}>
          <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
          <SelectContent>
            {ICONS.map((ic) => (
              <SelectItem key={ic} value={ic}><span className="flex items-center gap-2"><CategoryIcon name={ic} size={15} /> {ic}</span></SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center justify-between rounded-lg border p-3"><Label>Hidden</Label><Switch checked={category.hidden} onCheckedChange={(v) => set({ hidden: v })} /></div>
    </div>
  );
}
