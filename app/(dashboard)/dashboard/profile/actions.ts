"use server";

/**
 * app/(dashboard)/dashboard/profile/actions.ts — Profile Server Actions
 *
 * SECURITY:
 *   - Uses auth() to get the Clerk userId and looks up the member by
 *     clerkUserId. This is the canonical lookup field.
 *   - The legacy clerkId fallback is kept for existing records that
 *     were seeded before the field migration.
 *   - NO upsert: we never create a member record here. Members are only
 *     created by authorized admins via POST /api/members.
 */

import { auth } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/db";
import Member from "@/models/Member";
import { revalidatePath } from "next/cache";

export async function updateProfile(formData: FormData) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Not authenticated");
  }

  const bio        = formData.get("bio") as string | null;
  const department = formData.get("department") as string | null;

  await connectDB();

  const updateData: Record<string, string> = {};
  if (bio        !== null) updateData.bio        = bio;
  if (department !== null) updateData.department = department;

  if (Object.keys(updateData).length === 0) return;

  // Try the canonical field first, then fall back to the legacy clerkId field
  // for records that predate the migration.
  const result = await Member.findOneAndUpdate(
    {
      $or: [
        { clerkUserId: userId },
        { clerkId:     userId },
      ],
    },
    { $set: updateData },
    {
      new:    true,
      upsert: false,  // NEVER create a new member record here
    }
  );

  if (!result) {
    throw new Error("Member record not found — cannot update profile.");
  }

  revalidatePath("/dashboard/profile");
}
