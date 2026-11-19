"use client";

import {
  ArrowRight,
  ChevronDown,
  Heart,
  MapPin,
  Menu,
  MessageCircle,
  Plus,
  Search,
  SlidersHorizontal,
  Sparkles,
  Tag,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getVisitorId, supabase } from "@/lib/supabase";

type Listing = {
  id: string | number;
  title: string;
  price: number;
  category: string;
  location: string;
  time: string;
  image: string;
  seller: string;
  featured?: boolean;
};

type InboxMessage = {
  id: string;
  listing_id: string;
  message: string;
  created_at: string;
  listings: { title: string } | { title: string }[] | null;
};

const categories = [
  { name: "All listings", icon: "✦", color: "blue" },
  { name: "Furniture", icon: "◼", color: "orange" },
  { name: "Electronics", icon: "▣", color: "purple" },
  { name: "Clothing", icon: "◇", color: "pink" },
  { name: "Home & Garden", icon: "⌂", color: "green" },
  { name: "Sports", icon: "✚", color: "teal" },
  { name: "Books", icon: "▤", color: "yellow" },
];

const listings: Listing[] = [
  {
    id: 1,
    title: "Mid-century modern lounge chair",
    price: 180,
    category: "Furniture",
    location: "Downtown Palo Alto",
    time: "2 hours ago",
    image:
      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=900&q=85",
    seller: "Maya R.",
    featured: true,
  },
  {
    id: 2,
    title: "Sony WH-1000XM5 headphones",
    price: 220,
    category: "Electronics",
    location: "Stanford",
    time: "4 hours ago",
    image:
      "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&w=900&q=85",
    seller: "Chris D.",
    featured: true,
  },
  {
    id: 3,
    title: "Handmade ceramic vase set",
    price: 45,
    category: "Home & Garden",
    location: "Old Palo Alto",
    time: "5 hours ago",
    image:
      "https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=900&q=85",
    seller: "Lena K.",
  },
  {
    id: 4,
    title: "Vintage denim jacket",
    price: 65,
    category: "Clothing",
    location: "Barron Park",
    time: "6 hours ago",
    image:
      "https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?auto=format&fit=crop&w=900&q=85",
    seller: "Jordan T.",
  },
  {
    id: 5,
    title: "Beginner road bike · excellent condition",
    price: 390,
    category: "Sports",
    location: "South Palo Alto",
    time: "Yesterday",
    image:
      "https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=900&q=85",
    seller: "Alex P.",
  },
  {
    id: 6,
    title: "The complete design thinking library",
    price: 30,
    category: "Books",
    location: "College Terrace",
    time: "Yesterday",
    image:
      "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=900&q=85",
    seller: "Nina S.",
  },
  {
    id: 7,
    title: "Oak dining table with six chairs",
    price: 550,
    category: "Furniture",
    location: "Crescent Park",
    time: "2 days ago",
    image:
      "https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&w=900&q=85",
    seller: "Sam W.",
  },
  {
    id: 8,
    title: "Polaroid instant camera",
    price: 90,
    category: "Electronics",
    location: "University South",
    time: "2 days ago",
    image:
      "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=900&q=85",
    seller: "Riley J.",
  },
];

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export default function Home() {
  const [activeCategory, setActiveCategory] = useState("All listings");
  const [search, setSearch] = useState("");
  const [favorites, setFavorites] = useState<Array<string | number>>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [displayListings, setDisplayListings] = useState<Listing[]>(listings);
  const [isLoading, setIsLoading] = useState(true);
  const [showMessages, setShowMessages] = useState(false);
  const [messages, setMessages] = useState<InboxMessage[]>([]);

  useEffect(() => {
    const localFavorites = JSON.parse(
      window.localStorage.getItem("marketplace-favorites") || "[]",
    ) as Array<string | number>;
    setFavorites(localFavorites);

    if (!supabase) {
      setIsLoading(false);
      return;
    }

    supabase
      .from("listings")
      .select("id,title,price,category,location,seller_email,image_url,created_at")
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (!error && data) {
          setDisplayListings(
            data.map((listing) => ({
              id: listing.id,
              title: listing.title,
              price: Number(listing.price),
              category: listing.category,
              location: listing.location || "Palo Alto, CA",
              time: "Recently listed",
              image: listing.image_url || "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=900&q=85",
              seller: listing.seller_email,
            })),
          );
        }
        setIsLoading(false);
      });

    supabase
      .from("likes")
      .select("listing_id")
      .eq("visitor_id", getVisitorId())
      .then(({ data }) => {
        if (data) setFavorites(data.map((like) => like.listing_id));
      });

    supabase
      .from("messages")
      .select("id,listing_id,message,created_at,listings(title)")
      .eq("buyer_email", getVisitorId())
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (data) setMessages(data as InboxMessage[]);
      });
  }, []);

  const filteredListings = useMemo(() => {
    const query = search.trim().toLowerCase();
    return displayListings.filter((listing) => {
      const matchesCategory =
        activeCategory === "All listings" || listing.category === activeCategory;
      const matchesSearch =
        !query ||
        `${listing.title} ${listing.category} ${listing.location}`
          .toLowerCase()
          .includes(query);
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, search, displayListings]);

  async function toggleFavorite(id: string | number) {
    const isLiked = favorites.includes(id);
    setFavorites((current) =>
      isLiked
        ? current.filter((favorite) => favorite !== id)
        : [...current, id],
    );

    const nextFavorites = isLiked
      ? favorites.filter((favorite) => favorite !== id)
      : [...favorites, id];
    window.localStorage.setItem(
      "marketplace-favorites",
      JSON.stringify(nextFavorites),
    );

    if (!supabase) return;
    if (isLiked) {
      await supabase
        .from("likes")
        .delete()
        .eq("listing_id", String(id))
        .eq("visitor_id", getVisitorId());
    } else {
      await supabase.from("likes").insert({
        listing_id: String(id),
        visitor_id: getVisitorId(),
      });
    }
  }

  return (
    <main className="min-h-screen bg-[#f7f8fa] text-slate-950">
      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-[72px] max-w-[1440px] items-center gap-5 px-5 lg:px-10">
          <button className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden" aria-label="Open menu">
            <Menu size={22} />
          </button>
          <a href="#" className="flex items-center gap-2.5">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1d72f2] text-white shadow-[0_6px_14px_rgba(29,114,242,.24)]">
              <Tag size={20} strokeWidth={2.5} />
            </span>
            <span className="hidden text-[19px] font-bold tracking-[-.03em] sm:block">
              market<span className="text-[#1d72f2]">place</span>
            </span>
          </a>
          <div className="relative ml-auto w-full max-w-[480px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              aria-label="Search listings"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search for anything..."
              className="h-11 w-full rounded-full border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm outline-none transition focus:border-[#1d72f2] focus:bg-white focus:ring-4 focus:ring-blue-100"
            />
          </div>
          <nav className="hidden items-center gap-1 md:flex">
            <a href="#browse" className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100">Browse</a>
            <a href="#how-it-works" className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100">How it works</a>
          </nav>
          <button onClick={() => setShowMessages(true)} className="relative flex h-10 w-10 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100" aria-label="Open messages">
            <MessageCircle size={20} />
            {messages.length > 0 && <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-[#1d72f2]" />}
          </button>
          <Link href="/create/item" className="flex h-10 shrink-0 items-center gap-2 rounded-full bg-[#1d72f2] px-4 text-sm font-bold text-white shadow-[0_5px_12px_rgba(29,114,242,.2)] transition hover:bg-[#105dcc]">
            <Plus size={17} strokeWidth={2.5} />
            <span className="hidden sm:inline">Sell something</span>
            <span className="sm:hidden" aria-hidden="true">Sell</span>
          </Link>
        </div>
      </header>

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-[1440px] px-5 py-5 lg:px-10 lg:py-7">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-[.13em] text-[#1d72f2]">
                <Sparkles size={14} /> Your local marketplace
              </p>
              <h1 className="text-3xl font-bold tracking-[-.04em] text-slate-950 sm:text-[38px]">Find your next favorite thing.</h1>
              <p className="mt-2 text-sm text-slate-500 sm:text-base">Good stuff from good people, right in your neighborhood.</p>
            </div>
            <div className="hidden items-center gap-2 text-sm text-slate-500 md:flex">
              <MapPin size={16} className="text-[#1d72f2]" /> Palo Alto, CA <ChevronDown size={16} />
            </div>
          </div>
          <div className="mt-7 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
            {categories.map((category) => (
              <button
                key={category.name}
                onClick={() => setActiveCategory(category.name)}
                className={`flex shrink-0 items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-semibold transition ${
                  activeCategory === category.name
                    ? "border-[#1d72f2] bg-[#1d72f2] text-white shadow-sm"
                    : "border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:bg-blue-50 hover:text-[#1d72f2]"
                }`}
              >
                <span className={activeCategory === category.name ? "text-white" : `category-${category.color}`}>{category.icon}</span>
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section id="browse" className="mx-auto max-w-[1440px] px-5 py-7 lg:px-10 lg:py-9">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold tracking-[-.025em] sm:text-2xl">Fresh finds near you</h2>
            <p className="mt-1 text-sm text-slate-500">{filteredListings.length} listings in Palo Alto</p>
          </div>
          <div className="relative">
            <button onClick={() => setShowFilters(!showFilters)} className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-600 hover:border-slate-300">
              <SlidersHorizontal size={16} /> Filters <ChevronDown size={15} />
            </button>
            {showFilters && (
              <div className="absolute right-0 top-12 z-10 w-52 rounded-xl border border-slate-200 bg-white p-3 text-sm shadow-xl">
                <p className="mb-2 px-2 text-xs font-bold uppercase tracking-wider text-slate-400">Sort by</p>
                {["Newest first", "Price: low to high", "Price: high to low"].map((item) => <button key={item} className="block w-full rounded-lg px-2 py-2 text-left text-slate-600 hover:bg-slate-50">{item}</button>)}
              </div>
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 gap-x-5 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" aria-label="Loading listings">
            {[1, 2, 3, 4].map((item) => <div key={item} className="animate-pulse"><div className="aspect-[1.08] rounded-2xl bg-slate-200" /><div className="mt-3 h-4 w-3/4 rounded bg-slate-200" /><div className="mt-2 h-3 w-1/2 rounded bg-slate-200" /></div>)}
          </div>
        ) : filteredListings.length ? (
          <div className="grid grid-cols-1 gap-x-5 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredListings.map((listing) => (
              <article key={listing.id} className="group">
                <div className="relative aspect-[1.08] overflow-hidden rounded-2xl bg-slate-200">
                  <Link href={`/item/${listing.id}`} aria-label={`View ${listing.title}`} className="absolute inset-0">
                    <Image src={listing.image} alt={listing.title} fill unoptimized sizes="(max-width: 640px) 100vw, (max-width: 1280px) 33vw, 25vw" className="object-cover transition duration-500 group-hover:scale-105" />
                  </Link>
                  {listing.featured && <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-bold text-[#1d72f2] shadow-sm backdrop-blur">FEATURED</span>}
                  <button onClick={() => toggleFavorite(listing.id)} className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-slate-500 shadow-sm backdrop-blur transition hover:scale-105 hover:text-rose-500" aria-label={`Favorite ${listing.title}`}>
                    <Heart size={17} fill={favorites.includes(listing.id) ? "currentColor" : "none"} className={favorites.includes(listing.id) ? "text-rose-500" : ""} />
                  </button>
                </div>
                <Link href={`/item/${listing.id}`} className="block pt-3">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="line-clamp-2 text-[15px] font-bold leading-5 text-slate-900">{listing.title}</h3>
                    <p className="shrink-0 text-[15px] font-bold text-slate-900">{money.format(listing.price)}</p>
                  </div>
                  <p className="mt-2 flex items-center gap-1 text-xs text-slate-500"><MapPin size={13} /> {listing.location} <span className="text-slate-300">·</span> {listing.time}</p>
                  <p className="mt-2 text-xs font-semibold text-slate-400">{listing.seller}</p>
                </Link>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-20 text-center">
            <Search className="mx-auto text-slate-300" size={36} />
            <h3 className="mt-4 font-bold">No listings found</h3>
            <p className="mt-1 text-sm text-slate-500">Try another search or category.</p>
          </div>
        )}
      </section>

      <section id="how-it-works" className="mx-auto mb-10 max-w-[1440px] px-5 lg:px-10">
        <div className="flex flex-col items-start justify-between gap-6 rounded-3xl bg-[#eaf2ff] p-7 sm:flex-row sm:items-center sm:p-10">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.13em] text-[#1d72f2]">Clear out. Cash in.</p>
            <h2 className="mt-2 text-2xl font-bold tracking-[-.03em] sm:text-3xl">Have something to sell?</h2>
            <p className="mt-2 max-w-md text-sm leading-6 text-slate-600">Turn things you no longer need into someone else&apos;s next great find.</p>
          </div>
          <Link href="/create/item" className="flex shrink-0 items-center gap-2 rounded-full bg-[#1d72f2] px-5 py-3 text-sm font-bold text-white hover:bg-[#105dcc]">Create a listing <ArrowRight size={17} /></Link>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-3 px-5 py-6 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between lg:px-10">
          <span className="font-bold text-slate-600">marketplace</span>
          <span className="flex items-center gap-1.5"><MessageCircle size={14} /> Built for the neighborhood</span>
          <span>© 2025 Marketplace Demo</span>
        </div>
      </footer>
      {showMessages && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/30" onClick={() => setShowMessages(false)}>
          <aside className="h-full w-full max-w-md bg-white p-6 shadow-2xl" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-center justify-between">
              <div><p className="text-xs font-bold uppercase tracking-[.12em] text-[#1d72f2]">Inbox</p><h2 className="mt-1 text-2xl font-bold">Messages</h2></div>
              <button onClick={() => setShowMessages(false)} className="rounded-full p-2 text-slate-400 hover:bg-slate-100" aria-label="Close messages"><X size={20} /></button>
            </div>
            <div className="mt-6 space-y-3">
              {messages.length ? messages.map((entry) => (
                <Link key={entry.id} href={`/item/${entry.listing_id}`} onClick={() => setShowMessages(false)} className="block rounded-xl border border-slate-200 p-4 hover:border-blue-200 hover:bg-blue-50/30">
                  <p className="text-sm font-bold">{Array.isArray(entry.listings) ? entry.listings[0]?.title : entry.listings?.title || "Listing"}</p>
                  <p className="mt-2 line-clamp-2 text-sm text-slate-600">{entry.message}</p>
                  <p className="mt-2 text-xs text-slate-400">{new Date(entry.created_at).toLocaleString()}</p>
                </Link>
              )) : (
                <div className="rounded-xl border border-dashed border-slate-300 py-12 text-center"><MessageCircle className="mx-auto text-slate-300" size={28} /><p className="mt-3 text-sm font-semibold text-slate-500">No messages yet</p></div>
              )}
            </div>
          </aside>
        </div>
      )}
    </main>
  );
}
