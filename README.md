# Java 成长助手

一款专为 Java 程序员打造的本地桌面应用，帮助你系统化提升技能、备战面试。

## 功能模块

### 🎯 技能评估
- 6 大维度测评：Java 基础、JVM、并发编程、Spring、数据库、架构设计
- 每次随机抽题，支持重新作答
- 雷达图可视化展示技能短板

### 🗺️ 学习路线图
- 根据评估结果自动生成个性化学习路线
- 分阶段推进，每个阶段有明确的学习目标和资源推荐
- 可手动调整路线内容

### 📝 学习笔记
- Markdown 编辑器，支持实时预览
- 按分类归档，支持全文搜索
- 数据本地存储，隐私安全

### 🚀 项目实战
- 精选 Java 实战项目模板
- 分步骤引导，从零到一完成项目
- 涵盖微服务、中间件、工具类等方向

### ✍️ 技术博客
- 内置 Markdown 编辑器
- 支持分类和标签管理
- 本地写作，随时导出

### 📚 面试宝典
- 13 大分类、130+ 精选面试题
- 覆盖 Java 基础、JVM、并发、Spring、MySQL、Redis、分布式、系统设计等
- 每题配有详细答案、关键点和追问方向
- 收藏功能，重点题目随时复习

### 📊 学习统计
- 学习进度全景展示
- 各维度能力变化趋势
- 数据驱动成长

## 技术栈

- **前端**：Vue 3.4 + TypeScript + Pinia 2
- **桌面框架**：Electron 31
- **构建工具**：Vite 5.4
- **数据库**：SQLite (better-sqlite3)
- **样式**：暗色主题，CSS 自定义属性

## 快速开始

```bash
# 安装依赖
npm install

# 开发模式
npm run dev

# 构建打包
npm run build
```

## 项目结构

```
java-growth-assistant/
├── electron/           # Electron 主进程
│   ├── main.ts         # 主进程入口，IPC 处理
│   └── preload.ts      # 预加载脚本，API 桥接
├── src/
│   ├── components/     # 公共组件
│   ├── views/          # 页面视图
│   ├── stores/         # Pinia 状态管理
│   ├── data/           # 题库数据源
│   ├── db/             # 数据库操作
│   ├── assets/         # 样式资源
│   └── types.ts        # TypeScript 类型定义
├── index.html          # 入口 HTML
├── vite.config.ts      # Vite 配置
└── package.json
```

## License

MIT
