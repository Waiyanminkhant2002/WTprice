<script>
  import { onMount, onDestroy } from "svelte";
  import io from "socket.io-client";

  let data = [];
  let selectedCategory = "A";

  const categoryNames = {
    A: "SEPHORA", B: "FOOTLOCKER", C: "NIKE", D: "VANILLA",
    E: "VISA", F: "STEAM", G: "XBOX", H: "APPLE", I: "Amazon", J: "Visa"
  };

  const categories = Object.keys(categoryNames);

  let columns = [];
  let maxValues = {};
  let lastUpdated = {};
  let formattedTimestamps = {};
  let saving = false;
  let saveMessage = "";
  let saveError = false;

  let socket;

  function formatDateTime(date) {
    return new Intl.DateTimeFormat("en-US", {
      dateStyle: "medium",
      timeStyle: "short"
    }).format(date);
  }

  function updateTimestamp(category) {
    const now = new Date();
    lastUpdated[category] = now;
    formattedTimestamps[category] = formatDateTime(now);
  }

  function calculateMaxValues() {
    for (const col of columns) {
      if (col.key !== "status" && col.key !== "name") {
        maxValues[col.key] = Math.max(...data.map(row => +row[col.key] || 0));
      }
    }
  }

  async function fetchPrices(category) {
    try {
      const res = await fetch(`http://ec2-54-234-157-211.compute-1.amazonaws.com:3000/api/prices/${category}`);
      if (!res.ok) throw new Error(`Failed to fetch prices for category ${category}`);
      const fetchedData = await res.json();

      data = fetchedData.map(item => ({ name: item.name || "", ...item }));

      if (data.length > 0) {
        const exclude = ["id"];
        const dynamicKeys = Object.keys(data[0]).filter(key => !exclude.includes(key));
        const defaultLabels = {
          name: "Name", under25: "Under 25", over25: "Over 25",
          over50: "Over 50", over90: "Over 90", status: "Status"
        };
        columns = dynamicKeys.map(key => ({
          key,
          label: defaultLabels[key] || key
        }));
      } else {
        columns = [];
      }

      calculateMaxValues();
      updateTimestamp(category);
    } catch (e) {
      console.error("Error fetching prices:", e);
      data = [];
      columns = [];
    }
  }

  function debounce(fn, delay) {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), delay);
    };
  }

  async function saveData() {
    saving = true;
    saveMessage = "";
    saveError = false;
    try {
      const res = await fetch(
        `http://ec2-54-234-157-211.compute-1.amazonaws.com:3000/api/prices/${selectedCategory}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }
      );
      if (!res.ok) throw new Error("Failed to save data");
      updateTimestamp(selectedCategory);
      saveMessage = "✅ Data saved successfully!";
    } catch (err) {
      console.error("Save failed", err);
      saveMessage = "❌ Failed to save data";
      saveError = true;
    } finally {
      saving = false;
    }
  }

  const debouncedSaveData = debounce(saveData, 500);

  function handleInput(e, rowIndex, key) {
    const value = e.target.value;
    if (key === "name") {
      data[rowIndex][key] = value;
    } else {
      const parsed = parseFloat(value);
      if (!isNaN(parsed)) {
        data[rowIndex][key] = parsed;
        calculateMaxValues();
      }
    }
    debouncedSaveData();
  }

  function handleCategoryChange(e) {
    selectedCategory = e.target.value;
    fetchPrices(selectedCategory);
  }

  function handleStatusChange(e, rowIndex) {
    const status = e.target.value;
    data[rowIndex].status = status;
    if (status === "close") {
      columns.forEach(col => {
        if (col.key !== "status" && col.key !== "name") {
          data[rowIndex][col.key] = 0;
        }
      });
    }
    calculateMaxValues();
    debouncedSaveData();
  }

  function isMax(value, max) {
    return value === max;
  }

  function getNextId() {
    const rows = data.filter(row => row.id?.startsWith(selectedCategory + "-"));
    const nums = rows.map(row => parseInt(row.id.split("-")[1])).filter(n => !isNaN(n));
    const next = (Math.max(0, ...nums) + 1).toString().padStart(3, "0");
    return `${selectedCategory}-${next}`;
  }

  function addRow() {
    const newRow = {
      id: getNextId(),
      name: "",
      status: "open",
    };
    columns.forEach(col => {
      if (col.key !== "name" && col.key !== "status") {
        newRow[col.key] = 0;
      }
    });
    data = [...data, newRow];
    calculateMaxValues();
    debouncedSaveData();
  }

  function addColumn() {
    const newKey = prompt("Enter new column key (e.g. bonus10):");
    if (!newKey || columns.some(col => col.key === newKey) || !/^[a-zA-Z0-9_]+$/.test(newKey)) {
      alert("Invalid or duplicate column name.");
      return;
    }
    const newLabel = prompt("Enter column label (e.g. Bonus 10):") || newKey;
    columns = [...columns, { key: newKey, label: newLabel }];
    data = data.map(row => ({ ...row, [newKey]: 0 }));
    calculateMaxValues();
    debouncedSaveData();
  }

  function removeRow(index) {
    if (confirm("Delete this row?")) {
      data = data.filter((_, i) => i !== index);
      calculateMaxValues();
      debouncedSaveData();
    }
  }

  function removeColumn(key) {
    if (confirm(`Remove column "${key}"?`)) {
      columns = columns.filter(col => col.key !== key);
      data = data.map(row => {
        const copy = { ...row };
        delete copy[key];
        return copy;
      });
      calculateMaxValues();
      debouncedSaveData();
    }
  }

  onMount(() => {
    socket = io("http://ec2-54-234-157-211.compute-1.amazonaws.com:3000");
    socket.on("connect", () => console.log("Socket connected:", socket.id));
    socket.on("disconnect", () => console.warn("Socket disconnected"));
    socket.on("pricesUpdated", () => fetchPrices(selectedCategory));
    fetchPrices(selectedCategory);
  });

  onDestroy(() => {
    if (socket) socket.disconnect();
  });
</script>

<style>
  .highlight {
    background-color: #d4edda;
  }
  .remove-btn {
    cursor: pointer;
    background: none;
    border: none;
    color: red;
  }
  .status-select.open {
    background-color: #e0f7fa;
  }
  .status-select.close {
    background-color: #ffcdd2;
  }
  .success {
    color: green;
    margin-left: 1rem;
  }
  .error {
    color: red;
    margin-left: 1rem;
  }
  .timestamp {
    font-size: 0.9rem;
    color: #555;
  }
  .save-controls > button {
    margin-right: 0.5rem;
  }
  .table-wrapper {
    overflow-x: auto;
  }
  table {
    border-collapse: collapse;
    width: 100%;
  }
  th, td {
    border: 1px solid #ccc;
    padding: 6px 8px;
    text-align: center;
  }
  input[type="number"], input[type="text"], select {
    width: 100%;
    box-sizing: border-box;
  }
</style>

<div class="container">
  <h2>WELCOME FROM ADMIN PANEL</h2>

  <label for="category">Select Category:</label>
  <select id="category" bind:value={selectedCategory} on:change={handleCategoryChange}>
    {#each categories as cat}
      <option value={cat}>{categoryNames[cat]}</option>
    {/each}
  </select>

  {#if formattedTimestamps[selectedCategory]}
    <p class="timestamp">
      🔄 Last Updated for {categoryNames[selectedCategory]}: {formattedTimestamps[selectedCategory]}
    </p>
  {/if}

  <div class="save-controls">
    <button on:click={saveData} disabled={saving}>
      {saving ? "Saving..." : "💾 Save"}
    </button>
    <button on:click={addRow} disabled={saving}>➕ Add Row</button>
    <button on:click={addColumn} disabled={saving}>➕ Add Column</button>
    {#if saveMessage}
      <span class:success={!saveError} class:error={saveError}>{saveMessage}</span>
    {/if}
  </div>

  <div class="table-wrapper">
    <table>
      <thead>
        <tr>
          <th>ID</th>
          {#each columns as col}
            <th>
              {col.label}
              {#if col.key !== "name" && col.key !== "status"}
                <button class="remove-btn" on:click={() => removeColumn(col.key)}>🗑️</button>
              {/if}
            </th>
          {/each}
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {#each data as row, i}
          <tr>
            <td>{row.id}</td>
            {#each columns as col}
              {#if col.key === "status"}
                <td>
                  <select
                    bind:value={row.status}
                    on:change={(e) => handleStatusChange(e, i)}
                    class="status-select {row.status}"
                  >
                    <option value="open">Open</option>
                    <option value="close">Close</option>
                  </select>
                </td>
              {:else if col.key === "name"}
                <td>
                  <input
                    type="text"
                    bind:value={row.name}
                    on:input={(e) => handleInput(e, i, "name")}
                    disabled={row.status === "close"}
                    placeholder="Enter name"
                  />
                </td>
              {:else}
                <td class:highlight={isMax(row[col.key], maxValues[col.key])}>
                  <input
                    type="number"
                    step="0.01"
                    bind:value={row[col.key]}
                    on:input={(e) => handleInput(e, i, col.key)}
                    disabled={row.status === "close"}
                  />
                </td>
              {/if}
            {/each}
            <td><button class="remove-btn" on:click={() => removeRow(i)}>🗑️</button></td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</div>

