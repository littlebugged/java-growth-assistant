import { app, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { Database } from '../src/db/database'
import { allInterviewQuestions } from '../src/data/interview-questions'
import { allQuestionsByDimension } from '../src/data/questions'

let mainWindow: BrowserWindow | null = null
let db: Database | null = null

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    titleBarStyle: 'hiddenInset',
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: join(__dirname, '../preload/preload.js'),
    },
  })

  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL)
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

function initDatabase() {
  const dbPath = join(app.getPath('userData'), 'java-growth.db')
  db = new Database(dbPath)
}

/** 首次启动时将代码中的题写入数据库 */
function seedQuestions() {
  // 面试题
  const interviewCount = db!.getInterviewQuestionCount()
  if (interviewCount === 0) {
    const all = Object.values(allInterviewQuestions).flat()
    for (const q of all) {
      db!.saveInterviewQuestion(q)
    }
    console.log(`Seeded ${all.length} interview questions`)
  }

  // 评估题
  const assessmentCount = db!.getAssessmentQuestionCount()
  if (assessmentCount === 0) {
    const all = Object.values(allQuestionsByDimension).flat()
    for (const q of all) {
      db!.saveAssessmentQuestion(q)
    }
    console.log(`Seeded ${all.length} assessment questions`)
  }
}

function registerIpcHandlers() {
  // 评估
  ipcMain.handle('assessment:save', (_, result) => db!.saveAssessment(result))
  ipcMain.handle('assessment:getAll', () => db!.getAllAssessments())
  ipcMain.handle('assessment:getById', (_, id: number) => db!.getAssessmentById(id))

  // 路线图
  ipcMain.handle('roadmap:save', (_, roadmap) => db!.saveRoadmap(roadmap))
  ipcMain.handle('roadmap:getActive', () => db!.getActiveRoadmap())
  ipcMain.handle('roadmap:getById', (_, id: number) => db!.getRoadmapById(id))
  ipcMain.handle('roadmap:updateStageStatus', (_, stageId: number, status: string) =>
    db!.updateStageStatus(stageId, status)
  )

  // 笔记
  ipcMain.handle('note:save', (_, note) => db!.saveNote(note))
  ipcMain.handle('note:getAll', () => db!.getAllNotes())
  ipcMain.handle('note:getById', (_, id: number) => db!.getNoteById(id))
  ipcMain.handle('note:delete', (_, id: number) => db!.deleteNote(id))

  // 项目
  ipcMain.handle('project:save', (_, project) => db!.saveUserProject(project))
  ipcMain.handle('project:getAll', () => db!.getAllUserProjects())
  ipcMain.handle('project:getById', (_, id: number) => db!.getUserProjectById(id))
  ipcMain.handle('project:delete', (_, id: number) => db!.deleteUserProject(id))

  // 博客
  ipcMain.handle('blog:save', (_, post) => db!.saveBlogPost(post))
  ipcMain.handle('blog:getAll', () => db!.getAllBlogPosts())
  ipcMain.handle('blog:getById', (_, id: number) => db!.getBlogPostById(id))
  ipcMain.handle('blog:delete', (_, id: number) => db!.deleteBlogPost(id))

  // 面试题
  ipcMain.handle('interview:getAll', () => db!.getAllInterviewQuestions())
  ipcMain.handle('interview:getByCategory', (_, category: string) => db!.getInterviewQuestionsByCategory(category))
  ipcMain.handle('interview:getById', (_, id: string) => db!.getInterviewQuestionById(id))
  ipcMain.handle('interview:save', (_, q) => db!.saveInterviewQuestion(q))
  ipcMain.handle('interview:delete', (_, id: string) => db!.deleteInterviewQuestion(id))
  ipcMain.handle('interview:search', (_, keyword: string) => db!.searchInterviewQuestions(keyword))
  ipcMain.handle('interview:getCount', () => db!.getInterviewQuestionCount())

  // 评估题
  ipcMain.handle('assessmentQuestion:getAll', () => db!.getAllAssessmentQuestions())
  ipcMain.handle('assessmentQuestion:getByDimension', (_, dim: string) => db!.getAssessmentQuestionsByDimension(dim))
  ipcMain.handle('assessmentQuestion:getById', (_, id: string) => db!.getAssessmentQuestionById(id))
  ipcMain.handle('assessmentQuestion:save', (_, q) => db!.saveAssessmentQuestion(q))
  ipcMain.handle('assessmentQuestion:delete', (_, id: string) => db!.deleteAssessmentQuestion(id))
  ipcMain.handle('assessmentQuestion:search', (_, keyword: string) => db!.searchAssessmentQuestions(keyword))
  ipcMain.handle('assessmentQuestion:getCount', () => db!.getAssessmentQuestionCount())
  ipcMain.handle('assessmentQuestion:sample', (_, countPerDim: number) => db!.sampleAssessmentQuestions(countPerDim))
}

app.whenReady().then(() => {
  initDatabase()
  seedQuestions()
  registerIpcHandlers()
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
