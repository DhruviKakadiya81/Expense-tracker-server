import { User } from "../models/userModel";
import { ApiError } from "../utils/apiError";

export interface UpdateProfileDTO {
  name?: string;
  email?: string;
  phone?: string;
}

export class UserService {
  static async getProfile(userId: string) {
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, "User profile not found");
    }
    return user;
  }

  static async updateProfile(userId: string, currentEmail: string, data: UpdateProfileDTO) {
    const { name, email, phone } = data;

    // If changing email, check for uniqueness
    if (email && email !== currentEmail) {
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        throw new ApiError(409, "Email is already taken by another account");
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        ...(name ? { name } : {}),
        ...(email ? { email } : {}),
        ...(phone !== undefined ? { phone } : {}),
      },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      throw new ApiError(404, "User not found");
    }

    return updatedUser;
  }

  static async updateAvatar(userId: string, filename: string) {
    const avatarUrl = `/uploads/avatars/${filename}`;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { avatarUrl },
      { new: true }
    );

    if (!updatedUser) {
      throw new ApiError(404, "User not found");
    }

    return {
      avatarUrl,
      user: updatedUser,
    };
  }
}
