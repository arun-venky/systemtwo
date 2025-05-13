<template>
  <div class="min-h-screen bg-gray-50">
    <router-view v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useAuthStore } from '@/store/auth.store';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();

// Check auth status
const checkAuthStatus = async () => {
  const isAuthenticated = await authStore.checkAuth();
  if (!isAuthenticated) {
    // Handle unauthenticated state
    router.push('/login');
  }
};

// Call on component mount
onMounted(() => {
  checkAuthStatus();
});
</script>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>