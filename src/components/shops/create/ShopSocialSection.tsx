"use client";

interface ShopSocialSectionProps {
  socialLink: string;
  onSocialLinkChange: (value: string) => void;
}

export default function ShopSocialSection({
  socialLink,
  onSocialLinkChange,
}: ShopSocialSectionProps) {
  return (
    <div>
      <label className="text-sm text-gray-600 mb-1 block">
        ព័ត៌មានសង្គមរបស់ភោជនីយដ្ឋាន
      </label>
      <textarea
        value={socialLink}
        onChange={(e) => onSocialLinkChange(e.target.value)}
        rows={3}
        placeholder="https://www.facebook.com/sharer/sharer.php?u=..."
        className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none font-mono"
      />
    </div>
  );
}