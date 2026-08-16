const DEFAULT_ALLOWED = [
  "images.unsplash.com",
  "res.cloudinary.com",
  "avatars.githubusercontent.com",
  "i.imgur.com",
  "cdn.discordapp.com",
  "lh3.googleusercontent.com",
  "firebasestorage.googleapis.com",
];

export function isValidImageUrl(u?: string | null): boolean {
  if (!u) return true;

  // Allow internal relative paths
  if (u.startsWith("/")) return true;

  try {
    const url = new URL(u);
    if (url.protocol !== "https:") return false;

    const allowed = (process.env.ALLOWED_IMAGE_HOSTS || DEFAULT_ALLOWED.join(",")).split(",").map((s) => s.trim());
    return allowed.includes(url.hostname);
  } catch {
    return false;
  }
}
