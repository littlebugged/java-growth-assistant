<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { marked } from 'marked'
import { useBlogStore } from '../stores/blog'
import { DIMENSION_LABELS } from '../types'
import type { BlogPost, SkillDimension } from '../types'

const store = useBlogStore()

const editing = ref(false)
const preview = ref(false)
const editPost = ref<BlogPost>(store.createNew())
const saveStatus = ref<'idle' | 'saving' | 'saved'>('idle')
let saveTimer: ReturnType<typeof setTimeout> | null = null

onMounted(() => store.loadAll())

const dimensionOptions = [
  ...Object.entries(DIMENSION_LABELS).map(([k, v]) => ({ value: k, label: v })),
  { value: 'general', label: '通用' },
]

const renderedContent = computed(() => {
  return marked(editPost.value.content || '') as string
})

// 自动保存：防抖 1.5 秒
watch(
  () => [editPost.value.title, editPost.value.content, editPost.value.dimension, editPost.value.published],
  () => {
    if (!editing.value) return
    if (!editPost.value.title.trim()) return
    if (saveTimer) clearTimeout(saveTimer)
    saveTimer = setTimeout(() => autoSave(), 1500)
  },
  { deep: true }
)

async function autoSave() {
  saveStatus.value = 'saving'
  try {
    await store.save(JSON.parse(JSON.stringify(editPost.value)))
    saveStatus.value = 'saved'
    setTimeout(() => { saveStatus.value = 'idle' }, 2000)
  } catch {
    saveStatus.value = 'idle'
  }
}

function handleNew() {
  editPost.value = store.createNew()
  editing.value = true
  preview.value = false
}

function handleEdit(post: BlogPost) {
  editPost.value = { ...post }
  editing.value = true
  preview.value = false
}

async function handleSave() {
  if (!editPost.value.title.trim()) return
  await store.save(JSON.parse(JSON.stringify(editPost.value)))
  editing.value = false
}

async function handleDelete(id: number) {
  await store.remove(id)
}

function handleCancel() {
  if (saveTimer) clearTimeout(saveTimer)
  saveStatus.value = 'idle'
  editing.value = false
}

function handleExport() {
  const blob = new Blob([`# ${editPost.value.title}\n\n${editPost.value.content}`], { type: 'text/markdown' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${editPost.value.title || 'blog'}.md`
  a.click()
  URL.revokeObjectURL(url)
}
</script>

<template>
  <div class="blog-view">
    <!-- 列表 -->
    <div v-if="!editing" class="list-section">
      <div class="list-header">
        <h2>✍️ 技术博客</h2>
        <button class="btn btn-primary" @click="handleNew">+ 写文章</button>
      </div>

      <div v-if="store.posts.length === 0" class="empty-state">
        <p>还没有文章，点击「写文章」开始创作</p>
      </div>

      <div class="posts-list">
        <div
          v-for="post in store.posts"
          :key="post.id"
          class="post-card"
          @click="handleEdit(post)"
        >
          <div class="post-card-header">
            <h4>{{ post.title || '无标题' }}</h4>
            <div class="post-actions">
              <span class="post-status" :class="{ published: post.published }">
                {{ post.published ? '已发布' : '草稿' }}
              </span>
              <button class="btn-icon" @click.stop="handleDelete(post.id!)">✕</button>
            </div>
          </div>
          <p class="post-preview">{{ post.content.slice(0, 120) }}{{ post.content.length > 120 ? '...' : '' }}</p>
          <div class="post-meta">
            <span class="post-tag">{{ DIMENSION_LABELS[post.dimension as SkillDimension] ?? '通用' }}</span>
            <span class="post-date">{{ post.updatedAt?.slice(0, 10) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 编辑 -->
    <div v-else class="edit-section">
      <div class="edit-header">
        <div class="edit-header-left">
          <button class="btn btn-outline" @click="handleCancel">← 返回</button>
          <button class="btn btn-outline" :class="{ active: preview }" @click="preview = !preview">
            {{ preview ? '编辑' : '预览' }}
          </button>
          <button class="btn btn-outline" @click="handleExport">导出 MD</button>
          <span class="save-status" :class="saveStatus">
            <template v-if="saveStatus === 'saving'">保存中...</template>
            <template v-else-if="saveStatus === 'saved'">已保存 ✓</template>
          </span>
        </div>
        <div class="edit-header-right">
          <select v-model="editPost.dimension" class="filter-select">
            <option v-for="opt in dimensionOptions" :key="opt.value" :value="opt.value">
              {{ opt.label }}
            </option>
          </select>
          <button class="btn btn-primary" @click="handleSave">保存</button>
        </div>
      </div>

      <input
        v-model="editPost.title"
        class="title-input"
        placeholder="文章标题"
      />

      <!-- 编辑区 -->
      <div v-if="!preview" class="editor-area">
        <textarea
          v-model="editPost.content"
          class="content-editor"
          placeholder="用 Markdown 写你的技术文章..."
        ></textarea>
      </div>

      <!-- 预览区 -->
      <div v-else class="preview-area" v-html="renderedContent"></div>
    </div>
  </div>
</template>

<style scoped>
.blog-view {
  padding: 32px;
  max-width: 900px;
  margin: 0 auto;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.list-header h2 {
  font-size: 22px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
}

.posts-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.post-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 18px 20px;
  cursor: pointer;
  transition: border-color 0.2s;
}

.post-card:hover {
  border-color: var(--accent-dim);
}

.post-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.post-card-header h4 {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.post-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.post-status {
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 4px;
  background: rgba(161, 161, 170, 0.15);
  color: #a1a1aa;
}

.post-status.published {
  background: rgba(34, 197, 94, 0.15);
  color: #4ade80;
}

.post-preview {
  font-size: 13px;
  color: var(--text-secondary);
  margin: 8px 0;
  line-height: 1.6;
}

.post-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.post-tag {
  font-size: 12px;
  padding: 2px 8px;
  background: var(--accent-bg);
  color: var(--accent);
  border-radius: 4px;
}

.post-date {
  font-size: 12px;
  color: var(--text-tertiary);
}

.btn-icon {
  background: none;
  border: none;
  color: var(--text-tertiary);
  cursor: pointer;
  font-size: 14px;
  padding: 4px;
}

.btn-icon:hover {
  color: var(--danger);
}

/* 编辑 */
.edit-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.edit-header-left,
.edit-header-right {
  display: flex;
  gap: 10px;
  align-items: center;
}

.title-input {
  width: 100%;
  padding: 12px 0;
  background: transparent;
  border: none;
  color: var(--text-primary);
  font-size: 24px;
  font-weight: 700;
  outline: none;
  border-bottom: 1px solid var(--border);
  margin-bottom: 16px;
}

.filter-select {
  padding: 8px 12px;
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: 8px;
  color: var(--text-primary);
  font-size: 13px;
  outline: none;
}

.content-editor {
  width: 100%;
  min-height: 500px;
  padding: 20px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 10px;
  color: var(--text-primary);
  font-size: 14px;
  line-height: 1.8;
  outline: none;
  resize: vertical;
  font-family: 'SFMono-Regular', 'Consolas', 'Liberation Mono', monospace;
}

.content-editor:focus {
  border-color: var(--accent);
}

.preview-area {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 24px;
  min-height: 500px;
  line-height: 1.8;
  color: var(--text-primary);
}

.preview-area :deep(h1),
.preview-area :deep(h2),
.preview-area :deep(h3) {
  color: var(--text-primary);
  margin: 1em 0 0.5em;
}

.preview-area :deep(p) {
  margin: 0.5em 0;
}

.preview-area :deep(code) {
  background: var(--bg-tertiary);
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 13px;
}

.preview-area :deep(pre) {
  background: var(--bg-tertiary);
  padding: 16px;
  border-radius: 8px;
  overflow-x: auto;
}

.preview-area :deep(ul),
.preview-area :deep(ol) {
  padding-left: 24px;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
}

.empty-state p {
  color: var(--text-secondary);
  font-size: 14px;
}

.btn {
  padding: 8px 18px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
}

.btn.active { background: var(--accent-bg); color: var(--accent); }
.btn-primary { background: var(--accent); color: #fff; }
.btn-primary:hover { background: var(--accent-hover); }
.btn-outline { background: transparent; color: var(--text-secondary); border: 1px solid var(--border); }
.btn-outline:hover { border-color: var(--text-secondary); }
.save-status { font-size: 13px; padding: 4px 10px; border-radius: 6px; transition: all 0.3s; }
.save-status.saving { color: var(--text-secondary); }
.save-status.saved { color: #4ade80; background: rgba(34, 197, 94, 0.1); }
</style>
