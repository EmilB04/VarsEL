import { ref, onUnmounted } from 'vue'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  LineController,
  Title,
  Tooltip,
  Legend,
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
  Title,
  Tooltip,
  Legend,
  Filler,
  annotationPlugin
)

// Composable for chart functionality
export function useChartServices() {
  const chartCanvas = ref<HTMLCanvasElement | null>(null)
  let chartInstance: ChartJS | null = null

  // Function to create the price chart
  function createChart(prices: Price[]) {
    if (!chartCanvas.value || prices.length === 0) {
      return;
    }

    // Destroy existing chart if it exists
    if (chartInstance) {
      chartInstance.destroy();
    }

    const ctx = chartCanvas.value.getContext('2d');
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

    try {
      chartInstance = new ChartJS(ctx, {
        type: 'line',
        data: {
          labels: labels,
          datasets: [{
            label: 'Pris (kr/kWh)',
            data: data,
            borderColor: 'rgb(75, 192, 192)',
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            tension: 0.1,
            fill: true,
            pointBackgroundColor: data.map((price, index) => {
              if (index === minIndex) return 'green';
              if (index === maxIndex) return 'red';
              if (index === currentTimeIndex) return 'blue';
              return 'rgb(75, 192, 192)';
            }),
            pointBorderColor: data.map((price, index) => {
              if (index === minIndex) return 'darkgreen';
              if (index === maxIndex) return 'darkred';
              if (index === currentTimeIndex) return 'darkblue';
              return 'rgb(75, 192, 192)';
            }),
            pointRadius: data.map((price, index) => {
              if (index === minIndex || index === maxIndex) return 8;
              if (index === currentTimeIndex) return 10;
              return 4;
            }),
            pointBorderWidth: data.map((price, index) => {
              if (index === currentTimeIndex) return 3;
              return 1;
            })
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            title: {
              display: true,
              text: 'Strømpriser gjennom dagen'
            },
            legend: {
              display: true
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  const value = context.parsed.y.toFixed(2);
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
                  borderColor: 'orange',
                  borderWidth: 2,
                  borderDash: [5, 5],
                  label: {
                    content: `Gjennomsnitt: ${avgPrice.toFixed(2)} kr/kWh`,
                    display: true,
                    position: 'end',
                    backgroundColor: 'orange',
                    color: 'white',
                    padding: 4
                  }
                },
                ...(currentTimeIndex !== -1 ? {
                  currentTimeLine: {
                    type: 'line',
                    xMin: currentTimeIndex,
                    xMax: currentTimeIndex,
                    borderColor: 'blue',
                    borderWidth: 2,
                    borderDash: [3, 3],
                    label: {
                      content: 'Nå',
                      display: true,
                      position: 'start',
                      backgroundColor: 'blue',
                      color: 'white',
                      padding: 4
                    }
                  }
                } : {})
              }
            }
          },
          scales: {
            y: {
              beginAtZero: false,
              title: {
                display: true,
                text: 'Pris (kr/kWh)'
              }
            },
            x: {
              title: {
                display: true,
                text: 'Tid'
              }
            }
          }
        }
      });
    } catch (error) {
      console.error('Error creating chart:', error);
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
    createChart
  }
}
