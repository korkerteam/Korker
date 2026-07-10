<script setup>
import MenuPage from './views/MenuPage.vue'
import HeaderKorker from './views/HeaderKorker.vue'
import FilterPage from './views/FilterPage.vue'
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

.Przyciski {

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