<script setup lang="ts">
import { ref } from 'vue'
import type { RoadmapStage, StageStatus } from '../types'

const props = defineProps<{
  stage: RoadmapStage
}>()

const emit = defineEmits<{
  toggleStatus: [stageId: number, newStatus: StageStatus]
}>()

const expanded = ref(false)

const statusLabels: Record<StageStatus, string> = {
  pending: '未开始',
  in_progress: '进行中',
  completed: '已完成',
}
</script>

<template>
  <div class="stage-card" :class="stage.status" @click="expanded = !expanded">
    <div class="stage-header">
      <div class="stage-info">
        <h4 class="stage-title">{{ stage.title }}</h4>
        <p class="stage-desc">{{ stage.description }}</p>
      </div>
      <div class="stage-meta">
        <span class="stage-badge" :class="stage.status">
          {{ statusLabels[stage.status] }}
        </span>
        <span class="stage-time">~{{ stage.estimatedDays }}天</span>
      </div>
    </div>

    <div v-if="expanded" class="stage-detail" @click.stop>
      <div class="topics-section">
        <h5>📚 学习主题</h5>
        <ul>
          <li v-for="(topic, i) in stage.topics" :key="i">{{ topic }}</li>
        </ul>
      </div>

      <div class="project-section">
        <h5>🔨 实战项目</h5>
        <p class="project-title">{{ stage.projectTitle }}</p>
        <p class="project-desc">{{ stage.projectDesc }}</p>
      </div>

      <div class="stage-actions">
        <button
          v-if="stage.status === 'pending'"
          class="btn btn-primary"
          @click="emit('toggleStatus', stage.id!, 'in_progress')"
        >
          开始学习
        </button>
        <button
          v-if="stage.status === 'in_progress'"
          class="btn btn-success"
          @click="emit('toggleStatus', stage.id!, 'completed')"
        >
          标记完成
        </button>
        <button
          v-if="stage.status === 'completed'"
          class="btn btn-outline"
          @click="emit('toggleStatus', stage.id!, 'pending')"
        >
          重置状态
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.stage-card {
  flex: 1;
  background: var(--bg-card);
  border-radius: 12px;
  padding: 20px 24px;
  margin-bottom: 16px;
  cursor: pointer;
  border: 1px solid var(--border);
  transition: all 0.2s ease;
}

.stage-card:hover {
  border-color: var(--accent-dim);
}

.stage-card.completed {
  opacity: 0.75;
}

.stage-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
}

.stage-info {
  flex: 1;
}

.stage-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 6px 0;
}

.stage-desc {
  font-size: 13px;
  color: var(--text-secondary);
  margin: 0;
  line-height: 1.5;
}

.stage-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 6px;
  flex-shrink: 0;
}

.stage-badge {
  font-size: 12px;
  padding: 3px 10px;
  border-radius: 20px;
  font-weight: 600;
}

.stage-badge.pending {
  background: rgba(161, 161, 170, 0.15);
  color: #a1a1aa;
}

.stage-badge.in_progress {
  background: rgba(99, 102, 241, 0.15);
  color: #818cf8;
}

.stage-badge.completed {
  background: rgba(34, 197, 94, 0.15);
  color: #4ade80;
}

.stage-time {
  font-size: 12px;
  color: var(--text-tertiary);
}

.stage-detail {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid var(--border);
}

.topics-section h5,
.project-section h5 {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 12px 0;
}

.topics-section ul {
  list-style: none;
  padding: 0;
  margin: 0 0 20px 0;
}

.topics-section li {
  padding: 6px 0;
  font-size: 14px;
  color: var(--text-secondary);
  position: relative;
  padding-left: 20px;
}

.topics-section li::before {
  content: '•';
  position: absolute;
  left: 4px;
  color: var(--accent);
}

.project-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 6px 0;
}

.project-desc {
  font-size: 13px;
  color: var(--text-secondary);
  margin: 0 0 16px 0;
  line-height: 1.5;
}

.stage-actions {
  display: flex;
  gap: 12px;
}

.btn {
  padding: 8px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: all 0.2s ease;
}

.btn-primary {
  background: var(--accent);
  color: #fff;
}

.btn-primary:hover {
  background: var(--accent-hover);
}

.btn-success {
  background: var(--success);
  color: #fff;
}

.btn-success:hover {
  opacity: 0.9;
}

.btn-outline {
  background: transparent;
  color: var(--text-secondary);
  border: 1px solid var(--border);
}

.btn-outline:hover {
  border-color: var(--text-secondary);
}
</style>
