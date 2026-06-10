import type { InterviewQuestion, InterviewCategory } from '../types'
import { javaQuestions } from './interview/java'
import { jvmQuestions } from './interview/jvm'
import { concurrencyQuestions } from './interview/concurrency'
import { springQuestions } from './interview/spring'
import { mysqlQuestions } from './interview/mysql'
import { redisQuestions } from './interview/redis'
import { distributedQuestions } from './interview/distributed'
import { systemDesignQuestions } from './interview/system-design'
import { networkQuestions } from './interview/network'
import { devopsQuestions } from './interview/devops'
import { algorithmQuestions } from './interview/algorithm'
import { projectQuestions } from './interview/project'
import { behavioralQuestions } from './interview/behavioral'

export const allInterviewQuestions: Record<InterviewCategory, InterviewQuestion[]> = {
  java: javaQuestions,
  jvm: jvmQuestions,
  concurrency: concurrencyQuestions,
  spring: springQuestions,
  mysql: mysqlQuestions,
  redis: redisQuestions,
  distributed: distributedQuestions,
  systemDesign: systemDesignQuestions,
  network: networkQuestions,
  devops: devopsQuestions,
  algorithm: algorithmQuestions,
  project: projectQuestions,
  behavioral: behavioralQuestions,
}

export function getInterviewQuestionsByCategory(category: InterviewCategory): InterviewQuestion[] {
  return allInterviewQuestions[category] ?? []
}

export function getAllInterviewQuestionsFlat(): InterviewQuestion[] {
  return Object.values(allInterviewQuestions).flat()
}

export function searchInterviewQuestions(keyword: string): InterviewQuestion[] {
  const lower = keyword.toLowerCase()
  return getAllInterviewQuestionsFlat().filter(
    (q) => q.question.toLowerCase().includes(lower) || q.answer.toLowerCase().includes(lower)
  )
}
