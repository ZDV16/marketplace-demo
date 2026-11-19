"use client";

import { ChangeEvent, FormEvent, useState } from "react";
import { ImagePlus, MapPin, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

const categories = ["Vehicles", "Property Rentals", "Apparel", "Classifieds", "Electronics", "Entertainment", "Family", "Free Stuff", "Garden & Outdoor", "Hobbies", "Home Goods", "Home Improvement", "Home Sales", "Musical Instruments", "Office Supplies", "Pet Supplies", "Sporting Goods", "Toys & Games", "Buy and sell groups"];

function SellerHeader() {
  return <header className="border-b border-slate-200 bg-white"><div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5"><Link href="/" className="flex items-center gap-2 text-xl font-bold"><span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1877f2] text-white">F</span> Marketplace</Link><Link href="/" className="text-sm font-semibold text-slate-600 hover:text-[#1877f2]">Browse listings</Link></div></header>;
}

export default function CreateItemPage() {
  const [values, setValues] = useState({ title: "", category: "", price: "", location: "Palo Alto, CA", email: "", description: "" });
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  function update(field: keyof typeof values, value: string) { setValues((current) => ({ ...current, [field]: value })); }
  function handleImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.match(/^image\/(jpeg|png|webp)$/)) return setError("Use a JPEG, PNG, or WebP image.");
    if (file.size > 5 * 1024 * 1024) return setError("Images must be smaller than 5MB.");
    setError("");
    setPhotoFile(file);
    setPreview(URL.createObjectURL(file));
  }
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!values.title.trim() || !values.category || !values.price || !values.email.includes("@")) return setError("Complete the required fields before creating your listing.");
    if (!supabase) return setError("Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.");

    setSaving(true);
    setError("");

    try {
      let imageUrl: string | null = null;
      if (photoFile) {
        const extension = photoFile.name.split(".").pop()?.toLowerCase() || "jpg";
        const path = `${crypto.randomUUID()}.${extension}`;
        const { error: uploadError } = await supabase.storage
          .from("listing-images")
          .upload(path, photoFile, { contentType: photoFile.type, upsert: false });
        if (uploadError) throw uploadError;

        const { data } = supabase.storage.from("listing-images").getPublicUrl(path);
        imageUrl = data.publicUrl;
      }

      const { error: insertError } = await supabase.from("listings").insert({
        title: values.title.trim(),
        description: values.description.trim() || null,
        price: Number(values.price),
        category: values.category,
        seller_email: values.email.trim(),
        image_url: imageUrl,
        location: values.location.trim() || "Palo Alto, CA",
      });
      if (insertError) throw insertError;
      setSubmitted(true);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not create the listing.");
    } finally {
      setSaving(false);
    }
  }

  if (submitted) {
    return (
      <main className="min-h-screen bg-[#f5f6f7]">
        <SellerHeader />
        <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-5">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-2xl text-emerald-600">✓</div>
            <h1 className="mt-5 text-2xl font-bold">Listing created</h1>
            <p className="mt-2 text-sm text-slate-500">Your item is ready for the marketplace.</p>
            <Link href="/" className="mt-6 inline-flex h-11 items-center rounded-lg bg-[#1877f2] px-5 text-sm font-bold text-white hover:bg-[#105dcc]">View marketplace</Link>
          </div>
        </div>
      </main>
    );
  }

  return <><SellerHeader /><main className="min-h-[calc(100vh-4rem)] bg-[#f5f6f7] px-5 py-6 lg:px-8 lg:py-8"><div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1fr_1.2fr]">
    <form onSubmit={submit} className="p-0">
      <div className="mb-7 flex items-center gap-2 text-xl font-bold"><span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1877f2] text-white">F</span> Marketplace</div>
      <div className="space-y-5">
        <div><label className="mb-2 block text-sm font-bold">Photos</label><label className="flex h-36 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 text-center hover:border-[#1877f2]">{preview ? <div className="relative h-full w-full"><Image src={preview} alt="Listing preview" fill unoptimized className="rounded-lg object-cover" /></div> : <><ImagePlus className="text-[#1877f2]" /><p className="mt-2 text-sm font-semibold">Add photos</p><p className="mt-1 text-xs text-slate-400">JPEG, PNG, or WebP (max 5MB)</p></>}<input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleImage} className="sr-only" /></label>{preview && <button type="button" onClick={() => { setPreview(null); setPhotoFile(null); }} className="mt-2 flex items-center gap-1 text-xs font-semibold text-slate-500"><X size={13} /> Remove photo</button>}</div>
        <div><label htmlFor="title" className="mb-2 block text-sm font-bold">Title <span className="text-rose-500">*</span></label><input id="title" value={values.title} onChange={(e) => update("title", e.target.value)} placeholder="What are you selling?" className="h-11 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-[#1877f2] focus:ring-4 focus:ring-blue-100" /></div>
        <div><label htmlFor="category" className="mb-2 block text-sm font-bold">Category <span className="text-rose-500">*</span></label><select id="category" value={values.category} onChange={(e) => update("category", e.target.value)} className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-600 outline-none focus:border-[#1877f2]"><option value="">Select a category</option>{categories.map((category) => <option key={category}>{category}</option>)}</select></div>
        <div className="grid gap-5 sm:grid-cols-2"><div><label htmlFor="price" className="mb-2 block text-sm font-bold">Price <span className="text-rose-500">*</span></label><input id="price" type="number" min="0" value={values.price} onChange={(e) => update("price", e.target.value)} className="h-11 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-[#1877f2]" /></div><div><label htmlFor="location" className="mb-2 block text-sm font-bold">Location</label><input id="location" value={values.location} onChange={(e) => update("location", e.target.value)} placeholder="City, State" className="h-11 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-[#1877f2]" /></div></div>
        <div><label htmlFor="email" className="mb-2 block text-sm font-bold">Contact Email <span className="text-rose-500">*</span></label><input id="email" type="email" value={values.email} onChange={(e) => update("email", e.target.value)} placeholder="your@email.com" className="h-11 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-[#1877f2]" /></div>
        <div><label htmlFor="description" className="mb-2 block text-sm font-bold">Description</label><textarea id="description" value={values.description} onChange={(e) => update("description", e.target.value)} placeholder="Describe your item..." rows={4} className="w-full resize-none rounded-lg border border-slate-300 p-3 text-sm outline-none focus:border-[#1877f2]" /></div>
      </div>
      {error && <p role="alert" className="mt-5 rounded-lg bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700">{error}</p>}
      <button type="submit" disabled={saving} className="mt-6 h-11 w-full rounded-lg bg-[#1877f2] text-sm font-bold text-white hover:bg-[#105dcc] disabled:cursor-not-allowed disabled:opacity-60">{saving ? "Creating listing..." : "Create Listing"}</button>
    </form>
    <section className="hidden lg:block"><h2 className="mb-7 text-3xl font-bold">Preview</h2><div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div className={`relative aspect-[1.7] ${preview ? "bg-slate-100" : "preview-placeholder"}`}>{preview && <Image src={preview} alt="Preview" fill unoptimized className="object-cover" />}</div><div className="p-7"><h2 className="text-2xl font-bold">{values.title || "Title"}</h2><p className="mt-2 text-xl font-bold">{values.price ? `$${values.price}` : "Price"}</p><p className="mt-4 flex items-center gap-1 text-sm text-slate-500"><MapPin size={15} /> Listed just now<br /> in {values.location || "Palo Alto, CA"}</p><p className="mt-4 line-clamp-4 text-sm leading-6 text-slate-600">{values.description}</p><div className="mt-6 border-t border-slate-100 pt-4"><h3 className="font-bold">Seller Information</h3><p className="mt-1 text-sm text-slate-500">{values.email || "seller@email.com"}</p></div></div></div></section>
  </div></main></>;
}
