import { defineStore } from 'pinia'
import { ref } from 'vue'
import { dimensionStageTemplates } from '../data/roadmap-templates'
import type { Roadmap, RoadmapStage, AssessmentResult, SkillLevel, SkillDimension, StageStatus, StagePriority, DimensionStageTemplate } from '../types'
import { LEVEL_ORDER, DIMENSION_LABELS } from '../types'

export const useRoadmapStore = defineStore('roadmap', () => {
  const currentRoadmap = ref<(Roadmap & { stages: RoadmapStage[] }) | null>(null)
  const history = ref<Roadmap[]>([])

  /** 根据百分制分数定等级 */
  function scoreToLevel(score: number): SkillLevel {
    if (score >= 85) return 'expert'
    if (score >= 65) return 'senior'
    if (score >= 40) return 'intermediate'
    return 'junior'
  }

  function getNextLevel(current: SkillLevel): SkillLevel {
    const idx = LEVEL_ORDER.indexOf(current)
    if (idx < LEVEL_ORDER.length - 1) return LEVEL_ORDER[idx + 1]
    return current
  }

  function findDimensionTemplate(dim: SkillDimension, fromLevel: SkillLevel, toLevel: SkillLevel): DimensionStageTemplate | undefined {
    return dimensionStageTemplates.find(
      (t) => t.dimension === dim && t.fromLevel === fromLevel && t.toLevel === toLevel
    )
  }

  function getPriority(score: number): StagePriority {
    if (score < 40) return 'high'
    if (score < 65) return 'medium'
    return 'low'
  }

  async function generateRoadmap(assessment: AssessmentResult): Promise<Roadmap & { stages: RoadmapStage[] }> {
    const dims: SkillDimension[] = ['javaBasics', 'jvm', 'concurrency', 'spring', 'database', 'architecture']
    const stages: RoadmapStage[] = []

    for (const dim of dims) {
      const score = assessment.scores[dim] ?? 0
      const dimLevel = scoreToLevel(score)

      // 已是专家，跳过
      if (dimLevel === 'expert') continue

      const nextLevel = getNextLevel(dimLevel)
      const template = findDimensionTemplate(dim, dimLevel, nextLevel)
      if (!template) continue

      // 强项（>=80）天数减半
      const isStrong = score >= 80
      const adjustedDays = isStrong ? Math.ceil(template.estimatedDays / 2) : template.estimatedDays

      stages.push({
        stageOrder: 0, // 后面排序
        title: template.title,
        description: template.description,
        topics: template.topics,
        projectTitle: template.projectTitle,
        projectDesc: template.projectDesc,
        estimatedDays: adjustedDays,
        status: 'pending' as StageStatus,
        dimension: dim,
        dimensionScore: score,
        priority: getPriority(score),
        resources: template.resources ?? [],
      })
    }

    // 按分数升序排序（弱项优先）
    stages.sort((a, b) => a.dimensionScore - b.dimensionScore)
    stages.forEach((s, i) => { s.stageOrder = i + 1 })

    // 确定整体目标等级
    const overallLevel = assessment.level
    const targetLevel = getNextLevel(overallLevel)
    const totalWeeks = Math.ceil(stages.reduce((sum, s) => sum + s.estimatedDays, 0) / 7)

    const roadmap: Roadmap & { stages: RoadmapStage[] } = {
      title: `个性化进阶路线（${overallLevel} → ${targetLevel}）`,
      targetLevel,
      estimatedWeeks: totalWeeks,
      status: 'active',
      assessmentId: assessment.id,
      stages,
    }

    // 保存到数据库
    try {
      const id = await window.api.saveRoadmap(JSON.parse(JSON.stringify(roadmap)))
      roadmap.id = id
    } catch (e) {
      console.error('保存路线图失败:', e)
    }

    currentRoadmap.value = roadmap
    return roadmap
  }

  async function loadActiveRoadmap() {
    try {
      const roadmap = await window.api.getActiveRoadmap()
      if (roadmap) {
        currentRoadmap.value = roadmap
      }
    } catch (e) {
      console.error('加载路线图失败:', e)
    }
  }

  async function updateStageStatus(stageId: number, status: StageStatus) {
    if (!currentRoadmap.value) return
    const stage = currentRoadmap.value.stages.find((s) => s.id === stageId)
    if (stage) {
      stage.status = status
      try {
        await window.api.updateStageStatus(stageId, status)
      } catch (e) {
        console.error('更新阶段状态失败:', e)
      }
    }
  }

  function getCompletionPercentage(): number {
    if (!currentRoadmap.value || currentRoadmap.value.stages.length === 0) return 0
    const completed = currentRoadmap.value.stages.filter((s) => s.status === 'completed').length
    return Math.round((completed / currentRoadmap.value.stages.length) * 100)
  }

  /** 获取弱项维度（分数最低的前 N 个） */
  function getWeakDimensions(n: number = 2): { dimension: SkillDimension; score: number }[] {
    if (!currentRoadmap.value) return []
    const dims = currentRoadmap.value.stages.map((s) => ({
      dimension: s.dimension,
      score: s.dimensionScore,
    }))
    return dims.slice(0, n)
  }

  /** 获取强项维度（分数最高的） */
  function getStrongDimensions(): { dimension: SkillDimension; score: number }[] {
    if (!currentRoadmap.value) return []
    const dims = currentRoadmap.value.stages.map((s) => ({
      dimension: s.dimension,
      score: s.dimensionScore,
    }))
    return dims.filter((d) => d.score >= 80)
  }

  return {
    currentRoadmap,
    history,
    generateRoadmap,
    loadActiveRoadmap,
    updateStageStatus,
    getCompletionPercentage,
    getWeakDimensions,
    getStrongDimensions,
    scoreToLevel,
  }
})
