export function sitePath(path: string): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const basePath =
    typeof document !== "undefined"
      ? document.documentElement.dataset.siteBasePath ?? ""
      : typeof process !== "undefined"
        ? process.env.NEXT_PUBLIC_BASE_PATH ?? ""
        : "";

  if (!basePath) return normalizedPath;
  const normalizedBase = `/${basePath.replace(/^\/+|\/+$/g, "")}`;
  return `${normalizedBase}${normalizedPath}`;
}
