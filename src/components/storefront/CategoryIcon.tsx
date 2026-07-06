import * as Icons from "lucide-react";

export function CategoryIcon({ name, size = 22, className }: { name: string; size?: number; className?: string }) {
  const Comp = (Icons as unknown as Record<string, React.ComponentType<{ size?: number; className?: string }>>)[name] ??
    Icons.Tag;
  return <Comp size={size} className={className} />;
}
