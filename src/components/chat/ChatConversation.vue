<script setup>
import { ref, watch, nextTick } from 'vue'
import ChatMessageBubble from './ChatMessageBubble.vue'
import ChatInputBar from './ChatInputBar.vue'
import { useMessaging } from '@/composables/useMessaging.js'

const props = defineProps({
  contact: Object,
  messages: Array,
  loading: Boolean,
})
const emit = defineEmits(['back', 'close', 'send'])

const { editMessage, deleteMessage } = useMessaging()

const body = ref(null)
const newMsg = ref('')

function scrollDown() {
  nextTick(() => {
    if (body.value) {
      body.value.scrollTop = body.value.scrollHeight
    }
  })
}

watch(
  () => props.messages?.length,
  () => scrollDown(),
)

function handleSend(text, files) {
  if (!text?.trim() && (!files || files.length === 0)) return
  emit('send', text, files)
  newMsg.value = ''
}

function handleEdit({ id, content }) {
  editMessage(id, content)
}

function handleDelete(id) {
  deleteMessage(id)
}
</script>

<template>
  <div class="conversation-header">
    <button class="icon-btn" @click="$emit('back')">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path
          d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"
          fill="currentColor"
        />
      </svg>
    </button>
    <router-link
      :to="'/user/' + (contact?.nickname || contact?.userId)"
      class="conversation-header-info"
      @click.stop
    >
      <div class="conversation-header-avatar" :style="{ background: contact?.avatarColor }">
        <img
          v-if="contact?.profilePicture"
          :src="contact.profilePicture"
          :alt="contact?.name"
          class="header-avatar-img"
        />
        <span v-else>{{ contact?.name?.charAt(0) || '?' }}</span>
      </div>
      <div class="conversation-header-meta">
        <span class="conversation-header-name">{{ contact?.name || 'Ładowanie...' }}</span>
      </div>
    </router-link>
    <button class="icon-btn" @click="$emit('close')">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path
          d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
          fill="currentColor"
        />
      </svg>
    </button>
  </div>
  <div ref="body" class="message-scroll">
    <div v-if="loading" class="loading-state">Ładowanie wiadomości...</div>
    <div v-else-if="!messages || messages.length === 0" class="empty-state">
      Brak wiadomości. Rozpocznij rozmowę!
    </div>
    <ChatMessageBubble
      v-for="m in messages"
      :key="m.id"
      :message="m"
      :contact="contact"
      @edit="handleEdit"
      @delete="handleDelete"
    />
  </div>
  <ChatInputBar v-model="newMsg" @send="handleSend" />
</template>

<style scoped>
.conversation-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background: var(--accent);
  color: #fff;
  flex-shrink: 0;
  min-height: 64px;
}
.icon-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.2);
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: background 0.2s;
}
.icon-btn:hover {
  background: rgba(255, 255, 255, 0.35);
}
.icon-btn:active {
  transform: scale(0.92);
}
.conversation-header-info {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
  flex: 1;
  margin-left: 10px;
  text-decoration: none;
  color: inherit;
  cursor: pointer;
}
.conversation-header-avatar {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 18px;
  font-weight: 700;
  flex-shrink: 0;
  border: 1px white solid;
  overflow: hidden;
}
.header-avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.conversation-header-meta {
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.conversation-header-name {
  font-size: 19px;
  font-weight: 700;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.loading-state,
.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
  color: var(--muted);
  font-size: 16px;
  padding: 20px;
}
.message-scroll {
  flex: 1;
  overflow-y: auto;
  padding: 16px 16px 8px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  background: var(--surface-soft);
}
.message-scroll::-webkit-scrollbar {
  width: 5px;
}
.message-scroll::-webkit-scrollbar-track {
  background: transparent;
}
.message-scroll::-webkit-scrollbar-thumb {
  background: #d1dcee;
  border-radius: 4px;
}
</style>
