import { onUnmounted, ref } from 'vue';
import { isAxiosError } from 'axios';
import { markWaking, markReady, markError, finishRequest } from 'src/composables/useBackendStatus';

export function useBackendRequest() {
  const isLoading = ref(false);
  const hasError = ref(false);
  let requestId = 0;

  function reset() {
    requestId++;
    isLoading.value = false;
    hasError.value = false;
  }

  onUnmounted(reset);

  async function run<T>(load: () => Promise<T>, apply: (result: T) => void | Promise<void>) {
    const id = ++requestId;
    isLoading.value = true;
    hasError.value = false;
    markWaking();

    let connected = false;
    try {
      const result = await load();
      connected = true;
      markReady();
      if (id === requestId) await apply(result);
    } catch (err) {
      if (id === requestId) {
        hasError.value = true;
      }
      if (!connected) {
        if (id === requestId && isAxiosError(err) && !err.response) markError();
        else if (isAxiosError(err) && err.response) markReady();
        else finishRequest();
      }
    } finally {
      if (id === requestId) isLoading.value = false;
    }
  }

  return { isLoading, hasError, reset, run };
}

export function formatCountdown(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}
