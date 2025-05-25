<script>
  import { onMount } from "svelte";
  import { io } from "socket.io-client";
  import "./View.css";
  import NavBar from "./Nav.svelte";

  let prices = [];
  let selectedCategory = "A";
  let displayText = "";
  let bestDeals = {};
  let lastUpdated = "";

  const categoryNames = {
    A: "SEPHORA",
    B: "FOOTLOCKER",
    C: "NIKE",
    D: "VANILLA",
    E: "VISA",
    F: "STEAM",
    G: "XBOX",
    H: "APPLE",
    I: "Amazon",
  };

  const categories = Object.keys(categoryNames);
  let isAuthenticated = false;

  onMount(() => {
    const authStatus = localStorage.getItem("authenticated");
    if (authStatus === "true") {
      isAuthenticated = true;
      fetchCategoryPrices(selectedCategory);
      setupSocket();

      const interval = setInterval(() => {
        fetchCategoryPrices(selectedCategory);
      }, 10 * 60 * 1000);

      return () => clearInterval(interval);
    } else {
      isAuthenticated = false;
    }
  });

  function updateLastUpdated() {
    const now = new Date();
    lastUpdated = now.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  }

  function formatTierLabel(tier) {
    const map = {
      under25: "Under $25",
      over25: "$25+",
      over50: "$50+",
      over90: "$90+"
    };
    return map[tier] || tier.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/\d+/, (m) => ` ${m}`);
  }

  async function fetchCategoryPrices(category) {
    try {
      const res = await fetch(`http://localhost:3000/api/prices/${category}`);
      if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
      const data = await res.json();

      const openPrices = data.filter((row) => row.status !== "close");

      let tiers = [];
      if (openPrices.length > 0) {
        const excludeKeys = ["name", "status"];
        const allKeys = new Set();
        openPrices.forEach(row => {
          Object.keys(row).forEach(key => {
            if (!excludeKeys.includes(key)) {
              allKeys.add(key);
            }
          });
        });
        tiers = Array.from(allKeys);
      }

      bestDeals = {};
      tiers.forEach((tier) => {
        const best = openPrices.reduce(
          (max, curr) =>
            curr[tier] > (max?.[tier] || -Infinity) ? curr : max,
          null
        );
        if (best) {
          bestDeals[tier] = best;
        }
      });

      prices = data;
      displayText = `Showing best deals for ${categoryNames[category]}`;
      updateLastUpdated();
    } catch (error) {
      console.error("Error fetching:", error);
      displayText = `Error fetching "${category}" data.`;
      bestDeals = {};
      prices = [];
    }
  }

  function setupSocket() {
    const socket = io("http://localhost:3000");
    socket.on("pricesUpdated", (update) => {
      if (update.category === selectedCategory) {
        fetchCategoryPrices(selectedCategory);
      }
    });
  }

  function selectCategory(cat) {
    selectedCategory = cat;
    fetchCategoryPrices(cat);
  }
</script>

{#if !isAuthenticated}
  <p>Please log in to view the content.</p>
{:else}
  <NavBar />

  <div class="scroll-wrapper">
    <main class="container">
      <div class="price-info">{displayText}</div>

      <div class="category-container">
        {#each categories as cat}
          <button
            class:selected={selectedCategory === cat}
            on:click={() => selectCategory(cat)}
          >
            {categoryNames[cat]}
          </button>
        {/each}
      </div>

      <p class="updated-time">Last updated at: {lastUpdated}</p>

      {#if Object.keys(bestDeals).length}
        <div class="best-deal-summary">
          <h2>{categoryNames[selectedCategory]} RATE</h2>
          <ul>
            {#each Object.entries(bestDeals) as [tier, deal]}
              <li>
                <strong>{formatTierLabel(tier)}</strong>
                <span class="deal-line">
                  ¥{deal[tier]} /
                  <em class="deal-name">{deal.name || "-"}</em>
                </span>
              </li>
            {/each}
          </ul>
        </div>
      {/if}
    </main>
  </div>
{/if}
