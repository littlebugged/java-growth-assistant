import { defineStore } from 'pinia'
import { ref, toRaw } from 'vue'
import { roadmapTemplates } from '../data/roadmap-templates'
import type { Roadmap, RoadmapStage, AssessmentResult, SkillLevel, StageStatus } from '../types'
import { LEVEL_ORDER } from '../types'

export const useRoadmapStore = defineStore('roadmap', () => {
  const currentRoadmap = ref<(Roadmap & { stages: RoadmapStage[] }) | null>(null)
  const history = ref<Roadmap[]>([])

  function findTemplate(fromLevel: SkillLevel, toLevel: SkillLevel) {
    return roadmapTemplates.find((t) => t.fromLevel === fromLevel && t.toLevel === toLevel)
  }

  function getNextLevel(current: SkillLevel): SkillLevel {
    const idx = LEVEL_ORDER.indexOf(current)
    if (idx < LEVEL_ORDER.length - 1) return LEVEL_ORDER[idx + 1]
    return current
  }

  async function generateRoadmap(assessment: AssessmentResult): Promise<Roadmap & { stages: RoadmapStage[] }> {
    const fromLevel = assessment.level
    const toLevel = getNextLevel(fromLevel)
    const template = findTemplate(fromLevel, toLevel)

    if (!template) {
      throw new Error(`未找到从 ${fromLevel} 到 ${toLevel} 的路线图模板`)
    }

    const totalWeeks = Math.ceil(
      template.stages.reduce((sum, s) => sum + s.estimatedDays, 0) / 7
    )

    const roadmap: Roadmap & { stages: RoadmapStage[] } = {
      title: template.title,
      targetLevel: toLevel,
      estimatedWeeks: totalWeeks,
      status: 'active',
      assessmentId: assessment.id,
      stages: template.stages.map((s) => ({
        ...s,
        status: 'pending' as StageStatus,
      })),
    }

    // 保存到数据库
    try {
      const id = await window.api.saveRoadmap(toRaw(roadmap))
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

  return {
    currentRoadmap,
    history,
    generateRoadmap,
    loadActiveRoadmap,
    updateStageStatus,
    getCompletionPercentage,
  }
})
