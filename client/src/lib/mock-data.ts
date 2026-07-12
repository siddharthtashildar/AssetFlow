// Enterprise mock data for AssetFlow
export type AssetStatus = "available" | "allocated" | "maintenance" | "retired";
export type AssetCondition = "excellent" | "good" | "fair" | "poor";

export interface Asset {
  id: string;
  tag: string;
  name: string;
  category: string;
  serial: string;
  status: AssetStatus;
  condition: AssetCondition;
  location: string;
  assignee: string | null;
  department: string;
  cost: number;
  purchaseDate: string;
  warrantyUntil: string;
  image: string;
  shared: boolean;
}

export const departments = [
  { id: "D-01", name: "Engineering", head: "Priya Raghavan", employees: 142, assets: 486, code: "ENG" },
  { id: "D-02", name: "Product Design", head: "Marcus Whitfield", employees: 34, assets: 118, code: "PRD" },
  { id: "D-03", name: "Finance & Ops", head: "Amelia Chen", employees: 27, assets: 89, code: "FIN" },
  { id: "D-04", name: "People & Culture", head: "Rahul Verma", employees: 18, assets: 54, code: "HR" },
  { id: "D-05", name: "Sales & Growth", head: "Zoe Nakamura", employees: 76, assets: 214, code: "SLS" },
  { id: "D-06", name: "Customer Success", head: "Diego Alvarez", employees: 52, assets: 168, code: "CS" },
  { id: "D-07", name: "IT Infrastructure", head: "Nina Kowalski", employees: 21, assets: 302, code: "IT" },
  { id: "D-08", name: "Legal & Compliance", head: "Jonas Weber", employees: 9, assets: 31, code: "LGL" },
];

export const categories = [
  { id: "C-01", name: "Laptops & Workstations", count: 412, icon: "Laptop", depreciation: "3 years" },
  { id: "C-02", name: "Mobile Devices", count: 218, icon: "Smartphone", depreciation: "2 years" },
  { id: "C-03", name: "Monitors & Displays", count: 384, icon: "Monitor", depreciation: "5 years" },
  { id: "C-04", name: "Networking Equipment", count: 96, icon: "Wifi", depreciation: "5 years" },
  { id: "C-05", name: "Meeting Room Systems", count: 42, icon: "Video", depreciation: "5 years" },
  { id: "C-06", name: "Office Furniture", count: 640, icon: "Armchair", depreciation: "7 years" },
  { id: "C-07", name: "Vehicles", count: 12, icon: "Car", depreciation: "8 years" },
  { id: "C-08", name: "Lab & Test Equipment", count: 58, icon: "FlaskConical", depreciation: "6 years" },
];

const firstNames = ["Aarav", "Priya", "Marcus", "Zoe", "Diego", "Nina", "Rahul", "Amelia", "Jonas", "Sana", "Kenji", "Isabela", "Liam", "Chloe", "Omar", "Freya", "Ravi", "Elena", "Noah", "Mei"];
const lastNames = ["Sharma", "Whitfield", "Chen", "Nakamura", "Alvarez", "Kowalski", "Verma", "Raghavan", "Weber", "Ibrahim", "Tanaka", "Costa", "O'Neill", "Dubois", "Hassan", "Lindqvist", "Patel", "Rossi", "Kim", "Nguyen"];

export const employees = Array.from({ length: 32 }, (_, i) => {
  const fn = firstNames[i % firstNames.length];
  const ln = lastNames[(i * 3) % lastNames.length];
  const dept = departments[i % departments.length];
  return {
    id: `EMP-${(1024 + i).toString()}`,
    name: `${fn} ${ln}`,
    email: `${fn.toLowerCase()}.${ln.toLowerCase().replace(/[^a-z]/g, "")}@assetflow.io`,
    role: ["Senior Engineer", "Product Manager", "Designer", "Analyst", "Director", "Lead", "Coordinator", "Specialist"][i % 8],
    department: dept.name,
    status: i % 11 === 0 ? "on-leave" : "active",
    location: ["San Francisco", "London", "Berlin", "Bangalore", "Singapore", "Toronto"][i % 6],
    joined: `202${1 + (i % 4)}-0${1 + (i % 9)}-1${i % 9}`,
  };
});

const assetNames = [
  { name: "MacBook Pro 16\" M3 Max", cat: "Laptops & Workstations", img: "💻" },
  { name: "Dell XPS 15 Developer Edition", cat: "Laptops & Workstations", img: "💻" },
  { name: "ThinkPad X1 Carbon Gen 11", cat: "Laptops & Workstations", img: "💻" },
  { name: "iPhone 15 Pro", cat: "Mobile Devices", img: "📱" },
  { name: "Pixel 8 Pro", cat: "Mobile Devices", img: "📱" },
  { name: "Dell UltraSharp 32\" 4K", cat: "Monitors & Displays", img: "🖥️" },
  { name: "LG 34\" Curved Ultrawide", cat: "Monitors & Displays", img: "🖥️" },
  { name: "Cisco Catalyst 9300", cat: "Networking Equipment", img: "📡" },
  { name: "Logitech Rally Bar", cat: "Meeting Room Systems", img: "🎥" },
  { name: "Herman Miller Aeron", cat: "Office Furniture", img: "🪑" },
  { name: "Standing Desk Pro", cat: "Office Furniture", img: "🗄️" },
  { name: "Tesla Model 3 (Fleet)", cat: "Vehicles", img: "🚗" },
  { name: "Oscilloscope Tektronix MDO4", cat: "Lab & Test Equipment", img: "🔬" },
  { name: "iPad Pro 12.9\" M2", cat: "Mobile Devices", img: "📱" },
  { name: "Framework Laptop 16", cat: "Laptops & Workstations", img: "💻" },
];

const locations = ["HQ - Floor 3", "HQ - Floor 5", "SF Warehouse", "London Office", "Berlin Hub", "Bangalore R&D", "Singapore Ops", "Toronto Studio"];

export const assets: Asset[] = Array.from({ length: 64 }, (_, i) => {
  const a = assetNames[i % assetNames.length];
  const emp = employees[i % employees.length];
  const statuses: AssetStatus[] = ["available", "allocated", "allocated", "allocated", "maintenance", "available", "retired"];
  const conditions: AssetCondition[] = ["excellent", "good", "good", "fair", "excellent", "poor"];
  const status = statuses[i % statuses.length];
  return {
    id: `AST-${(10240 + i).toString()}`,
    tag: `AF-${(2024000 + i).toString()}`,
    name: a.name,
    category: a.cat,
    serial: `SN${Math.random().toString(36).slice(2, 10).toUpperCase()}`,
    status,
    condition: conditions[i % conditions.length],
    location: locations[i % locations.length],
    assignee: status === "allocated" ? emp.name : null,
    department: emp.department,
    cost: [1299, 2499, 899, 3499, 1199, 599, 4299, 8999, 249, 149][i % 10] * 1,
    purchaseDate: `202${1 + (i % 4)}-${String(1 + (i % 12)).padStart(2, "0")}-${String(1 + (i % 27)).padStart(2, "0")}`,
    warrantyUntil: `202${5 + (i % 3)}-${String(1 + (i % 12)).padStart(2, "0")}-${String(1 + (i % 27)).padStart(2, "0")}`,
    image: a.img,
    shared: i % 7 === 0,
  };
});

export const maintenanceRequests = [
  { id: "MNT-2041", asset: "MacBook Pro 16\" M3 Max", assetTag: "AF-2024031", priority: "high", status: "pending", requester: "Priya Raghavan", technician: null, created: "2h ago", issue: "Battery not charging beyond 60%", comments: 3 },
  { id: "MNT-2040", asset: "Dell UltraSharp 32\" 4K", assetTag: "AF-2024018", priority: "medium", status: "approved", requester: "Marcus Whitfield", technician: "IT Team Alpha", created: "5h ago", issue: "Screen flickering intermittently", comments: 1 },
  { id: "MNT-2039", asset: "Cisco Catalyst 9300", assetTag: "AF-2024003", priority: "critical", status: "in-progress", requester: "Nina Kowalski", technician: "Network Ops", created: "1d ago", issue: "Port failures on VLAN 200", comments: 8 },
  { id: "MNT-2038", asset: "Herman Miller Aeron", assetTag: "AF-2024055", priority: "low", status: "assigned", requester: "Zoe Nakamura", technician: "Facilities", created: "1d ago", issue: "Lumbar adjustment broken", comments: 0 },
  { id: "MNT-2037", asset: "Logitech Rally Bar", assetTag: "AF-2024022", priority: "medium", status: "in-progress", requester: "Diego Alvarez", technician: "AV Team", created: "2d ago", issue: "Microphone pickup weak in room", comments: 4 },
  { id: "MNT-2036", asset: "iPhone 15 Pro", assetTag: "AF-2024047", priority: "high", status: "resolved", requester: "Rahul Verma", technician: "IT Team Alpha", created: "3d ago", issue: "Cracked screen after drop", comments: 2 },
  { id: "MNT-2035", asset: "Tesla Model 3 (Fleet)", assetTag: "AF-2024061", priority: "medium", status: "pending", requester: "Amelia Chen", technician: null, created: "4h ago", issue: "Tire pressure warning", comments: 0 },
  { id: "MNT-2034", asset: "ThinkPad X1 Carbon", assetTag: "AF-2024012", priority: "low", status: "resolved", requester: "Jonas Weber", technician: "IT Team Beta", created: "4d ago", issue: "Keyboard key replacement", comments: 1 },
  { id: "MNT-2033", asset: "LG 34\" Curved Ultrawide", assetTag: "AF-2024029", priority: "high", status: "assigned", requester: "Kenji Tanaka", technician: "IT Team Beta", created: "6h ago", issue: "Dead pixels visible in corner", comments: 2 },
];

export const bookings = [
  { id: "BK-501", resource: "Conference Room — Aurora", requester: "Priya Raghavan", start: "09:00", end: "10:30", date: "Today", status: "confirmed", attendees: 8 },
  { id: "BK-502", resource: "Tesla Model 3 (Fleet)", requester: "Marcus Whitfield", start: "11:00", end: "17:00", date: "Today", status: "confirmed", attendees: 2 },
  { id: "BK-503", resource: "Rally Bar — Studio B", requester: "Diego Alvarez", start: "14:00", end: "15:00", date: "Today", status: "pending", attendees: 12 },
  { id: "BK-504", resource: "Conference Room — Nebula", requester: "Zoe Nakamura", start: "10:00", end: "11:00", date: "Tomorrow", status: "confirmed", attendees: 6 },
  { id: "BK-505", resource: "Oscilloscope Tektronix MDO4", requester: "Nina Kowalski", start: "13:00", end: "17:00", date: "Tomorrow", status: "confirmed", attendees: 1 },
  { id: "BK-506", resource: "Conference Room — Cosmos", requester: "Amelia Chen", start: "15:30", end: "16:30", date: "Fri", status: "conflict", attendees: 4 },
];

export const audits = [
  { id: "AUD-2024-Q1", name: "Q1 2024 IT Inventory Audit", scope: "IT & Networking Equipment", assigned: "Nina Kowalski", progress: 87, total: 302, verified: 263, discrepancies: 4, due: "Mar 31, 2024", status: "in-progress" },
  { id: "AUD-2024-Q1-HW", name: "Q1 Workstations Cycle Count", scope: "Laptops & Workstations", assigned: "Priya Raghavan", progress: 100, total: 412, verified: 412, discrepancies: 2, due: "Feb 28, 2024", status: "completed" },
  { id: "AUD-2024-FUR", name: "Annual Furniture Audit", scope: "Office Furniture — HQ", assigned: "Rahul Verma", progress: 42, total: 640, verified: 269, discrepancies: 11, due: "Apr 15, 2024", status: "in-progress" },
  { id: "AUD-2024-FLT", name: "Fleet & Vehicles Audit", scope: "Vehicles", assigned: "Amelia Chen", progress: 0, total: 12, verified: 0, discrepancies: 0, due: "May 10, 2024", status: "scheduled" },
];

export const notifications = [
  { id: 1, type: "maintenance", title: "New maintenance request", body: "Priya Raghavan opened MNT-2041 on MacBook Pro 16\"", time: "2 min ago", unread: true, priority: "high" },
  { id: 2, type: "booking", title: "Booking conflict detected", body: "Conference Room Cosmos has overlapping reservations", time: "18 min ago", unread: true, priority: "high" },
  { id: 3, type: "audit", title: "Audit AUD-2024-Q1 milestone", body: "87% verified — 39 assets remaining", time: "1 hr ago", unread: true, priority: "medium" },
  { id: 4, type: "transfer", title: "Transfer approved", body: "Dell XPS 15 moved from Berlin to Bangalore R&D", time: "3 hr ago", unread: false, priority: "low" },
  { id: 5, type: "allocation", title: "Asset allocated", body: "Marcus Whitfield received Framework Laptop 16", time: "Yesterday", unread: false, priority: "low" },
  { id: 6, type: "warranty", title: "Warranty expiring soon", body: "12 assets have warranties expiring in the next 30 days", time: "Yesterday", unread: false, priority: "medium" },
  { id: 7, type: "audit", title: "Discrepancy flagged", body: "AUD-2024-FUR: 4 chairs unaccounted for in HQ Floor 3", time: "2 days ago", unread: false, priority: "high" },
];

// Chart data
export const utilizationData = [
  { month: "Jul", available: 320, allocated: 812, maintenance: 42 },
  { month: "Aug", available: 298, allocated: 841, maintenance: 38 },
  { month: "Sep", available: 276, allocated: 869, maintenance: 51 },
  { month: "Oct", available: 264, allocated: 892, maintenance: 47 },
  { month: "Nov", available: 251, allocated: 918, maintenance: 44 },
  { month: "Dec", available: 238, allocated: 941, maintenance: 39 },
  { month: "Jan", available: 246, allocated: 933, maintenance: 52 },
];

export const maintenanceTrends = [
  { week: "W1", opened: 24, resolved: 21 },
  { week: "W2", opened: 32, resolved: 28 },
  { week: "W3", opened: 18, resolved: 24 },
  { week: "W4", opened: 27, resolved: 30 },
  { week: "W5", opened: 34, resolved: 29 },
  { week: "W6", opened: 22, resolved: 26 },
  { week: "W7", opened: 29, resolved: 31 },
  { week: "W8", opened: 25, resolved: 27 },
];

export const bookingTrends = [
  { day: "Mon", bookings: 42 },
  { day: "Tue", bookings: 58 },
  { day: "Wed", bookings: 71 },
  { day: "Thu", bookings: 63 },
  { day: "Fri", bookings: 49 },
  { day: "Sat", bookings: 12 },
  { day: "Sun", bookings: 8 },
];

export const departmentAllocation = departments.map((d) => ({
  name: d.name,
  value: d.assets,
}));
