import mongoose, { Schema, Types } from "mongoose";

/* =========================
   Message (subdocument)
   ========================= */

export interface Message {
  _id: Types.ObjectId;
  content: string;
  createdAt: Date;
  reply?: {
    content: string;
    createdAt: Date;
  };
}

const MessageSchema = new Schema<Message>({
  content: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  reply: {
    content: {
      type: String,
    },
    createdAt: {
      type: Date,
    },
  },
});

export interface User extends mongoose.Document {
  username: string;
  email: string;
  password: string;
  verifyCode?: string;        
  verifyCodeExpiry?: Date;    
  isVerified: boolean;
  isAcceptingMessages: boolean;
  messages: Message[];
  twoFactorCode?: string;
  twoFactorCodeExpiry?: Date;
}


const UserSchema = new Schema<User>({
  username: {
    type: String,
    required: [true, "Username is required"],
    trim: true,
    unique: true,
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    match: [/.+\@.+\..+/, "Please use a valid email address"],
  },
  password: {
    type: String,
    required: [true, "Password is required"],
  },
  verifyCode: {
    type: String,
    required: [true, "Verify Code is required"],
  },
  verifyCodeExpiry: {
    type: Date,
    required: [true, "Verify Code Expiry is required"],
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  isAcceptingMessages: {
    type: Boolean,
    default: true,
  },
  messages: {
    type: [MessageSchema],
    default: [],
  },
  twoFactorCode: {
    type: String,
  },
  twoFactorCodeExpiry: {
    type: Date,
  },
});

const UserModel =
  (mongoose.models.User as mongoose.Model<User>) ||
  mongoose.model<User>("User", UserSchema);

export default UserModel;
