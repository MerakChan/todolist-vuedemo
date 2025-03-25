<script setup>
import { ref, computed, onMounted } from 'vue'
import { useDark, useToggle } from '@vueuse/core'
import { todoApi } from './api'
import ConfirmDialog from './components/ConfirmDialog.vue'

const isDark = useDark()
const toggleDark = useToggle(isDark)

const todos = ref([])
const newTodo = ref('')
const error = ref('')
const currentPage = ref(0)
const pageSize = ref(10)
const total = ref(0)
const loading = ref(false)

// 加载所有待办事项
const loadTodos = async (page = currentPage.value) => {
  loading.value = true
  try {
    const result = await todoApi.getAllTodos(page, pageSize.value)
    console.log('获取到的数据：', result)
    
    if (result && result.data && Array.isArray(result.data)) {
      todos.value = result.data
      total.value = result.total || 0
      currentPage.value = page
      pageSize.value = result.size || pageSize.value
      error.value = ''
      
      // 如果当前页大于最大页数，自动跳转到最后一页
      const maxPage = Math.ceil(total.value / pageSize.value) - 1
      if (currentPage.value > maxPage && maxPage >= 0) {
        await loadTodos(maxPage)
        return
      }
    } else {
      console.error('Invalid response format:', result)
      throw new Error('服务器返回数据格式错误')
    }
  } catch (e) {
    console.error('加载失败：', e)
    error.value = '加载待办事项失败：' + e.message
    todos.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadTodos()
})

const addTodo = async () => {
  if (newTodo.value.trim()) {
    try {
      const todo = {
        value: newTodo.value.trim(),
        isCompleted: false
      }
      const addedTodo = await todoApi.addTodo(todo)
      newTodo.value = ''
      error.value = ''
      // 添加成功后重新加载当前页数据
      const newTotal = total.value + 1
      const totalPages = Math.ceil(newTotal / pageSize.value)
      // 如果添加后的数据会产生新的一页，则跳转到新页
      if (totalPages > Math.ceil(total.value / pageSize.value)) {
        await loadTodos(totalPages - 1)
      } else {
        await loadTodos(currentPage.value)
      }
    } catch (e) {
      error.value = '添加待办事项失败：' + e.message
    }
  }
}

const toggleTodo = async (todo) => {
  try {
    const updatedTodo = await todoApi.updateTodoStatus(todo.id)
    const index = todos.value.findIndex(t => t.id === todo.id)
    if (index > -1) {
      todos.value[index] = updatedTodo
    }
    error.value = ''
  } catch (e) {
    error.value = '更新待办事项状态失败：' + e.message
  }
}

const showDeleteConfirm = ref(false)
const todoToDelete = ref(null)

const handleDeleteClick = (todo) => {
  todoToDelete.value = todo
  showDeleteConfirm.value = true
}

const handleConfirmDelete = async () => {
  if (!todoToDelete.value) return
  
  try {
    await todoApi.deleteTodo(todoToDelete.value.id)
    // 删除后重新加载当前页数据
    const newTotal = total.value - 1
    const maxPage = Math.ceil(newTotal / pageSize.value) - 1
    
    // 如果当前页已经没有数据了，则加载上一页
    if (currentPage.value > maxPage && maxPage >= 0) {
      await loadTodos(maxPage)
    } else {
      await loadTodos(currentPage.value)
    }
    error.value = ''
  } catch (e) {
    error.value = '删除待办事项失败：' + e.message
  } finally {
    showDeleteConfirm.value = false
    todoToDelete.value = null
  }
}

const handleCancelDelete = () => {
  showDeleteConfirm.value = false
  todoToDelete.value = null
}

const filteredTodos = computed(() => {
  return todos.value || []
})

const completionRate = computed(() => {
  if (todos.value.length === 0) return 0
  return Math.round((todos.value.filter(todo => todo.isCompleted).length / todos.value.length) * 100)
})

// 修改分页处理
const handlePageChange = (newPage) => {
  if (newPage >= 0 && newPage < Math.ceil(total.value / pageSize.value)) {
    currentPage.value = newPage
    loadTodos()
  }
}
</script>

<template>
  <div class="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-500">
    <div class="max-w-6xl mx-auto px-6 py-12">
      <!-- Header -->
      <div class="flex justify-between items-center mb-12">
        <h1 class="text-4xl font-bold text-gray-900 dark:text-white tracking-tight">Merak List</h1>
        <button @click="toggleDark()" class="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-300">
          <span class="mdi mdi-theme-light-dark text-2xl text-gray-600 dark:text-gray-400"></span>
        </button>
      </div>

      <!-- Error Message -->
      <div v-if="error" class="mb-6 p-4 bg-red-50 text-red-600 rounded-xl animate-fade-in text-sm">
        {{ error }}
      </div>

      <!-- Progress Bar -->
      <div class="mb-12">
        <div class="flex justify-between items-center mb-3">
          <span class="text-sm font-medium text-gray-600 dark:text-gray-400">完成进度</span>
          <span class="text-sm font-medium text-gray-900 dark:text-white">{{ completionRate }}%</span>
        </div>
        <div class="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
          <div 
            class="h-1.5 bg-blue-500 rounded-full transition-all duration-500 ease-out"
            :style="{ width: `${completionRate}%` }"
          ></div>
        </div>
      </div>

      <!-- Add Todo Form -->
      <form @submit.prevent="addTodo" class="mb-12">
        <div class="flex gap-3">
          <input
            v-model="newTodo"
            type="text"
            placeholder="添加新的待办事项..."
            class="w-full px-4 py-3 text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-800 rounded-xl border-0 focus:ring-2 focus:ring-blue-500 transition-all duration-300 placeholder-gray-400 dark:placeholder-gray-500"
          >
          <button 
            type="submit" 
            class="px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-colors duration-300 flex items-center justify-center min-w-[48px]"
          >
            <span class="mdi mdi-plus text-xl"></span>
          </button>
        </div>
      </form>

      <!-- Todo List -->
      <ul v-if="!loading && filteredTodos.length > 0" class="space-y-4">
        <TransitionGroup name="list">
          <li
            v-for="todo in filteredTodos"
            :key="todo.id"
            class="group flex items-center gap-4 p-5 bg-gray-50 dark:bg-gray-800 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-750 transition-all duration-300"
          >
            <button 
              @click="toggleTodo(todo)"
              class="flex-shrink-0 focus:outline-none"
            >
              <span 
                :class="['mdi text-2xl transition-colors duration-300', todo.isCompleted ? 'mdi-checkbox-marked-circle text-blue-500' : 'mdi-checkbox-blank-circle-outline text-gray-400 group-hover:text-gray-500 dark:group-hover:text-gray-300']"
              ></span>
            </button>
            <span 
              :class="['flex-1 text-lg transition-all duration-300', 
                todo.isCompleted ? 
                'text-gray-300 dark:text-gray-600 blur-[0.3px] opacity-75' : 
                'text-gray-900 dark:text-white']"
              >{{ todo.value }}</span>
            <button 
              @click="handleDeleteClick(todo)"
              class="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all duration-300 focus:outline-none"
            >
              <span class="mdi mdi-delete text-xl"></span>
            </button>
          </li>
        </TransitionGroup>
      </ul>

      <!-- Loading State -->
      <div v-if="loading" class="text-center py-16 text-gray-400 dark:text-gray-500 animate-fade-in">
        <div class="w-12 h-12 mx-auto mb-4">
          <svg class="animate-spin" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
        <p class="text-lg">加载中...</p>
      </div>

      <!-- Empty State -->
      <div 
        v-if="!loading && (!filteredTodos || filteredTodos.length === 0)"
        class="text-center py-16 text-gray-400 dark:text-gray-500 animate-fade-in"
      >
        <span class="mdi mdi-text-box-check text-7xl mb-4 block"></span>
        <p class="text-lg">暂无待办事项</p>
      </div>

      <!-- Pagination -->
      <div v-if="total > pageSize" class="mt-8 flex justify-center gap-4">
        <button 
          @click="handlePageChange(currentPage - 1)"
          :disabled="currentPage === 0"
          class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-300 focus:outline-none"
        >
          <span class="mdi mdi-chevron-left text-xl text-gray-600 dark:text-gray-400"></span>
        </button>
        <span class="py-2 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">
          第 {{ currentPage + 1 }} 页，共 {{ Math.ceil(total / pageSize) }} 页
        </span>
        <button 
          @click="handlePageChange(currentPage + 1)"
          :disabled="currentPage >= Math.ceil(total / pageSize) - 1"
          class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-300 focus:outline-none"
        >
          <span class="mdi mdi-chevron-right text-xl text-gray-600 dark:text-gray-400"></span>
        </button>
      </div>
    </div>

    <!-- Delete Confirmation Dialog -->
    <ConfirmDialog
      :show="showDeleteConfirm"
      title="确认删除"
      :message="`确定要删除待办事项「${todoToDelete?.value}」吗？`"
      @confirm="handleConfirmDelete"
      @cancel="handleCancelDelete"
    />
  </div>
</template>

<style>
.list-enter-active,
.list-leave-active {
  transition: all 0.3s ease;
}
.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
</style>
