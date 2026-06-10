// ==================== 技能评估 ====================

/** 技能维度 */
export type SkillDimension =
  | 'javaBasics'
  | 'jvm'
  | 'concurrency'
  | 'spring'
  | 'database'
  | 'architecture'

/** 技能等级 */
export type SkillLevel = 'junior' | 'intermediate' | 'senior' | 'expert'

/** 评估题目选项 */
export interface QuestionOption {
  label: string
  value: string
  score: number // 1-4
}

/** 评估题目 */
export interface Question {
  id: string
  dimension: SkillDimension
  title: string
  options: QuestionOption[]
  answer: string          // 正确答案的 value
  explanation: string     // 解析
  difficulty: 'basic' | 'intermediate' | 'advanced'
}

/** 用户答案 */
export type UserAnswers = Record<string, string> // questionId -> optionValue

/** 各维度得分 */
export type DimensionScores = Record<SkillDimension, number>

/** 评估结果 */
export interface AssessmentResult {
  id?: number
  createdAt?: string
  answers: UserAnswers
  scores: DimensionScores
  level: SkillLevel
  summary: string
}

// ==================== 路线图 ====================

/** 路线图阶段状态 */
export type StageStatus = 'pending' | 'in_progress' | 'completed'

/** 路线图状态 */
export type RoadmapStatus = 'active' | 'completed' | 'archived'

/** 路线图阶段 */
export interface RoadmapStage {
  id?: number
  roadmapId?: number
  stageOrder: number
  title: string
  description: string
  topics: string[]
  projectTitle: string
  projectDesc: string
  estimatedDays: number
  status: StageStatus
}

/** 路线图 */
export interface Roadmap {
  id?: number
  assessmentId?: number
  createdAt?: string
  title: string
  targetLevel: SkillLevel
  estimatedWeeks: number
  status: RoadmapStatus
  stages: RoadmapStage[]
}

/** 路线图模板 */
export interface RoadmapTemplate {
  id: string
  fromLevel: SkillLevel
  toLevel: SkillLevel
  title: string
  description: string
  stages: Omit<RoadmapStage, 'id' | 'roadmapId' | 'status'>[]
}

// ==================== 维度名称映射 ====================

export const DIMENSION_LABELS: Record<SkillDimension, string> = {
  javaBasics: 'Java 基础',
  jvm: 'JVM',
  concurrency: '并发编程',
  spring: 'Spring 生态',
  database: '数据库 & 中间件',
  architecture: '架构 & 设计',
}

export const LEVEL_LABELS: Record<SkillLevel, string> = {
  junior: '初级',
  intermediate: '中级',
  senior: '高级',
  expert: '专家',
}

export const LEVEL_ORDER: SkillLevel[] = ['junior', 'intermediate', 'senior', 'expert']

// ==================== 笔记 ====================

export interface Note {
  id?: number
  createdAt?: string
  updatedAt?: string
  title: string
  content: string
  dimension: SkillDimension | 'general'
  tags: string[]
}

// ==================== 项目实战 ====================

export type ProjectDifficulty = 'easy' | 'medium' | 'hard' | 'expert'

export interface ProjectStep {
  order: number
  title: string
  description: string
  hints: string[]
  codeExample?: string
}

export interface ProjectTemplate {
  id: string
  title: string
  description: string
  difficulty: ProjectDifficulty
  dimension: SkillDimension
  techStack: string[]
  learningGoals: string[]
  steps: ProjectStep[]
  codeExample?: string
  resources: { title: string; url: string }[]
}

export interface UserProject {
  id?: number
  createdAt?: string
  templateId: string
  title: string
  status: 'not_started' | 'in_progress' | 'completed'
  currentStep: number
  notes: string
}

// ==================== 博客 ====================

export interface BlogPost {
  id?: number
  createdAt?: string
  updatedAt?: string
  title: string
  content: string
  dimension: SkillDimension | 'general'
  published: boolean
}

// ==================== 面试宝典 ====================

export type InterviewCategory =
  | 'java'
  | 'jvm'
  | 'concurrency'
  | 'spring'
  | 'mysql'
  | 'redis'
  | 'distributed'
  | 'systemDesign'
  | 'network'
  | 'devops'
  | 'algorithm'
  | 'project'
  | 'behavioral'

export interface InterviewQuestion {
  id: string
  category: InterviewCategory
  difficulty: 'junior' | 'mid' | 'senior'
  question: string
  answer: string
  keyPoints: string[]
  followUp?: string[]
}

export const INTERVIEW_CATEGORY_LABELS: Record<InterviewCategory, string> = {
  java: 'Java 基础',
  jvm: 'JVM',
  concurrency: '并发编程',
  spring: 'Spring',
  mysql: 'MySQL',
  redis: 'Redis',
  distributed: '分布式',
  systemDesign: '系统设计',
  network: '网络',
  devops: 'Linux / DevOps',
  algorithm: '数据结构与算法',
  project: '项目经验',
  behavioral: '软技能',
}

// ==================== 标签映射 ====================

export const DIFFICULTY_LABELS: Record<ProjectDifficulty, string> = {
  easy: '入门',
  medium: '进阶',
  hard: '高级',
  expert: '专家',
}

export const DIFFICULTY_COLORS: Record<ProjectDifficulty, string> = {
  easy: '#22c55e',
  medium: '#6366f1',
  hard: '#f59e0b',
  expert: '#ef4444',
}
