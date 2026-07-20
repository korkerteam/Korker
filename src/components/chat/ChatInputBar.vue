<script setup>
import { ref, computed } from 'vue'
import { compressImage } from '@/utils/imageCompress.js'

const props = defineProps({
  modelValue: String,
})
const emit = defineEmits(['update:modelValue', 'send'])

const MAX_MESSAGE_LENGTH = 500
const MAX_FILE_SIZE = 5 * 1024 * 1024
const ACCEPT_TYPES = 'image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.csv,.zip,.rar,.7z'

const fileInput = ref(null)
const files = ref([])
const sending = ref(false)

const overLimit = computed(() => val.value.length > MAX_MESSAGE_LENGTH)
const charsLeft = computed(() => MAX_MESSAGE_LENGTH - val.value.length)

const val = computed({
  get: () => props.modelValue ?? '',
  set: (v) => emit('update:modelValue', v),
})

function onkey(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    send()
  }
}

function onPaste(e) {
  const items = e.clipboardData?.items
  if (!items) return
  for (const item of items) {
    if (item.type.startsWith('image/')) {
      const file = item.getAsFile()
      if (file) addFile(file)
      e.preventDefault()
    }
  }
}

function triggerFilePicker() {
  fileInput.value?.click()
}

async function addFile(f) {
  if (files.value.length >= 10) return
  if (f.type.startsWith('image/')) {
    const compressed = await compressImage(f, { maxWidth: 1920, maxHeight: 1920, maxSizeMB: 5 })
    if (compressed.size <= MAX_FILE_SIZE) {
      files.value.push(compressed)
      return
    }
    return
  }
  if (f.size > MAX_FILE_SIZE) return
  files.value.push(f)
}

function onFileChange(e) {
  const selected = Array.from(e.target.files || [])
  for (const f of selected) addFile(f)
  e.target.value = ''
}

function removeFile(index) {
  files.value.splice(index, 1)
}

function formatSize(bytes) {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

function send() {
  if (sending.value) return
  if (!val.value.trim() && files.value.length === 0) return
  emit('send', val.value, [...files.value])
  files.value = []
}

function isImage(file) {
  return file.type?.startsWith('image/')
}

function getObjectUrl(file) {
  return URL.createObjectURL(file)
}
</script>

<template>
  <div class="input-area">
    <div v-if="files.length" class="file-chips">
      <div v-for="(f, i) in files" :key="i" class="file-chip">
        <img v-if="isImage(f)" :src="getObjectUrl(f)" class="file-chip-thumb" />
        <svg v-else class="file-chip-icon" width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path
            d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zM6 20V4h7v5h5v11H6z"
            fill="currentColor"
          />
        </svg>
        <span class="file-chip-name">{{ f.name }}</span>
        <span class="file-chip-size">{{ formatSize(f.size) }}</span>
        <button class="file-chip-remove" @click="removeFile(i)">&times;</button>
      </div>
    </div>
    <div v-if="overLimit" class="limit-warning">
      Wiadomość może mieć maksymalnie {{ MAX_MESSAGE_LENGTH }} znaków
    </div>
    <div class="input-row">
      <button class="input-attach" @click="triggerFilePicker" title="Załącz plik">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path
            d="M16.5 6v11.5a4 4 0 01-4 4 4 4 0 01-4-4V5a2.5 2.5 0 015 0v10.5a1 1 0 01-2 0V6h-1.5v9.5a2.5 2.5 0 005 0V5a4 4 0 00-4-4 4 4 0 00-4 4v12.5a5.5 5.5 0 0011 0V6H16.5z"
            fill="currentColor"
          />
        </svg>
      </button>
      <input
        ref="fileInput"
        type="file"
        multiple
        :accept="ACCEPT_TYPES"
        class="file-input-hidden"
        @change="onFileChange"
      />
      <div class="textarea-wrap">
        <textarea
          v-model="val"
          class="input-textarea"
          :class="{ 'textarea-over': overLimit }"
          placeholder="Napisz wiadomość..."
          rows="1"
          @keydown="onkey"
          @paste="onPaste"
        ></textarea>
        <span v-if="val.length" class="char-count" :class="{ 'char-count-over': overLimit }">{{
          charsLeft
        }}</span>
      </div>
      <button
        class="input-send"
        @click="send"
        :disabled="(!val.trim() && !files.length) || sending || overLimit"
      >
        <svg v-if="!sending" width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" fill="currentColor" />
        </svg>
        <span v-else class="sending-spinner"></span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.input-area {
  padding: 10px 14px 14px;
  border-top: 1px solid var(--border);
  background: var(--surface-strong);
  flex-shrink: 0;
}
.file-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 8px;
}
.file-chip {
  display: flex;
  align-items: center;
  gap: 6px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 6px 10px;
  font-size: 13px;
  max-width: 100%;
}
.file-chip-thumb {
  width: 28px;
  height: 28px;
  border-radius: 4px;
  object-fit: cover;
  flex-shrink: 0;
}
.file-chip-icon {
  width: 28px;
  height: 28px;
  padding: 4px;
  color: #9ca3af;
  flex-shrink: 0;
}
.file-chip-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 120px;
  color: var(--text);
}
.file-chip-size {
  color: var(--muted);
  flex-shrink: 0;
}
.file-chip-remove {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: none;
  background: var(--surface-soft);
  color: var(--muted);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  line-height: 1;
  flex-shrink: 0;
  padding: 0;
}
.file-chip-remove:hover {
  background: #ef4444;
  color: #fff;
}
.input-row {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 20px;
  padding: 4px 4px 4px 12px;
  box-shadow: var(--shadow-soft);
  transition: box-shadow 0.2s;
}
.input-row:focus-within {
  box-shadow: 0 2px 12px rgba(79, 117, 199, 0.15);
}
.input-attach {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background: transparent;
  color: var(--muted);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.15s;
}
.input-attach:hover {
  background: rgba(138, 180, 255, 0.16);
  color: var(--accent);
}
.file-input-hidden {
  display: none;
}
.limit-warning {
  font-size: 12px;
  color: #ef4444;
  text-align: right;
  margin-bottom: 4px;
  font-weight: 500;
}
.textarea-wrap {
  flex: 1;
  position: relative;
}
.input-textarea {
  width: 100%;
  border: none;
  background: transparent;
  font-size: 16px;
  color: var(--text);
  resize: none;
  padding: 10px 0;
  outline: none;
  max-height: 100px;
  min-height: 40px;
  line-height: 1.5;
  font-family: inherit;
  box-sizing: border-box;
}
.input-textarea::placeholder {
  color: var(--muted);
}
.input-textarea.textarea-over {
  color: #ef4444;
}
.char-count {
  position: absolute;
  bottom: 4px;
  right: 4px;
  font-size: 11px;
  color: var(--muted);
  pointer-events: none;
  line-height: 1;
}
.char-count-over {
  color: #ef4444;
  font-weight: 600;
}
.input-send {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  background: var(--primary-color);
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.2s;
}
.input-send:hover {
  background: #3d62ad;
  transform: scale(1.05);
}
.input-send:active {
  transform: scale(0.92);
}
.input-send:disabled {
  background: var(--border);
  color: var(--muted);
  cursor: default;
  transform: none;
}
.sending-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
