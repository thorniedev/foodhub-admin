// "use client";

// import { useState } from "react";
// import { useParams, useRouter } from "next/navigation";

// import {
//   useGetUserProfileByUuidQuery,
//   useUpdateUserProfileMutation,
//   useDeleteUserProfileMutation,
//   useToggleProfileActiveMutation,
//   useSetProfileDefaultMutation,
// } from "../../../store/userProfileApi";

// import ProfileHeader from "../../../../components/users/detail/ProfileHeader";
// import BasicInfoSection from "../../../../components/users/detail/BasicInfoSection";
// import AgeGroupSection from "../../../../components/users/detail/AgeGroupSection";
// import AllergiesSection from "../../../../components/users/detail/AllergiesSection";
// import DietarySection from "../../../../components/users/detail/DietarySection";
// import MedicalConditionsSection from "../../../../components/users/detail/MedicalConditionsSection";
// import IngredientAvoidsSection from "../../../../components/users/detail/IngredientAvoidsSection";
// import SystemInfoSection from "../../../../components/users/detail/SystemInfoSection";
// import UserEditModal from "../../../../components/users/UserEditModal";
// import DeleteUserConfirmModal from "../../../../components/users/DeleteUserConfirmModal";

// export default function UserDetailPage() {
//   const params = useParams<{ id: string }>();
//   const router = useRouter();
//   const uuid = params.id;

//   const { data: profile } = useGetUserProfileByUuidQuery(uuid);
//   const [updateUserProfile] = useUpdateUserProfileMutation();
//   const [deleteUserProfile] = useDeleteUserProfileMutation();
//   const [toggleActive] = useToggleProfileActiveMutation();
//   const [setDefault] = useSetProfileDefaultMutation();

//   const [editOpen, setEditOpen] = useState(false);
//   const [deleteOpen, setDeleteOpen] = useState(false);

//   if (!profile) {
//     return <div className="p-6 text-gray-400">រកមិនឃើញប្រវត្តិរូបនេះទេ</div>;
//   }

//   return (
//     <div>
//       <div className="text-sm text-gray-400 mb-4">
//         <button onClick={() => router.push("/users")} className="hover:text-emerald-600">
//           អ្នកប្រើប្រាស់
//         </button>
//         <span className="mx-2">›</span>
//         <span className="text-gray-600">ព័ត៌មានប្រវត្តិរូប</span>
//       </div>

//       <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6 mb-6">
//         <ProfileHeader
//           profile={profile}
//           onBack={() => router.push("/users")}
//           onEdit={() => setEditOpen(true)}
//           onToggleActive={() => toggleActive(profile.uuid)}
//           onSetDefault={() => setDefault(profile.uuid)}
//           onDelete={() => setDeleteOpen(true)}
//         />
//       </div>

//       <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6 space-y-8">
//         <BasicInfoSection profile={profile} />
//         <AgeGroupSection ageGroup={profile.ageGroup} />
//         <AllergiesSection allergies={profile.allergies} />
//         <DietarySection dietaryTypes={profile.dietaryTypes} />
//         <MedicalConditionsSection conditions={profile.medicalConditions} />
//         <IngredientAvoidsSection ingredientAvoids={profile.ingredientAvoids} />
//         <SystemInfoSection profile={profile} />
//       </div>

//       <UserEditModal
//         open={editOpen}
//         initialData={profile}
//         onClose={() => setEditOpen(false)}
//         onSubmit={(uuid, changes) => { updateUserProfile({ uuid, changes }); setEditOpen(false); }}
//       />
//       <DeleteUserConfirmModal
//         open={deleteOpen}
//         profileName={profile.profileName}
//         onCancel={() => setDeleteOpen(false)}
//         onConfirm={async () => {
//           await deleteUserProfile(profile.uuid);
//           router.push("/users");
//         }}
//       />
//     </div>
//   );
// }


import UserDetailManager from "@/src/components/users/UserDetailManager";

interface UserDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function UserDetailPage({
  params,
}: UserDetailPageProps) {
  const { id } = await params;

  return <UserDetailManager userUuid={id} />;
}
