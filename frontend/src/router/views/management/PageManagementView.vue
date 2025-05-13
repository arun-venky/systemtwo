<template>
  <div class="min-h-screen bg-gray-50 py-12">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="flex justify-between items-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900">Page Management</h1>
        <div class="flex space-x-2">
          <input
            type="text"
            v-model="searchQuery"
            placeholder="Search pages..."
            class="form-input"
          />
          <Button
            variant="primary"
            @click="raiseEvent('CREATE')"
            :disabled="isCurrentState('creating')"
          >
            Create Page
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

      <!-- Page List -->
      <div v-else class="bg-white shadow overflow-hidden sm:rounded-md">
        <ul class="divide-y divide-gray-200">
          <li v-for="page in filteredPages" :key="page._id">
            <div class="px-4 py-4 sm:px-6">
              <div class="flex items-center justify-between">
                <div class="flex items-center">
                  <div class="flex-shrink-0">
                    <DocumentIcon class="h-6 w-6 text-gray-400" />
                  </div>
                  <div class="ml-4">
                    <h2 class="text-lg font-medium text-gray-900">{{ page.title }}</h2>
                    <p class="text-sm text-gray-500">
                      {{ page.slug }}
                    </p>
                    <div class="mt-1 flex space-x-2">
                      <Badge
                        :variant="page.isPublished ? 'success' : 'warning'"
                      >
                        {{ page.isPublished ? 'Published' : 'Draft' }}
                      </Badge>
                      <Badge
                        v-if="page.draft"
                        variant="info"
                      >
                        Has Draft
                      </Badge>
                    </div>
                  </div>
                </div>
                <div class="flex space-x-2">
                  <Button
                    variant="ghost"
                    @click="openVersionsModal(page)"
                  >
                    Versions
                  </Button>
                  <Button
                    variant="ghost"
                    @click="openDraftModal(page)"
                    :disabled="!page.draft"
                  >
                    Draft
                  </Button>
                  <Button
                    variant="ghost"
                    @click="duplicatePage(page)"
                  >
                    Duplicate
                  </Button>
                  <Button
                    variant="ghost"
                    @click="editPage(page)"
                  >
                    Edit
                  </Button>
                  <Button
                    v-if="!page.isPublished"
                    variant="success"
                    @click="publishPage(page)"
                  >
                    Publish
                  </Button>
                  <Button
                    v-else
                    variant="warning"
                    @click="unpublishPage(page)"
                  >
                    Unpublish
                  </Button>
                  <Button
                    variant="danger"
                    @click="deletePage(page)"
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          </li>
        </ul>
      </div>

      <!-- Create/Edit Page Modal -->
      <Modal
        v-if="isCurrentState('creating') || isCurrentState('editing')"
        :title="isCurrentState('creating') ? 'Create Page' : 'Edit Page'"
        @close="raiseEvent('CANCEL')"
      >
        <form @submit.prevent="savePage">
          <div class="space-y-4">
            <div>
              <label class="form-label">Title</label>
              <input
                type="text"
                v-model="state.context.formData.title"
                class="form-input"
                required
              />
            </div>
            <div>
              <label class="form-label">Slug</label>
              <input
                type="text"
                v-model="state.context.formData.slug"
                class="form-input"
                required
              />
            </div>
            <div>
              <label class="form-label">Content</label>
              <textarea
                v-model="state.context.formData.content"
                class="form-textarea"
                rows="10"
                required
              ></textarea>
            </div>
            <div>
              <label class="form-label">Parent Page</label>
              <select
                v-model="state.context.formData.parentId"
                class="form-select"
              >
                <option value="">None</option>
                <option
                  v-for="page in state.context.pages"
                  :key="page._id"
                  :value="page._id"
                >
                  {{ page.title }}
                </option>
              </select>
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

      <!-- Versions Modal -->
      <Modal
        v-if="showVersionsModal"
        title="Page Versions"
        @close="showVersionsModal = false"
      >
        <div class="space-y-4">
          <div v-for="version in selectedVersions" :key="version._id" class="flex items-center justify-between p-4 bg-gray-50 rounded">
            <div>
              <p class="text-sm text-gray-500">
                {{ new Date(version.publishedAt).toLocaleString() }}
              </p>
              <p class="text-sm text-gray-500">
                By {{ version.publishedBy }}
              </p>
            </div>
            <Button
              variant="ghost"
              @click="restoreVersion(version._id)"
            >
              Restore
            </Button>
          </div>
        </div>
      </Modal>

      <!-- Draft Modal -->
      <Modal
        v-if="showDraftModal"
        title="Page Draft"
        @close="showDraftModal = false"
      >
        <div class="space-y-4" v-if="currentDraft">
          <div class="flex justify-between items-center">
            <p class="text-sm text-gray-500">
              Last saved: {{ new Date(currentDraft.lastSaved || '').toLocaleString() }}
            </p>
            <div class="flex space-x-2">
              <Button
                variant="danger"
                @click="deleteDraft"
              >
                Delete Draft
              </Button>
              <Button
                variant="primary"
                @click="saveDraft(currentDraft.content || '')"
              >
                Save Draft
              </Button>
            </div>
          </div>
          <textarea
            v-model="currentDraft.content"
            class="form-textarea"
            rows="10"
          ></textarea>
        </div>
      </Modal>

      <!-- Delete Confirmation Modal -->
      <Modal
        v-if="isCurrentState('deleting')"
        title="Delete Page"
        @close="raiseEvent('CANCEL')"
      >
        <div class="space-y-4">
          <p class="text-sm text-gray-500">
            Are you sure you want to delete this page? This action cannot be undone.
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
import { onMounted } from 'vue';
import { DocumentIcon, ExclamationCircleIcon } from '@heroicons/vue/24/outline';
import Button from '../../../components/ui/button.vue';
import Modal from '../../../components/ui/modal.vue';
import Spinner from '../../../components/ui/spinner.vue';
import Badge from '../../../components/ui/badge.vue';
import { usePageManagement } from '../../../composables/usePageManagement';

const {
  state,
  showVersionsModal,
  showDraftModal,
  selectedPage,
  selectedVersions,
  currentDraft,
  searchQuery,
  selectedPages,
  filteredPages,
  isCurrentState,
  raiseEvent,
  openVersionsModal,
  openDraftModal,
  saveDraft,
  deleteDraft,
  restoreVersion,
  publishPage,
  unpublishPage,
  duplicatePage,
  movePage,
  editPage,
  deletePage,
  confirmDelete,
  savePage
} = usePageManagement();

// Fetch pages on mount
onMounted(() => {
  raiseEvent('FETCH');
});
</script> 