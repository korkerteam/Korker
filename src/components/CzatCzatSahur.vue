<script setup>
import { ref, computed, onMounted, onUnmounted, inject, watch } from 'vue'
import { useAuth } from '@/composables/useAuth.js'
import { useMessaging } from '@/composables/useMessaging.js'
import ChatFab from './chat/ChatFab.vue'
import ChatContactList from './chat/ChatContactList.vue'
import ChatConversation from './chat/ChatConversation.vue'

const { isAuthenticated, openAuthModal } = useAuth()
const {
  conversations,
  messages,
  loadingMessages,
  activeUserId,
  activeConversation,
  loadConversations,
  openConversation,
  closeConversation,
  sendMessage,
  isBlockedByMe,
} = useMessaging()

// Wstrzykujemy globalny stan czatu zamiast tworzyć lokalny ref(false)
const { showChatGlobal: showChat, chatTargetUserId } = inject('globalChat', {
  showChatGlobal: ref(false),
  chatTargetUserId: ref(null),
})

const totalUnread = computed(() =>
  conversations.value.reduce((sum, conversation) => sum + (conversation.unread || 0), 0),
)
const panel = ref(null)

function onClickOutside(e) {
  if (panel.value && !panel.value.contains(e.target) && !e.target.closest('.fab')) {
    showChat.value = false
    closeConversation()
  }
}

// Obserwujemy, czy inny komponent zażądał otwarcia czatu z konkretnym użytkownikiem
watch(chatTargetUserId, (userId) => {
  if (userId) {
    handleOpenChat(userId)
    // Czyścimy flagę, aby można było kliknąć to samo powiadomienie ponownie
    chatTargetUserId.value = null
  }
})

watch(showChat, (v) => {
  document.body.style.overflow = v ? 'hidden' : originalOverflow
})

watch(
  () => isAuthenticated.value,
  (authenticated) => {
    if (authenticated) {
      loadConversations()
    }
  },
  { immediate: true },
)

const originalOverflow = document.body.style.overflow || ''

onMounted(() => {
  document.addEventListener('click', onClickOutside)
  if (isAuthenticated.value) {
    loadConversations()
  }
})

onUnmounted(() => {
  document.removeEventListener('click', onClickOutside)
  document.body.style.overflow = originalOverflow
})

const list = computed(() => !activeUserId.value)
const hideFab = computed(() => showChat.value && !!activeUserId.value)
const activeBlocked = computed(() => activeUserId.value && isBlockedByMe(activeUserId.value))

function toggle() {
  if (!isAuthenticated.value) {
    openAuthModal()
    return
  }
  showChat.value = !showChat.value
  if (showChat.value) {
    loadConversations()
  } else {
    closeConversation()
  }
}

function handleOpenChat(userId) {
  if (!showChat.value) {
    showChat.value = true
  }
  openConversation(userId)
}

function handleBack() {
  loadConversations()
  closeConversation()
}

function handleClose() {
  showChat.value = false
  closeConversation()
}

async function handleSend(content, files) {
  await sendMessage(content, files)
}
</script>

<template>
  <ChatFab :unread-count="totalUnread" :hidden="hideFab" @toggle="toggle" />
  <Transition name="fade">
    <div v-if="showChat" class="backdrop"></div>
  </Transition>
  <Transition name="slide" appear>
    <div v-if="showChat" ref="panel" class="chat-drawer" @click.stop>
      <ChatContactList
        v-if="list"
        :conversations="conversations"
        @open-chat="handleOpenChat"
        @close="handleClose"
      />
      <ChatConversation
        v-else
        :messages="messages"
        :loading="loadingMessages"
        :contact="activeConversation"
        :blocked="activeBlocked"
        @back="handleBack"
        @close="handleClose"
        @send="handleSend"
      />
    </div>
  </Transition>
</template>

<style scoped>
.backdrop {
  position: fixed;
  inset: 0;
  z-index: 1090;
  background: rgba(15, 23, 42, 0.25);
}
.chat-drawer {
  position: fixed;
  top: 0;
  right: 0;
  z-index: 1100;
  width: 100%;
  min-width: 400px;
  max-width: min(40vw, 600px);
  height: 100vh;
  height: 100dvh;
  background: var(--surface-strong);
  color: var(--text);
  box-shadow: var(--shadow);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.slide-enter-active {
  animation: slide-in 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
.slide-leave-active {
  animation: slide-in 0.22s cubic-bezier(0.16, 1, 0.3, 1) reverse;
}
@keyframes slide-in {
  from {
    transform: translateX(100%);
  }
  to {
    transform: translateX(0);
  }
}
</style>
