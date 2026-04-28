import {
  NormalPriority,
  scheduleCallback,
} from "@lonik/react-scheduler-experimental";
import { createFileRoute } from "@tanstack/react-router";
import { Activity, Gauge, Play, Zap } from "lucide-react";
import { useRef, useState } from "react";

export const Route = createFileRoute("/showcase")({
  component: RouteComponent,
  ssr: false,
});

const TOTAL_SLICES = 520;
const SLICE_BUDGET_MS = 4;
const PROGRESS_UPDATE_EVERY = 10;

type RunMode = "scheduler" | "sync";
type RunStatus = "idle" | "running" | "done";
type SchedulerContinuation = (
  didTimeout: boolean,
) => SchedulerContinuation | null;

type RunState = {
  checksum: number;
  duration: number | null;
  iterations: number;
  mode: RunMode | null;
  progress: number;
  status: RunStatus;
};

const initialRunState: RunState = {
  checksum: 0,
  duration: null,
  iterations: 0,
  mode: null,
  progress: 0,
  status: "idle",
};

function burnCpuFor(durationMs: number, seed: number) {
  const endTime = performance.now() + durationMs;
  let checksum = seed || 1;
  let iterations = 0;

  while (performance.now() < endTime) {
    checksum = Math.imul(checksum ^ 0x9e3779b9, 1_664_525) + 1_013_904_223;
    checksum >>>= 0;
    iterations++;
  }

  return { checksum, iterations };
}

function formatDuration(duration: number | null) {
  if (duration === null) {
    return "-";
  }

  return `${Math.round(duration)}ms`;
}

function RouteComponent() {
  const [run, setRun] = useState<RunState>(initialRunState);
  const runIdRef = useRef(0);

  const isRunning = run.status === "running";

  function startRun(mode: RunMode) {
    runIdRef.current++;
    setRun({
      ...initialRunState,
      mode,
      status: "running",
    });
  }

  function finishRun(
    mode: RunMode,
    startedAt: number,
    checksum: number,
    iterations: number,
  ) {
    setRun({
      checksum,
      duration: performance.now() - startedAt,
      iterations,
      mode,
      progress: 100,
      status: "done",
    });
  }

  function runWithoutScheduler() {
    if (isRunning) {
      return;
    }

    startRun("sync");
    const runId = runIdRef.current;

    window.setTimeout(() => {
      if (runId !== runIdRef.current) {
        return;
      }

      const startedAt = performance.now();
      let checksum = 1;
      let iterations = 0;

      for (let slice = 0; slice < TOTAL_SLICES; slice++) {
        const result = burnCpuFor(SLICE_BUDGET_MS, checksum);
        checksum = result.checksum;
        iterations += result.iterations;
      }

      finishRun("sync", startedAt, checksum, iterations);
    }, 80);
  }

  function runWithScheduler() {
    if (isRunning) {
      return;
    }

    startRun("scheduler");
    const runId = runIdRef.current;
    const startedAt = performance.now();
    let checksum = 1;
    let completedSlices = 0;
    let iterations = 0;

    const workSlice: SchedulerContinuation = () => {
      if (runId !== runIdRef.current) {
        return null;
      }

      const result = burnCpuFor(SLICE_BUDGET_MS, checksum);
      checksum = result.checksum;
      completedSlices++;
      iterations += result.iterations;

      if (
        completedSlices % PROGRESS_UPDATE_EVERY === 0 ||
        completedSlices === TOTAL_SLICES
      ) {
        const progress = Math.round((completedSlices / TOTAL_SLICES) * 100);

        setRun((current) => ({
          ...current,
          checksum,
          duration: performance.now() - startedAt,
          iterations,
          progress,
        }));
      }

      if (completedSlices < TOTAL_SLICES) {
        return workSlice;
      }

      finishRun("scheduler", startedAt, checksum, iterations);
      return null;
    };

    scheduleCallback(NormalPriority, workSlice);
  }

  const currentModeLabel =
    run.mode === "scheduler"
      ? "Scheduler"
      : run.mode === "sync"
        ? "No scheduler"
        : "Waiting";

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
      <style>{`
        @keyframes showcase-runner {
          0% {
            left: 0;
            background: #14b8a6;
          }
          45% {
            background: #2563eb;
          }
          50% {
            left: calc(100% - 4.5rem);
            background: #f59e0b;
          }
          100% {
            left: 0;
            background: #14b8a6;
          }
        }

        @keyframes showcase-track {
          from {
            background-position: 0 0;
          }
          to {
            background-position: 72px 0;
          }
        }

        @keyframes showcase-glow {
          0%, 100% {
            opacity: 0.45;
          }
          50% {
            opacity: 0.9;
          }
        }

        .showcase-runner {
          animation: showcase-runner 1.7s ease-in-out infinite;
        }

        .showcase-track {
          animation: showcase-track 1.1s linear infinite;
          background-image: linear-gradient(
            135deg,
            rgba(15, 23, 42, 0.08) 25%,
            transparent 25%,
            transparent 50%,
            rgba(15, 23, 42, 0.08) 50%,
            rgba(15, 23, 42, 0.08) 75%,
            transparent 75%,
            transparent
          );
          background-size: 72px 72px;
        }

        .showcase-glow {
          animation: showcase-glow 1.4s ease-in-out infinite;
        }
      `}</style>

      <section className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
        <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-6 flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-sm font-medium text-teal-800">
              <Activity size={16} aria-hidden="true" />
              CSS animation
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-sm font-medium text-amber-800">
              <Zap size={16} aria-hidden="true" />
              Main thread demo
            </span>
          </div>

          <div className="max-w-3xl">
            <h1 className="text-3xl font-semibold tracking-normal text-zinc-950 sm:text-4xl">
              Scheduler showcase
            </h1>
            <p className="mt-4 text-base leading-7 text-zinc-700">
              Both buttons run the same CPU-heavy loop. The difference is how
              the work reaches the main thread. The CSS animation keeps moving
              smoothly when the work is split into scheduler continuations, and
              it stalls when the same work runs as one blocking task.
            </p>
          </div>

          <div className="mt-8 rounded-lg border border-zinc-200 bg-zinc-50 p-4">
            <div className="mb-3 flex items-center justify-between gap-4 text-sm font-medium text-zinc-700">
              <span>Browser paint lane</span>
              <span>{currentModeLabel}</span>
            </div>
            <div className="showcase-track relative h-28 overflow-hidden rounded-lg border border-zinc-200 bg-white">
              <div className="showcase-glow absolute inset-y-5 left-8 right-8 rounded-full bg-teal-200 blur-2xl" />
              <div
                className="showcase-runner absolute top-5 h-18 w-18 rounded-lg shadow-lg shadow-zinc-400/40"
                aria-hidden="true"
              >
                <div className="flex h-full w-full items-center justify-center rounded-lg border border-white/45 bg-white/20 text-sm font-semibold text-white">
                  CSS
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <button
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-zinc-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-400"
              disabled={isRunning}
              type="button"
              onClick={runWithScheduler}
            >
              <Play size={18} aria-hidden="true" />
              Run with scheduler
            </button>
            <button
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-zinc-300 bg-white px-4 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:text-zinc-400"
              disabled={isRunning}
              type="button"
              onClick={runWithoutScheduler}
            >
              <Play size={18} aria-hidden="true" />
              Run without scheduler
            </button>
          </div>
        </div>

        <aside className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
              <Gauge size={20} aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-zinc-950">
                Current run
              </h2>
              <p className="text-sm text-zinc-500">
                Same work, different execution strategy.
              </p>
            </div>
          </div>

          <div className="space-y-5">
            <div>
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="font-medium text-zinc-700">Progress</span>
                <span className="font-semibold text-zinc-950">
                  {run.progress}%
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-zinc-100">
                <div
                  className="h-full rounded-full bg-teal-500 transition-[width] duration-150"
                  style={{ width: `${run.progress}%` }}
                />
              </div>
            </div>

            <dl className="grid grid-cols-2 gap-3 text-sm">
              <Metric label="Mode" value={currentModeLabel} />
              <Metric
                label="Status"
                value={
                  run.status === "idle"
                    ? "Idle"
                    : run.status === "running"
                      ? "Running"
                      : "Done"
                }
              />
              <Metric label="Duration" value={formatDuration(run.duration)} />
              <Metric
                label="Slices"
                value={run.mode === null ? "-" : TOTAL_SLICES.toString()}
              />
              <Metric
                label="Iterations"
                value={
                  run.iterations === 0 ? "-" : run.iterations.toLocaleString()
                }
              />
              <Metric
                label="Checksum"
                value={run.checksum === 0 ? "-" : run.checksum.toString(16)}
              />
            </dl>
          </div>
        </aside>
      </section>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3">
      <dt className="text-xs font-medium uppercase text-zinc-500">{label}</dt>
      <dd className="mt-1 min-h-5 break-words font-semibold text-zinc-950">
        {value}
      </dd>
    </div>
  );
}
