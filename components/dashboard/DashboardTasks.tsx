"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Clock3, ExternalLink, Send, X } from "lucide-react";

type TaskStatus =
  | "todo"
  | "in_progress"
  | "pending_review"
  | "needs_revision"
  | "declined"
  | "approved"
  | "completed";

interface DashboardTask {
  _id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: "low" | "medium" | "high";
  dueDate?: Date | string;
  workLink?: string;
}

interface DashboardTasksProps {
  tasks: DashboardTask[];
}

const STATUS_LABELS: Record<TaskStatus, string> = {
  todo: "In progress",
  in_progress: "In progress",
  pending_review: "Pending review",
  needs_revision: "Needs revision",
  declined: "Declined",
  approved: "Approved",
  completed: "Approved",
};

const STATUS_STYLES: Record<TaskStatus, string> = {
  todo: "bg-indigo-50 text-indigo-700",
  in_progress: "bg-indigo-50 text-indigo-700",
  pending_review: "bg-amber-50 text-amber-700",
  needs_revision: "bg-orange-50 text-orange-700",
  declined: "bg-rose-50 text-rose-700",
  approved: "bg-emerald-50 text-emerald-700",
  completed: "bg-emerald-50 text-emerald-700",
};

export function DashboardTasks({ tasks }: DashboardTasksProps) {
  const router = useRouter();
  const [selectedTask, setSelectedTask] = useState<DashboardTask | null>(null);
  const [workLink, setWorkLink] = useState("");
  const [submissionNote, setSubmissionNote] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const openSubmission = (task: DashboardTask) => {
    setSelectedTask(task);
    setWorkLink(task.workLink ?? "");
    setSubmissionNote("");
    setConfirmed(false);
    setError("");
  };

  const closeSubmission = () => {
    if (!submitting) setSelectedTask(null);
  };

  const submitTask = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedTask || !confirmed) return;

    try {
      setSubmitting(true);
      setError("");
      const response = await fetch(`/api/tasks/${selectedTask._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workLink, submissionNote }),
      });
      const result = await response.json();

      if (!response.ok || !result.success) {
        setError(result.error || "Could not submit this task.");
        return;
      }

      setSelectedTask(null);
      router.refresh();
    } catch {
      setError("Could not submit this task. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tasks.map((task) => {
          const canSubmit = !["pending_review", "approved", "completed"].includes(task.status);

          return (
            <div key={task._id} className="card p-5 space-y-4">
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-semibold text-slate-900 line-clamp-2">{task.title}</h3>
                <span className="text-[11px] font-bold uppercase tracking-wide text-slate-500 whitespace-nowrap">
                  {task.priority}
                </span>
              </div>
              <p className="text-sm text-slate-500 line-clamp-2">{task.description}</p>
              <div className="flex items-center justify-between gap-3 text-xs">
                <span className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 font-semibold ${STATUS_STYLES[task.status]}`}>
                  {task.status === "approved" || task.status === "completed" ? (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  ) : (
                    <Clock3 className="w-3.5 h-3.5" />
                  )}
                  {STATUS_LABELS[task.status]}
                </span>
                {task.dueDate && <span className="text-slate-400">Due {new Date(task.dueDate).toLocaleDateString()}</span>}
              </div>
              {task.workLink && (
                <a href={task.workLink} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-700">
                  View submitted work <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
              {canSubmit && (
                <button type="button" onClick={() => openSubmission(task)} className="btn-primary w-full justify-center">
                  <Send className="w-4 h-4" />
                  {task.status === "needs_revision" || task.status === "declined" ? "Resubmit work" : "Submit work"}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {selectedTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4" role="dialog" aria-modal="true" aria-labelledby="submit-task-title">
          <form onSubmit={submitTask} className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">Task submission</p>
                <h2 id="submit-task-title" className="mt-1 text-xl font-bold text-slate-900">Submit “{selectedTask.title}”?</h2>
              </div>
              <button type="button" onClick={closeSubmission} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700" aria-label="Close submission form">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="mt-3 text-sm text-slate-500">Confirm that your work is ready for review, then provide a link to it.</p>
            <label className="mt-5 block text-sm font-medium text-slate-700">
              Link to your work
              <input type="url" value={workLink} onChange={(event) => setWorkLink(event.target.value)} placeholder="https://..." className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-500" />
            </label>
            <label className="mt-4 block text-sm font-medium text-slate-700">
              Note <span className="font-normal text-slate-400">(optional)</span>
              <textarea value={submissionNote} onChange={(event) => setSubmissionNote(event.target.value)} rows={3} placeholder="Add context for the reviewer" className="mt-1.5 w-full resize-none rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-500" />
            </label>
            <label className="mt-4 flex items-start gap-2 text-sm text-slate-600">
              <input type="checkbox" checked={confirmed} onChange={(event) => setConfirmed(event.target.checked)} className="mt-0.5 accent-indigo-600" />
              I confirm this submission is ready for review.
            </label>
            {error && <p className="mt-3 text-sm text-rose-600">{error}</p>}
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={closeSubmission} className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100">Cancel</button>
              <button type="submit" disabled={!confirmed || submitting} className="btn-primary disabled:cursor-not-allowed disabled:opacity-50">
                <Send className="w-4 h-4" />
                {submitting ? "Submitting..." : "Confirm submission"}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}