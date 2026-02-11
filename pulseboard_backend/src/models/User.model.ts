import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  provider: "local" | "google";
  googleId?: string;
  password?: string;
  year?: number;
  branch?: string;
  following: number[];
  avatar?: string;
  isCoreMember: boolean;
  coreMembership?: {
    clubId: string;
    clubName: string;
    clubColor: string;
    clubIcon: string;
    role: "core" | "admin" | "moderator";
  };
}

const UserSchema: Schema = new Schema(
  {
    name: { type: String, required: true },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    provider: {
      type: String,
      enum: ["local", "google"],
      required: true,
    },

    googleId: {
      type: String,
      required: function (this: any) {
        return this.provider === "google";
      },
    },

    password: {
      type: String,
      required: function (this: any) {
        return this.provider === "local";
      },
    },

    year: Number,
    branch: String,

    following: {
      type: [Number],
      default: [],
    },
    
    avatar: {
      type: String,
      default: ''
    },

    // NEW FIELDS FOR CORE MEMBER FUNCTIONALITY
    isCoreMember: {
      type: Boolean,
      default: false,
    },

    coreMembership: {
      clubId: { type: String },
      clubName: { type: String },
      clubColor: { type: String },
      clubIcon: { type: String },
      role: {
        type: String,
        enum: ["core", "admin", "moderator"],
        default: "core",
      },
    },
  },
  { timestamps: true }
);

const User: Model<IUser> = mongoose.model<IUser>("User", UserSchema);
export default User;