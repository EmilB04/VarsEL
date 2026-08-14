import { ref, watch, onUnmounted } from 'vue';
import { markWaking, markReady, markError } from 'src/composables/useBackendStatus';

// Render's free tier spins the backend down when idle, so a first request
// after idle can take 30-60s+. This composable drives the per-page
// loading/error state around any async fetch, shared between pages that hit
// the backend (IndexPage, HistoryPage).
//
// The cold-start notice itself is no longer rendered per page - it is reported
// to the app-wide useBackendStatus singleton and shown by BackendStatusBar, so
// it is visible without scrolling regardless of where the user is on the page.
export function useBackendRequest() {
  const isLoading = ref(false);
  const hasError = ref(false);
  const errorCountdownSeconds = ref(180); // suggested wait time shown on error

  let errorCountdownInterval: ReturnType<typeof setInterval> | null = null;

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

  onUnmounted(() => {
    if (errorCountdownInterval) clearInterval(errorCountdownInterval);
  });

  // Wraps an async fetch with the loading/error lifecycle above, reporting
  // connectivity to the app-wide status bar as it goes.
  async function run(fn: () => Promise<void>) {
    try {
      isLoading.value = true;
      hasError.value = false;
      markWaking();
      await fn();
      // `fn` may set hasError itself for a well-formed but unusable response
      // (e.g. an empty price array), which is not a connectivity problem.
      markReady();
    } catch (err) {
      console.error('Backend request failed', err);
      hasError.value = true;
      markError();
    } finally {
      isLoading.value = false;
    }
  }

  return {
    isLoading,
    hasError,
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
