<template>
  <DashboardLayout>
    <div class="section">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-semibold text-gray-900">Page Management</h1>
        <Button 
          variant="primary"
          @click="send('CREATE')"
        >
          Create Page
        </Button>
      </div>

      <!-- Loading State -->
      <div v-if="state.matches('loading')" class="flex justify-center py-8">
        <svg class="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>

      <!-- Error State -->
      <Card v-else-if="state.matches('error')">
        <div class="text-center py-4">
          <div class="text-red-600 mb-3">{{ state.context.errorMessage }}</div>
          <Button variant="primary" @click="send('RETRY')">Retry</Button>
        </div>
      </Card>

      <!-- Page List -->
      <div v-else-if="state.matches('idle')" class="space-y-6">
        <Card v-for="page in state.context.pages" :key="page._id">
          <div class="flex justify-between items-start">
            <div>
              <h3 class="text-lg font-medium text-gray-900">{{ page.title }}</h3>
              <div class="flex items-center space-x-2 mt-1">
                <span class="text-sm text-gray-500">{{ page.slug }}</span>
                <span :class="[
                  'badge',
                  page.isPublished ? 'badge-green' : 'badge-yellow'
                ]">
                  {{ page.isPublished ? 'Published' : 'Draft' }}
                </span>
              </div>
            </div>
            <div class="flex space-x-2">
              <Button 
                variant="secondary"
                size="sm"
                @click="send('EDIT', { id: page._id })"
              >
                Edit
              </Button>
              <Button 
                variant="danger"
                size="sm"
                @click="send('DELETE', { id: page._id })"
              >
                Delete
              </Button>
            </div>
          </div>

          <div class="mt-4">
            <p class="text-sm text-gray-600">
              {{ truncateContent(page.content) }}
            </p>
            <div class="mt-2 text-sm text-gray-500">
              Last updated: {{ formatDate(page.updatedAt) }}
            </div>
          </div>
        </Card>

        <!-- Empty State -->
        <Card v-if="state.context.pages.length === 0">
          <div class="text-center py-6">
            <p class="text-gray-500">No pages found. Create your first page to get started.</p>
          </div>
        </Card>
      </div>

      <!-- Create/Edit Form -->
      <Modal 
        v-if="state.matches('creating') || state.matches('editing')"
        :title="state.matches('creating') ? 'Create Page' : 'Edit Page'"
        @close="send('CANCEL')"
      >
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <FormInput
            v-model="state.context.formData.title"
            id="page-title"
            label="Page Title"
            type="text"
            required
          />

          <FormInput
            v-model="state.context.formData.slug"
            id="page-slug"
            label="URL Slug"
            type="text"
            required
            :hint="slugHint"
          />

          <div class="space-y-2">
            <label class="form-label" for="page-content">Content</label>
            <textarea
              id="page-content"
              v-model="state.context.formData.content"
              rows="10"
              class="form-input"
              required
            ></textarea>
          </div>

          <div class="flex items-center space-x-2">
            <input
              type="checkbox"
              id="page-published"
              v-model="state.context.formData.isPublished"
              class="form-checkbox h-4 w-4 text-blue-600"
            >
            <label for="page-published" class="text-sm text-gray-700">
              Publish this page
            </label>
          </div>

          <div class="flex justify-end space-x-2 mt-6">
            <Button 
              type="button"
              variant="ghost"
              @click="send('CANCEL')"
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              variant="primary"
            >
              {{ state.matches('creating') ? 'Create' : 'Save' }}
            </Button>
          </div>
        </form>
      </Modal>

      <!-- Delete Confirmation -->
      <Modal
        v-if="state.matches('deleting')"
        title="Delete Page"
        @close="send('CANCEL')"
      >
        <div class="space-y-4">
          <p class="text-sm text-gray-500">
            Are you sure you want to delete this page? This action cannot be undone.
          </p>
          <div class="flex justify-end space-x-2">
            <Button 
              variant="ghost"
              @click="send('CANCEL')"
            >
              Cancel
            </Button>
            <Button 
              variant="danger"
              @click="confirmDelete"
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useMachine } from '@xstate/vue'
import { useToast } from 'vue-toastification'
import { createPageMachine } from '../../machines/pageMachine'
import DashboardLayout from '../../components/layout/DashboardLayout.vue'
import Button from '../../components/ui/Button.vue'
import Card from '../../components/ui/Card.vue'
import FormInput from '../../components/ui/FormInput.vue'
import Modal from '../../components/ui/Modal.vue'

const toast = useToast()

// Initialize page machine
const { state, send } = useMachine(createPageMachine())

// Computed hint for slug field
const slugHint = computed(() => {
  if (state.context.formData.title && !state.context.formData.slug) {
    const suggestedSlug = state.context.formData.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
    return `Suggested slug: ${suggestedSlug}`
  }
  return 'URL-friendly version of the title (e.g., my-page-title)'
})

// Handle form submission
const handleSubmit = () => {
  // Generate slug from title if not provided
  if (!state.context.formData.slug && state.context.formData.title) {
    state.context.formData.slug = state.context.formData.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  }

  send('SAVE', { data: state.context.formData })
}

// Handle delete confirmation
const confirmDelete = () => {
  if (state.context.selectedPage) {
    send('DELETE', { id: state.context.selectedPage._id })
  }
}

// Format date
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Truncate content for preview
const truncateContent = (content: string) => {
  if (!content) return ''
  return content.length > 200 ? content.substring(0, 200) + '...' : content
}

// Fetch pages on mount
onMounted(() => {
  send('FETCH')
})
</script>