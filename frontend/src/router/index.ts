import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import { useToast } from 'vue-toastification'
import HomeView from '../views/HomeView.vue'
import LoginView from '../views/auth/LoginView.vue'
import SignupView from '../views/auth/SignupView.vue'
import DashboardView from '../views/dashboard/DashboardView.vue'
import ProfileView from '../views/dashboard/ProfileView.vue'
import ForbiddenView from '../views/errors/ForbiddenView.vue'
import NotFoundView from '../views/errors/NotFoundView.vue'

const toast = useToast()

// Route definitions
const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Home',
    component: HomeView,
    meta: { requiresAuth: false }
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginView,
    meta: { requiresAuth: false }
  },
  {
    path: '/signup',
    name: 'Signup',
    component: SignupView,
    meta: { requiresAuth: false }
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: DashboardView,
    meta: { requiresAuth: true }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: ProfileView,
    meta: { requiresAuth: true }
  },
  {
    path: '/users',
    name: 'UserManagement',
    component: () => import('../views/management/UserManagementView.vue'),
    meta: { requiresAuth: true, requiresRole: ['Admin'] }
  },
  {
    path: '/pages',
    name: 'PageManagement',
    component: () => import('../views/management/PageManagementView.vue'),
    meta: { requiresAuth: true, requiresRole: ['Admin', 'Editor'] }
  },
  {
    path: '/menus',
    name: 'MenuManagement',
    component: () => import('../views/management/MenuManagementView.vue'),
    meta: { requiresAuth: true, requiresRole: ['Admin'] }
  },
  {
    path: '/roles',
    name: 'RoleManagement',
    component: () => import('../views/management/RoleManagementView.vue'),
    meta: { requiresAuth: true, requiresRole: ['Admin'] }
  },
  {
    path: '/security',
    name: 'SecurityManagement',
    component: () => import('../views/management/SecurityManagementView.vue'),
    meta: { requiresAuth: true, requiresRole: ['Admin'] }
  },
  {
    path: '/forbidden',
    name: 'Forbidden',
    component: ForbiddenView,
    meta: { requiresAuth: false }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: NotFoundView,
    meta: { requiresAuth: false }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(_to, _from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

// Navigation guard
router.beforeEach((to, _from, next) => {
  const isAuthenticated = !!localStorage.getItem('token')
  const userDataString = localStorage.getItem('user')
  const userData = userDataString ? JSON.parse(userDataString) : null
  
  // Routes that require authentication
  if (to.meta.requiresAuth && !isAuthenticated) {
    toast.warning('Please log in to access this page')
    return next({ name: 'Login', query: { redirect: to.fullPath } })
  }
  
  // Routes that require specific roles
  if (to.meta.requiresRole && isAuthenticated && userData) {
    const requiredRoles = to.meta.requiresRole as string[]
    const userRole = userData.role ? userData.role.name : null
    
    if (!userRole || !requiredRoles.includes(userRole)) {
      toast.error('You do not have permission to access this page')
      return next({ name: 'Forbidden' })
    }
  }
  
  // Prevent authenticated users from accessing login/signup pages
  if ((to.name === 'Login' || to.name === 'Signup') && isAuthenticated) {
    return next({ name: 'Dashboard' })
  }
  
  next()
})

export default router