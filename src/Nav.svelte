<script lang="ts">
  import { onMount } from "svelte";

  let isAuthenticated: boolean = false;

  onMount(() => {
    isAuthenticated = localStorage.getItem("authenticated") === "true";
  });

  function logout(): void {
    localStorage.removeItem("authenticated");
    window.location.href = "/#/login";
  }
</script>

<nav class="navbar">
  <div class="logo">WT PRICE</div>

  {#if isAuthenticated}
    <div class="nav-right">
      <a href="/#/edit" class="nav-link">ADMIN</a>
      <button class="logout-btn" on:click={logout}>LOGOUT</button>
    </div>
  {/if}
</nav>

<style>
  .navbar {
    background-color: #000;
    color: white;
    padding: 15px 30px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-family: 'Poppins', sans-serif;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }

  .logo {
    font-weight: bold;
    font-size: 22px;
  }

  .nav-right {
    display: flex;
    align-items: center;
    gap: 20px;
  }

  .nav-link,
  .logout-btn {
    color: white;
    font-size: 16px;
    font-weight: 500;
    text-decoration: none;
    background: none;
    border: none;
    cursor: pointer;
    transition: color 0.2s ease;
    padding: 5px 10px;
  }

  .logout-btn:hover,
  .nav-link:hover {
    color: #facc15; /* yellow */
  }
</style>
