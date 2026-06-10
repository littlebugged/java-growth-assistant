<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useRoadmapStore } from '../stores/roadmap'
import { LEVEL_LABELS, DIMENSION_LABELS, PRIORITY_LABELS, PRIORITY_COLORS } from '../types'
import type { StageStatus } from '../types'
import RoadmapTimeline from '../components/RoadmapTimeline.vue'

const roadmapStore = useRoadmapStore()

onMounted(() => {
  roadmapStore.loadActiveRoadmap()
})

const completionPercentage = computed(() => roadmapStore.getCompletionPercentage())

const weakDims = computed(() => roadmapStore.getWeakDimensions(2))
const strongDims = computed(() => roadmapStore.getStrongDimensions())

const totalDays = computed(() => {
  if (!roadmapStore.currentRoadmap) return 0
  return roadmapStore.currentRoadmap.stages.reduce((sum, s) => sum + s.estimatedDays, 0)
})

function handleToggleStatus(stageId: number, newStatus: StageStatus) {
  roadmapStore.updateStageStatus(stageId, newStatus)
}
</script>

<template>
  <div class="roadmap-view">
    <div v-if="roadmapStore.currentRoadmap" class="roadmap-content">
      <!-- 头部 -->
      <div class="roadmap-header">
        <div class="roadmap-title-area">
          <div class="personalized-badge">🎯 个性化路线</div>
          <h2>🗺️ {{ roadmapStore.currentRoadmap.title }}</h2>
          <p class="roadmap-meta">
            目标等级：<strong>{{ LEVEL_LABELS[roadmapStore.currentRoadmap.targetLevel] }}</strong>
            · 预计 {{ roadmapStore.currentRoadmap.estimatedWeeks }} 周（{{ totalDays }} 天）
            · {{ roadmapStore.currentRoadmap.stages.length }} 个维度
          </p>
        </div>
        <div class="progress-ring">
          <svg width="80" height="80" viewBox="0 0 80 80">
            <circle cx="40" cy="40" r="34" fill="none" stroke="var(--bg-tertiary)" stroke-width="6" />
            <circle
              cx="40" cy="40" r="34" fill="none"
              stroke="var(--accent)"
              stroke-width="6"
              stroke-linecap="round"
              :stroke-dasharray="2 * Math.PI * 34"
              :stroke-dashoffset="2 * Math.PI * 34 * (1 - completionPercentage / 100)"
              transform="rotate(-90 40 40)"
              style="transition: stroke-dashoffset 0.5s ease"
            />
          </svg>
          <span class="progress-text">{{ completionPercentage }}%</span>
        </div>
      </div>

      <!-- 强弱项统计 -->
      <div class="stats-bar">
        <div v-if="weakDims.length > 0" class="stat-group">
          <span class="stat-label">🔴 重点攻克：</span>
          <span v-for="d in weakDims" :key="d.dimension" class="stat-item weak">
            {{ DIMENSION_LABELS[d.dimension] }} ({{ d.score }}分)
          </span>
        </div>
        <div v-if="strongDims.length > 0" class="stat-group">
          <span class="stat-label">🟢 已掌握：</span>
          <span v-for="d in strongDims" :key="d.dimension" class="stat-item strong">
            {{ DIMENSION_LABELS[d.dimension] }} ({{ d.score }}分)
          </span>
        </div>
      </div>

      <!-- 优先级说明 -->
      <div class="priority-legend">
        <span class="legend-item" v-for="(label, key) in PRIORITY_LABELS" :key="key">
          <span class="legend-dot" :style="{ background: PRIORITY_COLORS[key as keyof typeof PRIORITY_COLORS] }"></span>
          {{ label }}
        </span>
        <span class="legend-item">
          <span class="legend-dot" style="background: #f59e0b"></span>
          ≥80分可快速过
        </span>
      </div>

      <!-- 时间线 -->
      <RoadmapTimeline
        :stages="roadmapStore.currentRoadmap.stages"
        @toggle-status="handleToggleStatus"
      />
    </div>

    <!-- 空状态 -->
    <div v-else class="empty-state">
      <div class="empty-icon">🗺️</div>
      <h3>还没有学习路线图</h3>
      <p>先完成技能评估，系统会根据你的各维度分数生成个性化学习路线</p>
    </div>
  </div>
</template>

<style scoped>
.roadmap-view {
  padding: 32px;
  max-width: 800px;
  margin: 0 auto;
}

.roadmap-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.roadmap-title-area {
  flex: 1;
}

.personalized-badge {
  display: inline-block;
  font-size: 12px;
  padding: 3px 10px;
  border-radius: 20px;
  background: rgba(99, 102, 241, 0.15);
  color: #818cf8;
  font-weight: 600;
  margin-bottom: 8px;
}

.roadmap-title-area h2 {
  font-size: 22px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 8px 0;
}

.roadmap-meta {
  font-size: 14px;
  color: var(--text-secondary);
  margin: 0;
}

.roadmap-meta strong {
  color: var(--accent);
}

.progress-ring {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-left: 24px;
}

.progress-text {
  position: absolute;
  font-size: 16px;
  font-weight: 700;
  color: var(--text-primary);
}

/* 强弱项统计 */
.stats-bar {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
  padding: 14px 18px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 10px;
}

.stat-group {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.stat-label {
  font-size: 13px;
  color: var(--text-secondary);
  font-weight: 600;
  flex-shrink: 0;
}

.stat-item {
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 4px;
  font-weight: 600;
}

.stat-item.weak {
  background: rgba(239, 68, 68, 0.12);
  color: #f87171;
}

.stat-item.strong {
  background: rgba(34, 197, 94, 0.12);
  color: #4ade80;
}

/* 优先级图例 */
.priority-legend {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 28px;
  flex-wrap: wrap;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--text-tertiary);
}

.legend-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 80px 20px;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.empty-state h3 {
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 8px 0;
}

.empty-state p {
  font-size: 14px;
  color: var(--text-secondary);
  margin: 0;
}
</style>
