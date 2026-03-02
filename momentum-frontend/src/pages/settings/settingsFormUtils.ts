export const USERNAME_MIN_LENGTH = 3;
export const USERNAME_MAX_LENGTH = 10;
export const BIO_MAX_LENGTH = 200;
export const MAX_AVATAR_SIZE_BYTES = 5 * 1024 * 1024;

export const toImageDataUrl = (file: File) => {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
        return;
      }
      reject(new Error("Invalid image file"));
    };
    reader.onerror = () => reject(new Error("Could not read image file"));
    reader.readAsDataURL(file);
  });
};

export const getApiErrorMessage = (
  error: unknown,
  fallbackMessage: string,
) => {
  return (
    (error as { data?: { message?: string } })?.data?.message || fallbackMessage
  );
};
