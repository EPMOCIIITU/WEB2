/**
 * models/Member.ts — Member directory schema.
 *
 * The primary shape follows the current UI requirements, while a few legacy
 * fields remain in sync so older dashboard queries keep working during the
 * transition.
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
  clerkUserId: string;
  joinDate: Date;
  isApproved: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  bio?: string;

  // Legacy compatibility fields
  clerkId: string;
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
    clerkUserId: {
      type: String,
      required: [true, "Clerk user ID is required"],
      unique: true,
      index: true,
    },
    joinDate: {
      type: Date,
      default: Date.now,
    },
    isApproved: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },

    // Legacy fields kept in sync for existing queries and reports.
    clerkId: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
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
MemberSchema.index({ name: "text", instituteEmail: "text", phoneNumber: "text" });

MemberSchema.pre("validate", function syncLegacyFields(next) {
  this.clerkId = this.clerkId ?? this.clerkUserId;
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
