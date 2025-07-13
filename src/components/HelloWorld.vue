<template>
  <div id="app">
    <transition name="slide-out">
      <div v-if="!showMainContent" class="landing-page" @touchstart="handleTouchStart" @touchend="handleTouchEnd">
        <!-- Chat animation container -->
        <div class="chat-container">
          <transition name="fade-up">
            <div v-if="showMyTypingIndicator" class="chat-bubble sent typing">
              <span></span><span></span><span></span>
            </div>
          </transition>
          <transition name="fade-up">
            <div v-if="showFirstHey" class="chat-bubble sent">Hey</div>
          </transition>
          <transition name="fade-up">
            <div v-if="showLaurenTypingIndicator" class="chat-bubble received typing">
              <span></span><span></span><span></span>
            </div>
          </transition>
          <transition name="fade-up">
            <div v-if="showSecondHey" class="chat-bubble received">hey</div>
          </transition>
           <transition name="fade-up">
            <div v-if="showMySecondTypingIndicator" class="chat-bubble sent typing">
              <span></span><span></span><span></span>
            </div>
          </transition>
          <transition name="fade-up">
            <div v-if="showThirdMessage" class="chat-bubble sent">What car do you drive I'm curious</div>
          </transition>
        </div>

        <!-- Original landing page content, now animated to appear after the chat -->
        <transition name="fade">
          <div v-if="showLandingContent" class="landing-content-wrapper">
            <h1>Can you believe it?</h1>
            <button class="arrow-btn" @click="showMainPage">
              <span>&#8593;</span>
            </button>
          </div>
        </transition>
      </div>
    </transition>

    <transition name="fade" mode="out-in">
      <!-- This wrapper div allows the canvas and content to be siblings -->
      <div v-if="showMainContent">
        <!-- Canvas for the fireworks animation is now a sibling to the main content -->
        <canvas id="fireworks-canvas"></canvas>
        
        <!-- Weather Display - Moved outside of main-content to be positioned correctly -->
        <div v-if="weather.temp" class="weather-container">
          <img :src="weather.iconUrl" alt="Weather icon">
          <div class="weather-details">
            <p>{{ weather.temp }}&deg;F in Chicago</p>
            <p class="weather-description">{{ weather.description }}</p>
          </div>
        </div>

        <div class="main-content">
          <img alt="Vue logo" src="https://cdn-icons-gif.flaticon.com/15600/15600693.gif" style="width: 150px; height: auto;">
          <h1>{{ greetingMessage }}</h1>

          <p @click="toggleText" :class="{'fade': isFading}">
            {{ loveMessage }}
          </p>

          <!-- Button container -->
          <div class="button-container">
            <button @click="toggleScroll" ref="letterButton">
              <h3 v-if="!isDropdownOpen">Click to Read My Love Letter</h3>
              <h3 v-if="isDropdownOpen">Hide My Love Letter</h3>
            </button>
            <button @click="openAlbum">
              <h3>Our Photo Album</h3>
            </button>
            <!-- New Button for Notifications -->
            <button @click="subscribeToNotifications" :disabled="isSubscribed">
              <h3>{{ isSubscribed ? 'Notifications On' : 'Enable Notifications' }}</h3>
            </button>
          </div>

          <div v-show="isDropdownOpen" class="dropdown-content" ref="letterContent">
            <p>
              My Dearest Lauren, <br><br>
              This past year with you has truly been the best year of my life. Every moment has been filled with more love, joy, and happiness than I could have ever imagined. From the very first day I saw you, I knew my life was about to change in the most beautiful way. <br><br>
              Thank you for being the most amazing person in my life. I'm beyond grateful for your love, support and kisses, and I can't wait to spend many more wonderful years together. This website will be online forever as a testament to our love, and I'll be making regular updates to celebrate our journey. <br><br>
              I Love you so much bae, never change. <br><br>
              Forever yours, <br><br>
              Ethan Long
            </p>
          </div>

          <!-- Quote of the Day Section -->
          <div v-if="quote.text" class="quote-container">
            <p class="quote-text">"{{ quote.text }}"</p>
            <p class="quote-author">- {{ quote.author }}</p>
          </div>
          <div v-if="isLoadingQuote" class="loading-quote">
            <p>Generating a special message for you...</p>
          </div>

        </div>
        
        <!-- Photo Album Modal -->
        <transition name="fade">
          <div v-if="showAlbum" class="album-modal" @click.self="closeAlbum">
            <div class="album-content">
              <button class="close-album-btn" @click="closeAlbum">&times;</button>
              <h2>Our Love</h2>
              <div v-if="isLoadingPhotos" class="loading-photos">Loading photos...</div>
              <div v-else class="photo-grid">
                <div v-for="(photo, index) in photos" :key="index" class="photo-item">
                  <img :src="photo.url" :alt="photo.caption || 'A photo of us'">
                  <p v-if="photo.caption">{{ photo.caption }}</p>
                </div>
              </div>
            </div>
          </div>
        </transition>

      </div>
    </transition>
  </div>
</template>

<script>
export default {
  data() {
    return {
      greetingMessage: 'Loading...',
      loveMessage: 'Loading...',
      translatedMessage: '',
      language: '',
      isFading: false,
      isDropdownOpen: false,
      showMainContent: false,
      touchStartY: 0,
      animationFrameId: null, 
      fireworksLaunched: 0,
      maxFireworks: 5,
      showMyTypingIndicator: false,
      showFirstHey: false,
      showLaurenTypingIndicator: false,
      showSecondHey: false,
      showMySecondTypingIndicator: false,
      showThirdMessage: false,
      showLandingContent: false,
      photos: [],
      showAlbum: false,
      isLoadingPhotos: false,
      quote: { text: '', author: '' },
      isLoadingQuote: false,
      weather: { temp: null, description: '', iconUrl: '' },
      isLoadingWeather: false,
      isSubscribed: false,
    };
  },
  created() {
    if (localStorage.getItem('hasVisited') === 'true') {
      this.showMainContent = true;
    }
    this.fetchGreeting(); // Fetch the dynamic greeting
    this.fetchLoveMessage();
    this.fetchQuote(); 
    this.fetchWeather();
  },
  mounted() {
    if (!this.showMainContent) {
      this.startIntroAnimation();
    }
    this.checkSubscriptionStatus();
  },
  watch: {
    showMainContent(isShowing) {
      if (isShowing) {
        this.$nextTick(() => this.initFireworks());
      } else {
        if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
      }
    }
  },
  beforeUnmount() {
    if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
    window.removeEventListener('resize', this.resizeCanvas);
  },
  methods: {
    triggerHapticFeedback() {
      if ('vibrate' in navigator) navigator.vibrate(50);
    },
    async fetchGreeting() {
      try {
        const response = await fetch('https://0iumgzsw35.execute-api.us-east-2.amazonaws.com/lovestage/get-daily-greeting');
        if (!response.ok) throw new Error('Failed to fetch greeting');
        const data = await response.json();
        this.greetingMessage = data.greeting;
      } catch (error) {
        console.error("Error fetching greeting:", error);
        this.greetingMessage = "Hello, my love!"; // Fallback message
      }
    },
    startIntroAnimation() {
      setTimeout(() => { this.showMyTypingIndicator = true; }, 1000);
      setTimeout(() => { 
        this.showMyTypingIndicator = false;
        this.showFirstHey = true; 
      }, 2500);
      setTimeout(() => { this.showLaurenTypingIndicator = true; }, 3700);
      setTimeout(() => {
        this.showLaurenTypingIndicator = false;
        this.showSecondHey = true;
      }, 5500);
      setTimeout(() => { this.showMySecondTypingIndicator = true; }, 6700);
      setTimeout(() => { 
        this.showMySecondTypingIndicator = false;
        this.showThirdMessage = true; 
      }, 8200);
      setTimeout(() => { this.showLandingContent = true; }, 9500);
    },
    showMainPage() {
      this.triggerHapticFeedback();
      localStorage.setItem('hasVisited', 'true');
      this.showMainContent = true;
    },
    toggleDropdown() {
      this.isDropdownOpen = !this.isDropdownOpen;
    },
    async fetchLoveMessage() {
      try {
        const response = await fetch('https://0iumgzsw35.execute-api.us-east-2.amazonaws.com/lovestage/love-message');
        const data = await response.json();
        this.translatedMessage = data.body ? JSON.parse(data.body).message : data.message;
        this.language = data.body ? JSON.parse(data.body).language : data.language;
        this.loveMessage = this.translatedMessage;
      } catch (error) {
        console.error('Error fetching love message:', error);
        this.loveMessage = "Couldn't fetch a special message, but my love for you is always here!";
      }
    },
    async fetchWeather() {
      this.isLoadingWeather = true;
      try {
        const response = await fetch('https://0iumgzsw35.execute-api.us-east-2.amazonaws.com/lovestage/weather');
        if (!response.ok) throw new Error('Network response was not ok for weather');
        const data = await response.json();
        this.weather.temp = Math.round(data.temp);
        this.weather.description = data.description;
        this.weather.iconUrl = `https://openweathermap.org/img/wn/${data.icon}@2x.png`;
      } catch (error) {
        console.error('Error fetching weather:', error);
      } finally {
        this.isLoadingWeather = false;
      }
    },
    async fetchQuote() {
      this.isLoadingQuote = true;
      const today = new Date().toISOString().split('T')[0];
      const storedQuoteData = JSON.parse(localStorage.getItem('dailyAiQuote'));

      if (storedQuoteData && storedQuoteData.date === today) {
        this.quote = storedQuoteData.quote;
        this.isLoadingQuote = false;
        return;
      }

      const apiUrl = 'https://0iumgzsw35.execute-api.us-east-2.amazonaws.com/lovestage/motivationalQuote';
      
      try {
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error('Network response was not ok for AI quote');
        const data = await response.json();
        const newQuote = { text: data.quote, author: data.author };
        this.quote = newQuote;
        localStorage.setItem('dailyAiQuote', JSON.stringify({ date: today, quote: newQuote }));
      } catch (error) {
        console.error('Error fetching AI quote:', error);
        this.quote.text = 'My love for you is a message that never ends.';
        this.quote.author = 'Love, Ethan';
      } finally {
        this.isLoadingQuote = false;
      }
    },
    async fetchPhotos() {
      this.isLoadingPhotos = true;
      try {
        const response = await fetch('https://mylovetolauren.s3.us-east-2.amazonaws.com/photos.json');
        if (!response.ok) throw new Error('Network response was not ok');
        this.photos = await response.json();
      } catch (error) {
        console.error('Error fetching photos:', error);
      } finally {
        this.isLoadingPhotos = false;
      }
    },
    async openAlbum() {
      this.triggerHapticFeedback();
      if (this.photos.length === 0) await this.fetchPhotos();
      this.showAlbum = true;
    },
    closeAlbum() {
      this.triggerHapticFeedback();
      this.showAlbum = false;
    },
    toggleText() {
      this.triggerHapticFeedback();
      this.isFading = true;
      setTimeout(() => {
        this.loveMessage = `"I love you" in ${this.language}`;
        this.isFading = false;
        setTimeout(() => {
          this.isFading = true;
          setTimeout(() => {
            this.loveMessage = this.translatedMessage;
            this.isFading = false;
          }, 1000);
        }, 2000);
      }, 1000);
    },
    toggleScroll() {
      this.triggerHapticFeedback();
      this.isDropdownOpen = !this.isDropdownOpen; 
      this.$nextTick(() => {
        if (this.isDropdownOpen) {
          this.$refs.letterContent.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
          this.$refs.letterButton.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      });
    },
    handleTouchStart(event) {
      this.touchStartY = event.touches[0].clientY;
    },
    handleTouchEnd(event) {
      const touchEndY = event.changedTouches[0].clientY;
      if (touchEndY < this.touchStartY - 50) { 
        this.triggerHapticFeedback();
        this.showMainPage();
      }
    },
    async checkSubscriptionStatus() {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        this.isSubscribed = !!subscription;
      }
    },
    async subscribeToNotifications() {
      this.triggerHapticFeedback();
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        alert("Push notifications are not supported on this device.");
        return;
      }
      
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        alert("You've disabled push notifications.");
        return;
      }
      
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: 'BLewptXn8CZX-6Queb6PHavTAWn3cygDQaQ9kfA3-K9MHW37EnftMIgraTKev5NTp_StvBnjgr1ikxFL2fZTQ6Y'
      });
      
      const saveSubscriptionUrl = 'https://62n8jh9wn6.execute-api.us-east-2.amazonaws.com/default/save-love-app-subscription';
      
      try {
        await fetch(saveSubscriptionUrl, {
          method: 'POST',
          body: JSON.stringify(subscription),
          headers: { 'Content-Type': 'application/json' }
        });
        this.isSubscribed = true;
        alert("You're all set for notifications!");
      } catch (error) {
        console.error('Error saving subscription:', error);
        alert('Something went wrong, please try again.');
      }
    },
    resizeCanvas() {
        const canvas = document.getElementById('fireworks-canvas');
        if(canvas) {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
    },
    initFireworks() {
      this.fireworksLaunched = 0;
      const canvas = document.getElementById('fireworks-canvas');
      if (!canvas) return;
      
      const ctx = canvas.getContext('2d');
      this.resizeCanvas(); 
      this.boundResizeCanvas = this.resizeCanvas.bind(this);
      window.addEventListener('resize', this.boundResizeCanvas);

      let fireworks = [];
      let particles = [];
      const random = (min, max) => Math.random() * (max - min) + min;

      function Particle(x, y, color) {
        this.x = x; this.y = y; this.color = color;
        this.velocity = { x: random(-2.5, 2.5), y: random(-7, -1.5) };
        this.gravity = 0.07; this.friction = 0.98; this.alpha = 1;
        this.decay = random(0.015, 0.03);
      }

      Particle.prototype.update = function() {
        this.velocity.x *= this.friction; this.velocity.y += this.gravity;
        this.x += this.velocity.x; this.y += this.velocity.y;
        this.alpha -= this.decay;
      };

      Particle.prototype.draw = function() {
        ctx.save(); ctx.globalAlpha = this.alpha; ctx.beginPath();
        ctx.arc(this.x, this.y, 2, 0, Math.PI * 2, false);
        ctx.fillStyle = this.color; ctx.fill(); ctx.restore();
      };

      function Firework(x, y, targetX, targetY) {
        this.x = x; this.y = y; this.targetX = targetX; this.targetY = targetY;
        this.speed = 2; this.angle = Math.atan2(targetY - y, targetX - x);
        this.velocity = { x: Math.cos(this.angle) * this.speed, y: Math.sin(this.angle) * this.speed };
        this.color = `hsl(${random(0, 360)}, 100%, 50%)`;
      }

      Firework.prototype.update = function() {
        this.x += this.velocity.x * 2; this.y += this.velocity.y * 2;
      };

      Firework.prototype.draw = function() {
        ctx.beginPath(); ctx.arc(this.x, this.y, 3, 0, Math.PI * 2, false);
        ctx.fillStyle = this.color; ctx.fill();
      };
      
      const animate = () => {
        this.animationFrameId = requestAnimationFrame(animate);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        if (this.fireworksLaunched < this.maxFireworks && random(0, 100) < 5) {
            const startX = canvas.width / 2; const startY = canvas.height;
            const targetX = random(0, canvas.width); const targetY = random(0, canvas.height / 2);
            fireworks.push(new Firework(startX, startY, targetX, targetY));
            this.fireworksLaunched++;
        }
        
        fireworks.forEach((firework, index) => {
            firework.update(); firework.draw();
            const distance = Math.hypot(firework.targetX - firework.x, firework.targetY - firework.y);
            if(distance < 5) {
                const particleCount = 100;
                for (let i = 0; i < particleCount; i++) {
                    particles.push(new Particle(firework.x, firework.y, firework.color));
                }
                fireworks.splice(index, 1);
            }
        });
        
        particles.forEach((particle, index) => {
            if (particle.alpha <= 0) {
                particles.splice(index, 1);
            } else {
                particle.update(); particle.draw();
            }
        });

        if (this.fireworksLaunched >= this.maxFireworks && fireworks.length === 0 && particles.length === 0) {
            cancelAnimationFrame(this.animationFrameId);
        }
      };
      animate();
    }
  }
};
</script>

<style scoped>
/* --- STYLES FOR FIREWORKS CANVAS --- */
#fireworks-canvas {
  position: fixed; /* Cover the whole screen */
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0; /* Place it behind the main content */
  background-color: #ffffff; /* White background */
}

/* --- WEATHER STYLES --- */
.weather-container {
  position: fixed; /* Changed to fixed to be relative to the viewport */
  top: 20px;
  right: 20px;
  z-index: 10; /* Ensure it's above the canvas but below the modal */
  display: flex;
  align-items: center;
  background-color: rgba(255, 255, 255, 0.7);
  padding: 5px 10px;
  border-radius: 10px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
  color: #333;
}
.weather-container img {
  width: 50px;
  height: 50px;
}
.weather-details p {
  margin: 0;
  font-size: 0.9rem;
  text-align: left;
}
.weather-description {
  text-transform: capitalize;
  font-size: 0.8rem !important;
  color: #666;
}


/* --- CHAT ANIMATION STYLES --- */
.chat-container {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 90%;
  max-width: 300px;
  margin-bottom: 40px; /* Space between chat and "Can you believe it?" */
}

.chat-bubble {
  padding: 10px 15px;
  border-radius: 20px;
  max-width: 70%;
  font-size: 1.2rem;
  text-align: left; /* Ensures text inside the bubble is left-aligned */
}

.sent {
  background-color: #007bff;
  color: white;
  align-self: flex-end;
  border-bottom-right-radius: 5px;
}

.received {
  background-color: #e9e9eb;
  color: black;
  align-self: flex-start;
  border-bottom-left-radius: 5px;
}

.typing {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 15px; /* Give typing indicator some space */
}

.typing span {
  width: 8px;
  height: 8px;
  background-color: #b0b0b0;
  border-radius: 50%;
  animation: typing-dots 1.5s infinite;
}

/* Make dots white for the sent (blue) bubble */
.sent.typing span {
  background-color: white;
}

.typing span:nth-child(2) {
  animation-delay: 0.2s;
}

.typing span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typing-dots {
  0%, 60%, 100% {
    transform: translateY(0);
  }
  30% {
    transform: translateY(-5px);
  }
}

.landing-content-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

/* --- ORIGINAL AND MODIFIED STYLES --- */
@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
}

.slide-out-leave-active {
  transition: transform 0.7s ease-in-out;
}
.slide-out-leave-to {
  transform: translateY(-100%);
}

.landing-page {
  background-color: #4a148c; /* A deeper purple */
  color: white;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  width: 100vw; /* Use vw to ensure full viewport width */
  position: fixed; /* Use fixed to ensure it covers the viewport */
  top: 0;
  left: 0;
  padding: 0 15px;
  box-sizing: border-box;
}

.landing-page h1 {
  font-size: 3rem;
  text-align: center;
  animation: pulse 1.5s infinite alternate;
}

/* Media query for mobile responsiveness */
@media (max-width: 600px) {
  .landing-page h1 {
    font-size: 2.5rem;
  }
}


.arrow-btn {
  background: none;
  border: none;
  font-size: 3rem;
  color: white;
  cursor: pointer;
  margin-top: 20px;
}

.arrow-btn span {
  font-size: 4rem;
}

.main-content {
  padding: 5rem 20px 20px;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  flex-direction: column;
  min-height: 100vh;
  background-color: transparent; /* Make background see-through to the canvas */
  color: #333; /* Change text color to be visible on light background */
  position: relative; /* Needed to place it above the canvas */
  z-index: 1;
}

h1 {
  font-size: 2.5rem;
  text-align: center;
  /* Removed text-shadow as it's not needed for a light background */
  text-shadow: none;
}

.button-container {
  display: flex;
  flex-wrap: wrap; /* Allow buttons to wrap on smaller screens */
  justify-content: center;
  gap: 15px;
  margin-top: 20px;
}

button {
  background: #8e24aa; /* Updated button color */
  color: white; /* Button text should stay white for contrast */
  padding: 10px 20px;
  border: none;
  cursor: pointer;
  border-radius: 8px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.2);
  transition: transform 0.2s;
}

button h3 {
    /* Removed text-shadow */
    text-shadow: none;
    margin: 0;
    font-size: 1rem;
}

button:hover {
    transform: scale(1.05);
}

p {
  font-size: 1.5rem;
  margin-top: 20px;
  cursor: pointer;
  transition: all 1s ease;
  text-align: center;
  /* Removed text-shadow */
  text-shadow: none;
}

.fade {
  opacity: 0;
  transform: scale(0.9);
}

.dropdown-content {
  margin-top: 20px;
  padding: 20px;
  background-color: rgba(240, 240, 240, 0.95); /* A light grey for the letter */
  border: 1px solid #ddd;
  border-radius: 5px;
  transition: transform 0.5s ease;
  color: #333; /* Dark text for readability on light background */
}

.dropdown-content p {
  font-size: 16px;
  line-height: 1.5;
  color: #333; /* Ensure text inside is dark */
  text-shadow: none; /* Remove shadow inherited from parent p */
}

/* --- QUOTE STYLES --- */
.quote-container {
  margin-top: 40px;
  padding: 20px;
  border-top: 1px solid #eee;
  width: 100%;
  max-width: 600px;
  text-align: center;
}

.quote-text {
  font-size: 1.2rem;
  font-style: italic;
  color: #555;
  margin-bottom: 10px;
}

.quote-author {
  font-size: 1rem;
  font-weight: bold;
  color: #888;
}

.loading-quote p {
    margin-top: 40px;
    font-style: italic;
    color: #888;
}

/* --- ALBUM STYLES --- */
.album-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 100;
}

.album-content {
  background-color: white;
  padding: 20px;
  border-radius: 10px;
  width: 90%;
  max-width: 1200px;
  height: 90vh;
  overflow-y: auto;
  position: relative;
}

.close-album-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  font-size: 2rem;
  font-weight: bold;
  color: #555;
  background-color: rgba(240, 240, 240, 0.8);
  border: none;
  border-radius: 50%;
  cursor: pointer;
  width: 40px;
  height: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  line-height: 1;
  padding: 0;
  transition: background-color 0.2s, color 0.2s;
}

.close-album-btn:hover {
  background-color: rgba(220, 220, 220, 0.9);
  color: #000;
}

.album-content h2 {
  text-align: center;
  margin-bottom: 20px;
}

.photo-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 15px;
}

.photo-item img {
  width: 100%;
  height: auto;
  border-radius: 8px;
  object-fit: cover;
}

.photo-item p {
  font-size: 0.9rem;
  text-align: center;
  margin-top: 5px;
}

.loading-photos {
  text-align: center;
  font-size: 1.2rem;
  padding: 50px;
}


.fade-enter-active, .fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

.fade-up-enter-active {
  transition: opacity 0.5s ease, transform 0.5s ease;
}

.fade-up-enter-from {
  opacity: 0;
  transform: translateY(20px);
}
</style>
