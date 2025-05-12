<template>
  <DashboardLayout>
    <div class="section">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-semibold text-gray-900">Menu Management</h1>
        <Button 
          variant="primary"
          @click="send('CREATE')"
        >
          Create Menu
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

      <!-- Menu List -->
      <div v-else-if="state.matches('idle')" class="space-y-6">
        <Card v-for="menu in state.context.menus" :key="menu._id">
          <div class="flex justify-between items-start">
            <div>
              <h3 class="text-lg font-medium text-gray-900">{{ menu.name }}</h3>
              <p class="text-sm text-gray-500">{{ menu.items.length }} items</p>
            </div>
            <div class="flex space-x-2">
              <Button 
                variant="secondary"
                size="sm"
                @click="send('EDIT', { id: menu._id })"
              >
                Edit
              </Button>
              <Button 
                variant="danger"
                size="sm"
                @click="send('DELETE', { id: menu._id })"
              >
                Delete
              </Button>
            </div>
          </div>

          <!-- Menu Items -->
          <div class="mt-4">
            <ul class="divide-y divide-gray-200">
              <li v-for="item in menu.items" :key="item._id" class="py-3">
                <div class="flex justify-between items-center">
                  <div>
                    <div class="text-sm font-medium text-gray-900">{{ item.label }}</div>
                    <div class="text-sm text-gray-500">{{ item.url }}</div>
                  </div>
                  <div class="flex items-center space-x-2">
                    <span v-for="role in item.roles" :key="role" class="badge badge-blue">
                      {{ role }}
                    </span>
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </Card>
      </div>

      <!-- Create/Edit Form -->
      <Modal 
        v-if="state.matches('creating') || state.matches('editing')"
        :title="state.matches('creating') ? 'Create Menu' : 'Edit Menu'"
        @close="send('CANCEL')"
      >
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <FormInput
            v-model="state.context.formData.name"
            id="menu-name"
            label="Menu Name"
            type="text"
            required
          />

          <!-- Menu Items -->
          <div class="space-y-4">
            <div class="flex justify-between items-center">
              <h4 class="text-sm font-medium text-gray-900">Menu Items</h4>
              <Button 
                type="button"
                variant="secondary"
                size="sm"
                @click="send('ADD_ITEM')"
              >
                Add Item
              </Button>
            </div>

            <div v-for="(item, index) in state.context.formData.items" :key="index" class="space-y-4 p-4 bg-gray-50 rounded-md">
              <div class="flex justify-between">
                <h5 class="text-sm font-medium text-gray-900">Item {{ index + 1 }}</h5>
                <Button 
                  type="button"
                  variant="danger"
                  size="sm"
                  @click="send('REMOVE_ITEM', { index })"
                >
                  Remove
                </Button>
              </div>

              <FormInput
                v-model="item.label"
                :id="'item-label-' + index"
                label="Label"
                type="text"
                required
              />

              <FormInput
                v-model="item.url"
                :id="'item-url-' + index"
                label="URL"
                type="text"
                required
              />

              <div class="space-y-2">
                <label class="form-label">Roles</label>
                <div class="space-x-2">
                  <label v-for="role in state.context.roles" :key="role._id" class="inline-flex items-center">
                    <input
                      type="checkbox"
                      :value="role.name"
                      v-model="item.roles"
                      class="form-checkbox h-4 w-4 text-blue-600"
                    >
                    <span class="ml-2 text-sm text-gray-700">{{ role.name }}</span>
                  </label>
                </div>
              </div>
            </div>
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
        title="Delete Menu"
        @close="send('CANCEL')"
      >
        <div class="space-y-4">
          <p class="text-sm text-gray-500">
            Are you sure you want to delete this menu? This action cannot be undone.
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
import { onMounted } from 'vue'
import { useMachine } from '@xstate/vue'
import { useToast } from 'vue-toastification'
import { createMenuMachine } from '../../machines/menuMachine'
import DashboardLayout from '../../components/layout/DashboardLayout.vue'
import Button from '../../components/ui/Button.vue'
import Card from '../../components/ui/Card.vue'
import FormInput from '../../components/ui/FormInput.vue'
import Modal from '../../components/ui/Modal.vue'

const toast = useToast()

// Initialize menu machine
const { state, send } = useMachine(createMenuMachine())

// Handle form submission
const handleSubmit = () => {
  send('SAVE', { data: state.context.formData })
}

// Handle delete confirmation
const confirmDelete = () => {
  if (state.context.selectedMenu) {
    send('DELETE', { id: state.context.selectedMenu._id })
  }
}

// Fetch menus on mount
onMounted(() => {
  send('FETCH')
})
</script>