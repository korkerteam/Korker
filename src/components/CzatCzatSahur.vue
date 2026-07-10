<script setup>
import { ref, computed, nextTick, watch } from 'vue'

let msgCounter = 0
function msgId() {
  msgCounter++
  return `${Date.now().toString(36)}_${msgCounter}`
}

function seedMessages(msgs) {
  return msgs.map((m) => ({ id: msgId(), edited: false, editedAt: null, ...m }))
}

const showChat = ref(false)
const activeId = ref(null)
const newMessage = ref('')
const editingId = ref(null)
const editText = ref('')
const confirmDeleteId = ref(null)
const chatBody = ref(null)

const contacts = ref([
  {
    id: 1,
    name: 'Sarah Jenkins',
    role: 'Matematyka',
    color: '#4f75c7',
    online: true,
    lastSeen: 'teraz',
    messages: seedMessages([
      {
        from: 'them',
        text: 'Hej! Widzę, że szukasz pomocy z matmy? Jestem tu po to!',
        time: '14:14',
      },
      { from: 'them', text: 'Który temat sprawia Ci najwięcej trudności?', time: '14:14' },
      { from: 'me', text: 'Cześć! Szeregi Taylora kompletnie mnie rozwalają 😅', time: '14:18' },
      {
        from: 'them',
        text: 'Spokojnie, ogarniemy to! Test ilorazowy to nasz kumpel.',
        time: '14:19',
      },
    ]),
  },
  {
    id: 2,
    name: 'Michał Kowalski',
    role: 'Fizyka',
    color: '#e056fd',
    online: false,
    lastSeen: '2h temu',
    messages: seedMessages([
      { from: 'them', text: 'Cześć! Przygotowałem zadania z mechaniki dla Ciebie.', time: '11:00' },
      { from: 'me', text: 'O, super! Dzięki wielkie 🙌', time: '11:05' },
    ]),
  },
  {
    id: 3,
    name: 'Anna Nowak',
    role: 'Angielski',
    color: '#42b883',
    online: true,
    lastSeen: 'teraz',
    messages: seedMessages([
      { from: 'them', text: 'Hi! Ready for our next conversation practice? 📚', time: '09:30' },
      { from: 'me', text: "Sure! Let's do it.", time: '09:32' },
      { from: 'them', text: "Great! I'll prepare some topics about travel.", time: '09:33' },
    ]),
  },
  {
    id: 4,
    name: 'Kasia Wiśniewska',
    role: 'Chemia',
    color: '#10b981',
    online: true,
    lastSeen: '5min temu',
    messages: seedMessages([
      { from: 'them', text: 'Hej! Ogarnijmy razem te równania redox 💪', time: '12:00' },
      { from: 'me', text: 'Brzmi dobrze! Kiedy masz czas?', time: '12:02' },
      { from: 'them', text: 'Jutro po 15?', time: '12:03' },
      { from: 'me', text: 'Pasuje! 👍', time: '12:05' },
    ]),
  },
])

const activeContact = computed(() => contacts.value.find((c) => c.id === activeId.value) || null)

const showList = computed(() => !activeContact.value)

function openChat(id) {
  activeId.value = id
  scrollDown()
}

function clearEditState() {
  editingId.value = null
  editText.value = ''
  confirmDeleteId.value = null
}

function goBack() {
  activeId.value = null
  clearEditState()
}

function toggleChat() {
  showChat.value = !showChat.value
  if (!showChat.value) {
    activeId.value = null
    clearEditState()
  }
}

function sendMessage() {
  if (!newMessage.value.trim() || !activeContact.value) return
  const contact = contacts.value.find((c) => c.id === activeId.value)
  if (!contact) return
  contact.messages.push({
    id: msgId(),
    from: 'me',
    text: newMessage.value,
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    edited: false,
    editedAt: null,
  })
  newMessage.value = ''
  scrollDown()
}

function handleKeydown(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    sendMessage()
  }
}

function startEdit(msg) {
  editingId.value = msg.id
  editText.value = msg.text
  nextTick(() => {
    const el = document.querySelector('.edit-ta')
    if (el) {
      el.focus()
      el.setSelectionRange(el.value.length, el.value.length)
    }
  })
}

function cancelEdit() {
  editingId.value = null
  editText.value = ''
}

function saveEdit(id) {
  if (!editText.value.trim()) return
  const contact = contacts.value.find((c) => c.id === activeId.value)
  if (!contact) return
  const msg = contact.messages.find((m) => m.id === id)
  if (!msg) return
  msg.text = editText.value
  msg.edited = true
  msg.editedAt = new Date().toISOString()
  editingId.value = null
  editText.value = ''
}

function handleEditKeydown(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    saveEdit(editingId.value)
  }
  if (e.key === 'Escape') {
    e.preventDefault()
    cancelEdit()
    cancelDelete()
  }
}

function requestDelete(id) {
  confirmDeleteId.value = id
}

function cancelDelete() {
  confirmDeleteId.value = null
}

function deleteMessage() {
  const id = confirmDeleteId.value
  if (!id) return
  const contact = contacts.value.find((c) => c.id === activeId.value)
  if (!contact) return
  const idx = contact.messages.findIndex((m) => m.id === id)
  if (idx === -1) return
  contact.messages.splice(idx, 1)
  if (editingId.value === id) cancelEdit()
  confirmDeleteId.value = null
}

function scrollDown() {
  nextTick(() => {
    if (chatBody.value) chatBody.value.scrollTop = chatBody.value.scrollHeight
  })
}

watch(activeId, scrollDown)
</script>

<template>
  <div class="chat-root">
    <button v-if="!showChat" class="fab" @click="toggleChat" title="Czat">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path
          d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"
          fill="currentColor"
        />
        <rect x="7" y="9" width="10" height="2" rx="1" fill="white" />
        <rect x="7" y="13" width="7" height="2" rx="1" fill="white" />
      </svg>
    </button>

    <Transition name="slide">
      <div v-if="showChat" class="drawer">
        <!-- Header: contact list -->
        <div v-if="showList" class="hdr">
          <h2 class="hdr-title">Wiadomości</h2>
          <button class="hdr-btn" @click="toggleChat" title="Zamknij">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
                fill="currentColor"
              />
            </svg>
          </button>
        </div>

        <!-- Header: active chat -->
        <div v-else class="hdr hdr-chat">
          <button class="hdr-btn" @click="goBack" title="Wstecz">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"
                fill="currentColor"
              />
            </svg>
          </button>
          <div class="hdr-info">
            <div class="hdr-av" :style="{ background: activeContact?.color }">
              {{ activeContact?.name?.charAt(0) }}
            </div>
            <div class="hdr-meta">
              <span class="hdr-name">{{ activeContact?.name }}</span>
              <span class="hdr-status" :class="{ on: activeContact?.online }">
                {{ activeContact?.online ? 'Online' : activeContact?.lastSeen }}
              </span>
            </div>
          </div>
          <button class="hdr-btn" @click="toggleChat" title="Zamknij">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
                fill="currentColor"
              />
            </svg>
          </button>
        </div>

        <!-- Contact list -->
        <div v-if="showList" class="clist">
          <button v-for="c in contacts" :key="c.id" class="citem" @click="openChat(c.id)">
            <div class="citem-left">
              <div class="citem-av" :style="{ background: c.color }">{{ c.name.charAt(0) }}</div>
              <div class="citem-info">
                <span class="citem-name">{{ c.name }}</span>
                <span class="citem-role">{{ c.role }}</span>
                <span v-if="c.messages.length" class="citem-last">{{
                  c.messages[c.messages.length - 1].text
                }}</span>
              </div>
            </div>
            <div class="citem-right">
              <span v-if="c.online" class="citem-dot"></span>
              <span v-else class="citem-ago">{{ c.lastSeen }}</span>
            </div>
          </button>
        </div>

        <!-- Chat messages -->
        <div v-else ref="chatBody" class="msgs">
          <div
            v-for="m in activeContact?.messages"
            :key="m.id"
            class="mrow"
            :class="m.from === 'me' ? 'mine' : 'theirs'"
          >
            <div v-if="m.from === 'them'" class="mav" :style="{ background: activeContact?.color }">
              {{ activeContact?.name?.charAt(0) }}
            </div>
            <div class="mbody">
              <div class="bub-wrap" :class="m.from === 'me' ? 'bw-me' : ''">
                <!-- Edit mode -->
                <div v-if="editingId === m.id && m.from === 'me'" class="edit-wrap">
                  <textarea
                    v-model="editText"
                    class="edit-ta"
                    rows="2"
                    @keydown="handleEditKeydown"
                  ></textarea>
                  <div class="edit-acts">
                    <button class="edit-save" @click="saveEdit(m.id)" :disabled="!editText.trim()">
                      Zapisz
                    </button>
                    <button class="edit-cancel" @click="cancelEdit">Anuluj</button>
                  </div>
                </div>
                <!-- Display mode -->
                <div v-else class="mbub" :class="m.from === 'me' ? 'b-me' : 'b-them'">
                  {{ m.text }}
                  <!-- Action buttons on own messages -->
                  <div v-if="m.from === 'me' && confirmDeleteId !== m.id" class="act-ov">
                    <button class="act-btn" @click="startEdit(m)" title="Edytuj">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                        <path
                          d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"
                          fill="currentColor"
                        />
                      </svg>
                    </button>
                    <button class="act-btn" @click="requestDelete(m.id)" title="Usuń">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                        <path
                          d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"
                          fill="currentColor"
                        />
                      </svg>
                    </button>
                  </div>
                  <!-- Delete confirmation -->
                  <div v-if="m.from === 'me' && confirmDeleteId === m.id" class="del-confirm">
                    <span class="del-label">Usunąć?</span>
                    <button class="del-yes" @click="deleteMessage()">Usuń</button>
                    <button class="del-no" @click="cancelDelete">Anuluj</button>
                  </div>
                </div>
              </div>
              <span class="mtime" :class="m.from === 'me' ? 'tr' : ''">
                {{ m.time }}
                <span v-if="m.edited" class="ed">· edytowano</span>
              </span>
            </div>
          </div>
        </div>

        <!-- Input -->
        <div v-if="!showList" class="iarea">
          <div class="irow">
            <textarea
              v-model="newMessage"
              class="ita"
              placeholder="Napisz wiadomość..."
              rows="1"
              @keydown="handleKeydown"
            ></textarea>
            <button class="isend" @click="sendMessage" :disabled="!newMessage.trim()">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" fill="currentColor" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.chat-root {
  font-family: sans-serif;
}

/* FAB */
.fab {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 1200;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  border: none;
  background: #4f75c7;
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 6px 20px rgba(79, 117, 199, 0.35);
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}
.fab:hover {
  transform: scale(1.08);
  box-shadow: 0 8px 28px rgba(79, 117, 199, 0.5);
}
.fab:active {
  transform: scale(0.93);
}

/* Drawer */
.drawer {
  position: fixed;
  top: 0;
  right: 0;
  z-index: 1100;
  width: 100%;
  max-width: 420px;
  height: 100vh;
  height: 100dvh;
  background: #f5f7fa;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.slide-enter-active {
  animation: slid 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
.slide-leave-active {
  animation: slid 0.22s cubic-bezier(0.16, 1, 0.3, 1) reverse;
}
@keyframes slid {
  from {
    transform: translateX(100%);
  }
  to {
    transform: translateX(0);
  }
}

/* Header */
.hdr {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 20px;
  background: #4f75c7;
  color: #fff;
  flex-shrink: 0;
  min-height: 64px;
}
.hdr-chat {
  padding: 14px 16px;
  min-height: 60px;
}
.hdr-title {
  font-family: 'Horizon', sans-serif;
  font-size: 20px;
  font-weight: 400;
  margin: 0;
  letter-spacing: 0.5px;
}
.hdr-btn {
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
.hdr-btn:hover {
  background: rgba(255, 255, 255, 0.35);
}
.hdr-btn:active {
  transform: scale(0.92);
}

.hdr-info {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
  flex: 1;
}
.hdr-av {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 16px;
  font-weight: 700;
  flex-shrink: 0;
}
.hdr-meta {
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.hdr-name {
  font-size: 17px;
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.hdr-status {
  font-size: 12px;
  opacity: 0.8;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.hdr-status.on::before {
  content: '';
  display: inline-block;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #10b981;
  margin-right: 5px;
  vertical-align: middle;
}

/* Contact list */
.clist {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  padding: 4px 0;
}
.clist::-webkit-scrollbar {
  width: 5px;
}
.clist::-webkit-scrollbar-track {
  background: transparent;
}
.clist::-webkit-scrollbar-thumb {
  background: #d1dcee;
  border-radius: 4px;
}

.citem {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 20px;
  border: none;
  background: transparent;
  cursor: pointer;
  text-align: left;
  transition: background 0.15s;
  border-bottom: 1px solid #e8edf5;
}
.citem:hover {
  background: #e8edf5;
}
.citem:active {
  background: #d1dcee;
}

.citem-left {
  display: flex;
  align-items: center;
  gap: 14px;
  min-width: 0;
  flex: 1;
}
.citem-av {
  width: 46px;
  height: 46px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 18px;
  font-weight: 700;
  flex-shrink: 0;
}
.citem-info {
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.citem-name {
  font-size: 15px;
  font-weight: 600;
  color: #1a1a2e;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.citem-role {
  font-size: 12px;
  color: #6b7280;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.citem-last {
  font-size: 13px;
  color: #9ca3af;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-top: 1px;
}
.citem-right {
  flex-shrink: 0;
  margin-left: 10px;
  display: flex;
  align-items: center;
}
.citem-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #10b981;
}
.citem-ago {
  font-size: 11px;
  color: #9ca3af;
  white-space: nowrap;
}

/* Messages */
.msgs {
  flex: 1;
  overflow-y: auto;
  padding: 16px 16px 8px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.msgs::-webkit-scrollbar {
  width: 5px;
}
.msgs::-webkit-scrollbar-track {
  background: transparent;
}
.msgs::-webkit-scrollbar-thumb {
  background: #d1dcee;
  border-radius: 4px;
}

.mrow {
  display: flex;
  gap: 8px;
  max-width: 88%;
}
.mrow.theirs {
  align-self: flex-start;
}
.mrow.mine {
  align-self: flex-end;
  flex-direction: row-reverse;
}

.mav {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 13px;
  font-weight: 700;
  flex-shrink: 0;
  margin-top: 4px;
}
.mbody {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.mine .mbody {
  align-items: flex-end;
}

/* Bubble wrapper — needed for action overlay positioning */
.bub-wrap {
  position: relative;
}

/* Action buttons overlay (appear on hover) */
.act-ov {
  position: absolute;
  top: -14px;
  right: 0;
  display: none;
  gap: 2px;
  z-index: 10;
}
.bw-me:hover .act-ov {
  display: flex;
}
.act-btn {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  border: none;
  background: #e8edf5;
  color: #6b7280;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}
.act-btn:hover {
  background: #d1dcee;
  color: #1a1a2e;
}
.act-btn:active {
  transform: scale(0.9);
}

/* Delete confirmation overlay */
.del-confirm {
  position: absolute;
  top: -14px;
  right: 0;
  display: flex;
  align-items: center;
  gap: 4px;
  z-index: 10;
  background: #fff;
  border-radius: 8px;
  padding: 3px 6px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
  white-space: nowrap;
}
.del-label {
  font-size: 11px;
  color: #6b7280;
  margin-right: 2px;
}
.del-yes,
.del-no {
  padding: 3px 8px;
  border: none;
  border-radius: 5px;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
}
.del-yes {
  background: #ef4444;
  color: #fff;
}
.del-yes:hover {
  background: #dc2626;
}
.del-no {
  background: #e8edf5;
  color: #6b7280;
}
.del-no:hover {
  background: #d1dcee;
}

.mbub {
  padding: 12px 16px;
  border-radius: 18px;
  font-size: 15px;
  line-height: 1.5;
  word-wrap: break-word;
  overflow-wrap: break-word;
}
.b-them {
  background: #e8edf5;
  color: #1a1a2e;
  border-bottom-left-radius: 5px;
}
.b-me {
  background: #4f75c7;
  color: #fff;
  border-bottom-right-radius: 5px;
}

.mtime {
  font-size: 11px;
  color: #9ca3af;
  padding: 0 4px;
}
.tr {
  align-self: flex-end;
}
.ed {
  color: #9ca3af;
  font-size: 11px;
}

/* Edit mode */
.edit-wrap {
  background: #fff;
  border: 2px solid #4f75c7;
  border-radius: 14px;
  padding: 8px;
  min-width: 220px;
}
.edit-ta {
  width: 100%;
  border: none;
  background: transparent;
  font-size: 15px;
  color: #1a1a2e;
  resize: none;
  outline: none;
  line-height: 1.5;
  font-family: inherit;
  min-height: 40px;
}
.edit-acts {
  display: flex;
  justify-content: flex-end;
  gap: 6px;
  margin-top: 6px;
}
.edit-save,
.edit-cancel {
  padding: 5px 14px;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
}
.edit-save {
  background: #4f75c7;
  color: #fff;
}
.edit-save:hover {
  background: #3d62ad;
}
.edit-save:disabled {
  background: #d1dcee;
  cursor: default;
}
.edit-cancel {
  background: #e8edf5;
  color: #6b7280;
}
.edit-cancel:hover {
  background: #d1dcee;
}

/* Input */
.iarea {
  padding: 10px 14px 14px;
  border-top: 1px solid #e8edf5;
  background: #f5f7fa;
  flex-shrink: 0;
}
.irow {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  background: #fff;
  border-radius: 20px;
  padding: 4px 4px 4px 18px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
  transition: box-shadow 0.2s;
}
.irow:focus-within {
  box-shadow: 0 2px 12px rgba(79, 117, 199, 0.15);
}

.ita {
  flex: 1;
  border: none;
  background: transparent;
  font-size: 15px;
  color: #1a1a2e;
  resize: none;
  padding: 10px 0;
  outline: none;
  max-height: 100px;
  min-height: 40px;
  line-height: 1.5;
  font-family: inherit;
}
.ita::placeholder {
  color: #9ca3af;
}

.isend {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  background: #4f75c7;
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.2s;
}
.isend:hover {
  background: #3d62ad;
  transform: scale(1.05);
}
.isend:active {
  transform: scale(0.92);
}
.isend:disabled {
  background: #d1dcee;
  cursor: default;
  transform: none;
}
</style>
