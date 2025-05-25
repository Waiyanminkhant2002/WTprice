<script>
  import Router from 'svelte-spa-router';
  import TopLayer from './View.svelte';
  import EditableTable from './EditableTable.svelte';
  import Login from './Login.svelte';
  import { onMount } from 'svelte';

  let isAuthenticated = false;
  let authChecked = false;

  onMount(() => {
    isAuthenticated = localStorage.getItem('authenticated') === 'true';
    authChecked = true;

    if (!isAuthenticated && window.location.hash !== '#/login') {
      window.location.href = '/#/login';
    }
  });

  const routes = {
    '/': TopLayer,
    '/edit': EditableTable,
    '/login': Login
  };
</script>

<!-- 👇 Remove or comment out this block if you don’t want route links visible -->
<!--
<nav>
  <a href="#/">Top Layer</a>
  <a href="#/edit">Editable Table</a>
  <a href="#/login">Login</a>
</nav>
-->

{#if authChecked}
  <Router {routes} />
{:else}
  <p>Loading...</p>
{/if}
