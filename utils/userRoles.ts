/** Normalize role entries from API (`"user"` | `{ name: "user" }`). */
export function getRoleNames(roles: unknown): string[] {
  if (!Array.isArray(roles)) return [];

  return roles
    .map((role) => {
      if (typeof role === "string") return role.trim().toLowerCase();
      if (role && typeof role === "object" && "name" in role) {
        const name = (role as { name?: unknown }).name;
        return typeof name === "string" ? name.trim().toLowerCase() : "";
      }
      return "";
    })
    .filter(Boolean);
}

/**
 * Admin-only accounts (admin role, no user role) cannot use the customer app.
 * Users with a `user` role may enter even if they also have `admin`.
 */
export function isAdminOnlyAccount(
  userOrRoles: { roles?: unknown } | unknown,
): boolean {
  const roles = getRoleNames(
    userOrRoles &&
      typeof userOrRoles === "object" &&
      "roles" in (userOrRoles as object)
      ? (userOrRoles as { roles?: unknown }).roles
      : userOrRoles,
  );

  if (roles.length === 0) return false;

  const hasAdmin = roles.includes("admin");
  const hasUser = roles.includes("user");

  return hasAdmin && !hasUser;
}
