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
  | "Content"
  | "Decoration"
  | "Technical";

export type MemberBranch = "CSE" | "DS" | "CY" | "IT" | "ECE";
export type MemberYear = 1 | 2 | 3 | 4;
export type MemberDesignation =
  | "president"
  | "vice president"
  | "Treasurer"
  | "Head - Designing"
  | "Head - PR"
  | "Head - Social Media"
  | "Head - Volunteering"
  | "Head - Coverage"
  | "Head - Content"
  | "Head - Decoration"
  | "Head - Technical"
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
  domain: [string];
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
  "Content",
  "Decoration",
  "Technical",
];

const MEMBER_BRANCHES: MemberBranch[] = ["CSE", "DS", "CY", "IT", "ECE"];
const MEMBER_YEARS: MemberYear[] = [1, 2, 3, 4];
const MEMBER_DESIGNATIONS: MemberDesignation[] = [
  "president",
  "vice president",
  "Treasurer",
  "Head - Designing",
  "Head - PR",
  "Head - Social Media",
  "Head - Volunteering",
  "Head - Coverage",
  "Head - Content",
  "Head - Decoration",
  "Head - Technical",
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
      match: [/^[a-zA-Z0-9._%+-]+@iiitu\.ac\.in$/, "Invalid email format"],
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
      type: [String],
      required: [true, "Domain is required"],
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



/**
 * models/Member.ts — Member directory schema.
 *
 * The primary shape follows the current UI requirements, while a few legacy
 * fields remain in sync so older dashboard queries keep working during the
 * transition.
 */

// import mongoose, { Document, Model, Schema } from "mongoose";

// // ========== TYPE DEFINITIONS ==========

// export type MemberDepartment =
//   | "Designing"
//   | "PR"
//   | "Social Media"
//   | "Volunteering"
//   | "Coverage"
//   | "Technical"
//   | "Decoration"
//   | "Content";

// export type MemberBranch = "CSE" | "DS" | "CY" | "IT" | "ECE";
// export type MemberYear = 1 | 2 | 3 | 4;

// // Updated designation enum with all positions
// type ExecutiveDesignation = 
//   | "president"
//   | "vice president"
//   | "treasurer"
//   | "general secretary"
//   | "joint secretary";

// type HeadDesignation = 
//   | "pr head"
//   | "design head"
//   | "social media head"
//   | "coverage head"
//   | "volunteering head"
//   | "decoration head"
//   | "content head";

// type RegularMember = 
//   | "member";

// type MemberDesignation = ExecutiveDesignation | HeadDesignation | RegularMember;

// // Domain types (array of strings)
// // export type MemberDomain =
// //   | "Technical"
// //   | "Design"
// //   | "Content"
// //   | "Social Media"
// //   | "Event Management"
// //   | "Volunteering"
// //   | "Public Relations"
// //   | "Coverage"
// //   | "Decoration"
// //   | "Other";

// // Member status enum
// export type MemberStatus = 
//   | "active" 
//   | "inactive" 
//   | "suspended" 
//   | "resigned" 
//   | "alumni";

// // ========== INTERFACE ==========

// export interface IMember extends Document {
//   // ===== Basic Information =====
//   name: string;
//   profilePicture?: string;
//   phoneNumber: string;
//   instituteEmail: string;
  
//   // ===== Academic Information =====
//   department: MemberDepartment;
//   branch: MemberBranch;
//   year: MemberYear;
//   hostel?: string; // NEW: Hostel field
  
//   // ===== Club Information =====
//   designation: MemberDesignation;
//   domains: string[]; // CHANGED: Now an array
//   joinDate: Date;
  
//   // ===== Status =====
//   isApproved: boolean;
//   isActive: boolean;
//   status: MemberStatus; // CHANGED: More specific enum
  
//   // ===== Authentication =====
//   clerkUserId: string;
  
//   // ===== Additional Fields =====
//   bio?: string;
//   linkedIn?: string; // NEW: LinkedIn profile
  
//   // ===== Permissions (NEW) =====
//   permissions: {
//     canAddMembers: boolean;
//     canRemoveMembers: boolean;
//     canCreateTasks: boolean;
//     canDeleteTasks: boolean;
//     canAssignTasks: boolean;
//     canCreateEvents: boolean;
//     canDeleteEvents: boolean;
//     canApproveMembers: boolean;
//     canManageRoles: boolean;
//     canManageFinances: boolean;
//     canViewAllMembers: boolean;
//     canEditOwnProfile: boolean;
//     canSubmitTasks: boolean;
//   };

//   // ===== Communication Preferences (NEW) =====
//   communication: {
//     emailSubscriptions: {
//       newsletters: boolean;
//       eventUpdates: boolean;
//       taskAssignments: boolean;
//       roleUpdates: boolean;
//     };
//     lastEmailSent?: Date;
//     emailBounceCount: number;
//   };

//   // ===== Tasks (NEW) =====
//   tasks: {
//     assigned: Array<{
//       taskId: mongoose.Types.ObjectId;
//       assignedDate: Date;
//       deadline?: Date;
//       status: "pending" | "in_progress" | "submitted" | "approved" | "rejected";
//     }>;
//     submitted: Array<{
//       taskId: mongoose.Types.ObjectId;
//       submittedDate: Date;
//       status: "pending_approval" | "approved" | "rejected";
//     }>;
//   };

//   // ===== Timestamps =====
//   createdAt: Date;
//   updatedAt: Date;
//   lastActive?: Date; // NEW: Track last activity
//   statusChangedAt?: Date; // NEW: Track when status changed
//   deletedAt?: Date; // NEW: Soft delete

//   // ===== Metadata (NEW) =====
//   metadata: {
//     customFields: Map<string, string>;
//     notes?: string;
//     tags: string[];
//   };

//   // ===== Legacy compatibility fields =====
//   clerkId: string;
//   email: string;
//   avatarUrl?: string;
//   role: string;
// }

// // ========== ENUMS ==========

// const MEMBER_DEPARTMENTS: MemberDepartment[] = [
//   "Designing",
//   "PR",
//   "Social Media",
//   "Volunteering",
//   "Coverage",
//   "Technical",
//   "Decoration",
//   "Content",
// ];

// const MEMBER_BRANCHES: MemberBranch[] = ["CSE", "DS", "CY", "IT", "ECE"];
// const MEMBER_YEARS: MemberYear[] = [1, 2, 3, 4];

// const MEMBER_DESIGNATIONS: MemberDesignation[] = [
//   "president",
//   "vice president",
//   "treasurer",
//   "general secretary",
//   "joint secretary",
//   "pr head",
//   "design head",
//   "social media head",
//   "coverage head",
//   "content head",
//   "volunteering head",
//   "decoration head",
//   "member",
// ];

// // const MEMBER_DOMAINS: MemberDomain[] = [
// //   "Technical",
// //   "Design",
// //   "Content",
// //   "Social Media",
// //   "Event Management",
// //   "Volunteering",
// //   "Public Relations",
// //   "Coverage",
// //   "Decoration",
// //   "Other",
// // ];

// const MEMBER_STATUSES: MemberStatus[] = [
//   "active",
//   "inactive",
//   "suspended",
//   "resigned",
//   "alumni",
// ];

// const HOSTEL_OPTIONS = [
//   "Vipasa",
//   "Iravati",
//   "Askini",
//   "Khalindi",
//   "OTHER",
// ] as const;

// // ========== SCHEMA ==========

// const MemberSchema = new Schema<IMember>(
//   {
//     // ===== Basic Information =====
//     name: {
//       type: String,
//       required: [true, "Name is required"],
//       trim: true,
//       maxlength: [100, "Name cannot exceed 100 characters"],
//     },
//     profilePicture: {
//       type: String,
//       trim: true,
//     },
//     phoneNumber: {
//       type: String,
//       required: [true, "Phone number is required"],
//       trim: true,
//       unique: true,
//       index: true,
//     },
//     instituteEmail: {
//       type: String,
//       required: [true, "Institute email is required"],
//       unique: true,
//       lowercase: true,
//       trim: true,
//       match: [/^[a-zA-Z0-9._%+-]+@iiitu\.ac\.in$/, "Invalid email format"],
//       index: true,
//     },

//     // ===== Academic Information =====
//     department: {
//       type: String,
//       required: [true, "Department is required"],
//       enum: MEMBER_DEPARTMENTS,
//     },
//     branch: {
//       type: String,
//       required: [true, "Branch is required"],
//       enum: MEMBER_BRANCHES,
//     },
//     year: {
//       type: Number,
//       required: [true, "Year is required"],
//       enum: MEMBER_YEARS,
//     },
//     hostel: {
//       type: String,
//       enum: HOSTEL_OPTIONS,
//       default: null,
//     },

//     // ===== Club Information =====
//     designation: {
//       type: String,
//       required: [true, "Designation is required"],
//       enum: MEMBER_DESIGNATIONS,
//       default: "member",
//       index: true,
//     },
    
//     domains: {
//       type: [String],  // Array of strings
//       default: [],     // Default to empty array
//       index: true,     // Keep index for faster queries
//     },
    
//     joinDate: {
//       type: Date,
//       default: Date.now,
//       index: true,
//     },

//     // ===== Status =====
//     isApproved: {
//       type: Boolean,
//       default: false,
//     },
//     isActive: {
//       type: Boolean,
//       default: true,
//     },
//     status: {
//       type: String,
//       enum: MEMBER_STATUSES,
//       default: "active",
//       index: true,
//     },

//     // ===== Authentication =====
//     clerkUserId: {
//       type: String,
//       required: [true, "Clerk user ID is required"],
//       unique: true,
//       index: true,
//     },

//     // ===== Additional Fields =====
//     bio: {
//       type: String,
//       trim: true,
//       maxlength: [500, "Bio cannot exceed 500 characters"],
//     },
//     linkedIn: {
//       type: String,
//       trim: true,
//       default: null,
//     },

//     // ===== Permissions =====
//     permissions: {
//       canAddMembers: { type: Boolean, default: false },
//       canRemoveMembers: { type: Boolean, default: false },
//       canCreateTasks: { type: Boolean, default: false },
//       canDeleteTasks: { type: Boolean, default: false },
//       canAssignTasks: { type: Boolean, default: false },
//       canCreateEvents: { type: Boolean, default: false },
//       canDeleteEvents: { type: Boolean, default: false },
//       canApproveMembers: { type: Boolean, default: false },
//       canManageRoles: { type: Boolean, default: false },
//       canManageFinances: { type: Boolean, default: false },
//       canViewAllMembers: { type: Boolean, default: true },
//       canEditOwnProfile: { type: Boolean, default: true },
//       canSubmitTasks: { type: Boolean, default: true },
//     },

//     // ===== Communication Preferences =====
//     communication: {
//       emailSubscriptions: {
//         newsletters: { type: Boolean, default: true },
//         eventUpdates: { type: Boolean, default: true },
//         taskAssignments: { type: Boolean, default: true },
//         roleUpdates: { type: Boolean, default: true },
//       },
//       lastEmailSent: { type: Date, default: null },
//       emailBounceCount: { type: Number, default: 0 },
//     },

//     // ===== Tasks =====
//     tasks: {
//       assigned: [
//         {
//           taskId: { 
//             type: Schema.Types.ObjectId, 
//             ref: "Task" 
//           },
//           assignedDate: { 
//             type: Date, 
//             default: Date.now 
//           },
//           deadline: { 
//             type: Date 
//           },
//           status: {
//             type: String,
//             enum: ["pending", "in_progress", "submitted", "approved", "rejected"],
//             default: "pending",
//           },
//         },
//       ],
//       submitted: [
//         {
//           taskId: { 
//             type: Schema.Types.ObjectId, 
//             ref: "Task" 
//           },
//           submittedDate: { 
//             type: Date, 
//             default: Date.now 
//           },
//           status: {
//             type: String,
//             enum: ["pending_approval", "approved", "rejected"],
//             default: "pending_approval",
//           },
//         },
//       ],
//     },

//     // ===== Timestamps =====
//     createdAt: {
//       type: Date,
//       default: Date.now,
//       index: true,
//     },
//     updatedAt: {
//       type: Date,
//       default: Date.now,
//     },
//     lastActive: {
//       type: Date,
//       default: Date.now,
//     },
//     statusChangedAt: {
//       type: Date,
//       default: null,
//     },
//     deletedAt: {
//       type: Date,
//       default: null,
//       index: true,
//     },

//     // ===== Metadata =====
//     metadata: {
//       customFields: {
//         type: Map,
//         of: String,
//         default: {},
//       },
//       notes: {
//         type: String,
//         trim: true,
//         default: null,
//       },
//       tags: {
//         type: [String],
//         default: [],
//         index: true,
//       },
//     },

//     // ===== Legacy compatibility fields =====
//     clerkId: {
//       type: String,
//       unique: true,
//       sparse: true,
//       index: true,
//     },
//     email: {
//       type: String,
//       lowercase: true,
//       trim: true,
//       sparse: true,
//       index: true,
//     },
//     avatarUrl: {
//       type: String,
//       trim: true,
//     },
//     role: {
//       type: String,
//       default: "member",
//     },
//   },
//   {
//     timestamps: true,
//   }
// );

// // ========== INDEXES ==========

// // Existing indexes
// MemberSchema.index({ designation: 1, isActive: 1 });
// MemberSchema.index({ name: "text", instituteEmail: "text", phoneNumber: "text" });

// // Additional indexes for new fields
// MemberSchema.index({ status: 1, isActive: 1 });
// MemberSchema.index({ domains: 1 });
// MemberSchema.index({ joinDate: -1 });
// MemberSchema.index({ "tasks.assigned.status": 1 });
// MemberSchema.index({ deletedAt: 1 });
// MemberSchema.index({ "metadata.tags": 1 });

// // Compound indexes for common queries
// MemberSchema.index({ status: 1, designation: 1 });
// MemberSchema.index({ isActive: 1, designation: 1 });

// // ========== MIDDLEWARE ==========

// // Sync legacy fields
// MemberSchema.pre("validate", function syncLegacyFields(next) {
//   this.clerkId = this.clerkId ?? this.clerkUserId;
//   this.email = this.email ?? this.instituteEmail;
//   this.avatarUrl = this.avatarUrl ?? this.profilePicture;
//   this.role = this.role ?? this.designation;
  
//   // Map isActive to status for legacy compatibility
//   if (!this.status || this.status === "active") {
//     this.status = this.isActive ? "active" : "inactive";
//   }
  
//   next();
// });

// // Auto-set permissions based on designation
// MemberSchema.pre("save", function setPermissions(next) {
//   const permissionMap: Record<ExecutiveDesignation, Partial<IMember["permissions"]>> = {
//     "president": {
//       canAddMembers: true,
//       canRemoveMembers: true,
//       canCreateTasks: true,
//       canDeleteTasks: true,
//       canAssignTasks: true,
//       canCreateEvents: true,
//       canDeleteEvents: true,
//       canApproveMembers: true,
//       canManageRoles: true,
//       canManageFinances: true,
//       canViewAllMembers: true,
//       canEditOwnProfile: true,
//       canSubmitTasks: true,
//     },
//     "vice president": {
//       canAddMembers: true,
//       canRemoveMembers: true,
//       canCreateTasks: true,
//       canDeleteTasks: true,
//       canAssignTasks: true,
//       canCreateEvents: true,
//       canDeleteEvents: true,
//       canApproveMembers: true,
//       canManageRoles: false,
//       canManageFinances: false,
//       canViewAllMembers: true,
//       canEditOwnProfile: true,
//       canSubmitTasks: true,
//     },
//     "treasurer": {
//       canAddMembers: false,
//       canRemoveMembers: false,
//       canCreateTasks: true,
//       canDeleteTasks: false,
//       canAssignTasks: true,
//       canCreateEvents: true,
//       canDeleteEvents: false,
//       canApproveMembers: false,
//       canManageRoles: false,
//       canManageFinances: true,
//       canViewAllMembers: true,
//       canEditOwnProfile: true,
//       canSubmitTasks: true,
//     },
//     "general secretary": {
//       canAddMembers: true,
//       canRemoveMembers: false,
//       canCreateTasks: true,
//       canDeleteTasks: false,
//       canAssignTasks: true,
//       canCreateEvents: true,
//       canDeleteEvents: false,
//       canApproveMembers: true,
//       canManageRoles: false,
//       canManageFinances: false,
//       canViewAllMembers: true,
//       canEditOwnProfile: true,
//       canSubmitTasks: true,
//     },
//     "joint secretary": {
//       canAddMembers: false,
//       canRemoveMembers: false,
//       canCreateTasks: true,
//       canDeleteTasks: false,
//       canAssignTasks: true,
//       canCreateEvents: true,
//       canDeleteEvents: false,
//       canApproveMembers: false,
//       canManageRoles: false,
//       canManageFinances: false,
//       canViewAllMembers: true,
//       canEditOwnProfile: true,
//       canSubmitTasks: true,
//     },
//   };

//   // Heads get task management permissions
//   const headPositions: MemberDesignation[] = [
//     "pr head",
//     "design head",
//     "social media head",
//     "coverage head",
//     "volunteering head",
//     "decoration head",
//     "content head",

//   ];

//   const defaultPermissions = {
//     canAddMembers: false,
//     canRemoveMembers: false,
//     canCreateTasks: false,
//     canDeleteTasks: false,
//     canAssignTasks: false,
//     canCreateEvents: false,
//     canDeleteEvents: false,
//     canApproveMembers: false,
//     canManageRoles: false,
//     canManageFinances: false,
//     canViewAllMembers: true,
//     canEditOwnProfile: true,
//     canSubmitTasks: true,
//   };

//   if (headPositions.includes(this.designation as MemberDesignation)) {
//     // Heads can manage tasks in their domain
//     this.permissions.canCreateTasks = true;
//     this.permissions.canAssignTasks = true;
//     this.permissions.canCreateEvents = true;
//   } else if (permissionMap[this.designation as ExecutiveDesignation]) {
//     // Apply predefined permissions
//     Object.assign(this.permissions, {
//       ...defaultPermissions,
//       ...permissionMap[this.designation as ExecutiveDesignation],
//     });
//   } else {
//     // Default member permissions
//     Object.assign(this.permissions, defaultPermissions);
//   }

//   // Update legacy role field
//   this.role = this.designation;
  
//   next();
// });

// // Update statusChangedAt when status changes
// MemberSchema.pre("save", function updateStatusTimestamp(next) {
//   if (this.isModified("status")) {
//     this.statusChangedAt = new Date();
//   }
//   next();
// });

// // ========== METHODS ==========

// // Check if member has specific permission
// MemberSchema.methods.hasPermission = function(
//   permission: keyof IMember["permissions"]
// ): boolean {
//   return this.permissions[permission] === true;
// };

// // Check if member is a head
// MemberSchema.methods.isHead = function(): boolean {
//   const headPositions: MemberDesignation[] = [
//     "pr head",
//     "design head",
//     "social media head",
//     "coverage head",
//     "volunteering head",
//     "decoration head",
//   ];
//   return headPositions.includes(this.designation);
// };

// // Check if member is an executive
// MemberSchema.methods.isExecutive = function(): boolean {
//   const executivePositions: MemberDesignation[] = [
//     "president",
//     "vice president",
//     "treasurer",
//     "general secretary",
//     "joint secretary",
//   ];
//   return executivePositions.includes(this.designation);
// };

// // Check if member is active
// MemberSchema.methods.isActiveMember = function(): boolean {
//   return this.isActive && this.status === "active" && !this.deletedAt;
// };

// // Get assigned tasks by status
// MemberSchema.methods.getTasksByStatus = function(
//   status: "pending" | "in_progress" | "submitted" | "approved" | "rejected"
// ) {
//   return this.tasks.assigned.filter((task: any) => task.status === status);
// };

// // ========== STATIC METHODS ==========

// // Find active members
// MemberSchema.statics.findActive = function() {
//   return this.find({ 
//     isActive: true, 
//     status: "active", 
//     deletedAt: null 
//   });
// };

// // Find members by designation
// MemberSchema.statics.findByDesignation = function(designation: MemberDesignation) {
//   return this.find({ 
//     designation, 
//     deletedAt: null 
//   });
// };

// // Find members by domain
// MemberSchema.statics.findByDomain = function(domain: MemberDomain) {
//   return this.find({ 
//     domains: domain, 
//     deletedAt: null 
//   });
// };

// // Search members with filters
// MemberSchema.statics.searchMembers = function(
//   query: string,
//   filters?: {
//     designation?: MemberDesignation;
//     department?: MemberDepartment;
//     branch?: MemberBranch;
//     year?: MemberYear;
//   }
// ) {
//   const searchQuery: any = {
//     $text: { $search: query },
//     deletedAt: null,
//   };

//   if (filters) {
//     if (filters.designation) searchQuery.designation = filters.designation;
//     if (filters.department) searchQuery.department = filters.department;
//     if (filters.branch) searchQuery.branch = filters.branch;
//     if (filters.year) searchQuery.year = filters.year;
//   }

//   return this.find(searchQuery, { score: { $meta: "textScore" } })
//     .sort({ score: { $meta: "textScore" } });
// };

// // Get members by status
// MemberSchema.statics.findByStatus = function(status: MemberStatus) {
//   return this.find({ status, deletedAt: null });
// };

// // Soft delete member
// MemberSchema.statics.softDelete = function(id: string) {
//   return this.findByIdAndUpdate(
//     id,
//     {
//       deletedAt: new Date(),
//       isActive: false,
//       status: "inactive",
//     },
//     { new: true }
//   );
// };

// // ========== MODEL ==========

// // Preserve existing model if it exists
// const Member: Model<IMember> =
//   (mongoose.models.Member as Model<IMember>) ||
//   mongoose.model<IMember>("Member", MemberSchema);

// export default Member;