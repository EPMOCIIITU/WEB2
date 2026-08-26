"use client";

import { useState, useEffect } from "react";
import { useClerk } from "@clerk/nextjs";
import {
  Plus,
  CheckCircle2,
  Clock,
  AlertCircle,
  User,
  UserCheck,
  Trash2,
  Edit3,
  Calendar,
  ClipboardList,
  Loader2,
  MoreVertical,
  ArrowRight,
  UserPlus,
  Eye,
  X,
  RotateCcw,
  Ban,
  Search,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Member {
  _id: string;
  name: string;
  profilePicture?: string;
  designation: string;
  instituteEmail: string;
}

interface Task {
  _id: string;
  title: string;
  description: string;
  assignedTo: Member | null;
  assignedBy: Member | null;
  status: "todo" | "in_progress" | "pending_review" | "needs_revision" | "declined" | "approved" | "completed";
  priority: "low" | "medium" | "high";
  dueDate?: string;
  workLink?: string;
  submissionNote?: string;
  reviewNote?: string;
  submittedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export function TasksClient() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [currentMemberId, setCurrentMemberId] = useState<string>("");
  const [canAssignTasks, setCanAssignTasks] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"unassigned" | "assigned_to_me" | "assigned_by_me">("unassigned");

  // Form State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const [formTitle, setFormTitle] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formAssignedTo, setFormAssignedTo] = useState("");
  const [formPriority, setFormPriority] = useState<"low" | "medium" | "high">("medium");
  const [formDueDate, setFormDueDate] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [reviewTask, setReviewTask] = useState<Task | null>(null);
  const [reviewNote, setReviewNote] = useState("");
  const [reviewError, setReviewError] = useState("");
  const [assignTask, setAssignTask] = useState<Task | null>(null);
  const [memberSearch, setMemberSearch] = useState("");
  const [assigning, setAssigning] = useState(false);
  const [assignError, setAssignError] = useState("");

  // Fetch Data
  const fetchData = async () => {
    try {
      setLoading(true);
      const [tasksRes, membersRes] = await Promise.all([
        fetch("/api/tasks"),
        fetch("/api/members"),
      ]);

      const tasksData = await tasksRes.json();
      const membersData = await membersRes.json();

      if (tasksData.success) {
        setTasks(tasksData.data);
        setCurrentMemberId(tasksData.currentMemberId);
        setCanAssignTasks(tasksData.canAssignTasks === true);
      } else {
        setError(tasksData.error || "Failed to load tasks");
      }

      if (membersData.success) {
        setMembers(membersData.data);
      }
    } catch (err) {
      console.error(err);
      setError("An error occurred while fetching data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const resetForm = () => {
    setFormTitle("");
    setFormDesc("");
    setFormAssignedTo("");
    setFormPriority("medium");
    setFormDueDate("");
    setEditingTask(null);
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formDesc.trim()) return;

    try {
      setSubmitting(true);
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formTitle,
          description: formDesc,
          assignedTo: formAssignedTo || null,
          priority: formPriority,
          dueDate: formDueDate || null,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setTasks([data.data, ...tasks]);
        setShowCreateModal(false);
        resetForm();
      } else {
        alert(data.error || "Failed to create task");
      }
    } catch (err) {
      console.error(err);
      alert("Error creating task");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTask || !formTitle.trim() || !formDesc.trim()) return;

    try {
      setSubmitting(true);
      const res = await fetch(`/api/tasks/${editingTask._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formTitle,
          description: formDesc,
          assignedTo: formAssignedTo || null,
          priority: formPriority,
          dueDate: formDueDate || null,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setTasks(tasks.map((t) => (t._id === editingTask._id ? data.data : t)));
        setShowEditModal(false);
        resetForm();
      } else {
        alert(data.error || "Failed to update task");
      }
    } catch (err) {
      console.error(err);
      alert("Error updating task");
    } finally {
      setSubmitting(false);
    }
  };

  const openAssignModal = (task: Task) => {
    setAssignTask(task);
    setMemberSearch("");
    setAssignError("");
  };

  const handleAssignTask = async (memberId: string) => {
    if (!assignTask) return;

    try {
      setAssigning(true);
      setAssignError("");
      const res = await fetch(`/api/tasks/${assignTask._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assignedTo: memberId }),
      });

      const data = await res.json();
      if (data.success) {
        setTasks(tasks.map((task) => (task._id === assignTask._id ? data.data : task)));
        setAssignTask(null);
      } else {
        setAssignError(data.error || "Failed to assign task");
      }
    } catch (err) {
      console.error(err);
      setAssignError("Error assigning task. Please try again.");
    } finally {
      setAssigning(false);
    }
  };

  const handleUnassignTask = async (taskId: string) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assignedTo: null }),
      });

      const data = await res.json();
      if (data.success) {
        setTasks(tasks.map((t) => (t._id === taskId ? data.data : t)));
      } else {
        alert(data.error || "Failed to unassign task");
      }
    } catch (err) {
      console.error(err);
      alert("Error unassigning task");
    }
  };

  const handleUpdateStatus = async (taskId: string, newStatus: Task["status"]) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await res.json();
      if (data.success) {
        setTasks(tasks.map((t) => (t._id === taskId ? data.data : t)));
      } else {
        alert(data.error || "Failed to update status");
      }
    } catch (err) {
      console.error(err);
      alert("Error updating status");
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm("Are you sure you want to delete this task?")) return;

    try {
      const res = await fetch(`/api/tasks/${taskId}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setTasks(tasks.filter((t) => t._id !== taskId));
      } else {
        alert(data.error || "Failed to delete task");
      }
    } catch (err) {
      console.error(err);
      alert("Error deleting task");
    }
  };

  const openReviewModal = (task: Task) => {
    setReviewTask(task);
    setReviewNote(task.reviewNote || "");
    setReviewError("");
  };

  const handleReviewTask = async (status: "needs_revision" | "declined" | "approved") => {
    if (!reviewTask || (status === "needs_revision" && !reviewNote.trim())) {
      setReviewError("Please write a message explaining the requested revisions.");
      return;
    }

    try {
      setSubmitting(true);
      setReviewError("");
      const response = await fetch(`/api/tasks/${reviewTask._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, reviewNote: reviewNote.trim() }),
      });
      const result = await response.json();

      if (!response.ok || !result.success) {
        setReviewError(result.error || "Could not update the task review.");
        return;
      }

      setTasks(tasks.map((task) => (task._id === reviewTask._id ? result.data : task)));
      setReviewTask(null);
    } catch {
      setReviewError("Could not update the task review. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const openEditModal = (task: Task) => {
    setEditingTask(task);
    setFormTitle(task.title);
    setFormDesc(task.description);
    setFormAssignedTo(task.assignedTo?._id || "");
    setFormPriority(task.priority);
    setFormDueDate(task.dueDate ? new Date(task.dueDate).toISOString().split("T")[0] : "");
    setShowEditModal(true);
  };

  // Filter Tasks by Active Tab
  const unassignedTasks = tasks.filter((t) => t.assignedTo === null);
  const assignedToMe = tasks.filter((t) => t.assignedTo?._id === currentMemberId);
  const assignedByMe = tasks.filter(
    (t) => t.assignedBy?._id === currentMemberId && t.assignedTo?._id !== currentMemberId
  );

  const getFilteredTasks = () => {
    switch (activeTab) {
      case "unassigned":
        return unassignedTasks;
      case "assigned_to_me":
        return assignedToMe;
      case "assigned_by_me":
        return assignedByMe;
    }
  };

  const filteredTasks = getFilteredTasks();

  return (
    <div className="space-y-8 animate-fade-in">
      {/* ── Header ────────────────────────────────────────── */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
            <ClipboardList className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-slate-900">Task Board</h1>
            <p className="text-slate-500 text-sm">
              Manage tasks, assign work, and track project status.
            </p>
          </div>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowCreateModal(true);
          }}
          className="btn-primary"
        >
          <Plus className="w-4 h-4" />
          Create Task
        </button>
      </div>

      {/* ── Tabs Row ──────────────────────────────────────── */}
      <div className="flex border-b border-slate-200">
        {[
          { id: "unassigned", label: "Unassigned Tasks", count: unassignedTasks.length },
          { id: "assigned_to_me", label: "Assigned to Me", count: assignedToMe.length },
          { id: "assigned_by_me", label: "Assigned by Me", count: assignedByMe.length },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={cn(
              "px-5 py-4 border-b-2 font-medium text-sm transition-all relative flex items-center gap-2",
              activeTab === tab.id
                ? "border-indigo-600 text-indigo-600 font-semibold"
                : "border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300"
            )}
          >
            {tab.label}
            <span
              className={cn(
                "px-2 py-0.5 rounded-full text-xs font-bold transition-all",
                activeTab === tab.id
                  ? "bg-indigo-100 text-indigo-700"
                  : "bg-slate-100 text-slate-600"
              )}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* ── Content Area ───────────────────────────────────── */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
          <p className="text-slate-500 text-sm">Loading task board...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-100">
          {error}
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-slate-200 rounded-2xl bg-slate-50 flex flex-col items-center justify-center p-6">
          <ClipboardList className="w-12 h-12 text-slate-300 mb-3" />
          <h3 className="font-semibold text-slate-800 text-base">No tasks found</h3>
          <p className="text-slate-500 text-sm mt-1 max-w-sm">
            {activeTab === "unassigned" && "No unassigned tasks are currently available."}
            {activeTab === "assigned_to_me" && "You do not have any tasks assigned to you."}
            {activeTab === "assigned_by_me" && "You haven't assigned tasks to any other member."}
          </p>
          {activeTab === "unassigned" && (
            <button
              onClick={() => {
                resetForm();
                setShowCreateModal(true);
              }}
              className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Create a Task
            </button>
          )}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTasks.map((task) => {
            const isAuthor = task.assignedBy?._id === currentMemberId;
            const isAssignee = task.assignedTo?._id === currentMemberId;

            return (
              <div
                key={task._id}
                className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col justify-between hover:shadow-md transition-all duration-200"
              >
                <div>
                  {/* Task Header info */}
                  <div className="flex items-center justify-between mb-3.5">
                    <span
                      className={cn(
                        "text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded",
                        task.priority === "high" && "bg-rose-50 text-rose-700 border border-rose-100",
                        task.priority === "medium" && "bg-amber-50 text-amber-700 border border-amber-100",
                        task.priority === "low" && "bg-blue-50 text-blue-700 border border-blue-100"
                      )}
                    >
                      {task.priority} Priority
                    </span>
                    <span
                      className={cn(
                        "text-xs font-semibold px-2.5 py-1 rounded-full",
                        task.status === "todo" && "bg-slate-100 text-slate-700",
                        task.status === "in_progress" && "bg-indigo-50 text-indigo-700",
                        task.status === "pending_review" && "bg-amber-50 text-amber-700",
                        task.status === "needs_revision" && "bg-orange-50 text-orange-700",
                        task.status === "declined" && "bg-rose-50 text-rose-700",
                        (task.status === "approved" || task.status === "completed") && "bg-emerald-50 text-emerald-700"
                      )}
                    >
                      {task.status === "todo" && "To Do"}
                      {task.status === "in_progress" && "In Progress"}
                      {task.status === "pending_review" && "Pending Review"}
                      {task.status === "needs_revision" && "Needs Revision"}
                      {task.status === "declined" && "Declined"}
                      {task.status === "approved" && "Approved"}
                      {task.status === "completed" && "Completed"}
                    </span>
                  </div>

                  <h3 className="font-display font-bold text-slate-900 text-lg mb-2">
                    {task.title}
                  </h3>
                  <p className="text-slate-600 text-sm line-clamp-3 mb-4 leading-relaxed">
                    {task.description}
                  </p>

                  {/* Due Date & Assignment info */}
                  <div className="space-y-2.5 border-t border-slate-100 pt-3.5 mb-4">
                    {task.dueDate && (
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                      </div>
                    )}

                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                      <span>
                        By: <span className="font-medium text-slate-800">{task.assignedBy?.name || "Unknown"}</span>
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span>
                        To:{" "}
                        <span className="font-medium text-slate-800">
                          {task.assignedTo ? task.assignedTo.name : "Unassigned"}
                        </span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions Panel */}
                <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                  {/* Status update logic */}
                  {isAssignee && ["todo", "in_progress", "needs_revision", "declined"].includes(task.status) && (
                    <div className="flex-1">
                      <select
                        value={task.status}
                        onChange={(e) => handleUpdateStatus(task._id, e.target.value as any)}
                        className="w-full text-xs border border-slate-200 rounded-xl px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 focus:outline-none transition-colors"
                      >
                        <option value="todo">To Do</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                      </select>
                    </div>
                  )}

                  {/* Assign unassigned task */}
                  {task.assignedTo === null && (isAuthor || canAssignTasks) && (
                    <button
                      onClick={() => openAssignModal(task)}
                      className="flex-1 py-1.5 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700 transition-all text-center flex items-center justify-center gap-1.5"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      Assign Task
                    </button>
                  )}

                  {/* Return to Unassigned (Release task) */}
                  {/* {isAssignee && (
                    <button
                      onClick={() => handleUnassignTask(task._id)}
                      className="px-2 py-1.5 border border-slate-200 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-medium transition-all"
                      title="Release task"
                    >
                      Release
                    </button>
                  )} */}

                  {/* Author / admin actions */}
                  {isAuthor && (
                    <div className="flex flex-wrap items-center gap-2 ml-auto justify-end">
                      {task.workLink ? (
                        <button
                          onClick={() => openReviewModal(task)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-xs font-semibold transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          View response
                        </button>
                      ) : (
                        <span className="text-xs text-slate-400">No response</span>
                      )}
                      <button
                        onClick={() => openEditModal(task)}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        title="Edit Task"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteTask(task._id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Delete Task"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── CREATE TASK MODAL ──────────────────────────────── */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h2 className="font-display font-bold text-slate-900 text-lg">Create New Task</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-semibold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Task Title</label>
                <input
                  type="text"
                  required
                  placeholder="Review event budget, write newsletter, etc."
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Description</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Outline the steps and deliverables required for this task."
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Assign To</label>
                  <select
                    value={formAssignedTo}
                    onChange={(e) => setFormAssignedTo(e.target.value)}
                    className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 focus:border-indigo-500 bg-white focus:outline-none"
                  >
                    <option value="">Leave Unassigned</option>
                    {members.map((member) => (
                      <option key={member._id} value={member._id}>
                        {member.name} ({member.designation})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Priority</label>
                  <select
                    value={formPriority}
                    onChange={(e) => setFormPriority(e.target.value as any)}
                    className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 focus:border-indigo-500 bg-white focus:outline-none"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Due Date (Optional)</label>
                <input
                  type="date"
                  value={formDueDate}
                  onChange={(e) => setFormDueDate(e.target.value)}
                  className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 font-semibold rounded-xl text-sm hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm transition-all disabled:opacity-50 flex items-center gap-1.5"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── EDIT TASK MODAL ────────────────────────────────── */}
      {showEditModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h2 className="font-display font-bold text-slate-900 text-lg">Edit Task</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-semibold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleEditTask} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Task Title</label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Description</label>
                <textarea
                  required
                  rows={4}
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Assign To</label>
                  <select
                    value={formAssignedTo}
                    onChange={(e) => setFormAssignedTo(e.target.value)}
                    className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 focus:border-indigo-500 bg-white focus:outline-none"
                  >
                    <option value="">Leave Unassigned</option>
                    {members.map((member) => (
                      <option key={member._id} value={member._id}>
                        {member.name} ({member.designation})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Priority</label>
                  <select
                    value={formPriority}
                    onChange={(e) => setFormPriority(e.target.value as any)}
                    className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 focus:border-indigo-500 bg-white focus:outline-none"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Due Date</label>
                <input
                  type="date"
                  value={formDueDate}
                  onChange={(e) => setFormDueDate(e.target.value)}
                  className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 font-semibold rounded-xl text-sm hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm transition-all disabled:opacity-50 flex items-center gap-1.5"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── REVIEW RESPONSE MODAL ──────────────────────────── */}
      {reviewTask && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-start justify-between gap-4 bg-slate-50">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">Member response</p>
                <h2 className="font-display font-bold text-slate-900 text-lg mt-1">{reviewTask.title}</h2>
              </div>
              <button
                onClick={() => setReviewTask(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
                aria-label="Close response"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Submitted work</p>
                <a
                  href={reviewTask.workLink}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-1 block break-all text-sm font-medium text-indigo-600 hover:text-indigo-700 underline"
                >
                  {reviewTask.workLink}
                </a>
              </div>
              {reviewTask.submissionNote && (
                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Member note</p>
                  <p className="mt-1 text-sm text-slate-700 whitespace-pre-wrap">{reviewTask.submissionNote}</p>
                </div>
              )}

              {reviewTask.status === "pending_review" ? (
                <>
                  <label className="block text-sm font-medium text-slate-700">
                    Revision message
                    <textarea
                      value={reviewNote}
                      onChange={(event) => setReviewNote(event.target.value)}
                      rows={3}
                      placeholder="Explain what the member should change..."
                      className="mt-1.5 w-full resize-none rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-500"
                    />
                  </label>
                  {reviewError && <p className="text-sm text-rose-600">{reviewError}</p>}
                  <div className="flex flex-wrap justify-end gap-2 pt-2">
                    <button type="button" disabled={submitting} onClick={() => handleReviewTask("needs_revision")} className="inline-flex items-center gap-1.5 rounded-xl border border-orange-200 px-3 py-2 text-sm font-semibold text-orange-700 hover:bg-orange-50 disabled:opacity-50">
                      <RotateCcw className="w-4 h-4" /> Needs revision
                    </button>
                    <button type="button" disabled={submitting} onClick={() => handleReviewTask("declined")} className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 px-3 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-50 disabled:opacity-50">
                      <Ban className="w-4 h-4" /> Decline
                    </button>
                    <button type="button" disabled={submitting} onClick={() => handleReviewTask("approved")} className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50">
                      <CheckCircle2 className="w-4 h-4" /> Approve
                    </button>
                  </div>
                </>
              ) : (
                <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
                  This response has already been marked <span className="font-semibold">{reviewTask.status.replace("_", " ")}</span>.
                  {reviewTask.reviewNote && <p className="mt-2 whitespace-pre-wrap">{reviewTask.reviewNote}</p>}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── ASSIGN TASK MODAL ──────────────────────────────── */}
      {assignTask && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-start justify-between gap-4 bg-slate-50">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">Assign task</p>
                <h2 className="font-display font-bold text-slate-900 text-lg mt-1">{assignTask.title}</h2>
                <p className="text-xs text-slate-500 mt-1">Choose a member to assign this task to.</p>
              </div>
              <button
                onClick={() => setAssignTask(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
                aria-label="Close assign task dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              <label className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 focus-within:border-indigo-500">
                <Search className="w-4 h-4 text-slate-400" />
                <input
                  type="search"
                  value={memberSearch}
                  onChange={(event) => setMemberSearch(event.target.value)}
                  placeholder="Search by name, email, or department"
                  className="w-full text-sm outline-none placeholder:text-slate-400"
                  autoFocus
                />
              </label>

              <div className="mt-3 max-h-64 overflow-y-auto space-y-1">
                {members
                  .filter((member) => {
                    const query = memberSearch.trim().toLowerCase();
                    return (
                      query.length === 0 ||
                      member.name.toLowerCase().includes(query) ||
                      member.instituteEmail.toLowerCase().includes(query) ||
                      member.designation.toLowerCase().includes(query)
                    );
                  })
                  .map((member) => (
                    <button
                      key={member._id}
                      type="button"
                      disabled={assigning}
                      onClick={() => handleAssignTask(member._id)}
                      className="w-full flex items-center gap-3 rounded-xl px-3 py-3 text-left hover:bg-indigo-50 disabled:opacity-50 transition-colors"
                    >
                      <span className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-sm font-bold flex-shrink-0">
                        {member.name.charAt(0).toUpperCase()}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-semibold text-slate-900 truncate">{member.name}</span>
                        <span className="block text-xs text-slate-500 truncate">{member.designation} · {member.instituteEmail}</span>
                      </span>
                      <ArrowRight className="w-4 h-4 text-slate-300 flex-shrink-0" />
                    </button>
                  ))}
                {members.filter((member) => {
                  const query = memberSearch.trim().toLowerCase();
                  return query.length === 0 || member.name.toLowerCase().includes(query) || member.instituteEmail.toLowerCase().includes(query) || member.designation.toLowerCase().includes(query);
                }).length === 0 && (
                  <p className="py-6 text-center text-sm text-slate-500">No matching members found.</p>
                )}
              </div>
              {assignError && <p className="mt-3 text-sm text-rose-600">{assignError}</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
