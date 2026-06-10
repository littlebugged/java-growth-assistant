<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAssessmentStore } from '../stores/assessment'
import { useRoadmapStore } from '../stores/roadmap'
import QuestionCard from '../components/QuestionCard.vue'
import ScoreRadar from '../components/ScoreRadar.vue'
import { DIMENSION_LABELS, LEVEL_LABELS } from '../types'
import type { SkillDimension } from '../types'

const assessment = useAssessmentStore()
const roadmapStore = useRoadmapStore()

const emit = defineEmits<{
  goToRoadmap: []
}>()

const showResult = ref(false)
const showExplanation = ref(false)
const isCorrect = ref(false)

// 每次进入评估页面都重新开始
onMounted(async () => {
  showResult.value = false
  showExplanation.value = false
  await assessment.reset()
})

const canGoNext = computed(() => {
  return assessment.currentQuestion && assessment.answers[assessment.currentQuestion.id]
})

function handleSelect(value: string) {
  if (!assessment.currentQuestion) return
  // 允许修改答案
  assessment.selectAnswer(assessment.currentQuestion.id, value)
  showExplanation.value = true
  isCorrect.value = value === assessment.currentQuestion.answer
}

async function handleNext() {
  showExplanation.value = false
  if (assessment.currentIndex >= assessment.totalQuestions - 1) {
    await assessment.completeAssessment()
    showResult.value = true
  } else {
    assessment.nextQuestion()
  }
}

async function handleGenerateRoadmap() {
  const results = assessment.history
  const latest = results.length > 0 ? results[0] : null
  if (latest) {
    await roadmapStore.generateRoadmap(latest)
    emit('goToRoadmap')
  }
}

function handleRestart() {
  showResult.value = false
  showExplanation.value = false
  assessment.reset()
}

const dimensionEntries = computed(() => {
  return Object.entries(assessment.scores).map(([dim, score]) => ({
    dimension: dim as SkillDimension,
    label: DIMENSION_LABELS[dim as SkillDimension],
    score,
  }))
})

// 统计答对题数
const correctCount = computed(() => {
  if (!assessment.currentQuestion && !showResult.value) return 0
  let count = 0
  for (const q of assessment.currentQuestions ?? []) {
    if (assessment.answers[q.id] === q.answer) count++
  }
  return count
})
</script>

<template>
  <div class="assessment-view">
    <!-- 答题 -->
    <div v-if="!showResult" class="quiz-section">
      <div class="quiz-header">
        <h2>🎯 Java 技能评估</h2>
        <p class="quiz-subtitle">共 {{ assessment.totalQuestions }} 道随机题，覆盖 6 大维度，每次题目不同</p>
      </div>

      <div class="progress-bar-container">
        <div class="progress-bar" :style="{ width: assessment.progress + '%' }"></div>
        <span class="progress-text">{{ assessment.currentIndex + 1 }} / {{ assessment.totalQuestions }}</span>
      </div>

      <QuestionCard
        v-if="assessment.currentQuestion"
        :question="assessment.currentQuestion"
        :selected-answer="assessment.answers[assessment.currentQuestion.id]"
        :show-explanation="showExplanation"
        @select="handleSelect"
      />

      <!-- 答题反馈 -->
      <div v-if="showExplanation" class="feedback-bar" :class="{ correct: isCorrect, wrong: !isCorrect }">
        <span>{{ isCorrect ? '✅ 回答正确！' : '❌ 回答错误，查看解析' }}</span>
      </div>

      <div class="quiz-nav">
        <button class="btn btn-outline" :disabled="assessment.currentIndex === 0" @click="assessment.prevQuestion(); showExplanation = false">上一题</button>
        <button class="btn btn-primary" :disabled="!canGoNext" @click="handleNext">
          {{ assessment.currentIndex >= assessment.totalQuestions - 1 ? '完成评估' : '下一题' }}
        </button>
      </div>
    </div>

    <!-- 结果 -->
    <div v-else class="result-section">
      <div class="result-header"><h2>📊 评估结果</h2></div>

      <div class="result-grid">
        <div class="radar-card">
          <h3>能力分布</h3>
          <ScoreRadar :scores="assessment.scores" />
        </div>

        <div class="score-card">
          <div class="overall-score">
            <span class="score-number">{{ assessment.overallScore }}</span>
            <span class="score-label">综合得分</span>
          </div>
          <div class="level-badge">{{ LEVEL_LABELS[assessment.level] }}</div>
          <div class="dimension-scores">
            <div v-for="entry in dimensionEntries" :key="entry.dimension" class="dimension-row">
              <span class="dim-label">{{ entry.label }}</span>
              <div class="dim-bar-bg"><div class="dim-bar" :style="{ width: entry.score + '%' }" :class="{ high: entry.score >= 70, mid: entry.score >= 40 && entry.score < 70, low: entry.score < 40 }"></div></div>
              <span class="dim-score">{{ entry.score }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="result-summary"><p>{{ assessment.history[0]?.summary }}</p></div>

      <div class="result-actions">
        <button class="btn btn-primary" @click="handleGenerateRoadmap">🗺️ 生成学习路线图</button>
        <button class="btn btn-outline" @click="handleRestart">重新评估</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.assessment-view { padding: 32px; max-width: 900px; margin: 0 auto; }
.quiz-header { text-align: center; margin-bottom: 32px; }
.quiz-header h2 { font-size: 24px; font-weight: 700; color: var(--text-primary); margin: 0 0 8px 0; }
.quiz-subtitle { font-size: 14px; color: var(--text-secondary); margin: 0; }
.progress-bar-container { position: relative; height: 6px; background: var(--bg-tertiary); border-radius: 3px; margin-bottom: 32px; overflow: hidden; }
.progress-bar { height: 100%; background: var(--accent); border-radius: 3px; transition: width 0.3s ease; }
.progress-text { position: absolute; right: 0; top: 12px; font-size: 12px; color: var(--text-tertiary); }
.quiz-nav { display: flex; justify-content: space-between; margin-top: 16px; max-width: 720px; }

.feedback-bar { max-width: 720px; padding: 10px 16px; border-radius: 8px; font-size: 14px; font-weight: 600; margin-top: 12px; }
.feedback-bar.correct { background: rgba(34, 197, 94, 0.12); color: #4ade80; }
.feedback-bar.wrong { background: rgba(239, 68, 68, 0.12); color: #f87171; }

.result-header { text-align: center; margin-bottom: 32px; }
.result-header h2 { font-size: 24px; font-weight: 700; color: var(--text-primary); margin: 0; }
.result-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 24px; }
.radar-card, .score-card { background: var(--bg-card); border-radius: 12px; padding: 24px; }
.radar-card h3, .score-card h3 { font-size: 16px; font-weight: 600; color: var(--text-primary); margin: 0 0 16px 0; }
.overall-score { text-align: center; margin-bottom: 12px; }
.score-number { font-size: 48px; font-weight: 800; color: var(--accent); display: block; }
.score-label { font-size: 13px; color: var(--text-secondary); }
.level-badge { text-align: center; font-size: 16px; font-weight: 700; color: var(--accent); background: var(--accent-bg); padding: 6px 20px; border-radius: 20px; display: block; margin: 0 auto 24px; width: fit-content; }
.dimension-scores { display: flex; flex-direction: column; gap: 14px; }
.dimension-row { display: flex; align-items: center; gap: 12px; }
.dim-label { font-size: 13px; color: var(--text-secondary); width: 100px; flex-shrink: 0; }
.dim-bar-bg { flex: 1; height: 8px; background: var(--bg-tertiary); border-radius: 4px; overflow: hidden; }
.dim-bar { height: 100%; border-radius: 4px; transition: width 0.5s ease; }
.dim-bar.high { background: var(--success); }
.dim-bar.mid { background: var(--accent); }
.dim-bar.low { background: var(--danger); }
.dim-score { font-size: 13px; font-weight: 600; color: var(--text-primary); width: 32px; text-align: right; }
.result-summary { background: var(--bg-card); border-radius: 12px; padding: 20px 24px; margin-bottom: 24px; }
.result-summary p { font-size: 14px; color: var(--text-secondary); line-height: 1.8; margin: 0; }
.result-actions { display: flex; gap: 16px; justify-content: center; }
.btn { padding: 10px 24px; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; border: none; transition: all 0.2s ease; }
.btn:disabled { opacity: 0.4; cursor: not-allowed; }
.btn-primary { background: var(--accent); color: #fff; }
.btn-primary:hover:not(:disabled) { background: var(--accent-hover); }
.btn-outline { background: transparent; color: var(--text-secondary); border: 1px solid var(--border); }
.btn-outline:hover:not(:disabled) { border-color: var(--text-secondary); }
</style>
