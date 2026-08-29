"use client";

/**
 * components/dashboard/AssignHeadModal.tsx
 *
 * Shown when a president clicks "Assign as Head" for a member.
 *
 * Behaviour:
 *  • Shows the member's name and current department.
 *  • If that department already has a head, shows who it is and asks the
 *    president to confirm replacing them (remove old → create new).
 *  • On confirm: calls DELETE on the existing assignment (if any), then
 *    POST /api/departments/heads with the new assignment.
 *  • On "Remove Head": if the member IS already the head, calls DELETE only.
 */

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { X, Loader2, UserCog, AlertTriangle, CheckCircle2, Trash2 } from "lucide-react";

interface CurrentHead {
  assignmentId: string;
  name:         string;
}

interface AssignHeadModalProps {
  member: {
    id:          string;
    name:        string;
    department:  string;
  };
  onClose: () => void;
}

export default function AssignHeadModal({ member, onClose }: AssignHeadModalProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error,   setError]   = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Current head for this department (fetched on mount)
  const [currentHead,    setCurrentHead]    = useState<CurrentHead | null | undefined>(undefined);
  const [isCurrentHead,  setIsCurrentHead]  = useState(false);
  const [loadingCurrent, setLoadingCurrent] = useState(true);

  // Fetch the current head of this member's department
  useEffect(() => {
    async function fetchHead() {
      try {
        const res  = await fetch("/api/departments/heads");
        const data = await res.json();
        if (!res.ok || !data.success) { setCurrentHead(null); return; }

        const assignment = (data.data as Array<{
          _id:        string;
          department: string;
          member:     { _id: string; name: string } | null;
        }>).find((a) => a.department === member.department);

        if (assignment && assignment.member) {
          setCurrentHead({ assignmentId: assignment._id, name: assignment.member.name });
          setIsCurrentHead(assignment.member._id === member.id
            || String(assignment.member._id) === member.id);
        } else {
          setCurrentHead(null);
        }
      } catch {
        setCurrentHead(null);
      } finally {
        setLoadingCurrent(false);
      }
    }
    fetchHead();
  }, [member.department, member.id]);

  // ── Assign as head ───────────────────────────────────────────────────────
  const handleAssign = () => {
    setError(null);
    startTransition(async () => {
      try {
        // If someone else is currently head, remove them first
        if (currentHead && !isCurrentHead) {
          const delRes = await fetch(`/api/departments/heads/${currentHead.assignmentId}`, {
            method: "DELETE",
          });
          if (!delRes.ok) {
            const d = await delRes.json();
            setError(d.error ?? "Failed to remove existing head");
            return;
          }
        }

        // Create new assignment
        const res = await fetch("/api/departments/heads", {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify({ memberId: member.id, department: member.department }),
        });
        const data = await res.json();
        if (!res.ok) { setError(data.error ?? "Assignment failed"); return; }

        setSuccess(`${member.name} is now the head of ${member.department}.`);
        router.refresh();
        setTimeout(onClose, 1200);
      } catch {
        setError("Network error — please try again.");
      }
    });
  };

  // ── Remove as head ───────────────────────────────────────────────────────
  const handleRemove = () => {
    if (!currentHead) return;
    setError(null);
    startTransition(async () => {
      try {
        const res = await fetch(`/api/departments/heads/${currentHead.assignmentId}`, {
          method: "DELETE",
        });
        const data = await res.json();
        if (!res.ok) { setError(data.error ?? "Removal failed"); return; }

        setSuccess(`${member.name} is no longer the head of ${member.department}.`);
        router.refresh();
        setTimeout(onClose, 1200);
      } catch {
        setError("Network error — please try again.");
      }
    });
  };

  const loading = loadingCurrent || currentHead === undefined;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md rounded-2xl bg-white shadow-xl border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div className="flex items-center gap-2">
            <UserCog className="w-5 h-5 text-indigo-500" />
            <h3 className="font-display font-bold text-slate-900">Department Head</h3>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Member info */}
          <div className="flex items-center gap-3 rounded-xl bg-slate-50 border border-slate-200 p-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold flex-shrink-0">
              {member.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-slate-900">{member.name}</p>
              <p className="text-xs text-slate-500">{member.department} department</p>
            </div>
          </div>

          {/* Loading state */}
          {loading && (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
            </div>
          )}

          {/* Success */}
          {success && (
            <div className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-700">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              {success}
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="rounded-xl bg-rose-50 border border-rose-200 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          )}

          {/* Current state + actions */}
          {!loading && !success && (
            <>
              {isCurrentHead ? (
                /* Member IS already the head */
                <div className="space-y-4">
                  <div className="flex items-start gap-2.5 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-emerald-700">
                      <strong>{member.name}</strong> is currently the head of{" "}
                      <strong>{member.department}</strong>.
                    </p>
                  </div>
                  <button
                    onClick={handleRemove}
                    disabled={isPending}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 text-white text-sm font-medium hover:bg-rose-700 disabled:opacity-60 transition-all"
                  >
                    {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                    {isPending ? "Removing…" : "Remove as Head"}
                  </button>
                </div>
              ) : currentHead ? (
                /* A different member is already head — confirm replacement */
                <div className="space-y-4">
                  <div className="flex items-start gap-2.5 rounded-xl bg-amber-50 border border-amber-200 px-4 py-3">
                    <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-amber-700">
                      <strong>{currentHead.name}</strong> is currently the head of{" "}
                      <strong>{member.department}</strong>. Assigning{" "}
                      <strong>{member.name}</strong> will replace them.
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={onClose}
                      className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleAssign}
                      disabled={isPending}
                      className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:opacity-60 transition-all"
                    >
                      {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserCog className="w-4 h-4" />}
                      {isPending ? "Assigning…" : "Replace Head"}
                    </button>
                  </div>
                </div>
              ) : (
                /* No head assigned yet */
                <div className="space-y-4">
                  <p className="text-sm text-slate-600">
                    No head is currently assigned to <strong>{member.department}</strong>.
                    Assign <strong>{member.name}</strong> as the department head?
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={onClose}
                      className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleAssign}
                      disabled={isPending}
                      className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:opacity-60 transition-all"
                    >
                      {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserCog className="w-4 h-4" />}
                      {isPending ? "Assigning…" : "Assign as Head"}
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
