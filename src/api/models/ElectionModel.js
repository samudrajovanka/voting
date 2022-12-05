import mongoose from 'mongoose';

import { BaseSchema } from '@/lib/database/mongoose';

const ElectionModel = new BaseSchema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    bannerUrl: {
      type: String,
      required: true,
      trim: true
    },
    endDate: {
      type: Date,
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: ["CREATED", "ONGOING", "FINISHED"],
    },
    candidates: [
      {
        name: {
          type: String,
          required: true,
          trim: true
        },
        photo: {
          url: {
            type: String,
            required: true,
            trim: true
          }
        },
        mission: [
          {
            type: String,
            required: true,
            trim: true
          }
        ],
        vision: {
          type: String,
          required: true,
          trim: true
        },
        program: [
          {
            type: String,
            required: true,
            trim: true
          }
        ],
        totalVote: {
          type: Number,
          required: true,
          default: 0
        }
      }
    ],
    slug: {
      type: String,
      required: true,
      trim: true
    },
    participants: [
      {
        name: {
          type: String,
          required: true,
          trim: true
        },
        email: {
          type: String,
          required: true,
          trim: true
        },
        vote: {
          type: Boolean,
          required: true,
          default: false
        }
      }
    ],
  }
)

export default mongoose.models?.Election || mongoose.model('Election', ElectionModel);
