import BetterSqlite3 from 'better-sqlite3'
import type { AssessmentResult, Roadmap, RoadmapStage, Note, UserProject, BlogPost, InterviewQuestion, Question } from '../types'

export class Database {
  private db: BetterSqlite3.Database

  constructor(dbPath: string) {
    this.db = new BetterSqlite3(dbPath)
    this.db.pragma('journal_mode = WAL')
    this.init()
  }

  private init() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS assessments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        created_at TEXT DEFAULT (datetime('now')),
        answers TEXT NOT NULL,
        scores TEXT NOT NULL,
        level TEXT NOT NULL,
        summary TEXT
      );

      CREATE TABLE IF NOT EXISTS roadmaps (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        assessment_id INTEGER REFERENCES assessments(id),
        created_at TEXT DEFAULT (datetime('now')),
        title TEXT NOT NULL,
        target_level TEXT NOT NULL,
        estimated_weeks INTEGER,
        status TEXT DEFAULT 'active'
      );

      CREATE TABLE IF NOT EXISTS roadmap_stages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        roadmap_id INTEGER REFERENCES roadmaps(id),
        stage_order INTEGER NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        topics TEXT NOT NULL,
        project_title TEXT,
        project_desc TEXT,
        estimated_days INTEGER,
        status TEXT DEFAULT 'pending',
        dimension TEXT DEFAULT '',
        dimension_score INTEGER DEFAULT 0,
        priority TEXT DEFAULT 'medium',
        resources TEXT DEFAULT '[]'
      );

      CREATE TABLE IF NOT EXISTS notes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now')),
        title TEXT NOT NULL,
        content TEXT NOT NULL DEFAULT '',
        dimension TEXT NOT NULL DEFAULT 'general',
        tags TEXT NOT NULL DEFAULT '[]'
      );

      CREATE TABLE IF NOT EXISTS user_projects (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        created_at TEXT DEFAULT (datetime('now')),
        template_id TEXT NOT NULL,
        title TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'not_started',
        current_step INTEGER NOT NULL DEFAULT 0,
        notes TEXT NOT NULL DEFAULT ''
      );

      CREATE TABLE IF NOT EXISTS blog_posts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now')),
        title TEXT NOT NULL,
        content TEXT NOT NULL DEFAULT '',
        dimension TEXT NOT NULL DEFAULT 'general',
        published INTEGER NOT NULL DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS interview_questions (
        id TEXT PRIMARY KEY,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now')),
        category TEXT NOT NULL,
        difficulty TEXT NOT NULL,
        question TEXT NOT NULL,
        answer TEXT NOT NULL,
        key_points TEXT NOT NULL DEFAULT '[]',
        follow_up TEXT NOT NULL DEFAULT '[]'
      );

      CREATE TABLE IF NOT EXISTS assessment_questions (
        id TEXT PRIMARY KEY,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now')),
        dimension TEXT NOT NULL,
        difficulty TEXT NOT NULL,
        title TEXT NOT NULL,
        options TEXT NOT NULL,
        answer TEXT NOT NULL,
        explanation TEXT NOT NULL
      );
    `)

    // 迁移：为旧数据库的 roadmap_stages 表添加新列
    this.migrateRoadmapStages()
  }

  private migrateRoadmapStages() {
    const columns = this.db.prepare("PRAGMA table_info(roadmap_stages)").all() as any[]
    const colNames = columns.map((c: any) => c.name)

    if (!colNames.includes('dimension')) {
      this.db.exec("ALTER TABLE roadmap_stages ADD COLUMN dimension TEXT DEFAULT ''")
    }
    if (!colNames.includes('dimension_score')) {
      this.db.exec("ALTER TABLE roadmap_stages ADD COLUMN dimension_score INTEGER DEFAULT 0")
    }
    if (!colNames.includes('priority')) {
      this.db.exec("ALTER TABLE roadmap_stages ADD COLUMN priority TEXT DEFAULT 'medium'")
    }
    if (!colNames.includes('resources')) {
      this.db.exec("ALTER TABLE roadmap_stages ADD COLUMN resources TEXT DEFAULT '[]'")
    }
  }

  // ==================== 评估 ====================

  saveAssessment(result: AssessmentResult): number {
    const stmt = this.db.prepare(
      'INSERT INTO assessments (answers, scores, level, summary) VALUES (?, ?, ?, ?)'
    )
    const info = stmt.run(
      JSON.stringify(result.answers),
      JSON.stringify(result.scores),
      result.level,
      result.summary
    )
    return info.lastInsertRowid as number
  }

  getAllAssessments(): AssessmentResult[] {
    const rows = this.db.prepare('SELECT * FROM assessments ORDER BY created_at DESC').all() as any[]
    return rows.map(this.mapAssessment)
  }

  getAssessmentById(id: number): AssessmentResult | null {
    const row = this.db.prepare('SELECT * FROM assessments WHERE id = ?').get(id) as any
    return row ? this.mapAssessment(row) : null
  }

  private mapAssessment(row: any): AssessmentResult {
    return {
      id: row.id,
      createdAt: row.created_at,
      answers: JSON.parse(row.answers),
      scores: JSON.parse(row.scores),
      level: row.level,
      summary: row.summary,
    }
  }

  // ==================== 路线图 ====================

  saveRoadmap(roadmap: Roadmap): number {
    const insertRoadmap = this.db.prepare(
      'INSERT INTO roadmaps (assessment_id, title, target_level, estimated_weeks, status) VALUES (?, ?, ?, ?, ?)'
    )
    const info = insertRoadmap.run(
      roadmap.assessmentId ?? null,
      roadmap.title,
      roadmap.targetLevel,
      roadmap.estimatedWeeks,
      roadmap.status
    )
    const roadmapId = info.lastInsertRowid as number

    const insertStage = this.db.prepare(
      'INSERT INTO roadmap_stages (roadmap_id, stage_order, title, description, topics, project_title, project_desc, estimated_days, status, dimension, dimension_score, priority, resources) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
    )
    for (const stage of roadmap.stages) {
      insertStage.run(
        roadmapId,
        stage.stageOrder,
        stage.title,
        stage.description,
        JSON.stringify(stage.topics),
        stage.projectTitle,
        stage.projectDesc,
        stage.estimatedDays,
        stage.status,
        stage.dimension ?? '',
        stage.dimensionScore ?? 0,
        stage.priority ?? 'medium',
        JSON.stringify(stage.resources ?? [])
      )
    }
    return roadmapId
  }

  getActiveRoadmap(): (Roadmap & { stages: RoadmapStage[] }) | null {
    const row = this.db.prepare(
      "SELECT * FROM roadmaps WHERE status = 'active' ORDER BY created_at DESC LIMIT 1"
    ).get() as any
    if (!row) return null
    return this.mapRoadmapWithStages(row)
  }

  getRoadmapById(id: number): (Roadmap & { stages: RoadmapStage[] }) | null {
    const row = this.db.prepare('SELECT * FROM roadmaps WHERE id = ?').get(id) as any
    if (!row) return null
    return this.mapRoadmapWithStages(row)
  }

  updateStageStatus(stageId: number, status: string): void {
    this.db.prepare('UPDATE roadmap_stages SET status = ? WHERE id = ?').run(status, stageId)
  }

  private mapRoadmapWithStages(row: any): Roadmap & { stages: RoadmapStage[] } {
    const stages = this.db
      .prepare('SELECT * FROM roadmap_stages WHERE roadmap_id = ? ORDER BY stage_order')
      .all(row.id) as any[]

    return {
      id: row.id,
      assessmentId: row.assessment_id,
      createdAt: row.created_at,
      title: row.title,
      targetLevel: row.target_level,
      estimatedWeeks: row.estimated_weeks,
      status: row.status,
      stages: stages.map((s) => ({
        id: s.id,
        roadmapId: s.roadmap_id,
        stageOrder: s.stage_order,
        title: s.title,
        description: s.description,
        topics: JSON.parse(s.topics),
        projectTitle: s.project_title,
        projectDesc: s.project_desc,
        estimatedDays: s.estimated_days,
        status: s.status,
        dimension: s.dimension ?? '',
        dimensionScore: s.dimension_score ?? 0,
        priority: s.priority ?? 'medium',
        resources: JSON.parse(s.resources ?? '[]'),
      })),
    }
  }

  // ==================== 笔记 ====================

  saveNote(note: Note): number {
    if (note.id) {
      this.db.prepare(
        "UPDATE notes SET title = ?, content = ?, dimension = ?, tags = ?, updated_at = datetime('now') WHERE id = ?"
      ).run(note.title, note.content, note.dimension, JSON.stringify(note.tags), note.id)
      return note.id
    }
    const info = this.db.prepare(
      'INSERT INTO notes (title, content, dimension, tags) VALUES (?, ?, ?, ?)'
    ).run(note.title, note.content, note.dimension, JSON.stringify(note.tags))
    return info.lastInsertRowid as number
  }

  getAllNotes(): Note[] {
    const rows = this.db.prepare('SELECT * FROM notes ORDER BY updated_at DESC').all() as any[]
    return rows.map(this.mapNote)
  }

  getNoteById(id: number): Note | null {
    const row = this.db.prepare('SELECT * FROM notes WHERE id = ?').get(id) as any
    return row ? this.mapNote(row) : null
  }

  deleteNote(id: number): void {
    this.db.prepare('DELETE FROM notes WHERE id = ?').run(id)
  }

  private mapNote(row: any): Note {
    return {
      id: row.id,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      title: row.title,
      content: row.content,
      dimension: row.dimension,
      tags: JSON.parse(row.tags),
    }
  }

  // ==================== 项目实战 ====================

  saveUserProject(project: UserProject): number {
    if (project.id) {
      this.db.prepare(
        'UPDATE user_projects SET status = ?, current_step = ?, notes = ? WHERE id = ?'
      ).run(project.status, project.currentStep, project.notes, project.id)
      return project.id
    }
    const info = this.db.prepare(
      'INSERT INTO user_projects (template_id, title, status, current_step, notes) VALUES (?, ?, ?, ?, ?)'
    ).run(project.templateId, project.title, project.status, project.currentStep, project.notes)
    return info.lastInsertRowid as number
  }

  getAllUserProjects(): UserProject[] {
    const rows = this.db.prepare('SELECT * FROM user_projects ORDER BY created_at DESC').all() as any[]
    return rows.map(this.mapUserProject)
  }

  getUserProjectById(id: number): UserProject | null {
    const row = this.db.prepare('SELECT * FROM user_projects WHERE id = ?').get(id) as any
    return row ? this.mapUserProject(row) : null
  }

  deleteUserProject(id: number): void {
    this.db.prepare('DELETE FROM user_projects WHERE id = ?').run(id)
  }

  private mapUserProject(row: any): UserProject {
    return {
      id: row.id,
      createdAt: row.created_at,
      templateId: row.template_id,
      title: row.title,
      status: row.status,
      currentStep: row.current_step,
      notes: row.notes,
    }
  }

  // ==================== 博客 ====================

  saveBlogPost(post: BlogPost): number {
    if (post.id) {
      this.db.prepare(
        "UPDATE blog_posts SET title = ?, content = ?, dimension = ?, published = ?, updated_at = datetime('now') WHERE id = ?"
      ).run(post.title, post.content, post.dimension, post.published ? 1 : 0, post.id)
      return post.id
    }
    const info = this.db.prepare(
      'INSERT INTO blog_posts (title, content, dimension, published) VALUES (?, ?, ?, ?)'
    ).run(post.title, post.content, post.dimension, post.published ? 1 : 0)
    return info.lastInsertRowid as number
  }

  getAllBlogPosts(): BlogPost[] {
    const rows = this.db.prepare('SELECT * FROM blog_posts ORDER BY updated_at DESC').all() as any[]
    return rows.map(this.mapBlogPost)
  }

  getBlogPostById(id: number): BlogPost | null {
    const row = this.db.prepare('SELECT * FROM blog_posts WHERE id = ?').get(id) as any
    return row ? this.mapBlogPost(row) : null
  }

  deleteBlogPost(id: number): void {
    this.db.prepare('DELETE FROM blog_posts WHERE id = ?').run(id)
  }

  private mapBlogPost(row: any): BlogPost {
    return {
      id: row.id,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      title: row.title,
      content: row.content,
      dimension: row.dimension,
      published: !!row.published,
    }
  }

  // ==================== 面试题 ====================

  saveInterviewQuestion(q: InterviewQuestion): string {
    const existing = this.db.prepare('SELECT id FROM interview_questions WHERE id = ?').get(q.id) as any
    if (existing) {
      this.db.prepare(
        "UPDATE interview_questions SET category = ?, difficulty = ?, question = ?, answer = ?, key_points = ?, follow_up = ?, updated_at = datetime('now') WHERE id = ?"
      ).run(q.category, q.difficulty, q.question, q.answer, JSON.stringify(q.keyPoints), JSON.stringify(q.followUp ?? []), q.id)
      return q.id
    }
    this.db.prepare(
      'INSERT INTO interview_questions (id, category, difficulty, question, answer, key_points, follow_up) VALUES (?, ?, ?, ?, ?, ?, ?)'
    ).run(q.id, q.category, q.difficulty, q.question, q.answer, JSON.stringify(q.keyPoints), JSON.stringify(q.followUp ?? []))
    return q.id
  }

  getAllInterviewQuestions(): InterviewQuestion[] {
    const rows = this.db.prepare('SELECT * FROM interview_questions ORDER BY category, difficulty').all() as any[]
    return rows.map(this.mapInterviewQuestion)
  }

  getInterviewQuestionsByCategory(category: string): InterviewQuestion[] {
    const rows = this.db.prepare('SELECT * FROM interview_questions WHERE category = ? ORDER BY difficulty').all(category) as any[]
    return rows.map(this.mapInterviewQuestion)
  }

  getInterviewQuestionById(id: string): InterviewQuestion | null {
    const row = this.db.prepare('SELECT * FROM interview_questions WHERE id = ?').get(id) as any
    return row ? this.mapInterviewQuestion(row) : null
  }

  deleteInterviewQuestion(id: string): void {
    this.db.prepare('DELETE FROM interview_questions WHERE id = ?').run(id)
  }

  searchInterviewQuestions(keyword: string): InterviewQuestion[] {
    const like = `%${keyword}%`
    const rows = this.db.prepare(
      'SELECT * FROM interview_questions WHERE question LIKE ? OR answer LIKE ? ORDER BY category, difficulty'
    ).all(like, like) as any[]
    return rows.map(this.mapInterviewQuestion)
  }

  getInterviewQuestionCount(): number {
    const row = this.db.prepare('SELECT COUNT(*) as count FROM interview_questions').get() as any
    return row.count
  }

  private mapInterviewQuestion(row: any): InterviewQuestion {
    return {
      id: row.id,
      category: row.category,
      difficulty: row.difficulty,
      question: row.question,
      answer: row.answer,
      keyPoints: JSON.parse(row.key_points),
      followUp: JSON.parse(row.follow_up),
    }
  }

  // ==================== 评估题 ====================

  saveAssessmentQuestion(q: Question): string {
    const existing = this.db.prepare('SELECT id FROM assessment_questions WHERE id = ?').get(q.id) as any
    if (existing) {
      this.db.prepare(
        "UPDATE assessment_questions SET dimension = ?, difficulty = ?, title = ?, options = ?, answer = ?, explanation = ?, updated_at = datetime('now') WHERE id = ?"
      ).run(q.dimension, q.difficulty, q.title, JSON.stringify(q.options), q.answer, q.explanation, q.id)
      return q.id
    }
    this.db.prepare(
      'INSERT INTO assessment_questions (id, dimension, difficulty, title, options, answer, explanation) VALUES (?, ?, ?, ?, ?, ?, ?)'
    ).run(q.id, q.dimension, q.difficulty, q.title, JSON.stringify(q.options), q.answer, q.explanation)
    return q.id
  }

  getAllAssessmentQuestions(): Question[] {
    const rows = this.db.prepare('SELECT * FROM assessment_questions ORDER BY dimension, difficulty').all() as any[]
    return rows.map(this.mapAssessmentQuestion)
  }

  getAssessmentQuestionsByDimension(dimension: string): Question[] {
    const rows = this.db.prepare('SELECT * FROM assessment_questions WHERE dimension = ? ORDER BY difficulty').all(dimension) as any[]
    return rows.map(this.mapAssessmentQuestion)
  }

  getAssessmentQuestionById(id: string): Question | null {
    const row = this.db.prepare('SELECT * FROM assessment_questions WHERE id = ?').get(id) as any
    return row ? this.mapAssessmentQuestion(row) : null
  }

  deleteAssessmentQuestion(id: string): void {
    this.db.prepare('DELETE FROM assessment_questions WHERE id = ?').run(id)
  }

  searchAssessmentQuestions(keyword: string): Question[] {
    const like = `%${keyword}%`
    const rows = this.db.prepare(
      'SELECT * FROM assessment_questions WHERE title LIKE ? OR explanation LIKE ? ORDER BY dimension, difficulty'
    ).all(like, like) as any[]
    return rows.map(this.mapAssessmentQuestion)
  }

  getAssessmentQuestionCount(): number {
    const row = this.db.prepare('SELECT COUNT(*) as count FROM assessment_questions').get() as any
    return row.count
  }

  /** 从每个维度随机抽取指定数量的题目 */
  sampleAssessmentQuestions(countPerDimension: number): Question[] {
    const dimensions = ['javaBasics', 'jvm', 'concurrency', 'spring', 'database', 'architecture']
    const result: Question[] = []
    for (const dim of dimensions) {
      const rows = this.db.prepare(
        'SELECT * FROM assessment_questions WHERE dimension = ? ORDER BY RANDOM() LIMIT ?'
      ).all(dim, countPerDimension) as any[]
      result.push(...rows.map(this.mapAssessmentQuestion))
    }
    // 最终打乱
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[result[i], result[j]] = [result[j], result[i]]
    }
    return result
  }

  private mapAssessmentQuestion(row: any): Question {
    return {
      id: row.id,
      dimension: row.dimension,
      difficulty: row.difficulty,
      title: row.title,
      options: JSON.parse(row.options),
      answer: row.answer,
      explanation: row.explanation,
    }
  }
}
