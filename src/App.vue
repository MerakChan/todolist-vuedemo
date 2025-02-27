<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useDark, useToggle } from '@vueuse/core'
import { TransitionGroup } from 'vue'
import { todoApi } from './api'

const isDark = useDark()
const toggleDark = useToggle(isDark)

const todos = ref([])
const newTodo = ref('')
const filter = ref('active')
const error = ref('')
const currentPage = ref(0)
const pageSize = ref(10)
const total = ref(0)
const loading = ref(false)

// 确认对话框状态
const showConfirmDialog = ref(false)
const todoToDelete = ref(null)

// 加载所有待办事项
const loadTodos = async () => {
  loading.value = true
  try {
    console.log('开始加载待办事项，参数：', {
      currentPage: currentPage.value,
      pageSize: pageSize.value,
      filter: filter.value
    })
    
    const isCompleted = filter.value === 'completed' ? true : 
                       filter.value === 'active' ? false : null
                       
    const result = await todoApi.getAllTodos(currentPage.value, pageSize.value, isCompleted)
    console.log('获取到的数据：', result)
    
    if (result && result.data) {
      todos.value = result.data
      total.value = result.total || 0
      currentPage.value = result.currentPage || 0
      pageSize.value = result.pageSize || 10
      error.value = ''
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
      await todoApi.addTodo(todo)
      newTodo.value = ''
      error.value = ''
      loadTodos() // 重新加载列表以获取最新的分页数据
    } catch (e) {
      error.value = '添加待办事项失败：' + e.message
    }
  }
}

const toggleTodo = async (todo) => {
  try {
    await todoApi.updateTodoStatus(todo.id)
    error.value = ''
    loadTodos() // 重新加载列表以获取最新数据
  } catch (e) {
    error.value = '更新待办事项状态失败：' + e.message
  }
}

const confirmDelete = (todo) => {
  todoToDelete.value = todo
  showConfirmDialog.value = true
}

const deleteTodo = async () => {
  if (!todoToDelete.value) return
  
  try {
    await todoApi.deleteTodo(todoToDelete.value.id)
    error.value = ''
    showConfirmDialog.value = false
    todoToDelete.value = null
    loadTodos() // 重新加载列表以获取最新数据
  } catch (e) {
    error.value = '删除待办事项失败：' + e.message
  }
}

const cancelDelete = () => {
  showConfirmDialog.value = false
  todoToDelete.value = null
}

const filteredTodos = computed(() => {
  return todos.value || []
})

const completionRate = computed(() => {
  if (todos.value.length === 0) return 0
  return Math.round((todos.value.filter(todo => todo.isCompleted).length / todos.value.length) * 100)
})

// 监听筛选器变化
watch(filter, () => {
  currentPage.value = 0 // 切换筛选时重置页码
  loadTodos()
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
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
    <div class="max-w-4xl mx-auto px-4 py-8">
      <!-- Header -->
      <div class="flex justify-between items-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Todo List</h1>
        <button @click="toggleDark()" class="btn-secondary">
          <span class="mdi mdi-theme-light-dark text-xl"></span>
        </button>
      </div>

      <!-- Error Message -->
      <div v-if="error" class="mb-4 p-4 bg-red-100 text-red-700 rounded-lg animate-fade-in">
        {{ error }}
      </div>

      <!-- Progress Bar -->
      <div class="mb-8">
        <div class="flex justify-between items-center mb-2">
          <span class="text-sm text-gray-600 dark:text-gray-400">完成进度</span>
          <span class="text-sm font-medium text-primary-600">{{ completionRate }}%</span>
        </div>
        <div class="h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
          <div 
            class="h-2 bg-primary-500 rounded-full transition-all duration-300"
            :style="{ width: `${completionRate}%` }"
          ></div>
        </div>
      </div>

      <!-- Add Todo Form -->
      <form @submit.prevent="addTodo" class="mb-8">
        <div class="flex gap-2">
          <input
            v-model="newTodo"
            type="text"
            placeholder="添加新的待办事项..."
            class="input flex-1"
          >
          <button type="submit" class="btn-primary">
            <span class="mdi mdi-plus text-xl"></span>
          </button>
        </div>
      </form>

      <!-- Filters -->
      <div class="flex gap-2 mb-6">
        <button 
          @click="filter = 'all'"
          :class="['btn-secondary', filter === 'all' ? 'bg-primary-500 text-white' : '']"
        >全部</button>
        <button 
          @click="filter = 'active'"
          :class="['btn-secondary', filter === 'active' ? 'bg-primary-500 text-white' : '']"
        >进行中</button>
        <button 
          @click="filter = 'completed'"
          :class="['btn-secondary', filter === 'completed' ? 'bg-primary-500 text-white' : '']"
        >已完成</button>
      </div>

      <!-- Todo List -->
      <ul v-if="!loading && filteredTodos.length > 0" class="space-y-3">
        <TransitionGroup name="list">
          <li
            v-for="todo in filteredTodos"
            :key="todo.id"
            class="flex items-center gap-3 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm animate-slide-in"
          >
            <button 
              @click="toggleTodo(todo)"
              class="flex-shrink-0"
            >
              <span 
                :class="['mdi text-xl', todo.isCompleted ? 'mdi-checkbox-marked-circle text-primary-500' : 'mdi-checkbox-blank-circle-outline text-gray-400']"
              ></span>
            </button>
            <span 
              :class="['flex-1 text-gray-900 dark:text-gray-100', todo.isCompleted ? 'line-through text-gray-500 dark:text-gray-400' : '']"
            >{{ todo.value }}</span>
            <button 
              @click="confirmDelete(todo)"
              class="text-gray-400 hover:text-red-500 transition-colors"
            >
              <span class="mdi mdi-delete text-xl"></span>
            </button>
          </li>
        </TransitionGroup>
      </ul>

      <!-- Loading State -->
      <div v-if="loading" class="text-center py-12 text-gray-500 dark:text-gray-400 animate-fade-in">
        <span class="mdi mdi-loading mdi-spin text-6xl mb-4 block"></span>
        <p>加载中...</p>
      </div>

      <!-- Empty State -->
      <div 
        v-if="!loading && (!filteredTodos || filteredTodos.length === 0)"
        class="text-center py-12 text-gray-500 dark:text-gray-400 animate-fade-in"
      >
        <span class="mdi mdi-text-box-check text-6xl mb-4 block"></span>
        <p>暂无待办事项</p>
      </div>

      <!-- Pagination -->
      <div v-if="total > pageSize" class="mt-6 flex justify-center gap-2">
        <button 
          @click="handlePageChange(currentPage - 1)"
          :disabled="currentPage === 0"
          class="btn-secondary"
        >
          <span class="mdi mdi-chevron-left"></span>
        </button>
        <span class="py-2 px-4 text-sm text-gray-600 dark:text-gray-400">
          第 {{ currentPage + 1 }} 页，共 {{ Math.ceil(total / pageSize) }} 页
        </span>
        <button 
          @click="handlePageChange(currentPage + 1)"
          :disabled="currentPage >= Math.ceil(total / pageSize) - 1"
          class="btn-secondary"
        >
          <span class="mdi mdi-chevron-right"></span>
        </button>
      </div>
    </div>

    <!-- Confirm Dialog -->
    <div v-if="showConfirmDialog" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 animate-fade-in">
      <div class="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-sm w-full shadow-xl animate-slide-up">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">确认删除</h3>
        <p class="text-gray-600 dark:text-gray-400 mb-6">确定要删除这个待办事项吗？</p>
        <div class="flex justify-end gap-3">
          <button @click="cancelDelete" class="btn-secondary">取消</button>
          <button @click="deleteTodo" class="btn-primary bg-red-500 hover:bg-red-600">删除</button>
        </div>
      </div>
    </div>
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

.animate-fade-in {
  animation: fadeIn 0.2s ease-in-out;
}

.animate-slide-up {
  animation: slideUp 0.3s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
</style>
