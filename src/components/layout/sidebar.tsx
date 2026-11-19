import { Home, Shirt, Smartphone, Sofa, Trophy, Utensils } from "lucide-react";
import Link from "next/link";

const categories = [
  ["All listings", Home],
  ["Furniture", Sofa],
  ["Electronics", Smartphone],
  ["Clothing", Shirt],
  ["Home & Garden", Utensils],
  ["Sports", Trophy],
] as const;

export function Sidebar() {
  return (
    <aside className="hidden w-56 shrink-0 lg:block">
      <p className="mb-3 px-3 text-xs font-bold uppercase tracking-[.13em] text-slate-400">Browse categories</p>
      <nav className="space-y-1">
        {categories.map(([label, Icon]) => (
          <Link key={label} href={label === "All listings" ? "/" : `/?category=${encodeURIComponent(label)}`} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-600 hover:bg-white hover:text-[#1d72f2]">
            <Icon size={18} /> {label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
