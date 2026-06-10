<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useAssessmentStore } from '../stores/assessment'
import { useRoadmapStore } from '../stores/roadmap'
import { useNotesStore } from '../stores/notes'
import { useProjectsStore } from '../stores/projects'
import { useBlogStore } from '../stores/blog'
import { DIMENSION_LABELS, LEVEL_LABELS } from '../types'
import type { SkillDimension, AssessmentResult } from '../types'
import ScoreRadar from '../components/ScoreRadar.vue'

const assessment = useAssessmentStore()
const roadmapStore = useRoadmapStore()
const notesStore = useNotesStore()
const projectsStore = useProjectsStore()
const blogStore = useBlogStore()

onMounted(async () => {
  await assessment.loadHistory()
  roadmapStore.loadActiveRoadmap()
  notesStore.loadAll()
  projectsStore.loadAll()
  blogStore.loadAll()
})

const latestAssessment = computed(() => assessment.history[0] ?? null)

const roadmapProgress = computed(() => {
  if (!roadmapStore.currentRoadmap) return { total: 0, completed: 0, inProgress: 0, percentage: 0 }
  const stages = roadmapStore.currentRoadmap.stages
  const completed = stages.filter(s => s.status === 'completed').length
  const inProgress = stages.filter(s => s.status === 'in_progress').length
  return {
    total: stages.length,
    completed,
    inProgress,
    percentage: stages.length > 0 ? Math.round((completed / stages.length) * 100) : 0,
  }
})

const notesByDimension = computed(() => {
  const map: Record<string, number> = {}
  for (const n of notesStore.notes) {
    const dim = n.dimension || 'general'
    map[dim] = (map[dim] || 0) + 1
  }
  return map
})

const projectStats = computed(() => {
  const total = projectsStore.userProjects.length
  const completed = projectsStore.userProjects.filter(p => p.status === 'completed').length
  const inProgress = projectsStore.userProjects.filter(p => p.status === 'in_progress').length
  return { total, completed, inProgress }
})

// 历史评估趋势
const assessmentTrend = computed(() => {
  return assessment.history.slice(0, 5).reverse().map(a => ({
    date: a.createdAt?.slice(5, 10) ?? '',
    score: Math.round(Object.values(a.scores).reduce((s, v) => s + v, 0) / 6),
    level: a.level,
  }))
})

const maxTrendScore = computed(() => Math.max(...assessmentTrend.value.map(t => t.score), 1))
</script>

<template>
  <div class="stats-view">
    <h2>📊 学习数据看板</h2>

    <!-- 总览卡片 -->
    <div class="overview-grid">
      <div class="stat-card">
        <div class="stat-value">{{ assessment.history.length }}</div>
        <div class="stat-label">评估次数</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">{{ notesStore.notes.length }}</div>
        <div class="stat-label">学习笔记</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">{{ projectStats.completed }}/{{ projectStats.total }}</div>
        <div class="stat-label">项目完成</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">{{ blogStore.posts.length }}</div>
        <div class="stat-label">博客文章</div>
      </div>
    </div>

    <div class="stats-grid">
      <!-- 雷达图 -->
      <div class="stats-card" v-if="latestAssessment">
        <h3>能力分布</h3>
        <ScoreRadar :scores="latestAssessment.scores" />
        <div class="radar-legend">
          <div v-for="(label, dim) in DIMENSION_LABELS" :key="dim" class="legend-item">
            <span class="legend-label">{{ label }}</span>
            <span class="legend-score">{{ latestAssessment.scores[dim as SkillDimension] }}分</span>
          </div>
        </div>
      </div>

      <!-- 路线图进度 -->
      <div class="stats-card">
        <h3>路线图进度</h3>
        <div v-if="roadmapStore.currentRoadmap" class="roadmap-stats">
          <div class="progress-ring-large">
            <svg width="120" height="120" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="50" fill="none" stroke="var(--bg-tertiary)" stroke-width="8" />
              <circle cx="60" cy="60" r="50" fill="none" stroke="var(--accent)" stroke-width="8"
                stroke-linecap="round"
                :stroke-dasharray="2 * Math.PI * 50"
                :stroke-dashoffset="2 * Math.PI * 50 * (1 - roadmapProgress.percentage / 100)"
                transform="rotate(-90 60 60)"
                style="transition: stroke-dashoffset 0.5s ease" />
            </svg>
            <span class="progress-percent">{{ roadmapProgress.percentage }}%</span>
          </div>
          <div class="progress-details">
            <div class="detail-row">
              <span class="dot completed"></span>
              <span>已完成 {{ roadmapProgress.completed }}</span>
            </div>
            <div class="detail-row">
              <span class="dot in_progress"></span>
              <span>进行中 {{ roadmapProgress.inProgress }}</span>
            </div>
            <div class="detail-row">
              <span class="dot pending"></span>
              <span>未开始 {{ roadmapProgress.total - roadmapProgress.completed - roadmapProgress.inProgress }}</span>
            </div>
          </div>
        </div>
        <div v-else class="empty-text">暂无路线图</div>
      </div>

      <!-- 笔记分布 -->
      <div class="stats-card">
        <h3>笔记分布</h3>
        <div v-if="notesStore.notes.length > 0" class="notes-dist">
          <div v-for="(label, dim) in DIMENSION_LABELS" :key="dim" class="dist-row">
            <span class="dist-label">{{ label }}</span>
            <div class="dist-bar-bg">
              <div class="dist-bar" :style="{ width: ((notesByDimension[dim] ?? 0) / Math.max(...Object.values(notesByDimension), 1)) * 100 + '%' }"></div>
            </div>
            <span class="dist-count">{{ notesByDimension[dim] ?? 0 }}</span>
          </div>
        </div>
        <div v-else class="empty-text">暂无笔记</div>
      </div>

      <!-- 评估趋势 -->
      <div class="stats-card" v-if="assessmentTrend.length > 1">
        <h3>评估趋势</h3>
        <div class="trend-chart">
          <div v-for="(point, i) in assessmentTrend" :key="i" class="trend-bar-wrapper">
            <div class="trend-bar" :style="{ height: (point.score / maxTrendScore) * 100 + '%' }">
              <span class="trend-value">{{ point.score }}</span>
            </div>
            <span class="trend-label">{{ point.date }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.stats-view { padding: 32px; max-width: 900px; margin: 0 auto; }
.stats-view h2 { font-size: 22px; font-weight: 700; color: var(--text-primary); margin: 0 0 24px 0; }

.overview-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 24px; }
.stat-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: 10px; padding: 20px; text-align: center; }
.stat-value { font-size: 28px; font-weight: 800; color: var(--accent); }
.stat-label { font-size: 13px; color: var(--text-secondary); margin-top: 4px; }

.stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.stats-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: 12px; padding: 20px; }
.stats-card h3 { font-size: 15px; font-weight: 600; color: var(--text-primary); margin: 0 0 16px 0; }

.radar-legend { margin-top: 12px; }
.legend-item { display: flex; justify-content: space-between; padding: 4px 0; font-size: 13px; }
.legend-label { color: var(--text-secondary); }
.legend-score { color: var(--text-primary); font-weight: 600; }

.roadmap-stats { display: flex; align-items: center; gap: 24px; }
.progress-ring-large { position: relative; display: flex; align-items: center; justify-content: center; }
.progress-percent { position: absolute; font-size: 22px; font-weight: 800; color: var(--text-primary); }
.progress-details { display: flex; flex-direction: column; gap: 10px; }
.detail-row { display: flex; align-items: center; gap: 8px; font-size: 13px; color: var(--text-secondary); }
.dot { width: 10px; height: 10px; border-radius: 50%; }
.dot.completed { background: var(--success); }
.dot.in_progress { background: var(--accent); }
.dot.pending { background: var(--text-tertiary); }

.notes-dist { display: flex; flex-direction: column; gap: 10px; }
.dist-row { display: flex; align-items: center; gap: 10px; }
.dist-label { font-size: 12px; color: var(--text-secondary); width: 80px; flex-shrink: 0; }
.dist-bar-bg { flex: 1; height: 8px; background: var(--bg-tertiary); border-radius: 4px; overflow: hidden; }
.dist-bar { height: 100%; background: var(--accent); border-radius: 4px; transition: width 0.3s; }
.dist-count { font-size: 12px; color: var(--text-primary); font-weight: 600; width: 24px; text-align: right; }

.trend-chart { display: flex; align-items: flex-end; gap: 12px; height: 140px; }
.trend-bar-wrapper { flex: 1; display: flex; flex-direction: column; align-items: center; height: 100%; justify-content: flex-end; }
.trend-bar { width: 100%; background: var(--accent); border-radius: 4px 4px 0 0; position: relative; min-height: 4px; transition: height 0.3s; }
.trend-value { position: absolute; top: -20px; left: 50%; transform: translateX(-50%); font-size: 11px; font-weight: 600; color: var(--text-primary); }
.trend-label { font-size: 11px; color: var(--text-tertiary); margin-top: 6px; }

.empty-text { font-size: 13px; color: var(--text-tertiary); text-align: center; padding: 40px 0; }
</style>
