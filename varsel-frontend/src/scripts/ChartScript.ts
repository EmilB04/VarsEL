import { ref, watch, onUnmounted } from 'vue'
import { useAccent } from 'src/composables/useAccent'
import { useTheme } from 'src/composables/useTheme'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  LineController,
  Tooltip,
  Filler
} from 'chart.js'
import annotationPlugin from 'chartjs-plugin-annotation'
import type { Price } from './TableScript'

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  LineController,
  Tooltip,
  Filler,
  annotationPlugin
)

// Brand palette - keep in sync with src/css/quasar.variables.scss ($warning),
// matches PriceSummary's "average" card exactly.
const COLOR_WARNING = '#F59E0B' // average marker

// Reads the live --q-primary CSS var (set by useAccent.ts) so the chart's
// line/fill color follows the user's chosen accent, not a fixed brand color.
function getPrimaryColor(): string {
  if (typeof document === 'undefined') return '#00D9C0'
  const value = getComputedStyle(document.documentElement).getPropertyValue('--q-primary').trim()
  return value || '#00D9C0'
}

function hexToRgbTuple(hex: string): string {
  const match = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!match?.[1] || !match[2] || !match[3]) return '0, 217, 192';
  return `${parseInt(match[1], 16)}, ${parseInt(match[2], 16)}, ${parseInt(match[3], 16)}`;
}

const COLOR_POSITIVE = '#10B981'  // lowest price (matches PriceSummary card)
const COLOR_NEGATIVE = '#EF4444'  // highest price (matches PriceSummary card)
const COLOR_INFO = '#3B82F6'      // current time (matches PriceSummary card)
const COLOR_ACCENT = '#EC4899'    // difference (matches PriceSummary card)
const FONT_FAMILY = 'Roboto, -apple-system, BlinkMacSystemFont, sans-serif'

const AXIS_LABEL_COLOR = 'rgba(148, 163, 184, 0.9)' // slate-400, reads on light + dark
const GRID_LINE_COLOR = 'rgba(148, 163, 184, 0.15)'

// Matches the PriceSummary card keys - clicking a card highlights the
// corresponding point (or line, for "average") on the chart.
export type HighlightKey = 'lowest' | 'highest' | 'current' | 'average' | 'difference'

// Composable for chart functionality
export function useChartServices() {
  const chartCanvas = ref<HTMLCanvasElement | null>(null)
  let chartInstance: ChartJS | null = null
  let lastCanvasEl: HTMLCanvasElement | null = null
  let lastPrices: Price[] = []
  let highlightKey: HighlightKey | null = null

  // Function to create the price chart. Accept an explicit canvas element
  function createChart(canvasEl: HTMLCanvasElement | null, prices: Price[]) {
    if (!canvasEl || prices.length === 0) {
      return;
    }

    lastCanvasEl = canvasEl;
    lastPrices = prices;

    // Destroy existing chart if it exists
    if (chartInstance) {
      chartInstance.destroy();
    }

    const ctx = canvasEl.getContext('2d');
    if (!ctx) {
      return;
    }

    const labels = prices.map(price => {
      const timeStr = price.time_start || '';
      return timeStr.length >= 16 ? timeStr.slice(11, 16) : timeStr;
    });
    const data = prices.map(price => typeof price.NOK_per_kWh === 'number' ? price.NOK_per_kWh : parseFloat(price.NOK_per_kWh) || 0);

    // Calculate min, max, and average
    const minPrice = Math.min(...data);
    const maxPrice = Math.max(...data);
    const avgPrice = data.reduce((sum, price) => sum + price, 0) / data.length;

    // Find indices of min and max prices
    const minIndex = data.indexOf(minPrice);
    const maxIndex = data.indexOf(maxPrice);

    // Get current time to highlight on chart
    const now = new Date();
    const currentHour = now.getHours();
    const currentTime = `${currentHour.toString().padStart(2, '0')}:00`;
    const currentTimeIndex = labels.indexOf(currentTime);

    // Only min/max/now get a visible marker - everything else stays hidden
    // so the line itself reads as a clean, uninterrupted curve. Whichever one
    // matches the currently selected PriceSummary card (if any) is drawn larger
    // with a thicker ring so it reads as clearly emphasized.
    const isPointHighlighted = (index: number): boolean => {
      if (highlightKey === 'lowest') return index === minIndex;
      if (highlightKey === 'highest') return index === maxIndex;
      if (highlightKey === 'current') return index === currentTimeIndex;
      if (highlightKey === 'difference') return index === minIndex || index === maxIndex;
      return false;
    };

    const primaryColor = getPrimaryColor();
    const primaryRgb = hexToRgbTuple(primaryColor);
    const pointRadius = data.map((_, index) => {
      if (isPointHighlighted(index)) return 12;
      if (index === minIndex || index === maxIndex || index === currentTimeIndex) return 6;
      return 0;
    });
    const pointBorderWidth = data.map((_, index) => (isPointHighlighted(index) ? 4 : 2));
    const pointColor = data.map((_, index) => {
      if (index === minIndex) return COLOR_POSITIVE;
      if (index === maxIndex) return COLOR_NEGATIVE;
      if (index === currentTimeIndex) return COLOR_INFO;
      return primaryColor;
    });

    try {
      chartInstance = new ChartJS(ctx, {
        type: 'line',
        data: {
          labels: labels,
          datasets: [{
            label: 'Pris (kr/kWh)',
            data: data,
            borderColor: primaryColor,
            backgroundColor: (context) => {
              const { ctx: gradientCtx, chartArea } = context.chart;
              if (!chartArea) return `rgba(${primaryRgb}, 0.15)`;
              const gradient = gradientCtx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
              gradient.addColorStop(0, `rgba(${primaryRgb}, 0.35)`);
              gradient.addColorStop(1, `rgba(${primaryRgb}, 0)`);
              return gradient;
            },
            borderWidth: 3,
            cubicInterpolationMode: 'monotone',
            tension: 0.4,
            fill: true,
            pointBackgroundColor: pointColor,
            pointBorderColor: 'rgba(255, 255, 255, 0.9)',
            pointBorderWidth,
            pointRadius,
            pointHoverRadius: 7,
            pointHoverBorderWidth: 2,
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: {
            mode: 'index',
            intersect: false,
          },
          plugins: {
            tooltip: {
              backgroundColor: 'rgba(15, 23, 42, 0.92)', // slate-900 glass
              titleColor: '#ffffff',
              bodyColor: '#e2e8f0',
              borderColor: 'rgba(255, 255, 255, 0.08)',
              borderWidth: 1,
              padding: 12,
              cornerRadius: 12,
              displayColors: false,
              titleFont: { family: FONT_FAMILY, size: 13, weight: 600 },
              bodyFont: { family: FONT_FAMILY, size: 13 },
              callbacks: {
                title: function(context) { // Custom tooltip to show time range for each hour
                  const hourLabel = context[0]?.label;
                  if (!hourLabel) return '';

                  const hourPart = hourLabel.split(':')[0];
                  if (!hourPart) return '';

                  const hour = parseInt(hourPart);
                  const nextHour = (hour + 1) % 24;

                  return `${hour.toString().padStart(2, '0')}:00 - ${nextHour.toString().padStart(2, '0')}:00`;
                },
                label: function(context) { // Custom tooltip to show price with two decimal places and highlight min/max/current
                  const value = (context.parsed.y ?? 0).toFixed(2);
                  let label = `Pris: ${value} kr/kWh`;

                  if (context.dataIndex === minIndex) {
                    label += ' (Laveste)';
                  } else if (context.dataIndex === maxIndex) {
                    label += ' (Høyeste)';
                  } else if (context.dataIndex === currentTimeIndex) {
                    label += ' (Nå)';
                  }

                  return label;
                }
              }
            },

            annotation: {
              annotations: {
                averageLine: {
                  type: 'line',
                  yMin: avgPrice,
                  yMax: avgPrice,
                  borderColor: COLOR_WARNING,
                  borderWidth: highlightKey === 'average' ? 3 : 1.5,
                  borderDash: highlightKey === 'average' ? [] : [6, 4],
                  label: {
                    content: `Snitt: ${avgPrice.toFixed(2)} kr/kWh`,
                    display: true,
                    position: 'end',
                    backgroundColor: COLOR_WARNING,
                    color: 'white',
                    font: { family: FONT_FAMILY, size: highlightKey === 'average' ? 13 : 11, weight: 600 },
                    padding: { x: 8, y: 4 },
                    borderRadius: 6,
                  }
                },
                ...(currentTimeIndex !== -1 ? {
                  currentTimeLine: {
                    type: 'line',
                    xMin: currentTimeIndex,
                    xMax: currentTimeIndex,
                    borderColor: COLOR_INFO,
                    borderWidth: 1.5,
                    borderDash: [4, 4],
                    label: {
                      content: 'Nå',
                      display: true,
                      position: 'start',
                      backgroundColor: COLOR_INFO,
                      color: 'white',
                      font: { family: FONT_FAMILY, size: 11, weight: 600 },
                      padding: { x: 8, y: 4 },
                      borderRadius: 6,
                    }
                  }
                } : {}),
                // Connects the lowest and highest points with a labeled bracket
                // when the "Difference" card is selected, so the gap itself is
                // visible on the chart, not just the two endpoints.
                ...(highlightKey === 'difference' && minIndex !== -1 && maxIndex !== -1 ? {
                  differenceLine: {
                    type: 'line',
                    xMin: minIndex,
                    xMax: maxIndex,
                    yMin: minPrice,
                    yMax: maxPrice,
                    borderColor: COLOR_ACCENT,
                    borderWidth: 2,
                    borderDash: [4, 4],
                    label: {
                      content: `Forskjell: ${(maxPrice - minPrice).toFixed(2)} kr/kWh`,
                      display: true,
                      position: 'center',
                      backgroundColor: COLOR_ACCENT,
                      color: 'white',
                      font: { family: FONT_FAMILY, size: 12, weight: 600 },
                      padding: { x: 8, y: 4 },
                      borderRadius: 6,
                    }
                  }
                } : {})
              }
            }
          },
          scales: {
            y: {
              beginAtZero: false,
              border: { display: false },
              grid: { color: GRID_LINE_COLOR },
              ticks: {
                font: { family: FONT_FAMILY, size: 11 },
                color: AXIS_LABEL_COLOR,
                callback: (value) => Number(value).toFixed(2),
              },
            },
            x: {
              border: { display: false },
              grid: { display: false },
              ticks: {
                font: { family: FONT_FAMILY, size: 11 },
                color: AXIS_LABEL_COLOR,
                maxRotation: 0,
                autoSkip: true,
                maxTicksLimit: 8,
              },
            }
          }
        }
      });
    } catch (error) {
      console.error('Error creating chart:', error);
    }
  }

  // Repaint the already-rendered chart (no refetch needed) whenever the user
  // changes the accent color or toggles light/dark, so it never shows a stale color.
  const { accent } = useAccent();
  const { currentTheme } = useTheme();
  watch([accent, currentTheme], () => {
    if (lastCanvasEl && lastPrices.length) {
      createChart(lastCanvasEl, lastPrices);
    }
  });

  // Called when a PriceSummary card is clicked - re-renders the chart with
  // that point (or the average line) drawn larger/thicker so it's clearly
  // highlighted. Passing null clears the highlight.
  function setHighlight(key: HighlightKey | null) {
    highlightKey = key;
    if (lastCanvasEl && lastPrices.length) {
      createChart(lastCanvasEl, lastPrices);
    }
  }

  // Clean up chart on component unmount
  onUnmounted(() => {
    if (chartInstance) {
      chartInstance.destroy();
    }
  });

  return {
    chartCanvas,
    createChart,
    setHighlight,
  }
}
