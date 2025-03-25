<script setup>
import { defineProps, defineEmits } from 'vue'

const props = defineProps({
  show: {
    type: Boolean,
    required: true
  },
  title: {
    type: String,
    default: '确认'
  },
  message: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['confirm', 'cancel'])

const handleConfirm = () => {
  emit('confirm')
}

const handleCancel = () => {
  emit('cancel')
}
</script>

<template>
  <Teleport to="body">
    <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center">
      <!-- Backdrop -->
      <div class="absolute inset-0 bg-black bg-opacity-50 transition-opacity" @click="handleCancel"></div>
      
      <!-- Dialog -->
      <div class="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-sm w-full mx-4 transform transition-all">
        <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">{{ title }}</h3>
        <p class="text-gray-500 dark:text-gray-400 mb-6">{{ message }}</p>
        
        <div class="flex justify-end gap-3">
          <button 
            @click="handleCancel"
            class="btn-secondary"
          >
            取消
          </button>
          <button 
            @click="handleConfirm"
            class="btn-primary bg-red-500 hover:bg-red-600"
          >
            确认删除
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>