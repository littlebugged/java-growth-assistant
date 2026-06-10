<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useInterviewStore } from '../stores/interview'
import { INTERVIEW_CATEGORY_LABELS } from '../types'
import type { InterviewQuestion, InterviewCategory } from '../types'

const store = useInterviewStore()

const showForm = ref(false)
const editingId = ref<string | null>(null)
const form = ref<InterviewQuestion>({
  id: '',
  category: 'java',
  difficulty: 'mid',
  question: '',
  answer: '',
  keyPoints: [''],
  followUp: [''],
})

onMounted(() => {
  store.loadAll()
})

function handleNew() {
  editingId.value = null
  form.value = {
    id: 'custom-' + Date.now(),
    category: store.currentCategory === 'all' ? 'java' : store.currentCategory as InterviewCategory,
    difficulty: 'mid',
    question: '',
    answer: '',
    keyPoints: [''],
    followUp: [''],
  }
  showForm.value = true
}

function handleEdit(q: InterviewQuestion) {
  editingId.value = q.id
  form.value = { ...q, keyPoints: [...q.keyPoints], followUp: [...(q.followUp ?? [])] }
  showForm.value = true
}

async function handleSave() {
  if (!form.value.question.trim() || !form.value.answer.trim()) return
  form.value.keyPoints = form.value.keyPoints.filter(p => p.trim())
  form.value.followUp = (form.value.followUp ?? []).filter(p => p.trim())
  await store.saveQuestion(form.value)
  showForm.value = false
}

async function handleDelete(id: string) {
  await store.deleteQuestion(id)
}

function addKeyPoint() { form.value.keyPoints.push('') }
function removeKeyPoint(i: number) { form.value.keyPoints.splice(i, 1) }
function addFollowUp() { if (!form.value.followUp) form.value.followUp = []; form.value.followUp.push('') }
function removeFollowUp(i: number) { form.value.followUp?.splice(i, 1) }

function formatAnswer(text: string): string {
  return text.replace(/\n/g, '<br>')
}

const categoryOptions = Object.entries(INTERVIEW_CATEGORY_LABELS).map(([k, v]) => ({ value: k, label: v }))
</script>

<template>
  <div class="interview-view">
    <div class="interview-header">
      <h2>📋 面试宝典</h2>
      <p class="interview-subtitle">共 {{ store.totalCount }} 道面试题，支持增删改</p>
    </div>

    <!-- 搜索 + 筛选 -->
    <div class="filter-bar">
      <div class="search-row">
        <input
          v-model="store.searchQuery"
          class="search-input"
          placeholder="搜索面试题..."
          @input="store.handleSearch()"
        />
        <button class="btn btn-primary" @click="handleNew">+ 新增题目</button>
      </div>
      <div class="category-tabs">
        <button
          class="cat-tab"
          :class="{ active: store.currentCategory === 'all' }"
          @click="store.setCategory('all')"
        >全部</button>
        <button
          v-for="cat in store.categories"
          :key="cat.key"
          class="cat-tab"
          :class="{ active: store.currentCategory === cat.key }"
          @click="store.setCategory(cat.key)"
        >{{ cat.label }}</button>
      </div>
    </div>

    <!-- 新增/编辑表单 -->
    <div v-if="showForm" class="form-card">
      <h3>{{ editingId ? '编辑题目' : '新增题目' }}</h3>
      <div class="form-row">
        <label>类别</label>
        <select v-model="form.category" class="form-select">
          <option v-for="opt in categoryOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
        </select>
      </div>
      <div class="form-row">
        <label>难度</label>
        <select v-model="form.difficulty" class="form-select">
          <option value="junior">初级</option>
          <option value="mid">中级</option>
          <option value="senior">高级</option>
        </select>
      </div>
      <div class="form-row">
        <label>题目</label>
        <textarea v-model="form.question" class="form-textarea" rows="2" placeholder="面试题内容"></textarea>
      </div>
      <div class="form-row">
        <label>答案</label>
        <textarea v-model="form.answer" class="form-textarea" rows="6" placeholder="详细答案"></textarea>
      </div>
      <div class="form-row">
        <label>核心要点</label>
        <div v-for="(p, i) in form.keyPoints" :key="i" class="form-list-item">
          <input v-model="form.keyPoints[i]" class="form-input" placeholder="要点" />
          <button class="btn-icon" @click="removeKeyPoint(i)">✕</button>
        </div>
        <button class="btn btn-outline btn-sm" @click="addKeyPoint">+ 添加要点</button>
      </div>
      <div class="form-row">
        <label>追问</label>
        <div v-for="(p, i) in form.followUp" :key="i" class="form-list-item">
          <input v-model="form.followUp![i]" class="form-input" placeholder="追问" />
          <button class="btn-icon" @click="removeFollowUp(i)">✕</button>
        </div>
        <button class="btn btn-outline btn-sm" @click="addFollowUp">+ 添加追问</button>
      </div>
      <div class="form-actions">
        <button class="btn btn-primary" @click="handleSave">保存</button>
        <button class="btn btn-outline" @click="showForm = false">取消</button>
      </div>
    </div>

    <!-- 题目列表 -->
    <div class="questions-list">
      <div
        v-for="q in store.filteredQuestions"
        :key="q.id"
        class="question-card"
        :class="{ expanded: store.expandedId === q.id }"
      >
        <div class="question-header" @click="store.toggleExpand(q.id)">
          <div class="question-left">
            <span class="q-difficulty" :class="q.difficulty">
              {{ q.difficulty === 'junior' ? '初级' : q.difficulty === 'mid' ? '中级' : '高级' }}
            </span>
            <span class="q-category">{{ INTERVIEW_CATEGORY_LABELS[q.category] }}</span>
          </div>
          <div class="question-title">{{ q.question }}</div>
          <div class="question-right">
            <button class="icon-btn" @click.stop="handleEdit(q)" title="编辑">✎</button>
            <button class="icon-btn danger" @click.stop="handleDelete(q.id)" title="删除">✕</button>
            <button
              class="bookmark-btn"
              :class="{ active: store.isBookmarked(q.id) }"
              @click.stop="store.toggleBookmark(q.id)"
            >{{ store.isBookmarked(q.id) ? '★' : '☆' }}</button>
            <span class="expand-icon">{{ store.expandedId === q.id ? '▲' : '▼' }}</span>
          </div>
        </div>

        <div v-if="store.expandedId === q.id" class="question-body">
          <div class="answer-section">
            <h4>💡 参考答案</h4>
            <div class="answer-text" v-html="formatAnswer(q.answer)"></div>
          </div>
          <div class="key-points-section">
            <h4>🎯 核心要点</h4>
            <ul><li v-for="point in q.keyPoints" :key="point">{{ point }}</li></ul>
          </div>
          <div v-if="q.followUp && q.followUp.length > 0" class="followup-section">
            <h4>❓ 常见追问</h4>
            <ul><li v-for="fu in q.followUp" :key="fu">{{ fu }}</li></ul>
          </div>
        </div>
      </div>

      <div v-if="store.filteredQuestions.length === 0" class="empty-state">
        <p>没有找到相关面试题</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.interview-view { padding: 32px; max-width: 960px; margin: 0 auto; }
.interview-header { margin-bottom: 24px; }
.interview-header h2 { font-size: 22px; font-weight: 700; color: var(--text-primary); margin: 0 0 6px 0; }
.interview-subtitle { font-size: 14px; color: var(--text-secondary); margin: 0; }

.filter-bar { margin-bottom: 20px; }
.search-row { display: flex; gap: 12px; margin-bottom: 12px; }
.search-input {
  flex: 1; padding: 10px 14px; background: var(--bg-secondary);
  border: 1px solid var(--border); border-radius: 8px;
  color: var(--text-primary); font-size: 14px; outline: none;
}
.search-input:focus { border-color: var(--accent); }
.category-tabs { display: flex; flex-wrap: wrap; gap: 6px; }
.cat-tab {
  padding: 6px 12px; border-radius: 6px; border: 1px solid var(--border);
  background: transparent; color: var(--text-secondary); font-size: 12px;
  cursor: pointer; transition: all 0.15s;
}
.cat-tab:hover { border-color: var(--accent-dim); color: var(--text-primary); }
.cat-tab.active { background: var(--accent-bg); color: var(--accent); border-color: var(--accent-dim); }

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
.form-list-item { display: flex; gap: 8px; margin-bottom: 6px; }
.form-list-item .form-input { flex: 1; }
.form-actions { display: flex; gap: 12px; margin-top: 16px; }

/* 题目列表 */
.questions-list { display: flex; flex-direction: column; gap: 8px; }
.question-card {
  background: var(--bg-card); border: 1px solid var(--border);
  border-radius: 10px; overflow: hidden; transition: border-color 0.2s;
}
.question-card.expanded { border-color: var(--accent-dim); }
.question-header {
  display: flex; align-items: center; gap: 12px;
  padding: 14px 18px; cursor: pointer; transition: background 0.15s;
}
.question-header:hover { background: var(--bg-hover); }
.question-left { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
.q-difficulty { font-size: 11px; padding: 2px 8px; border-radius: 4px; font-weight: 600; }
.q-difficulty.junior { background: rgba(34,197,94,0.15); color: #4ade80; }
.q-difficulty.mid { background: rgba(99,102,241,0.15); color: #818cf8; }
.q-difficulty.senior { background: rgba(239,68,68,0.15); color: #f87171; }
.q-category { font-size: 11px; color: var(--text-tertiary); }
.question-title { flex: 1; font-size: 14px; font-weight: 600; color: var(--text-primary); line-height: 1.5; }
.question-right { display: flex; align-items: center; gap: 6px; flex-shrink: 0; }
.icon-btn {
  background: none; border: none; font-size: 14px; cursor: pointer;
  color: var(--text-tertiary); padding: 4px; transition: color 0.15s;
}
.icon-btn:hover { color: var(--accent); }
.icon-btn.danger:hover { color: var(--danger); }
.bookmark-btn {
  background: none; border: none; font-size: 18px; cursor: pointer;
  color: var(--text-tertiary); transition: color 0.15s;
}
.bookmark-btn.active { color: #f59e0b; }
.expand-icon { font-size: 12px; color: var(--text-tertiary); }

.question-body { padding: 0 18px 18px; border-top: 1px solid var(--border); }
.question-body h4 { font-size: 13px; font-weight: 600; color: var(--accent); margin: 16px 0 10px 0; }
.answer-text { font-size: 14px; color: var(--text-secondary); line-height: 1.8; }
.key-points-section ul, .followup-section ul { list-style: none; padding: 0; margin: 0; }
.key-points-section li, .followup-section li {
  font-size: 13px; color: var(--text-secondary); padding: 4px 0 4px 16px; position: relative;
}
.key-points-section li::before, .followup-section li::before {
  content: '•'; position: absolute; left: 2px; color: var(--accent);
}

.btn {
  padding: 8px 18px; border-radius: 8px; font-size: 14px; font-weight: 600;
  cursor: pointer; border: none; transition: all 0.2s;
}
.btn-primary { background: var(--accent); color: #fff; }
.btn-primary:hover { background: var(--accent-hover); }
.btn-outline { background: transparent; color: var(--text-secondary); border: 1px solid var(--border); }
.btn-outline:hover { border-color: var(--text-secondary); }
.btn-sm { padding: 4px 12px; font-size: 12px; }
.btn-icon { background: none; border: none; color: var(--text-tertiary); cursor: pointer; font-size: 14px; padding: 4px; }
.btn-icon:hover { color: var(--danger); }
.empty-state { text-align: center; padding: 60px 20px; }
.empty-state p { color: var(--text-secondary); font-size: 14px; }
</style>
