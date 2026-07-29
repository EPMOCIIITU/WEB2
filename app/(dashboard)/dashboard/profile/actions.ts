"use server";

import { connectDB } from "@/lib/db";
import Member from "@/models/Member";
import { currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function updateProfile(formData: FormData) {
  const user = await currentUser();
  if (!user) {
    throw new Error("Not authenticated");
  }

  const bio = formData.get("bio") as string;
  const department = formData.get("department") as string;

  await connectDB();
  
  // Find member or create if they don't exist yet in the DB
  const updateData: any = {};
  if (bio !== null) updateData.bio = bio;
  if (department !== null) updateData.department = department;

  await Member.findOneAndUpdate(
    { clerkId: user.id },
    { $set: updateData },
    { upsert: true, new: true }
  );

  revalidatePath("/dashboard/profile");
}
