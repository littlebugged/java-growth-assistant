<script setup lang="ts">
const props = defineProps<{
  currentView: string
}>()

const emit = defineEmits<{
  navigate: [view: string]
}>()

const navItems = [
  { id: 'dashboard', icon: '🏠', label: '仪表盘' },
  { id: 'assessment', icon: '🎯', label: '技能评估' },
  { id: 'roadmap', icon: '🗺️', label: '路线图' },
  { id: 'notes', icon: '📝', label: '学习笔记' },
  { id: 'projects', icon: '🔨', label: '项目实战' },
  { id: 'blog', icon: '✍️', label: '技术博客' },
  { id: 'stats', icon: '📊', label: '数据看板' },
  { id: 'interview', icon: '📋', label: '面试宝典' },
  { id: 'assessmentQuestions', icon: '🗄️', label: '评估题库' },
]
</script>

<template>
  <aside class="sidebar">
    <div class="sidebar-header">
      <span class="logo">☕</span>
      <span class="app-name">Java 成长助手</span>
    </div>
    <nav class="sidebar-nav">
      <button
        v-for="item in navItems"
        :key="item.id"
        class="nav-item"
        :class="{ active: currentView === item.id }"
        @click="emit('navigate', item.id)"
      >
        <span class="nav-icon">{{ item.icon }}</span>
        <span class="nav-label">{{ item.label }}</span>
      </button>
    </nav>
    <div class="sidebar-footer">
      <span class="version">v1.0.0</span>
    </div>
  </aside>
</template>

<style scoped>
.sidebar {
  width: 220px;
  background: var(--bg-secondary);
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  height: 100vh;
  -webkit-app-region: drag;
}

.sidebar-header {
  padding: 20px 20px 16px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.logo {
  font-size: 24px;
}

.app-name {
  font-size: 15px;
  font-weight: 700;
  color: var(--text-primary);
}

.sidebar-nav {
  flex: 1;
  padding: 8px 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  -webkit-app-region: no-drag;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  border-radius: 8px;
  border: none;
  background: transparent;
  cursor: pointer;
  transition: all 0.15s ease;
  font-size: 14px;
  color: var(--text-secondary);
}

.nav-item:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.nav-item.active {
  background: var(--accent-bg);
  color: var(--accent);
}

.nav-icon {
  font-size: 18px;
}

.nav-label {
  font-weight: 500;
}

.sidebar-footer {
  padding: 16px 20px;
  border-top: 1px solid var(--border);
}

.version {
  font-size: 11px;
  color: var(--text-tertiary);
}
</style>
