/**
 * Development-only seed: creates three Clerk test users and matching members.
 * Run: npm run seed
 */
import mongoose from "mongoose";
import path from "path";
import { createClerkClient } from "@clerk/backend";

process.loadEnvFile(path.resolve(process.cwd(), ".env.local"));

const { MONGODB_URI, CLERK_SECRET_KEY } = process.env;
if (!MONGODB_URI || !CLERK_SECRET_KEY) throw new Error("MONGODB_URI and CLERK_SECRET_KEY are required in .env.local");

const TEST_PASSWORD = "EpmocTest@123";

const accounts = [
  {
    email: "president@iiitu.ac.in", firstName: "President", lastName: "Demo", role: "president",
    phoneNumber: "9000000001", department: "Technical", branch: "CSE", year: 4, designation: "president", domain: "Club Management",
  },
  {
    email: "head@iiitu.ac.in", firstName: "Head", lastName: "Demo", role: "core",
    phoneNumber: "9000000002", department: "Technical", branch: "CSE", year: 3, designation: "Head", domain: "Technical Operations",
  },
  {
    email: "member@iiitu.ac.in", firstName: "Member", lastName: "Demo", role: "member",
    phoneNumber: "9000000003", department: "Designing", branch: "ECE", year: 2, designation: "member", domain: "Design and Content",
  },
] as const;

const MemberSchema = new mongoose.Schema({
  name: String, profilePicture: String, phoneNumber: String, instituteEmail: String,
  department: String, branch: String, year: Number, designation: String, domain: String,
  clerkUserId: String, clerkId: String, email: String, avatarUrl: String, role: String,
  joinDate: Date, isApproved: Boolean, isActive: Boolean, status: String, bio: String,
}, { timestamps: true });

async function findOrCreateClerkUser(client: ReturnType<typeof createClerkClient>, account: (typeof accounts)[number]) {
  const existing = await client.users.getUserList({ emailAddress: [account.email], limit: 1 });
  if (existing.data[0]) {
    const user = existing.data[0];
    await client.users.updateUserMetadata(user.id, { publicMetadata: { ...user.publicMetadata, role: account.role } });
    return user.id;
  }
  const user = await client.users.createUser({
    emailAddress: [account.email], password: TEST_PASSWORD, firstName: account.firstName, lastName: account.lastName,
    publicMetadata: { role: account.role }, skipPasswordChecks: true,
  });
  return user.id;
}

async function seed() {
  const clerk = createClerkClient({ secretKey: CLERK_SECRET_KEY });
  const users = await Promise.all(accounts.map(async (account) => ({ account, clerkUserId: await findOrCreateClerkUser(clerk, account) })));
  await mongoose.connect(MONGODB_URI as string);
  const Member = mongoose.models.Member || mongoose.model("Member", MemberSchema);
  await Member.deleteMany({});
  await Member.insertMany(users.map(({ account, clerkUserId }) => ({
    name: `${account.firstName} ${account.lastName}`, profilePicture: "", phoneNumber: account.phoneNumber,
    instituteEmail: account.email, department: account.department, branch: account.branch, year: account.year,
    designation: account.designation, domain: account.domain, clerkUserId, clerkId: clerkUserId,
    email: account.email, role: account.role, joinDate: new Date("2025-01-01"), isApproved: true,
    isActive: true, status: "active", bio: "Dummy development account.",
  })));
  await mongoose.disconnect();
  console.log("Seeded test users:");
  for (const { account } of users) console.log(`  ${account.email} (${account.role})`);
  console.log(`Password for all accounts: ${TEST_PASSWORD}`);
}

seed().catch(async (error) => { console.error(error); await mongoose.disconnect(); process.exit(1); });
