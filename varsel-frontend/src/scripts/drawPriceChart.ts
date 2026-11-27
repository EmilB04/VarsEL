import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  LineController,
  Tooltip,
  Filler,
} from 'chart.js';
import annotationPlugin from 'chartjs-plugin-annotation';
import type { Price } from './TableScript';
import type { HighlightKey } from './ChartScript';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  LineController,
  Tooltip,
  Filler,
  annotationPlugin,
);

function hexToRgbTuple(hex: string): string {
  const match = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!match?.[1] || !match[2] || !match[3]) return '0, 217, 192';
  return `${parseInt(match[1], 16)}, ${parseInt(match[2], 16)}, ${parseInt(match[3], 16)}`;
}

export function drawPriceChart(
  canvasEl: HTMLCanvasElement,
  prices: Price[],
  highlightKey: HighlightKey | null,
  currentTimeIndex: number,
  locale: string,
  labelsForChart: { unit: string; now: string; average: string; difference: string },
) {
  const ctx = canvasEl.getContext('2d');
  if (!ctx) return null;

  const labels = prices.map((price) => {
    const timeStr = price.time_start || '';
    return timeStr.length >= 16 ? timeStr.slice(11, 16) : timeStr;
  });
  const data = prices.map((price) =>
    typeof price.NOK_per_kWh === 'number' ? price.NOK_per_kWh : parseFloat(price.NOK_per_kWh) || 0,
  );

  // Calculate min, max, and average
  const minPrice = Math.min(...data);
  const maxPrice = Math.max(...data);
  const avgPrice = data.reduce((sum, price) => sum + price, 0) / data.length;

  // Find indices of min and max prices
  const minIndex = data.indexOf(minPrice);
  const maxIndex = data.indexOf(maxPrice);

  const number = new Intl.NumberFormat(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const chartStyle = getComputedStyle(canvasEl);
  const axisColor = chartStyle.getPropertyValue('--chart-axis').trim();
  const gridColor = chartStyle.getPropertyValue('--chart-grid').trim();
  const panelColor = chartStyle.getPropertyValue('--surface-card').trim();
  const font = chartStyle.getPropertyValue('--ui-font').trim();
  const dataFont = chartStyle.getPropertyValue('--data-font').trim();
  const averageColor = chartStyle.getPropertyValue('--warning-ink').trim();
  const lowColor = chartStyle.getPropertyValue('--positive-ink').trim();
  const highColor = chartStyle.getPropertyValue('--danger-ink').trim();

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

  const primaryColor = chartStyle.getPropertyValue('--q-primary').trim() || '#14634c';
  const primaryRgb = hexToRgbTuple(primaryColor);
  const pointRadius = data.map((_, index) => {
    if (isPointHighlighted(index)) return 9;
    if (index === minIndex || index === maxIndex || index === currentTimeIndex) return 4.5;
    return 0;
  });
  const pointBorderWidth = data.map((_, index) => (isPointHighlighted(index) ? 4 : 2));
  const pointColor = data.map((_, index) => {
    if (index === minIndex) return lowColor;
    if (index === maxIndex) return highColor;
    if (index === currentTimeIndex) return primaryColor;
    return primaryColor;
  });

  return new ChartJS(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [
        {
          label: labelsForChart.unit,
          data: data,
          borderColor: primaryColor,
          backgroundColor: (context) => {
            const { ctx: gradientCtx, chartArea } = context.chart;
            if (!chartArea) return `rgba(${primaryRgb}, 0.15)`;
            const gradient = gradientCtx.createLinearGradient(
              0,
              chartArea.top,
              0,
              chartArea.bottom,
            );
            gradient.addColorStop(0, `rgba(${primaryRgb}, 0.18)`);
            gradient.addColorStop(1, `rgba(${primaryRgb}, 0)`);
            return gradient;
          },
          borderWidth: 2.5,
          stepped: 'after',
          fill: true,
          pointBackgroundColor: pointColor,
          pointBorderColor: panelColor,
          pointBorderWidth,
          pointRadius,
          pointHoverRadius: 7,
          pointHoverBorderWidth: 2,
        },
      ],
    },
    options: {
      responsive: true,
      animation: window.matchMedia('(prefers-reduced-motion: reduce)').matches
        ? false
        : { duration: 220 },
      maintainAspectRatio: false,
      interaction: {
        mode: 'index',
        intersect: false,
      },
      plugins: {
        tooltip: {
          backgroundColor: '#17362b',
          titleColor: '#ffffff',
          bodyColor: '#e2e8f0',
          borderColor: 'rgba(255, 255, 255, 0.08)',
          borderWidth: 1,
          padding: 12,
          cornerRadius: 12,
          displayColors: false,
          titleFont: { family: font, size: 13, weight: 600 },
          bodyFont: { family: dataFont, size: 13 },
          callbacks: {
            title(items) {
              const price = prices[items[0]?.dataIndex ?? -1];
              return price
                ? `${price.time_start.slice(11, 16)}–${price.time_end.slice(11, 16)}`
                : '';
            },
            label(item) {
              return `${number.format(item.parsed.y ?? 0)} ${labelsForChart.unit}`;
            },
          },
        },

        annotation: {
          annotations: {
            averageLine: {
              type: 'line',
              yMin: avgPrice,
              yMax: avgPrice,
              borderColor: averageColor,
              borderWidth: highlightKey === 'average' ? 3 : 1.5,
              borderDash: highlightKey === 'average' ? [] : [6, 4],
              label: {
                content: `${labelsForChart.average}: ${number.format(avgPrice)}`,
                display: true,
                position: 'end',
                backgroundColor: panelColor,
                borderColor: averageColor,
                borderWidth: 1,
                color: averageColor,
                font: {
                  family: font,
                  size: highlightKey === 'average' ? 13 : 11,
                  weight: 600,
                },
                padding: { x: 8, y: 4 },
                borderRadius: 6,
              },
            },
            ...(currentTimeIndex !== -1
              ? {
                  currentTimeLine: {
                    type: 'line',
                    xMin: currentTimeIndex,
                    xMax: currentTimeIndex,
                    borderColor: primaryColor,
                    borderWidth: 1.5,
                    borderDash: [4, 4],
                    label: {
                      content: labelsForChart.now,
                      display: true,
                      position: 'start',
                      backgroundColor: panelColor,
                      borderColor: primaryColor,
                      borderWidth: 1,
                      color: primaryColor,
                      font: { family: font, size: 11, weight: 600 },
                      padding: { x: 8, y: 4 },
                      borderRadius: 6,
                    },
                  },
                }
              : {}),
            // Connects the lowest and highest points with a labeled bracket
            // when the "Difference" card is selected, so the gap itself is
            // visible on the chart, not just the two endpoints.
            ...(highlightKey === 'difference' && minIndex !== -1 && maxIndex !== -1
              ? {
                  differenceLine: {
                    type: 'line',
                    xMin: minIndex,
                    xMax: maxIndex,
                    yMin: minPrice,
                    yMax: maxPrice,
                    borderColor: primaryColor,
                    borderWidth: 2,
                    borderDash: [4, 4],
                    label: {
                      content: `${labelsForChart.difference}: ${number.format(maxPrice - minPrice)}`,
                      display: true,
                      position: 'center',
                      backgroundColor: panelColor,
                      borderColor: primaryColor,
                      borderWidth: 1,
                      color: primaryColor,
                      font: { family: font, size: 12, weight: 600 },
                      padding: { x: 8, y: 4 },
                      borderRadius: 6,
                    },
                  },
                }
              : {}),
          },
        },
      },
      scales: {
        y: {
          beginAtZero: false,
          border: { display: false },
          grid: { color: gridColor },
          ticks: {
            font: { family: dataFont, size: 11 },
            color: axisColor,
            callback: (value) => number.format(Number(value)),
          },
        },
        x: {
          border: { display: false },
          grid: { color: gridColor, drawTicks: false },
          ticks: {
            font: { family: dataFont, size: 11 },
            color: axisColor,
            maxRotation: 0,
            autoSkip: true,
            maxTicksLimit: 8,
          },
        },
      },
    },
  });
}
