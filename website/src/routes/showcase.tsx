import {
  Activity,
  Gauge,
  ListRestart,
  PauseCircle,
  Play,
  RotateCcw,
  TimerReset,
  Zap,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  cancelCallback,
  getCurrentPriorityLevel,
  IdlePriority,
  ImmediatePriority,
  LowPriority,
  NormalPriority,
  scheduleCallback,
  shouldYield,
  UserBlockingPriority,
} from "@lonik/react-scheduler-experimental";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/showcase")({
  component: RouteComponent,
});

type SchedulerTask = ReturnType<typeof scheduleCallback>;
type SchedulerPriority = Parameters<typeof scheduleCallback>[0];
type SchedulerCallback = Parameters<typeof scheduleCallback>[1];

type PriorityRun = {
  id: string;
  name: string;
  priority: SchedulerPriority;
  badge: string;
  timeout: string;
  color: string;
};

type PriorityLog = {
  id: string;
  name: string;
  order: number;
  queuedAt: number;
  startedAt: number;
  didTimeout: boolean;
  activePriority: number;
};

type PriorityRow = PriorityRun & {
  status: "queued" | "running" | "done";
  queuedAt: number;
};

type FrameStats = {
  fps: number;
  frame: number;
  maxGap: number;
  longFrames: number;
};

type WorkState = {
  mode: "idle" | "scheduled" | "sync" | "complete" | "cancelled";
  completed: number;
  progress: number;
  duration: number;
  checksum: number;
};

const priorityRuns: PriorityRun[] = [
  {
    id: "immediate",
    name: "Immediate",
    priority: ImmediatePriority,
    badge: "expires now",
    timeout: "-1ms",
    color: "bg-red-500",
  },
  {
    id: "user-blocking",
    name: "User Blocking",
    priority: UserBlockingPriority,
    badge: "input lane",
    timeout: "250ms",
    color: "bg-amber-500",
  },
  {
    id: "normal",
    name: "Normal",
    priority: NormalPriority,
    badge: "default",
    timeout: "5000ms",
    color: "bg-sky-500",
  },
  {
    id: "low",
    name: "Low",
    priority: LowPriority,
    badge: "background",
    timeout: "10000ms",
    color: "bg-emerald-500",
  },
  {
    id: "idle",
    name: "Idle",
    priority: IdlePriority,
    badge: "last resort",
    timeout: "1073741823ms",
    color: "bg-zinc-500",
  },
];

const workUnits = 55_000;

function RouteComponent() {
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f8fafc_0%,#eef2f7_46%,#ffffff_100%)] text-slate-950">
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-5 py-8 sm:px-8 lg:py-10">
        <header className="grid gap-6 border-b border-slate-200 pb-8 lg:grid-cols-[1fr_360px] lg:items-end">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600 shadow-sm">
              <Zap className="h-3.5 w-3.5 text-amber-500" />
              scheduleCallback showcase
            </div>
            <div className="space-y-3">
              <h1 className="max-w-3xl text-4xl font-semibold tracking-normal text-slate-950 sm:text-5xl">
                See Scheduler choose priority, then keep work responsive.
              </h1>
              <p className="max-w-2xl text-base leading-7 text-slate-600">
                Two small experiments expose the same browser constraint:
                Scheduler can order work and split it across turns, but a
                single synchronous loop still owns the main thread until it
                returns.
              </p>
            </div>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-slate-950 text-white">
                <Activity className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-950">
                  Main-thread lab
                </p>
                <p className="text-sm text-slate-600">
                  Run both demos and watch the timeline, FPS, and frame gaps.
                </p>
              </div>
            </div>
          </div>
        </header>

        <PriorityExecutionDemo />
        <HeavyComputationDemo />
      </section>
    </main>
  );
}

function PriorityExecutionDemo() {
  const queuedTasksRef = useRef<SchedulerTask[]>([]);
  const [rows, setRows] = useState<PriorityRow[]>(() =>
    priorityRuns.map((run) => ({
      ...run,
      status: "queued",
      queuedAt: 0,
    })),
  );
  const [log, setLog] = useState<PriorityLog[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    return () => {
      queuedTasksRef.current.forEach(cancelCallback);
    };
  }, []);

  const reset = () => {
    queuedTasksRef.current.forEach(cancelCallback);
    queuedTasksRef.current = [];
    setIsRunning(false);
    setLog([]);
    setRows(
      priorityRuns.map((run) => ({
        ...run,
        status: "queued",
        queuedAt: 0,
      })),
    );
  };

  const runPriorityDemo = () => {
    reset();
    const queuedAt = performance.now();
    let order = 0;

    setIsRunning(true);
    setRows(
      priorityRuns.map((run) => ({
        ...run,
        status: "queued",
        queuedAt,
      })),
    );

    queuedTasksRef.current = priorityRuns.map((run) =>
      scheduleCallback(run.priority, (didTimeout) => {
        const startedAt = performance.now();
        const activePriority = getCurrentPriorityLevel();
        const nextOrder = order + 1;
        order = nextOrder;

        setRows((current) =>
          current.map((row) =>
            row.id === run.id ? { ...row, status: "running" } : row,
          ),
        );

        window.setTimeout(() => {
          setRows((current) =>
            current.map((row) =>
              row.id === run.id ? { ...row, status: "done" } : row,
            ),
          );
        }, 160);

        setLog((current) => [
          ...current,
          {
            id: run.id,
            name: run.name,
            order: nextOrder,
            queuedAt,
            startedAt,
            didTimeout,
            activePriority,
          },
        ]);

        if (nextOrder === priorityRuns.length) {
          setIsRunning(false);
        }

        return null;
      }),
    );
  };

  return (
    <section className="grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
      <Panel
        eyebrow="Case 1"
        title="Priority execution"
        description="Schedule five callbacks in one batch and compare the order they actually start."
      >
        <div className="flex flex-wrap gap-2">
          <button
            className="inline-flex items-center gap-2 rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isRunning}
            onClick={runPriorityDemo}
            type="button"
          >
            <Play className="h-4 w-4" />
            Run priority batch
          </button>
          <button
            className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
            onClick={reset}
            type="button"
          >
            <RotateCcw className="h-4 w-4" />
            Reset
          </button>
        </div>

        <div className="mt-6 grid gap-3">
          {rows.map((row) => (
            <div
              className="grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-lg border border-slate-200 bg-white p-3 shadow-sm"
              key={row.id}
            >
              <span className={`h-3 w-3 rounded-full ${row.color}`} />
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold text-slate-950">{row.name}</p>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                    {row.badge}
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  expiration timeout: {row.timeout}
                </p>
              </div>
              <StatusPill status={row.status} />
            </div>
          ))}
        </div>
      </Panel>

      <Panel
        eyebrow="Observed result"
        title="Execution timeline"
        description="Immediate work receives the earliest expiration time, then Scheduler moves down the queue."
      >
        {log.length === 0 ? (
          <EmptyState icon={<ListRestart className="h-5 w-5" />}>
            The timeline will fill after the batch runs.
          </EmptyState>
        ) : (
          <ol className="grid gap-3">
            {log.map((item) => {
              const offset = Math.max(0, item.startedAt - item.queuedAt);

              return (
                <li
                  className="grid grid-cols-[48px_1fr] gap-3 rounded-lg border border-slate-200 bg-white p-3 shadow-sm"
                  key={`${item.id}-${item.order}`}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-md bg-slate-950 text-sm font-bold text-white">
                    {item.order}
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-semibold text-slate-950">
                        {item.name}
                      </p>
                      <span className="text-xs font-medium text-slate-500">
                        +{offset.toFixed(1)}ms
                      </span>
                    </div>
                    <div className="mt-2 grid gap-2 text-xs text-slate-600 sm:grid-cols-2">
                      <span className="rounded-md bg-slate-100 px-2 py-1">
                        active priority: {item.activePriority}
                      </span>
                      <span className="rounded-md bg-slate-100 px-2 py-1">
                        timed out: {String(item.didTimeout)}
                      </span>
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </Panel>
    </section>
  );
}

function HeavyComputationDemo() {
  const scheduledTaskRef = useRef<SchedulerTask | null>(null);
  const syncTimerRef = useRef<number | null>(null);
  const runTokenRef = useRef(0);
  const frameRef = useRef({
    last: 0,
    frames: 0,
    maxGap: 0,
    longFrames: 0,
    windowStartedAt: 0,
    windowFrames: 0,
  });

  const [frameStats, setFrameStats] = useState<FrameStats>({
    fps: 60,
    frame: 0,
    maxGap: 0,
    longFrames: 0,
  });
  const [work, setWork] = useState<WorkState>({
    mode: "idle",
    completed: 0,
    progress: 0,
    duration: 0,
    checksum: 0,
  });

  const isScheduledRunning = work.mode === "scheduled";
  const isSyncRunning = work.mode === "sync";
  const isRunning = isScheduledRunning || isSyncRunning;

  useEffect(() => {
    let rafId = 0;

    const onFrame = (now: number) => {
      const frame = frameRef.current;

      if (frame.last > 0) {
        const gap = now - frame.last;
        frame.maxGap = Math.max(frame.maxGap, gap);
        if (gap > 80) {
          frame.longFrames += 1;
        }
      }

      if (frame.windowStartedAt === 0) {
        frame.windowStartedAt = now;
      }

      frame.frames += 1;
      frame.windowFrames += 1;
      frame.last = now;

      const elapsed = now - frame.windowStartedAt;
      if (elapsed >= 250) {
        const fps = Math.round((frame.windowFrames / elapsed) * 1000);
        setFrameStats({
          fps,
          frame: frame.frames,
          maxGap: frame.maxGap,
          longFrames: frame.longFrames,
        });
        frame.windowStartedAt = now;
        frame.windowFrames = 0;
      }

      rafId = requestAnimationFrame(onFrame);
    };

    rafId = requestAnimationFrame(onFrame);

    return () => {
      cancelAnimationFrame(rafId);
      if (scheduledTaskRef.current) {
        cancelCallback(scheduledTaskRef.current);
      }
      if (syncTimerRef.current !== null) {
        window.clearTimeout(syncTimerRef.current);
      }
      runTokenRef.current += 1;
    };
  }, []);

  const resetFrameStats = () => {
    frameRef.current = {
      last: performance.now(),
      frames: 0,
      maxGap: 0,
      longFrames: 0,
      windowStartedAt: performance.now(),
      windowFrames: 0,
    };
    setFrameStats({
      fps: 60,
      frame: 0,
      maxGap: 0,
      longFrames: 0,
    });
  };

  const stopScheduledWork = () => {
    runTokenRef.current += 1;
    if (scheduledTaskRef.current) {
      cancelCallback(scheduledTaskRef.current);
      scheduledTaskRef.current = null;
    }
    setWork((current) => ({
      ...current,
      mode: "cancelled",
      duration: current.duration,
    }));
  };

  const startScheduledWork = () => {
    if (isRunning) return;

    resetFrameStats();
    runTokenRef.current += 1;
    const token = runTokenRef.current;
    const startedAt = performance.now();
    let completed = 0;
    let checksum = 0;

    setWork({
      mode: "scheduled",
      completed: 0,
      progress: 0,
      duration: 0,
      checksum: 0,
    });

    const processChunk: SchedulerCallback = () => {
      if (token !== runTokenRef.current) {
        return null;
      }

      while (completed < workUnits && !shouldYield()) {
        checksum += heavyWorkUnit(completed);
        completed += 1;
      }

      const duration = performance.now() - startedAt;
      setWork({
        mode: completed === workUnits ? "complete" : "scheduled",
        completed,
        progress: completed / workUnits,
        duration,
        checksum,
      });

      if (completed < workUnits) {
        return processChunk;
      }

      scheduledTaskRef.current = null;
      return null;
    };

    scheduledTaskRef.current = scheduleCallback(NormalPriority, processChunk);
  };

  const startSynchronousWork = () => {
    if (isRunning) return;

    resetFrameStats();
    runTokenRef.current += 1;
    const token = runTokenRef.current;

    setWork({
      mode: "sync",
      completed: 0,
      progress: 0,
      duration: 0,
      checksum: 0,
    });

    syncTimerRef.current = window.setTimeout(() => {
      if (token !== runTokenRef.current) return;

      const startedAt = performance.now();
      let checksum = 0;

      for (let i = 0; i < workUnits; i += 1) {
        checksum += heavyWorkUnit(i);
      }

      setWork({
        mode: "complete",
        completed: workUnits,
        progress: 1,
        duration: performance.now() - startedAt,
        checksum,
      });
      syncTimerRef.current = null;
    }, 60);
  };

  const resetWork = () => {
    if (isSyncRunning) return;
    runTokenRef.current += 1;
    if (scheduledTaskRef.current) {
      cancelCallback(scheduledTaskRef.current);
      scheduledTaskRef.current = null;
    }
    if (syncTimerRef.current !== null) {
      window.clearTimeout(syncTimerRef.current);
      syncTimerRef.current = null;
    }
    resetFrameStats();
    setWork({
      mode: "idle",
      completed: 0,
      progress: 0,
      duration: 0,
      checksum: 0,
    });
  };

  const progressLabel = `${Math.round(work.progress * 100)}%`;
  const meterOffset = useMemo(() => frameStats.frame % 100, [frameStats.frame]);

  return (
    <section className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
      <Panel
        eyebrow="Case 2"
        title="Heavy computation"
        description="Run the same CPU-bound work as cooperative Scheduler chunks or as one regular loop."
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <button
            className="inline-flex items-center justify-center gap-2 rounded-md bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isRunning}
            onClick={startScheduledWork}
            type="button"
          >
            <Play className="h-4 w-4" />
            Run with Scheduler
          </button>
          <button
            className="inline-flex items-center justify-center gap-2 rounded-md bg-slate-950 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isRunning}
            onClick={startSynchronousWork}
            type="button"
          >
            <PauseCircle className="h-4 w-4" />
            Run regular loop
          </button>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <button
            className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={!isScheduledRunning}
            onClick={stopScheduledWork}
            type="button"
          >
            <TimerReset className="h-4 w-4" />
            Cancel scheduled work
          </button>
          <button
            className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isSyncRunning}
            onClick={resetWork}
            type="button"
          >
            <RotateCcw className="h-4 w-4" />
            Reset lab
          </button>
        </div>

        <div className="mt-6 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-slate-950">
                Work progress
              </p>
              <p className="text-xs text-slate-500">
                {work.completed.toLocaleString()} / {workUnits.toLocaleString()}{" "}
                units
              </p>
            </div>
            <ModeBadge mode={work.mode} />
          </div>
          <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-emerald-500 transition-[width] duration-150"
              style={{ width: progressLabel }}
            />
          </div>
          <div className="mt-3 grid gap-2 text-xs text-slate-600 sm:grid-cols-3">
            <span className="rounded-md bg-slate-100 px-2 py-1">
              progress: {progressLabel}
            </span>
            <span className="rounded-md bg-slate-100 px-2 py-1">
              duration: {work.duration.toFixed(1)}ms
            </span>
            <span className="rounded-md bg-slate-100 px-2 py-1">
              checksum: {Math.round(work.checksum).toLocaleString()}
            </span>
          </div>
        </div>
      </Panel>

      <Panel
        eyebrow="Responsiveness"
        title="Frame monitor"
        description="The marker is driven by requestAnimationFrame, so it stalls when the main thread is blocked."
      >
        <div className="rounded-lg border border-slate-200 bg-slate-950 p-4 text-white shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Gauge className="h-4 w-4 text-emerald-300" />
              <p className="text-sm font-semibold">Heartbeat</p>
            </div>
            <span className="rounded-full bg-white/10 px-2 py-1 text-xs text-slate-200">
              {frameStats.fps} fps
            </span>
          </div>
          <div className="relative mt-6 h-16 overflow-hidden rounded-md border border-white/10 bg-[linear-gradient(90deg,rgba(255,255,255,.09)_1px,transparent_1px)] bg-[length:24px_100%]">
            <div
              className="absolute top-1/2 h-9 w-9 -translate-y-1/2 rounded-full bg-emerald-300 shadow-[0_0_32px_rgba(110,231,183,.75)] transition-[left] duration-75"
              style={{ left: `calc(${meterOffset}% - 18px)` }}
            />
          </div>
          <div className="mt-4 grid gap-2 text-xs text-slate-300 sm:grid-cols-2">
            <span className="rounded-md bg-white/10 px-2 py-1">
              longest frame gap: {frameStats.maxGap.toFixed(1)}ms
            </span>
            <span className="rounded-md bg-white/10 px-2 py-1">
              long frames: {frameStats.longFrames}
            </span>
          </div>
        </div>

        <div className="mt-4 grid gap-3">
          <CodeCard
            title="Cooperative Scheduler work"
            code={`scheduleCallback(NormalPriority, function work() {
  while (itemsRemain && !shouldYield()) {
    heavyComputation();
  }

  return itemsRemain ? work : null;
});`}
          />
          <CodeCard
            title="Regular synchronous work"
            code={`for (let i = 0; i < total; i += 1) {
  heavyComputation();
}`}
          />
        </div>
      </Panel>
    </section>
  );
}

function Panel({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white/78 p-5 shadow-sm backdrop-blur">
      <div className="mb-5 space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          {eyebrow}
        </p>
        <h2 className="text-2xl font-semibold tracking-normal text-slate-950">
          {title}
        </h2>
        <p className="text-sm leading-6 text-slate-600">{description}</p>
      </div>
      {children}
    </section>
  );
}

function StatusPill({ status }: { status: PriorityRow["status"] }) {
  const label = status === "done" ? "done" : status;
  const className =
    status === "done"
      ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
      : status === "running"
        ? "bg-amber-50 text-amber-700 ring-amber-200"
        : "bg-slate-100 text-slate-600 ring-slate-200";

  return (
    <span
      className={`rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${className}`}
    >
      {label}
    </span>
  );
}

function ModeBadge({ mode }: { mode: WorkState["mode"] }) {
  const label =
    mode === "scheduled"
      ? "scheduler running"
      : mode === "sync"
        ? "regular loop running"
        : mode;
  const className =
    mode === "complete"
      ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
      : mode === "sync"
        ? "bg-red-50 text-red-700 ring-red-200"
        : mode === "scheduled"
          ? "bg-sky-50 text-sky-700 ring-sky-200"
          : "bg-slate-100 text-slate-600 ring-slate-200";

  return (
    <span
      className={`rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${className}`}
    >
      {label}
    </span>
  );
}

function EmptyState({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-44 flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-500">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-md bg-slate-100 text-slate-500">
        {icon}
      </div>
      {children}
    </div>
  );
}

function CodeCard({ title, code }: { title: string; code: string }) {
  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600">
        {title}
      </div>
      <pre className="overflow-x-auto p-3 text-xs leading-5 text-slate-700">
        <code>{code}</code>
      </pre>
    </div>
  );
}

function heavyWorkUnit(seed: number) {
  let value = (seed % 17) + 1;

  for (let i = 0; i < 420; i += 1) {
    value = Math.sqrt(value * 1.000001 + i) % 97;
  }

  return value;
}
