<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAssessmentStore } from '../stores/assessment'
import { useRoadmapStore } from '../stores/roadmap'
import { useNotesStore } from '../stores/notes'
import { useProjectsStore } from '../stores/projects'
import { useBlogStore } from '../stores/blog'
import { LEVEL_LABELS } from '../types'
import type { AssessmentResult, DimensionScores } from '../types'

const assessment = useAssessmentStore()
const roadmapStore = useRoadmapStore()
const notesStore = useNotesStore()
const projectsStore = useProjectsStore()
const blogStore = useBlogStore()

const emit = defineEmits<{
  goToAssessment: []
  goToRoadmap: []
  goToNotes: []
  goToProjects: []
  goToBlog: []
}>()

const latestAssessment = ref<AssessmentResult | null>(null)

onMounted(async () => {
  await assessment.loadHistory()
  if (assessment.history.length > 0) {
    latestAssessment.value = assessment.history[0]
  }
  roadmapStore.loadActiveRoadmap()
  notesStore.loadAll()
  projectsStore.loadAll()
  blogStore.loadAll()
})

const completionPercentage = roadmapStore.getCompletionPercentage()
</script>

<template>
  <div class="dashboard-view">
    <div class="dashboard-header">
      <h1>☕ Java 成长助手</h1>
      <p class="dashboard-subtitle">系统化提升你的 Java 技术能力</p>
    </div>

    <div class="cards-grid">
      <!-- 技能评估 -->
      <div class="dash-card" @click="emit('goToAssessment')">
        <div class="card-icon">🎯</div>
        <div class="card-content">
          <h3>技能评估</h3>
          <template v-if="latestAssessment">
            <p class="card-value">
              综合评分 <strong>{{ Object.values(latestAssessment.scores as DimensionScores).reduce((a, b) => a + b, 0) / 6 }}</strong>
            </p>
            <p class="card-meta">等级：{{ LEVEL_LABELS[latestAssessment.level as keyof typeof LEVEL_LABELS] }}</p>
          </template>
          <template v-else>
            <p class="card-value">尚未评估</p>
            <p class="card-meta">点击开始你的第一次技能评估</p>
          </template>
        </div>
        <span class="card-arrow">→</span>
      </div>

      <!-- 学习路线 -->
      <div class="dash-card" @click="emit('goToRoadmap')">
        <div class="card-icon">🗺️</div>
        <div class="card-content">
          <h3>学习路线图</h3>
          <template v-if="roadmapStore.currentRoadmap">
            <p class="card-value">
              进度 <strong>{{ completionPercentage }}%</strong>
            </p>
            <p class="card-meta">
              {{ roadmapStore.currentRoadmap.stages.filter(s => s.status === 'completed').length }}
              / {{ roadmapStore.currentRoadmap.stages.length }} 阶段完成
            </p>
          </template>
          <template v-else>
            <p class="card-value">暂无路线图</p>
            <p class="card-meta">完成评估后可生成学习路线</p>
          </template>
        </div>
        <span class="card-arrow">→</span>
      </div>

      <!-- 学习笔记 -->
      <div class="dash-card" @click="emit('goToNotes')">
        <div class="card-icon">📝</div>
        <div class="card-content">
          <h3>学习笔记</h3>
          <p class="card-value">共 <strong>{{ notesStore.notes.length }}</strong> 篇</p>
          <p class="card-meta">记录学习过程中的知识点</p>
        </div>
        <span class="card-arrow">→</span>
      </div>

      <!-- 项目实战 -->
      <div class="dash-card" @click="emit('goToProjects')">
        <div class="card-icon">🔨</div>
        <div class="card-content">
          <h3>项目实战</h3>
          <p class="card-value">
            <strong>{{ projectsStore.userProjects.filter(p => p.status === 'completed').length }}</strong> 个已完成
          </p>
          <p class="card-meta">共 {{ projectsStore.templates.length }} 个项目可选</p>
        </div>
        <span class="card-arrow">→</span>
      </div>

      <!-- 技术博客 -->
      <div class="dash-card" @click="emit('goToBlog')">
        <div class="card-icon">✍️</div>
        <div class="card-content">
          <h3>技术博客</h3>
          <p class="card-value">共 <strong>{{ blogStore.posts.length }}</strong> 篇</p>
          <p class="card-meta">沉淀输出，建立技术影响力</p>
        </div>
        <span class="card-arrow">→</span>
      </div>
    </div>

    <!-- 快速入口 -->
    <div class="quick-actions">
      <button class="action-btn" @click="emit('goToAssessment')">
        <span class="action-icon">🎯</span>
        <span>{{ latestAssessment ? '重新评估' : '开始评估' }}</span>
      </button>
      <button class="action-btn" @click="emit('goToNotes')">
        <span class="action-icon">📝</span>
        <span>写笔记</span>
      </button>
      <button class="action-btn" @click="emit('goToBlog')">
        <span class="action-icon">✍️</span>
        <span>写博客</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.dashboard-view {
  padding: 40px 32px;
  max-width: 900px;
  margin: 0 auto;
}

.dashboard-header {
  text-align: center;
  margin-bottom: 40px;
}

.dashboard-header h1 {
  font-size: 28px;
  font-weight: 800;
  color: var(--text-primary);
  margin: 0 0 8px 0;
}

.dashboard-subtitle {
  font-size: 15px;
  color: var(--text-secondary);
  margin: 0;
}

.cards-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 32px;
}

.dash-card {
  background: var(--bg-card);
  border-radius: 14px;
  padding: 22px;
  display: flex;
  align-items: center;
  gap: 14px;
  cursor: pointer;
  border: 1px solid var(--border);
  transition: all 0.2s ease;
}

.dash-card:hover {
  border-color: var(--accent-dim);
  transform: translateY(-2px);
}

.cards-grid .dash-card:nth-child(5) {
  grid-column: 1 / -1;
}

.card-icon {
  font-size: 32px;
  flex-shrink: 0;
}

.card-content {
  flex: 1;
}

.card-content h3 {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 6px 0;
}

.card-value {
  font-size: 14px;
  color: var(--text-secondary);
  margin: 0 0 3px 0;
}

.card-value strong {
  color: var(--accent);
  font-size: 18px;
}

.card-meta {
  font-size: 12px;
  color: var(--text-tertiary);
  margin: 0;
}

.card-arrow {
  font-size: 18px;
  color: var(--text-tertiary);
  flex-shrink: 0;
}

.quick-actions {
  display: flex;
  gap: 14px;
  justify-content: center;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-btn:hover {
  border-color: var(--accent);
  background: var(--accent-bg);
}

.action-icon {
  font-size: 18px;
}
</style>
