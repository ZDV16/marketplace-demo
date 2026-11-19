"use client";

import { ArrowLeft, Heart, MapPin, MessageCircle, Send } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { getVisitorId, supabase } from "@/lib/supabase";

type ListingDetail = {
  id: string;
  title: string;
  price: number;
  category: string;
  location: string;
  sellerEmail: string;
  image: string;
  description: string;
};

const demoItem: ListingDetail = {
  id: "1",
  title: "Mid-century modern lounge chair",
  price: 180,
  category: "Furniture",
  location: "Downtown Palo Alto",
  sellerEmail: "maya@example.com",
  image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1400&q=85",
  description: "A beautifully preserved lounge chair with warm walnut arms and a comfortable upholstered seat.",
};

export default function ItemPage({ params }: { params: Promise<{ id: string }> }) {
  const [id, setId] = useState("");
  const [item, setItem] = useState<ListingDetail>(demoItem);
  const [buyerEmail, setBuyerEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [favorite, setFavorite] = useState(false);

  useEffect(() => {
    params.then((value) => setId(value.id));
  }, [params]);

  useEffect(() => {
    if (!id) return;
    if (!supabase) {
      setLoading(false);
      return;
    }

    supabase
      .from("listings")
      .select("id,title,price,category,location,seller_email,image_url,description")
      .eq("id", id)
      .maybeSingle()
      .then(({ data, error }) => {
        if (!error && data) {
          setItem({
            id: data.id,
            title: data.title,
            price: Number(data.price),
            category: data.category,
            location: data.location || "Palo Alto, CA",
            sellerEmail: data.seller_email,
            image: data.image_url || demoItem.image,
            description: data.description || "No description provided.",
          });
        }
        setLoading(false);
      });

    supabase
      .from("likes")
      .select("listing_id")
      .eq("listing_id", id)
      .eq("visitor_id", getVisitorId())
      .maybeSingle()
      .then(({ data }) => setFavorite(Boolean(data)));
  }, [id]);

  async function toggleFavorite() {
    if (!supabase) {
      setFavorite((current) => !current);
      return;
    }
    if (favorite) {
      await supabase
        .from("likes")
        .delete()
        .eq("listing_id", id)
        .eq("visitor_id", getVisitorId());
      setFavorite(false);
    } else {
      const { error } = await supabase.from("likes").insert({
        listing_id: id,
        visitor_id: getVisitorId(),
      });
      if (!error) setFavorite(true);
    }
  }

  async function sendMessage(event: FormEvent) {
    event.preventDefault();
    if (!buyerEmail.includes("@") || !message.trim()) {
      setStatus("Enter your email and a message.");
      return;
    }
    if (supabase) {
      const { error } = await supabase.from("messages").insert({
        listing_id: item.id,
        buyer_email: buyerEmail.trim(),
        seller_email: item.sellerEmail,
        message: message.trim(),
      });
      if (error) {
        setStatus(error.message);
        return;
      }
    }

    const subject = encodeURIComponent(`Marketplace inquiry: ${item.title}`);
    const body = encodeURIComponent(
      `Hi,\n\nI'm interested in "${item.title}".\n\n${message.trim()}\n\nMy email: ${buyerEmail.trim()}`,
    );
    window.location.href = `mailto:${item.sellerEmail}?subject=${subject}&body=${body}`;
    setStatus("Email draft opened for the seller.");
    setMessage("");
  }

  if (loading) {
    return <main className="flex min-h-screen items-center justify-center bg-[#f7f8fa]"><p className="text-sm font-semibold text-slate-500">Loading listing...</p></main>;
  }

  return <main className="min-h-screen bg-[#f7f8fa]"><div className="mx-auto max-w-6xl px-5 py-8 lg:py-12">
    <Link href="/" className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-[#1d72f2]"><ArrowLeft size={17} /> Back to listings</Link>
    <div className="grid gap-8 lg:grid-cols-[1.15fr_.85fr]">
      <div className="relative aspect-[1.1] overflow-hidden rounded-3xl bg-slate-200"><Image src={item.image} alt={item.title} fill unoptimized sizes="(max-width: 1024px) 100vw, 55vw" className="object-cover" /></div>
      <div className="rounded-3xl bg-white p-6 shadow-sm sm:p-8">
        <div className="flex items-start justify-between gap-5"><div><p className="text-xs font-bold uppercase tracking-[.13em] text-[#1d72f2]">{item.category}</p><h1 className="mt-3 text-3xl font-bold tracking-[-.04em]">{item.title}</h1></div><button onClick={toggleFavorite} className={`rounded-full border p-3 transition ${favorite ? "border-rose-200 bg-rose-50 text-rose-500" : "border-slate-200 text-slate-500 hover:text-rose-500"}`} aria-label={favorite ? "Unlike listing" : "Like listing"}><Heart size={20} fill={favorite ? "currentColor" : "none"} /></button></div>
        <p className="mt-5 text-3xl font-bold">${item.price.toFixed(2)}</p>
        <p className="mt-5 flex items-center gap-1.5 text-sm text-slate-500"><MapPin size={16} className="text-[#1d72f2]" /> {item.location}</p>
        <div className="my-7 border-t border-slate-100 pt-6"><h2 className="font-bold">About this item</h2><p className="mt-3 text-sm leading-6 text-slate-600">{item.description}</p></div>
        <div className="flex items-center gap-3 border-t border-slate-100 pt-6"><div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#fce4c7] text-sm font-bold text-[#9a5c14]">S</div><div><p className="text-sm font-bold">{item.sellerEmail}</p><p className="text-xs text-slate-500">Seller</p></div></div>
        <form onSubmit={sendMessage} className="mt-6 space-y-3"><label className="block text-sm font-bold">Message seller</label><input type="email" value={buyerEmail} onChange={(event) => setBuyerEmail(event.target.value)} placeholder="Your email" className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-[#1d72f2]" /><div className="flex gap-2"><input value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Is this still available?" className="h-11 min-w-0 flex-1 rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-[#1d72f2]" /><button className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#1d72f2] text-white hover:bg-[#105dcc]" aria-label="Send message"><Send size={17} /></button></div>{status && <p className={`flex items-center gap-1 text-xs font-semibold ${status === "Message sent!" ? "text-emerald-600" : "text-rose-600"}`}><MessageCircle size={13} /> {status}</p>}</form>
      </div>
    </div>
  </div></main>;
}
