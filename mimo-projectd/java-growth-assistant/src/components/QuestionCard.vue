<script setup lang="ts">
import type { Question } from '../types'

const props = defineProps<{
  question: Question
  selectedAnswer?: string
  showExplanation?: boolean
}>()

const emit = defineEmits<{
  select: [value: string]
}>()

const optionLetters = ['A', 'B', 'C', 'D']
</script>

<template>
  <div class="question-card">
    <div class="question-meta">
      <span class="difficulty-tag" :class="question.difficulty">
        {{ question.difficulty === 'basic' ? '基础' : question.difficulty === 'intermediate' ? '进阶' : '高级' }}
      </span>
    </div>
    <h3 class="question-title">{{ question.title }}</h3>
    <div class="options">
      <button
        v-for="(option, index) in question.options"
        :key="option.value"
        class="option-btn"
        :class="{
          selected: selectedAnswer === option.value,
          correct: showExplanation && option.value === question.answer,
          wrong: showExplanation && selectedAnswer === option.value && option.value !== question.answer,
        }"
        @click="emit('select', option.value)"
      >
        <span class="option-letter">{{ optionLetters[index] }}</span>
        <span class="option-label">{{ option.label }}</span>
        <span v-if="showExplanation && option.value === question.answer" class="option-icon">✓</span>
        <span v-else-if="showExplanation && selectedAnswer === option.value && option.value !== question.answer" class="option-icon wrong">✕</span>
      </button>
    </div>

    <!-- 解析 -->
    <div v-if="showExplanation" class="explanation">
      <div class="explanation-header">💡 解析</div>
      <p>{{ question.explanation }}</p>
    </div>
  </div>
</template>

<style scoped>
.question-card {
  background: var(--bg-card);
  border-radius: 12px;
  padding: 32px;
  max-width: 720px;
  width: 100%;
}

.question-meta {
  margin-bottom: 12px;
}

.difficulty-tag {
  font-size: 11px;
  padding: 2px 10px;
  border-radius: 4px;
  font-weight: 600;
}

.difficulty-tag.basic { background: rgba(34, 197, 94, 0.15); color: #4ade80; }
.difficulty-tag.intermediate { background: rgba(99, 102, 241, 0.15); color: #818cf8; }
.difficulty-tag.advanced { background: rgba(239, 68, 68, 0.15); color: #f87171; }

.question-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 24px 0;
  line-height: 1.6;
}

.options {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.option-btn {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 18px;
  background: var(--bg-secondary);
  border: 2px solid transparent;
  border-radius: 10px;
  cursor: pointer;
  text-align: left;
  transition: all 0.2s ease;
  color: var(--text-primary);
  font-size: 15px;
}

.option-btn:hover { border-color: var(--accent-dim); background: var(--bg-hover); }
.option-btn.selected { border-color: var(--accent); background: var(--accent-bg); }
.option-btn.correct { border-color: var(--success); background: rgba(34, 197, 94, 0.1); }
.option-btn.wrong { border-color: var(--danger); background: rgba(239, 68, 68, 0.1); }

.option-letter {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: 8px;
  background: var(--bg-tertiary);
  font-weight: 700;
  font-size: 13px;
  color: var(--text-secondary);
  flex-shrink: 0;
}

.option-btn.selected .option-letter { background: var(--accent); color: #fff; }
.option-btn.correct .option-letter { background: var(--success); color: #fff; }
.option-btn.wrong .option-letter { background: var(--danger); color: #fff; }

.option-label { flex: 1; line-height: 1.5; }

.option-icon { font-size: 16px; font-weight: 700; color: var(--success); }
.option-icon.wrong { color: var(--danger); }

.explanation {
  margin-top: 20px;
  padding: 16px 20px;
  background: rgba(99, 102, 241, 0.08);
  border-radius: 10px;
  border-left: 3px solid var(--accent);
}

.explanation-header {
  font-size: 14px;
  font-weight: 700;
  color: var(--accent);
  margin-bottom: 8px;
}

.explanation p {
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.7;
  margin: 0;
}
</style>
