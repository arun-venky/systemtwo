<template>
  <div class="page-container">
    <div class="section">
      <!-- Header -->
      <div class="flex-between mb-6">
        <h1 class="section-title">User Management</h1>
        <div class="flex space-x-2">
          <input
            type="text"
            v-model="searchQuery"
            placeholder="Search users..."
            class="form-input"
          />
          <Button
            variant="primary"
            @click="raiseEvent('CREATE')"
            :disabled="isCurrentState('creating')"
          >
            Create User
          </Button>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="isCurrentState('loading')" class="flex-center py-12">
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

      <!-- User List -->
      <div v-else class="card">
        <div class="card-header">
          <div class="flex-between">
            <div class="flex items-center space-x-2">
              <input
                type="checkbox"
                v-model="selectAll"
                class="form-checkbox"
                @change="toggleSelectAll"
              />
              <span class="text-sm text-gray-500">Select All</span>
            </div>
            <div v-if="selectedUsers.length" class="flex space-x-2">
              <Button
                variant="danger"
                @click="raiseEvent('BULK_DELETE')"
              >
                Delete Selected
              </Button>
              <Button
                variant="primary"
                @click="showBulkRolesModal = true"
              >
                Assign Roles
              </Button>
            </div>
          </div>
        </div>
        <ul class="divide-y divide-gray-200">
          <li v-for="user in filteredUsers" :key="user._id">
            <div class="px-4 py-4 sm:px-6">
              <div class="flex-between">
                <div class="flex items-center">
                  <input
                    type="checkbox"
                    :value="user._id"
                    v-model="selectedUsers"
                    class="form-checkbox mr-4"
                  />
                  <div class="flex-shrink-0">
                    <UserIcon class="h-6 w-6 text-gray-400" />
                  </div>
                  <div class="ml-4">
                    <h2 class="text-lg font-medium text-gray-900">{{ user.username }}</h2>
                    <p class="text-sm text-gray-500">{{ user.email }}</p>
                    <div class="mt-1 flex space-x-2">
                      <Badge
                        :variant="user.isVerified ? 'success' : 'warning'"
                      >
                        {{ user.isVerified ? 'Verified' : 'Unverified' }}
                      </Badge>
                      <Badge
                        v-if="user.twoFactorEnabled"
                        variant="info"
                      >
                        2FA Enabled
                      </Badge>
                    </div>
                  </div>
                </div>
                <div class="flex space-x-2">
                  <Button
                    variant="ghost"
                    @click="raiseEvent('OPEN_ROLES_MODAL', user)"
                  >
                    Roles
                  </Button>
                  <Button
                    variant="ghost"
                    @click="raiseEvent('OPEN_PERMISSIONS_MODAL', user)"
                  >
                    Permissions
                  </Button>
                  <Button
                    v-if="!user.isVerified"
                    variant="success"
                    @click="verifyEmail(user)"
                  >
                    Verify Email
                  </Button>
                  <Button
                    variant="warning"
                    @click="raiseEvent('RESET_PASSWORD', user)"
                  >
                    Reset Password
                  </Button>
                  <Button
                    v-if="!user.twoFactorEnabled"
                    variant="info"
                    @click="raiseEvent('ENABLE_2FA', user)"
                  >
                    Enable 2FA
                  </Button>
                  <Button
                    v-else
                    variant="danger"
                    @click="raiseEvent('DISABLE_2FA', user)"
                  >
                    Disable 2FA
                  </Button>
                  <Button
                    variant="ghost"
                    @click="editUser(user)"
                  >
                    Edit
                  </Button>
                  <Button
                    variant="danger"
                    @click="deleteUser(user)"
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          </li>
        </ul>
      </div>

      <!-- Create/Edit User Modal -->
      <Modal
        v-if="isCurrentState('creating') || isCurrentState('editing')"
        :title="isCurrentState('creating') ? 'Create User' : 'Edit User'"
        @close="raiseEvent('CANCEL')"
      >
        <form @submit.prevent="saveUser">
          <div class="space-y-4">
            <div>
              <label class="form-label">Username</label>
              <input
                type="text"
                v-model="state.context.formData.username"
                class="form-input"
                required
              />
            </div>
            <div>
              <label class="form-label">Email</label>
              <input
                type="email"
                v-model="state.context.formData.email"
                class="form-input"
                required
              />
            </div>
            <div v-if="isCurrentState('creating')">
              <label class="form-label">Password</label>
              <input
                type="password"
                v-model="state.context.formData.password"
                class="form-input"
                required
              />
            </div>
            <div>
              <label class="form-label">Roles</label>
              <div class="space-y-2">
                <div v-for="role in availableRoles" :key="role._id" class="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    :value="role._id"
                    v-model="state.context.formData.roles"
                    class="form-checkbox"
                  />
                  <span>{{ role.name }}</span>
                </div>
              </div>
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

      <!-- Roles Modal -->
      <Modal
        v-if="showRolesModal"
        title="User Roles"
        @close="showRolesModal = false"
      >
        <div class="space-y-4">
          <div v-for="role in selectedUserRoles" :key="role._id" class="flex items-center justify-between">
            <div class="flex items-center">
              <ShieldCheckIcon class="h-5 w-5 text-gray-400 mr-2" />
              <span>{{ role.name }}</span>
            </div>
            <Button
              variant="ghost"
              @click="removeRoleFromUser(role)"
            >
              Remove
            </Button>
          </div>
        </div>
      </Modal>

      <!-- Permissions Modal -->
      <Modal
        v-if="showPermissionsModal"
        title="User Permissions"
        @close="showPermissionsModal = false"
      >
        <div class="space-y-4">
          <div v-for="(permission, index) in selectedUserPermissions" :key="index" class="flex items-center space-x-2">
            <span class="font-medium">{{ permission.resource }}</span>
            <div class="flex space-x-1">
              <Badge
                v-for="action in permission.actions"
                :key="action"
                variant="info"
              >
                {{ action }}
              </Badge>
            </div>
          </div>
        </div>
      </Modal>

      <!-- Bulk Roles Modal -->
      <Modal
        v-if="showBulkRolesModal"
        title="Assign Roles to Selected Users"
        @close="showBulkRolesModal = false"
      >
        <div class="space-y-4">
          <div v-for="role in availableRoles" :key="role._id" class="flex items-center space-x-2">
            <input
              type="checkbox"
              :value="role._id"
              v-model="selectedRoles"
              class="form-checkbox"
            />
            <span>{{ role.name }}</span>
          </div>
          <div class="flex justify-end space-x-2 mt-6">
            <Button
              type="button"
              variant="ghost"
              @click="showBulkRolesModal = false"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              @click="assignRolesToUsers"
              :disabled="!selectedRoles.length"
            >
              Assign Roles
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { UserIcon, ExclamationCircleIcon, ShieldCheckIcon } from '@heroicons/vue/24/outline';
import Button from '../../../components/ui/button.vue';
import Modal from '../../../components/ui/modal.vue';
import Spinner from '../../../components/ui/spinner.vue';
import Badge from '../../../components/ui/badge.vue';
import { useUserManagement } from '../../../composables/useUserManagement';
import { useUserRoles } from '../../../composables/useUserRoles';
import { useUserPermissions } from '../../../composables/useUserPermissions';
import { useUserSecurity } from '../../../composables/useUserSecurity';

// Use composables
const {
  state,
  searchQuery,
  selectedUsers,
  showBulkActions,
  filteredUsers,
  isCurrentState,
  raiseEvent,
  editUser,
  deleteUser,
  confirmDelete,
  saveUser,
  // bulkDelete
} = useUserManagement();

const {
  showRolesModal,
  selectedUser: selectedUserForRoles,
  userRoles,
  // openRolesModal,
  // assignRoles,
  // removeRoles,
  // bulkAssignRoles
} = useUserRoles();

const {
  showPermissionsModal,
  selectedUser: selectedUserForPermissions,
  userPermissions,
  // openPermissionsModal
} = useUserPermissions();

const {
  verifyEmail,
  // resetPassword,
  // enable2FA,
  // disable2FA
} = useUserSecurity();

// Local state
const showBulkRolesModal = ref(false);
const selectedRoles = ref<string[]>([]);
const selectedBulkRoles = ref<string[]>([]);
const availableRoles = ref<any[]>([]);

// Computed
const selectAll = computed({
  get: () => selectedUsers.value.length === filteredUsers.value.length,
  set: (value) => {
    selectedUsers.value = value ? filteredUsers.value.map(user => user._id) : [];
  }
});

// Methods
const toggleSelectAll = () => {
  if (selectAll.value) {
    selectedUsers.value = filteredUsers.value.map(user => user._id);
  } else {
    selectedUsers.value = [];
  }
};

const saveRoles = async () => {
  // if (!selectedUserForRoles.value) return;
  // const success = await assignRoles(selectedRoles.value);
  // if (success) {
    showRolesModal.value = false;
    selectedRoles.value = [];
  // }
};

const saveBulkRoles = async () => {
  // const success = await bulkAssignRoles(selectedUsers.value, selectedBulkRoles.value);
  // if (success) {
    showBulkRolesModal.value = false;
    selectedBulkRoles.value = [];
    selectedUsers.value = [];
  //}
};

// Fetch users on mount
onMounted(() => {
  raiseEvent('FETCH');
});
</script> 