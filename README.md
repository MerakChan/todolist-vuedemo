# Todo List 

## 项目介绍
这是一个基于 Vue 3 开发的待办事项管理系统，采用前后端分离架构，实现了待办事项的添加、删除、状态更新等基本功能。项目使用现代化的前端技术栈，提供了良好的用户体验和可维护性。

## 技术栈
- **前端框架**: Vue 3
- **构建工具**: Vite
- **HTTP 请求**: Fetch API
- **状态管理**: Vue Composition API
- **开发语言**: JavaScript
- **样式处理**: CSS Modules

## 项目结构
```plaintext
Todo-List/
├── src/
│   ├── components/          # Vue组件
│   │   ├── TodoList.vue    # 待办事项列表组件
│   │   ├── TodoItem.vue    # 待办事项项目组件
│   │   └── AddTodo.vue     # 添加待办事项组件
│   ├── api/
│   │   └── api.js          # API接口封装
│   ├── assets/             # 静态资源
│   │   └── styles/         # 样式文件
│   ├── App.vue             # 根组件
│   └── main.js             # 应用入口
├── public/                 # 公共资源
├── index.html             # HTML模板
├── vite.config.js         # Vite配置
└── package.json           # 项目配置文件
```

## 功能特性

### 1. 待办事项管理
- 查看待办事项列表
- 添加新的待办事项
- 标记待办事项为已完成/未完成
- 删除待办事项
- 分页显示待办事项
- 按完成状态筛选

### 2. 用户交互
- 响应式布局设计
- 实时状态更新
- 友好的错误提示
- 加载状态展示

## 架构设计

### 1. 组件设计
- **App.vue**: 应用根组件，负责整体布局
- **TodoList.vue**: 待办事项列表展示
- **TodoItem.vue**: 单个待办事项的展示和操作
- **AddTodo.vue**: 新增待办事项表单

### 2. API 封装
- 统一的接口管理
- 请求超时控制
- 错误处理机制
- RESTful API 设计

### 3. 状态管理
- 使用 Vue 3 Composition API
- 响应式数据处理
- 组件间状态共享
- 本地数据缓存

### 4. 错误处理
- 网络请求错误处理
- 用户输入验证
- 友好的错误提示
- 错误日志记录

## 开发指南

### 环境要求
- Node.js >= 16.0.0
- npm >= 8.0.0

### 项目启动
```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

### 项目构建
```bash
# 构建生产版本
npm run build

# 预览构建结果
npm run preview
```

## API 接口

### 1. 获取待办事项列表
```javascript
GET /api/todos?page={page}&size={size}&isCompleted={status}
```

### 2. 添加待办事项
```javascript
POST /api/todos
```

### 3. 更新待办事项状态
```javascript
PUT /api/todos/{id}
```

### 4. 删除待办事项
```javascript
DELETE /api/todos/{id}
```

## 部署说明

### 开发环境
1. 克隆项目
2. 安装依赖
3. 配置环境变量
4. 启动开发服务器

### 生产环境
1. 构建项目
2. 配置生产环境变量
3. 部署到 Web 服务器

## 注意事项
1. 确保 Node.js 版本兼容
2. 检查 API 接口配置
3. 注意跨域设置
4. 遵循代码规范
