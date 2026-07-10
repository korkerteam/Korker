<script setup>
import MenuPage from './views/MenuPage.vue'
import HeaderKorker from './components/HeaderKorker.vue'
import FilterPage from './components/FilterPage.vue'
import SearchBar from './views/SearchBar.vue'
import ProfilePage from './views/ProfilePage.vue'
</script>

<template>
  <div class="main-layout">
    <div class="top-row">
      <div class="align-left">
        <div class="Korker">
          <HeaderKorker />
        </div>
        <div class="search-block">
          <SearchBar />
        </div>
      </div>
    </div>

    <div class="profile-block">
      <ProfilePage />
    </div>
    <div class="Czaty">
      <CzatCzatSahur/>
    </div>

    <div class="content-row">
      <div class="Przyciski">
        <MenuPage />
      </div>
    </div>
  </div>
</template>

<style scoped>
.main-layout {
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-height: 100vh;
  position: relative;
}

.top-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 20px;
}

.align-left {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 20px;
}

.search-block {
  display: flex;
  align-items: center;
}

.Korker {
  margin-bottom: 10px;
}

.profile-block {
  position: absolute;
  top: 50%;
  right: 340px;
  transform: translateY(-50%);
  display: flex;
  justify-content: flex-end;
}

.content-row {
  display: flex;
  gap: 20px;
  align-items: flex-start;
}

.Przyciski {
  flex-shrink: 0;
}
</style>
