<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useProjectsStore } from '../stores/projects'
import { DIMENSION_LABELS, DIFFICULTY_LABELS, DIFFICULTY_COLORS } from '../types'
import type { ProjectTemplate, UserProject, SkillDimension, ProjectDifficulty } from '../types'

const store = useProjectsStore()

const viewing = ref<ProjectTemplate | null>(null)
const activeProject = ref<UserProject | null>(null)

onMounted(() => store.loadAll())

function handleView(template: ProjectTemplate) {
  viewing.value = template
  activeProject.value = store.getUserProject(template.id) ?? null
}

async function handleStart(template: ProjectTemplate) {
  const id = await store.startProject(template)
  activeProject.value = store.userProjects.find((p) => p.id === id) ?? null
}

async function handleNextStep() {
  if (!activeProject.value || !viewing.value) return
  const maxStep = viewing.value.steps.length - 1
  if (activeProject.value.currentStep < maxStep) {
    activeProject.value.currentStep++
  } else {
    activeProject.value.status = 'completed'
  }
  await store.updateProject(activeProject.value)
}

async function handlePrevStep() {
  if (!activeProject.value) return
  if (activeProject.value.currentStep > 0) {
    activeProject.value.currentStep--
    await store.updateProject(activeProject.value)
  }
}

function handleBack() {
  viewing.value = null
  activeProject.value = null
}
</script>

<template>
  <div class="projects-view">
    <!-- 项目详情 -->
    <div v-if="viewing" class="detail-section">
      <div class="detail-header">
        <button class="btn btn-outline" @click="handleBack">← 返回列表</button>
        <span
          class="difficulty-badge"
          :style="{ background: DIFFICULTY_COLORS[viewing.difficulty] + '22', color: DIFFICULTY_COLORS[viewing.difficulty] }"
        >
          {{ DIFFICULTY_LABELS[viewing.difficulty] }}
        </span>
      </div>

      <h2>{{ viewing.title }}</h2>
      <p class="detail-desc">{{ viewing.description }}</p>

      <div class="info-row">
        <div class="info-box">
          <h5>技术栈</h5>
          <div class="tags">
            <span v-for="tech in viewing.techStack" :key="tech" class="tag">{{ tech }}</span>
          </div>
        </div>
        <div class="info-box">
          <h5>学习目标</h5>
          <ul>
            <li v-for="goal in viewing.learningGoals" :key="goal">{{ goal }}</li>
          </ul>
        </div>
      </div>

      <!-- 代码示例 -->
      <div v-if="viewing.codeExample" class="code-section">
        <h3>💻 参考代码</h3>
        <pre class="code-block"><code>{{ viewing.codeExample }}</code></pre>
      </div>

      <!-- 参考资源 -->
      <div v-if="viewing.resources.length > 0" class="resources-section">
        <h3>📚 参考资源</h3>
        <div class="resource-list">
          <a v-for="res in viewing.resources" :key="res.url" :href="res.url" target="_blank" class="resource-link">
            {{ res.title }} ↗
          </a>
        </div>
      </div>

      <!-- 步骤列表 -->
      <div class="steps-section">
        <h3>📋 实施步骤</h3>
        <div
          v-for="step in viewing.steps"
          :key="step.order"
          class="step-card"
          :class="{ active: activeProject && activeProject.currentStep === step.order - 1, done: activeProject && activeProject.currentStep > step.order - 1 }"
        >
          <div class="step-number">
            <span v-if="activeProject && activeProject.currentStep > step.order - 1">✓</span>
            <span v-else>{{ step.order }}</span>
          </div>
          <div class="step-content">
            <h4>{{ step.title }}</h4>
            <p>{{ step.description }}</p>
            <details class="hints">
              <summary>💡 提示</summary>
              <ul>
                <li v-for="hint in step.hints" :key="hint">{{ hint }}</li>
              </ul>
            </details>
            <div v-if="step.codeExample" class="step-code">
              <pre class="code-block"><code>{{ step.codeExample }}</code></pre>
            </div>
          </div>
        </div>
      </div>

      <!-- 操作区 -->
      <div class="action-bar">
        <template v-if="!activeProject">
          <button class="btn btn-primary" @click="handleStart(viewing)">🚀 开始项目</button>
        </template>
        <template v-else>
          <button class="btn btn-outline" :disabled="activeProject.currentStep === 0" @click="handlePrevStep">上一步</button>
          <span class="step-info">步骤 {{ activeProject.currentStep + 1 }} / {{ viewing.steps.length }}</span>
          <button class="btn btn-primary" @click="handleNextStep">
            {{ activeProject.status === 'completed' ? '✅ 已完成' : activeProject.currentStep >= viewing.steps.length - 1 ? '完成项目' : '下一步' }}
          </button>
        </template>
      </div>
    </div>

    <!-- 项目列表 -->
    <div v-else class="list-section">
      <div class="list-header">
        <h2>🔨 项目实战库</h2>
      </div>

      <template v-for="(templates, dim) in store.templatesByDimension" :key="dim">
        <div class="dimension-group">
          <h3 class="group-title">{{ DIMENSION_LABELS[dim as SkillDimension] ?? dim }}</h3>
          <div class="project-grid">
            <div
              v-for="tpl in templates"
              :key="tpl.id"
              class="project-card"
              @click="handleView(tpl)"
            >
              <div class="project-card-top">
                <h4>{{ tpl.title }}</h4>
                <span
                  class="difficulty-badge"
                  :style="{ background: DIFFICULTY_COLORS[tpl.difficulty] + '22', color: DIFFICULTY_COLORS[tpl.difficulty] }"
                >
                  {{ DIFFICULTY_LABELS[tpl.difficulty] }}
                </span>
              </div>
              <p class="project-desc">{{ tpl.description }}</p>
              <div class="project-tags">
                <span v-for="tech in tpl.techStack.slice(0, 3)" :key="tech" class="tag">{{ tech }}</span>
              </div>
              <div v-if="store.getUserProject(tpl.id)" class="project-status">
                <span class="status-dot" :class="store.getUserProject(tpl.id)!.status"></span>
                {{ store.getUserProject(tpl.id)!.status === 'completed' ? '已完成' : store.getUserProject(tpl.id)!.status === 'in_progress' ? '进行中' : '未开始' }}
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
.projects-view {
  padding: 32px;
  max-width: 900px;
  margin: 0 auto;
}

.list-header h2 {
  font-size: 22px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 24px 0;
}

.dimension-group {
  margin-bottom: 28px;
}

.group-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-secondary);
  margin: 0 0 12px 0;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--border);
}

.project-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}

.project-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 18px;
  cursor: pointer;
  transition: border-color 0.2s;
}

.project-card:hover {
  border-color: var(--accent-dim);
}

.project-card-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.project-card-top h4 {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.project-desc {
  font-size: 13px;
  color: var(--text-secondary);
  margin: 0 0 10px 0;
  line-height: 1.5;
}

.project-tags {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.tag {
  font-size: 11px;
  padding: 2px 8px;
  background: var(--bg-tertiary);
  color: var(--text-secondary);
  border-radius: 4px;
}

.project-status {
  margin-top: 10px;
  font-size: 12px;
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  gap: 6px;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--text-tertiary);
}

.status-dot.in_progress { background: var(--accent); }
.status-dot.completed { background: var(--success); }

.difficulty-badge {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 4px;
  font-weight: 600;
}

/* 详情 */
.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.detail-section h2 {
  font-size: 22px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 8px 0;
}

.detail-desc {
  font-size: 14px;
  color: var(--text-secondary);
  margin: 0 0 24px 0;
  line-height: 1.6;
}

.info-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 28px;
}

.info-box {
  background: var(--bg-card);
  border-radius: 10px;
  padding: 16px;
}

.info-box h5 {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-secondary);
  margin: 0 0 10px 0;
}

.info-box ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.info-box li {
  font-size: 13px;
  color: var(--text-primary);
  padding: 3px 0;
  padding-left: 16px;
  position: relative;
}

.info-box li::before {
  content: '•';
  position: absolute;
  left: 2px;
  color: var(--accent);
}

.tags {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.steps-section {
  margin-bottom: 24px;
}

.steps-section h3 {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 16px 0;
}

.step-card {
  display: flex;
  gap: 14px;
  padding: 14px 16px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 10px;
  margin-bottom: 10px;
  transition: all 0.2s;
}

.step-card.active {
  border-color: var(--accent);
  background: var(--accent-bg);
}

.step-card.done {
  opacity: 0.6;
}

.step-number {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: var(--bg-tertiary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 700;
  color: var(--text-secondary);
  flex-shrink: 0;
}

.step-card.active .step-number {
  background: var(--accent);
  color: #fff;
}

.step-card.done .step-number {
  background: var(--success);
  color: #fff;
}

.step-content h4 {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 4px 0;
}

.step-content p {
  font-size: 13px;
  color: var(--text-secondary);
  margin: 0;
}

.hints {
  margin-top: 8px;
}

.hints summary {
  font-size: 12px;
  color: var(--accent);
  cursor: pointer;
}

.hints ul {
  list-style: none;
  padding: 8px 0 0 0;
  margin: 0;
}

.hints li {
  font-size: 12px;
  color: var(--text-secondary);
  padding: 2px 0;
}

.action-bar {
  display: flex;
  align-items: center;
  gap: 16px;
  justify-content: center;
  padding: 20px 0;
}

.step-info {
  font-size: 14px;
  color: var(--text-secondary);
}

.btn {
  padding: 10px 24px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
}

.btn:disabled { opacity: 0.4; cursor: not-allowed; }
.btn-primary { background: var(--accent); color: #fff; }
.btn-primary:hover:not(:disabled) { background: var(--accent-hover); }
.btn-outline { background: transparent; color: var(--text-secondary); border: 1px solid var(--border); }
.btn-outline:hover:not(:disabled) { border-color: var(--text-secondary); }

.code-section { margin-bottom: 24px; }
.code-section h3 { font-size: 16px; font-weight: 600; color: var(--text-primary); margin: 0 0 12px 0; }
.code-block { background: var(--bg-tertiary); border-radius: 8px; padding: 16px; overflow-x: auto; font-family: 'SFMono-Regular', 'Consolas', 'Liberation Mono', monospace; font-size: 13px; line-height: 1.6; color: var(--text-primary); margin: 0; }
.step-code { margin-top: 10px; }
.step-code .code-block { padding: 12px; font-size: 12px; }

.resources-section { margin-bottom: 24px; }
.resources-section h3 { font-size: 16px; font-weight: 600; color: var(--text-primary); margin: 0 0 12px 0; }
.resource-list { display: flex; flex-direction: column; gap: 8px; }
.resource-link { font-size: 14px; color: var(--accent); text-decoration: none; padding: 8px 12px; background: var(--accent-bg); border-radius: 6px; transition: background 0.2s; }
.resource-link:hover { background: rgba(99, 102, 241, 0.2); }
</style>
