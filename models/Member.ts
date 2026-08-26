/**
 * models/Member.ts — Member directory schema.
 *
 * INVITE-ONLY ARCHITECTURE NOTES:
 *
 * A Member document can exist in one of three lifecycle states:
 *
 *   1. PENDING   — created by admin; clerkUserId = null, isApproved = false
 *                  No Clerk account exists yet.
 *
 *   2. INVITED   — admin has called /api/members/[id]/approve;
 *                  clerkUserId = "<clerk_user_id>", isApproved = true
 *                  A Clerk invitation email has been sent. The member has
 *                  not yet accepted/signed in for the first time.
 *
 *   3. ACTIVE    — member accepted the invitation and has signed in;
 *                  clerkUserId = "<clerk_user_id>", isApproved = true,
 *                  isActive = true
 *
 * The clerkUserId field is NOW OPTIONAL (sparse unique index) so that
 * pending members can exist without a Clerk account. The field is only
 * populated when an admin approves the member via the approval endpoint,
 * which calls Clerk's backend API to create/invite the user.
 *
 * Legacy compatibility fields (clerkId, email, avatarUrl, role, status)
 * are kept in sync by the pre-validate hook so existing queries continue
 * to work without modification.
 */

import mongoose, { Document, Model, Schema } from "mongoose";

export type MemberDepartment =
  | "Designing"
  | "PR"
  | "Social Media"
  | "Volunteering"
  | "Coverage"
  | "Technical"
  | "Decoration"
  | "Content";

export type MemberBranch = "CSE" | "DS" | "CY" | "IT" | "ECE";
export type MemberYear = 1 | 2 | 3 | 4;
export type MemberDesignation =
  | "president"
  | "vice president"
  | "Treasurer"
  | "Secretary"
  | "Head"
  | "member";

export interface IMember extends Document {
  name: string;
  profilePicture?: string;
  phoneNumber: string;
  instituteEmail: string;
  department: MemberDepartment;
  branch: MemberBranch;
  year: MemberYear;
  designation: MemberDesignation;
  domain: string;
  /**
   * Clerk user ID.  NULL for pending (unapproved) members who have not yet
   * received a Clerk invitation.  Populated atomically when an admin approves
   * the member and Clerk confirms user creation.
   */
  clerkUserId?: string | null;
  joinDate: Date;
  isApproved: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  bio?: string;

  // Legacy compatibility fields — kept in sync by the pre-validate hook.
  clerkId?: string | null;
  email: string;
  avatarUrl?: string;
  role: string;
  status: string;
}

const MEMBER_DEPARTMENTS: MemberDepartment[] = [
  "Designing",
  "PR",
  "Social Media",
  "Volunteering",
  "Coverage",
  "Technical",
  "Decoration",
  "Content",
];

const MEMBER_BRANCHES: MemberBranch[] = ["CSE", "DS", "CY", "IT", "ECE"];
const MEMBER_YEARS: MemberYear[] = [1, 2, 3, 4];
const MEMBER_DESIGNATIONS: MemberDesignation[] = [
  "president",
  "vice president",
  "Treasurer",
  "Secretary",
  "Head",
  "member",
];

const MemberSchema = new Schema<IMember>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    profilePicture: {
      type: String,
      trim: true,
    },
    phoneNumber: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
      unique: true,
      index: true,
    },
    instituteEmail: {
      type: String,
      required: [true, "Institute email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Invalid email format"],
      index: true,
    },
    department: {
      type: String,
      required: [true, "Department is required"],
      enum: MEMBER_DEPARTMENTS,
    },
    branch: {
      type: String,
      required: [true, "Branch is required"],
      enum: MEMBER_BRANCHES,
    },
    year: {
      type: Number,
      required: [true, "Year is required"],
      enum: MEMBER_YEARS,
    },
    designation: {
      type: String,
      required: [true, "Designation is required"],
      enum: MEMBER_DESIGNATIONS,
      default: "member",
      index: true,
    },
    domain: {
      type: String,
      required: [true, "Domain is required"],
      trim: true,
    },
    /**
     * CHANGED from required+unique to optional+sparse+unique.
     *
     * - sparse: true  → allows multiple documents with null/undefined values
     *                    while still enforcing uniqueness among non-null values.
     * - required: false → a pending member can exist without a Clerk account.
     *
     * This field is set ONLY by the server-side approval endpoint after Clerk
     * confirms user creation. It is NEVER trusted from client input.
     */
    clerkUserId: {
      type: String,
      required: false,
      unique: true,
      sparse: true,
      index: true,
      default: null,
    },
    joinDate: {
      type: Date,
      default: Date.now,
    },
    isApproved: {
      type: Boolean,
      default: false,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },

    // ── Legacy compatibility fields ──────────────────────────────────────
    // Kept so that existing queries using clerkId / email / avatarUrl / role
    // / status continue to work without modification.
    clerkId: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
      default: null,
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
      sparse: true,
      index: true,
    },
    avatarUrl: {
      type: String,
      trim: true,
    },
    bio: {
      type: String,
      trim: true,
      maxlength: [500, "Bio cannot exceed 500 characters"],
    },
    role: {
      type: String,
      default: "member",
    },
    status: {
      type: String,
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

MemberSchema.index({ designation: 1, isActive: 1 });
MemberSchema.index({ isApproved: 1, isActive: 1 });
MemberSchema.index({ name: "text", instituteEmail: "text", phoneNumber: "text" });

/**
 * Pre-validate hook: keep legacy fields in sync with canonical fields.
 *
 * This runs before every save/create so that code which reads the legacy
 * `clerkId` or `email` fields always sees consistent data.
 *
 * NOTE: clerkId is only synced when clerkUserId is non-null, so that pending
 * members do not end up with a null clerkId overwriting an explicitly set one.
 */
MemberSchema.pre("validate", function syncLegacyFields(next) {
  // Sync clerkId only when we have a real Clerk user ID
  if (this.clerkUserId && !this.clerkId) {
    this.clerkId = this.clerkUserId;
  }
  this.email = this.email ?? this.instituteEmail;
  this.avatarUrl = this.avatarUrl ?? this.profilePicture;
  this.role = this.role ?? this.designation;
  this.status = this.status ?? (this.isActive ? "active" : "inactive");
  next();
});

const Member: Model<IMember> =
  (mongoose.models.Member as Model<IMember>) ||
  mongoose.model<IMember>("Member", MemberSchema);

export default Member;
