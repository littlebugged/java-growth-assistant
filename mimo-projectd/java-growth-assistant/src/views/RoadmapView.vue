<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useRoadmapStore } from '../stores/roadmap'
import { LEVEL_LABELS } from '../types'
import type { StageStatus } from '../types'
import RoadmapTimeline from '../components/RoadmapTimeline.vue'

const roadmapStore = useRoadmapStore()

onMounted(() => {
  roadmapStore.loadActiveRoadmap()
})

const completionPercentage = computed(() => roadmapStore.getCompletionPercentage())

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
          <h2>🗺️ {{ roadmapStore.currentRoadmap.title }}</h2>
          <p class="roadmap-meta">
            目标等级：<strong>{{ LEVEL_LABELS[roadmapStore.currentRoadmap.targetLevel] }}</strong>
            · 预计 {{ roadmapStore.currentRoadmap.estimatedWeeks }} 周
            · {{ roadmapStore.currentRoadmap.stages.length }} 个阶段
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
      <p>先完成技能评估，系统会为你生成个性化的学习路线</p>
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
  margin-bottom: 36px;
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
}

.progress-text {
  position: absolute;
  font-size: 16px;
  font-weight: 700;
  color: var(--text-primary);
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
