import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../store/auth.store'
import type { RouteRecordRaw } from 'vue-router'

// Layout components
import DashboardLayout from '../router/layouts/DashboardLayout.vue';

// Auth views
import LoginView from '../router/views/auth/LoginView.vue'
import SignupView from '../router/views/auth/SignupView.vue'
import ForgotPasswordView from '../router/views/auth/ForgotPasswordView.vue'
import ResetPasswordView from '../router/views/auth/ResetPasswordView.vue'

// Dashboard views
import DashboardView from '../router/views/dashboard/DashboardView.vue'

// Management views
import RoleManagementView from '../router/views/management/RoleManagementView.vue'
import PageManagementView from '../router/views/management/PageManagementView.vue'
import SecurityManagementView from '../router/views/management/SecurityManagementView.vue'
import MenuManagementView from '../router/views/management/MenuManagementView.vue'
import UserManagementView from '../router/views/management/UserManagementView.vue'

// Error views
import ForbiddenView from '../router/views/errors/ForbiddenView.vue'
import NotFoundView from '../router/views/errors/NotFoundView.vue'
import UnauthorizedView from '../router/views/errors/UnauthorizedView.vue'

// Import layouts
import AdminLayout from '../router/layouts/AdminLayout.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: DashboardLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'dashboard',
        component: DashboardView,
        meta: { title: 'Dashboard' }
      },
      {
        path: 'management',
        meta: { requiresAdmin: true },
        children: [
          {
            path: 'roles',
            name: 'role-management',
            component: RoleManagementView,
            meta: { 
              title: 'Role Management',
              permissions: ['roles', 'read']
            }
          },
          {
            path: 'pages',
            name: 'page-management',
            component: PageManagementView,
            meta: { 
              title: 'Page Management',
              permissions: ['pages', 'read']
            }
          },
          {
            path: 'security',
            name: 'security-management',
            component: SecurityManagementView,
            meta: { 
              title: 'Security Management',
              permissions: ['security', 'read']
            }
          }
        ]
      }
    ]
  },
  {
    path: '/auth',
    children: [
      {
        path: 'login',
        name: 'login',
        component: LoginView,
        meta: { title: 'Login' }
      },
      {
        path: 'signup',
        name: 'signup',
        component: SignupView,
        meta: { title: 'Sign Up' }
      },
      {
        path: 'forgot-password',
        name: 'forgot-password',
        component: ForgotPasswordView,
        meta: {
          requiresAuth: false
        }
      },
      {
        path: 'reset-password',
        name: 'reset-password',
        component: ResetPasswordView,
        meta: {
          requiresAuth: false
        }
      }
    ]
  },
  {
    path: '/unauthorized',
    name: 'unauthorized',
    component: UnauthorizedView,
    meta: {
      requiresAuth: false
    }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: NotFoundView,
    meta: { title: 'Not Found' }
  },
  {
    path: '/admin',
    component: AdminLayout,
    meta: {
      requiresAuth: true,
      requiresAdmin: true
    },
    children: [
      {
        path: 'menus',
        name: 'menu-management',
        component: MenuManagementView,
        meta: {
          title: 'Menu Management',
          icon: 'MenuIcon',
          requiresPermission: 'menu:manage'
        }
      },
      {
        path: 'users',
        name: 'user-management',
        component: UserManagementView,
        meta: {
          title: 'User Management',
          icon: 'UserIcon',
          requiresPermission: 'user:manage'
        }
      },
      {
        path: 'roles',
        name: 'role-management',
        component: RoleManagementView,
        meta: {
          title: 'Role Management',
          icon: 'ShieldCheckIcon',
          requiresPermission: 'role:manage'
        }
      },
      {
        path: 'security',
        name: 'security-management',
        component: SecurityManagementView,
        meta: {
          title: 'Security Management',
          icon: 'LockClosedIcon',
          requiresPermission: 'security:manage'
        }
      },
      {
        path: 'pages',
        name: 'page-management',
        component: PageManagementView,
        meta: {
          title: 'Page Management',
          icon: 'DocumentIcon',
          requiresPermission: 'page:manage'
        }
      }
    ]
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
router.beforeEach(async (to, from, next) => {
  // const authStore = useAuthStore()
  // const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  // const requiresAdmin = to.matched.some(record => record.meta.requiresAdmin)
  // const requiresPermission = to.meta.requiresPermission as string | undefined

  // Set page title
  document.title = `${to.meta.title} | SystemTwo`

  // // Check authentication status
  // const isAuthenticated = await authStore.checkAuth()

  // // Check if route requires authentication
  // if (requiresAuth && !isAuthenticated) {
  //   next({ name: 'login', query: { redirect: to.fullPath } })
  //   return
  // }

  // // Check if route requires admin role
  // if (requiresAdmin && !authStore.isAdmin) {
  //   next({ 
  //     name: 'unauthorized',
  //     query: { 
  //       requiredRole: 'admin',
  //       path: to.fullPath 
  //     }
  //   })
  //   return
  // }

  // Check if route requires specific permission
  // if (requiresPermission && !authStore.hasPermission(requiresPermission)) {
  //   next({ 
  //     name: 'unauthorized',
  //     query: { 
  //       requiredPermission: requiresPermission,
  //       path: to.fullPath 
  //     }
  //   })
  //   return
  // }

  next()
})

export default router