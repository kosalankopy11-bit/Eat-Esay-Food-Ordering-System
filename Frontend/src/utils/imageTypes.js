export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
export const ALLOWED_IMAGE_ACCEPT = ".jpg,.jpeg,.png,.webp,.gif,image/jpeg,image/png,image/webp,image/gif";
export const ALLOWED_IMAGE_ERROR = "Only JPG, JPEG, PNG, WEBP and GIF files are allowed";

export function isAllowedImageType(file) {
  return ALLOWED_IMAGE_TYPES.includes(file.type);
}
