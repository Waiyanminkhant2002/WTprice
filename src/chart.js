import Chart from "chart.js/auto";

let chart;
let chartCanvas; // bind this to your canvas in Svelte

function createOrUpdateChart(hourlyHighs, selectedCategory, categoryNames) {
  if (!chartCanvas) return;

  // Get data points for selected category
  const dataPointsObj = hourlyHighs[selectedCategory] || {};

  // Sort keys (timestamps) ascending
  const sortedKeys = Object.keys(dataPointsObj).sort();

  // Prepare labels and values arrays for Chart.js
  const labels = sortedKeys.map((isoString) => {
    const date = new Date(isoString);
    // Format label like "HH:mm"
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });
  });

  const dataValues = sortedKeys.map((key) => dataPointsObj[key]);

  if (chart) {
    // Update existing chart data and labels
    chart.data.labels = labels;
    chart.data.datasets[0].data = dataValues;
    chart.data.datasets[0].label = `${categoryNames[selectedCategory]} Highest Price per 10 Minutes (¥)`;
    chart.update();
  } else {
    // Create new chart instance
    chart = new Chart(chartCanvas, {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: `${categoryNames[selectedCategory]} Highest Price per 10 Minutes (¥)`,
            data: dataValues,
            fill: false,
            borderColor: "rgba(75, 192, 192, 1)",
            backgroundColor: "rgba(75, 192, 192, 0.4)",
            tension: 0.3,
            pointRadius: 5,
            pointHoverRadius: 7,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: "Price (¥)",
              font: { size: 14, weight: "bold" },
              color: "#666",
            },
            grid: { color: "rgba(200, 200, 200, 0.3)" },
            ticks: { font: { size: 12 }, color: "#444" },
          },
          x: {
            title: {
              display: true,
              text: "Time (UTC)",
              font: { size: 14, weight: "bold" },
              color: "#666",
            },
            grid: { color: "rgba(200, 200, 200, 0.3)" },
            ticks: { font: { size: 12 }, color: "#444", maxRotation: 45, minRotation: 45 },
          },
        },
        plugins: {
          legend: {
            display: true,
            labels: { color: "#333", font: { size: 14, weight: "bold" } },
          },
        },
      },
    });
  }
}
