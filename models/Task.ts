import mongoose, { Document, Model, Schema } from "mongoose";

export type TaskStatus = "open" | "assigned" | "submitted" | "needs_improvement" | "completed";

export interface ITask extends Document {
  title: string;
  description: string;
  dueDate?: Date;
  createdBy: mongoose.Types.ObjectId;    // required — who created the task
  assignedTo?: mongoose.Types.ObjectId;  // optional — can be assigned after creation
  assignedBy?: mongoose.Types.ObjectId;  // optional — who did the assigning
  status: TaskStatus;
  submissionText?: string;
  submissionLink?: string;
  submittedAt?: Date;
  reviewerRemarks?: string;
  reviewedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const TaskSchema = new Schema<ITask>(
  {
    title: { type: String, required: true, trim: true, maxlength: 160 },
    description: { type: String, required: true, trim: true, maxlength: 4000 },
    dueDate: Date,
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Member",
      required: true,
      index: true,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Member",
      default: null,
      index: true,
    },
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Member",
      default: null,
    },
    status: {
      type: String,
      enum: ["open", "assigned", "submitted", "needs_improvement", "completed"],
      default: "open",
      index: true,
    },
    submissionText: { type: String, trim: true, maxlength: 5000 },
    submissionLink: { type: String, trim: true, maxlength: 1000 },
    submittedAt: Date,
    reviewerRemarks: { type: String, trim: true, maxlength: 3000 },
    reviewedAt: Date,
  },
  { timestamps: true }
);

TaskSchema.index({ createdBy: 1, status: 1, createdAt: -1 });
TaskSchema.index({ assignedTo: 1, status: 1, createdAt: -1 });
TaskSchema.index({ assignedBy: 1, status: 1, createdAt: -1 });

const Task: Model<ITask> =
  mongoose.models.Task as Model<ITask> ||
  mongoose.model<ITask>("Task", TaskSchema);

export default Task;
