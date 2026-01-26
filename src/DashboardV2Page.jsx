import * as React from "react"

import {
    Activity,
    ArrowUpDown,
    CheckCircle2,
    Circle,
    Clipboard,
    Download,
    Filter,
    Inbox,
    MoreHorizontal,
    Rocket,
    RefreshCw,
    Search,
} from "lucide-react"

import { supabase } from "./supabaseClient"

import { projectsApi, exportsApi } from "./utils/api.js"
import { getUsageWithLimits } from "./utils/ideFeatureGating.js"
import { getUsagePercentage, isHardLimitReached, isSoftLimitReached } from "./utils/usageLimits.js"
import { getActivityTimeline } from "./utils/analyticsData.js"
import { subscribeToAllUpdates } from "./utils/realtimeSync.js"
import {
    cancelSubscription,
    formatPrice,
    getActiveSubscription,
    getBillingHistory,
    getPaymentMethods,
    getUserSubscriptionSummary,
    resumeSubscription,
} from "./utils/razorpayApi.js"
import { getActiveTrial, getSubscriptionUsage } from "./utils/subscriptionApi.js"

import { LimitWarning } from "./components/LimitWarning.jsx"
import { UpgradePrompt } from "./components/UpgradePrompt.jsx"
import { UsageChart } from "./components/UsageChart.jsx"

import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"

import { AppSidebar } from "@/components/app-sidebar"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function DashboardV2Page({ session, navigate, lockedTab = null }) {
    const [activeTab, setActiveTab] = React.useState("overview")

    const sidebarDefaultOpen = React.useMemo(() => {
        try {
            const cookie = typeof document !== "undefined" ? document.cookie || "" : ""
            const match = cookie.match(/(?:^|;\s*)sidebar_state=([^;]+)/)
            if (!match) return true
            const raw = decodeURIComponent(match[1] || "")
            return raw === "true"
        } catch {
            return true
        }
    }, [])

    const meta = session?.user?.user_metadata || {}
    const username =
        [meta.first_name, meta.last_name].filter(Boolean).join(" ") ||
        session?.user?.email ||
        "Account"

    const initials = React.useMemo(() => {
        const text = username || "U"
        const parts = text.split(" ").filter(Boolean).slice(0, 2)
        const letters = parts.map((p) => p[0]).join("")
        return (letters || "U").toUpperCase()
    }, [username])

    const handleSignOut = React.useCallback(async () => {
        try {
            await supabase.auth.signOut()
        } finally {
            navigate?.('/')
        }
    }, [navigate])

    const userId = session?.user?.id || null

    const safeJsonStringify = React.useCallback((value) => {
        try {
            if (value == null) return ""
            return JSON.stringify(value, null, 2)
        } catch {
            return String(value)
        }
    }, [])

    const asObjectEntries = React.useCallback((value) => {
        if (!value || typeof value !== "object" || Array.isArray(value)) return []
        try {
            return Object.entries(value)
        } catch {
            return []
        }
    }, [])

    const goToDashboardProject = React.useCallback(
        (projectId, tab = "overview") => {
            const pid = projectId ? encodeURIComponent(String(projectId)) : ""
            const params = new URLSearchParams()
            params.set("tab", String(tab || "overview"))
            if (pid) params.set("project", pid)
            const next = `/dashboard-v2?${params.toString()}`
            navigate?.(next)
        },
        [lockedTab, navigate]
    )

    const [license, setLicense] = React.useState(null)
    const [subscriptionSummary, setSubscriptionSummary] = React.useState(null)
    const [activeTrial, setActiveTrial] = React.useState(null)
    const [usageData, setUsageData] = React.useState(null)

    const [billingActiveTab, setBillingActiveTab] = React.useState("overview")
    const [billingSubscription, setBillingSubscription] = React.useState(null)
    const [billingHistory, setBillingHistoryState] = React.useState([])
    const [paymentMethods, setPaymentMethodsState] = React.useState([])
    const [billingChangeHistory, setBillingChangeHistory] = React.useState([])
    const [billingUsageData, setBillingUsageData] = React.useState([])
    const [billingUsageLoading, setBillingUsageLoading] = React.useState(false)

    const [loading, setLoading] = React.useState({
        projects: false,
        exports: false,
        models: false,
        trainingRuns: false,
        timeline: false,
        usage: false,
        sync: false,
        license: false,
        subscription: false,
        trial: false,
        subscriptionUsage: false,
        diagnostics: false,
        billing: false,
    })

    const [projects, setProjects] = React.useState([])
    const [exports, setExports] = React.useState([])
    const [models, setModels] = React.useState([])
    const [trainingRuns, setTrainingRuns] = React.useState([])
    const [activityTimeline, setActivityTimeline] = React.useState([])
    const [usageWithLimits, setUsageWithLimits] = React.useState(null)

    const [selectedProjectId, setSelectedProjectId] = React.useState("")
    const [selectedRunId, setSelectedRunId] = React.useState("")
    const [syncMeta, setSyncMeta] = React.useState({
        lastSyncAt: null,
        lastSyncEventAt: null,
        lastSyncEventStatus: null,
        lastSyncError: null,
        lastIdeVersion: null,
        lastIdePlatform: null,
    })

    const [runsStatusOpen, setRunsStatusOpen] = React.useState(false)
    const [runsSortOpen, setRunsSortOpen] = React.useState(false)
    const [modelsSortOpen, setModelsSortOpen] = React.useState(false)
    const [exportsFormatOpen, setExportsFormatOpen] = React.useState(false)
    const [exportsSortOpen, setExportsSortOpen] = React.useState(false)

    const [runsQuery, setRunsQuery] = React.useState("")
    const [runsStatus, setRunsStatus] = React.useState("all")
    const [runsSortKey, setRunsSortKey] = React.useState("start_time")
    const [runsSortDir, setRunsSortDir] = React.useState("desc")

    const [runsPage, setRunsPage] = React.useState(1)
    const [runsPageSize, setRunsPageSize] = React.useState(25)

    const [modelsQuery, setModelsQuery] = React.useState("")
    const [modelsSortKey, setModelsSortKey] = React.useState("trained_at")
    const [modelsSortDir, setModelsSortDir] = React.useState("desc")

    const [modelsPage, setModelsPage] = React.useState(1)
    const [modelsPageSize, setModelsPageSize] = React.useState(25)

    const [exportsQuery, setExportsQuery] = React.useState("")
    const [exportsFormat, setExportsFormat] = React.useState("all")
    const [exportsSortKey, setExportsSortKey] = React.useState("exported_at")
    const [exportsSortDir, setExportsSortDir] = React.useState("desc")

    const [exportsPage, setExportsPage] = React.useState(1)
    const [exportsPageSize, setExportsPageSize] = React.useState(25)

    const runsSearchRef = React.useRef(null)
    const modelsSearchRef = React.useRef(null)
    const exportsSearchRef = React.useRef(null)

    const [selectedRunIds, setSelectedRunIds] = React.useState(() => new Set())
    const [selectedModelIds, setSelectedModelIds] = React.useState(() => new Set())
    const [selectedExportIds, setSelectedExportIds] = React.useState(() => new Set())

    const [diagnosticsEvents, setDiagnosticsEvents] = React.useState([])
    const [diagnosticsQuery, setDiagnosticsQuery] = React.useState("")
    const [diagnosticsTypeFilter, setDiagnosticsTypeFilter] = React.useState("")
    const [diagnosticsKindFilter, setDiagnosticsKindFilter] = React.useState("")
    const [diagnosticsAppVersionFilter, setDiagnosticsAppVersionFilter] = React.useState("")

    const getProjectId = React.useCallback((p) => p?.project_id ?? p?.id ?? "", [])
    const getProjectName = React.useCallback((p) => p?.name ?? p?.project_name ?? p?.title ?? "Project", [])

    const selectedProject = React.useMemo(() => {
        if (!selectedProjectId) return null
        return projects.find((p) => String(getProjectId(p)) === String(selectedProjectId)) || null
    }, [getProjectId, projects, selectedProjectId])

    const selectedRun = React.useMemo(() => {
        if (!selectedRunId) return null
        const match = (trainingRuns || []).find(
            (r) =>
                String(r?.project_id || "") === String(selectedProjectId || "") &&
                String(r?.id || r?.run_id || "") === String(selectedRunId)
        )
        return match || null
    }, [selectedProjectId, selectedRunId, trainingRuns])

    const applyUrlState = React.useCallback((search) => {
        const params = new URLSearchParams(search || "")

        const tabRaw = params.get("tab") || "overview"
        const allowedTabs = ["overview", "projects", "activity", "runs", "models", "exports", "billing", "settings", "diagnostics"]
        const tab = allowedTabs.includes(tabRaw) ? tabRaw : "overview"
        const project = params.get("project") || ""
        const run = params.get("run") || ""

        const runsQ = params.get("runsQ") || ""
        const runsStatusRaw = params.get("runsStatus") || "all"
        const runsStatusSafe = ["all", "running", "completed", "failed"].includes(runsStatusRaw)
            ? runsStatusRaw
            : "all"
        const runsSortKeyRaw = params.get("runsSortKey") || "start_time"
        const runsSortKeySafe = ["start_time", "gpu_hours_used", "status"].includes(runsSortKeyRaw)
            ? runsSortKeyRaw
            : "start_time"
        const runsSortDirRaw = params.get("runsSortDir") || "desc"
        const runsSortDirSafe = runsSortDirRaw === "asc" ? "asc" : "desc"

        const runsPageRaw = Number(params.get("runsPage") || 1)
        const runsPageSafe = Number.isFinite(runsPageRaw) && runsPageRaw > 0 ? Math.floor(runsPageRaw) : 1
        const runsPageSizeRaw = Number(params.get("runsPageSize") || 25)
        const runsPageSizeSafe = [10, 25, 50, 100].includes(runsPageSizeRaw) ? runsPageSizeRaw : 25

        const modelsQ = params.get("modelsQ") || ""
        const modelsSortKeyRaw = params.get("modelsSortKey") || "trained_at"
        const modelsSortKeySafe = ["trained_at", "updated_at"].includes(modelsSortKeyRaw)
            ? modelsSortKeyRaw
            : "trained_at"
        const modelsSortDirRaw = params.get("modelsSortDir") || "desc"
        const modelsSortDirSafe = modelsSortDirRaw === "asc" ? "asc" : "desc"

        const modelsPageRaw = Number(params.get("modelsPage") || 1)
        const modelsPageSafe = Number.isFinite(modelsPageRaw) && modelsPageRaw > 0 ? Math.floor(modelsPageRaw) : 1
        const modelsPageSizeRaw = Number(params.get("modelsPageSize") || 25)
        const modelsPageSizeSafe = [10, 25, 50, 100].includes(modelsPageSizeRaw) ? modelsPageSizeRaw : 25

        const exportsQ = params.get("exportsQ") || ""
        const exportsFormatRaw = params.get("exportsFormat") || "all"
        const exportsFormatSafe = ["all", "onnx", "tensorrt", "torchscript"].includes(exportsFormatRaw)
            ? exportsFormatRaw
            : "all"
        const exportsSortKeyRaw = params.get("exportsSortKey") || "exported_at"
        const exportsSortKeySafe = ["exported_at", "created_at"].includes(exportsSortKeyRaw)
            ? exportsSortKeyRaw
            : "exported_at"
        const exportsSortDirRaw = params.get("exportsSortDir") || "desc"
        const exportsSortDirSafe = exportsSortDirRaw === "asc" ? "asc" : "desc"

        const exportsPageRaw = Number(params.get("exportsPage") || 1)
        const exportsPageSafe = Number.isFinite(exportsPageRaw) && exportsPageRaw > 0 ? Math.floor(exportsPageRaw) : 1
        const exportsPageSizeRaw = Number(params.get("exportsPageSize") || 25)
        const exportsPageSizeSafe = [10, 25, 50, 100].includes(exportsPageSizeRaw) ? exportsPageSizeRaw : 25

        if (!lockedTab) setActiveTab(tab)
        setSelectedProjectId(project)
        setSelectedRunId(run)

        setRunsQuery(runsQ)
        setRunsStatus(runsStatusSafe)
        setRunsSortKey(runsSortKeySafe)
        setRunsSortDir(runsSortDirSafe)
        setRunsPage(runsPageSafe)
        setRunsPageSize(runsPageSizeSafe)

        setModelsQuery(modelsQ)
        setModelsSortKey(modelsSortKeySafe)
        setModelsSortDir(modelsSortDirSafe)
        setModelsPage(modelsPageSafe)
        setModelsPageSize(modelsPageSizeSafe)

        setExportsQuery(exportsQ)
        setExportsFormat(exportsFormatSafe)
        setExportsSortKey(exportsSortKeySafe)
        setExportsSortDir(exportsSortDirSafe)
        setExportsPage(exportsPageSafe)
        setExportsPageSize(exportsPageSizeSafe)
    }, [lockedTab])

    const sortLabel = React.useCallback((key, dir, map) => {
        const base = map?.[key] || key
        const arrow = dir === "asc" ? "↑" : "↓"
        return `${base} ${arrow}`
    }, [])

    const downloadCsv = React.useCallback((filename, rows) => {
        const escape = (v) => {
            const str = String(v ?? "")
            if (/[\n\r\",]/.test(str)) return `"${str.replaceAll('"', '""')}"`
            return str
        }

        const csv = (rows || []).map((r) => r.map(escape).join(",")).join("\n")
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8" })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = filename
        document.body.appendChild(a)
        a.click()
        a.remove()
        setTimeout(() => URL.revokeObjectURL(url), 500)
    }, [])

    React.useEffect(() => {
        if (lockedTab) {
            setActiveTab(String(lockedTab || "overview"))
            return
        }
        applyUrlState(window.location.search || "")

        const onPop = () => {
            applyUrlState(window.location.search || "")
        }

        window.addEventListener("popstate", onPop)
        return () => window.removeEventListener("popstate", onPop)
    }, [applyUrlState, lockedTab])

    const lastPushedTabRef = React.useRef(null)

    React.useEffect(() => {
        if (lockedTab) return
        const params = new URLSearchParams(window.location.search || "")
        const currentTab = params.get("tab") || "overview"
        const nextTab = String(activeTab || "overview")

        if (currentTab !== nextTab && lastPushedTabRef.current !== nextTab) {
            params.set("tab", nextTab)
            const next = `${window.location.pathname}?${params.toString()}`
            window.history.pushState({}, "", next)
            lastPushedTabRef.current = nextTab
        }
    }, [activeTab])

    React.useEffect(() => {
        if (lockedTab) return
        const params = new URLSearchParams(window.location.search || "")

        params.set("tab", String(activeTab || "overview"))

        if (selectedProjectId) params.set("project", String(selectedProjectId))
        else params.delete("project")

        if (selectedRunId) params.set("run", String(selectedRunId))
        else params.delete("run")

        if (runsQuery.trim()) params.set("runsQ", runsQuery.trim())
        else params.delete("runsQ")
        if (runsStatus !== "all") params.set("runsStatus", String(runsStatus))
        else params.delete("runsStatus")
        if (runsSortKey !== "start_time") params.set("runsSortKey", String(runsSortKey))
        else params.delete("runsSortKey")
        if (runsSortDir !== "desc") params.set("runsSortDir", String(runsSortDir))
        else params.delete("runsSortDir")

        if (runsPage !== 1) params.set("runsPage", String(runsPage))
        else params.delete("runsPage")
        if (runsPageSize !== 25) params.set("runsPageSize", String(runsPageSize))
        else params.delete("runsPageSize")

        if (modelsQuery.trim()) params.set("modelsQ", modelsQuery.trim())
        else params.delete("modelsQ")
        if (modelsSortKey !== "trained_at") params.set("modelsSortKey", String(modelsSortKey))
        else params.delete("modelsSortKey")
        if (modelsSortDir !== "desc") params.set("modelsSortDir", String(modelsSortDir))
        else params.delete("modelsSortDir")

        if (modelsPage !== 1) params.set("modelsPage", String(modelsPage))
        else params.delete("modelsPage")
        if (modelsPageSize !== 25) params.set("modelsPageSize", String(modelsPageSize))
        else params.delete("modelsPageSize")

        if (exportsQuery.trim()) params.set("exportsQ", exportsQuery.trim())
        else params.delete("exportsQ")
        if (exportsFormat !== "all") params.set("exportsFormat", String(exportsFormat))
        else params.delete("exportsFormat")
        if (exportsSortKey !== "exported_at") params.set("exportsSortKey", String(exportsSortKey))
        else params.delete("exportsSortKey")
        if (exportsSortDir !== "desc") params.set("exportsSortDir", String(exportsSortDir))
        else params.delete("exportsSortDir")

        if (exportsPage !== 1) params.set("exportsPage", String(exportsPage))
        else params.delete("exportsPage")
        if (exportsPageSize !== 25) params.set("exportsPageSize", String(exportsPageSize))
        else params.delete("exportsPageSize")

        const next = `${window.location.pathname}?${params.toString()}`
        const current = `${window.location.pathname}${window.location.search || ""}`
        if (next !== current) {
            window.history.replaceState({}, "", next)
        }
    }, [
        activeTab,
        selectedProjectId,
        runsQuery,
        runsStatus,
        runsSortKey,
        runsSortDir,
        runsPage,
        runsPageSize,
        modelsQuery,
        modelsSortKey,
        modelsSortDir,
        modelsPage,
        modelsPageSize,
        exportsQuery,
        exportsFormat,
        exportsSortKey,
        exportsSortDir,
        exportsPage,
        exportsPageSize,
    ])

    React.useEffect(() => {
        setRunsPage(1)
        setSelectedRunIds(new Set())
        setSelectedRunId("")
    }, [runsQuery, runsStatus, runsSortKey, runsSortDir, selectedProjectId])

    React.useEffect(() => {
        setModelsPage(1)
        setSelectedModelIds(new Set())
    }, [modelsQuery, modelsSortKey, modelsSortDir, selectedProjectId])

    React.useEffect(() => {
        setExportsPage(1)
        setSelectedExportIds(new Set())
    }, [exportsQuery, exportsFormat, exportsSortKey, exportsSortDir, selectedProjectId])

    const formatDateTime = React.useCallback((dateString) => {
        if (!dateString) return "Never"
        try {
            const date = new Date(dateString)
            return date.toLocaleString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
            })
        } catch {
            return "Invalid date"
        }
    }, [])

    const statusPillClass = React.useCallback((statusRaw) => {
        const status = String(statusRaw || "").toLowerCase()
        if (status.includes("active") || status.includes("healthy") || status.includes("success")) {
            return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
        }
        if (status.includes("running") || status.includes("processing")) {
            return "bg-blue-500/10 text-blue-600 border-blue-500/20"
        }
        if (status.includes("failed") || status.includes("error") || status.includes("degraded")) {
            return "bg-red-500/10 text-red-600 border-red-500/20"
        }
        if (status.includes("pending") || status.includes("queued")) {
            return "bg-amber-500/10 text-amber-600 border-amber-500/20"
        }
        return "bg-muted text-foreground/70 border-border"
    }, [])

    const StatusPill = React.useCallback(
        ({ value }) => (
            <span
                className={
                    "inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium " +
                    statusPillClass(value)
                }
            >
                {String(value || "Unknown")}
            </span>
        ),
        [statusPillClass]
    )

    const Chip = React.useCallback(({ children, onClear, onClick }) => {
        return (
            <span className="inline-flex items-center gap-2 rounded-full border bg-background px-2.5 py-1 text-[11px] text-foreground/80">
                {onClick ? (
                    <button
                        type="button"
                        className="truncate text-left hover:text-foreground"
                        onClick={onClick}
                    >
                        {children}
                    </button>
                ) : (
                    <span className="truncate">{children}</span>
                )}
                {onClear && (
                    <button
                        type="button"
                        className="rounded-full border px-1 text-[10px] leading-none text-muted-foreground hover:text-foreground"
                        onClick={onClear}
                    >
                        ×
                    </button>
                )}
            </span>
        )
    }, [])

    const projectExports = React.useMemo(() => {
        if (!selectedProjectId) return []
        return (exports || []).filter((e) => String(e?.project_id || "") === String(selectedProjectId))
    }, [exports, selectedProjectId])

    const projectModels = React.useMemo(() => {
        if (!selectedProjectId) return []
        return (models || []).filter((m) => String(m?.project_id || "") === String(selectedProjectId))
    }, [models, selectedProjectId])

    const projectTrainingRuns = React.useMemo(() => {
        if (!selectedProjectId) return []
        return (trainingRuns || []).filter((r) => String(r?.project_id || "") === String(selectedProjectId))
    }, [trainingRuns, selectedProjectId])

    const projectResourceSummary = React.useMemo(() => {
        const totalGpuHours = (projectTrainingRuns || []).reduce(
            (acc, r) => acc + Number(r?.gpu_hours_used || 0),
            0
        )
        const last = projectTrainingRuns?.[0] || null
        return {
            totalGpuHours: Number(totalGpuHours.toFixed(2)),
            lastGpuType: last?.gpu_type || null,
            lastGpuCount: last?.gpu_count ?? null,
        }
    }, [projectTrainingRuns])

    const projectDatasetsCount = Number(selectedProject?.dataset_count ?? selectedProject?.datasets_count ?? 0)

    const overview = React.useMemo(() => {
        return {
            projects: projects.length,
            datasets: projectDatasetsCount,
            exports: projectExports.length,
            gpuHours: Number(projectResourceSummary.totalGpuHours.toFixed(1)),
        }
    }, [projectDatasetsCount, projectExports.length, projectResourceSummary.totalGpuHours, projects.length])

    const setupChecklist = React.useMemo(() => {
        const hasProjects = (projects || []).length > 0
        const hasSynced = Boolean(syncMeta?.lastSyncAt || syncMeta?.lastSyncEventAt)
        const hasSelectedProject = Boolean(selectedProjectId)
        const hasRuns = (projectTrainingRuns || []).length > 0
        const hasExports = (projectExports || []).length > 0

        return {
            hasProjects,
            hasSynced,
            hasSelectedProject,
            hasRuns,
            hasExports,
            steps: [
                {
                    key: "download",
                    title: "Install ML Forge IDE",
                    detail: "Install the IDE to sync metadata to this dashboard.",
                    done: hasSynced,
                    cta: { label: "Download", onClick: () => navigate?.("/download") },
                },
                {
                    key: "sync",
                    title: "Sign in and sync",
                    detail: "Sign in in the IDE and run a sync to populate your workspace here.",
                    done: hasSynced,
                    cta: { label: "Diagnostics", onClick: () => navigate?.("/dashboard-v2?tab=diagnostics") },
                },
                {
                    key: "project",
                    title: "Create a project (in the IDE)",
                    detail: "Projects created in the IDE appear here after sync.",
                    done: hasProjects,
                    cta: { label: "Projects", onClick: () => navigate?.("/dashboard-v2?tab=projects") },
                },
                {
                    key: "select",
                    title: "Select your project",
                    detail: "Pick the project you want to work on.",
                    done: hasSelectedProject,
                    cta: { label: "Select", onClick: () => navigate?.("/dashboard-v2?tab=projects") },
                },
                {
                    key: "run",
                    title: "Start a training run (in the IDE)",
                    detail: "Runs are executed in the IDE and appear here automatically.",
                    done: hasRuns,
                    cta: { label: "Runs", onClick: () => navigate?.("/dashboard-v2?tab=runs") },
                },
                {
                    key: "export",
                    title: "Create an export (in the IDE)",
                    detail: "Exports generated in the IDE appear here after sync.",
                    done: hasExports,
                    cta: { label: "Exports", onClick: () => navigate?.("/dashboard-v2?tab=exports") },
                },
            ],
        }
    }, [navigate, projectExports, projectTrainingRuns, projects, selectedProjectId, syncMeta?.lastSyncAt, syncMeta?.lastSyncEventAt])

    const shouldShowOnboardingGate = React.useMemo(() => {
        return !setupChecklist.hasSynced || !setupChecklist.hasProjects
    }, [setupChecklist.hasProjects, setupChecklist.hasSynced])

    const sync = React.useMemo(() => {
        const status =
            syncMeta.lastSyncError || syncMeta.lastSyncEventStatus === "failed"
                ? "Degraded"
                : syncMeta.lastSyncAt
                    ? "Healthy"
                    : "Unknown"
        const lastSync = syncMeta.lastSyncAt ? formatDateTime(syncMeta.lastSyncAt) : "Never"
        const lastEvent = syncMeta.lastSyncEventAt
            ? `${syncMeta.lastSyncEventStatus || "event"} · ${formatDateTime(syncMeta.lastSyncEventAt)}`
            : "No events"

        return {
            status,
            lastSync,
            lastEvent,
        }
    }, [formatDateTime, syncMeta])

    const recommendedNextSteps = React.useMemo(() => {
        if (!selectedProjectId) {
            return {
                title: "Select a project to begin",
                items: [
                    {
                        title: "Pick a project",
                        detail: "All metrics and timelines are scoped to a single project.",
                    },
                ],
            }
        }

        const datasetCount = projectDatasetsCount
        const runCount = Number(projectTrainingRuns?.length || 0)
        const exportCount = Number(projectExports?.length || 0)

        const items = []

        if (datasetCount === 0) {
            items.push({
                title: "Create or sync a dataset",
                detail: "Create your first dataset in the IDE. Once the IDE syncs, the dataset count will appear here.",
            })
        }

        if (datasetCount > 0 && runCount === 0) {
            items.push({
                title: "Run your first training",
                detail: "Start a training run in the IDE. This dashboard will show run status + final metrics once synced.",
            })
        }

        if (runCount > 0 && exportCount === 0) {
            items.push({
                title: "Export a model artifact",
                detail: "Export ONNX/TensorRT/etc. from the IDE. This dashboard stores metadata only (format + timestamp).",
            })
        }

        if (syncMeta.lastSyncAt == null) {
            items.push({
                title: "Check IDE sync health",
                detail: "No sync timestamp reported yet. Make sure the IDE is authenticated and online for metadata sync.",
            })
        }

        if (items.length === 0) {
            items.push({
                title: "Review latest outputs",
                detail: "You have runs and exports. Use the tables below to audit provenance, timestamps, and formats.",
            })
        }

        return {
            title: "Recommended next steps",
            items,
        }
    }, [projectDatasetsCount, projectExports?.length, projectTrainingRuns?.length, selectedProjectId, syncMeta.lastSyncAt])

    const usageCards = React.useMemo(() => {
        const usage = usageWithLimits?.usage || null
        const limits = usageWithLimits?.limits || null

        const projectsUsed = Number(usage?.projects_count ?? projects.length ?? 0)
        const projectsLimit = limits?.max_projects

        const exportsUsed = Number(usage?.exports_count ?? 0)
        const exportsLimit = limits?.max_exports_per_month

        const runsUsed = Number(usage?.training_runs_count ?? 0)
        const runsLimit = limits?.max_training_runs_per_month

        const gpuUsed = Number(usage?.gpu_hours_used ?? 0)
        const gpuLimit = limits?.max_gpu_hours_per_month

        const pct = (val, lim) => {
            if (lim == null) return null
            if (Number(lim) === -1) return 0
            return getUsagePercentage(val, lim)
        }

        return {
            tier: usageWithLimits?.tier || "free",
            projects: { used: projectsUsed, limit: projectsLimit, pct: pct(projectsUsed, projectsLimit) },
            exports: { used: exportsUsed, limit: exportsLimit, pct: pct(exportsUsed, exportsLimit) },
            runs: { used: runsUsed, limit: runsLimit, pct: pct(runsUsed, runsLimit) },
            gpu: { used: gpuUsed, limit: gpuLimit, pct: pct(gpuUsed, gpuLimit) },
        }
    }, [projects.length, usageWithLimits])

    const licenseStatus = React.useMemo(() => {
        if (!license) return "Unknown"
        if (!license.is_active) return "Inactive"
        if (license.expires_at && new Date(license.expires_at).getTime() < Date.now()) return "Expired"
        return "Active"
    }, [license])

    const upgradeSignals = React.useMemo(() => {
        const limits = usageWithLimits?.limits || null
        const usage = usageWithLimits?.usage || null

        const items = [
            {
                key: "projects",
                label: "Projects",
                current: Number(usage?.projects_count ?? 0),
                limit: limits?.max_projects,
            },
            {
                key: "exports",
                label: "Exports (monthly)",
                current: Number(usage?.exports_count ?? 0),
                limit: limits?.max_exports_per_month,
            },
            {
                key: "runs",
                label: "Training runs (monthly)",
                current: Number(usage?.training_runs_count ?? 0),
                limit: limits?.max_training_runs_per_month,
            },
            {
                key: "gpu",
                label: "GPU hours (monthly)",
                current: Number(usage?.gpu_hours_used ?? 0),
                limit: limits?.max_gpu_hours_per_month,
                unit: "h",
            },
        ]

        const warnings = items
            .filter((it) => it.limit != null && it.limit !== -1)
            .map((it) => {
                const soft = isSoftLimitReached(it.current, it.limit)
                const hard = isHardLimitReached(it.current, it.limit)
                return {
                    ...it,
                    isSoftLimit: soft,
                    isHardLimit: hard,
                }
            })
            .filter((it) => it.isSoftLimit || it.isHardLimit)

        const hard = warnings.find((w) => w.isHardLimit)
        const soft = warnings.find((w) => w.isSoftLimit)

        return {
            warnings,
            hard: hard || null,
            soft: soft || null,
        }
    }, [usageWithLimits])

    const timelineItems = React.useMemo(() => {
        const filtered = (activityTimeline || []).filter((a) => {
            if (!selectedProjectId) return false
            const pid = a?.project_id || a?.event_data?.project_id
            if (!pid) return true
            return String(pid) === String(selectedProjectId)
        })

        const rows = (filtered.length ? filtered : activityTimeline || []).slice(0, 10)

        return rows.map((a, idx) => {
            const type = a?.event_type || a?.type || "activity"
            const createdAt = a?.created_at || a?.timestamp || null
            const title = a?.title || type
            const detail = a?.detail || a?.message || a?.metadata?.message || a?.error || ""

            const icon =
                type.toLowerCase().includes("export") ? Download : type.toLowerCase().includes("sync") ? Inbox : Activity

            return {
                key: String(a?.id || `${type}-${idx}`),
                title,
                detail,
                time: createdAt ? formatDateTime(createdAt) : "",
                icon,
            }
        })
    }, [activityTimeline, formatDateTime, selectedProjectId])

    const refreshProjects = React.useCallback(async () => {
        if (!userId) return
        setLoading((p) => ({ ...p, projects: true }))
        const result = await projectsApi.getProjects(userId)
        const data = result?.data || []
        setProjects(data)

        if (!selectedProjectId) {
            const nextDefault = data?.[0] ? getProjectId(data[0]) : ""
            if (nextDefault) setSelectedProjectId(String(nextDefault))
        }
        setLoading((p) => ({ ...p, projects: false }))
    }, [getProjectId, selectedProjectId, userId])

    const refreshExports = React.useCallback(async () => {
        if (!userId) return
        setLoading((p) => ({ ...p, exports: true }))
        const result = await exportsApi.getExports(userId)
        setExports(result?.data || [])
        setLoading((p) => ({ ...p, exports: false }))
    }, [userId])

    const transformUsageDataForChart = React.useCallback((usage) => {
        if (!usage) return []
        const last30Days = []
        const today = new Date()

        for (let i = 29; i >= 0; i--) {
            const date = new Date(today)
            date.setDate(date.getDate() - i)
            const dateStr = date.toISOString().split('T')[0]
            const dayUsage = usage.gpuUsage?.filter((u) => {
                const usageDate = new Date(u.usage_start).toISOString().split('T')[0]
                return usageDate === dateStr
            }) || []
            const totalHours = dayUsage.reduce((sum, u) => sum + parseFloat(u.hours_used || 0), 0)
            last30Days.push({
                date: dateStr,
                label: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                value: totalHours,
            })
        }

        return last30Days
    }, [])

    const refreshBilling = React.useCallback(async () => {
        if (!userId) return
        setLoading((p) => ({ ...p, billing: true }))

        try {
            const [subResult, summaryResult, historyResult, paymentResult, trialResult] = await Promise.all([
                getActiveSubscription().catch(() => null),
                getUserSubscriptionSummary().catch(() => null),
                getBillingHistory(20).catch(() => null),
                getPaymentMethods().catch(() => null),
                getActiveTrial().catch(() => null),
            ])

            setBillingSubscription(subResult?.data || null)
            setSubscriptionSummary(summaryResult?.data || null)
            setBillingHistoryState(historyResult?.data || [])
            setPaymentMethodsState(paymentResult?.data || [])
            setActiveTrial(trialResult?.data || null)

            const subscriptionId = subResult?.data?.subscription_id
            if (subscriptionId) {
                setBillingUsageLoading(true)
                try {
                    const usage = await getSubscriptionUsage(subscriptionId)
                    setBillingUsageData(transformUsageDataForChart(usage?.data))
                } catch {
                    setBillingUsageData([])
                }

                try {
                    const res = await supabase
                        .from('subscription_change_history')
                        .select('*')
                        .eq('subscription_id', subscriptionId)
                        .order('created_at', { ascending: false })
                        .limit(50)
                    setBillingChangeHistory(res?.data || [])
                } catch {
                    setBillingChangeHistory([])
                }
                setBillingUsageLoading(false)
            } else {
                setBillingUsageData([])
                setBillingChangeHistory([])
            }
        } finally {
            setLoading((p) => ({ ...p, billing: false }))
        }
    }, [transformUsageDataForChart, userId])

    const billingFormatDate = React.useCallback((dateString) => {
        if (!dateString) return 'Never'
        try {
            return new Date(dateString).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
            })
        } catch {
            return 'Invalid date'
        }
    }, [])

    const billingFormatDateTime = React.useCallback((dateString) => {
        if (!dateString) return 'Never'
        try {
            return new Date(dateString).toLocaleString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            })
        } catch {
            return 'Invalid date'
        }
    }, [])

    const handleCancelSubscription = React.useCallback(async () => {
        if (!billingSubscription?.subscription_id) return
        const confirmed = confirm(
            'Are you sure you want to cancel your subscription? You will continue to have access until the end of your billing period.'
        )
        if (!confirmed) return
        const result = await cancelSubscription(billingSubscription.subscription_id)
        if (result?.success) {
            await refreshBilling()
        }
    }, [billingSubscription?.subscription_id, refreshBilling])

    const handleResumeSubscription = React.useCallback(async () => {
        if (!billingSubscription?.subscription_id) return
        const result = await resumeSubscription(billingSubscription.subscription_id)
        if (result?.success) {
            await refreshBilling()
        }
    }, [billingSubscription?.subscription_id, refreshBilling])

    const copyDiagnosticsBundle = React.useCallback(async () => {
        const payload = {
            generated_at: new Date().toISOString(),
            user_id: userId || null,
            email: session?.user?.email || null,
            selected_project_id: selectedProjectId || null,
            selected_project_name: selectedProject ? getProjectName(selectedProject) : null,
            sync: {
                status: sync?.status || null,
                last_sync_at: syncMeta?.lastSyncAt || null,
                last_sync_event_at: syncMeta?.lastSyncEventAt || null,
                last_sync_event_status: syncMeta?.lastSyncEventStatus || null,
                last_sync_error: syncMeta?.lastSyncError || null,
                ide_version: syncMeta?.lastIdeVersion || null,
                ide_platform: syncMeta?.lastIdePlatform || null,
            },
            subscription: {
                plan_type: subscriptionSummary?.plan_type || null,
                plan_name: subscriptionSummary?.plan_name || subscriptionSummary?.plan || null,
                status: subscriptionSummary?.status || null,
                trial_active: Boolean(activeTrial?.is_active),
                trial_ends_at: activeTrial?.ends_at || null,
            },
            usage_with_limits: usageWithLimits || null,
            recent_activity: (activityTimeline || []).slice(0, 20),
        }

        const text = JSON.stringify(payload, null, 2)

        try {
            await navigator?.clipboard?.writeText(text)
            alert('Diagnostics bundle copied to clipboard')
        } catch {
            try {
                window.prompt('Copy diagnostics bundle:', text)
            } catch {
                alert('Unable to copy diagnostics bundle')
            }
        }
    }, [activeTrial?.ends_at, activeTrial?.is_active, activityTimeline, selectedProject, selectedProjectId, session?.user?.email, subscriptionSummary, sync?.status, syncMeta, usageWithLimits, userId])

    const downloadInvoice = React.useCallback(
        async (billingId) => {
            const invoice = (billingHistory || []).find((b) => b.billing_id === billingId)
            const url = invoice?.invoice_pdf_url || invoice?.hosted_invoice_url
            if (url) {
                window.open(url, '_blank')
                return
            }
        },
        [billingHistory]
    )

    const refreshUsage = React.useCallback(async () => {
        setLoading((p) => ({ ...p, usage: true }))
        try {
            const result = await getUsageWithLimits()
            setUsageWithLimits(result || null)
        } catch {
            setUsageWithLimits(null)
        }
        setLoading((p) => ({ ...p, usage: false }))
    }, [])

    const refreshTimeline = React.useCallback(async () => {
        if (!userId) return
        setLoading((p) => ({ ...p, timeline: true }))
        const result = await getActivityTimeline(userId, 50)
        setActivityTimeline(result?.data?.activities || result?.activities || [])
        setLoading((p) => ({ ...p, timeline: false }))
    }, [userId])

    const refreshModels = React.useCallback(async () => {
        if (!userId || !selectedProjectId) {
            setModels([])
            return
        }

        setLoading((p) => ({ ...p, models: true }))

        try {
            const { data, error } = await supabase
                .from("models")
                .select("*")
                .eq("user_id", userId)
                .eq("project_id", selectedProjectId)
                .order("trained_at", { ascending: false })
                .limit(50)

            if (error) throw error
            setModels(data || [])
        } catch {
            setModels([])
        }

        setLoading((p) => ({ ...p, models: false }))
    }, [selectedProjectId, userId])

    const refreshLicense = React.useCallback(async () => {
        if (!userId) return
        setLoading((p) => ({ ...p, license: true }))
        try {
            const { data, error } = await supabase
                .from("licenses")
                .select("license_type,is_active,expires_at,issued_at")
                .eq("user_id", userId)
                .order("issued_at", { ascending: false })
                .limit(1)

            if (error) throw error
            setLicense(data?.[0] || null)
        } catch {
            setLicense(null)
        }
        setLoading((p) => ({ ...p, license: false }))
    }, [userId])

    const refreshSubscriptionSummary = React.useCallback(async () => {
        if (!userId) return
        setLoading((p) => ({ ...p, subscription: true }))
        try {
            const result = await getUserSubscriptionSummary()
            if (result?.data) setSubscriptionSummary(result.data)
            else setSubscriptionSummary(null)
        } catch {
            setSubscriptionSummary(null)
        }
        setLoading((p) => ({ ...p, subscription: false }))
    }, [userId])

    const refreshSubscriptionUsage = React.useCallback(async () => {
        const subscriptionId = subscriptionSummary?.subscription_id
        if (!subscriptionId) {
            setUsageData(null)
            return
        }

        setLoading((p) => ({ ...p, subscriptionUsage: true }))
        try {
            const usageResult = await getSubscriptionUsage(subscriptionId)
            if (usageResult?.data) {
                setUsageData(usageResult.data)
            } else {
                setUsageData(null)
            }
        } catch {
            setUsageData(null)
        }
        setLoading((p) => ({ ...p, subscriptionUsage: false }))
    }, [subscriptionSummary?.subscription_id])

    const refreshDiagnostics = React.useCallback(async () => {
        if (!userId) return
        setLoading((p) => ({ ...p, diagnostics: true }))
        try {
            let query = supabase
                .from("ide_diagnostics_events")
                .select("*")
                .eq("user_id", userId)
                .order("created_at", { ascending: false })
                .limit(200)

            if (selectedProjectId) {
                query = query.eq("project_id", String(selectedProjectId))
            }
            if (diagnosticsTypeFilter) {
                query = query.eq("event_type", diagnosticsTypeFilter)
            }
            if (diagnosticsKindFilter) {
                query = query.eq("kind", diagnosticsKindFilter)
            }
            if (diagnosticsAppVersionFilter) {
                query = query.eq("app_version", diagnosticsAppVersionFilter)
            }
            if (diagnosticsQuery) {
                const q = diagnosticsQuery.trim()
                if (q) {
                    query = query.or(
                        `message.ilike.%${q}%,platform.ilike.%${q}%,app_version.ilike.%${q}%,kind.ilike.%${q}%,source.ilike.%${q}%`
                    )
                }
            }

            const { data, error } = await query
            if (error) throw error
            setDiagnosticsEvents(data || [])
        } catch {
            setDiagnosticsEvents([])
        }
        setLoading((p) => ({ ...p, diagnostics: false }))
    }, [
        diagnosticsAppVersionFilter,
        diagnosticsKindFilter,
        diagnosticsQuery,
        diagnosticsTypeFilter,
        selectedProjectId,
        userId,
    ])

    const refreshTrial = React.useCallback(async () => {
        setLoading((p) => ({ ...p, trial: true }))
        try {
            const result = await getActiveTrial()
            setActiveTrial(result?.data || null)
        } catch {
            setActiveTrial(null)
        }
        setLoading((p) => ({ ...p, trial: false }))
    }, [])

    const refreshTrainingRuns = React.useCallback(async () => {
        if (!userId || !selectedProjectId) {
            setTrainingRuns([])
            return
        }

        setLoading((p) => ({ ...p, trainingRuns: true }))

        try {
            const { data, error } = await supabase
                .from("training_runs")
                .select("*")
                .eq("user_id", userId)
                .eq("project_id", selectedProjectId)
                .order("start_time", { ascending: false })
                .limit(50)

            if (error) throw error
            setTrainingRuns(data || [])
        } catch {
            setTrainingRuns([])
        }

        setLoading((p) => ({ ...p, trainingRuns: false }))
    }, [selectedProjectId, userId])

    const refreshSyncMeta = React.useCallback(async () => {
        if (!userId) return

        setLoading((p) => ({ ...p, sync: true }))

        try {
            const { data: tokenRow } = await supabase
                .from("ide_auth_tokens")
                .select("last_sync_at")
                .eq("user_id", userId)
                .order("issued_at", { ascending: false })
                .limit(1)

            const { data: syncRow } = await supabase
                .from("ide_sync_events")
                .select("created_at,sync_status,error_message,ide_version,ide_platform,event_data")
                .eq("user_id", userId)
                .order("created_at", { ascending: false })
                .limit(25)

            const latestToken = tokenRow?.[0] || null
            const events = syncRow || []

            const projectEvent = selectedProjectId
                ? events.find((e) => String(e?.event_data?.project_id || "") === String(selectedProjectId))
                : null
            const latestEvent = projectEvent || events[0] || null

            setSyncMeta({
                lastSyncAt: latestToken?.last_sync_at || null,
                lastSyncEventAt: latestEvent?.created_at || null,
                lastSyncEventStatus: latestEvent?.sync_status || null,
                lastSyncError: latestEvent?.error_message || null,
                lastIdeVersion: latestEvent?.ide_version || null,
                lastIdePlatform: latestEvent?.ide_platform || null,
            })
        } catch {
            setSyncMeta({
                lastSyncAt: null,
                lastSyncEventAt: null,
                lastSyncEventStatus: null,
                lastSyncError: null,
                lastIdeVersion: null,
                lastIdePlatform: null,
            })
        }

        setLoading((p) => ({ ...p, sync: false }))
    }, [selectedProjectId, userId])

    const runRows = React.useMemo(() => {
        const q = runsQuery.trim().toLowerCase()
        const status = runsStatus
        let rows = [...(projectTrainingRuns || [])]

        if (q) {
            rows = rows.filter((r) => {
                const hay = [
                    r?.model_name,
                    r?.model,
                    r?.base_model,
                    r?.status,
                    r?.gpu_type,
                ]
                    .filter(Boolean)
                    .join(" ")
                    .toLowerCase()
                return hay.includes(q)
            })
        }

        if (status !== "all") {
            rows = rows.filter((r) => String(r?.status || "").toLowerCase() === status)
        }

        const dir = runsSortDir === "asc" ? 1 : -1
        rows.sort((a, b) => {
            const av = a?.[runsSortKey]
            const bv = b?.[runsSortKey]
            const as = av == null ? "" : String(av)
            const bs = bv == null ? "" : String(bv)
            if (runsSortKey.includes("time") || runsSortKey.includes("at") || runsSortKey.includes("date")) {
                return (new Date(as).getTime() - new Date(bs).getTime()) * dir
            }
            if (!Number.isNaN(Number(as)) && !Number.isNaN(Number(bs))) {
                return (Number(as) - Number(bs)) * dir
            }
            return as.localeCompare(bs) * dir
        })
        return rows
    }, [projectTrainingRuns, runsQuery, runsSortDir, runsSortKey, runsStatus])

    const runsTotalPages = React.useMemo(() => {
        const size = Number(runsPageSize || 25)
        return Math.max(1, Math.ceil((runRows.length || 0) / size))
    }, [runRows.length, runsPageSize])

    const runsPageClamped = React.useMemo(() => {
        return Math.min(Math.max(1, runsPage || 1), runsTotalPages)
    }, [runsPage, runsTotalPages])

    const runRowsPage = React.useMemo(() => {
        const size = Number(runsPageSize || 25)
        const start = (runsPageClamped - 1) * size
        return runRows.slice(start, start + size)
    }, [runRows, runsPageClamped, runsPageSize])

    const modelRows = React.useMemo(() => {
        const q = modelsQuery.trim().toLowerCase()
        let rows = [...(projectModels || [])]
        if (q) {
            rows = rows.filter((m) => {
                const hay = [m?.model_name, m?.name, m?.base_model, m?.version, m?.model_version]
                    .filter(Boolean)
                    .join(" ")
                    .toLowerCase()
                return hay.includes(q)
            })
        }
        const dir = modelsSortDir === "asc" ? 1 : -1
        rows.sort((a, b) => {
            const av = a?.[modelsSortKey]
            const bv = b?.[modelsSortKey]
            const as = av == null ? "" : String(av)
            const bs = bv == null ? "" : String(bv)
            return (new Date(as).getTime() - new Date(bs).getTime()) * dir
        })
        return rows
    }, [modelsQuery, modelsSortDir, modelsSortKey, projectModels])

    const modelsTotalPages = React.useMemo(() => {
        const size = Number(modelsPageSize || 25)
        return Math.max(1, Math.ceil((modelRows.length || 0) / size))
    }, [modelRows.length, modelsPageSize])

    const modelsPageClamped = React.useMemo(() => {
        return Math.min(Math.max(1, modelsPage || 1), modelsTotalPages)
    }, [modelsPage, modelsTotalPages])

    const modelRowsPage = React.useMemo(() => {
        const size = Number(modelsPageSize || 25)
        const start = (modelsPageClamped - 1) * size
        return modelRows.slice(start, start + size)
    }, [modelRows, modelsPageClamped, modelsPageSize])

    const exportRows = React.useMemo(() => {
        const q = exportsQuery.trim().toLowerCase()
        const format = exportsFormat
        let rows = [...(projectExports || [])]

        if (format !== "all") {
            rows = rows.filter((e) => String(e?.format || "").toLowerCase() === format)
        }
        if (q) {
            rows = rows.filter((e) => {
                const hay = [e?.format, e?.artifact_name, e?.artifact, e?.model_name]
                    .filter(Boolean)
                    .join(" ")
                    .toLowerCase()
                return hay.includes(q)
            })
        }
        const dir = exportsSortDir === "asc" ? 1 : -1
        rows.sort((a, b) => {
            const av = a?.[exportsSortKey] || a?.created_at
            const bv = b?.[exportsSortKey] || b?.created_at
            return (new Date(av || 0).getTime() - new Date(bv || 0).getTime()) * dir
        })
        return rows
    }, [exportsFormat, exportsQuery, exportsSortDir, exportsSortKey, projectExports])

    const exportsTotalPages = React.useMemo(() => {
        const size = Number(exportsPageSize || 25)
        return Math.max(1, Math.ceil((exportRows.length || 0) / size))
    }, [exportRows.length, exportsPageSize])

    const exportsPageClamped = React.useMemo(() => {
        return Math.min(Math.max(1, exportsPage || 1), exportsTotalPages)
    }, [exportsPage, exportsTotalPages])

    const exportRowsPage = React.useMemo(() => {
        const size = Number(exportsPageSize || 25)
        const start = (exportsPageClamped - 1) * size
        return exportRows.slice(start, start + size)
    }, [exportRows, exportsPageClamped, exportsPageSize])

    React.useEffect(() => {
        refreshProjects()
    }, [refreshProjects])

    React.useEffect(() => {
        refreshExports()
    }, [refreshExports])

    React.useEffect(() => {
        refreshLicense()
        refreshSubscriptionSummary()
        refreshTrial()
    }, [refreshLicense, refreshSubscriptionSummary, refreshTrial])

    React.useEffect(() => {
        if (activeTab !== 'billing') return
        refreshBilling()
    }, [activeTab, refreshBilling])

    React.useEffect(() => {
        refreshSubscriptionUsage()
    }, [refreshSubscriptionUsage])

    React.useEffect(() => {
        refreshModels()
        refreshTrainingRuns()
        refreshSyncMeta()
    }, [refreshModels, refreshSyncMeta, refreshTrainingRuns])

    React.useEffect(() => {
        refreshUsage()
        refreshTimeline()
    }, [refreshTimeline, refreshUsage])

    React.useEffect(() => {
        if (!userId) return

        const unsubscribe = subscribeToAllUpdates(userId, {
            usageTracking: () => {
                refreshUsage()
            },
            subscription: () => {
                refreshSubscriptionSummary()
                refreshTrial()
                if (activeTab === 'billing') {
                    refreshBilling()
                }
            },
            ideSync: () => {
                refreshSyncMeta()
                refreshTimeline()
            },
            models: () => {
                refreshModels()
            },
            trainingRuns: () => {
                refreshTrainingRuns()
            },
            projects: () => {
                refreshProjects()
            },
        })

        return () => {
            unsubscribe?.()
        }
    }, [activeTab, refreshBilling, refreshModels, refreshProjects, refreshSubscriptionSummary, refreshSyncMeta, refreshTimeline, refreshTrainingRuns, refreshTrial, refreshUsage, userId])

    return (
        <SidebarProvider
            defaultOpen={sidebarDefaultOpen}
            className="dark min-h-svh w-full bg-background text-foreground antialiased"
            style={{
                "--sidebar-width": "20rem",
                "--sidebar-width-mobile": "20rem",
            }}
        >
            <AppSidebar
                navigate={navigate}
                user={{ name: username, email: session?.user?.email || "", avatar: "" }}
                projects={projects}
                onSignOut={handleSignOut}
            />

            <SidebarInset className="min-w-0 flex-1 w-auto min-h-0 md:min-h-0">
                <div className="flex items-center justify-between gap-3 border-b p-2 sm:p-4">
                    <div className="flex items-center gap-2">
                        <SidebarTrigger />
                        <div className="leading-tight">
                            <div className="text-sm font-semibold tracking-tight">Dashboard</div>
                            <div className="text-xs text-muted-foreground">Your workspace overview</div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="hidden text-right sm:block">
                            <div className="text-sm font-semibold tracking-tight">{username}</div>
                            <div className="text-xs text-muted-foreground">Last sync: {sync.lastSync}</div>
                        </div>
                        <Avatar className="h-9 w-9">
                            <AvatarFallback className="text-xs font-semibold">
                                {initials}
                            </AvatarFallback>
                        </Avatar>
                    </div>
                </div>

                <div
                    className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden p-2 sm:p-4"
                    style={{ scrollbarGutter: "stable" }}
                >
                    {shouldShowOnboardingGate ? (
                        <div className="w-full space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Rocket className="h-4 w-4" />
                                        Connect your IDE to start
                                    </CardTitle>
                                    <CardDescription>
                                        This web dashboard is read-only. Projects, runs, and exports are created in the ML Forge IDE and then synced here.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="flex flex-wrap gap-2">
                                        <Button onClick={() => navigate?.('/download')}>
                                            <Download className="mr-2 h-4 w-4" />
                                            Download IDE
                                        </Button>
                                        <Button variant="outline" onClick={() => navigate?.('/docs')}>
                                            View docs
                                        </Button>
                                        <Button variant="outline" onClick={() => navigate?.('/dashboard-v2?tab=diagnostics')}>
                                            Troubleshoot sync
                                        </Button>
                                        <Button variant="outline" onClick={() => copyDiagnosticsBundle()}>
                                            <Clipboard className="mr-2 h-4 w-4" />
                                            Copy diagnostics
                                        </Button>
                                    </div>

                                    <div className="space-y-2">
                                        {setupChecklist.steps.slice(0, 4).map((s) => {
                                            const Icon = s.done ? CheckCircle2 : Circle
                                            return (
                                                <div key={s.key} className="flex items-start justify-between gap-3 rounded-md border bg-background p-3">
                                                    <div className="flex min-w-0 items-start gap-3">
                                                        <div className="mt-0.5 text-muted-foreground">
                                                            <Icon className="h-4 w-4" />
                                                        </div>
                                                        <div className="min-w-0">
                                                            <div className="text-sm font-semibold tracking-tight">{s.title}</div>
                                                            <div className="text-xs text-muted-foreground">{s.detail}</div>
                                                        </div>
                                                    </div>
                                                    <Button variant={s.done ? "outline" : "default"} size="sm" onClick={s.cta.onClick}>
                                                        {s.cta.label}
                                                    </Button>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Current status</CardTitle>
                                    <CardDescription>What we know about your IDE connection</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-2 text-sm">
                                    <div className="flex items-center justify-between">
                                        <div className="text-muted-foreground">Sync health</div>
                                        <div className="font-semibold tracking-tight">{sync.status}</div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="text-muted-foreground">Last sync</div>
                                        <div className="text-xs text-muted-foreground">{sync.lastSync}</div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="text-muted-foreground">Last event</div>
                                        <div className="text-xs text-muted-foreground">{sync.lastEvent}</div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    ) : (
                        <div className="w-full">
                            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                                <TabsList className="mb-4 flex h-auto flex-wrap justify-start gap-1">
                                    <TabsTrigger value="overview">Overview</TabsTrigger>
                                    <TabsTrigger value="projects">Projects</TabsTrigger>
                                    <TabsTrigger value="activity">Activity</TabsTrigger>
                                    <TabsTrigger value="runs">Runs</TabsTrigger>
                                    <TabsTrigger value="models">Models</TabsTrigger>
                                    <TabsTrigger value="exports">Exports</TabsTrigger>
                                    <TabsTrigger value="billing">Billing</TabsTrigger>
                                    <TabsTrigger value="diagnostics">Diagnostics</TabsTrigger>
                                    <TabsTrigger value="settings">Settings</TabsTrigger>
                                </TabsList>

                                <TabsContent value="overview" className="space-y-4">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Workspace</CardTitle>
                                            <CardDescription>Read-only web dashboard. Projects, runs, models, and exports are created in the IDE and synced here.</CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-3">
                                            <div className="grid gap-3 sm:grid-cols-2">
                                                <div className="rounded-md border bg-background p-3">
                                                    <div className="text-xs text-muted-foreground">Account</div>
                                                    <div className="text-sm font-semibold tracking-tight">{username}</div>
                                                    <div className="text-xs text-muted-foreground">{session?.user?.email || ""}</div>
                                                </div>
                                                <div className="rounded-md border bg-background p-3">
                                                    <div className="text-xs text-muted-foreground">Sync health</div>
                                                    <div className="text-sm font-semibold tracking-tight">{sync.status}</div>
                                                    <div className="text-xs text-muted-foreground">Last sync: {sync.lastSync}</div>
                                                </div>
                                            </div>

                                            <div className="flex flex-wrap gap-2">
                                                <Button variant="outline" onClick={() => navigate?.('/download')}>
                                                    <Download className="mr-2 h-4 w-4" />
                                                    Download hub
                                                </Button>
                                                <Button variant="outline" onClick={() => navigate?.('/docs')}>
                                                    View docs
                                                </Button>
                                                <Button variant="outline" onClick={() => navigate?.('/teams')}>
                                                    Teams
                                                </Button>
                                                <Button variant="outline" onClick={() => navigate?.('/dashboard-v2?tab=billing')}>
                                                    Billing
                                                </Button>
                                                <Button variant="outline" onClick={() => handleSignOut()}>
                                                    Logout
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {subscriptionSummary?.plan_type === 'free' && !activeTrial && (
                                        <Card>
                                            <CardHeader>
                                                <CardTitle>Optional: unlock higher limits</CardTitle>
                                                <CardDescription>Upgrade if you’re hitting limits (projects, exports, GPU hours).</CardDescription>
                                            </CardHeader>
                                            <CardContent>
                                                <Button onClick={() => navigate?.('/pricing')}>See plans</Button>
                                            </CardContent>
                                        </Card>
                                    )}

                                    {activeTrial && (
                                        <Card>
                                            <CardHeader>
                                                <CardTitle>Trial period active</CardTitle>
                                                <CardDescription>
                                                    {activeTrial?.ends_at
                                                        ? `Your trial ends on ${formatDateTime(activeTrial.ends_at)}.`
                                                        : 'Your trial is currently active.'}
                                                </CardDescription>
                                            </CardHeader>
                                            <CardContent>
                                                <Button onClick={() => navigate?.('/pricing')}>Choose a plan</Button>
                                            </CardContent>
                                        </Card>
                                    )}

                                    {!selectedProjectId && (
                                        <Card>
                                            <CardHeader>
                                                <CardTitle>No project selected</CardTitle>
                                                <CardDescription>Select a project to view project-scoped sync health, runs, models, and exports.</CardDescription>
                                            </CardHeader>
                                            <CardContent className="space-y-2 text-sm text-muted-foreground">
                                                <div>- Choose a project from the selector below</div>
                                                <div>- Or open the Projects tab to pick one</div>
                                            </CardContent>
                                        </Card>
                                    )}

                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Project</CardTitle>
                                            <CardDescription>Scope your dashboard to a single project</CardDescription>
                                        </CardHeader>
                                        <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                            <div className="space-y-1">
                                                <div className="text-sm font-semibold tracking-tight">
                                                    {selectedProject ? getProjectName(selectedProject) : 'No project'}
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    Datasets: {projectDatasetsCount} · Exports: {projectExports.length} · GPU hours: {projectResourceSummary.totalGpuHours}
                                                </div>
                                            </div>

                                            <label className="flex items-center gap-2">
                                                <span className="text-xs text-muted-foreground">Switch</span>
                                                <select
                                                    className="h-9 rounded-md border bg-background px-3 text-sm"
                                                    value={selectedProjectId}
                                                    onChange={(e) => setSelectedProjectId(e.target.value)}
                                                >
                                                    {projects.map((p) => (
                                                        <option key={String(getProjectId(p))} value={String(getProjectId(p))}>
                                                            {getProjectName(p)}
                                                        </option>
                                                    ))}
                                                </select>
                                            </label>
                                        </CardContent>
                                    </Card>

                                    {selectedProjectId && (
                                        <div className="grid gap-3 lg:grid-cols-2">
                                            <Card>
                                                <CardHeader>
                                                    <CardTitle>Resource summary</CardTitle>
                                                    <CardDescription>Project-level compute & artifacts</CardDescription>
                                                </CardHeader>
                                                <CardContent className="grid gap-3 sm:grid-cols-2">
                                                    <div className="rounded-md border bg-background p-3">
                                                        <div className="text-xs text-muted-foreground">Training runs</div>
                                                        <div className="text-sm font-semibold tracking-tight">{projectTrainingRuns.length}</div>
                                                    </div>
                                                    <div className="rounded-md border bg-background p-3">
                                                        <div className="text-xs text-muted-foreground">Models</div>
                                                        <div className="text-sm font-semibold tracking-tight">{projectModels.length}</div>
                                                    </div>
                                                    <div className="rounded-md border bg-background p-3">
                                                        <div className="text-xs text-muted-foreground">GPU hours</div>
                                                        <div className="text-sm font-semibold tracking-tight">{projectResourceSummary.totalGpuHours}</div>
                                                        <div className="text-xs text-muted-foreground">
                                                            {projectResourceSummary.lastGpuType
                                                                ? `${projectResourceSummary.lastGpuType}${projectResourceSummary.lastGpuCount ? ` · x${projectResourceSummary.lastGpuCount}` : ""}`
                                                                : "—"}
                                                        </div>
                                                    </div>
                                                    <div className="rounded-md border bg-background p-3">
                                                        <div className="text-xs text-muted-foreground">Exports</div>
                                                        <div className="text-sm font-semibold tracking-tight">{projectExports.length}</div>
                                                    </div>
                                                </CardContent>
                                            </Card>

                                            <Card>
                                                <CardHeader>
                                                    <CardTitle>Dataset & annotations</CardTitle>
                                                    <CardDescription>Dataset stats (placeholder)</CardDescription>
                                                </CardHeader>
                                                <CardContent className="space-y-2 text-sm text-muted-foreground">
                                                    <div className="flex items-center justify-between">
                                                        <div>Datasets</div>
                                                        <div className="font-semibold tracking-tight text-foreground">{projectDatasetsCount}</div>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <div>Annotations</div>
                                                        <div className="text-xs">—</div>
                                                    </div>
                                                    <div className="text-xs">
                                                        Annotation metrics will appear once the IDE reports them for this project.
                                                    </div>
                                                </CardContent>
                                            </Card>

                                            <Card className="lg:col-span-2">
                                                <CardHeader>
                                                    <CardTitle>Live activity</CardTitle>
                                                    <CardDescription>Latest training runs for this project</CardDescription>
                                                </CardHeader>
                                                <CardContent className="space-y-3">
                                                    {projectTrainingRuns.slice(0, 5).map((r) => (
                                                        <div key={String(r.id || r.run_id || `${r.created_at}-${r.status}`)} className="flex items-start justify-between gap-3">
                                                            <div className="min-w-0">
                                                                <div className="text-sm font-semibold tracking-tight">
                                                                    {r.name || r.run_name || r.model_name || "Training run"}
                                                                </div>
                                                                <div className="text-xs text-muted-foreground">
                                                                    {(r.status || "unknown").toString()} · {r.created_at ? formatDateTime(r.created_at) : ""}
                                                                </div>
                                                            </div>
                                                            <div className="text-xs text-muted-foreground">
                                                                {r.gpu_hours_used ? `${Number(r.gpu_hours_used).toFixed(2)} GPUh` : ""}
                                                            </div>
                                                        </div>
                                                    ))}
                                                    {projectTrainingRuns.length === 0 && (
                                                        <div className="text-sm text-muted-foreground">No training runs found for this project yet.</div>
                                                    )}
                                                </CardContent>
                                            </Card>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                                        <Card>
                                            <CardHeader className="pb-2">
                                                <CardDescription>Projects</CardDescription>
                                                <CardTitle className="text-2xl">{overview.projects}</CardTitle>
                                            </CardHeader>
                                            <CardContent className="text-xs text-muted-foreground">Active in the last 7 days</CardContent>
                                        </Card>

                                        <Card>
                                            <CardHeader className="pb-2">
                                                <CardDescription>Datasets</CardDescription>
                                                <CardTitle className="text-2xl">{overview.datasets}</CardTitle>
                                            </CardHeader>
                                            <CardContent className="text-xs text-muted-foreground">Synced from the IDE</CardContent>
                                        </Card>

                                        <Card>
                                            <CardHeader className="pb-2">
                                                <CardDescription>Exports</CardDescription>
                                                <CardTitle className="text-2xl">{overview.exports}</CardTitle>
                                            </CardHeader>
                                            <CardContent className="text-xs text-muted-foreground">Artifacts tracked</CardContent>
                                        </Card>

                                        <Card>
                                            <CardHeader className="pb-2">
                                                <CardDescription>GPU Hours</CardDescription>
                                                <CardTitle className="text-2xl">{overview.gpuHours}</CardTitle>
                                            </CardHeader>
                                            <CardContent className="text-xs text-muted-foreground">This billing period</CardContent>
                                        </Card>
                                    </div>

                                    <div className="grid gap-3 lg:grid-cols-2">
                                        <Card>
                                            <CardHeader>
                                                <div className="flex items-center justify-between gap-3">
                                                    <CardTitle>Sync status</CardTitle>
                                                    <Button variant="outline" size="sm" onClick={() => copyDiagnosticsBundle()}>
                                                        <Clipboard className="mr-2 h-4 w-4" />
                                                        Copy diagnostics
                                                    </Button>
                                                </div>
                                                <CardDescription>IDE ↔ dashboard metadata sync</CardDescription>
                                            </CardHeader>
                                            <CardContent className="space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <div className="text-sm font-semibold tracking-tight">{sync.status}</div>
                                                    <div className="text-xs text-muted-foreground">Last sync: {sync.lastSync}</div>
                                                </div>
                                                <div className="text-xs text-muted-foreground">Last event: {sync.lastEvent}</div>
                                                {(syncMeta.lastIdeVersion || syncMeta.lastIdePlatform) && (
                                                    <div className="text-xs text-muted-foreground">
                                                        IDE: {syncMeta.lastIdePlatform || "Unknown"} · {syncMeta.lastIdeVersion || "Unknown"}
                                                    </div>
                                                )}
                                                {syncMeta.lastSyncError && (
                                                    <div className="text-xs text-muted-foreground">Error: {syncMeta.lastSyncError}</div>
                                                )}
                                            </CardContent>
                                        </Card>

                                        <Card>
                                            <CardHeader>
                                                <div className="flex items-center justify-between gap-3">
                                                    <CardTitle>Training runs</CardTitle>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => navigate?.('/dashboard-v2?tab=runs')}
                                                    >
                                                        View all
                                                    </Button>
                                                </div>
                                                <CardDescription>Latest runs for the selected project</CardDescription>
                                            </CardHeader>
                                            <CardContent className="space-y-3">
                                                {loading.trainingRuns ? (
                                                    <div className="space-y-2">
                                                        <Skeleton className="h-5 w-2/3" />
                                                        <Skeleton className="h-5 w-1/2" />
                                                        <Skeleton className="h-5 w-3/4" />
                                                    </div>
                                                ) : selectedProjectId && projectTrainingRuns.length === 0 ? (
                                                    <div className="text-sm text-muted-foreground">No training runs yet.</div>
                                                ) : !selectedProjectId ? (
                                                    <div className="text-sm text-muted-foreground">Select a project to see runs.</div>
                                                ) : (
                                                    projectTrainingRuns.slice(0, 5).map((r) => (
                                                        <div
                                                            key={String(r.id || r.run_id || `${r.start_time || r.created_at}-${r.status}`)}
                                                            className="flex items-start justify-between gap-3"
                                                        >
                                                            <div className="min-w-0">
                                                                <div className="text-sm font-semibold tracking-tight">
                                                                    {r.model_name || r.model || r.name || 'Training run'}
                                                                </div>
                                                                <div className="text-xs text-muted-foreground">
                                                                    {(r.status || 'unknown').toString()} · {r.start_time ? formatDateTime(r.start_time) : r.created_at ? formatDateTime(r.created_at) : ''}
                                                                </div>
                                                            </div>
                                                            <div className="text-xs text-muted-foreground">
                                                                {r.gpu_hours_used ? `${Number(r.gpu_hours_used).toFixed(2)} GPUh` : ''}
                                                            </div>
                                                        </div>
                                                    ))
                                                )}
                                            </CardContent>
                                        </Card>

                                        <Card>
                                            <CardHeader>
                                                <div className="flex items-center justify-between gap-3">
                                                    <CardTitle>Recent activity</CardTitle>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => navigate?.('/dashboard-v2?tab=diagnostics')}
                                                    >
                                                        View all
                                                    </Button>
                                                </div>
                                                <CardDescription>Latest events synced from your IDE</CardDescription>
                                            </CardHeader>
                                            <CardContent className="space-y-3">
                                                {loading.timeline ? (
                                                    <div className="text-sm text-muted-foreground">Loading timeline…</div>
                                                ) : timelineItems.length === 0 ? (
                                                    <div className="text-sm text-muted-foreground">No sync activity yet.</div>
                                                ) : (
                                                    timelineItems.map((item) => {
                                                        const Icon = item.icon
                                                        return (
                                                            <div key={item.key} className="flex items-start gap-3">
                                                                <div className="mt-0.5 rounded-md border p-1 text-muted-foreground">
                                                                    <Icon className="h-4 w-4" />
                                                                </div>
                                                                <div className="min-w-0 flex-1">
                                                                    <div className="text-sm font-semibold tracking-tight">{item.title}</div>
                                                                    <div className="text-xs text-muted-foreground">{item.detail}</div>
                                                                </div>
                                                                <div className="text-xs text-muted-foreground">{item.time}</div>
                                                            </div>
                                                        )
                                                    })
                                                )}
                                            </CardContent>
                                        </Card>

                                        <Card>
                                            <CardHeader>
                                                <div className="flex items-center justify-between gap-3">
                                                    <CardTitle>Models</CardTitle>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => navigate?.('/dashboard-v2?tab=models')}
                                                    >
                                                        View all
                                                    </Button>
                                                </div>
                                                <CardDescription>Recently trained models</CardDescription>
                                            </CardHeader>
                                            <CardContent className="space-y-3">
                                                {loading.models ? (
                                                    <div className="space-y-2">
                                                        <Skeleton className="h-5 w-2/3" />
                                                        <Skeleton className="h-5 w-1/2" />
                                                        <Skeleton className="h-5 w-3/4" />
                                                    </div>
                                                ) : !selectedProjectId ? (
                                                    <div className="text-sm text-muted-foreground">Select a project to see models.</div>
                                                ) : projectModels.length === 0 ? (
                                                    <div className="text-sm text-muted-foreground">No models yet.</div>
                                                ) : (
                                                    projectModels.slice(0, 5).map((m) => (
                                                        <div key={String(m.id || m.model_id || `${m.trained_at || m.updated_at}-${m.name}`)} className="flex items-start justify-between gap-3">
                                                            <div className="min-w-0">
                                                                <div className="text-sm font-semibold tracking-tight">
                                                                    {m.model_name || m.name || m.base_model || 'Model'}
                                                                </div>
                                                                <div className="text-xs text-muted-foreground">
                                                                    {m.version || m.model_version ? `v${m.version || m.model_version}` : '—'}
                                                                    {m.trained_at ? ` · ${formatDateTime(m.trained_at)}` : m.updated_at ? ` · ${formatDateTime(m.updated_at)}` : ''}
                                                                </div>
                                                            </div>
                                                            <div className="text-xs text-muted-foreground">{m.status ? String(m.status) : ''}</div>
                                                        </div>
                                                    ))
                                                )}
                                            </CardContent>
                                        </Card>

                                        <Card>
                                            <CardHeader>
                                                <div className="flex items-center justify-between gap-3">
                                                    <CardTitle>Exports</CardTitle>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => navigate?.('/dashboard-v2?tab=exports')}
                                                    >
                                                        View all
                                                    </Button>
                                                </div>
                                                <CardDescription>Latest export artifacts</CardDescription>
                                            </CardHeader>
                                            <CardContent className="space-y-3">
                                                {loading.exports ? (
                                                    <div className="space-y-2">
                                                        <Skeleton className="h-5 w-2/3" />
                                                        <Skeleton className="h-5 w-1/2" />
                                                        <Skeleton className="h-5 w-3/4" />
                                                    </div>
                                                ) : projectExports.length === 0 ? (
                                                    <div className="text-sm text-muted-foreground">
                                                        {selectedProjectId ? 'No exports yet.' : 'Select a project to see exports.'}
                                                    </div>
                                                ) : (
                                                    projectExports.slice(0, 5).map((e) => (
                                                        <div key={String(e.id || e.export_id || `${e.created_at}-${e.format}`)} className="flex items-start justify-between gap-3">
                                                            <div className="min-w-0">
                                                                <div className="text-sm font-semibold tracking-tight">
                                                                    {e.name || e.export_name || e.format || 'Export'}
                                                                </div>
                                                                <div className="text-xs text-muted-foreground">
                                                                    {(e.status || 'unknown').toString()} · {e.created_at ? formatDateTime(e.created_at) : ''}
                                                                </div>
                                                            </div>
                                                            <div className="text-xs text-muted-foreground">
                                                                {e.download_url ? (
                                                                    <Button variant="outline" size="sm" onClick={() => window.open(e.download_url, '_blank')}>
                                                                        Open
                                                                    </Button>
                                                                ) : (
                                                                    ''
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))
                                                )}
                                            </CardContent>
                                        </Card>

                                        <Card>
                                            <CardHeader>
                                                <CardTitle>Usage & limits</CardTitle>
                                                <CardDescription>Plan: {usageCards.tier}</CardDescription>
                                            </CardHeader>
                                            <CardContent className="space-y-3">
                                                <div className="space-y-1">
                                                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                                                        <div>Projects</div>
                                                        <div>
                                                            {usageCards.projects.used}
                                                            {usageCards.projects.limit == null
                                                                ? ""
                                                                : Number(usageCards.projects.limit) === -1
                                                                    ? " / ∞"
                                                                    : ` / ${usageCards.projects.limit}`}
                                                        </div>
                                                    </div>
                                                    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                                                        <div
                                                            className="h-full bg-foreground"
                                                            style={{ width: `${Math.min(100, usageCards.projects.pct ?? 0)}%` }}
                                                        />
                                                    </div>
                                                </div>

                                                <div className="space-y-1">
                                                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                                                        <div>Exports (monthly)</div>
                                                        <div>
                                                            {usageCards.exports.used}
                                                            {usageCards.exports.limit == null
                                                                ? ""
                                                                : Number(usageCards.exports.limit) === -1
                                                                    ? " / ∞"
                                                                    : ` / ${usageCards.exports.limit}`}
                                                        </div>
                                                    </div>
                                                    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                                                        <div
                                                            className="h-full bg-foreground"
                                                            style={{ width: `${Math.min(100, usageCards.exports.pct ?? 0)}%` }}
                                                        />
                                                    </div>
                                                </div>

                                                <div className="space-y-1">
                                                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                                                        <div>Training runs (monthly)</div>
                                                        <div>
                                                            {usageCards.runs.used}
                                                            {usageCards.runs.limit == null
                                                                ? ""
                                                                : Number(usageCards.runs.limit) === -1
                                                                    ? " / ∞"
                                                                    : ` / ${usageCards.runs.limit}`}
                                                        </div>
                                                    </div>
                                                    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                                                        <div
                                                            className="h-full bg-foreground"
                                                            style={{ width: `${Math.min(100, usageCards.runs.pct ?? 0)}%` }}
                                                        />
                                                    </div>
                                                </div>

                                                <div className="space-y-1">
                                                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                                                        <div>GPU hours (monthly)</div>
                                                        <div>
                                                            {usageCards.gpu.used.toFixed(2)}
                                                            {usageCards.gpu.limit == null
                                                                ? ""
                                                                : Number(usageCards.gpu.limit) === -1
                                                                    ? " / ∞"
                                                                    : ` / ${Number(usageCards.gpu.limit).toFixed(2)}`}
                                                        </div>
                                                    </div>
                                                    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                                                        <div
                                                            className="h-full bg-foreground"
                                                            style={{ width: `${Math.min(100, usageCards.gpu.pct ?? 0)}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>

                                        <Card>
                                            <CardHeader>
                                                <CardTitle>Next steps</CardTitle>
                                                <CardDescription>{recommendedNextSteps.title}</CardDescription>
                                            </CardHeader>
                                            <CardContent className="space-y-3">
                                                {recommendedNextSteps.items.map((step) => (
                                                    <div key={step.title} className="space-y-1">
                                                        <div className="text-sm font-semibold tracking-tight">{step.title}</div>
                                                        <div className="text-xs text-muted-foreground">{step.detail}</div>
                                                    </div>
                                                ))}
                                            </CardContent>
                                        </Card>

                                        <Card>
                                            <CardHeader>
                                                <CardTitle>Usage chart</CardTitle>
                                                <CardDescription>Subscription GPU usage (last 30 points)</CardDescription>
                                            </CardHeader>
                                            <CardContent>
                                                {loading.subscriptionUsage ? (
                                                    <div className="space-y-2">
                                                        <Skeleton className="h-6 w-1/2" />
                                                        <Skeleton className="h-48 w-full" />
                                                    </div>
                                                ) : usageData ? (
                                                    <UsageChart data={usageData} type="line" title="GPU Hours" />
                                                ) : (
                                                    <div className="text-sm text-muted-foreground">
                                                        No subscription usage data available.
                                                    </div>
                                                )}
                                            </CardContent>
                                        </Card>
                                    </div>
                                </TabsContent>

                                <TabsContent value="settings">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Account</CardTitle>
                                            <CardDescription>Basic account details and shortcuts.</CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="grid gap-2 text-sm">
                                                <div className="flex items-center justify-between gap-3">
                                                    <div className="text-muted-foreground">Name</div>
                                                    <div className="font-medium">
                                                        {(() => {
                                                            const meta = session?.user?.user_metadata || {}
                                                            const name = [meta.first_name, meta.last_name].filter(Boolean).join(' ') || session?.user?.email || 'Account'
                                                            return name
                                                        })()}
                                                    </div>
                                                </div>
                                                <div className="flex items-center justify-between gap-3">
                                                    <div className="text-muted-foreground">Email</div>
                                                    <div className="font-medium">{session?.user?.email || '—'}</div>
                                                </div>
                                            </div>

                                            <div className="flex flex-wrap gap-2">
                                                <Button variant="outline" onClick={() => navigate?.('/dashboard-v2?tab=billing')}>
                                                    Billing
                                                </Button>
                                                <Button variant="outline" onClick={() => navigate?.('/dashboard-v2?tab=projects')}>
                                                    Projects
                                                </Button>
                                                <Button variant="outline" onClick={() => navigate?.('/dashboard-v2')}>
                                                    Dashboard
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </TabsContent>

                                <TabsContent value="activity">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Activity timeline</CardTitle>
                                            <CardDescription>All recent events</CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-3">
                                            {timelineItems.map((item) => {
                                                const Icon = item.icon
                                                return (
                                                    <div key={item.key} className="flex items-start gap-3">
                                                        <div className="mt-0.5 rounded-md border p-1 text-muted-foreground">
                                                            <Icon className="h-4 w-4" />
                                                        </div>
                                                        <div className="min-w-0 flex-1">
                                                            <div className="text-sm font-semibold tracking-tight">{item.title}</div>
                                                            <div className="text-xs text-muted-foreground">{item.detail}</div>
                                                        </div>
                                                        <div className="text-xs text-muted-foreground">{item.time}</div>
                                                    </div>
                                                )
                                            })}
                                        </CardContent>
                                    </Card>
                                </TabsContent>

                                <TabsContent value="runs">
                                    {selectedRunId && (
                                        <Card className="mb-3">
                                            <CardHeader>
                                                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                                                    <div>
                                                        <CardTitle>Run details</CardTitle>
                                                        <CardDescription>{selectedRun ? `Run ${selectedRunId}` : `Run ${selectedRunId} not found in current project`}</CardDescription>
                                                    </div>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => setSelectedRunId("")}
                                                    >
                                                        Close
                                                    </Button>
                                                </div>
                                            </CardHeader>
                                            <CardContent className="space-y-4">
                                                {selectedRun ? (
                                                    <>
                                                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                                                            <div className="rounded-md border bg-background p-3">
                                                                <div className="text-xs text-muted-foreground">Model</div>
                                                                <div className="text-sm font-semibold tracking-tight">{selectedRun?.model_name || selectedRun?.model || selectedRun?.base_model || "-"}</div>
                                                            </div>
                                                            <div className="rounded-md border bg-background p-3">
                                                                <div className="text-xs text-muted-foreground">Status</div>
                                                                <div className="pt-1">
                                                                    <StatusPill value={selectedRun?.status || "Unknown"} />
                                                                </div>
                                                            </div>
                                                            <div className="rounded-md border bg-background p-3">
                                                                <div className="text-xs text-muted-foreground">GPU hours</div>
                                                                <div className="text-sm font-semibold tracking-tight">{Number(selectedRun?.gpu_hours_used || 0).toFixed(2)}</div>
                                                            </div>
                                                            <div className="rounded-md border bg-background p-3">
                                                                <div className="text-xs text-muted-foreground">Started</div>
                                                                <div className="text-sm font-semibold tracking-tight">{formatDateTime(selectedRun?.start_time || selectedRun?.created_at)}</div>
                                                            </div>
                                                        </div>

                                                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                                                            <div className="rounded-md border bg-background p-3">
                                                                <div className="text-xs text-muted-foreground">Finished</div>
                                                                <div className="text-sm font-semibold tracking-tight">{formatDateTime(selectedRun?.end_time || selectedRun?.finished_at)}</div>
                                                            </div>
                                                            <div className="rounded-md border bg-background p-3">
                                                                <div className="text-xs text-muted-foreground">Finished reason</div>
                                                                <div className="text-sm font-semibold tracking-tight">{selectedRun?.finished_reason || "-"}</div>
                                                            </div>
                                                            <div className="rounded-md border bg-background p-3">
                                                                <div className="text-xs text-muted-foreground">Last heartbeat</div>
                                                                <div className="text-sm font-semibold tracking-tight">{formatDateTime(selectedRun?.last_heartbeat_at)}</div>
                                                            </div>
                                                            <div className="rounded-md border bg-background p-3">
                                                                <div className="text-xs text-muted-foreground">IDE</div>
                                                                <div className="text-sm font-semibold tracking-tight">
                                                                    {[selectedRun?.ide_platform, selectedRun?.ide_build, selectedRun?.ide_version].filter(Boolean).join(" · ") || "-"}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                                                            <div className="rounded-md border bg-background p-3">
                                                                <div className="text-xs text-muted-foreground">Git</div>
                                                                <div className="text-sm font-semibold tracking-tight">
                                                                    {[selectedRun?.git_branch, selectedRun?.git_commit].filter(Boolean).join(" · ") || "-"}
                                                                </div>
                                                            </div>
                                                            <div className="rounded-md border bg-background p-3">
                                                                <div className="text-xs text-muted-foreground">Config hash</div>
                                                                <div className="text-sm font-semibold tracking-tight truncate" title={selectedRun?.config_hash || ""}>
                                                                    {selectedRun?.config_hash || "-"}
                                                                </div>
                                                            </div>
                                                            <div className="rounded-md border bg-background p-3">
                                                                <div className="text-xs text-muted-foreground">Dataset ref</div>
                                                                <div className="text-sm font-semibold tracking-tight truncate" title={safeJsonStringify(selectedRun?.dataset_ref || null)}>
                                                                    {selectedRun?.dataset_ref && Object.keys(selectedRun.dataset_ref || {}).length > 0 ? "Linked" : "-"}
                                                                </div>
                                                            </div>
                                                            <div className="rounded-md border bg-background p-3">
                                                                <div className="text-xs text-muted-foreground">Run ID</div>
                                                                <div className="flex items-center justify-between gap-2 pt-1">
                                                                    <div className="min-w-0 truncate text-sm font-semibold tracking-tight" title={String(selectedRun?.run_id || selectedRun?.id || selectedRunId)}>
                                                                        {String(selectedRun?.run_id || selectedRun?.id || selectedRunId)}
                                                                    </div>
                                                                    <Button
                                                                        variant="outline"
                                                                        size="sm"
                                                                        onClick={() => navigator.clipboard?.writeText?.(String(selectedRun?.run_id || selectedRun?.id || selectedRunId))}
                                                                    >
                                                                        <Clipboard />
                                                                        Copy
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="grid gap-3 lg:grid-cols-3">
                                                            <Card>
                                                                <CardHeader>
                                                                    <CardTitle className="text-base">Metrics</CardTitle>
                                                                    <CardDescription>Final metrics + timeseries</CardDescription>
                                                                </CardHeader>
                                                                <CardContent className="space-y-3">
                                                                    {asObjectEntries(selectedRun?.metrics || selectedRun?.final_metrics).length > 0 ? (
                                                                        <div className="overflow-auto rounded-md border">
                                                                            <table className="w-full text-sm">
                                                                                <thead className="bg-muted/30 text-xs text-muted-foreground">
                                                                                    <tr className="border-b">
                                                                                        <th className="px-3 py-2 text-left font-medium">Key</th>
                                                                                        <th className="px-3 py-2 text-left font-medium">Value</th>
                                                                                    </tr>
                                                                                </thead>
                                                                                <tbody>
                                                                                    {asObjectEntries(selectedRun?.metrics || selectedRun?.final_metrics).map(([k, v]) => (
                                                                                        <tr key={k} className="border-b last:border-b-0">
                                                                                            <td className="px-3 py-2 font-medium">{k}</td>
                                                                                            <td className="px-3 py-2 text-muted-foreground">{typeof v === "object" ? safeJsonStringify(v) : String(v)}</td>
                                                                                        </tr>
                                                                                    ))}
                                                                                </tbody>
                                                                            </table>
                                                                        </div>
                                                                    ) : (
                                                                        <div className="text-sm text-muted-foreground">No metrics synced for this run yet.</div>
                                                                    )}

                                                                    {selectedRun?.metrics_timeseries && asObjectEntries(selectedRun?.metrics_timeseries).length > 0 ? (
                                                                        <details className="rounded-md border bg-background p-3">
                                                                            <summary className="cursor-pointer text-sm font-semibold tracking-tight">Timeseries (raw)</summary>
                                                                            <pre className="mt-2 max-h-48 overflow-auto whitespace-pre-wrap break-words text-xs text-muted-foreground">
                                                                                {safeJsonStringify(selectedRun?.metrics_timeseries)}
                                                                            </pre>
                                                                        </details>
                                                                    ) : null}
                                                                </CardContent>
                                                            </Card>
                                                            <Card>
                                                                <CardHeader>
                                                                    <CardTitle className="text-base">Artifacts</CardTitle>
                                                                    <CardDescription>Checkpoints, exports, attachments</CardDescription>
                                                                </CardHeader>
                                                                <CardContent className="space-y-2">
                                                                    {Array.isArray(selectedRun?.artifacts) && selectedRun.artifacts.length > 0 ? (
                                                                        <div className="space-y-2">
                                                                            {selectedRun.artifacts.map((a, idx) => {
                                                                                const key = String(a?.id || a?.name || a?.path || idx)
                                                                                const title = a?.name || a?.title || a?.path || `Artifact ${idx + 1}`
                                                                                const metaLine = [a?.type, a?.format, a?.size_bytes ? `${a.size_bytes} bytes` : null].filter(Boolean).join(" · ")
                                                                                const url = a?.url || a?.download_url || a?.signed_url
                                                                                return (
                                                                                    <div key={key} className="rounded-md border bg-background p-3">
                                                                                        <div className="flex items-start justify-between gap-2">
                                                                                            <div className="min-w-0">
                                                                                                <div className="truncate text-sm font-semibold tracking-tight" title={String(title)}>
                                                                                                    {title}
                                                                                                </div>
                                                                                                <div className="text-xs text-muted-foreground">
                                                                                                    {metaLine || "—"}
                                                                                                </div>
                                                                                            </div>
                                                                                            {url ? (
                                                                                                <Button variant="outline" size="sm" onClick={() => window.open(String(url), "_blank")}>
                                                                                                    <Download />
                                                                                                    Open
                                                                                                </Button>
                                                                                            ) : null}
                                                                                        </div>
                                                                                        {a && typeof a === "object" ? (
                                                                                            <pre className="mt-2 max-h-32 overflow-auto whitespace-pre-wrap break-words text-xs text-muted-foreground">
                                                                                                {safeJsonStringify(a)}
                                                                                            </pre>
                                                                                        ) : null}
                                                                                    </div>
                                                                                )
                                                                            })}
                                                                        </div>
                                                                    ) : (
                                                                        <div className="text-sm text-muted-foreground">No artifacts available for this run yet.</div>
                                                                    )}
                                                                </CardContent>
                                                            </Card>
                                                            <Card>
                                                                <CardHeader>
                                                                    <CardTitle className="text-base">Logs</CardTitle>
                                                                    <CardDescription>Build, train, system logs</CardDescription>
                                                                </CardHeader>
                                                                <CardContent className="space-y-3">
                                                                    <div className="flex flex-wrap items-center gap-2">
                                                                        {selectedRun?.logs_url ? (
                                                                            <Button variant="outline" size="sm" onClick={() => window.open(String(selectedRun.logs_url), "_blank")}>
                                                                                <Download />
                                                                                Open logs
                                                                            </Button>
                                                                        ) : null}
                                                                        <Button
                                                                            variant="outline"
                                                                            size="sm"
                                                                            onClick={() => navigator.clipboard?.writeText?.(safeJsonStringify(selectedRun?.logs_meta || {}))}
                                                                        >
                                                                            <Clipboard />
                                                                            Copy meta
                                                                        </Button>
                                                                    </div>

                                                                    {selectedRun?.logs_excerpt ? (
                                                                        <pre className="max-h-56 overflow-auto rounded-md border bg-background p-3 whitespace-pre-wrap break-words text-xs text-muted-foreground">
                                                                            {String(selectedRun.logs_excerpt)}
                                                                        </pre>
                                                                    ) : (
                                                                        <div className="text-sm text-muted-foreground">Logs will appear here once synced.</div>
                                                                    )}

                                                                    {selectedRun?.logs_meta && asObjectEntries(selectedRun?.logs_meta).length > 0 ? (
                                                                        <details className="rounded-md border bg-background p-3">
                                                                            <summary className="cursor-pointer text-sm font-semibold tracking-tight">Log metadata</summary>
                                                                            <pre className="mt-2 max-h-40 overflow-auto whitespace-pre-wrap break-words text-xs text-muted-foreground">
                                                                                {safeJsonStringify(selectedRun?.logs_meta)}
                                                                            </pre>
                                                                        </details>
                                                                    ) : null}
                                                                </CardContent>
                                                            </Card>
                                                        </div>
                                                    </>
                                                ) : (
                                                    <div className="text-sm text-muted-foreground">
                                                        Select a run from this project to view details.
                                                    </div>
                                                )}
                                            </CardContent>
                                        </Card>
                                    )}

                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Training runs</CardTitle>
                                            <CardDescription>Latest runs</CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-3">
                                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                                <div className="flex flex-1 items-center gap-2">
                                                    <div className="relative w-full sm:max-w-sm">
                                                        <Search className="pointer-events-none absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                                        <Input
                                                            ref={runsSearchRef}
                                                            value={runsQuery}
                                                            onChange={(e) => setRunsQuery(e.target.value)}
                                                            placeholder="Search runs…"
                                                            className="pl-8"
                                                        />
                                                    </div>

                                                    <DropdownMenu open={runsStatusOpen} onOpenChange={setRunsStatusOpen}>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="outline" size="sm">
                                                                <Filter />
                                                                {runsStatus === "all" ? "Status" : `Status: ${runsStatus}`}
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="start">
                                                            <DropdownMenuItem onSelect={(e) => { e.preventDefault(); setRunsStatus("all"); setRunsStatusOpen(false) }}>
                                                                All
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onSelect={(e) => { e.preventDefault(); setRunsStatus("running"); setRunsStatusOpen(false) }}>
                                                                Running
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onSelect={(e) => { e.preventDefault(); setRunsStatus("completed"); setRunsStatusOpen(false) }}>
                                                                Completed
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onSelect={(e) => { e.preventDefault(); setRunsStatus("failed"); setRunsStatusOpen(false) }}>
                                                                Failed
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <DropdownMenu open={runsSortOpen} onOpenChange={setRunsSortOpen}>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="outline" size="sm">
                                                                <ArrowUpDown />
                                                                {`Sort: ${sortLabel(runsSortKey, runsSortDir, {
                                                                    start_time: "Start time",
                                                                    gpu_hours_used: "GPU hours",
                                                                    status: "Status",
                                                                })}`}
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem
                                                                onSelect={(e) => {
                                                                    e.preventDefault()
                                                                    setRunsSortKey("start_time")
                                                                    setRunsSortDir((d) => (d === "asc" ? "desc" : "asc"))
                                                                    setRunsSortOpen(false)
                                                                }}
                                                            >
                                                                Start time
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                onSelect={(e) => {
                                                                    e.preventDefault()
                                                                    setRunsSortKey("gpu_hours_used")
                                                                    setRunsSortDir((d) => (d === "asc" ? "desc" : "asc"))
                                                                    setRunsSortOpen(false)
                                                                }}
                                                            >
                                                                GPU hours
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                onSelect={(e) => {
                                                                    e.preventDefault()
                                                                    setRunsSortKey("status")
                                                                    setRunsSortDir((d) => (d === "asc" ? "desc" : "asc"))
                                                                    setRunsSortOpen(false)
                                                                }}
                                                            >
                                                                Status
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>

                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => refreshTrainingRuns()}
                                                        disabled={loading.trainingRuns}
                                                    >
                                                        <RefreshCw />
                                                        Refresh
                                                    </Button>
                                                </div>
                                            </div>

                                            <div className="flex flex-wrap gap-2">
                                                {runsQuery.trim() && (
                                                    <Chip
                                                        onClick={() => runsSearchRef.current?.focus?.()}
                                                        onClear={() => setRunsQuery("")}
                                                    >
                                                        Search: {runsQuery.trim()}
                                                    </Chip>
                                                )}
                                                {runsStatus !== "all" && (
                                                    <Chip
                                                        onClick={() => setRunsStatusOpen(true)}
                                                        onClear={() => setRunsStatus("all")}
                                                    >
                                                        Status: {runsStatus}
                                                    </Chip>
                                                )}
                                                {(runsSortKey !== "start_time" || runsSortDir !== "desc") && (
                                                    <Chip
                                                        onClick={() => setRunsSortOpen(true)}
                                                        onClear={() => {
                                                            setRunsSortKey("start_time")
                                                            setRunsSortDir("desc")
                                                        }}
                                                    >
                                                        Sort: {runsSortKey} ({runsSortDir})
                                                    </Chip>
                                                )}
                                                {(runsQuery.trim() || runsStatus !== "all" || runsSortKey !== "start_time" || runsSortDir !== "desc") && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => {
                                                            setRunsQuery("")
                                                            setRunsStatus("all")
                                                            setRunsSortKey("start_time")
                                                            setRunsSortDir("desc")
                                                            setSelectedRunIds(new Set())
                                                        }}
                                                    >
                                                        Reset
                                                    </Button>
                                                )}
                                            </div>

                                            {selectedRunIds.size > 0 && (
                                                <div className="flex flex-wrap items-center justify-between gap-2 rounded-md border bg-muted/20 p-2">
                                                    <div className="text-xs text-muted-foreground">
                                                        Selected: <span className="font-semibold text-foreground">{selectedRunIds.size}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => {
                                                                navigator.clipboard?.writeText?.([...selectedRunIds].join("\n"))
                                                            }}
                                                        >
                                                            Copy IDs
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => {
                                                                const rows = [["id"], ...[...selectedRunIds].map((id) => [id])]
                                                                downloadCsv("runs-ids.csv", rows)
                                                            }}
                                                        >
                                                            Export CSV
                                                        </Button>
                                                        <Button variant="ghost" size="sm" onClick={() => setSelectedRunIds(new Set())}>
                                                            Clear selection
                                                        </Button>
                                                    </div>
                                                </div>
                                            )}

                                            <div className="overflow-auto rounded-md border">
                                                <table className="w-full text-sm">
                                                    <thead className="bg-muted/30 text-xs text-muted-foreground">
                                                        <tr className="border-b">
                                                            <th className="w-10 px-3 py-2 text-left font-medium">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={runRowsPage.length > 0 && runRowsPage.every((r) => selectedRunIds.has(String(r?.id || r?.run_id || "")))}
                                                                    onChange={(e) => {
                                                                        if (e.target.checked) {
                                                                            const ids = runRowsPage.map((r) => String(r?.id || r?.run_id || "")).filter(Boolean)
                                                                            setSelectedRunIds((prev) => new Set([...prev, ...ids]))
                                                                        } else {
                                                                            const ids = new Set(runRowsPage.map((r) => String(r?.id || r?.run_id || "")).filter(Boolean))
                                                                            setSelectedRunIds((prev) => {
                                                                                const next = new Set(prev)
                                                                                ids.forEach((id) => next.delete(id))
                                                                                return next
                                                                            })
                                                                        }
                                                                    }}
                                                                />
                                                            </th>
                                                            <th className="px-3 py-2 text-left font-medium">Model</th>
                                                            <th className="px-3 py-2 text-left font-medium">Status</th>
                                                            <th className="px-3 py-2 text-left font-medium">GPU Hours</th>
                                                            <th className="px-3 py-2 text-left font-medium">Started</th>
                                                            <th className="px-3 py-2 text-right font-medium">Actions</th>
                                                        </tr>
                                                    </thead>

                                                    <tbody>
                                                        {loading.trainingRuns && (
                                                            <>
                                                                <tr className="border-b">
                                                                    <td className="px-3 py-3" colSpan={6}>
                                                                        <Skeleton className="h-5 w-full" />
                                                                    </td>
                                                                </tr>
                                                                <tr className="border-b">
                                                                    <td className="px-3 py-3" colSpan={6}>
                                                                        <Skeleton className="h-5 w-full" />
                                                                    </td>
                                                                </tr>
                                                            </>
                                                        )}

                                                        {!loading.trainingRuns && runRows.length === 0 && (
                                                            <tr>
                                                                <td className="px-3 py-6 text-sm text-muted-foreground" colSpan={6}>
                                                                    No runs found for this project.
                                                                </td>
                                                            </tr>
                                                        )}

                                                        {!loading.trainingRuns &&
                                                            runRowsPage.map((r) => (
                                                                <tr key={String(r?.id || r?.run_id || r?.start_time)} className="border-b last:border-b-0">
                                                                    <td className="px-3 py-2">
                                                                        <input
                                                                            type="checkbox"
                                                                            checked={selectedRunIds.has(String(r?.id || r?.run_id || ""))}
                                                                            onChange={(e) => {
                                                                                const id = String(r?.id || r?.run_id || "")
                                                                                setSelectedRunIds((prev) => {
                                                                                    const next = new Set(prev)
                                                                                    if (e.target.checked) next.add(id)
                                                                                    else next.delete(id)
                                                                                    return next
                                                                                })
                                                                            }}
                                                                        />
                                                                    </td>
                                                                    <td className="px-3 py-2">
                                                                        {r?.model_name || r?.model || r?.base_model || "-"}
                                                                    </td>
                                                                    <td className="px-3 py-2">
                                                                        <StatusPill value={r?.status || "Unknown"} />
                                                                    </td>
                                                                    <td className="px-3 py-2">{Number(r?.gpu_hours_used || 0).toFixed(2)}</td>
                                                                    <td className="px-3 py-2">{formatDateTime(r?.start_time || r?.created_at)}</td>
                                                                    <td className="px-3 py-2 text-right">
                                                                        <DropdownMenu>
                                                                            <DropdownMenuTrigger asChild>
                                                                                <Button variant="ghost" size="icon">
                                                                                    <MoreHorizontal />
                                                                                </Button>
                                                                            </DropdownMenuTrigger>
                                                                            <DropdownMenuContent align="end">
                                                                                <DropdownMenuItem
                                                                                    onSelect={(e) => {
                                                                                        e.preventDefault()
                                                                                        const id = String(r?.id || r?.run_id || "")
                                                                                        setSelectedRunId(id)
                                                                                    }}
                                                                                >
                                                                                    View details
                                                                                </DropdownMenuItem>
                                                                                <DropdownMenuItem
                                                                                    onSelect={(e) => {
                                                                                        e.preventDefault()
                                                                                        navigator.clipboard?.writeText?.(
                                                                                            String(r?.id || r?.run_id || "")
                                                                                        )
                                                                                    }}
                                                                                >
                                                                                    Copy ID
                                                                                </DropdownMenuItem>
                                                                            </DropdownMenuContent>
                                                                        </DropdownMenu>
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                    </tbody>
                                                </table>
                                            </div>

                                            <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:items-center sm:justify-between">
                                                <div className="text-xs text-muted-foreground">
                                                    Page {runsPageClamped} of {runsTotalPages}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <label className="flex items-center gap-2 text-xs text-muted-foreground">
                                                        Page size
                                                        <select
                                                            className="h-8 rounded-md border bg-background px-2 text-xs"
                                                            value={runsPageSize}
                                                            onChange={(e) => setRunsPageSize(Number(e.target.value) || 25)}
                                                        >
                                                            <option value={10}>10</option>
                                                            <option value={25}>25</option>
                                                            <option value={50}>50</option>
                                                            <option value={100}>100</option>
                                                        </select>
                                                    </label>

                                                    <Button variant="outline" size="sm" disabled={runsPageClamped <= 1} onClick={() => setRunsPage((p) => Math.max(1, (p || 1) - 1))}>
                                                        Prev
                                                    </Button>
                                                    <Button variant="outline" size="sm" disabled={runsPageClamped >= runsTotalPages} onClick={() => setRunsPage((p) => (p || 1) + 1)}>
                                                        Next
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </TabsContent>

                                <TabsContent value="models">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Models</CardTitle>
                                            <CardDescription>Registered models</CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-3">
                                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                                <div className="relative w-full sm:max-w-sm">
                                                    <Search className="pointer-events-none absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                                    <Input
                                                        ref={modelsSearchRef}
                                                        value={modelsQuery}
                                                        onChange={(e) => setModelsQuery(e.target.value)}
                                                        placeholder="Search models…"
                                                        className="pl-8"
                                                    />
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <DropdownMenu open={modelsSortOpen} onOpenChange={setModelsSortOpen}>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="outline" size="sm">
                                                                <ArrowUpDown />
                                                                {`Sort: ${sortLabel(modelsSortKey, modelsSortDir, {
                                                                    trained_at: "Trained at",
                                                                    updated_at: "Updated at",
                                                                })}`}
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem
                                                                onSelect={(e) => {
                                                                    e.preventDefault()
                                                                    setModelsSortKey("trained_at")
                                                                    setModelsSortDir((d) => (d === "asc" ? "desc" : "asc"))
                                                                    setModelsSortOpen(false)
                                                                }}
                                                            >
                                                                Trained at
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                onSelect={(e) => {
                                                                    e.preventDefault()
                                                                    setModelsSortKey("updated_at")
                                                                    setModelsSortDir((d) => (d === "asc" ? "desc" : "asc"))
                                                                    setModelsSortOpen(false)
                                                                }}
                                                            >
                                                                Updated at
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>

                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => refreshModels()}
                                                        disabled={loading.models}
                                                    >
                                                        <RefreshCw />
                                                        Refresh
                                                    </Button>
                                                </div>
                                            </div>

                                            <div className="flex flex-wrap gap-2">
                                                {modelsQuery.trim() && (
                                                    <Chip
                                                        onClick={() => modelsSearchRef.current?.focus?.()}
                                                        onClear={() => setModelsQuery("")}
                                                    >
                                                        Search: {modelsQuery.trim()}
                                                    </Chip>
                                                )}
                                                {(modelsSortKey !== "trained_at" || modelsSortDir !== "desc") && (
                                                    <Chip
                                                        onClick={() => setModelsSortOpen(true)}
                                                        onClear={() => {
                                                            setModelsSortKey("trained_at")
                                                            setModelsSortDir("desc")
                                                        }}
                                                    >
                                                        Sort: {modelsSortKey} ({modelsSortDir})
                                                    </Chip>
                                                )}
                                                {(modelsQuery.trim() || modelsSortKey !== "trained_at" || modelsSortDir !== "desc") && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => {
                                                            setModelsQuery("")
                                                            setModelsSortKey("trained_at")
                                                            setModelsSortDir("desc")
                                                            setSelectedModelIds(new Set())
                                                        }}
                                                    >
                                                        Reset
                                                    </Button>
                                                )}
                                            </div>

                                            {selectedModelIds.size > 0 && (
                                                <div className="flex flex-wrap items-center justify-between gap-2 rounded-md border bg-muted/20 p-2">
                                                    <div className="text-xs text-muted-foreground">
                                                        Selected: <span className="font-semibold text-foreground">{selectedModelIds.size}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => {
                                                                navigator.clipboard?.writeText?.([...selectedModelIds].join("\n"))
                                                            }}
                                                        >
                                                            Copy IDs
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => {
                                                                const rows = [["id"], ...[...selectedModelIds].map((id) => [id])]
                                                                downloadCsv("models-ids.csv", rows)
                                                            }}
                                                        >
                                                            Export CSV
                                                        </Button>
                                                        <Button variant="ghost" size="sm" onClick={() => setSelectedModelIds(new Set())}>
                                                            Clear selection
                                                        </Button>
                                                    </div>
                                                </div>
                                            )}

                                            <div className="overflow-auto rounded-md border">
                                                <table className="w-full text-sm">
                                                    <thead className="bg-muted/30 text-xs text-muted-foreground">
                                                        <tr className="border-b">
                                                            <th className="w-10 px-3 py-2 text-left font-medium">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={modelRowsPage.length > 0 && modelRowsPage.every((m) => selectedModelIds.has(String(m?.id || m?.model_id || "")))}
                                                                    onChange={(e) => {
                                                                        if (e.target.checked) {
                                                                            const ids = modelRowsPage.map((m) => String(m?.id || m?.model_id || "")).filter(Boolean)
                                                                            setSelectedModelIds((prev) => new Set([...prev, ...ids]))
                                                                        } else {
                                                                            const ids = new Set(modelRowsPage.map((m) => String(m?.id || m?.model_id || "")).filter(Boolean))
                                                                            setSelectedModelIds((prev) => {
                                                                                const next = new Set(prev)
                                                                                ids.forEach((id) => next.delete(id))
                                                                                return next
                                                                            })
                                                                        }
                                                                    }}
                                                                />
                                                            </th>
                                                            <th className="px-3 py-2 text-left font-medium">Name</th>
                                                            <th className="px-3 py-2 text-left font-medium">Version</th>
                                                            <th className="px-3 py-2 text-left font-medium">Updated</th>
                                                            <th className="px-3 py-2 text-right font-medium">Actions</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {loading.models && (
                                                            <>
                                                                <tr className="border-b">
                                                                    <td className="px-3 py-3" colSpan={5}>
                                                                        <Skeleton className="h-5 w-full" />
                                                                    </td>
                                                                </tr>
                                                                <tr className="border-b">
                                                                    <td className="px-3 py-3" colSpan={5}>
                                                                        <Skeleton className="h-5 w-full" />
                                                                    </td>
                                                                </tr>
                                                            </>
                                                        )}

                                                        {!loading.models && modelRows.length === 0 && (
                                                            <tr>
                                                                <td className="px-3 py-6 text-sm text-muted-foreground" colSpan={5}>
                                                                    No models found for this project.
                                                                </td>
                                                            </tr>
                                                        )}

                                                        {!loading.models &&
                                                            modelRowsPage.map((m) => (
                                                                <tr key={String(m?.id || m?.model_id || m?.trained_at)} className="border-b last:border-b-0">
                                                                    <td className="px-3 py-2">
                                                                        <input
                                                                            type="checkbox"
                                                                            checked={selectedModelIds.has(String(m?.id || m?.model_id || ""))}
                                                                            onChange={(e) => {
                                                                                const id = String(m?.id || m?.model_id || "")
                                                                                setSelectedModelIds((prev) => {
                                                                                    const next = new Set(prev)
                                                                                    if (e.target.checked) next.add(id)
                                                                                    else next.delete(id)
                                                                                    return next
                                                                                })
                                                                            }}
                                                                        />
                                                                    </td>
                                                                    <td className="px-3 py-2">{m?.model_name || m?.name || m?.base_model || "-"}</td>
                                                                    <td className="px-3 py-2">{m?.version || m?.model_version || "-"}</td>
                                                                    <td className="px-3 py-2">{formatDateTime(m?.trained_at || m?.updated_at || m?.created_at)}</td>
                                                                    <td className="px-3 py-2 text-right">
                                                                        <DropdownMenu>
                                                                            <DropdownMenuTrigger asChild>
                                                                                <Button variant="ghost" size="icon">
                                                                                    <MoreHorizontal />
                                                                                </Button>
                                                                            </DropdownMenuTrigger>
                                                                            <DropdownMenuContent align="end">
                                                                                <DropdownMenuItem
                                                                                    onSelect={(e) => {
                                                                                        e.preventDefault()
                                                                                        navigator.clipboard?.writeText?.(
                                                                                            String(m?.id || m?.model_id || "")
                                                                                        )
                                                                                    }}
                                                                                >
                                                                                    Copy ID
                                                                                </DropdownMenuItem>
                                                                            </DropdownMenuContent>
                                                                        </DropdownMenu>
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                    </tbody>
                                                </table>
                                            </div>

                                            <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:items-center sm:justify-between">
                                                <div className="text-xs text-muted-foreground">
                                                    Page {modelsPageClamped} of {modelsTotalPages}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <label className="flex items-center gap-2 text-xs text-muted-foreground">
                                                        Page size
                                                        <select
                                                            className="h-8 rounded-md border bg-background px-2 text-xs"
                                                            value={modelsPageSize}
                                                            onChange={(e) => setModelsPageSize(Number(e.target.value) || 25)}
                                                        >
                                                            <option value={10}>10</option>
                                                            <option value={25}>25</option>
                                                            <option value={50}>50</option>
                                                            <option value={100}>100</option>
                                                        </select>
                                                    </label>

                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        disabled={modelsPageClamped <= 1}
                                                        onClick={() => setModelsPage((p) => Math.max(1, (p || 1) - 1))}
                                                    >
                                                        Prev
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        disabled={modelsPageClamped >= modelsTotalPages}
                                                        onClick={() => setModelsPage((p) => (p || 1) + 1)}
                                                    >
                                                        Next
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </TabsContent>

                                <TabsContent value="exports">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Exports</CardTitle>
                                            <CardDescription>Model artifacts</CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-3">
                                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                                <div className="flex flex-1 items-center gap-2">
                                                    <div className="relative w-full sm:max-w-sm">
                                                        <Search className="pointer-events-none absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                                        <Input
                                                            ref={exportsSearchRef}
                                                            value={exportsQuery}
                                                            onChange={(e) => setExportsQuery(e.target.value)}
                                                            placeholder="Search exports…"
                                                            className="pl-8"
                                                        />
                                                    </div>

                                                    <DropdownMenu open={exportsFormatOpen} onOpenChange={setExportsFormatOpen}>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="outline" size="sm">
                                                                <Filter />
                                                                {exportsFormat === "all" ? "Format" : `Format: ${String(exportsFormat).toUpperCase()}`}
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="start">
                                                            <DropdownMenuItem onSelect={(e) => { e.preventDefault(); setExportsFormat("all"); setExportsFormatOpen(false) }}>
                                                                All
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onSelect={(e) => { e.preventDefault(); setExportsFormat("onnx"); setExportsFormatOpen(false) }}>
                                                                ONNX
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onSelect={(e) => { e.preventDefault(); setExportsFormat("tensorrt"); setExportsFormatOpen(false) }}>
                                                                TensorRT
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onSelect={(e) => { e.preventDefault(); setExportsFormat("torchscript"); setExportsFormatOpen(false) }}>
                                                                TorchScript
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <DropdownMenu open={exportsSortOpen} onOpenChange={setExportsSortOpen}>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="outline" size="sm">
                                                                <ArrowUpDown />
                                                                {`Sort: ${sortLabel(exportsSortKey, exportsSortDir, {
                                                                    exported_at: "Exported at",
                                                                    created_at: "Created at",
                                                                })}`}
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem
                                                                onSelect={(e) => {
                                                                    e.preventDefault()
                                                                    setExportsSortKey("exported_at")
                                                                    setExportsSortDir((d) => (d === "asc" ? "desc" : "asc"))
                                                                    setExportsSortOpen(false)
                                                                }}
                                                            >
                                                                Exported at
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                onSelect={(e) => {
                                                                    e.preventDefault()
                                                                    setExportsSortKey("created_at")
                                                                    setExportsSortDir((d) => (d === "asc" ? "desc" : "asc"))
                                                                    setExportsSortOpen(false)
                                                                }}
                                                            >
                                                                Created at
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>

                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => refreshExports()}
                                                        disabled={loading.exports}
                                                    >
                                                        <RefreshCw />
                                                        Refresh
                                                    </Button>
                                                </div>
                                            </div>

                                            <div className="flex flex-wrap gap-2">
                                                {exportsQuery.trim() && (
                                                    <Chip
                                                        onClick={() => exportsSearchRef.current?.focus?.()}
                                                        onClear={() => setExportsQuery("")}
                                                    >
                                                        Search: {exportsQuery.trim()}
                                                    </Chip>
                                                )}
                                                {exportsFormat !== "all" && (
                                                    <Chip
                                                        onClick={() => setExportsFormatOpen(true)}
                                                        onClear={() => setExportsFormat("all")}
                                                    >
                                                        Format: {exportsFormat}
                                                    </Chip>
                                                )}
                                                {(exportsSortKey !== "exported_at" || exportsSortDir !== "desc") && (
                                                    <Chip
                                                        onClick={() => setExportsSortOpen(true)}
                                                        onClear={() => {
                                                            setExportsSortKey("exported_at")
                                                            setExportsSortDir("desc")
                                                        }}
                                                    >
                                                        Sort: {exportsSortKey} ({exportsSortDir})
                                                    </Chip>
                                                )}
                                                {(exportsQuery.trim() || exportsFormat !== "all" || exportsSortKey !== "exported_at" || exportsSortDir !== "desc") && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => {
                                                            setExportsQuery("")
                                                            setExportsFormat("all")
                                                            setExportsSortKey("exported_at")
                                                            setExportsSortDir("desc")
                                                            setSelectedExportIds(new Set())
                                                        }}
                                                    >
                                                        Reset
                                                    </Button>
                                                )}
                                            </div>

                                            {selectedExportIds.size > 0 && (
                                                <div className="flex flex-wrap items-center justify-between gap-2 rounded-md border bg-muted/20 p-2">
                                                    <div className="text-xs text-muted-foreground">
                                                        Selected: <span className="font-semibold text-foreground">{selectedExportIds.size}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => {
                                                                navigator.clipboard?.writeText?.([...selectedExportIds].join("\n"))
                                                            }}
                                                        >
                                                            Copy IDs
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => {
                                                                const rows = [["id"], ...[...selectedExportIds].map((id) => [id])]
                                                                downloadCsv("exports-ids.csv", rows)
                                                            }}
                                                        >
                                                            Export CSV
                                                        </Button>
                                                        <Button variant="ghost" size="sm" onClick={() => setSelectedExportIds(new Set())}>
                                                            Clear selection
                                                        </Button>
                                                    </div>
                                                </div>
                                            )}

                                            <div className="overflow-auto rounded-md border">
                                                <table className="w-full text-sm">
                                                    <thead className="bg-muted/30 text-xs text-muted-foreground">
                                                        <tr className="border-b">
                                                            <th className="w-10 px-3 py-2 text-left font-medium">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={exportRowsPage.length > 0 && exportRowsPage.every((ex) => selectedExportIds.has(String(ex?.id || ex?.export_id || "")))}
                                                                    onChange={(e) => {
                                                                        if (e.target.checked) {
                                                                            const ids = exportRowsPage.map((ex) => String(ex?.id || ex?.export_id || "")).filter(Boolean)
                                                                            setSelectedExportIds((prev) => new Set([...prev, ...ids]))
                                                                        } else {
                                                                            const ids = new Set(exportRowsPage.map((ex) => String(ex?.id || ex?.export_id || "")).filter(Boolean))
                                                                            setSelectedExportIds((prev) => {
                                                                                const next = new Set(prev)
                                                                                ids.forEach((id) => next.delete(id))
                                                                                return next
                                                                            })
                                                                        }
                                                                    }}
                                                                />
                                                            </th>
                                                            <th className="px-3 py-2 text-left font-medium">Format</th>
                                                            <th className="px-3 py-2 text-left font-medium">Artifact</th>
                                                            <th className="px-3 py-2 text-left font-medium">Created</th>
                                                            <th className="px-3 py-2 text-right font-medium">Actions</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {loading.exports && (
                                                            <>
                                                                <tr className="border-b">
                                                                    <td className="px-3 py-3" colSpan={5}>
                                                                        <Skeleton className="h-5 w-full" />
                                                                    </td>
                                                                </tr>
                                                                <tr className="border-b">
                                                                    <td className="px-3 py-3" colSpan={5}>
                                                                        <Skeleton className="h-5 w-full" />
                                                                    </td>
                                                                </tr>
                                                            </>
                                                        )}

                                                        {!loading.exports && exportRows.length === 0 && (
                                                            <tr>
                                                                <td className="px-3 py-6 text-sm text-muted-foreground" colSpan={5}>
                                                                    No exports found for this project.
                                                                </td>
                                                            </tr>
                                                        )}

                                                        {!loading.exports &&
                                                            exportRowsPage.map((e) => (
                                                                <tr key={String(e?.id || e?.export_id || e?.exported_at)} className="border-b last:border-b-0">
                                                                    <td className="px-3 py-2">
                                                                        <input
                                                                            type="checkbox"
                                                                            checked={selectedExportIds.has(String(e?.id || e?.export_id || ""))}
                                                                            onChange={(ev) => {
                                                                                const id = String(e?.id || e?.export_id || "")
                                                                                setSelectedExportIds((prev) => {
                                                                                    const next = new Set(prev)
                                                                                    if (ev.target.checked) next.add(id)
                                                                                    else next.delete(id)
                                                                                    return next
                                                                                })
                                                                            }}
                                                                        />
                                                                    </td>
                                                                    <td className="px-3 py-2">
                                                                        <span className="font-medium">{(e?.format || "-").toString().toUpperCase()}</span>
                                                                    </td>
                                                                    <td className="px-3 py-2">{e?.artifact_name || e?.artifact || e?.model_name || "-"}</td>
                                                                    <td className="px-3 py-2">{formatDateTime(e?.exported_at || e?.created_at)}</td>
                                                                    <td className="px-3 py-2 text-right">
                                                                        <DropdownMenu>
                                                                            <DropdownMenuTrigger asChild>
                                                                                <Button variant="ghost" size="icon">
                                                                                    <MoreHorizontal />
                                                                                </Button>
                                                                            </DropdownMenuTrigger>
                                                                            <DropdownMenuContent align="end">
                                                                                <DropdownMenuItem
                                                                                    onSelect={(ev) => {
                                                                                        ev.preventDefault()
                                                                                        navigator.clipboard?.writeText?.(
                                                                                            String(e?.id || e?.export_id || "")
                                                                                        )
                                                                                    }}
                                                                                >
                                                                                    Copy ID
                                                                                </DropdownMenuItem>
                                                                            </DropdownMenuContent>
                                                                        </DropdownMenu>
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                    </tbody>
                                                </table>
                                            </div>

                                            <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:items-center sm:justify-between">
                                                <div className="text-xs text-muted-foreground">
                                                    Page {exportsPageClamped} of {exportsTotalPages}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <label className="flex items-center gap-2 text-xs text-muted-foreground">
                                                        Page size
                                                        <select
                                                            className="h-8 rounded-md border bg-background px-2 text-xs"
                                                            value={exportsPageSize}
                                                            onChange={(e) => setExportsPageSize(Number(e.target.value) || 25)}
                                                        >
                                                            <option value={10}>10</option>
                                                            <option value={25}>25</option>
                                                            <option value={50}>50</option>
                                                            <option value={100}>100</option>
                                                        </select>
                                                    </label>

                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        disabled={exportsPageClamped <= 1}
                                                        onClick={() => setExportsPage((p) => Math.max(1, (p || 1) - 1))}
                                                    >
                                                        Prev
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        disabled={exportsPageClamped >= exportsTotalPages}
                                                        onClick={() => setExportsPage((p) => (p || 1) + 1)}
                                                    >
                                                        Next
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </TabsContent>

                                <TabsContent value="billing">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Billing</CardTitle>
                                            <CardDescription>Subscription, usage, invoices, and payment methods</CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <Tabs value={billingActiveTab} onValueChange={setBillingActiveTab}>
                                                <TabsList>
                                                    <TabsTrigger value="overview">Overview</TabsTrigger>
                                                    <TabsTrigger value="usage">Usage</TabsTrigger>
                                                    <TabsTrigger value="invoices">Invoices</TabsTrigger>
                                                    <TabsTrigger value="payment">Payment methods</TabsTrigger>
                                                    <TabsTrigger value="history">Change history</TabsTrigger>
                                                </TabsList>

                                                <TabsContent value="overview" className="space-y-3">
                                                    <div className="grid gap-3 lg:grid-cols-2">
                                                        <Card>
                                                            <CardHeader>
                                                                <CardTitle>Current plan</CardTitle>
                                                                <CardDescription>Status and billing period</CardDescription>
                                                            </CardHeader>
                                                            <CardContent className="space-y-3">
                                                                {loading.billing ? (
                                                                    <div className="space-y-2">
                                                                        <Skeleton className="h-5 w-1/2" />
                                                                        <Skeleton className="h-5 w-2/3" />
                                                                        <Skeleton className="h-5 w-1/3" />
                                                                    </div>
                                                                ) : (
                                                                    <div className="space-y-2 text-sm">
                                                                        <div className="flex items-center justify-between gap-3">
                                                                            <div className="text-muted-foreground">Plan</div>
                                                                            <div className="font-medium">
                                                                                {subscriptionSummary?.plan_name ||
                                                                                    subscriptionSummary?.plan_type ||
                                                                                    'Free'}
                                                                            </div>
                                                                        </div>
                                                                        <div className="flex items-center justify-between gap-3">
                                                                            <div className="text-muted-foreground">Status</div>
                                                                            <div className="font-medium">
                                                                                {billingSubscription?.status || 'Active (Free)'}
                                                                            </div>
                                                                        </div>
                                                                        {billingSubscription?.current_period_start && billingSubscription?.current_period_end ? (
                                                                            <div className="flex items-center justify-between gap-3">
                                                                                <div className="text-muted-foreground">Period</div>
                                                                                <div className="font-medium">
                                                                                    {billingFormatDate(billingSubscription.current_period_start)} - {billingFormatDate(billingSubscription.current_period_end)}
                                                                                </div>
                                                                            </div>
                                                                        ) : null}
                                                                        {subscriptionSummary?.total_paid_amount ? (
                                                                            <div className="flex items-center justify-between gap-3">
                                                                                <div className="text-muted-foreground">Total paid</div>
                                                                                <div className="font-medium">{formatPrice(subscriptionSummary.total_paid_amount)}</div>
                                                                            </div>
                                                                        ) : null}
                                                                    </div>
                                                                )}

                                                                <div className="flex flex-wrap gap-2">
                                                                    {billingSubscription ? (
                                                                        billingSubscription.cancel_at_period_end ? (
                                                                            <Button variant="outline" onClick={handleResumeSubscription}>
                                                                                Resume subscription
                                                                            </Button>
                                                                        ) : (
                                                                            <>
                                                                                <Button variant="outline" onClick={() => navigate?.('/pricing')}>
                                                                                    Change plan
                                                                                </Button>
                                                                                <Button variant="outline" onClick={handleCancelSubscription}>
                                                                                    Cancel subscription
                                                                                </Button>
                                                                            </>
                                                                        )
                                                                    ) : (
                                                                        <Button variant="outline" onClick={() => navigate?.('/pricing')}>
                                                                            Compare plans
                                                                        </Button>
                                                                    )}
                                                                    <Button variant="outline" onClick={() => refreshBilling()} disabled={loading.billing}>
                                                                        <RefreshCw />
                                                                        Refresh
                                                                    </Button>
                                                                </div>
                                                            </CardContent>
                                                        </Card>

                                                        <Card>
                                                            <CardHeader>
                                                                <CardTitle>Usage chart</CardTitle>
                                                                <CardDescription>GPU usage (last 30 days)</CardDescription>
                                                            </CardHeader>
                                                            <CardContent>
                                                                {billingUsageLoading ? (
                                                                    <div className="space-y-2">
                                                                        <Skeleton className="h-6 w-1/2" />
                                                                        <Skeleton className="h-48 w-full" />
                                                                    </div>
                                                                ) : billingUsageData?.length ? (
                                                                    <UsageChart data={billingUsageData} type="line" title="GPU Usage" height={260} />
                                                                ) : (
                                                                    <div className="text-sm text-muted-foreground">No usage data available yet.</div>
                                                                )}
                                                            </CardContent>
                                                        </Card>
                                                    </div>
                                                </TabsContent>

                                                <TabsContent value="usage" className="space-y-3">
                                                    {billingUsageLoading ? (
                                                        <div className="space-y-2">
                                                            <Skeleton className="h-6 w-1/2" />
                                                            <Skeleton className="h-48 w-full" />
                                                        </div>
                                                    ) : billingUsageData?.length ? (
                                                        <Card>
                                                            <CardHeader>
                                                                <CardTitle>Usage analytics</CardTitle>
                                                                <CardDescription>GPU usage breakdown</CardDescription>
                                                            </CardHeader>
                                                            <CardContent>
                                                                <UsageChart data={billingUsageData} type="line" title="GPU Usage (Last 30 Days)" height={300} />
                                                                <div className="grid gap-3 pt-4 md:grid-cols-3">
                                                                    <div className="rounded-md border p-3">
                                                                        <div className="text-xs text-muted-foreground">Total hours (30 days)</div>
                                                                        <div className="text-lg font-semibold">
                                                                            {billingUsageData.reduce((sum, d) => sum + d.value, 0).toFixed(2)}
                                                                        </div>
                                                                    </div>
                                                                    <div className="rounded-md border p-3">
                                                                        <div className="text-xs text-muted-foreground">Average daily</div>
                                                                        <div className="text-lg font-semibold">
                                                                            {(billingUsageData.reduce((sum, d) => sum + d.value, 0) / 30).toFixed(2)}
                                                                        </div>
                                                                    </div>
                                                                    <div className="rounded-md border p-3">
                                                                        <div className="text-xs text-muted-foreground">Peak usage</div>
                                                                        <div className="text-lg font-semibold">
                                                                            {Math.max(...billingUsageData.map((d) => d.value)).toFixed(2)}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </CardContent>
                                                        </Card>
                                                    ) : (
                                                        <div className="text-sm text-muted-foreground">No usage data available yet.</div>
                                                    )}
                                                </TabsContent>

                                                <TabsContent value="invoices" className="space-y-3">
                                                    <Card>
                                                        <CardHeader>
                                                            <CardTitle>Billing history</CardTitle>
                                                            <CardDescription>Invoices and payments</CardDescription>
                                                        </CardHeader>
                                                        <CardContent>
                                                            {billingHistory.length === 0 ? (
                                                                <div className="text-sm text-muted-foreground">No billing history found.</div>
                                                            ) : (
                                                                <div className="overflow-auto rounded-md border">
                                                                    <table className="w-full text-sm">
                                                                        <thead className="bg-muted/30 text-xs text-muted-foreground">
                                                                            <tr className="border-b">
                                                                                <th className="px-3 py-2 text-left font-medium">Date</th>
                                                                                <th className="px-3 py-2 text-left font-medium">Description</th>
                                                                                <th className="px-3 py-2 text-left font-medium">Amount</th>
                                                                                <th className="px-3 py-2 text-left font-medium">Status</th>
                                                                                <th className="px-3 py-2 text-right font-medium">Invoice</th>
                                                                            </tr>
                                                                        </thead>
                                                                        <tbody>
                                                                            {billingHistory.map((invoice) => (
                                                                                <tr key={invoice.billing_id} className="border-b last:border-b-0">
                                                                                    <td className="px-3 py-2">{billingFormatDate(invoice.created_at)}</td>
                                                                                    <td className="px-3 py-2">{invoice.description || 'Subscription payment'}</td>
                                                                                    <td className="px-3 py-2">{formatPrice(invoice.amount, invoice.currency)}</td>
                                                                                    <td className="px-3 py-2">{invoice.status}</td>
                                                                                    <td className="px-3 py-2 text-right">
                                                                                        {invoice.invoice_pdf_url || invoice.hosted_invoice_url ? (
                                                                                            <Button variant="outline" size="sm" onClick={() => downloadInvoice(invoice.billing_id)}>
                                                                                                {invoice.invoice_pdf_url ? 'Download' : 'View'}
                                                                                            </Button>
                                                                                        ) : (
                                                                                            <span className="text-muted-foreground">—</span>
                                                                                        )}
                                                                                    </td>
                                                                                </tr>
                                                                            ))}
                                                                        </tbody>
                                                                    </table>
                                                                </div>
                                                            )}
                                                        </CardContent>
                                                    </Card>
                                                </TabsContent>

                                                <TabsContent value="payment" className="space-y-3">
                                                    <Card>
                                                        <CardHeader>
                                                            <CardTitle>Payment methods</CardTitle>
                                                            <CardDescription>Saved payment methods</CardDescription>
                                                        </CardHeader>
                                                        <CardContent>
                                                            {paymentMethods.length === 0 ? (
                                                                <div className="text-sm text-muted-foreground">
                                                                    No payment methods found. Add a payment method through the customer portal.
                                                                </div>
                                                            ) : (
                                                                <div className="overflow-auto rounded-md border">
                                                                    <table className="w-full text-sm">
                                                                        <thead className="bg-muted/30 text-xs text-muted-foreground">
                                                                            <tr className="border-b">
                                                                                <th className="px-3 py-2 text-left font-medium">Type</th>
                                                                                <th className="px-3 py-2 text-left font-medium">Card</th>
                                                                                <th className="px-3 py-2 text-left font-medium">Expires</th>
                                                                                <th className="px-3 py-2 text-left font-medium">Default</th>
                                                                            </tr>
                                                                        </thead>
                                                                        <tbody>
                                                                            {paymentMethods.map((method) => (
                                                                                <tr key={method.payment_method_id} className="border-b last:border-b-0">
                                                                                    <td className="px-3 py-2">{method.type === 'card' ? 'Card' : 'Bank Account'}</td>
                                                                                    <td className="px-3 py-2">
                                                                                        {method.card_brand && method.card_last4
                                                                                            ? `${method.card_brand.toUpperCase()} •••• ${method.card_last4}`
                                                                                            : '—'}
                                                                                    </td>
                                                                                    <td className="px-3 py-2">
                                                                                        {method.card_exp_month && method.card_exp_year
                                                                                            ? `${method.card_exp_month}/${method.card_exp_year}`
                                                                                            : '—'}
                                                                                    </td>
                                                                                    <td className="px-3 py-2">{method.is_default ? 'Default' : '—'}</td>
                                                                                </tr>
                                                                            ))}
                                                                        </tbody>
                                                                    </table>
                                                                </div>
                                                            )}

                                                            <div className="pt-3">
                                                                <Button variant="outline" onClick={() => navigate?.('/dashboard-v2?tab=billing')}>
                                                                    Manage payment methods
                                                                </Button>
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                </TabsContent>

                                                <TabsContent value="history" className="space-y-3">
                                                    <Card>
                                                        <CardHeader>
                                                            <CardTitle>Subscription change history</CardTitle>
                                                            <CardDescription>Upgrades/downgrades and prorations</CardDescription>
                                                        </CardHeader>
                                                        <CardContent>
                                                            {billingChangeHistory.length === 0 ? (
                                                                <div className="text-sm text-muted-foreground">No changes recorded yet.</div>
                                                            ) : (
                                                                <div className="overflow-auto rounded-md border">
                                                                    <table className="w-full text-sm">
                                                                        <thead className="bg-muted/30 text-xs text-muted-foreground">
                                                                            <tr className="border-b">
                                                                                <th className="px-3 py-2 text-left font-medium">Date</th>
                                                                                <th className="px-3 py-2 text-left font-medium">Change type</th>
                                                                                <th className="px-3 py-2 text-left font-medium">From</th>
                                                                                <th className="px-3 py-2 text-left font-medium">To</th>
                                                                                <th className="px-3 py-2 text-left font-medium">Prorated</th>
                                                                            </tr>
                                                                        </thead>
                                                                        <tbody>
                                                                            {billingChangeHistory.map((change) => (
                                                                                <tr key={change.change_id || change.id} className="border-b last:border-b-0">
                                                                                    <td className="px-3 py-2">{billingFormatDateTime(change.created_at)}</td>
                                                                                    <td className="px-3 py-2">{change.change_type || '—'}</td>
                                                                                    <td className="px-3 py-2">{change.from_plan || '—'}</td>
                                                                                    <td className="px-3 py-2">{change.to_plan || '—'}</td>
                                                                                    <td className="px-3 py-2">{change.prorated_amount ? formatPrice(change.prorated_amount) : '—'}</td>
                                                                                </tr>
                                                                            ))}
                                                                        </tbody>
                                                                    </table>
                                                                </div>
                                                            )}
                                                        </CardContent>
                                                    </Card>
                                                </TabsContent>
                                            </Tabs>
                                        </CardContent>
                                    </Card>
                                </TabsContent>

                                <TabsContent value="diagnostics">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>IDE diagnostics</CardTitle>
                                            <CardDescription>Events from ide_diagnostics_events (scoped to your account)</CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-3">
                                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                                <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
                                                    <div className="relative w-full sm:max-w-sm">
                                                        <Search className="pointer-events-none absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                                        <Input
                                                            value={diagnosticsQuery}
                                                            onChange={(e) => setDiagnosticsQuery(e.target.value)}
                                                            placeholder="Search message/platform/app version…"
                                                            className="pl-8"
                                                        />
                                                    </div>

                                                    <select
                                                        className="h-9 rounded-md border bg-background px-3 text-sm"
                                                        value={diagnosticsTypeFilter}
                                                        onChange={(e) => setDiagnosticsTypeFilter(e.target.value)}
                                                    >
                                                        <option value="">All types</option>
                                                        <option value="error">error</option>
                                                        <option value="warn">warn</option>
                                                        <option value="info">info</option>
                                                    </select>

                                                    <Input
                                                        value={diagnosticsKindFilter}
                                                        onChange={(e) => setDiagnosticsKindFilter(e.target.value)}
                                                        placeholder="Filter kind"
                                                        className="h-9"
                                                    />
                                                    <Input
                                                        value={diagnosticsAppVersionFilter}
                                                        onChange={(e) => setDiagnosticsAppVersionFilter(e.target.value)}
                                                        placeholder="Filter app_version"
                                                        className="h-9"
                                                    />
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => {
                                                            setDiagnosticsQuery("")
                                                            setDiagnosticsTypeFilter("")
                                                            setDiagnosticsKindFilter("")
                                                            setDiagnosticsAppVersionFilter("")
                                                        }}
                                                    >
                                                        Reset
                                                    </Button>

                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => refreshDiagnostics()}
                                                        disabled={loading.diagnostics}
                                                    >
                                                        <RefreshCw />
                                                        Refresh
                                                    </Button>
                                                </div>
                                            </div>

                                            <div className="overflow-auto rounded-md border">
                                                <table className="w-full text-sm">
                                                    <thead className="bg-muted/30 text-xs text-muted-foreground">
                                                        <tr className="border-b">
                                                            <th className="px-3 py-2 text-left font-medium">Time</th>
                                                            <th className="px-3 py-2 text-left font-medium">Type</th>
                                                            <th className="px-3 py-2 text-left font-medium">Kind</th>
                                                            <th className="px-3 py-2 text-left font-medium">Platform</th>
                                                            <th className="px-3 py-2 text-left font-medium">App</th>
                                                            <th className="px-3 py-2 text-left font-medium">Message</th>
                                                            <th className="px-3 py-2 text-right font-medium">Actions</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {loading.diagnostics && (
                                                            <>
                                                                <tr className="border-b">
                                                                    <td className="px-3 py-3" colSpan={7}>
                                                                        <Skeleton className="h-5 w-full" />
                                                                    </td>
                                                                </tr>
                                                                <tr className="border-b">
                                                                    <td className="px-3 py-3" colSpan={7}>
                                                                        <Skeleton className="h-5 w-full" />
                                                                    </td>
                                                                </tr>
                                                            </>
                                                        )}

                                                        {!loading.diagnostics && diagnosticsEvents.length === 0 && (
                                                            <tr>
                                                                <td className="px-3 py-6 text-sm text-muted-foreground" colSpan={7}>
                                                                    No diagnostics events found.
                                                                </td>
                                                            </tr>
                                                        )}

                                                        {!loading.diagnostics &&
                                                            diagnosticsEvents.map((evt) => (
                                                                <tr key={String(evt?.id)} className="border-b last:border-b-0">
                                                                    <td className="px-3 py-2 whitespace-nowrap">
                                                                        {formatDateTime(evt?.created_at)}
                                                                    </td>
                                                                    <td className="px-3 py-2">{evt?.event_type || "-"}</td>
                                                                    <td className="px-3 py-2">{evt?.kind || "-"}</td>
                                                                    <td className="px-3 py-2">{evt?.platform || "-"}</td>
                                                                    <td className="px-3 py-2">{evt?.app_version || "-"}</td>
                                                                    <td className="px-3 py-2 max-w-[520px] truncate">{evt?.message || "-"}</td>
                                                                    <td className="px-3 py-2 text-right">
                                                                        <DropdownMenu>
                                                                            <DropdownMenuTrigger asChild>
                                                                                <Button variant="ghost" size="icon">
                                                                                    <MoreHorizontal />
                                                                                </Button>
                                                                            </DropdownMenuTrigger>
                                                                            <DropdownMenuContent align="end">
                                                                                <DropdownMenuItem
                                                                                    onSelect={(e) => {
                                                                                        e.preventDefault()
                                                                                        navigator.clipboard?.writeText?.(String(evt?.id || ""))
                                                                                    }}
                                                                                >
                                                                                    Copy ID
                                                                                </DropdownMenuItem>
                                                                                <DropdownMenuItem
                                                                                    onSelect={(e) => {
                                                                                        e.preventDefault()
                                                                                        navigator.clipboard?.writeText?.(String(evt?.message || ""))
                                                                                    }}
                                                                                >
                                                                                    Copy message
                                                                                </DropdownMenuItem>
                                                                            </DropdownMenuContent>
                                                                        </DropdownMenu>
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </TabsContent>
                            </Tabs>
                        </div>
                    )}
                </div>
            </SidebarInset>
        </SidebarProvider>
    )
}
