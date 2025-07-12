<template>
  <div class="hello">
    <h1>Happy 1 year, Lauren ❤️❤️</h1>
    <p>{{ loveMessage }}</p>

    <!-- Love Letter Dropdown Section -->
    <div>
      <button @click="toggleDropdown">
        <h3 v-if="!isDropdownOpen">Click to Read My Love Letter</h3>
        <h3 v-if="isDropdownOpen">My Love Letter to You</h3>
      </button>

      <div v-if="isDropdownOpen" class="dropdown-content">
        <p>
          My Dearest Lauren, <br><br>
          I want you to know how much you mean to me. Every moment with you has been filled with love, joy, and happiness. From the very first day we met, I knew my life was about to change in the most beautiful way. ❤️ <br><br>
          Thank you for being the most amazing person in my life. I'm beyond grateful for your love and support, and I can't wait to spend many more wonderful moments together. ❤️ <br><br>
          Forever yours, <br><br>
          [Your Name]
        </p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      loveMessage: '',  // Store the translated message here
      isDropdownOpen: false,
    };
  },
  created() {
    // Call fetchLoveMessage when the component is created
    this.fetchLoveMessage();
  },
  methods: {
    toggleDropdown() {
      this.isDropdownOpen = !this.isDropdownOpen;
    },
    async fetchLoveMessage() {
      try {
        // Use the correct API Gateway URL for your Lambda function
        const response = await fetch('https://0iumgzsw35.execute-api.us-east-2.amazonaws.com/lovestage/love-message');
        const data = await response.json();
        this.loveMessage = data.message;  // Store the translated message
      } catch (error) {
        console.error('Error fetching love message:', error);
      }
    }
  }
};
</script>

<style scoped>
h1 {
  font-size: 2rem;
}

button {
  background: #42b983;
  color: white;
  padding: 10px;
  border: none;
  cursor: pointer;
}

h3 {
  margin: 10px 0;
}

.dropdown-content {
  margin-top: 20px;
  padding: 20px;
  background-color: #f9f9f9;
  border: 1px solid #ddd;
  border-radius: 5px;
}

.dropdown-content p {
  font-size: 16px;
  line-height: 1.5;
}
</style>
