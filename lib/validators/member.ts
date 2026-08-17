import { z } from "zod";

export const MEMBER_DEPARTMENTS = [
  "Designing",
  "PR",
  "Social Media",
  "Volunteering",
  "Coverage",
  "Content",
  "Decoration",
  "Technical",
] as const;

export const MEMBER_BRANCHES = ["CSE", "DS", "CY", "IT", "ECE"] as const;

export const MEMBER_DESIGNATIONS = [
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
] as const;


export const memberSchema = z.object({
  name: z.string().min(2).max(100),
  // Accept either `instituteEmail` or `email` from clients
  instituteEmail: z.string().email().optional(),
  email: z.string().email().optional(),
  phoneNumber: z.string().regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number (E.164)"),
  department: z.enum(MEMBER_DEPARTMENTS as unknown as [string, ...string[]]),
  branch: z.enum(MEMBER_BRANCHES as unknown as [string, ...string[]]),
  year: z.preprocess((val) => Number(val), z.number().int().min(1).max(10)),
  designation: z.string().min(1),
  domain: z.array(z.string().min(1)).min(1),
  clerkUserId: z.string().optional(),
  profilePicture: z.string().optional(),
  avatarUrl: z.string().optional(),
  joinDate: z.string().optional(),
  isApproved: z.boolean().optional(),
  isActive: z.boolean().optional(),
});

export type MemberInput = z.infer<typeof memberSchema>;

export function parseMember(input: unknown) {
  return memberSchema.safeParse(input);
}
