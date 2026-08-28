"use client";

import { useEffect, useState } from "react";
import { Controller, useForm, useWatch, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog } from "@base-ui/react/dialog";
import { X, Loader2, ChevronDown } from "lucide-react";
import {
  AdminBannerResponse,
  BANNER_CATEGORIES,
  BANNER_CATEGORY_LABELS,
  BannerCategory,
  CreateBannerPayload,
} from "../../../types/banner";
import {
  createBannerSchema,
  updateBannerSchema,
  type UpdateBannerFormValues,
} from "../../../schemas/banner-schema";
import BannerImageUploader from "../BannerImageUploader";
import { resolveBannerFormError } from "../../../lib/bannerFormErrors";
import { compressImage } from "@/src/utils/imageCompression";
import {
  useCreateBannerMutation,
  useUpdateBannerMutation,
} from "../../../app/store/bannerApi";

interface BannerFormModalProps {
  onClose: () => void;
  editing: AdminBannerResponse | null;
  /** Pre-selects the category when creating from a category-scoped tab. */
  defaultCategory?: BannerCategory;
}

/**
 * react-hook-form needs one concrete type for the whole form. `image` is the
 * only field where create/update disagree (required vs optional), so the
 * form uses the looser update shape at the type level — the *strictness*
 * (image required on create) is enforced at runtime by picking
 * createBannerSchema vs updateBannerSchema as the resolver below.
 */
type FormValues = UpdateBannerFormValues;

function defaultValuesFor(
  editing: AdminBannerResponse | null,
  defaultCategory: BannerCategory,
): FormValues {
  if (!editing) {
    return {
      category: defaultCategory,
      title: "",
      location: undefined,
      description: undefined,
      image: undefined,
    };
  }

  return {
    category: editing.category,
    title: editing.title,
    location: editing.location ?? undefined,
    description: editing.description ?? undefined,
    image: undefined,
  };
}

/**
 * Mount this component only while the modal should be visible (e.g.
 * `{isOpen && <BannerFormModal .../>}`). Its defaults are computed once from
 * `editing`/`defaultCategory` at mount time, so the parent unmounting and
 * remounting it is what resets the form.
 */
export default function BannerFormModal({
  onClose,
  editing,
  defaultCategory = "MAIN",
}: BannerFormModalProps) {
  const isEditing = Boolean(editing);
  const [formError, setFormError] = useState<string | null>(null);

  const [createBanner] = useCreateBannerMutation();
  const [updateBanner] = useUpdateBannerMutation();

  const form = useForm<FormValues>({
    // The resolver's strictness (image required vs optional) depends on
    // isEditing; both schemas structurally validate FormValues at runtime.
    resolver: zodResolver(
      isEditing ? updateBannerSchema : createBannerSchema,
    ) as Resolver<FormValues>,
    defaultValues: defaultValuesFor(editing, defaultCategory),
    mode: "onBlur",
  });

  const {
    register,
    control,
    handleSubmit,
    setValue,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = form;

  const category = useWatch({ control, name: "category" });

  useEffect(() => {
    if (category !== "LOCATION") {
      setValue("location", undefined);
      clearErrors("location");
    }
  }, [category, setValue, clearErrors]);

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);

    const payload: CreateBannerPayload = {
      category: values.category,
      title: values.title,
      location:
        values.category === "LOCATION" ? values.location?.trim() || null : null,
      description: values.description?.trim() || null,
    };

    try {
      let imageFile = values.image;
      if (imageFile instanceof File) {
        try {
          imageFile = await compressImage(imageFile, 1);
        } catch {
          // Fallback to original if compression fails
        }
      }

      if (editing) {
        await updateBanner({
          id: editing.id,
          payload,
          image: imageFile ?? null,
        }).unwrap();
      } else {
        await createBanner({
          payload,
          // createBannerSchema guarantees `image` is a File at this point.
          image: imageFile as File,
        }).unwrap();
      }
      onClose();
    } catch (submitError) {
      const { formMessage, fieldErrors } = resolveBannerFormError(submitError);
      setFormError(formMessage);
      for (const [field, message] of Object.entries(fieldErrors)) {
        setError(field as keyof FormValues, { type: "server", message });
      }
    }
  });

  return (
    <Dialog.Root open onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-[150] bg-black/40 backdrop-blur-[2px]" />
        <Dialog.Popup className="fixed inset-0 z-[150] flex items-center justify-center p-4 outline-none">
          <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-[28px] bg-white shadow-2xl">
            <div className="sticky top-0 z-10 flex items-start justify-between border-b border-gray-100 bg-white px-6 py-5">
              <Dialog.Title className="text-3xl font-bold text-[#136C34]">
                {editing ? "កែសម្រួលបែនណឺ" : "បន្ថែមបែនណឺថ្មី"}
              </Dialog.Title>
              <Dialog.Close
                disabled={isSubmitting}
                className="rounded-full p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50"
                aria-label="Close"
              >
                <X size={20} />
              </Dialog.Close>
            </div>

            <form onSubmit={onSubmit} className="space-y-5 p-6" noValidate>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="banner-category"
                    className="mb-2 block text-xl font-semibold text-[#F97316]"
                  >
                    ប្រភេទ (Category)
                  </label>
                  <div className="relative">
                    <select
                      id="banner-category"
                      {...register("category")}
                      aria-invalid={Boolean(errors.category)}
                      aria-describedby={
                        errors.category ? "banner-category-error" : undefined
                      }
                      className="h-12 w-full appearance-none rounded-xl border border-gray-200 bg-gray-50 px-4 pr-10 text-base text-gray-800 outline-none transition focus:border-[#136C34] focus:bg-white focus:ring-2 focus:ring-[#136C34]/10"
                    >
                      {BANNER_CATEGORIES.map((value) => (
                        <option key={value} value={value}>
                          {BANNER_CATEGORY_LABELS[value]} ({value})
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      size={18}
                      className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                  </div>
                  {errors.category && (
                    <p
                      id="banner-category-error"
                      className="mt-1 text-sm text-red-500"
                    >
                      {errors.category.message}
                    </p>
                  )}
                </div>

                {category === "LOCATION" && (
                  <div>
                    <label
                      htmlFor="banner-location"
                      className="mb-2 block text-xl font-semibold text-[#F97316]"
                    >
                      ទីតាំង (Location)
                    </label>
                    <Controller
                      control={control}
                      name="location"
                      render={({ field }) => (
                        <input
                          id="banner-location"
                          ref={field.ref}
                          name={field.name}
                          value={field.value ?? ""}
                          onChange={(e) => field.onChange(e.target.value)}
                          onBlur={field.onBlur}
                          placeholder="Siem Reap"
                          maxLength={100}
                          aria-invalid={Boolean(errors.location)}
                          aria-describedby={
                            errors.location
                              ? "banner-location-error"
                              : undefined
                          }
                          className="h-12 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-base text-gray-800 outline-none transition focus:border-[#136C34] focus:bg-white focus:ring-2 focus:ring-[#136C34]/10"
                        />
                      )}
                    />
                    {errors.location && (
                      <p
                        id="banner-location-error"
                        className="mt-1 text-sm text-red-500"
                      >
                        {errors.location.message}
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label
                  htmlFor="banner-title"
                  className="mb-2 block text-xl font-semibold text-[#F97316]"
                >
                  ចំណងជើង (Title)
                </label>
                <input
                  id="banner-title"
                  {...register("title")}
                  maxLength={255}
                  aria-invalid={Boolean(errors.title)}
                  aria-describedby={
                    errors.title ? "banner-title-error" : undefined
                  }
                  className="h-12 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-base text-gray-800 outline-none transition focus:border-[#136C34] focus:bg-white focus:ring-2 focus:ring-[#136C34]/10"
                />
                {errors.title && (
                  <p
                    id="banner-title-error"
                    className="mt-1 text-sm text-red-500"
                  >
                    {errors.title.message}
                  </p>
                )}
              </div>

              <Controller
                control={control}
                name="image"
                render={({ field }) => (
                  <div>
                    <BannerImageUploader
                      file={(field.value as File | null | undefined) ?? null}
                      existingImageUrl={editing?.imageUrl}
                      onChange={field.onChange}
                      required={!editing}
                    />
                    {errors.image && (
                      <p className="mt-2 text-sm text-red-500 font-medium">
                        {errors.image.message}
                      </p>
                    )}
                  </div>
                )}
              />

              <div>
                <label
                  htmlFor="banner-description"
                  className="mb-2 block text-xl font-semibold text-[#F97316]"
                >
                  ការពិពណ៌នា (Description)
                </label>
                <Controller
                  control={control}
                  name="description"
                  render={({ field }) => (
                    <textarea
                      id="banner-description"
                      rows={4}
                      ref={field.ref}
                      name={field.name}
                      value={field.value ?? ""}
                      onChange={(e) => field.onChange(e.target.value)}
                      onBlur={field.onBlur}
                      aria-invalid={Boolean(errors.description)}
                      aria-describedby={
                        errors.description
                          ? "banner-description-error"
                          : undefined
                      }
                      className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-base text-gray-800 outline-none transition focus:border-[#136C34] focus:bg-white focus:ring-2 focus:ring-[#136C34]/10"
                    />
                  )}
                />
                {errors.description && (
                  <p
                    id="banner-description-error"
                    className="mt-1 text-sm text-red-500"
                  >
                    {errors.description.message}
                  </p>
                )}
              </div>

              {!editing && (
                <p className="text-sm text-gray-400">
                  បែនណឺថ្មីនឹងមិនត្រូវបានបង្ហាញជាសាធារណៈទេ
                  រហូតដល់អ្នកបើកសកម្មភាព &ldquo;បង្ហាញ&rdquo; នៅក្នុងតារាង។
                </p>
              )}

              {formError && (
                <p
                  role="alert"
                  className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600"
                >
                  {formError}
                </p>
              )}

              <div className="flex flex-col-reverse gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={onClose}
                  className="rounded-xl border border-gray-200 px-5 py-2.5 text-lg text-gray-600 transition hover:bg-gray-50 disabled:opacity-50"
                >
                  បោះបង់
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#136C34] px-5 py-2.5 text-lg text-white transition hover:bg-[#0f592b] disabled:opacity-60"
                >
                  {isSubmitting && (
                    <Loader2 size={17} className="animate-spin" />
                  )}
                  {isSubmitting ? "កំពុងរក្សាទុក..." : "រក្សាទុក"}
                </button>
              </div>
            </form>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
