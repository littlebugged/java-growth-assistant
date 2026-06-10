# Java 成长助手

Java 程序员技能评估与学习路线图桌面应用。

## 技术栈

- Electron 31 + Vue 3.4 + Pinia 2 + Vite 5.4
- better-sqlite3 本地数据库
- 手写 CSS + CSS 自定义属性（深色主题）

## 常用命令

```bash
npm install        # 安装依赖
npm run dev        # 启动开发模式
npm run build      # 构建生产版本
```

## 项目结构

```
electron/          # Electron 主进程和 preload
src/
  db/              # SQLite 数据库层
  stores/          # Pinia 状态管理
  data/            # 静态数据（题库、路线图模板）
  views/           # 页面组件
  components/      # 通用组件
  assets/          # 全局样式
```

## 核心功能

- **技能评估**：30 道题覆盖 6 个 Java 维度，本地即时评分
- **路线图生成**：根据评估结果匹配预置路线图模板
- **进度追踪**：路线图阶段可标记状态（待开始/进行中/已完成）

## 约定

- 所有 IPC 通信通过 preload.ts 的 contextBridge 暴露
- 数据库操作仅在主进程，渲染进程通过 IPC 调用
- 组件使用 `<script setup lang="ts">`
- CSS 变量定义在 style.css，组件内通过 var() 引用
