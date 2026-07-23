import { ref, watch, onUnmounted } from 'vue';

// Render's free tier spins the backend down when idle, so a first request
// after idle can take 30-60s+. This composable drives a consistent
// loading/"taking longer than expected"/error sequence around any async
// fetch, shared between pages that hit the backend (IndexPage, HistoryPage).
export function useBackendRequest() {
  const isLoading = ref(false);
  const hasError = ref(false);
  const loadingTakingLong = ref(false);
  const loadingCountdownSeconds = ref(0); // counts down once loading is taking long
  const errorCountdownSeconds = ref(180); // suggested wait time shown on error

  let errorCountdownInterval: ReturnType<typeof setInterval> | null = null;
  let loadingCountdownInterval: ReturnType<typeof setInterval> | null = null;
  let loadingTimeoutId: ReturnType<typeof setTimeout> | null = null;

  watch(hasError, (newValue) => {
    if (newValue) {
      errorCountdownSeconds.value = 180; // reset to 3 minutes
      if (errorCountdownInterval) clearInterval(errorCountdownInterval);
      errorCountdownInterval = setInterval(() => {
        errorCountdownSeconds.value--;
        if (errorCountdownSeconds.value <= 0 && errorCountdownInterval) {
          clearInterval(errorCountdownInterval);
          errorCountdownInterval = null;
        }
      }, 1000);
    } else {
      if (errorCountdownInterval) clearInterval(errorCountdownInterval);
      errorCountdownInterval = null;
    }
  });

  watch(isLoading, (newValue) => {
    if (newValue) {
      loadingTakingLong.value = false;
      if (loadingTimeoutId) clearTimeout(loadingTimeoutId);
      if (loadingCountdownInterval) clearInterval(loadingCountdownInterval);
      loadingTimeoutId = setTimeout(() => {
        loadingTakingLong.value = true;
        loadingCountdownSeconds.value = 60;
        if (loadingCountdownInterval) clearInterval(loadingCountdownInterval);
        loadingCountdownInterval = setInterval(() => {
          loadingCountdownSeconds.value--;
          if (loadingCountdownSeconds.value <= 0 && loadingCountdownInterval) {
            clearInterval(loadingCountdownInterval);
            loadingCountdownInterval = null;
          }
        }, 1000);
      }, 2000);
    } else {
      loadingTakingLong.value = false;
      if (loadingTimeoutId) clearTimeout(loadingTimeoutId);
      if (loadingCountdownInterval) clearInterval(loadingCountdownInterval);
      loadingTimeoutId = null;
      loadingCountdownInterval = null;
    }
  });

  onUnmounted(() => {
    if (errorCountdownInterval) clearInterval(errorCountdownInterval);
    if (loadingCountdownInterval) clearInterval(loadingCountdownInterval);
    if (loadingTimeoutId) clearTimeout(loadingTimeoutId);
  });

  // Wraps an async fetch with the loading/error lifecycle above.
  async function run(fn: () => Promise<void>) {
    try {
      isLoading.value = true;
      hasError.value = false;
      await fn();
    } catch (err) {
      console.error('Backend request failed', err);
      hasError.value = true;
    } finally {
      isLoading.value = false;
    }
  }

  return {
    isLoading,
    hasError,
    loadingTakingLong,
    loadingCountdownSeconds,
    errorCountdownSeconds,
    run,
  };
}

// Format a countdown in seconds as MM:SS.
export function formatCountdown(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}
