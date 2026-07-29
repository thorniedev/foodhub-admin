import "./globals.css";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Sidebar from "../components/layout/Sidebar";
import Topbar from "../components/layout/Topbar";
import Providers from "./store/Providers";
// import Providers from "../store/Providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FoodHub Admin",
  description: "FoodHub admin dashboard",
};

export default function RootLayout({
  children,
  stats,
  growth,
  status,
  orders,
}: Readonly<{
  children: React.ReactNode;
  stats: React.ReactNode;
  growth: React.ReactNode;
  status: React.ReactNode;
  orders: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="h-full overflow-hidden antialiased">
        <Providers>
          <div className="h-screen w-full overflow-hidden bg-gray-50 flex">
            <div className="h-screen shrink-0">
              <Sidebar />
            </div>

            <div className="flex-1 h-screen flex flex-col overflow-hidden">
              <Topbar />

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {stats}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                  <div className="lg:col-span-2">{growth}</div>
                  {status}
                </div>

                {orders}
                {children}
              </div>
            </div>
          </div>
        </Providers>
      </body>
    </html>
  );
}