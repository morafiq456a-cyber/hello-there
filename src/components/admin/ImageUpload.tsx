import { useRef, useState } from "react";
import { ImagePlus, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const SIGNED_URL_TTL = 60 * 60 * 24 * 365 * 10; // ~10 years
const MAX_BYTES = 5 * 1024 * 1024;

export async function uploadStoreImage(file: File): Promise<string> {
  if (file.size > MAX_BYTES) throw new Error("Image must be smaller than 5MB");
  if (!file.type.startsWith("image/")) throw new Error("Only image files are allowed");
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from("store-images").upload(path, file, {
    cacheControl: "31536000",
    upsert: false,
  });
  if (error) throw new Error(error.message);
  const { data, error: signErr } = await supabase.storage
    .from("store-images")
    .createSignedUrl(path, SIGNED_URL_TTL);
  if (signErr || !data) throw new Error(signErr?.message ?? "Could not generate image URL");
  return data.signedUrl;
}

/** Single image field: preview + upload button + URL fallback. */
export function ImageUpload({
  value,
  onChange,
  className,
}: {
  value: string;
  onChange: (url: string) => void;
  className?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  const handle = async (file: File | undefined) => {
    if (!file) return;
    setBusy(true);
    try {
      const url = await uploadStoreImage(file);
      onChange(url);
      toast.success("Image uploaded");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center gap-3">
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border bg-muted">
          {value ? (
            <img src={value} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-muted-foreground">
              <ImagePlus size={18} />
            </div>
          )}
        </div>
        <div className="flex flex-1 flex-col gap-2">
          <Button type="button" variant="outline" size="sm" disabled={busy} onClick={() => inputRef.current?.click()}>
            {busy ? <Loader2 className="mr-1.5 animate-spin" size={14} /> : <ImagePlus className="mr-1.5" size={14} />}
            Upload
          </Button>
          <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder="or paste image URL" className="h-8 text-xs" />
        </div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handle(e.target.files?.[0])}
      />
    </div>
  );
}

/** Multiple image gallery field. */
export function MultiImageUpload({ images, onChange }: { images: string[]; onChange: (imgs: string[]) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const list = images.length ? images : [];

  const addFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setBusy(true);
    try {
      const uploaded: string[] = [];
      for (const file of Array.from(files)) uploaded.push(await uploadStoreImage(file));
      onChange([...list.filter(Boolean), ...uploaded]);
      toast.success(`${uploaded.length} image(s) uploaded`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {list.map((im, i) => (
          <div key={i} className="relative h-20 w-20 overflow-hidden rounded-lg border bg-muted">
            <img src={im} alt="" className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => onChange(list.filter((_, xi) => xi !== i))}
              className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white"
            >
              <X size={12} />
            </button>
          </div>
        ))}
        <button
          type="button"
          disabled={busy}
          onClick={() => inputRef.current?.click()}
          className="flex h-20 w-20 flex-col items-center justify-center gap-1 rounded-lg border border-dashed text-muted-foreground hover:bg-accent"
        >
          {busy ? <Loader2 className="animate-spin" size={18} /> : <ImagePlus size={18} />}
          <span className="text-[10px]">Add</span>
        </button>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => addFiles(e.target.files)}
      />
    </div>
  );
}
