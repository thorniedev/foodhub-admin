"use client";

interface ShopBasicInfoSectionProps {
  name: string;
  onNameChange: (value: string) => void;
  address: string;
  onAddressChange: (value: string) => void;
}

export default function ShopBasicInfoSection({
  name,
  onNameChange,
  address,
  onAddressChange,
}: ShopBasicInfoSectionProps) {
  return (
    <div className="space-y-5">
      <div>
        <label className="text-sm text-gray-600 mb-1 block">
          ឈ្មោះភោជនីយដ្ឋាន <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder="ឧទាហរណ៍: ភោជនីយដ្ឋានរំដេង (Romdeng Restaurant)"
          className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      <div>
        <label className="text-sm text-gray-600 mb-1 block">
          អាសយដ្ឋាន <span className="text-red-500">*</span>
        </label>
        <textarea
          value={address}
          onChange={(e) => onAddressChange(e.target.value)}
          rows={3}
          placeholder="ឧទាហរណ៍: 35, Preah Ang Phanavong St.(240 Corner 55, Phnom Penh 120207 Cambodia,..."
          className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
        />
      </div>
    </div>
  );
}