<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: String,
})
const emit = defineEmits(['update:modelValue', 'send'])

const val = computed({
  get: () => props.modelValue ?? '',
  set: (v) => emit('update:modelValue', v),
})

function onkey(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    emit('send')
  }
}
</script>

<template>
  <div class="input-area">
    <div class="input-row">
      <textarea
        v-model="val"
        class="input-textarea"
        placeholder="Napisz wiadomość..."
        rows="1"
        @keydown="onkey"
      ></textarea
      ><button class="input-send" @click="$emit('send')" :disabled="!val.trim()">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" fill="currentColor" />
        </svg>
      </button>
    </div>
  </div>
</template>

<style scoped>
.input-area {
  padding: 10px 14px 14px;
  border-top: 1px solid #e8edf5;
  background: #f5f7fa;
  flex-shrink: 0;
}
.input-row {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  background: #fff;
  border-radius: 20px;
  padding: 4px 4px 4px 18px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
  transition: box-shadow 0.2s;
}
.input-row:focus-within {
  box-shadow: 0 2px 12px rgba(79, 117, 199, 0.15);
}
.input-textarea {
  flex: 1;
  border: none;
  background: transparent;
  font-size: 16px;
  color: #1a1a2e;
  resize: none;
  padding: 10px 0;
  outline: none;
  max-height: 100px;
  min-height: 40px;
  line-height: 1.5;
  font-family: inherit;
}
.input-textarea::placeholder {
  color: #9ca3af;
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
  background: #d1dcee;
  cursor: default;
  transform: none;
}
</style>
