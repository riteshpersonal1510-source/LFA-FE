"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Clock,
  Search,
  ChevronLeft,
  ChevronRight,
  Filter,
  Download,
  RefreshCw,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  StopCircle,
  Timer,
  Minus,
  Zap,
  Loader2,
  MapPin,
  Tag,
  CalendarDays,
  TrendingUp,
  Database,
  Copy,
  Globe,
} from "lucide-react";
import { io, Socket } from "socket.io-client";

// ── Types ──────────────────────────────────────────────────────────────────────
type SearchStatus =
  | "QUEUED"
  | "RUNNING"
  | "COMPLETED"
  | "FAILED"
  | "STOPPED"
  | "CANCELLED"
  | "TIMEOUT"
  | "PARTIAL_SUCCESS"
  | "NO_RESULTS"
  | "running"
  | "completed"
  | "failed"
  | "stopped";

interface SearchHistoryRecord {
  srNo: number;
  searchSessionId: string;
  keyword: string;
  category?: string;
  state?: string;
  city?: string;
  area?: string;
  country?: string;
  sources?: string[];
  status: SearchStatus;
  searchState?: string;
  startedAt?: string;
  completedAt?: string;
  stoppedAt?: string;
  duration?: number;
  totalLeads?: number;
  businessesFound?: number;
  businessesSaved?: number;
  duplicates?: number;
  rejected?: number;
  progress?: number;
  maxProgressReached?: number;
  failureReason?: string;
  failureClassification?: string;
  isRunning?: boolean;
  sourceBreakdown?: Record<string, number>;
  latestSearchDate?: string;
  firstSearchDate?: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function getSocketUrl(): string {
  const configured = process.env.NEXT_PUBLIC_SOCKET_URL;
  if (configured) return configured.replace(/\/$/, "");
  const api = process.env.NEXT_PUBLIC_API_URL;
  if (api) return api.replace(/\/api\/v1\/?$/, "").replace(/\/$/, "");
  if (typeof window !== "undefined") return window.location.origin;
  return "";
}

function getApiUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL || "/api/v1";
}

function convertToIST(dateStr?: string | null): string {
  if (!dateStr) return "—";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "—";
    return d.toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return "—";
  }
}

function formatDuration(seconds?: number): string {
  if (!seconds || seconds <= 0) return "—";
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m < 60) return s > 0 ? `${m}m ${s}s` : `${m}m`;
  const h = Math.floor(m / 60);
  const rem = m % 60;
  return rem > 0 ? `${h}h ${rem}m` : `${h}h`;
}

function normalizeStatus(status: SearchStatus): string {
  const upper = (status || "").toString().toUpperCase();
  if (upper === "COMPLETED" || upper === "COMPLETE") return "COMPLETED";
  if (upper === "FAILED" || upper === "FAIL") return "FAILED";
  if (upper === "STOPPED" || upper === "STOP") return "STOPPED";
  if (upper === "TIMEOUT") return "TIMEOUT";
  if (upper === "NO_RESULTS" || upper === "NORESULTS") return "NO_RESULTS";
  if (upper === "PARTIAL_SUCCESS" || upper === "PARTIAL") return "PARTIAL_SUCCESS";
  if (upper === "RUNNING" || upper === "RUN") return "RUNNING";
  if (upper === "QUEUED" || upper === "QUEUE") return "QUEUED";
  if (upper === "CANCELLED" || upper === "CANCEL") return "CANCELLED";
  return upper;
}

// ── Status Badge ──────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<
  string,
  { label: string; icon: React.ReactNode; className: string }
> = {
  COMPLETED: {
    label: "Completed",
    icon: <CheckCircle2 className="h-3.5 w-3.5" />,
    className:
      "bg-emerald-50 text-emerald-700 border border-emerald-200 ring-1 ring-emerald-100",
  },
  FAILED: {
    label: "Failed",
    icon: <XCircle className="h-3.5 w-3.5" />,
    className:
      "bg-red-50 text-red-700 border border-red-200 ring-1 ring-red-100",
  },
  STOPPED: {
    label: "Stopped",
    icon: <StopCircle className="h-3.5 w-3.5" />,
    className:
      "bg-orange-50 text-orange-700 border border-orange-200 ring-1 ring-orange-100",
  },
  TIMEOUT: {
    label: "Timeout",
    icon: <Timer className="h-3.5 w-3.5" />,
    className:
      "bg-amber-50 text-amber-700 border border-amber-200 ring-1 ring-amber-100",
  },
  NO_RESULTS: {
    label: "No Results",
    icon: <Minus className="h-3.5 w-3.5" />,
    className:
      "bg-slate-50 text-slate-600 border border-slate-200 ring-1 ring-slate-100",
  },
  PARTIAL_SUCCESS: {
    label: "Partial",
    icon: <AlertTriangle className="h-3.5 w-3.5" />,
    className:
      "bg-yellow-50 text-yellow-700 border border-yellow-200 ring-1 ring-yellow-100",
  },
  RUNNING: {
    label: "Running",
    icon: <Loader2 className="h-3.5 w-3.5 animate-spin" />,
    className:
      "bg-blue-50 text-blue-700 border border-blue-200 ring-1 ring-blue-100",
  },
  QUEUED: {
    label: "Queued",
    icon: <Clock className="h-3.5 w-3.5" />,
    className:
      "bg-violet-50 text-violet-700 border border-violet-200 ring-1 ring-violet-100",
  },
  CANCELLED: {
    label: "Cancelled",
    icon: <XCircle className="h-3.5 w-3.5" />,
    className:
      "bg-gray-50 text-gray-600 border border-gray-200 ring-1 ring-gray-100",
  },
};

function StatusBadge({ status }: { status: SearchStatus }) {
  const key = normalizeStatus(status);
  const cfg = STATUS_CONFIG[key] || STATUS_CONFIG.QUEUED;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold leading-none whitespace-nowrap ${cfg.className}`}
    >
      {cfg.icon}
      {cfg.label}
    </span>
  );
}

// ── Status Filter Tabs ────────────────────────────────────────────────────────
const ALL_STATUS_TABS = [
  { value: "", label: "All" },
  { value: "RUNNING", label: "Running" },
  { value: "COMPLETED", label: "Completed" },
  { value: "FAILED", label: "Failed" },
  { value: "STOPPED", label: "Stopped" },
  { value: "TIMEOUT", label: "Timeout" },
  { value: "NO_RESULTS", label: "No Results" },
  { value: "PARTIAL_SUCCESS", label: "Partial" },
  { value: "QUEUED", label: "Queued" },
];

// ── CSV Export ────────────────────────────────────────────────────────────────
function exportToCSV(data: SearchHistoryRecord[]) {
  const headers = [
    "Sr No",
    "Keyword",
    "Status",
    "State",
    "City",
    "Area",
    "Country",
    "Sources",
    "Found",
    "Saved",
    "Duplicates",
    "Progress %",
    "Duration",
    "Started At",
    "Completed At",
    "Failure Reason",
    "Session ID",
  ];
  const rows = data.map((r) => [
    r.srNo,
    `"${(r.keyword || "").replace(/"/g, '""')}"`,
    normalizeStatus(r.status),
    r.state || "",
    r.city || "",
    r.area || "",
    r.country || "",
    (r.sources || []).join(";"),
    r.businessesFound ?? r.totalLeads ?? 0,
    r.businessesSaved ?? 0,
    r.duplicates ?? 0,
    r.progress ?? r.maxProgressReached ?? 0,
    formatDuration(r.duration),
    convertToIST(r.startedAt || r.firstSearchDate),
    convertToIST(r.completedAt || r.stoppedAt || r.latestSearchDate),
    `"${(r.failureReason || "").replace(/"/g, '""')}"`,
    r.searchSessionId || "",
  ]);
  const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `search-history-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function SearchHistoryPage() {
  const router = useRouter();
  const [data, setData] = useState<SearchHistoryRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 25,
    total: 0,
    totalPages: 0,
  });
  const [search, setSearch] = useState("");
  const [filterState, setFilterState] = useState("");
  const [filterKeyword, setFilterKeyword] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [filterStatus, setFilterStatus] = useState(""); // status tab filter
  const [showFilters, setShowFilters] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const socketRef = useRef<Socket | null>(null);
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchData = useCallback(
    async (options?: {
      page?: number;
      limit?: number;
      search?: string;
      filterState?: string;
      filterKeyword?: string;
      filterDate?: string;
      filterStatus?: string;
    }) => {
      setIsLoading(true);
      try {
        const p = options?.page ?? page;
        const l = options?.limit ?? limit;
        const s = options?.search ?? search;
        const fs = options?.filterState ?? filterState;
        const fk = options?.filterKeyword ?? filterKeyword;
        const fd = options?.filterDate ?? filterDate;
        const fst = options?.filterStatus ?? filterStatus;

        const params = new URLSearchParams({
          page: p.toString(),
          limit: l.toString(),
        });
        if (s) params.set("search", s);
        if (fs) params.set("state", fs);
        if (fk) params.set("keyword", fk);
        if (fd) params.set("date", fd);
        if (fst) params.set("status", fst);

        const res = await fetch(`${getApiUrl()}/search/history?${params}`, {
          headers: { "ngrok-skip-browser-warning": "true" },
        });
        const json = await res.json();

        if (json.success) {
          setData(json.data || []);
          setPagination(
            json.pagination || { page: p, limit: l, total: 0, totalPages: 0 }
          );
        }
        setLastRefresh(new Date());
      } catch (err) {
        console.error("[SearchHistory] Fetch error:", err);
      } finally {
        setIsLoading(false);
      }
    },
    [page, limit, search, filterState, filterKeyword, filterDate, filterStatus]
  );

  // Initial load + param changes
  useEffect(() => {
    fetchData();
  }, [page, limit, filterStatus]);

  // Debounced search/filter apply
  useEffect(() => {
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(() => {
      setPage(1);
      fetchData({ page: 1, search, filterState, filterKeyword, filterDate, filterStatus });
    }, 400);
    return () => {
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    };
  }, [search, filterState, filterKeyword, filterDate]);

  // ── Socket.IO Auto-Refresh ─────────────────────────────────────────────────
  useEffect(() => {
    const url = getSocketUrl();
    if (!url) return;

    const socket: Socket = io(`${url}/automation-monitor`, {
      path: "/ws",
      transports: ["polling", "websocket"],
      extraHeaders: { "ngrok-skip-browser-warning": "true" },
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 3000,
    });

    socketRef.current = socket;

    socket.on("search:history-update", () => {
      // Debounce refresh to avoid hammering DB on rapid events
      setTimeout(() => {
        fetchData();
      }, 1000);
    });

    return () => {
      socket.removeAllListeners();
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

  // ── Pagination helpers ─────────────────────────────────────────────────────
  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > pagination.totalPages) return;
    setPage(newPage);
  };

  const getPageNumbers = (): (number | "...")[] => {
    const total = pagination.totalPages;
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    if (page <= 4)
      return [1, 2, 3, 4, 5, "...", total];
    if (page >= total - 3)
      return [1, "...", total - 4, total - 3, total - 2, total - 1, total];
    return [1, "...", page - 1, page, page + 1, "...", total];
  };

  // ── Row click handler ──────────────────────────────────────────────────────
  const handleRowClick = (record: SearchHistoryRecord) => {
    const ns = normalizeStatus(record.status);
    // Only navigate to leads if there are actual leads to show
    if (
      (ns === "COMPLETED" || ns === "PARTIAL_SUCCESS") &&
      (record.businessesSaved ?? record.totalLeads ?? 0) > 0
    ) {
      const params = new URLSearchParams();
      if (record.state) params.set("state", record.state);
      if (record.city) params.set("city", record.city);
      if (record.area) params.set("area", record.area);
      if (record.keyword) params.set("keyword", record.keyword);
      if (record.searchSessionId) params.set("searchSessionId", record.searchSessionId);
      router.push(`/leads?${params.toString()}`);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#F5F3EF]">
      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div
        className="w-full border-b border-[#E8E5DF]"
        style={{ background: "linear-gradient(180deg, #FFFFFF 0%, #F8F7F4 100%)" }}
      >
        <div className="max-w-[1400px] mx-auto px-6 py-8">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div
                className="h-10 w-10 rounded-[12px] flex items-center justify-center flex-shrink-0"
                style={{
                  background: "linear-gradient(135deg, #3B60E4 0%, #1D4ED8 100%)",
                  boxShadow: "0 2px 10px rgba(29,78,216,0.25)",
                }}
              >
                <Clock className="h-5 w-5 text-white" strokeWidth={2.2} />
              </div>
              <div>
                <h1 className="text-[20px] font-semibold text-[#18181B] tracking-[-0.02em] leading-tight">
                  Search History
                </h1>
                <p className="text-[13px] text-[#8E8C86] mt-0.5">
                  Complete audit log of all search attempts — including failed, stopped and timeout searches
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => fetchData()}
                disabled={isLoading}
                className="flex items-center gap-1.5 px-3 py-2 text-[13px] font-medium text-[#52504C] bg-white border border-[#E8E5DF] rounded-lg hover:bg-[#F8F7F4] transition-colors disabled:opacity-50"
                title="Refresh"
              >
                <RefreshCw
                  className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`}
                />
                Refresh
              </button>
              <button
                onClick={() => exportToCSV(data)}
                disabled={data.length === 0}
                className="flex items-center gap-1.5 px-3 py-2 text-[13px] font-medium text-[#52504C] bg-white border border-[#E8E5DF] rounded-lg hover:bg-[#F8F7F4] transition-colors disabled:opacity-50"
              >
                <Download className="h-3.5 w-3.5" />
                Export CSV
              </button>
              <button
                onClick={() => setShowFilters((v) => !v)}
                className={`flex items-center gap-1.5 px-3 py-2 text-[13px] font-medium rounded-lg border transition-colors ${
                  showFilters
                    ? "bg-[#3B60E4] text-white border-[#3B60E4]"
                    : "text-[#52504C] bg-white border-[#E8E5DF] hover:bg-[#F8F7F4]"
                }`}
              >
                <Filter className="h-3.5 w-3.5" />
                Filters
              </button>
            </div>
          </div>

          {/* ── Status Filter Tabs ─────────────────────────────────────────── */}
          <div className="mt-5 flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
            {ALL_STATUS_TABS.map((tab) => (
              <button
                key={tab.value}
                onClick={() => {
                  setFilterStatus(tab.value);
                  setPage(1);
                  fetchData({ page: 1, filterStatus: tab.value });
                }}
                className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-[12px] font-semibold transition-all ${
                  filterStatus === tab.value
                    ? "bg-[#3B60E4] text-white shadow-sm"
                    : "bg-white text-[#52504C] border border-[#E8E5DF] hover:border-[#3B60E4] hover:text-[#3B60E4]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* ── Filters Panel ────────────────────────────────────────────────── */}
          {showFilters && (
            <div className="mt-4 p-4 bg-white border border-[#E8E5DF] rounded-xl">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#8E8C86] mb-1.5">
                    Search
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#B0AEA8]" />
                    <input
                      type="text"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Keyword, city, state..."
                      className="w-full pl-8 pr-3 py-2 text-[13px] border border-[#E8E5DF] rounded-lg bg-[#FAFAF8] focus:outline-none focus:ring-2 focus:ring-[#3B60E4]/30"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#8E8C86] mb-1.5">
                    State
                  </label>
                  <input
                    type="text"
                    value={filterState}
                    onChange={(e) => setFilterState(e.target.value)}
                    placeholder="Filter by state..."
                    className="w-full px-3 py-2 text-[13px] border border-[#E8E5DF] rounded-lg bg-[#FAFAF8] focus:outline-none focus:ring-2 focus:ring-[#3B60E4]/30"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#8E8C86] mb-1.5">
                    Keyword
                  </label>
                  <input
                    type="text"
                    value={filterKeyword}
                    onChange={(e) => setFilterKeyword(e.target.value)}
                    placeholder="Filter by keyword..."
                    className="w-full px-3 py-2 text-[13px] border border-[#E8E5DF] rounded-lg bg-[#FAFAF8] focus:outline-none focus:ring-2 focus:ring-[#3B60E4]/30"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#8E8C86] mb-1.5">
                    Date
                  </label>
                  <input
                    type="date"
                    value={filterDate}
                    onChange={(e) => setFilterDate(e.target.value)}
                    className="w-full px-3 py-2 text-[13px] border border-[#E8E5DF] rounded-lg bg-[#FAFAF8] focus:outline-none focus:ring-2 focus:ring-[#3B60E4]/30"
                  />
                </div>
              </div>
              {(search || filterState || filterKeyword || filterDate) && (
                <div className="mt-3 flex items-center gap-2">
                  <span className="text-[12px] text-[#8E8C86]">Active filters:</span>
                  {search && (
                    <span className="px-2 py-0.5 bg-[#EEF2FF] text-[#3B60E4] text-[11px] font-medium rounded-full">
                      Search: {search}
                    </span>
                  )}
                  {filterState && (
                    <span className="px-2 py-0.5 bg-[#EEF2FF] text-[#3B60E4] text-[11px] font-medium rounded-full">
                      State: {filterState}
                    </span>
                  )}
                  {filterKeyword && (
                    <span className="px-2 py-0.5 bg-[#EEF2FF] text-[#3B60E4] text-[11px] font-medium rounded-full">
                      Keyword: {filterKeyword}
                    </span>
                  )}
                  {filterDate && (
                    <span className="px-2 py-0.5 bg-[#EEF2FF] text-[#3B60E4] text-[11px] font-medium rounded-full">
                      Date: {filterDate}
                    </span>
                  )}
                  <button
                    onClick={() => {
                      setSearch("");
                      setFilterState("");
                      setFilterKeyword("");
                      setFilterDate("");
                      setPage(1);
                      fetchData({ page: 1, search: "", filterState: "", filterKeyword: "", filterDate: "" });
                    }}
                    className="ml-auto text-[12px] text-red-500 hover:text-red-700 font-medium"
                  >
                    Clear All
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Content ───────────────────────────────────────────────────────── */}
      <div className="max-w-[1400px] mx-auto px-6 py-6">
        {/* Stats summary bar */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-[13px] text-[#8E8C86]">
              <span className="font-semibold text-[#18181B]">{pagination.total}</span>{" "}
              search sessions
              {filterStatus && (
                <span className="ml-1 text-[#52504C]">
                  with status{" "}
                  <span className="font-semibold capitalize">
                    {filterStatus.toLowerCase().replace("_", " ")}
                  </span>
                </span>
              )}
            </span>
            <span className="text-[11px] text-[#B0AEA8]">
              Auto-refreshes via live socket · Last:{" "}
              {lastRefresh.toLocaleTimeString("en-IN", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              })}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-[12px] text-[#8E8C86]">Rows:</label>
            <select
              value={limit}
              onChange={(e) => {
                const l = parseInt(e.target.value, 10);
                setLimit(l);
                setPage(1);
                fetchData({ page: 1, limit: l });
              }}
              className="text-[12px] border border-[#E8E5DF] rounded-lg px-2 py-1 bg-white text-[#52504C] focus:outline-none"
            >
              {[10, 25, 50, 100].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* ── Table ─────────────────────────────────────────────────────────── */}
        <div className="bg-white border border-[#E8E5DF] rounded-xl overflow-hidden shadow-sm">
          {isLoading ? (
            <div className="divide-y divide-[#F0EDE8]">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="px-5 py-4 flex items-center gap-4 animate-pulse">
                  <div className="h-4 w-8 bg-[#F0EDE8] rounded" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-40 bg-[#F0EDE8] rounded" />
                    <div className="h-3 w-28 bg-[#F5F3EF] rounded" />
                  </div>
                  <div className="h-6 w-20 bg-[#F0EDE8] rounded-full" />
                  <div className="h-4 w-16 bg-[#F0EDE8] rounded" />
                  <div className="h-4 w-16 bg-[#F0EDE8] rounded" />
                  <div className="h-4 w-16 bg-[#F0EDE8] rounded" />
                </div>
              ))}
            </div>
          ) : data.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="h-16 w-16 rounded-2xl bg-[#F5F3EF] flex items-center justify-center mb-4">
                <Clock className="h-8 w-8 text-[#C4C0B8]" />
              </div>
              <h3 className="text-[16px] font-semibold text-[#18181B] mb-1">
                No search sessions found
              </h3>
              <p className="text-[13px] text-[#8E8C86] max-w-xs">
                {filterStatus
                  ? `No searches with status "${filterStatus.toLowerCase().replace("_", " ")}" yet.`
                  : "Start a search from the Search page to see the full audit history here."}
              </p>
              {filterStatus && (
                <button
                  onClick={() => {
                    setFilterStatus("");
                    setPage(1);
                    fetchData({ page: 1, filterStatus: "" });
                  }}
                  className="mt-4 text-[13px] font-medium text-[#3B60E4] hover:underline"
                >
                  Show all statuses
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Table Header */}
              <div className="grid grid-cols-[40px_1fr_120px_90px_90px_80px_80px_80px_140px] gap-0 bg-[#FAFAF8] border-b border-[#F0EDE8] px-5 py-3">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-[#8E8C86]">#</div>
                <div className="text-[11px] font-semibold uppercase tracking-wider text-[#8E8C86]">Search</div>
                <div className="text-[11px] font-semibold uppercase tracking-wider text-[#8E8C86]">Status</div>
                <div className="text-[11px] font-semibold uppercase tracking-wider text-[#8E8C86] text-right">Found</div>
                <div className="text-[11px] font-semibold uppercase tracking-wider text-[#8E8C86] text-right">Saved</div>
                <div className="text-[11px] font-semibold uppercase tracking-wider text-[#8E8C86] text-right">Dupes</div>
                <div className="text-[11px] font-semibold uppercase tracking-wider text-[#8E8C86] text-right">Progress</div>
                <div className="text-[11px] font-semibold uppercase tracking-wider text-[#8E8C86] text-right">Duration</div>
                <div className="text-[11px] font-semibold uppercase tracking-wider text-[#8E8C86]">Started</div>
              </div>

              {/* Table Rows */}
              <div className="divide-y divide-[#F8F6F2]">
                {data.map((record) => {
                  const ns = normalizeStatus(record.status);
                  const isClickable =
                    (ns === "COMPLETED" || ns === "PARTIAL_SUCCESS") &&
                    (record.businessesSaved ?? record.totalLeads ?? 0) > 0;
                  const progress =
                    record.progress ??
                    record.maxProgressReached ??
                    (ns === "COMPLETED" ? 100 : 0);
                  const location = [record.area, record.city, record.state, record.country]
                    .filter(Boolean)
                    .join(", ");

                  return (
                    <div
                      key={record.searchSessionId || record.srNo}
                      onClick={() => handleRowClick(record)}
                      className={`grid grid-cols-[40px_1fr_120px_90px_90px_80px_80px_80px_140px] gap-0 px-5 py-3.5 transition-colors ${
                        isClickable
                          ? "cursor-pointer hover:bg-[#F8F7F4]"
                          : "cursor-default hover:bg-[#FDFCFB]"
                      }`}
                    >
                      {/* Sr No */}
                      <div className="flex items-center">
                        <span className="text-[12px] text-[#B0AEA8] font-medium">
                          {record.srNo}
                        </span>
                      </div>

                      {/* Search Info */}
                      <div className="flex flex-col justify-center min-w-0 pr-3">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-[13px] font-semibold text-[#18181B] truncate">
                            {record.keyword || "—"}
                          </span>
                          {(record.sources || []).length > 0 && (
                            <div className="flex items-center gap-1 flex-shrink-0">
                              {(record.sources || []).slice(0, 2).map((s) => (
                                <span
                                  key={s}
                                  className="px-1.5 py-0.5 bg-[#F0EDE8] text-[#52504C] text-[10px] rounded font-medium"
                                >
                                  {s === "google-maps" ? "GMaps" : s}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        {location && (
                          <div className="flex items-center gap-1 mt-0.5">
                            <MapPin className="h-3 w-3 text-[#B0AEA8] flex-shrink-0" />
                            <span className="text-[11px] text-[#8E8C86] truncate">
                              {location}
                            </span>
                          </div>
                        )}
                        {/* Failure reason */}
                        {record.failureReason && ns !== "COMPLETED" && ns !== "NO_RESULTS" && (
                          <p className="text-[10px] text-red-500 mt-0.5 truncate" title={record.failureReason}>
                            ⚠ {record.failureReason}
                          </p>
                        )}
                      </div>

                      {/* Status Badge */}
                      <div className="flex items-center">
                        <StatusBadge status={record.status} />
                      </div>

                      {/* Found */}
                      <div className="flex items-center justify-end">
                        <span className="text-[13px] font-medium text-[#18181B]">
                          {(record.businessesFound ?? record.totalLeads ?? 0).toLocaleString()}
                        </span>
                      </div>

                      {/* Saved */}
                      <div className="flex items-center justify-end">
                        <span
                          className={`text-[13px] font-semibold ${
                            (record.businessesSaved ?? 0) > 0
                              ? "text-emerald-600"
                              : "text-[#B0AEA8]"
                          }`}
                        >
                          {(record.businessesSaved ?? record.totalLeads ?? 0).toLocaleString()}
                        </span>
                      </div>

                      {/* Duplicates */}
                      <div className="flex items-center justify-end">
                        <span className="text-[13px] text-[#8E8C86]">
                          {(record.duplicates ?? 0).toLocaleString()}
                        </span>
                      </div>

                      {/* Progress */}
                      <div className="flex items-center justify-end">
                        <div className="flex items-center gap-1.5">
                          <div className="w-12 h-1.5 bg-[#F0EDE8] rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${
                                ns === "COMPLETED"
                                  ? "bg-emerald-500"
                                  : ns === "FAILED" || ns === "TIMEOUT"
                                  ? "bg-red-400"
                                  : ns === "STOPPED"
                                  ? "bg-orange-400"
                                  : ns === "PARTIAL_SUCCESS"
                                  ? "bg-yellow-400"
                                  : "bg-blue-400"
                              }`}
                              style={{ width: `${Math.min(100, progress)}%` }}
                            />
                          </div>
                          <span className="text-[11px] text-[#8E8C86] w-8 text-right">
                            {Math.round(progress)}%
                          </span>
                        </div>
                      </div>

                      {/* Duration */}
                      <div className="flex items-center justify-end">
                        <span className="text-[12px] text-[#8E8C86]">
                          {formatDuration(record.duration)}
                        </span>
                      </div>

                      {/* Started At */}
                      <div className="flex flex-col justify-center pl-3">
                        <span className="text-[11px] text-[#52504C]">
                          {convertToIST(record.startedAt || record.firstSearchDate)}
                        </span>
                        {(record.completedAt || record.stoppedAt || record.latestSearchDate) && (
                          <span className="text-[10px] text-[#B0AEA8] mt-0.5">
                            → {convertToIST(record.completedAt || record.stoppedAt || record.latestSearchDate)}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* ── Pagination ──────────────────────────────────────────────────── */}
        {!isLoading && pagination.totalPages > 1 && (
          <div className="mt-4 flex items-center justify-between">
            <span className="text-[12px] text-[#8E8C86]">
              Showing {(page - 1) * limit + 1}–
              {Math.min(page * limit, pagination.total)} of {pagination.total}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
                className="p-1.5 rounded-lg border border-[#E8E5DF] bg-white text-[#52504C] hover:bg-[#F8F7F4] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              {getPageNumbers().map((pg, i) =>
                pg === "..." ? (
                  <span key={`ellipsis-${i}`} className="px-2 text-[#B0AEA8] text-[13px]">
                    …
                  </span>
                ) : (
                  <button
                    key={pg}
                    onClick={() => handlePageChange(pg as number)}
                    className={`min-w-[32px] h-8 px-2 rounded-lg text-[13px] font-medium transition-colors ${
                      pg === page
                        ? "bg-[#3B60E4] text-white shadow-sm"
                        : "border border-[#E8E5DF] bg-white text-[#52504C] hover:bg-[#F8F7F4]"
                    }`}
                  >
                    {pg}
                  </button>
                )
              )}
              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page === pagination.totalPages}
                className="p-1.5 rounded-lg border border-[#E8E5DF] bg-white text-[#52504C] hover:bg-[#F8F7F4] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
