import mongoose from "mongoose";
import path from "path";

try {
  process.loadEnvFile(path.resolve(process.cwd(), ".env.local"));
} catch {
  console.warn("Could not load .env.local automatically.");
}

const MONGODB_URI = process.env.MONGODB_URI;
const CLERK_SECRET_KEY = process.env.CLERK_SECRET_KEY;
const ARVIND_EMAIL = "chirag.cj555@gmail.com";
const ARVIND_PASSWORD = "ArvindTest@2026!";

if (!MONGODB_URI || !CLERK_SECRET_KEY) {
  console.error("MONGODB_URI and CLERK_SECRET_KEY must be set in .env.local");
  process.exit(1);
}

const MemberSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
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
  const lookup = await fetch(
    `https://api.clerk.com/v1/users?email_address=${encodeURIComponent(ARVIND_EMAIL)}`,
    { headers }
  );

  if (!lookup.ok) throw new Error(`Clerk lookup failed: ${lookup.status} ${await lookup.text()}`);
  const users = (await lookup.json()) as Array<{ id: string }>;
  const existingUser = users[0];

  if (existingUser) {
    const update = await fetch(`https://api.clerk.com/v1/users/${existingUser.id}`, {
      method: "PATCH",
      headers,
      body: JSON.stringify({ password: ARVIND_PASSWORD }),
    });
    if (!update.ok) throw new Error(`Clerk update failed: ${update.status} ${await update.text()}`);

    const metadata = await fetch(`https://api.clerk.com/v1/users/${existingUser.id}/metadata`, {
      method: "PATCH",
      headers,
      body: JSON.stringify({ public_metadata: { role: "member" } }),
    });
    if (!metadata.ok) throw new Error(`Clerk metadata update failed: ${metadata.status} ${await metadata.text()}`);
    return existingUser;
  }

  const create = await fetch("https://api.clerk.com/v1/users", {
    method: "POST",
    headers,
    body: JSON.stringify({
      first_name: "Arvind",
      email_address: [ARVIND_EMAIL],
      password: ARVIND_PASSWORD,
      public_metadata: { role: "member" },
    }),
  });
  if (!create.ok) throw new Error(`Clerk creation failed: ${create.status} ${await create.text()}`);
  return (await create.json()) as { id: string };
}

async function seedArvind() {
  const clerkUser = await getOrCreateClerkUser();
  await mongoose.connect(MONGODB_URI as string);
  const MemberModel = mongoose.models.Member ?? mongoose.model("Member", MemberSchema);

  await MemberModel.findOneAndUpdate(
    { clerkUserId: clerkUser.id },
    {
      name: "Arvind",
      phoneNumber: "9000000002",
      instituteEmail: ARVIND_EMAIL,
      email: ARVIND_EMAIL,
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

  console.log("Arvind test account is ready.");
  console.log(`Login email: ${ARVIND_EMAIL}`);
  console.log(`Password: ${ARVIND_PASSWORD}`);
  console.log("Role: member");
  await mongoose.disconnect();
}

seedArvind().catch((error) => {
  console.error("Arvind seed failed:", error);
  process.exit(1);
});