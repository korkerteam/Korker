<script setup>
    </script>
<template>
<div class="profile-card">
  <div class="header">
    <img src="https://via.placeholder.com/80" alt="Zdjęcie profilowe" class="avatar">
    <h2>Tomasz Guillemant</h2>
  </div>
  <div class="details">
    <p><strong>Typ konta:</strong> Uczeń</p>
    <p><strong>Wiek:</strong> 17 lat</p>
    <p><strong>Miejsce zamieszkania:</strong> Szczecin</p>
    <p><strong>Płeć:</strong> Mężczyzna</p>
  </div>
  <button class="edit-btn">Edytuj</button>
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
}

.edit-btn {
  width: 100%;
  padding: 10px;
  background-color: #d1d1d1;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-weight: bold;
}   
</style>