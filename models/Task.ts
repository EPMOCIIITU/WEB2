import mongoose, { Document, Model, Schema } from "mongoose";

export interface ITask extends Document {
  title: string;
  description: string;
  assignedTo: mongoose.Types.ObjectId | null;
  assignedBy: mongoose.Types.ObjectId;
  status: "todo" | "in_progress" | "pending_review" | "needs_revision" | "declined" | "approved" | "completed";
  priority: "low" | "medium" | "high";
  dueDate?: Date;
  workLink?: string;
  submissionNote?: string;
  reviewNote?: string;
  submittedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const TaskSchema = new Schema<ITask>(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: "Member",
      default: null,
    },
    assignedBy: {
      type: Schema.Types.ObjectId,
      ref: "Member",
      required: true,
    },
    status: {
      type: String,
      enum: ["todo", "in_progress", "pending_review", "needs_revision", "declined", "approved", "completed"],
      default: "todo",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    dueDate: {
      type: Date,
      default: null,
    },
    workLink: {
      type: String,
      trim: true,
    },
    submissionNote: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    reviewNote: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    submittedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

const Task: Model<ITask> =
  (mongoose.models.Task as Model<ITask>) ||
  mongoose.model<ITask>("Task", TaskSchema);

export default Task;
