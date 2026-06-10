import { contextBridge, ipcRenderer } from 'electron'

const api = {
  // 评估
  saveAssessment: (result: any) => ipcRenderer.invoke('assessment:save', result),
  getAllAssessments: () => ipcRenderer.invoke('assessment:getAll'),
  getAssessmentById: (id: number) => ipcRenderer.invoke('assessment:getById', id),

  // 路线图
  saveRoadmap: (roadmap: any) => ipcRenderer.invoke('roadmap:save', roadmap),
  getActiveRoadmap: () => ipcRenderer.invoke('roadmap:getActive'),
  getRoadmapById: (id: number) => ipcRenderer.invoke('roadmap:getById', id),
  updateStageStatus: (stageId: number, status: string) =>
    ipcRenderer.invoke('roadmap:updateStageStatus', stageId, status),

  // 笔记
  saveNote: (note: any) => ipcRenderer.invoke('note:save', note),
  getAllNotes: () => ipcRenderer.invoke('note:getAll'),
  getNoteById: (id: number) => ipcRenderer.invoke('note:getById', id),
  deleteNote: (id: number) => ipcRenderer.invoke('note:delete', id),

  // 项目
  saveUserProject: (project: any) => ipcRenderer.invoke('project:save', project),
  getAllUserProjects: () => ipcRenderer.invoke('project:getAll'),
  getUserProjectById: (id: number) => ipcRenderer.invoke('project:getById', id),
  deleteUserProject: (id: number) => ipcRenderer.invoke('project:delete', id),

  // 博客
  saveBlogPost: (post: any) => ipcRenderer.invoke('blog:save', post),
  getAllBlogPosts: () => ipcRenderer.invoke('blog:getAll'),
  getBlogPostById: (id: number) => ipcRenderer.invoke('blog:getById', id),
  deleteBlogPost: (id: number) => ipcRenderer.invoke('blog:delete', id),

  // 面试题
  getAllInterviewQuestions: () => ipcRenderer.invoke('interview:getAll'),
  getInterviewQuestionsByCategory: (category: string) => ipcRenderer.invoke('interview:getByCategory', category),
  getInterviewQuestionById: (id: string) => ipcRenderer.invoke('interview:getById', id),
  saveInterviewQuestion: (q: any) => ipcRenderer.invoke('interview:save', q),
  deleteInterviewQuestion: (id: string) => ipcRenderer.invoke('interview:delete', id),
  searchInterviewQuestions: (keyword: string) => ipcRenderer.invoke('interview:search', keyword),
  getInterviewQuestionCount: () => ipcRenderer.invoke('interview:getCount'),

  // 评估题
  getAllAssessmentQuestions: () => ipcRenderer.invoke('assessmentQuestion:getAll'),
  getAssessmentQuestionsByDimension: (dim: string) => ipcRenderer.invoke('assessmentQuestion:getByDimension', dim),
  getAssessmentQuestionById: (id: string) => ipcRenderer.invoke('assessmentQuestion:getById', id),
  saveAssessmentQuestion: (q: any) => ipcRenderer.invoke('assessmentQuestion:save', q),
  deleteAssessmentQuestion: (id: string) => ipcRenderer.invoke('assessmentQuestion:delete', id),
  searchAssessmentQuestions: (keyword: string) => ipcRenderer.invoke('assessmentQuestion:search', keyword),
  getAssessmentQuestionCount: () => ipcRenderer.invoke('assessmentQuestion:getCount'),
  sampleAssessmentQuestions: (countPerDim: number) => ipcRenderer.invoke('assessmentQuestion:sample', countPerDim),
}

export type ElectronAPI = typeof api

contextBridge.exposeInMainWorld('api', api)
