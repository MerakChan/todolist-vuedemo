// 封装与后端的API通信
const API_BASE_URL = 'http://localhost:8080/api'

// 添加超时控制的 fetch 函数
const fetchWithTimeout = async (url, options = {}) => {
  const timeout = 5000; // 5秒超时
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    if (error.name === 'AbortError') {
      throw new Error('请求超时');
    }
    throw error;
  }
}

export const todoApi = {
  // 获取所有待办事项
  async getAllTodos(page = 0, size = 10, isCompleted = null) {
    try {
      let url = `${API_BASE_URL}/todos?page=${page}&size=${size}`
      if (isCompleted !== null) {
        url += `&isCompleted=${isCompleted}`
      }
      console.log('Requesting URL:', url);

      const response = await fetchWithTimeout(url, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      console.log('Response data:', data);
      
      return data // 直接返回后端数据，不做额外处理
    } catch (error) {
      console.error('获取待办事项失败:', error);
      throw error;
    }
  },

  // 添加待办事项
  async addTodo(todo) {
    const response = await fetch(`${API_BASE_URL}/todos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        value: todo.value,
        isCompleted: todo.isCompleted
      })
    })
    if (!response.ok) {
      if (response.status === 400) {
        throw new Error('待办事项内容不能为空')
      }
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    return await response.json()
  },

  // 更新待办事项状态
  async updateTodoStatus(id) {
    const response = await fetch(`${API_BASE_URL}/todos/${id}`, {
      method: 'PUT'
    })
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('待办事项不存在')
      }
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    return await response.json()
  },

  // 删除待办事项
  async deleteTodo(id) {
    const response = await fetchWithTimeout(`${API_BASE_URL}/todos/${id}`, {
      method: 'DELETE'
    })
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('待办事项不存在')
      }
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    // 204状态码表示成功但无返回内容
    if (response.status === 204) {
      return { success: true }
    }
    return await response.json()
  }
}