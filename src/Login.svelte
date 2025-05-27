<script>
  import { onMount } from 'svelte';

  let username = '';
  let password = '';
  let errorMessage = '';
  let typedText = '';
  let currentWord = 0;

  const greetingText = "Welcome to WT PRICE. THIS APPLICATION ATIMS FOR CHECKING PRICE RATE.";

  function typeText() {
    let index = 0;
    typedText = '';
    currentWord = 0;

    const words = greetingText.split(' ');

    const typingInterval = setInterval(() => {
      typedText += words[currentWord][index];

      if (index === words[currentWord].length - 1) {
        index = 0;
        currentWord++;
        typedText += ' ';

        if (currentWord % 3 === 0) {
          typedText += '<br />';
        }
      } else {
        index++;
      }

      if (currentWord === words.length) {
        clearInterval(typingInterval);
      }
    }, 100);
  }

  onMount(() => {
    typeText();
  });

  function handleLogin() {
    if (username === 'admin' && password === 'password123') {
      localStorage.setItem('authenticated', 'true');
      window.location.href = '/#/';
    } else {
      errorMessage = 'Invalid username or password';
    }
  }
</script>

<style>
  /* Background wrapper only for login page */
  .login-page-wrapper {
    height: 100vh;
    background: linear-gradient(to right, black 50%, yellow 50%);
    display: flex;
    justify-content: center;
    align-items: center;
    font-family: "Rubik", sans-serif;
    margin: 0;
  }

  .title {
    color: white;
    font-size: 50px;
    font-weight: bold;
    margin-bottom: 30px;
    text-align: center;
  }

  .login-container {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .greeting-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    margin-right: 30px;
  }

  .greeting-text {
    color: #ffffff;
    font-size: 28px;
    margin-top: 20px;
    text-align: center;
    font-weight: 600;
    white-space: nowrap;
    overflow: hidden;
    font-family: 'Courier New', Courier, monospace;
    letter-spacing: 0.5rem;
  }

  .greeting-section img {
    max-width: 250px;
    border-radius: 8px;
  }

  .login-wrapper {
    background-color: white;
    padding: 40px;
    border-radius: 12px;
    width: 100%;
    max-width: 400px;
    box-sizing: border-box;
    border: 2px solid #333;
  }

  h2 {
    text-align: center;
    color: #333;
    margin-bottom: 30px;
    font-size: 30px;
    font-weight: 700;
  }

  input {
    width: 100%;
    padding: 14px;
    margin-bottom: 20px;
    border: 2px solid #333;
    border-radius: 8px;
    font-size: 16px;
    transition: border-color 0.3s;
  }

  input:focus {
    border-color: #000000;
    outline: none;
  }

  .error {
    color: red;
    font-size: 14px;
    margin-bottom: 10px;
    text-align: center;
  }

  button {
    width: 100%;
    padding: 14px;
    background-color: #000000;
    color: white;
    border: 2px solid #333;
    border-radius: 8px;
    font-size: 16px;
    cursor: pointer;
    transition: background-color 0.2s ease;
    font-weight: 600;
  }

  button:hover {
    background-color: #ff2525;
  }

  .footer {
    margin-top: 20px;
    text-align: center;
    font-size: 13px;
    color: #888;
  }
</style>

<div class="login-page-wrapper">
  <div>
    <!-- Simple Title -->
    <div class="title">WT PRICE</div>

    <div class="login-container">
      <!-- Greeting section -->
      <div class="greeting-section">
        <img src="./src/image.png" alt="Cyborg" aria-hidden="true" />
        <div class="greeting-text">
          {@html typedText}
        </div>
      </div>

      <!-- Login form -->
      <div class="login-wrapper">
        <h2>LOG-IN</h2>
        <form on:submit|preventDefault={handleLogin}>
          <input
            type="text"
            placeholder="Username"
            bind:value={username}
            required
          />
          <input
            type="password"
            placeholder="Password"
            bind:value={password}
            required
          />
          {#if errorMessage}
            <div class="error">{errorMessage}</div>
          {/if}
          <button type="submit">Login</button>
        </form>

        <div class="footer"></div>
      </div>
    </div>
  </div>
</div>
