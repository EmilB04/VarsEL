import { ref, computed, readonly } from 'vue';

/**
 * Global backend connectivity state, surfaced by BackendStatusBar.
 *
 * The backend runs on a free tier that spins down when idle, so the first
 * request after a quiet period can take 30-60s. This tracks that cold start in
 * one place instead of each page rendering its own banner far down the page.
 */
export type BackendState = 'unknown' | 'waking' | 'ready' | 'error';

/**
 * How long a request may run before we say anything. A warm backend answers in
 * well under this, so the bar never flashes up for a normal request.
 */
const ANNOUNCE_DELAY_MS = 700;

/** How long the "connected" confirmation stays up before auto-dismissing. */
const READY_DISMISS_MS = 2500;

/** Rough upper bound for a Render cold start, used for the countdown. */
const COLD_START_SECONDS = 60;

const state = ref<BackendState>('unknown');
const visible = ref(false);
const countdownSeconds = ref(COLD_START_SECONDS);

let announceTimer: ReturnType<typeof setTimeout> | null = null;
let dismissTimer: ReturnType<typeof setTimeout> | null = null;
let countdownTimer: ReturnType<typeof setInterval> | null = null;
let pendingRequests = 0;

function clearTimers() {
  if (announceTimer) clearTimeout(announceTimer);
  if (dismissTimer) clearTimeout(dismissTimer);
  if (countdownTimer) clearInterval(countdownTimer);
  announceTimer = null;
  dismissTimer = null;
  countdownTimer = null;
}

function startCountdown() {
  countdownSeconds.value = COLD_START_SECONDS;
  if (countdownTimer) clearInterval(countdownTimer);
  countdownTimer = setInterval(() => {
    if (countdownSeconds.value > 0) countdownSeconds.value--;
  }, 1000);
}

/** Call when a backend request starts. */
export function markWaking() {
  pendingRequests++;
  if (state.value === 'waking') return;

  clearTimers();
  state.value = 'waking';

  // Only reveal the bar if the request is actually slow, so a healthy backend
  // produces no UI at all.
  announceTimer = setTimeout(() => {
    if (state.value !== 'waking') return;
    visible.value = true;
    startCountdown();
  }, ANNOUNCE_DELAY_MS);
}

/** Call when a backend request succeeds. */
export function markReady() {
  pendingRequests = Math.max(0, pendingRequests - 1);
  if (pendingRequests > 0) return; // other requests still in flight

  const wasVisible = visible.value;
  clearTimers();
  state.value = 'ready';

  if (!wasVisible) {
    // Never announced, so there is nothing to dismiss.
    visible.value = false;
    return;
  }
  // Confirm briefly, then auto-dismiss.
  dismissTimer = setTimeout(() => {
    visible.value = false;
  }, READY_DISMISS_MS);
}

/** Call when a backend request fails. */
export function markError() {
  pendingRequests = Math.max(0, pendingRequests - 1);
  clearTimers();
  state.value = 'error';
  visible.value = true;
}

/** Manually dismiss the bar (the close button). */
export function dismiss() {
  clearTimers();
  visible.value = false;
}

export function useBackendStatus() {
  return {
    state: readonly(state),
    visible: readonly(visible),
    countdownSeconds: readonly(countdownSeconds),
    isWaking: computed(() => state.value === 'waking'),
    markWaking,
    markReady,
    markError,
    dismiss,
  };
}
