import React from "react";
import Image from "next/image";
import { BoltIcon, SaladBowlIcon } from "./icons";

export default function AuthHero() {
  return (
    <div className="relative hidden flex-[1.1] flex-col items-center justify-between overflow-hidden bg-gradient-to-br from-[#ec9a35] to-[#e0821c] p-8 min-[960px]:flex select-none">
      {/* Decorative Scattered Lightning Bolts */}
      <div className="pointer-events-none absolute left-[15%] top-[12%] text-amber-200/40 transform -rotate-12">
        <BoltIcon className="h-8 w-8" />
      </div>
      <div className="pointer-events-none absolute right-[20%] top-[25%] text-amber-100/35 transform rotate-45">
        <BoltIcon className="h-6 w-6" />
      </div>
      <div className="pointer-events-none absolute left-[28%] bottom-[32%] text-amber-200/30 transform rotate-12">
        <BoltIcon className="h-7 w-7" />
      </div>
      <div className="pointer-events-none absolute right-[14%] bottom-[18%] text-amber-100/40 transform -rotate-45">
        <BoltIcon className="h-9 w-9" />
      </div>
      <div className="pointer-events-none absolute left-[8%] top-[65%] text-amber-200/25 transform rotate-90">
        <BoltIcon className="h-6 w-6" />
      </div>

      {/* Top Center Brand Logo */}
      <div className="relative z-10 pt-4">
        <Image
          src="/assets/logo/mhoubahar.png"
          alt="MhouBahar Logo"
          width={180}
          height={150}
          className="h-[140px] w-auto object-contain drop-shadow-md"
          priority
        />
      </div>

      {/* Center Faint Food Line-Art SVG */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[#b7590f] opacity-40">
        <SaladBowlIcon className="h-[360px] w-[360px]" />
      </div>

      {/* Left Dark Band with Stacked Circular Food Images */}
      <div className="absolute left-[36px] top-0 bottom-0 z-10 flex w-[210px] flex-col items-center justify-around py-12">
        {/* Dark translucent vertical backdrop column */}
        <div className="absolute inset-0 rounded-3xl bg-black/20 backdrop-blur-[1px]" />

        {/* 1. Top Circular Food Image */}
        <div className="relative z-20 h-[220px] w-[220px] overflow-hidden rounded-full border-[6px] border-white shadow-2xl transition hover:scale-105">
          <Image
            src="/Image/food/food1.png"
            alt="Food item 1"
            fill
            className="object-cover"
            priority
          />
        </div>

        {/* 2. Middle Circular Food Image */}
        <div className="relative z-20 h-[175px] w-[175px] overflow-hidden rounded-full border-[5px] border-white shadow-xl transition hover:scale-105">
          <Image
            src="/Image/food/food2.png"
            alt="Food item 2"
            fill
            className="object-cover"
          />
        </div>

        {/* 3. Bottom Circular Food Image */}
        <div className="relative z-20 h-[145px] w-[145px] overflow-hidden rounded-full border-[5px] border-white shadow-lg transition hover:scale-105">
          <Image
            src="/Image/food/food3.png"
            alt="Food item 3"
            fill
            className="object-cover"
          />
        </div>
      </div>

      {/* Bottom Hero Tagline */}
      <div className="relative z-10 text-center text-white/90">
        <p className="font-['Noto_Sans_Khmer'] text-lg font-bold drop-shadow-sm">
          រសជាតិខ្មែរពិតៗ ស្រស់ៗជារៀងរាល់ថ្ងៃ
        </p>
        <p className="text-xs uppercase tracking-widest text-white/70">
          Authentic Taste & Quality Deliveries
        </p>
      </div>
    </div>
  );
}
