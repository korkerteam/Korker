<script setup>
import { reactive, ref } from 'vue'

const profile = reactive({
  name: 'Tomasz Guillemant',
  accountType: 'Uczeń',
  age: '17 lat',
  location: 'Szczecin',
  gender: 'Mężczyzna',
  avatar: 'https://via.placeholder.com/80'
})

const isEditing = ref(false)
const draft = reactive({
  name: profile.name,
  accountType: profile.accountType,
  age: profile.age,
  location: profile.location,
  gender: profile.gender
})

function startEdit() {
  Object.assign(draft, profile)
  isEditing.value = true
}

function saveProfile() {
  Object.assign(profile, draft)
  isEditing.value = false
}

function cancelEdit() {
  Object.assign(draft, profile)
  isEditing.value = false
}

function triggerAvatarUpload() {
  document.getElementById('avatar-input')?.click()
}

function onAvatarChange(event) {
  const file = event.target.files?.[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = () => {
    profile.avatar = reader.result
    draft.avatar = reader.result
  }
  reader.readAsDataURL(file)
}
</script>

<template>
  <div class="profile-card">
    <div class="header">
      <img
        :src="profile.avatar"
        alt="Zdjęcie profilowe"
        class="avatar"
        @click="isEditing ? triggerAvatarUpload() : null"
        :class="{ 'avatar-editable': isEditing }"
      >
      <input id="avatar-input" type="file" accept="image/*" class="avatar-input" @change="onAvatarChange" />
      <template v-if="isEditing">
        <input v-model="draft.name" class="name-input" placeholder="Imię i nazwisko" />
      </template>
      <template v-else>
        <h2>{{ profile.name }}</h2>
      </template>
    </div>

    <div class="details">
      <template v-if="isEditing">
        <label class="field-row">
          <span>Typ konta:</span>
          <input v-model="draft.accountType" />
        </label>
        <label class="field-row">
          <span>Wiek:</span>
          <input v-model="draft.age" />
        </label>
        <label class="field-row">
          <span>Miejsce zamieszkania:</span>
          <input v-model="draft.location" />
        </label>
        <label class="field-row">
          <span>Płeć:</span>
          <input v-model="draft.gender" />
        </label>

        <div class="actions">
          <button class="save-btn" @click="saveProfile">Zapisz</button>
          <button class="cancel-btn" @click="cancelEdit">Anuluj</button>
        </div>
      </template>

      <template v-else>
        <p><strong>Typ konta:</strong> {{ profile.accountType }}</p>
        <p><strong>Wiek:</strong> {{ profile.age }}</p>
        <p><strong>Miejsce zamieszkania:</strong> {{ profile.location }}</p>
        <p><strong>Płeć:</strong> {{ profile.gender }}</p>
      </template>
    </div>

    <button v-if="!isEditing" class="edit-btn" @click="startEdit">Edytuj</button>
  </div>
</template>

<style scoped>
.profile-card {
  background-color: #4a76b8;
  padding: 28px;
  border-radius: 20px;
  width: 560px;
  min-height: 360px;
  color: white;
  font-family: sans-serif;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
}

.header {
  background-color: #e0e0e0;
  color: #333;
  padding: 10px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 15px;
}

.avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  object-fit: cover;
}

.avatar-editable {
  cursor: pointer;
  border: 2px dashed #4a76b8;
}

.avatar-input {
  display: none;
}

.name-input {
  width: 100%;
  padding: 8px;
  border: 1px solid #c7c7c7;
  border-radius: 6px;
}

.details {
  background-color: #e0e0e0;
  color: #333;
  padding: 15px;
  border-radius: 10px;
  margin-bottom: 15px;
  min-height: 140px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 8px;
}

.field-row {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 14px;
}

.field-row input {
  padding: 8px;
  border: 1px solid #c7c7c7;
  border-radius: 6px;
}

.actions {
  display: flex;
  gap: 10px;
  margin-top: 8px;
}

.edit-btn,
.save-btn,
.cancel-btn {
  width: 100%;
  padding: 10px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-weight: bold;
}

.edit-btn,
.save-btn {
  background-color: #d1d1d1;
}

.cancel-btn {
  background-color: #f0b5b5;
}
</style>
