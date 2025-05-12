<template>
  <div class="h-screen flex overflow-hidden bg-gray-100">
    <!-- Sidebar -->
    <div class="hidden md:flex md:flex-shrink-0">
      <div class="flex flex-col w-64">
        <div class="flex flex-col h-0 flex-1 bg-gray-800">
          <div class="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
            <div class="flex items-center flex-shrink-0 px-4">
              <h1 class="text-xl font-bold text-white">RBAC Admin</h1>
            </div>
            <nav class="mt-5 flex-1 px-2 space-y-1">
              <router-link 
                v-for="item in menuItems" 
                :key="item.name"
                :to="item.path"
                class="group flex items-center px-2 py-2 text-sm font-medium rounded-md"
                :class="[
                  $route.path === item.path 
                    ? 'bg-gray-900 text-white' 
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                ]"
                v-if="!item.roles || userHasAccess(item.roles)"
              >
                <component 
                  :is="item.icon" 
                  class="mr-3 h-6 w-6"
                  aria-hidden="true"
                />
                {{ item.name }}
              </router-link>
            </nav>
          </div>
          <div class="flex-shrink-0 flex bg-gray-700 p-4">
            <div class="flex-shrink-0 w-full group block">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <span class="inline-flex items-center justify-center h-10 w-10 rounded-full bg-gray-500">
                    <span class="text-lg font-medium leading-none text-white">
                      {{ user?.username?.charAt(0).toUpperCase() || 'U' }}
                    </span>
                  </span>
                </div>
                <div class="ml-3">
                  <p class="text-sm font-medium text-white">{{ user?.username || 'User' }}</p>
                  <p class="text-xs font-medium text-gray-300">{{ userRole }}</p>
                </div>
                <button 
                  @click="logout" 
                  class="ml-auto bg-gray-600 p-1 rounded-full text-gray-200 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-700 focus:ring-white"
                  title="Logout"
                >
                  <ArrowRightOnRectangleIcon class="h-6 w-6" />
                  <span class="sr-only">Logout</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Mobile menu -->
    <div class="md:hidden fixed top-0 inset-x-0 z-40 bg-gray-800 text-white p-4 flex items-center justify-between">
      <h1 class="text-xl font-bold">RBAC Admin</h1>
      <button 
        @click="mobileMenuOpen = !mobileMenuOpen" 
        class="p-2 rounded-md text-gray-300 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
      >
        <span class="sr-only">Open menu</span>
        <Bars3Icon v-if="!mobileMenuOpen" class="h-6 w-6" />
        <XMarkIcon v-else class="h-6 w-6" />
      </button>
    </div>
    
    <div 
      v-if="mobileMenuOpen" 
      class="md:hidden fixed top-16 inset-x-0 z-30 bg-gray-800 shadow-lg"
    >
      <div class="px-2 pt-2 pb-3 space-y-1">
        <router-link 
          v-for="item in menuItems"
          :key="item.name"
          :to="item.path"
          @click="mobileMenuOpen = false"
          class="block px-3 py-2 rounded-md text-base font-medium"
          :class="[
            $route.path === item.path 
              ? 'bg-gray-900 text-white' 
              : 'text-gray-300 hover:bg-gray-700 hover:text-white'
          ]"
          v-if="!item.roles || userHasAccess(item.roles)"
        >
          <component :is="item.icon" class="inline-block h-6 w-6 mr-2" />
          {{ item.name }}
        </router-link>
        
        <button 
          @click="logout" 
          class="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white focus:outline-none"
        >
          <ArrowRightOnRectangleIcon class="inline-block h-6 w-6 mr-2" />
          Logout
        </button>
      </div>
    </div>

    <!-- Main content -->
    <div class="flex flex-col w-0 flex-1 overflow-hidden pt-16 md:pt-0">
      <main class="flex-1 relative overflow-y-auto focus:outline-none">
        <div class="py-6">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
            <slot></slot>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import {
  HomeIcon,
  DocumentTextIcon,
  Bars3Icon,
  XMarkIcon,
  UserGroupIcon,
  ShieldCheckIcon,
  LockClosedIcon,
  UserIcon,
  ArrowRightOnRectangleIcon,
  Squares2X2Icon
} from '@heroicons/vue/24/outline'

const router = useRouter()
const toast = useToast()
const mobileMenuOpen = ref(false)

// Get user data from localStorage
const userDataString = localStorage.getItem('user')
const user = ref(userDataString ? JSON.parse(userDataString) : null)

// Get user role
const userRole = computed(() => {
  if (user.value?.role) {
    if (typeof user.value.role === 'string') {
      return user.value.role
    } else if (typeof user.value.role === 'object' && user.value.role.name) {
      return user.value.role.name
    }
  }
  return 'User'
})

// Menu items configuration
const menuItems = [
  {
    name: 'Dashboard',
    path: '/dashboard',
    icon: HomeIcon,
  },
  {
    name: 'Pages',
    path: '/pages',
    icon: DocumentTextIcon,
    roles: ['Admin', 'Editor']
  },
  {
    name: 'Menus',
    path: '/menus',
    icon: Squares2X2Icon,
    roles: ['Admin']
  },
  {
    name: 'Users',
    path: '/users',
    icon: UserGroupIcon,
    roles: ['Admin']
  },
  {
    name: 'Roles',
    path: '/roles',
    icon: ShieldCheckIcon,
    roles: ['Admin']
  },
  {
    name: 'Security',
    path: '/security',
    icon: LockClosedIcon,
    roles: ['Admin']
  },
  {
    name: 'Profile',
    path: '/profile',
    icon: UserIcon,
  }
]

// Check if user has access based on roles
const userHasAccess = (roles: string[]) => {
  const currentRole = userRole.value
  return roles.includes(currentRole)
}

// Handle logout
const logout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('refreshToken')
  localStorage.removeItem('user')
  
  toast.success('You have been logged out')
  router.push('/login')
}
</script>