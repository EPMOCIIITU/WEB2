import mongoose, { Document, Model, Schema } from "mongoose";

export type TaskStatus = "assigned" | "submitted" | "needs_improvement" | "completed";

export interface ITask extends Document {
  title: string;
  description: string;
  dueDate?: Date;
  assignedToId: string;
  assignedToName: string;
  assignedById: string;
  assignedByName: string;
  status: TaskStatus;
  submissionText?: string;
  submissionLink?: string;
  submittedAt?: Date;
  reviewerRemarks?: string;
  reviewedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const TaskSchema = new Schema<ITask>({
  title: { type: String, required: true, trim: true, maxlength: 160 },
  description: { type: String, required: true, trim: true, maxlength: 4000 },
  dueDate: Date,
  assignedToId: { type: String, required: true, index: true },
  assignedToName: { type: String, required: true, trim: true },
  assignedById: { type: String, required: true, index: true },
  assignedByName: { type: String, required: true, trim: true },
  status: { type: String, enum: ["assigned", "submitted", "needs_improvement", "completed"], default: "assigned", index: true },
  submissionText: { type: String, trim: true, maxlength: 5000 },
  submissionLink: { type: String, trim: true, maxlength: 1000 },
  submittedAt: Date,
  reviewerRemarks: { type: String, trim: true, maxlength: 3000 },
  reviewedAt: Date,
}, { timestamps: true });

TaskSchema.index({ assignedToId: 1, status: 1, createdAt: -1 });
TaskSchema.index({ assignedById: 1, status: 1, createdAt: -1 });

const Task: Model<ITask> = mongoose.models.Task as Model<ITask> || mongoose.model<ITask>("Task", TaskSchema);
export default Task;
