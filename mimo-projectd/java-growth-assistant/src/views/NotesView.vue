<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { marked } from 'marked'
import { useNotesStore } from '../stores/notes'
import { DIMENSION_LABELS } from '../types'
import type { Note, SkillDimension } from '../types'

const store = useNotesStore()

const editing = ref(false)
const preview = ref(false)
const editNote = ref<Note>(store.createNew())
const searchQuery = ref('')
const filterDimension = ref<string>('all')
const saveError = ref('')

onMounted(() => store.loadAll())

const dimensionOptions = [
  { value: 'all', label: '全部' },
  ...Object.entries(DIMENSION_LABELS).map(([k, v]) => ({ value: k, label: v })),
  { value: 'general', label: '通用' },
]

const filteredNotes = computed(() => {
  return store.notes.filter((n) => {
    const matchDim = filterDimension.value === 'all' || n.dimension === filterDimension.value
    const matchSearch = !searchQuery.value || n.title.includes(searchQuery.value) || n.content.includes(searchQuery.value)
    return matchDim && matchSearch
  })
})

const renderedContent = computed(() => marked(editNote.value.content || '') as string)

function handleNew() {
  editNote.value = store.createNew()
  editing.value = true
  preview.value = false
}

function handleEdit(note: Note) {
  editNote.value = { ...note }
  editing.value = true
  preview.value = false
}

async function handleSave() {
  saveError.value = ''
  if (!editNote.value.title.trim()) {
    saveError.value = '请输入标题'
    return
  }
  try {
    await store.save(editNote.value)
    editing.value = false
  } catch (e: any) {
    saveError.value = '保存失败: ' + (e.message || '未知错误')
  }
}

async function handleDelete(id: number) {
  await store.remove(id)
}

function handleCancel() {
  editing.value = false
}
</script>

<template>
  <div class="notes-view">
    <div v-if="!editing" class="list-section">
      <div class="list-header">
        <h2>📝 学习笔记</h2>
        <button class="btn btn-primary" @click="handleNew">+ 新建笔记</button>
      </div>

      <div class="filter-bar">
        <input v-model="searchQuery" class="search-input" placeholder="搜索笔记..." />
        <select v-model="filterDimension" class="filter-select">
          <option v-for="opt in dimensionOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
        </select>
      </div>

      <div v-if="filteredNotes.length === 0" class="empty-state">
        <p>还没有笔记，点击「新建笔记」开始记录</p>
      </div>

      <div class="notes-grid">
        <div v-for="note in filteredNotes" :key="note.id" class="note-card" @click="handleEdit(note)">
          <div class="note-card-header">
            <h4>{{ note.title || '无标题' }}</h4>
            <button class="btn-icon" @click.stop="handleDelete(note.id!)">✕</button>
          </div>
          <p class="note-preview">{{ note.content.slice(0, 120) }}{{ note.content.length > 120 ? '...' : '' }}</p>
          <div class="note-meta">
            <span class="note-tag">{{ DIMENSION_LABELS[note.dimension as SkillDimension] ?? '通用' }}</span>
            <span class="note-date">{{ note.updatedAt?.slice(0, 10) }}</span>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="edit-section">
      <div class="edit-header">
        <div class="edit-header-left">
          <button class="btn btn-outline" @click="handleCancel">← 返回</button>
          <button class="btn btn-outline" :class="{ active: preview }" @click="preview = !preview">
            {{ preview ? '编辑' : '预览' }}
          </button>
        </div>
        <button class="btn btn-primary" @click="handleSave">保存</button>
      </div>
      <div v-if="saveError" class="save-error">{{ saveError }}</div>

      <input v-model="editNote.title" class="title-input" placeholder="笔记标题" />

      <div class="edit-meta">
        <select v-model="editNote.dimension" class="filter-select">
          <option v-for="opt in dimensionOptions.slice(1)" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
        </select>
      </div>

      <div v-if="!preview">
        <textarea v-model="editNote.content" class="content-editor" placeholder="写下你的学习笔记...支持 Markdown 格式"></textarea>
      </div>
      <div v-else class="preview-area" v-html="renderedContent"></div>
    </div>
  </div>
</template>

<style scoped>
.notes-view { padding: 32px; max-width: 900px; margin: 0 auto; }
.list-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.list-header h2 { font-size: 22px; font-weight: 700; color: var(--text-primary); margin: 0; }
.filter-bar { display: flex; gap: 12px; margin-bottom: 20px; }
.search-input { flex: 1; padding: 10px 14px; background: var(--bg-secondary); border: 1px solid var(--border); border-radius: 8px; color: var(--text-primary); font-size: 14px; outline: none; }
.search-input:focus { border-color: var(--accent); }
.filter-select { padding: 10px 14px; background: var(--bg-secondary); border: 1px solid var(--border); border-radius: 8px; color: var(--text-primary); font-size: 14px; outline: none; }
.notes-grid { display: flex; flex-direction: column; gap: 12px; }
.note-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: 10px; padding: 16px 20px; cursor: pointer; transition: border-color 0.2s; }
.note-card:hover { border-color: var(--accent-dim); }
.note-card-header { display: flex; justify-content: space-between; align-items: center; }
.note-card-header h4 { font-size: 15px; font-weight: 600; color: var(--text-primary); margin: 0; }
.note-preview { font-size: 13px; color: var(--text-secondary); margin: 8px 0; line-height: 1.5; }
.note-meta { display: flex; justify-content: space-between; align-items: center; }
.note-tag { font-size: 12px; padding: 2px 8px; background: var(--accent-bg); color: var(--accent); border-radius: 4px; }
.note-date { font-size: 12px; color: var(--text-tertiary); }
.btn-icon { background: none; border: none; color: var(--text-tertiary); cursor: pointer; font-size: 14px; padding: 4px; }
.btn-icon:hover { color: var(--danger); }
.edit-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.edit-header-left { display: flex; gap: 10px; }
.title-input { width: 100%; padding: 12px 0; background: transparent; border: none; color: var(--text-primary); font-size: 22px; font-weight: 700; outline: none; border-bottom: 1px solid var(--border); margin-bottom: 16px; }
.edit-meta { margin-bottom: 16px; }
.content-editor { width: 100%; min-height: 400px; padding: 16px; background: var(--bg-card); border: 1px solid var(--border); border-radius: 10px; color: var(--text-primary); font-size: 14px; line-height: 1.8; outline: none; resize: vertical; font-family: 'SFMono-Regular', 'Consolas', 'Liberation Mono', monospace; }
.content-editor:focus { border-color: var(--accent); }
.preview-area { background: var(--bg-card); border: 1px solid var(--border); border-radius: 10px; padding: 20px; min-height: 400px; line-height: 1.8; color: var(--text-primary); }
.preview-area :deep(h1), .preview-area :deep(h2), .preview-area :deep(h3) { color: var(--text-primary); margin: 1em 0 0.5em; }
.preview-area :deep(code) { background: var(--bg-tertiary); padding: 2px 6px; border-radius: 4px; font-size: 13px; }
.preview-area :deep(pre) { background: var(--bg-tertiary); padding: 16px; border-radius: 8px; overflow-x: auto; }
.preview-area :deep(ul), .preview-area :deep(ol) { padding-left: 24px; }
.empty-state { text-align: center; padding: 60px 20px; }
.empty-state p { color: var(--text-secondary); font-size: 14px; }
.btn { padding: 8px 18px; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; border: none; transition: all 0.2s; }
.btn.active { background: var(--accent-bg); color: var(--accent); }
.btn-primary { background: var(--accent); color: #fff; }
.btn-primary:hover { background: var(--accent-hover); }
.btn-outline { background: transparent; color: var(--text-secondary); border: 1px solid var(--border); }
.btn-outline:hover { border-color: var(--text-secondary); }
.save-error { color: var(--danger); font-size: 13px; margin-top: 8px; text-align: right; }
</style>
