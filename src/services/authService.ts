import bcrypt from "bcryptjs";
import { User } from "../models/userModel";
import { generateToken } from "../utils/jwt";
import { ApiError } from "../utils/apiError";

export interface RegisterDTO {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export class AuthService {
  static async registerUser(data: RegisterDTO) {
    const { name, email, password, phone } = data;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new ApiError(409, "An account with this email already exists");
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      phone: phone || "",
      avatarUrl: "",
    });

    const token = generateToken({
      userId: (user._id as any).toString(),
      email: user.email,
    });

    const sanitizedUser = {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      avatarUrl: user.avatarUrl,
      createdAt: user.createdAt,
    };

    return { user: sanitizedUser, token };
  }

  static async loginUser(data: LoginDTO) {
    const { email, password } = data;

    const user = await User.findOne({ email }).select("+password");
    if (!user || !user.password) {
      throw new ApiError(401, "Invalid email or password");
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new ApiError(401, "Invalid email or password");
    }

    const token = generateToken({
      userId: (user._id as any).toString(),
      email: user.email,
    });

    const sanitizedUser = {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      avatarUrl: user.avatarUrl,
      createdAt: user.createdAt,
    };

    return { user: sanitizedUser, token };
  }

  static async getCurrentUser(userId: string) {
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, "User profile not found");
    }

    return {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      avatarUrl: user.avatarUrl,
      createdAt: user.createdAt,
    };
  }
}
