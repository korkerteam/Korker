<script setup>
import { ref, computed } from 'vue'
import { useAuth } from '@/composables/useAuth.js'

const props = defineProps({
  message: Object,
  contact: Object,
})

const emit = defineEmits(['edit', 'delete'])

const { user } = useAuth()

const isMine = computed(() => props.message?.sender_id === user.value?.id)
const attachments = computed(() => props.message?.attachments || [])

const editing = ref(false)
const editText = ref('')
const showDeleteConfirm = ref(false)

function startEdit() {
  editText.value = props.message?.content || ''
  editing.value = true
}

function cancelEdit() {
  editing.value = false
  editText.value = ''
}

function saveEdit() {
  if (!editText.value.trim() || editText.value.trim() === props.message?.content) {
    cancelEdit()
    return
  }
  emit('edit', { id: props.message.id, content: editText.value.trim() })
  editing.value = false
}

function confirmDelete() {
  showDeleteConfirm.value = true
}

function cancelDelete() {
  showDeleteConfirm.value = false
}

function executeDelete() {
  emit('delete', props.message.id)
  showDeleteConfirm.value = false
}

function formatTime(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function isImage(att) {
  return att.type?.startsWith('image/')
}

function formatSize(bytes) {
  if (!bytes) return ''
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}
</script>

<template>
  <div
    class="msg-row"
    :class="isMine ? 'msg-row-me' : 'msg-row-them'"
    @mouseleave="showDeleteConfirm = false"
  >
    <div v-if="!isMine" class="msg-avatar" :style="{ background: contact?.avatarColor }">
      <img
        v-if="contact?.profilePicture"
        :src="contact.profilePicture"
        :alt="contact?.name"
        class="bubble-avatar-img"
      />
      <span v-else>{{ contact?.name?.charAt(0) || '?' }}</span>
    </div>
    <div class="msg-body">
      <div v-if="editing" class="edit-area">
        <textarea v-model="editText" class="edit-textarea" rows="2"></textarea>
        <div class="edit-actions">
          <button class="edit-btn save-btn" @click="saveEdit">Zapisz</button>
          <button class="edit-btn cancel-btn" @click="cancelEdit">Anuluj</button>
        </div>
      </div>
      <div v-else class="bubble-row">
        <div class="bubble" :class="isMine ? 'bubble-mine' : 'bubble-them'">
          <template v-if="message?.content">
            <div class="bubble-text">{{ message.content }}</div>
          </template>
          <template v-if="attachments.length">
            <div class="attachments-grid">
              <template v-for="(att, i) in attachments" :key="i">
                <a v-if="isImage(att)" :href="att.url" target="_blank" class="att-image-wrap">
                  <img :src="att.url" :alt="att.name" class="att-image" loading="lazy" />
                </a>
                <a v-else :href="att.url" target="_blank" class="att-file" download>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zM6 20V4h7v5h5v11H6z"
                      fill="currentColor"
                    />
                  </svg>
                  <div class="att-file-info">
                    <span class="att-file-name">{{ att.name }}</span>
                    <span class="att-file-size">{{ formatSize(att.size) }}</span>
                  </div>
                </a>
              </template>
            </div>
          </template>
        </div>
        <div v-if="isMine" class="msg-actions">
          <button v-if="!showDeleteConfirm" class="action-btn" title="Edytuj" @click="startEdit">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path
                d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 000-1.41l-2.34-2.34a1 1 0 00-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"
                fill="currentColor"
              />
            </svg>
          </button>
          <button v-if="!showDeleteConfirm" class="action-btn" title="Usuń" @click="confirmDelete">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path
                d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"
                fill="currentColor"
              />
            </svg>
          </button>
          <div v-if="showDeleteConfirm" class="delete-confirm">
            <span class="confirm-text">Usunąć?</span>
            <button class="confirm-yes" @click="executeDelete">Tak</button>
            <button class="confirm-no" @click="cancelDelete">Nie</button>
          </div>
        </div>
      </div>
      <span class="msg-time" :class="{ 'msg-time-right': isMine }">
        {{ formatTime(message?.created_at) }}
      </span>
    </div>
  </div>
</template>

<style scoped>
.msg-row {
  display: flex;
  gap: 8px;
  max-width: 88%;
  position: relative;
}
.msg-row-them {
  align-self: flex-start;
}
.msg-row-me {
  align-self: flex-end;
  flex-direction: row-reverse;
}
.msg-avatar {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 15px;
  font-weight: 700;
  flex-shrink: 0;
  margin-top: 4px;
  overflow: hidden;
}
.bubble-avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.msg-body {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.msg-row-me .msg-body {
  align-items: flex-end;
}
.bubble-row {
  display: flex;
  align-items: flex-end;
  gap: 6px;
}
.bubble {
  padding: 12px 18px;
  border-radius: 18px;
  font-size: 16px;
  line-height: 1.5;
  word-wrap: break-word;
  overflow-wrap: break-word;
}
.bubble-them {
  background: #e8edf5;
  color: #1a1a2e;
  border-bottom-left-radius: 5px;
}
.bubble-mine {
  background: var(--primary-color);
  color: #fff;
  border-bottom-right-radius: 5px;
}
.msg-time {
  font-size: 13px;
  color: #9ca3af;
  padding: 0 4px;
}
.msg-time-right {
  align-self: flex-end;
}
.msg-actions {
  display: flex;
  align-items: center;
  gap: 2px;
  opacity: 0;
  transition: opacity 0.15s;
}
.msg-row-me:hover .msg-actions {
  opacity: 1;
}
.action-btn {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: none;
  background: transparent;
  color: #9ca3af;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
  flex-shrink: 0;
}
.action-btn:hover {
  background: rgba(0, 0, 0, 0.06);
  color: #555;
}
.delete-confirm {
  display: flex;
  align-items: center;
  gap: 4px;
  background: #fff;
  border-radius: 8px;
  padding: 2px 6px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
  white-space: nowrap;
}
.confirm-text {
  font-size: 12px;
  color: #ef4444;
  font-weight: 600;
}
.confirm-yes,
.confirm-no {
  border: none;
  border-radius: 4px;
  padding: 2px 8px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
}
.confirm-yes {
  background: #ef4444;
  color: #fff;
}
.confirm-no {
  background: #e8edf5;
  color: #555;
}
.confirm-yes:hover {
  background: #dc2626;
}
.confirm-no:hover {
  background: #d1dcee;
}
.bubble-text {
  white-space: pre-wrap;
}
.attachments-grid {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 6px;
}
.att-image-wrap {
  display: block;
  border-radius: 10px;
  overflow: hidden;
  line-height: 0;
}
.att-image-wrap:hover {
  opacity: 0.92;
}
.att-image {
  max-width: 280px;
  width: 100%;
  max-height: 300px;
  object-fit: cover;
  border-radius: 10px;
  display: block;
}
.att-file {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  border-radius: 8px;
  text-decoration: none;
  transition: background 0.15s;
}
.bubble-mine .att-file {
  background: rgba(255, 255, 255, 0.15);
  color: #fff;
}
.bubble-mine .att-file:hover {
  background: rgba(255, 255, 255, 0.25);
}
.bubble-them .att-file {
  background: rgba(0, 0, 0, 0.04);
  color: #1a1a2e;
}
.bubble-them .att-file:hover {
  background: rgba(0, 0, 0, 0.08);
}
.att-file-info {
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.att-file-name {
  font-size: 14px;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.att-file-size {
  font-size: 12px;
  opacity: 0.7;
}
.edit-area {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.edit-textarea {
  width: 280px;
  border: 2px solid var(--primary-color);
  border-radius: 12px;
  padding: 10px 14px;
  font-size: 16px;
  font-family: inherit;
  line-height: 1.5;
  resize: none;
  outline: none;
  background: #fff;
  color: #1a1a2e;
}
.edit-textarea:focus {
  box-shadow: 0 0 0 3px rgba(79, 117, 199, 0.2);
}
.edit-actions {
  display: flex;
  gap: 6px;
}
.edit-btn {
  border: none;
  border-radius: 8px;
  padding: 6px 16px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
}
.save-btn {
  background: var(--primary-color);
  color: #fff;
}
.save-btn:hover {
  background: #3d62ad;
}
.cancel-btn {
  background: #e8edf5;
  color: #555;
}
.cancel-btn:hover {
  background: #d1dcee;
}
</style>
