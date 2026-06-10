<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { DIMENSION_LABELS } from '../types'
import type { Question, SkillDimension, QuestionOption } from '../types'

const questions = ref<Question[]>([])
const totalCount = ref(0)
const searchQuery = ref('')
const filterDimension = ref<string>('all')
const showForm = ref(false)
const editingId = ref<string | null>(null)

const form = ref<Question>({
  id: '',
  dimension: 'javaBasics',
  difficulty: 'basic',
  title: '',
  options: [
    { label: '', value: 'a', score: 1 },
    { label: '', value: 'b', score: 1 },
    { label: '', value: 'c', score: 1 },
    { label: '', value: 'd', score: 1 },
  ],
  answer: 'a',
  explanation: '',
})

const dimensionOptions = Object.entries(DIMENSION_LABELS).map(([k, v]) => ({ value: k, label: v }))

onMounted(() => loadAll())

async function loadAll() {
  questions.value = await window.api.getAllAssessmentQuestions()
  totalCount.value = questions.value.length
}

async function handleSearch() {
  if (searchQuery.value.trim()) {
    questions.value = await window.api.searchAssessmentQuestions(searchQuery.value.trim())
  } else {
    await loadAll()
  }
}

async function handleFilter() {
  if (filterDimension.value === 'all') {
    await loadAll()
  } else {
    questions.value = await window.api.getAssessmentQuestionsByDimension(filterDimension.value)
  }
}

function handleNew() {
  editingId.value = null
  form.value = {
    id: 'custom-' + Date.now(),
    dimension: filterDimension.value === 'all' ? 'javaBasics' : filterDimension.value as SkillDimension,
    difficulty: 'basic',
    title: '',
    options: [
      { label: '', value: 'a', score: 1 },
      { label: '', value: 'b', score: 1 },
      { label: '', value: 'c', score: 1 },
      { label: '', value: 'd', score: 1 },
    ],
    answer: 'a',
    explanation: '',
  }
  showForm.value = true
}

function handleEdit(q: Question) {
  editingId.value = q.id
  form.value = { ...q, options: q.options.map(o => ({ ...o })) }
  showForm.value = true
}

async function handleSave() {
  if (!form.value.title.trim()) return
  await window.api.saveAssessmentQuestion(form.value)
  showForm.value = false
  await loadAll()
}

async function handleDelete(id: string) {
  await window.api.deleteAssessmentQuestion(id)
  await loadAll()
}

function getDimLabel(dim: string): string {
  return DIMENSION_LABELS[dim as SkillDimension] ?? dim
}
</script>

<template>
  <div class="aq-view">
    <div class="aq-header">
      <h2>🎯 评估题库管理</h2>
      <p class="aq-subtitle">共 {{ totalCount }} 道评估题，支持增删改查</p>
    </div>

    <!-- 搜索 + 筛选 -->
    <div class="filter-bar">
      <div class="search-row">
        <input v-model="searchQuery" class="search-input" placeholder="搜索题目..." @input="handleSearch()" />
        <select v-model="filterDimension" class="filter-select" @change="handleFilter()">
          <option value="all">全部维度</option>
          <option v-for="opt in dimensionOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
        </select>
        <button class="btn btn-primary" @click="handleNew">+ 新增题目</button>
      </div>
    </div>

    <!-- 表单 -->
    <div v-if="showForm" class="form-card">
      <h3>{{ editingId ? '编辑题目' : '新增题目' }}</h3>
      <div class="form-row">
        <label>维度</label>
        <select v-model="form.dimension" class="form-select">
          <option v-for="opt in dimensionOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
        </select>
      </div>
      <div class="form-row">
        <label>难度</label>
        <select v-model="form.difficulty" class="form-select">
          <option value="basic">基础</option>
          <option value="intermediate">进阶</option>
          <option value="advanced">高级</option>
        </select>
      </div>
      <div class="form-row">
        <label>题目</label>
        <textarea v-model="form.title" class="form-textarea" rows="3" placeholder="题目内容"></textarea>
      </div>
      <div class="form-row">
        <label>选项（A/B/C/D）</label>
        <div v-for="(opt, i) in form.options" :key="i" class="option-row">
          <span class="option-letter">{{ ['A','B','C','D'][i] }}</span>
          <input v-model="opt.label" class="form-input" :placeholder="'选项 ' + ['A','B','C','D'][i]" />
          <input v-model.number="opt.score" class="form-input score-input" type="number" min="1" max="4" placeholder="分数" />
        </div>
      </div>
      <div class="form-row">
        <label>正确答案</label>
        <select v-model="form.answer" class="form-select">
          <option v-for="opt in form.options" :key="opt.value" :value="opt.value">
            {{ opt.value.toUpperCase() }} - {{ opt.label || '(空)' }}
          </option>
        </select>
      </div>
      <div class="form-row">
        <label>解析</label>
        <textarea v-model="form.explanation" class="form-textarea" rows="3" placeholder="题目解析"></textarea>
      </div>
      <div class="form-actions">
        <button class="btn btn-primary" @click="handleSave">保存</button>
        <button class="btn btn-outline" @click="showForm = false">取消</button>
      </div>
    </div>

    <!-- 题目列表 -->
    <div class="questions-list">
      <div v-for="q in questions" :key="q.id" class="q-card">
        <div class="q-header">
          <span class="q-difficulty" :class="q.difficulty">
            {{ q.difficulty === 'basic' ? '基础' : q.difficulty === 'intermediate' ? '进阶' : '高级' }}
          </span>
          <span class="q-dim">{{ getDimLabel(q.dimension) }}</span>
          <span class="q-title">{{ q.title }}</span>
          <div class="q-actions">
            <button class="icon-btn" @click="handleEdit(q)">✎</button>
            <button class="icon-btn danger" @click="handleDelete(q.id)">✕</button>
          </div>
        </div>
        <div class="q-options">
          <span v-for="opt in q.options" :key="opt.value" class="q-opt" :class="{ correct: opt.value === q.answer }">
            {{ opt.value.toUpperCase() }}. {{ opt.label }}
          </span>
        </div>
      </div>
      <div v-if="questions.length === 0" class="empty-state">
        <p>没有找到题目</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.aq-view { padding: 32px; max-width: 960px; margin: 0 auto; }
.aq-header { margin-bottom: 24px; }
.aq-header h2 { font-size: 22px; font-weight: 700; color: var(--text-primary); margin: 0 0 6px 0; }
.aq-subtitle { font-size: 14px; color: var(--text-secondary); margin: 0; }

.filter-bar { margin-bottom: 20px; }
.search-row { display: flex; gap: 12px; }
.search-input {
  flex: 1; padding: 10px 14px; background: var(--bg-secondary);
  border: 1px solid var(--border); border-radius: 8px;
  color: var(--text-primary); font-size: 14px; outline: none;
}
.search-input:focus { border-color: var(--accent); }
.filter-select {
  padding: 10px 14px; background: var(--bg-secondary);
  border: 1px solid var(--border); border-radius: 8px;
  color: var(--text-primary); font-size: 14px; outline: none;
}

/* 表单 */
.form-card {
  background: var(--bg-card); border: 1px solid var(--accent-dim);
  border-radius: 12px; padding: 24px; margin-bottom: 20px;
}
.form-card h3 { font-size: 16px; font-weight: 600; color: var(--text-primary); margin: 0 0 16px 0; }
.form-row { margin-bottom: 14px; }
.form-row label { display: block; font-size: 13px; font-weight: 600; color: var(--text-secondary); margin-bottom: 6px; }
.form-input, .form-select, .form-textarea {
  width: 100%; padding: 8px 12px; background: var(--bg-secondary);
  border: 1px solid var(--border); border-radius: 6px;
  color: var(--text-primary); font-size: 14px; outline: none;
}
.form-input:focus, .form-select:focus, .form-textarea:focus { border-color: var(--accent); }
.form-textarea { resize: vertical; font-family: inherit; line-height: 1.6; }
.option-row { display: flex; gap: 8px; align-items: center; margin-bottom: 6px; }
.option-letter {
  width: 28px; height: 28px; border-radius: 6px; background: var(--bg-tertiary);
  display: flex; align-items: center; justify-content: center;
  font-size: 13px; font-weight: 700; color: var(--text-secondary); flex-shrink: 0;
}
.score-input { width: 60px !important; flex-shrink: 0; }
.form-actions { display: flex; gap: 12px; margin-top: 16px; }

/* 题目列表 */
.questions-list { display: flex; flex-direction: column; gap: 8px; }
.q-card {
  background: var(--bg-card); border: 1px solid var(--border);
  border-radius: 10px; padding: 14px 18px;
}
.q-header { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }
.q-difficulty { font-size: 11px; padding: 2px 8px; border-radius: 4px; font-weight: 600; flex-shrink: 0; }
.q-difficulty.basic { background: rgba(34,197,94,0.15); color: #4ade80; }
.q-difficulty.intermediate { background: rgba(99,102,241,0.15); color: #818cf8; }
.q-difficulty.advanced { background: rgba(239,68,68,0.15); color: #f87171; }
.q-dim { font-size: 11px; color: var(--text-tertiary); flex-shrink: 0; }
.q-title { flex: 1; font-size: 14px; font-weight: 600; color: var(--text-primary); }
.q-actions { display: flex; gap: 4px; flex-shrink: 0; }
.icon-btn {
  background: none; border: none; font-size: 14px; cursor: pointer;
  color: var(--text-tertiary); padding: 4px; transition: color 0.15s;
}
.icon-btn:hover { color: var(--accent); }
.icon-btn.danger:hover { color: var(--danger); }

.q-options { display: flex; flex-wrap: wrap; gap: 8px; }
.q-opt {
  font-size: 12px; color: var(--text-secondary); padding: 2px 8px;
  background: var(--bg-secondary); border-radius: 4px;
}
.q-opt.correct { background: rgba(34,197,94,0.15); color: #4ade80; font-weight: 600; }

.btn {
  padding: 8px 18px; border-radius: 8px; font-size: 14px; font-weight: 600;
  cursor: pointer; border: none; transition: all 0.2s;
}
.btn-primary { background: var(--accent); color: #fff; }
.btn-primary:hover { background: var(--accent-hover); }
.btn-outline { background: transparent; color: var(--text-secondary); border: 1px solid var(--border); }
.btn-outline:hover { border-color: var(--text-secondary); }
.empty-state { text-align: center; padding: 60px 20px; }
.empty-state p { color: var(--text-secondary); font-size: 14px; }
</style>
