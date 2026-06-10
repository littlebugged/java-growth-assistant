<script setup lang="ts">
import type { RoadmapStage, StageStatus } from '../types'
import StageCard from './StageCard.vue'

const props = defineProps<{
  stages: RoadmapStage[]
}>()

const emit = defineEmits<{
  toggleStatus: [stageId: number, newStatus: StageStatus]
}>()

function handleToggle(stageId: number, currentStatus: StageStatus) {
  const next: Record<StageStatus, StageStatus> = {
    pending: 'in_progress',
    in_progress: 'completed',
    completed: 'pending',
  }
  emit('toggleStatus', stageId, next[currentStatus])
}
</script>

<template>
  <div class="timeline">
    <div
      v-for="(stage, index) in stages"
      :key="stage.id ?? index"
      class="timeline-item"
      :class="{ completed: stage.status === 'completed' }"
    >
      <div class="timeline-connector">
        <div class="timeline-dot" :class="stage.status">
          <span v-if="stage.status === 'completed'">✓</span>
          <span v-else-if="stage.status === 'in_progress'">▶</span>
          <span v-else>{{ index + 1 }}</span>
        </div>
        <div v-if="index < stages.length - 1" class="timeline-line" :class="{ filled: stage.status === 'completed' }"></div>
      </div>
      <StageCard
        :stage="stage"
        @toggle-status="handleToggle"
      />
    </div>
  </div>
</template>

<style scoped>
.timeline {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.timeline-item {
  display: flex;
  gap: 20px;
}

.timeline-connector {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
  width: 40px;
}

.timeline-dot {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 700;
  flex-shrink: 0;
  background: var(--bg-tertiary);
  color: var(--text-secondary);
  border: 2px solid var(--border);
  transition: all 0.3s ease;
}

.timeline-dot.in_progress {
  background: var(--accent-bg);
  color: var(--accent);
  border-color: var(--accent);
}

.timeline-dot.completed {
  background: var(--success);
  color: #fff;
  border-color: var(--success);
}

.timeline-line {
  flex: 1;
  width: 2px;
  background: var(--border);
  min-height: 20px;
  transition: background 0.3s ease;
}

.timeline-line.filled {
  background: var(--success);
}
</style>
