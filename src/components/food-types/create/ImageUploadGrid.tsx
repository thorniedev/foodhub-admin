"use client";

import { useRef } from "react";
import { FolderOpen, ImagePlus, X } from "lucide-react";

interface ImageUploadGridProps {
  images: string[];
  onAdd: (files: FileList) => void;
  onRemove: (index: number) => void;
}

const MAX_IMAGES = 4;

export default function ImageUploadGrid({
  images,
  onAdd,
  onRemove,
}: ImageUploadGridProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const openFilePicker = () => {
    if (images.length < MAX_IMAGES) {
      inputRef.current?.click();
    }
  };

  return (
    <section className="rounded-2xl border border-gray-100 bg-white p-6 sm:p-8">



      <div
        onClick={openFilePicker}
        onDrop={(event) => {
          event.preventDefault();

          if (event.dataTransfer.files.length > 0) {
            onAdd(event.dataTransfer.files);
          }
        }}
        onDragOver={(event) => event.preventDefault()}
        className="cursor-pointer rounded-2xl bg-[#F7F3EC] px-4 py-10 transition-colors hover:bg-[#F2EDE2]"
      >
        <div className="flex flex-col items-center justify-center text-center">
          <div className="mb-4 rounded-2xl bg-white p-4 text-[#136C34] shadow-sm">
            <FolderOpen size={28} />
          </div>

          <p className="mb-1 text-lg font-bold text-gray-800 sm:text-xl">
            ដាក់រូបថតរបស់អ្នកនៅទីនេះ
          </p>

          <p className="text-sm text-gray-400">
            អាចបញ្ចូលបានរហូតដល់ {MAX_IMAGES} រូបភាព
          </p>
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={(event) => {
            if (event.target.files) {
              onAdd(event.target.files);
            }

            event.target.value = "";
          }}
        />

        <div className="mx-auto mt-6 grid w-full max-w-xl grid-cols-2 gap-3 sm:grid-cols-4">
          {Array.from({ length: MAX_IMAGES }, (_, index) => {
            const source = images[index];

            return (
              <div
                key={index}
                className="relative aspect-square overflow-hidden rounded-xl border border-dashed border-gray-300 bg-white"
                onClick={(event) => event.stopPropagation()}
              >
                {source ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={source}
                      alt={`Food upload ${index + 1}`}
                      className="h-full w-full object-cover"
                    />

                    <button
                      type="button"
                      onClick={() => onRemove(index)}
                      className="absolute right-1.5 top-1.5 rounded-full bg-black/55 p-1 text-white hover:bg-black/75"
                      aria-label={`Remove image ${index + 1}`}
                    >
                      <X size={13} />
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={openFilePicker}
                    className="flex h-full w-full flex-col items-center justify-center gap-2 text-gray-400 hover:text-[#136C34]"
                  >
                    <ImagePlus size={22} />
                    <span className="text-xs">បន្ថែមរូប</span>
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-4 space-y-1 text-center">
        <p className="text-sm text-gray-400">
          ទំហំដែលណែនាំ៖ 1200×900px ឬធំជាងនេះ
        </p>
      </div>
    </section>
  );
}
