import { defineStore } from 'pinia'
import { ref, computed, toRaw } from 'vue'
import type { UserProject, ProjectTemplate } from '../types'
import { projectTemplates } from '../data/project-templates'

export const useProjectsStore = defineStore('projects', () => {
  const userProjects = ref<UserProject[]>([])
  const templates = ref<ProjectTemplate[]>(projectTemplates)
  const selectedTemplate = ref<ProjectTemplate | null>(null)

  const templatesByDimension = computed(() => {
    const map: Record<string, ProjectTemplate[]> = {}
    for (const t of templates.value) {
      if (!map[t.dimension]) map[t.dimension] = []
      map[t.dimension].push(t)
    }
    return map
  })

  async function loadAll() {
    userProjects.value = await window.api.getAllUserProjects()
  }

  async function startProject(template: ProjectTemplate): Promise<number> {
    const project: UserProject = {
      templateId: template.id,
      title: template.title,
      status: 'in_progress',
      currentStep: 0,
      notes: '',
    }
    const id = await window.api.saveUserProject(project)
    await loadAll()
    return id
  }

  async function updateProject(project: UserProject) {
    await window.api.saveUserProject(toRaw(project))
    await loadAll()
  }

  async function removeProject(id: number) {
    await window.api.deleteUserProject(id)
    await loadAll()
  }

  function getTemplate(templateId: string): ProjectTemplate | undefined {
    return templates.value.find((t) => t.id === templateId)
  }

  function getUserProject(templateId: string): UserProject | undefined {
    return userProjects.value.find((p) => p.templateId === templateId)
  }

  return {
    userProjects,
    templates,
    selectedTemplate,
    templatesByDimension,
    loadAll,
    startProject,
    updateProject,
    removeProject,
    getTemplate,
    getUserProject,
  }
})
