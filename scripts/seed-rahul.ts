import mongoose from "mongoose";
import path from "path";

try {
  process.loadEnvFile(path.resolve(process.cwd(), ".env.local"));
} catch {
  console.warn("Could not load .env.local automatically.");
}

const MONGODB_URI = process.env.MONGODB_URI;
const CLERK_SECRET_KEY = process.env.CLERK_SECRET_KEY;
const RAHUL_EMAIL = "rahul.testing@example.com";
const RAHUL_PASSWORD = "RahulTest@2026!";

if (!MONGODB_URI || !CLERK_SECRET_KEY) {
  console.error("MONGODB_URI and CLERK_SECRET_KEY must be set in .env.local");
  process.exit(1);
}

const MemberSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    profilePicture: String,
    phoneNumber: { type: String, required: true, unique: true },
    instituteEmail: { type: String, required: true, unique: true, lowercase: true },
    department: { type: String, required: true },
    branch: { type: String, required: true },
    year: { type: Number, required: true },
    designation: { type: String, required: true },
    domain: { type: String, required: true },
    clerkUserId: { type: String, required: true, unique: true },
    joinDate: { type: Date, default: Date.now },
    isApproved: { type: Boolean, default: true },
    isActive: { type: Boolean, default: true },
    clerkId: { type: String, unique: true, sparse: true },
    email: { type: String, lowercase: true },
    avatarUrl: String,
    role: { type: String, default: "member" },
    status: { type: String, default: "active" },
  },
  { timestamps: true }
);

async function getOrCreateClerkUser() {
  const headers = {
    Authorization: `Bearer ${CLERK_SECRET_KEY}`,
    "Content-Type": "application/json",
  };
  const existingResponse = await fetch(
    `https://api.clerk.com/v1/users?email_address=${encodeURIComponent(RAHUL_EMAIL)}`,
    { headers }
  );

  if (!existingResponse.ok) {
    throw new Error(`Clerk lookup failed: ${existingResponse.status} ${await existingResponse.text()}`);
  }

  const existingUsers = (await existingResponse.json()) as Array<{ id: string }>;
  if (existingUsers[0]) {
    const updateResponse = await fetch(`https://api.clerk.com/v1/users/${existingUsers[0].id}`, {
      method: "PATCH",
      headers,
      body: JSON.stringify({
        password: RAHUL_PASSWORD,
      }),
    });

    if (!updateResponse.ok) {
      throw new Error(`Clerk test user update failed: ${updateResponse.status} ${await updateResponse.text()}`);
    }

    const metadataResponse = await fetch(`https://api.clerk.com/v1/users/${existingUsers[0].id}/metadata`, {
      method: "PATCH",
      headers,
      body: JSON.stringify({ public_metadata: { role: "member" } }),
    });

    if (!metadataResponse.ok) {
      throw new Error(`Clerk test user metadata update failed: ${metadataResponse.status} ${await metadataResponse.text()}`);
    }

    return existingUsers[0];
  }

  const createResponse = await fetch("https://api.clerk.com/v1/users", {
    method: "POST",
    headers,
    body: JSON.stringify({
      first_name: "Rahul",
      last_name: "Test",
      email_address: [RAHUL_EMAIL],
      password: RAHUL_PASSWORD,
      public_metadata: { role: "member" },
    }),
  });

  if (!createResponse.ok) {
    throw new Error(`Clerk user creation failed: ${createResponse.status} ${await createResponse.text()}`);
  }

  return (await createResponse.json()) as { id: string };
}

async function seedRahul() {
  const clerkUser = await getOrCreateClerkUser();
  await mongoose.connect(MONGODB_URI as string);

  const MemberModel = mongoose.models.Member ?? mongoose.model("Member", MemberSchema);
  await MemberModel.findOneAndUpdate(
    { clerkUserId: clerkUser.id },
    {
      name: "Rahul",
      phoneNumber: "9000000001",
      instituteEmail: RAHUL_EMAIL,
      email: RAHUL_EMAIL,
      department: "Technical",
      branch: "CSE",
      year: 3,
      designation: "member",
      domain: "Testing",
      clerkUserId: clerkUser.id,
      clerkId: clerkUser.id,
      role: "member",
      status: "active",
      isApproved: true,
      isActive: true,
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  console.log("Rahul test account is ready.");
  console.log(`Login email: ${RAHUL_EMAIL}`);
  console.log(`Password: ${RAHUL_PASSWORD}`);
  console.log("Role: member");
  await mongoose.disconnect();
}

seedRahul().catch((error) => {
  console.error("Rahul seed failed:", error);
  process.exit(1);
});