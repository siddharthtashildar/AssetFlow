const API_BASE_URL = "http://localhost:4000/api";

// Helper to make API requests with Authorization header automatically attached
async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(init?.headers as Record<string, string> ?? {}),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers,
  });

  if (response.status === 401) {
    // If unauthorized, clear token and redirect to login
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      // Check if we are not already on the login/register pages to avoid redirect loops
      if (window.location.pathname !== "/login" && window.location.pathname !== "/register") {
        window.location.href = "/login";
      }
    }
  }

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(payload?.error ?? "Request failed");
  }

  return payload as T;
}

// ----------------------------------------------------
// AUTH ENDPOINTS
// ----------------------------------------------------

export interface SystemStatusResponse {
  hasUsers: boolean;
}

export async function getSystemStatus(): Promise<SystemStatusResponse> {
  return request<SystemStatusResponse>("/auth/status");
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
}

export interface AuthResponse {
  token: string;
  user: UserProfile;
}

export async function login(payload: Record<string, any>): Promise<AuthResponse> {
  const result = await request<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  if (typeof window !== "undefined") {
    localStorage.setItem("token", result.token);
    localStorage.setItem("user", JSON.stringify(result.user));
  }

  return result;
}

export async function signup(payload: Record<string, any>): Promise<AuthResponse> {
  const result = await request<AuthResponse>("/auth/signup", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  return result;
}

export function getCurrentUser(): UserProfile | null {
  if (typeof window === "undefined") return null;
  const userStr = localStorage.getItem("user");
  if (!userStr) return null;
  try {
    return JSON.parse(userStr) as UserProfile;
  } catch {
    return null;
  }
}

export function logout() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  }
}

// ----------------------------------------------------
// ASSET ENDPOINTS
// ----------------------------------------------------

export interface AssetCategory {
  id: string;
  name: string;
  description?: string;
  depreciation?: string;
  _count?: {
    assets: number;
  };
}

export interface AssetRecord {
  id: string;
  assetTag: string;
  serialNumber: string | null;
  name: string;
  categoryId: string;
  category: { id: string; name: string };
  acquisitionDate: string | null;
  acquisitionCost: number | null;
  location: string | null;
  condition: string;
  status: string;
  isBookable: boolean;
  createdAt: string;
}

export async function getCategories(): Promise<AssetCategory[]> {
  return request<AssetCategory[]>("/categories");
}

export async function createCategory(payload: {
  name: string;
  description?: string;
  depreciation?: string;
}): Promise<AssetCategory> {
  return request<AssetCategory>("/categories", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function deleteCategory(id: string): Promise<{ id: string }> {
  return request<{ id: string }>(`/categories/${id}`, {
    method: "DELETE",
  });
}

export async function getAssets(filters?: {
  status?: string;
  category?: string;
  search?: string;
}): Promise<AssetRecord[]> {
  const params = new URLSearchParams();
  if (filters?.status) params.append("status", filters.status);
  if (filters?.category) params.append("category", filters.category);
  if (filters?.search) params.append("search", filters.search);

  const queryStr = params.toString();
  return request<AssetRecord[]>(`/assets${queryStr ? "?" + queryStr : ""}`);
}

export async function createAsset(payload: Record<string, any>): Promise<AssetRecord> {
  return request<AssetRecord>("/assets", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// ----------------------------------------------------
// ALLOCATION & TRANSFER ENDPOINTS
// ----------------------------------------------------

export interface AllocationRecord {
  id: string;
  assetId: string;
  asset: {
    id: string;
    name: string;
    assetTag: string;
    status: string;
    condition: string;
    location: string | null;
  };
  userId: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  expectedReturnDate: string | null;
  returnedAt: string | null;
  checkInNotes: string | null;
  status: string;
  createdAt: string;
}

export interface TransferRecord {
  id: string;
  allocationId: string;
  allocation: {
    id: string;
    asset: { id: string; name: string; assetTag: string };
    user: { id: string; name: string };
  };
  requestedById: string;
  requestedBy: { id: string; name: string; email: string };
  targetUserId: string;
  targetUser: { id: string; name: string; email: string };
  approvedById: string | null;
  approvedBy?: { id: string; name: string; email: string };
  status: string;
  createdAt: string;
}

export async function getAllocations(): Promise<AllocationRecord[]> {
  return request<AllocationRecord[]>("/allocations");
}

export async function createAllocation(payload: {
  assetId: string;
  userId: string;
  expectedReturnDate?: string;
}): Promise<AllocationRecord> {
  return request<AllocationRecord>("/allocations", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function requestReturn(allocationId: string): Promise<AllocationRecord> {
  return request<AllocationRecord>(`/allocations/${allocationId}/return-request`, {
    method: "POST",
  });
}

export async function completeReturn(
  allocationId: string,
  checkInNotes?: string
): Promise<AllocationRecord> {
  return request<AllocationRecord>(`/allocations/${allocationId}/return`, {
    method: "POST",
    body: JSON.stringify({ checkInNotes }),
  });
}

export async function getTransfers(): Promise<TransferRecord[]> {
  return request<TransferRecord[]>("/transfers");
}

export async function requestTransfer(payload: {
  allocationId: string;
  targetUserId: string;
}): Promise<TransferRecord> {
  return request<TransferRecord>("/transfers", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function processTransfer(
  transferId: string,
  action: "APPROVE" | "REJECT"
): Promise<TransferRecord> {
  return request<TransferRecord>(`/transfers/${transferId}/process`, {
    method: "POST",
    body: JSON.stringify({ action }),
  });
}

export interface UserRecord {
  id: string;
  name: string;
  email: string;
  role: string;
}

export async function getUsers(): Promise<UserRecord[]> {
  return request<UserRecord[]>("/users");
}

// ----------------------------------------------------
// AUDIT ENDPOINTS
// ----------------------------------------------------

export interface AuditAsset {
  id: string;
  name: string;
  assetTag: string;
  serialNumber: string | null;
  status: string;
  condition: string;
  location: string | null;
  category?: { id: string; name: string };
}

export interface AuditItemRecord {
  id: string;
  auditCycleId: string;
  assetId: string;
  asset: AuditAsset;
  auditorId: string;
  auditor: { id: string; name: string; email: string; role: string };
  result: "PENDING" | "VERIFIED" | "MISSING" | "DAMAGED";
  remarks: string | null;
  createdAt: string;
}

export interface AuditCycleRecord {
  id: string;
  title: string;
  departmentId: string | null;
  department: { id: string; name: string } | null;
  startDate: string;
  endDate: string;
  status: "OPEN" | "CLOSED";
  auditItems: AuditItemRecord[];
  createdAt: string;
}

export interface DepartmentRecord {
  id: string;
  name: string;
  status: string;
  parentDepartmentId: string | null;
  headId: string | null;
  createdAt: string;
}

export async function getAudits(): Promise<AuditCycleRecord[]> {
  return request<AuditCycleRecord[]>("/audits");
}

export async function createAuditCycle(payload: {
  title: string;
  startDate: string;
  endDate: string;
  departmentId?: string;
  categoryId?: string;
  auditorId: string;
}): Promise<AuditCycleRecord> {
  return request<AuditCycleRecord>("/audits", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateAuditItem(
  itemId: string,
  payload: { result: string; remarks?: string }
): Promise<AuditItemRecord> {
  return request<AuditItemRecord>(`/audits/items/${itemId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function closeAuditCycle(cycleId: string): Promise<AuditCycleRecord> {
  return request<AuditCycleRecord>(`/audits/${cycleId}/close`, {
    method: "POST",
  });
}

export async function getDepartments(): Promise<DepartmentRecord[]> {
  return request<DepartmentRecord[]>("/departments");
}
