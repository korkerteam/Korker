<script setup></script>
<template>
  <form action="/search" method="get">
    <input type="search" name="q" placeholder="Szukaj..." aria-label="Szukaj w witrynie" />
    <button type="submit">Szukaj</button>
  </form>
</template>
<style scoped>
form {
  display: flex;
  gap: 5px;
}

input[type='search'] {
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
}
</style>
