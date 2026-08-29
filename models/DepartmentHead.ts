/**
 * models/DepartmentHead.ts
 *
 * Tracks which member is the head of each department.
 *
 * DESIGN DECISIONS
 * ─────────────────
 * • Department is stored as a plain string (not an ObjectId ref) so that
 *   adding a new department never requires a schema migration — just start
 *   creating assignments for the new string value.
 *
 * • The compound unique index on (department, member) prevents the same
 *   person being recorded as head of the same department twice.
 *
 * • There is NO unique index on department alone, meaning multiple people
 *   can co-head a department (e.g. a departing head + incoming head during
 *   a transition). The application layer controls whether that is allowed.
 *
 * • member is a ref to Member so that `.populate("member")` works out of
 *   the box for rich lookups.
 *
 * RELATIONSHIPS
 * ─────────────
 *   DepartmentHead.department  →  free-form string (matches MemberDepartment)
 *   DepartmentHead.member      →  ObjectId → Member._id
 *
 * QUERIES
 * ───────
 *   // Heads of a specific department
 *   DepartmentHead.find({ department: "Technical" }).populate("member")
 *
 *   // All departments a member heads
 *   DepartmentHead.find({ member: memberId })
 *
 *   // Full map of all department → head(s)
 *   DepartmentHead.find({}).populate("member", "name profilePicture avatarUrl")
 */

import mongoose, { Document, Model, Schema, Types } from "mongoose";

export interface IDepartmentHead extends Document {
  department: string;            // e.g. "Technical", "Designing"
  member:     Types.ObjectId;    // ref → Member
  assignedBy: string;            // Clerk userId of the president who made the assignment
  assignedAt: Date;
  createdAt:  Date;
  updatedAt:  Date;
}

const DepartmentHeadSchema = new Schema<IDepartmentHead>(
  {
    department: {
      type:     String,
      required: [true, "Department is required"],
      trim:     true,
      index:    true,
    },
    member: {
      type:     Schema.Types.ObjectId,
      ref:      "Member",
      required: [true, "Member is required"],
      index:    true,
    },
    assignedBy: {
      type:     String,
      required: [true, "assignedBy (Clerk userId) is required"],
      trim:     true,
    },
    assignedAt: {
      type:    Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Prevent duplicate assignments for the same (dept, member) pair
DepartmentHeadSchema.index({ department: 1, member: 1 }, { unique: true });

const DepartmentHead: Model<IDepartmentHead> =
  (mongoose.models.DepartmentHead as Model<IDepartmentHead>) ||
  mongoose.model<IDepartmentHead>("DepartmentHead", DepartmentHeadSchema);

export default DepartmentHead;
