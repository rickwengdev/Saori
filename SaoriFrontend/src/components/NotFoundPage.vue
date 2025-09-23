<template>
    <div class="not-found-container">
      <h1 class="not-found-title">404</h1>
      <p class="not-found-message">Oops! The page you're looking for doesn't exist.</p>
      <button @click="goHome" class="back-home-button">Back to Home</button>
    </div>
  </template>
  
  <script>
  export default {
    methods: {
      goHome() {
        this.$router.push({ name: 'home' }); // 導航到主頁
      },
    },
  };
  </script>
  
  <style scoped>
  .not-found-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    height: 100vh;
    background-color: #f8f9fa;
    color: #6c757d;
    font-family: Arial, sans-serif;
  }
  
  .not-found-title {
    font-size: 8rem;
    font-weight: bold;
    margin: 0;
    color: #dc3545;
  }
  
  .not-found-message {
    font-size: 1.5rem;
    margin: 1rem 0;
  }
  
  .back-home-button {
    padding: 10px 20px;
    font-size: 1rem;
    border: none;
    border-radius: 5px;
    background-color: #007bff;
    color: #ffffff;
    cursor: pointer;
    transition: background-color 0.3s ease;
  }
  
  .back-home-button:hover {
    background-color: #0056b3;
  }
  </style>