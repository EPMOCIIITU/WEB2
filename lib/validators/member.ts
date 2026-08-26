/**
 * lib/validators/member.ts — Zod schema for member creation input.
 *
 * SECURITY NOTE:
 *   clerkUserId  → NOT accepted from client input. The server sets this
 *                   exclusively via the /api/members/[id]/approve endpoint
 *                   after Clerk confirms user creation.
 *
 *   isApproved   → NOT accepted from client input. Always forced to false
 *                   on creation; changed only through the dedicated approval
 *                   endpoint which requires president/core permission.
 *
 *   isActive     → Accepted from client (admin may create an inactive record),
 *                   but defaults to true.
 */

import { z } from "zod";

export const MEMBER_DEPARTMENTS = [
  "Designing",
  "PR",
  "Social Media",
  "Volunteering",
  "Coverage",
  "Technical",
  "Decoration",
  "Content",
] as const;

export const MEMBER_BRANCHES = ["CSE", "DS", "CY", "IT", "ECE"] as const;

export const MEMBER_DESIGNATIONS = [
  "president",
  "vice president",
  "Treasurer",
  "Secretary",
  "Head",
  "member",
] as const;

export const memberSchema = z.object({
  name: z.string().min(2).max(100),
  // Accept either `instituteEmail` or legacy `email` from clients
  instituteEmail: z.string().email().optional(),
  email: z.string().email().optional(),
  phoneNumber: z.string().regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number (E.164)"),
  department: z.enum(MEMBER_DEPARTMENTS),
  branch: z.enum(MEMBER_BRANCHES),
  year: z.preprocess((val) => Number(val), z.number().int().min(1).max(4)),
  designation: z.enum(MEMBER_DESIGNATIONS),
  domain: z.string().min(1).max(200),
  // Profile picture / avatar URLs (optional; validated separately for allowlist)
  profilePicture: z.string().url().optional(),
  avatarUrl: z.string().url().optional(),
  joinDate: z.string().datetime({ offset: true }).optional().or(z.string().date().optional()),
  bio: z.string().max(500).optional(),
  // isActive is accepted (admin may pre-set inactive), defaults to true on server.
  isActive: z.boolean().optional(),
  // ── INTENTIONALLY EXCLUDED ──────────────────────────────────────────────
  // clerkUserId : never from client — set server-side only via /approve endpoint
  // isApproved  : never from client — set server-side only via /approve endpoint
});

export type MemberInput = z.infer<typeof memberSchema>;

export function parseMember(input: unknown) {
  return memberSchema.safeParse(input);
}
