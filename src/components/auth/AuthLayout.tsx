"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import AuthHero from "./AuthHero";
import {
  LeafWatermarkBottom,
  LeafWatermarkTop,
  MoonIcon,
  SunIcon,
} from "./icons";

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Check saved theme or system preference
    const savedTheme = localStorage.getItem("kc-theme");
    if (savedTheme === "dark") {
      setIsDark(true);
      document.documentElement.classList.add("dark");
    } else if (savedTheme === "light") {
      setIsDark(false);
      document.documentElement.classList.remove("dark");
    } else if (
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
    ) {
      setIsDark(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (nextDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("kc-theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("kc-theme", "light");
    }
  };

  return (
    <div
      className={`min-h-screen font-['Noto_Sans_Khmer',-apple-system,BlinkMacSystemFont,sans-serif] ${
        isDark ? "dark bg-[#111827] text-[#f9fafb]" : "bg-[#f4f0e8] text-[#1f2937]"
      }`}
    >
      <div className="flex min-h-screen w-full flex-col min-[960px]:flex-row">
        {/* Left Panel: Orange Hero */}
        <AuthHero />

        {/* Right Panel: Form Panel */}
        <div className="relative flex flex-1 flex-col items-center justify-center p-6 sm:p-10 min-[960px]:flex-[0.9] min-[960px]:min-w-[460px]">
          {/* Organic Curved Left Seam (Desktop Only) */}
          <div
            className={`pointer-events-none absolute -left-[45px] top-0 bottom-0 z-10 hidden w-[90px] rounded-r-[100%] min-[960px]:block transition-colors duration-300 ${
              isDark ? "bg-[#111827]" : "bg-[#f4f0e8]"
            }`}
          />

          {/* Watermarks */}
          <div
            className={`pointer-events-none absolute right-4 top-4 z-0 transition-opacity duration-300 ${
              isDark ? "text-emerald-400 opacity-[0.06]" : "text-[#84cc16] opacity-[0.14]"
            }`}
          >
            <LeafWatermarkTop className="h-28 w-28 sm:h-36 sm:w-36" />
          </div>

          <div
            className={`pointer-events-none absolute bottom-4 right-4 z-0 transition-opacity duration-300 ${
              isDark ? "text-emerald-400 opacity-[0.07]" : "text-[#84cc16] opacity-[0.16]"
            }`}
          >
            <LeafWatermarkBottom className="h-36 w-36 sm:h-48 sm:w-48" />
          </div>

          {/* Top Right Header Controls (Theme Switcher) */}
          <div className="absolute right-6 top-6 z-20 flex items-center gap-3">
            {mounted && (
              <button
                type="button"
                onClick={toggleTheme}
                className={`flex h-10 w-10 items-center justify-center rounded-xl border transition-all hover:scale-105 ${
                  isDark
                    ? "border-gray-700 bg-gray-800 text-yellow-400 hover:border-yellow-400"
                    : "border-[#dcd5c7] bg-white text-gray-600 shadow-sm hover:border-[#84cc16] hover:text-[#4d7c0f]"
                }`}
                title={isDark ? "Switch to light mode" : "Switch to dark mode"}
                aria-label="Toggle theme"
              >
                {isDark ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
              </button>
            )}
          </div>

          {/* Mobile Logo (visible <960px) */}
          <div className="relative z-10 mb-6 flex justify-center min-[960px]:hidden">
            <Image
              src="/assets/logo/mhoubahar.png"
              alt="MhouBahar Logo"
              width={160}
              height={120}
              className="h-[100px] w-auto object-contain drop-shadow-sm"
              priority
            />
          </div>

          {/* Form Content Wrapper */}
          <div className="relative z-10 w-full max-w-[600px] min-[960px]:max-w-[460px]">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
