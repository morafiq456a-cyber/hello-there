import { createFileRoute, Link } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { toast } from "sonner";
import { useStore } from "@/lib/store";
import { StoreLayout, PageHeader } from "@/components/storefront/StoreLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

const schema = z.object({
  name: z.string().trim().min(2, "Enter your name").max(80),
  email: z.string().trim().email("Enter a valid email").max(120),
  message: z.string().trim().min(10, "Message is too short").max(1000),
});
type FormValues = z.infer<typeof schema>;

export const Route = createFileRoute("/contact")({
  component: ContactPage,
  head: () => ({
    meta: [
      { title: "Contact Us — Nova Store" },
      { name: "description", content: "Get in touch with Nova Store. We're here to help with any questions." },
      { property: "og:title", content: "Contact Nova Store" },
    ],
    links: [{ rel: "canonical", href: "/contact" }],
  }),
});

function ContactPage() {
  const { settings } = useStore();
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = () => {
    toast.success("Message sent! We'll get back to you soon.");
    reset();
  };

  return (
    <StoreLayout>
      <PageHeader title="Contact Us" subtitle="We'd love to hear from you" breadcrumb={<><Link to="/" className="hover:text-brand">Home</Link> / Contact</>} />
      <div className="mx-auto grid max-w-5xl gap-6 px-4 py-8 lg:grid-cols-2">
        <div className="space-y-4">
          {[
            { icon: Phone, label: "Phone", value: settings.phone, href: `tel:${settings.phone}` },
            { icon: MessageCircle, label: "WhatsApp", value: settings.phone, href: `https://wa.me/${settings.whatsapp}` },
            { icon: Mail, label: "Email", value: settings.email, href: `mailto:${settings.email}` },
            { icon: MapPin, label: "Address", value: settings.address },
            { icon: Clock, label: "Business Hours", value: settings.businessHours },
          ].map((c) => (
            <div key={c.label} className="flex items-start gap-3 rounded-2xl border bg-card p-4">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/10 text-brand"><c.icon size={18} /></span>
              <div>
                <p className="text-sm font-semibold">{c.label}</p>
                {c.href ? <a href={c.href} className="text-sm text-muted-foreground hover:text-brand">{c.value}</a> : <p className="text-sm text-muted-foreground">{c.value}</p>}
              </div>
            </div>
          ))}
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 rounded-2xl border bg-card p-6">
          <h3 className="text-lg font-semibold">Send us a message</h3>
          <div>
            <Label htmlFor="name">Name</Label>
            <Input id="name" {...register("name")} className="mt-1" />
            {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name.message}</p>}
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" {...register("email")} className="mt-1" />
            {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email.message}</p>}
          </div>
          <div>
            <Label htmlFor="message">Message</Label>
            <Textarea id="message" {...register("message")} rows={5} className="mt-1" />
            {errors.message && <p className="mt-1 text-xs text-destructive">{errors.message.message}</p>}
          </div>
          <Button type="submit" className="w-full">Send Message</Button>
        </form>
      </div>
    </StoreLayout>
  );
}
