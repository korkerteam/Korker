<script setup>
import MenuPage from './views/MenuPage.vue'
import HeaderKorker from './components/HeaderKorker.vue'
import FilterPage from './components/FilterPage.vue'
import MyTeachers from './components/MyTeachers.vue'
</script>

<template>
  <div class="main-layout">
    
    <div class="Przyciski">
      <div class="Korker">
        <HeaderKorker/>
      </div>
      <MenuPage/>
    </div>

    <div class="Okienka">
      
    </div>

  </div>
</template>

<style scoped>
.main-layout {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  gap: 20px;             
}

.Korker {
  margin-bottom: 10px;
}
.Okienka {
  flex-grow: 1; 
}
</style>