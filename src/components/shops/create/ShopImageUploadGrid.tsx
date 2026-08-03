// "use client";

// import { FolderOpen, X } from "lucide-react";
// import { useRef } from "react";

// interface ShopImageUploadGridProps {
//   images: string[];
//   onAdd: (files: FileList) => void;
//   onRemove: (index: number) => void;
// }

// export default function ShopImageUploadGrid({
//   images,
//   onAdd,
//   onRemove,
// }: ShopImageUploadGridProps) {
//   const inputRef = useRef<HTMLInputElement>(null);

//   return (
//     <div>
//       <label className="text-lg text-gray-600 mb-2 block">
//         ជ្រើសរើសរូបភាពរបស់អ្នក <span className="text-red-500">*</span>
//       </label>

//       <div className="bg-white border border-gray-100 rounded-2xl p-8 text-center">
//         <div className="flex justify-center mb-4">
//           <div className="bg-emerald-600 rounded-xl p-3">
//             <FolderOpen size={28} className="text-white" />
//           </div>
//         </div>
//         <h2 className="text-lg font-bold text-gray-800 mb-4">
//           ដាក់រូបថតរបស់អ្នកនៅទីនេះ
//         </h2>

//         {images.length > 0 && (
//           <div className="grid grid-cols-4 gap-3 max-w-xl mx-auto mb-4">
//             {images.map((src, i) => (
//               <div
//                 key={i}
//                 className="relative aspect-square rounded-lg overflow-hidden bg-gray-100"
//               >
//                 {/* eslint-disable-next-line @next/next/no-img-element */}
//                 <img
//                   src={src}
//                   alt={`upload-${i}`}
//                   className="w-full h-full object-cover"
//                 />
//                 <button
//                   onClick={() => onRemove(i)}
//                   className="absolute top-1 right-1 bg-white/90 rounded-full p-1 text-gray-500 hover:text-red-500"
//                 >
//                   <X size={12} />
//                 </button>
//               </div>
//             ))}
//           </div>
//         )}

//         <input
//           ref={inputRef}
//           type="file"
//           accept="image/*"
//           multiple
//           className="hidden"
//           onChange={(e) => e.target.files && onAdd(e.target.files)}
//         />

//         <p className="text-xs text-gray-400 mb-1">
//           ទំហំដែលណែនាំ: 1200×900px ឬធំជាងនេះ
//         </p>
//         <button
//           onClick={() => inputRef.current?.click()}
//           className="text-sm text-emerald-600 font-medium hover:underline"
//         >
//           ✨ ប្រើរូបភាពគំរូនៃហាងអាហារ
//         </button>
//       </div>
//     </div>
//   );
// }














"use client";

import { useRef } from "react";
import { ImagePlus, X } from "lucide-react";

interface ShopImageUploadGridProps {
  label: string;
  helperText?: string;
  imageUrl: string;
  onChange: (url: string) => void;
}

export default function ShopImageUploadGrid({
  label,
  helperText,
  imageUrl,
  onChange,
}: ShopImageUploadGridProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File | undefined) => {
    if (!file) return;
    const blobUrl = URL.createObjectURL(file);
    onChange(blobUrl);
  };

  return (
    <div>
      <label className="text-sm text-gray-600 mb-1 block">{label}</label>
      {helperText && (
        <p className="text-xs text-gray-400 mb-2">{helperText}</p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFileSelect(e.target.files?.[0])}
      />

      {imageUrl ? (
        <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt={label}
            className="w-full h-full object-cover"
          />
          <button
            onClick={() => onChange("")}
            className="absolute top-2 right-2 bg-white/90 rounded-full p-1.5 text-gray-500 hover:text-red-500"
          >
            <X size={14} />
          </button>
          <button
            onClick={() => inputRef.current?.click()}
            className="absolute bottom-2 right-2 bg-white/90 text-xs font-medium text-gray-700 px-3 py-1.5 rounded-lg hover:bg-white"
          >
            ប្តូររូបភាព
          </button>
        </div>
      ) : (
        <button
          onClick={() => inputRef.current?.click()}
          className="w-full aspect-video rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 flex flex-col items-center justify-center gap-2 hover:bg-gray-100 hover:border-gray-300 transition-colors"
        >
          <ImagePlus size={28} className="text-gray-400" />
          <span className="text-sm text-gray-500">ចុចដើម្បីជ្រើសរើសរូបភាព</span>
          <span className="text-xs text-gray-400">JPG, PNG (ណែនាំ 1200×900px)</span>
        </button>
      )}
    </div>
  );
}