import crypto from "crypto";

const CLOUDINARY_BASE_URL = "https://api.cloudinary.com/v1_1";
const DEFAULT_AVATAR_FOLDER = "momentum/avatars";

const getCloudinaryConfig = () => {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  const avatarFolder = process.env.CLOUDINARY_AVATAR_FOLDER || DEFAULT_AVATAR_FOLDER;

  if (!cloudName || !apiKey || !apiSecret) {
    return null;
  }

  return { cloudName, apiKey, apiSecret, avatarFolder };
};

const buildSignature = (params, apiSecret) => {
  const query = Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== null && value !== "")
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join("&");

  return crypto
    .createHash("sha1")
    .update(`${query}${apiSecret}`)
    .digest("hex");
};

const parseCloudinaryError = async (response) => {
  const payload = await response.json().catch(() => null);
  if (payload?.error?.message) {
    return payload.error.message;
  }
  return "Cloudinary request failed";
};

export const isCloudinaryConfigured = () => Boolean(getCloudinaryConfig());

export const uploadAvatarFromDataUri = async ({ dataUri, userId }) => {
  const config = getCloudinaryConfig();
  if (!config) {
    throw new Error("Cloudinary is not configured");
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const publicId = `avatar_${String(userId)}_${Date.now()}`;
  const signParams = {
    folder: config.avatarFolder,
    public_id: publicId,
    timestamp,
  };
  const signature = buildSignature(signParams, config.apiSecret);

  const body = new URLSearchParams({
    file: dataUri,
    api_key: config.apiKey,
    timestamp: String(timestamp),
    folder: config.avatarFolder,
    public_id: publicId,
    signature,
  });

  const response = await fetch(
    `${CLOUDINARY_BASE_URL}/${config.cloudName}/image/upload`,
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
    },
  );

  if (!response.ok) {
    const message = await parseCloudinaryError(response);
    throw new Error(message);
  }

  const payload = await response.json();
  if (!payload?.secure_url || !payload?.public_id) {
    throw new Error("Invalid Cloudinary upload response");
  }

  return {
    url: payload.secure_url,
    publicId: payload.public_id,
  };
};

export const deleteCloudinaryImage = async (publicId) => {
  if (!publicId) return;

  const config = getCloudinaryConfig();
  if (!config) {
    throw new Error("Cloudinary is not configured");
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const signParams = { public_id: publicId, timestamp };
  const signature = buildSignature(signParams, config.apiSecret);

  const body = new URLSearchParams({
    public_id: publicId,
    api_key: config.apiKey,
    timestamp: String(timestamp),
    invalidate: "true",
    signature,
  });

  const response = await fetch(
    `${CLOUDINARY_BASE_URL}/${config.cloudName}/image/destroy`,
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
    },
  );

  if (!response.ok) {
    const message = await parseCloudinaryError(response);
    throw new Error(message);
  }
};
