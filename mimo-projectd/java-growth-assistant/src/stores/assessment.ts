import { defineStore } from 'pinia'
import { ref, computed, toRaw } from 'vue'
import type {
  Question,
  UserAnswers,
  DimensionScores,
  AssessmentResult,
  SkillDimension,
  SkillLevel,
} from '../types'

export const useAssessmentStore = defineStore('assessment', () => {
  const currentQuestions = ref<Question[]>([])
  const currentIndex = ref(0)
  const answers = ref<UserAnswers>({})
  const isCompleted = ref(false)
  const history = ref<AssessmentResult[]>([])

  const currentQuestion = computed<Question | null>(() => currentQuestions.value[currentIndex.value] ?? null)
  const totalQuestions = computed(() => currentQuestions.value.length)
  const progress = computed(() => ((currentIndex.value) / totalQuestions.value) * 100)
  const answeredCount = computed(() => Object.keys(answers.value).length)

  const scores = computed<DimensionScores>(() => {
    const dims: SkillDimension[] = [
      'javaBasics', 'jvm', 'concurrency', 'spring', 'database', 'architecture',
    ]
    const result = {} as DimensionScores
    for (const dim of dims) {
      const dimQuestions = currentQuestions.value.filter((q) => q.dimension === dim)
      let total = 0
      let count = 0
      for (const q of dimQuestions) {
        const answer = answers.value[q.id]
        if (answer) {
          const option = q.options.find((o) => o.value === answer)
          if (option) {
            total += option.score
            count++
          }
        }
      }
      result[dim] = count > 0 ? Math.round((total / (count * 4)) * 100) : 0
    }
    return result
  })

  const overallScore = computed(() => {
    const values = Object.values(scores.value)
    return Math.round(values.reduce((a, b) => a + b, 0) / values.length)
  })

  const level = computed<SkillLevel>(() => {
    const s = overallScore.value
    if (s >= 85) return 'expert'
    if (s >= 65) return 'senior'
    if (s >= 40) return 'intermediate'
    return 'junior'
  })

  /** 从数据库随机抽题 */
  async function loadQuestions() {
    try {
      currentQuestions.value = await window.api.sampleAssessmentQuestions(5)
    } catch (e) {
      console.error('加载评估题失败:', e)
      currentQuestions.value = []
    }
  }

  function selectAnswer(questionId: string, optionValue: string) {
    answers.value[questionId] = optionValue
  }

  function nextQuestion() {
    if (currentIndex.value < totalQuestions.value - 1) {
      currentIndex.value++
    }
  }

  function prevQuestion() {
    if (currentIndex.value > 0) {
      currentIndex.value--
    }
  }

  function goToQuestion(index: number) {
    if (index >= 0 && index < totalQuestions.value) {
      currentIndex.value = index
    }
  }

  function generateSummary(): string {
    const s = scores.value
    const strong = Object.entries(s)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 2)
      .map(([dim]) => dim)
    const weak = Object.entries(s)
      .sort(([, a], [, b]) => a - b)
      .slice(0, 2)
      .map(([dim]) => dim)

    const dimLabels: Record<SkillDimension, string> = {
      javaBasics: 'Java 基础',
      jvm: 'JVM',
      concurrency: '并发编程',
      spring: 'Spring 生态',
      database: '数据库 & 中间件',
      architecture: '架构 & 设计',
    }

    return `你的 Java 综合能力评分为 ${overallScore.value} 分，等级为「${level.value === 'junior' ? '初级' : level.value === 'intermediate' ? '中级' : level.value === 'senior' ? '高级' : '专家'}」。` +
      `优势领域：${strong.map((d) => dimLabels[d as SkillDimension]).join('、')}。` +
      `待提升领域：${weak.map((d) => dimLabels[d as SkillDimension]).join('、')}。`
  }

  async function completeAssessment(): Promise<AssessmentResult> {
    isCompleted.value = true
    const result: AssessmentResult = {
      answers: { ...answers.value },
      scores: { ...scores.value },
      level: level.value,
      summary: generateSummary(),
    }

    try {
      const id = await window.api.saveAssessment(toRaw(result))
      result.id = id
    } catch (e) {
      console.error('保存评估结果失败:', e)
    }

    return result
  }

  async function loadHistory() {
    try {
      history.value = await window.api.getAllAssessments()
    } catch (e) {
      console.error('加载历史记录失败:', e)
    }
  }

  /** 重置评估，重新从数据库随机抽题 */
  async function reset() {
    currentIndex.value = 0
    answers.value = {}
    isCompleted.value = false
    await loadQuestions()
  }

  return {
    currentIndex,
    answers,
    isCompleted,
    history,
    currentQuestions,
    currentQuestion,
    totalQuestions,
    progress,
    answeredCount,
    scores,
    overallScore,
    level,
    loadQuestions,
    selectAnswer,
    nextQuestion,
    prevQuestion,
    goToQuestion,
    completeAssessment,
    loadHistory,
    reset,
  }
})
