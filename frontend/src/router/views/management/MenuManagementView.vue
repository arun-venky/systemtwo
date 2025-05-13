<template>
  <div class="min-h-screen bg-gray-50 py-12">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="flex justify-between items-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900">Menu Management</h1>
        <div class="flex space-x-2">
          <input
            type="text"
            v-model="searchQuery"
            placeholder="Search menus..."
            class="form-input"
          />
          <Button
            variant="primary"
            @click="raiseEvent('CREATE')"
            :disabled="isCurrentState('creating')"
          >
            Create Menu
          </Button>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="isCurrentState('loading')" class="flex justify-center items-center py-12">
        <Spinner size="lg" />
      </div>

      <!-- Error State -->
      <div v-else-if="isCurrentState('error')" class="bg-red-50 p-4 rounded-md mb-6">
        <div class="flex">
          <div class="flex-shrink-0">
            <ExclamationCircleIcon class="h-5 w-5 text-red-400" />
          </div>
          <div class="ml-3">
            <h3 class="text-sm font-medium text-red-800">Error</h3>
            <div class="mt-2 text-sm text-red-700">
              {{ state.context.errorMessage }}
            </div>
            <div class="mt-4">
              <Button variant="danger" @click="raiseEvent('RETRY')">Retry</Button>
            </div>
          </div>
        </div>
      </div>

      <!-- Menu List -->
      <div v-else class="bg-white shadow overflow-hidden sm:rounded-md">
        <div class="px-4 py-5 sm:px-6 flex justify-between items-center">
          <div class="flex items-center space-x-2">
            <input
              type="checkbox"
              v-model="selectAll"
              class="form-checkbox"
              @change="toggleSelectAll"
            />
            <span class="text-sm text-gray-500">Select All</span>
          </div>
          <div v-if="selectedMenus.length" class="flex space-x-2">
            <Button
              variant="danger"
              @click="bulkDelete"
            >
              Delete Selected
            </Button>
          </div>
        </div>
        <ul class="divide-y divide-gray-200">
          <li v-for="menu in filteredMenus" :key="menu._id">
            <div class="px-4 py-4 sm:px-6">
              <div class="flex items-center justify-between">
                <div class="flex items-center">
                  <input
                    type="checkbox"
                    :value="menu._id"
                    v-model="selectedMenus"
                    class="form-checkbox mr-4"
                  />
                  <div class="flex-shrink-0">
                    <MenuIcon class="h-6 w-6 text-gray-400" />
                  </div>
                  <div class="ml-4">
                    <h2 class="text-lg font-medium text-gray-900">{{ menu.name }}</h2>
                    <p class="text-sm text-gray-500">{{ menu.description }}</p>
                    <div class="mt-1 flex space-x-2">
                      <Badge
                        :variant="menu.isActive ? 'success' : 'warning'"
                      >
                        {{ menu.isActive ? 'Active' : 'Inactive' }}
                      </Badge>
                      <Badge
                        v-if="menu.isPublic"
                        variant="info"
                      >
                        Public
                      </Badge>
                    </div>
                  </div>
                </div>
                <div class="flex space-x-2">
                  <Button
                    variant="ghost"
                    @click="openItemsModal(menu)"
                  >
                    Manage Items
                  </Button>
                  <Button
                    variant="ghost"
                    @click="editMenu(menu)"
                  >
                    Edit
                  </Button>
                  <Button
                    variant="danger"
                    @click="deleteMenu(menu)"
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          </li>
        </ul>
      </div>

      <!-- Create/Edit Menu Modal -->
      <Modal
        v-if="isCurrentState('creating') || isCurrentState('editing')"
        :title="isCurrentState('creating') ? 'Create Menu' : 'Edit Menu'"
        @close="raiseEvent('CANCEL')"
      >
        <form @submit.prevent="saveMenu">
          <div class="space-y-4">
            <div>
              <label class="form-label">Name</label>
              <input
                type="text"
                v-model="state.context.formData.name"
                class="form-input"
                required
              />
            </div>
            <div>
              <label class="form-label">Description</label>
              <textarea
                v-model="state.context.formData.description"
                class="form-textarea"
                rows="3"
              />
            </div>
            <div class="flex items-center space-x-2">
              <input
                type="checkbox"
                v-model="state.context.formData.isActive"
                class="form-checkbox"
              />
              <label class="form-label">Active</label>
            </div>
            <div class="flex items-center space-x-2">
              <input
                type="checkbox"
                v-model="state.context.formData.isPublic"
                class="form-checkbox"
              />
              <label class="form-label">Public</label>
            </div>
          </div>
          <div class="flex justify-end space-x-2 mt-6">
            <Button
              type="button"
              variant="ghost"
              @click="raiseEvent('CANCEL')"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
            >
              {{ isCurrentState('creating') ? 'Create' : 'Save' }}
            </Button>
          </div>
        </form>
      </Modal>

      <!-- Menu Items Modal -->
      <Modal
        v-if="showItemsModal"
        title="Manage Menu Items"
        @close="showItemsModal = false"
      >
        <div class="space-y-4">
          <div class="flex justify-between items-center">
            <h3 class="text-lg font-medium">Menu Items</h3>
            <Button
              variant="primary"
              @click="editingItem = { label: '', url: '', roles: [], order: 0 }"
            >
              Add Item
            </Button>
          </div>

          <!-- Add/Edit Item Form -->
          <div v-if="editingItem" class="bg-gray-50 p-4 rounded-md">
            <form @submit.prevent="saveMenuItem">
              <div class="space-y-4">
                <div>
                  <label class="form-label">Label</label>
                  <input
                    type="text"
                    v-model="editingItem.label"
                    class="form-input"
                    required
                  />
                </div>
                <div>
                  <label class="form-label">URL</label>
                  <input
                    type="text"
                    v-model="editingItem.url"
                    class="form-input"
                    required
                  />
                </div>
                <div>
                  <label class="form-label">Icon</label>
                  <input
                    type="text"
                    v-model="editingItem.icon"
                    class="form-input"                  
                  />
                </div>
                <div class="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    v-model="editingItem.isActive"
                    class="form-checkbox"
                  />
                  <label class="form-label">Active</label>
                </div>
                <div class="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="ghost"
                    @click="editingItem = null"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                  >
                    {{ editingItem._id ? 'Update' : 'Add' }}
                  </Button>
                </div>
              </div>
            </form>
          </div>

          <!-- Items List -->
          <div class="space-y-2">
            <div
              v-for="item in menuItems"
              :key="item._id"
              class="flex items-center justify-between p-2 bg-white rounded-md border"
            >
              <div class="flex items-center space-x-2">
                <span class="text-sm font-medium">{{ item.label }}</span>
                <Badge
                  :variant="item.isActive ? 'success' : 'warning'"
                >
                  {{ item.isActive ? 'Active' : 'Inactive' }}
                </Badge>
              </div>
              <div class="flex space-x-2">
                <Button
                  variant="ghost"
                  @click="editingItem = { ...item }"
                >
                  Edit
                </Button>
                <Button
                  variant="danger"
                  @click="deleteMenuItem(item._id || '')"
                >
                  Delete
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Modal>

      <!-- Delete Confirmation Modal -->
      <Modal
        v-if="isCurrentState('deleting')"
        title="Delete Menu"
        @close="raiseEvent('CANCEL')"
      >
        <div class="space-y-4">
          <p class="text-sm text-gray-500">
            Are you sure you want to delete this menu? This action cannot be undone.
          </p>
          <div class="flex justify-end space-x-2">
            <Button
              variant="ghost"
              @click="raiseEvent('CANCEL')"
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { ListBulletIcon, ExclamationCircleIcon } from '@heroicons/vue/24/outline';
import Button from '../../../components/ui/button.vue';
import Modal from '../../../components/ui/modal.vue';
import Spinner from '../../../components/ui/spinner.vue';
import Badge from '../../../components/ui/badge.vue';
import { useMenuManagement } from '../../../composables/useMenuManagement';
import { useMenuItems } from '../../../composables/useMenuItems';

// Use composables
const {
  state,
  searchQuery,
  selectedMenus,
  showBulkActions,
  filteredMenus,
  isCurrentState,
  raiseEvent,
  editMenu,
  deleteMenu,
  confirmDelete,
  saveMenu,
  bulkDelete
} = useMenuManagement();

const {
  showItemsModal,
  selectedMenu,
  menuItems,
  editingItem,
  openItemsModal,
  addMenuItem,
  updateMenuItem,
  deleteMenuItem,
  reorderItems
} = useMenuItems();

// Computed
const selectAll = computed({
  get: () => selectedMenus.value.length === filteredMenus.value.length,
  set: (value) => {
    selectedMenus.value = value ? filteredMenus.value.map((menu: { _id: any; }) => menu._id) : [];
  }
});

// Methods
const toggleSelectAll = () => {
  if (selectAll.value) {
    selectedMenus.value = filteredMenus.value.map((menu: { _id: any; }) => menu._id);
  } else {
    selectedMenus.value = [];
  }
};

const saveMenuItem = async () => {
  if (!editingItem.value) return;
  
  let success;
  if (editingItem.value._id) {
    success = await updateMenuItem(editingItem.value._id, editingItem.value);
  } else {
    success = await addMenuItem(editingItem.value);
  }

  if (success) {
    editingItem.value = null;
  }
};

// Fetch menus on mount
onMounted(() => {
  raiseEvent('FETCH');
});
</script>