<template>
  <div class="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
        Sign in to your account
      </h2>
      <p class="mt-2 text-center text-sm text-gray-600">
        Or
        <router-link to="/signup" class="font-medium text-blue-600 hover:text-blue-500">
          create a new account
        </router-link>
      </p>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
        <form class="space-y-6" @submit.prevent="handleSubmit">
          <div v-if="state.context.errorMessage" class="rounded-md bg-red-50 p-4">
            <div class="flex">
              <div class="flex-shrink-0">
                <XCircleIcon class="h-5 w-5 text-red-400" aria-hidden="true" />
              </div>
              <div class="ml-3">
                <h3 class="text-sm font-medium text-red-800">
                  {{ state.context.errorMessage }}
                </h3>
              </div>
            </div>
          </div>

          <FormInput
            v-model="email"
            id="email"
            label="Email address"
            type="email"
            autocomplete="email"
            required
            :error="emailError"
          />

          <FormInput
            v-model="password"
            id="password"
            label="Password"
            type="password"
            autocomplete="current-password"
            required
            :error="passwordError"
          />

          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                v-model="rememberMe"
                class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label for="remember-me" class="ml-2 block text-sm text-gray-900">
                Remember me
              </label>
            </div>

            <div class="text-sm">
              <a href="#" class="font-medium text-blue-600 hover:text-blue-500">
                Forgot your password?
              </a>
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            :fullWidth="true"
            :disabled="state.matches('authenticating')"
          >
            <template v-if="state.matches('authenticating')">
              <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Signing in...
            </template>
            <template v-else>
              Sign in
            </template>
          </Button>
        </form>
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