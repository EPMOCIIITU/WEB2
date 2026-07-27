/**
 * models/Event.ts — Event schema for EPMOC
 */

import mongoose, { Document, Model, Schema } from "mongoose";

export type EventCategory =
  | "technical"
  | "cultural"
  | "management"
  | "workshop"
  | "seminar"
  | "other";

export interface IEvent extends Document {
  title: string;
  description: string;
  date: Date;
  venue: string;
  category: EventCategory;
  isPublished: boolean;
  createdBy: string; // clerkUserId
  posterUrl?: string;
  registrationLink?: string;
  createdAt: Date;
  updatedAt: Date;
}

const EVENT_CATEGORIES: EventCategory[] = [
  "technical",
  "cultural",
  "management",
  "workshop",
  "seminar",
  "other",
];

const EventSchema = new Schema<IEvent>(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      maxlength: [2000, "Description cannot exceed 2000 characters"],
    },
    date: {
      type: Date,
      required: [true, "Event date is required"],
    },
    venue: {
      type: String,
      required: [true, "Venue is required"],
      trim: true,
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: EVENT_CATEGORIES,
      default: "other",
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: String,
      required: [true, "Creator is required"],
    },
    posterUrl: {
      type: String,
      trim: true,
    },
    registrationLink: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

EventSchema.index({ date: -1 });
EventSchema.index({ isPublished: 1, date: -1 });

const Event: Model<IEvent> =
  (mongoose.models.Event as Model<IEvent>) ||
  mongoose.model<IEvent>("Event", EventSchema);

export default Event;
