<template>
  <div class="chat-container">
    <button @click="toggleChat" class="chat-button">
      {{ showChat ? 'Close Chat' : 'Open Chat' }}
    </button>

    <div v-if="showChat" class="chat-window">
      <header class="chat-header">Chat Window</header>
      <div class="chat-body">
        <p>Start a conversation here.</p>
      </div>
      <footer class="chat-footer">
        <input type="text" v-model="message" placeholder="Type a message" />
        <button @click="sendMessage">Send</button>
      </footer>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CzatCzatSahur',
  data() {
    return {
      showChat: false,
      message: '',
    }
  },
  methods: {
    toggleChat() {
      this.showChat = !this.showChat
    },
    sendMessage() {
      if (!this.message.trim()) return
      console.log('Sending message:', this.message)
      this.message = ''
    },
  },
}
</script>

<style scoped>
.chat-container {
  position: relative;
}
.chat-button {
  padding: 8px 16px;
  background: #3498db;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.chat-window {
  position: fixed;
  right: 20px;
  bottom: 20px;
  width: 320px;
  max-width: calc(100vw - 40px);
  border: 1px solid #ccc;
  background: #fff;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  border-radius: 8px;
  overflow: hidden;
}
.chat-header {
  background: #3498db;
  color: #fff;
  padding: 10px;
  font-weight: bold;
}
.chat-body {
  padding: 10px;
  min-height: 120px;
}
.chat-footer {
  display: flex;
  gap: 8px;
  padding: 10px;
  border-top: 1px solid #ddd;
}
.chat-footer input {
  flex: 1;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
}
.chat-footer button {
  padding: 8px 12px;
  border: none;
  background: #2ecc71;
  color: #fff;
  border-radius: 4px;
  cursor: pointer;
}
</style>
