<script setup>
import MenuPage from './views/MenuPage.vue'
import HeaderKorker from './components/HeaderKorker.vue'
import FilterPage from './components/FilterPage.vue'
import MyTeachers from './components/MyTeachers.vue'
import SearchBar from './views/SearchBar.vue';
</script>

<template>
  <div class="main-layout">
    
      <DIV class="align-left">
      <div class="Korker">
        <HeaderKorker/>
      </div>
      <div>
        <SearchBar/>
      </div>
      </DIV>
          <div class="Przyciski">
      <MenuPage/>
    </div>

    <div class="Okienka">
      
    </div>

  </div>
</template>

<style scoped>
.main-layout {
  display: flex;
  flex-direction: column;
  gap: 20px;             
}

.Korker {
  margin-bottom: 10px;
}
.Okienka {
  flex-grow: 1; 
}

.align-left {
  display: flex;
  flex-direction: row;
  gap: 830px;
}
</style>