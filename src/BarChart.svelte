<script>
  import { onMount } from "svelte";
  import Chart from "chart.js/auto";

  export let data = {};
  export let title = "";

  let canvas;
  let chart;

  const tierLabels = {
    under25: "Under $25",
    over25: "$25+",
    over50: "$50+",
    over90: "$90+",
  };

  // Dynamically generate chart data
  $: chartData = {
    labels: Object.keys(data).map((tier) => tierLabels[tier] || tier),
    datasets: [
      {
        label: title,
        data: Object.keys(data).map((tier) =>
          data[tier] && data[tier][tier] ? data[tier][tier] : 0
        ),
        backgroundColor: [
          "rgba(255, 99, 132, 0.6)",
          "rgba(54, 162, 235, 0.6)",
          "rgba(255, 206, 86, 0.6)",
          "rgba(75, 192, 192, 0.6)",
        ],
        borderColor: [
          "rgba(255, 99, 132, 1)",
          "rgba(54, 162, 235, 1)",
          "rgba(255, 206, 86, 1)",
          "rgba(75, 192, 192, 1)",
        ],
        borderWidth: 2,
        borderRadius: 6,
      },
    ],
  };

  // Initialize chart
  onMount(() => {
    if (canvas) {
      chart = new Chart(canvas, {
        type: "bar",
        data: chartData,
        options: {
          responsive: true,
          plugins: {
            legend: {
              display: true,
              labels: {
                color: "#333",
                font: {
                  size: 14,
                  weight: "bold",
                },
              },
            },
            tooltip: {
              callbacks: {
                label: function (context) {
                  const deal = data[Object.keys(data)[context.dataIndex]];
                  return `¥${context.raw} (${deal?.id || "-"})`;
                },
              },
            },
            title: {
              display: true,
              text: title,
              color: "#222",
              font: {
                size: 18,
                weight: "bold",
              },
              padding: {
                top: 10,
                bottom: 20,
              },
            },
          },
          scales: {
            x: {
              ticks: {
                color: "#444",
                font: {
                  size: 13,
                  weight: 500,
                },
              },
              grid: {
                display: false,
              },
            },
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: "Rate (¥)",
                color: "#444",
                font: {
                  size: 14,
                  weight: 500,
                },
              },
              ticks: {
                color: "#444",
              },
              grid: {
                color: "#eee",
              },
            },
          },
        },
      });
    }
  });

  // Update chart on reactive change
  $: if (chart) {
    chart.data = chartData;
    chart.update();
  }
</script>

<div class="chart-wrapper">
  <canvas bind:this={canvas}></canvas>
</div>

<style>
  .chart-wrapper {
    max-width: 700px;
    margin: 1.5rem auto;
    background-color: #fefefe;
    padding: 1rem 1.5rem;
    border-radius: 16px;
    box-shadow: 0 6px 18px rgba(0, 0, 0, 0.08);
    border: 1px solid #eee;
  }

  canvas {
    width: 100% !important;
    height: auto !important;
  }
</style>
