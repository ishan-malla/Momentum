import User from "../models/userSchema.js";
import {
  deleteCloudinaryImage,
  isCloudinaryConfigured,
  uploadAvatarFromDataUri,
} from "../utils/cloudinaryAvatarService.js";
import { toProfile } from "../utils/profileMapper.js";

const MAX_AVATAR_BASE64_BYTES = 5 * 1024 * 1024;

const isImageDataUri = (value) => {
  return /^data:image\/[a-zA-Z0-9.+-]+;base64,/.test(value);
};

const estimateDataUriBytes = (dataUri) => {
  const [, base64Payload = ""] = dataUri.split(",", 2);
  return Math.floor((base64Payload.length * 3) / 4);
};

export const uploadAvatar = async (req, res) => {
  try {
    const { imageDataUrl } = req.body ?? {};

    if (!isCloudinaryConfigured()) {
      return res.status(500).json({ message: "Avatar upload is not configured" });
    }

    if (typeof imageDataUrl !== "string" || imageDataUrl.trim().length === 0) {
      return res.status(400).json({ message: "Provide avatar image data" });
    }

    const normalizedImageDataUrl = imageDataUrl.trim();
    if (!isImageDataUri(normalizedImageDataUrl)) {
      return res.status(400).json({ message: "Avatar must be a valid image file" });
    }

    const estimatedBytes = estimateDataUriBytes(normalizedImageDataUrl);
    if (estimatedBytes > MAX_AVATAR_BASE64_BYTES) {
      return res.status(400).json({ message: "Image must be 5MB or smaller" });
    }

    const upload = await uploadAvatarFromDataUri({
      dataUri: normalizedImageDataUrl,
      userId: req.user._id,
    });

    const previousAvatarPublicId = req.user.avatarPublicId || "";

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      {
        $set: {
          avatarUrl: upload.url,
          avatarPublicId: upload.publicId,
        },
      },
      {
        new: true,
        runValidators: true,
      },
    ).select("-password -otp -otpExpiry -otpVerified");

    if (previousAvatarPublicId && previousAvatarPublicId !== upload.publicId) {
      deleteCloudinaryImage(previousAvatarPublicId).catch((error) => {
        console.error("Cloudinary delete previous avatar error", error.message);
      });
    }

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      message: "Avatar uploaded",
      profile: toProfile(updatedUser),
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to upload avatar",
      error: error.message,
    });
  }
};

export const removeAvatar = async (req, res) => {
  try {
    const avatarPublicId = req.user.avatarPublicId || "";

    if (avatarPublicId && isCloudinaryConfigured()) {
      await deleteCloudinaryImage(avatarPublicId);
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      {
        $set: {
          avatarUrl: "",
          avatarPublicId: "",
        },
      },
      {
        new: true,
        runValidators: true,
      },
    ).select("-password -otp -otpExpiry -otpVerified");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      message: "Avatar removed",
      profile: toProfile(updatedUser),
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to remove avatar",
      error: error.message,
    });
  }
};
