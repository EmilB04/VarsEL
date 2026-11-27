import { onMounted, onUnmounted, readonly, ref } from 'vue';

const now = ref(new Date());

export function startOsloClock() {
  let interval: ReturnType<typeof setInterval>;
  onMounted(() => {
    now.value = new Date();
    interval = setInterval(() => {
      now.value = new Date();
    }, 30_000);
  });
  onUnmounted(() => clearInterval(interval));
}

export function useOsloClock() {
  return readonly(now);
}
