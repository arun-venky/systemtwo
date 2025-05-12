<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Welcome back
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          Don't have an account?
          <router-link to="/signup" class="font-medium text-blue-600 hover:text-blue-500 transition-colors duration-200">
            Sign up now
          </router-link>
        </p>
      </div>

      <div class="bg-white shadow-xl rounded-xl p-8">
        <form class="space-y-6" @submit.prevent="handleSubmit">
          <!-- Error Alert -->
          <div v-if="state.context.errorMessage" 
               class="rounded-lg bg-red-50 p-4 border-l-4 border-red-500">
            <div class="flex">
              <div class="flex-shrink-0">
                <XCircleIcon class="h-5 w-5 text-red-400" aria-hidden="true" />
              </div>
              <div class="ml-3">
                <p class="text-sm text-red-700">{{ state.context.errorMessage }}</p>
              </div>
            </div>
          </div>

          <!-- Email Input -->
          <FormInput
            v-model="email"
            id="email"
            label="Email address"
            type="email"
            autocomplete="email"
            required
            :error="emailError"
            placeholder="you@example.com"
          />

          <!-- Password Input -->
          <FormInput
            v-model="password"
            id="password"
            label="Password"
            type="password"
            autocomplete="current-password"
            required
            :error="passwordError"
            placeholder="••••••••"
          />

          <!-- Remember Me & Forgot Password -->
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                v-model="rememberMe"
                class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded transition duration-150 ease-in-out"
              />
              <label for="remember-me" class="ml-2 block text-sm text-gray-900">
                Remember me
              </label>
            </div>

            <div class="text-sm">
              <a href="#" class="font-medium text-blue-600 hover:text-blue-500 transition-colors duration-200">
                Forgot password?
              </a>
            </div>
          </div>

          <!-- Submit Button -->
          <Button
            type="submit"
            variant="primary"
            size="lg"
            :fullWidth="true"
            :disabled="state.matches('authenticating')"
            class="mt-6"
          >
            <template v-if="state.matches('authenticating')">
              <div class="flex items-center justify-center">
                <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Signing in...</span>
              </div>
            </template>
            <template v-else>
              Sign in to your account
            </template>
          </Button>
        </form>

        <!-- Social Sign In (Optional) -->
        <div class="mt-6">
          <div class="relative">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-gray-300"></div>
            </div>
            <div class="relative flex justify-center text-sm">
              <span class="px-2 bg-white text-gray-500">
                Or continue with
              </span>
            </div>
          </div>

          <div class="mt-6 grid grid-cols-2 gap-3">
            <button
              type="button"
              class="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors duration-200"
            >
              <span class="sr-only">Sign in with Google</span>
              Google
            </button>
            <button
              type="button"
              class="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors duration-200"
            >
              <span class="sr-only">Sign in with GitHub</span>
              GitHub
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useMachine } from '@xstate/vue'
import { createAuthMachine } from '../../machines/authMachine'
import { XCircleIcon } from '@heroicons/vue/24/solid'
import Button from '../../components/ui/Button.vue'
import FormInput from '../../components/ui/FormInput.vue'

const route = useRoute()

// Form data
const email = ref('')
const password = ref('')
const rememberMe = ref(false)

// Form validation
const emailError = computed(() => {
  if (email.value && !email.value.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
    return 'Please enter a valid email address'
  }
  return ''
})

const passwordError = computed(() => {
  if (password.value && password.value.length < 6) {
    return 'Password must be at least 6 characters'
  }
  return ''
})

// Get redirect path from query params
const redirectPath = route.query.redirect as string || '/dashboard'

// Initialize auth machine
const { state, send } = useMachine(createAuthMachine({
  redirectTo: redirectPath
}))

// Handle form submission
const handleSubmit = () => {
  if (emailError.value || passwordError.value) {
    return
  }

  send({
    type: 'LOGIN',
    email: email.value,
    password: password.value
  })
}
</script>