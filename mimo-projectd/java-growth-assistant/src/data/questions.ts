import type { Question } from '../types'
import { javaBasicsQuestions } from './questions/java-basics'
import { jvmQuestions } from './questions/jvm'
import { concurrencyQuestions } from './questions/concurrency'
import { springQuestions } from './questions/spring'
import { databaseQuestions } from './questions/database'
import { architectureQuestions } from './questions/architecture'

/** 全部题库，按维度分组 */
export const allQuestionsByDimension: Record<string, Question[]> = {
  javaBasics: javaBasicsQuestions,
  jvm: jvmQuestions,
  concurrency: concurrencyQuestions,
  spring: springQuestions,
  database: databaseQuestions,
  architecture: architectureQuestions,
}

/** 每个维度抽取的题目数量 */
export const QUESTIONS_PER_DIMENSION = 5

/**
 * 从每个维度随机抽取指定数量的题目
 * Fisher-Yates 洗牌算法保证均匀随机
 */
export function sampleQuestions(questions: Question[], count: number): Question[] {
  const shuffled = [...questions]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled.slice(0, count)
}

/**
 * 生成一次评估的随机题库
 * 从每个维度随机抽取 QUESTIONS_PER_DIMENSION 道题
 */
export function generateAssessmentQuestions(): Question[] {
  const result: Question[] = []
  for (const [, questions] of Object.entries(allQuestionsByDimension)) {
    result.push(...sampleQuestions(questions, QUESTIONS_PER_DIMENSION))
  }
  // 最终再打乱一次顺序，避免按维度顺序出题
  return sampleQuestions(result, result.length)
}
