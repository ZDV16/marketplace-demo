"use client";

import { Menu, Plus, Search, Tag } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export function Header() {
  const [search, setSearch] = useState("");

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-[72px] max-w-[1440px] items-center gap-5 px-5 lg:px-10">
        <button className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden" aria-label="Open menu"><Menu size={22} /></button>
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1d72f2] text-white"><Tag size={20} /></span>
          <span className="hidden text-[19px] font-bold tracking-[-.03em] sm:block">market<span className="text-[#1d72f2]">place</span></span>
        </Link>
        <div className="relative ml-auto w-full max-w-[480px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search for anything..." className="h-11 w-full rounded-full border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm outline-none focus:border-[#1d72f2] focus:bg-white focus:ring-4 focus:ring-blue-100" />
        </div>
        <nav className="hidden items-center gap-1 md:flex"><Link href="/" className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100">Browse</Link></nav>
        <Link href="/create/item" className="flex h-10 shrink-0 items-center gap-2 rounded-full bg-[#1d72f2] px-4 text-sm font-bold text-white hover:bg-[#105dcc]"><Plus size={17} /><span className="hidden sm:inline">Sell something</span><span className="sm:hidden" aria-hidden="true">Sell</span></Link>
      </div>
    </header>
  );
}
