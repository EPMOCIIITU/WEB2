/**
 * scripts/migrate-invite-only.ts
 *
 * Migration script for the INVITE-ONLY / APPROVAL-ONLY authentication change.
 *
 * WHAT THIS SCRIPT DOES (DRY RUN BY DEFAULT — read carefully before running):
 *
 *   1. Reports all existing members and their current state.
 *   2. Identifies members with fake clerkUserId values (manual_* prefix).
 *   3. Identifies members with real Clerk IDs that are already approved.
 *   4. Identifies members that are unapproved or missing a Clerk ID.
 *   5. In --fix mode:
 *      a. Nullifies fake clerkUserId / clerkId values (manual_* prefixed).
 *         These are NOT real Clerk accounts and must be cleaned up.
 *      b. Leaves real Clerk IDs (user_* prefix) alone — existing valid
 *         approved members continue working without interruption.
 *
 * USAGE:
 *   Dry run (safe, no changes):
 *     npx tsx scripts/migrate-invite-only.ts
 *
 *   Apply fixes:
 *     npx tsx scripts/migrate-invite-only.ts --fix
 *
 * ─────────────────────────────────────────────────────────────────────────
 * MIGRATION DECISION TABLE:
 *
 *   clerkUserId           | isApproved | Action
 *   ──────────────────────┼────────────┼──────────────────────────────────
 *   null / undefined      | false      | OK — pending member, no action needed
 *   null / undefined      | true       | ⚠ Inconsistent — clear isApproved
 *                         |            |   OR re-run /approve endpoint
 *   manual_*              | false      | Clear manual ID → null (no real Clerk acct)
 *   manual_*              | true       | Clear manual ID + clear isApproved;
 *                         |            |   admin must re-approve to invite properly
 *   invited_*             | true       | Sentinel from approval endpoint — OK,
 *                         |            |   awaiting invitation acceptance
 *   user_*  (real Clerk)  | true       | ✅ Healthy — leave alone
 *   user_*  (real Clerk)  | false      | ⚠ Has Clerk account but not approved —
 *                         |            |   admin should approve to set isApproved=true
 *                         |            |   (member can't access dashboard until approved)
 * ─────────────────────────────────────────────────────────────────────────
 *
 * Run this once after deploying the invite-only changes.
 */

import mongoose from "mongoose";
import { readFileSync } from "fs";
import path from "path";

// Load .env.local manually (dotenv is not a project dependency)
function loadEnvLocal() {
  try {
    const envPath = path.resolve(process.cwd(), ".env.local");
    const content = readFileSync(envPath, "utf-8");
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eqIndex = trimmed.indexOf("=");
      if (eqIndex === -1) continue;
      const key   = trimmed.slice(0, eqIndex).trim();
      const value = trimmed.slice(eqIndex + 1).trim();
      if (!process.env[key]) process.env[key] = value;
    }
  } catch {
    // .env.local not found — rely on environment variables already set
  }
}
loadEnvLocal();

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error("❌  MONGODB_URI not set in .env.local");
  process.exit(1);
}

const IS_FIX_MODE = process.argv.includes("--fix");

// Minimal schema for migration — we don't import the full model to avoid
// circular dependency issues in the script context.
const MemberSchema = new mongoose.Schema(
  {
    name:          String,
    instituteEmail: String,
    clerkUserId:   { type: String, default: null },
    clerkId:       { type: String, default: null },
    isApproved:    { type: Boolean, default: false },
    isActive:      { type: Boolean, default: true },
  },
  { strict: false, timestamps: true }
);

interface MemberDoc {
  _id:            mongoose.Types.ObjectId;
  name:           string;
  instituteEmail: string;
  clerkUserId?:   string | null;
  clerkId?:       string | null;
  isApproved:     boolean;
  isActive:       boolean;
  save():         Promise<void>;
}

async function run() {
  console.log("\n══════════════════════════════════════════════════");
  console.log("  EPMOC Invite-Only Migration Script");
  console.log(`  Mode: ${IS_FIX_MODE ? "🔧 FIX (changes WILL be applied)" : "🔍 DRY RUN (no changes)"}`);
  console.log("══════════════════════════════════════════════════\n");

  await mongoose.connect(MONGODB_URI as string);
  console.log("✅  Connected to MongoDB\n");

  const Member =
    (mongoose.models.Member as mongoose.Model<MemberDoc>) ||
    mongoose.model<MemberDoc>("Member", MemberSchema);

  const all = await Member.find({}).lean();
  console.log(`Found ${all.length} member records total.\n`);

  // Categorise
  const categories = {
    healthy:           [] as typeof all,
    fakeId:            [] as typeof all,
    sentinelPending:   [] as typeof all,
    realApproved:      [] as typeof all,
    realUnapproved:    [] as typeof all,
    noIdApproved:      [] as typeof all,
    noIdUnapproved:    [] as typeof all,
  };

  for (const m of all) {
    const id = m.clerkUserId ?? null;

    if (id === null || id === undefined || id === "") {
      if (m.isApproved) categories.noIdApproved.push(m);
      else              categories.noIdUnapproved.push(m);
    } else if (id.startsWith("manual_")) {
      categories.fakeId.push(m);
    } else if (id.startsWith("invited_")) {
      categories.sentinelPending.push(m);
    } else if (id.startsWith("user_")) {
      if (m.isApproved) categories.realApproved.push(m);
      else              categories.realUnapproved.push(m);
    } else {
      // Unknown prefix — treat as real
      if (m.isApproved) categories.realApproved.push(m);
      else              categories.realUnapproved.push(m);
    }
  }

  // ── Report ────────────────────────────────────────────────────────────

  console.log("──────────────────────────────────────────────────");
  console.log(`✅  Healthy (real Clerk ID + isApproved=true): ${categories.realApproved.length}`);
  for (const m of categories.realApproved) {
    console.log(`    · ${m.name} <${m.instituteEmail}> [${m.clerkUserId}]`);
  }

  console.log(`\n⏳  Awaiting invitation acceptance (invited_ sentinel): ${categories.sentinelPending.length}`);
  for (const m of categories.sentinelPending) {
    console.log(`    · ${m.name} <${m.instituteEmail}> [${m.clerkUserId}]`);
  }

  console.log(`\n⚠️   Real Clerk ID but isApproved=false: ${categories.realUnapproved.length}`);
  for (const m of categories.realUnapproved) {
    console.log(`    · ${m.name} <${m.instituteEmail}> [${m.clerkUserId}]`);
    console.log(`      → Admin should call POST /api/members/${m._id}/approve to set isApproved=true`);
  }

  console.log(`\n🔴  Fake manual_ IDs (must be cleaned up): ${categories.fakeId.length}`);
  for (const m of categories.fakeId) {
    console.log(`    · ${m.name} <${m.instituteEmail}> [${m.clerkUserId}] isApproved=${m.isApproved}`);
    if (IS_FIX_MODE) {
      console.log(`      → CLEARING clerkUserId, clerkId${m.isApproved ? ", and isApproved" : ""}`);
    } else {
      console.log(`      → In --fix mode: will clear clerkUserId, clerkId${m.isApproved ? ", and isApproved" : ""}`);
    }
  }

  console.log(`\n⚠️   No Clerk ID but isApproved=true (inconsistent): ${categories.noIdApproved.length}`);
  for (const m of categories.noIdApproved) {
    console.log(`    · ${m.name} <${m.instituteEmail}>`);
    console.log(`      → Admin should re-approve via POST /api/members/${m._id}/approve`);
    if (IS_FIX_MODE) {
      console.log(`      → CLEARING isApproved to restore consistency`);
    }
  }

  console.log(`\n✅  Pending (no Clerk ID, not approved): ${categories.noIdUnapproved.length}`);
  for (const m of categories.noIdUnapproved) {
    console.log(`    · ${m.name} <${m.instituteEmail}>`);
    console.log(`      → Ready for admin approval via POST /api/members/${m._id}/approve`);
  }

  console.log("\n──────────────────────────────────────────────────");

  if (!IS_FIX_MODE) {
    console.log("\n🔍  DRY RUN complete — no changes made.");
    console.log("    Re-run with --fix to apply the changes listed above.\n");
    await mongoose.disconnect();
    return;
  }

  // ── Apply fixes ───────────────────────────────────────────────────────

  let fixed = 0;

  // Fix fake IDs
  for (const m of categories.fakeId) {
    await Member.findByIdAndUpdate(m._id, {
      $set: {
        clerkUserId: null,
        clerkId:     null,
        ...(m.isApproved ? { isApproved: false } : {}),
      },
    });
    fixed++;
    console.log(`  Fixed (fake ID cleared): ${m.name} <${m.instituteEmail}>`);
  }

  // Fix inconsistent approved-but-no-clerk-id records
  for (const m of categories.noIdApproved) {
    await Member.findByIdAndUpdate(m._id, {
      $set: { isApproved: false },
    });
    fixed++;
    console.log(`  Fixed (isApproved cleared — no Clerk ID): ${m.name} <${m.instituteEmail}>`);
  }

  console.log(`\n✅  Applied ${fixed} fix(es).`);
  console.log("\nNEXT STEPS:");
  console.log("  1. For members with fake IDs that were approved:");
  console.log("     Admin must re-approve via POST /api/members/[id]/approve");
  console.log("     This will send a proper Clerk invitation email.");
  console.log("  2. For members with real Clerk IDs but isApproved=false:");
  console.log("     Admin must call POST /api/members/[id]/approve to set isApproved=true");
  console.log("     (Their Clerk account already exists — the endpoint will link it).");
  console.log("  3. Pending members with no Clerk ID:");
  console.log("     Admin must call POST /api/members/[id]/approve to send invitations.\n");

  await mongoose.disconnect();
}

run().catch((err) => {
  console.error("❌  Migration failed:", err);
  process.exit(1);
});
