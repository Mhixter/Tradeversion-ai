import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@workspace/replit-auth-web";

export type CompanyRole = "owner" | "admin" | "manager" | "trader" | "viewer" | null;

export interface CompanyRoleContext {
  role: CompanyRole;
  status: "active" | "pending" | "suspended" | null;
  companyId: string | null;
  companyName: string | null;
  isLoading: boolean;
  inCompany: boolean;
  /* permission helpers */
  isOwner: boolean;
  isAdmin: boolean;
  canManageMembers: boolean;
  canInvite: boolean;
  canExecuteTrades: boolean;
  canManageBots: boolean;
  canManageAllBots: boolean;
  canCreateStrategies: boolean;
  canManageRisk: boolean;
  canViewBilling: boolean;
  canViewAnalytics: boolean;
  canManageApiKeys: boolean;
  canManageCompanySettings: boolean;
}

const ROLE_ORDER: Record<NonNullable<CompanyRole>, number> = {
  owner: 5, admin: 4, manager: 3, trader: 2, viewer: 1,
};

function hasRole(current: CompanyRole, minimum: NonNullable<CompanyRole>): boolean {
  if (!current) return false;
  return (ROLE_ORDER[current] ?? 0) >= ROLE_ORDER[minimum];
}

function exactlyIn(current: CompanyRole, roles: NonNullable<CompanyRole>[]): boolean {
  return current !== null && roles.includes(current);
}

export function useCompanyRole(): CompanyRoleContext {
  const { user } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ["company-my-role"],
    queryFn: async () => {
      const res = await fetch("/api/company/my-role");
      if (!res.ok) throw new Error("Failed to fetch role");
      return res.json() as Promise<{ role: CompanyRole; status: string | null; companyId: string | null; companyName: string | null }>;
    },
    enabled: !!user,
    staleTime: 60_000,
  });

  const role = data?.role ?? null;
  const inCompany = role !== null;

  return {
    role,
    status: (data?.status ?? null) as CompanyRoleContext["status"],
    companyId: data?.companyId ?? null,
    companyName: data?.companyName ?? null,
    isLoading,
    inCompany,

    isOwner: role === "owner",
    isAdmin: exactlyIn(role, ["owner", "admin"]),
    canManageMembers: exactlyIn(role, ["owner", "admin"]),
    canInvite: exactlyIn(role, ["owner", "admin"]),
    canExecuteTrades: exactlyIn(role, ["owner", "admin", "trader"]),
    canManageBots: exactlyIn(role, ["owner", "admin", "manager", "trader"]),
    canManageAllBots: exactlyIn(role, ["owner", "admin", "manager"]),
    canCreateStrategies: exactlyIn(role, ["owner", "admin", "manager", "trader"]),
    canManageRisk: exactlyIn(role, ["owner", "admin", "manager"]),
    canViewBilling: role === "owner",
    canViewAnalytics: inCompany,
    canManageApiKeys: exactlyIn(role, ["owner", "admin"]),
    canManageCompanySettings: role === "owner",
  };
}
