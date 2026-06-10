import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { InterviewQuestion, InterviewCategory } from '../types'
import { INTERVIEW_CATEGORY_LABELS } from '../types'

export const useInterviewStore = defineStore('interview', () => {
  const allQuestions = ref<InterviewQuestion[]>([])
  const currentCategory = ref<InterviewCategory | 'all'>('all')
  const searchQuery = ref('')
  const expandedId = ref<string | null>(null)
  const bookmarkedIds = ref<Set<string>>(new Set())
  const totalCount = ref(0)

  // 从 localStorage 加载收藏
  try {
    const saved = localStorage.getItem('interview-bookmarks')
    if (saved) bookmarkedIds.value = new Set(JSON.parse(saved))
  } catch {}

  async function loadAll() {
    allQuestions.value = await window.api.getAllInterviewQuestions()
    totalCount.value = allQuestions.value.length
  }

  async function loadByCategory(category: InterviewCategory) {
    allQuestions.value = await window.api.getInterviewQuestionsByCategory(category)
  }

  async function search(keyword: string) {
    allQuestions.value = await window.api.searchInterviewQuestions(keyword)
  }

  const categories = computed(() => {
    return Object.entries(INTERVIEW_CATEGORY_LABELS).map(([key, label]) => ({
      key: key as InterviewCategory,
      label,
    }))
  })

  const filteredQuestions = computed(() => allQuestions.value)

  function setCategory(cat: InterviewCategory | 'all') {
    currentCategory.value = cat
    searchQuery.value = ''
    expandedId.value = null
    if (cat === 'all') {
      loadAll()
    } else {
      loadByCategory(cat)
    }
  }

  function handleSearch() {
    if (searchQuery.value.trim()) {
      search(searchQuery.value.trim())
    } else {
      if (currentCategory.value === 'all') {
        loadAll()
      } else {
        loadByCategory(currentCategory.value)
      }
    }
  }

  function toggleExpand(id: string) {
    expandedId.value = expandedId.value === id ? null : id
  }

  function toggleBookmark(id: string) {
    if (bookmarkedIds.value.has(id)) {
      bookmarkedIds.value.delete(id)
    } else {
      bookmarkedIds.value.add(id)
    }
    bookmarkedIds.value = new Set(bookmarkedIds.value)
    localStorage.setItem('interview-bookmarks', JSON.stringify(Array.from(bookmarkedIds.value)))
  }

  function isBookmarked(id: string): boolean {
    return bookmarkedIds.value.has(id)
  }

  // CRUD
  async function saveQuestion(q: InterviewQuestion) {
    await window.api.saveInterviewQuestion(JSON.parse(JSON.stringify(q)))
    await loadAll()
  }

  async function deleteQuestion(id: string) {
    await window.api.deleteInterviewQuestion(id)
    await loadAll()
  }

  return {
    allQuestions,
    currentCategory,
    searchQuery,
    expandedId,
    categories,
    filteredQuestions,
    totalCount,
    loadAll,
    setCategory,
    handleSearch,
    toggleExpand,
    toggleBookmark,
    isBookmarked,
    saveQuestion,
    deleteQuestion,
  }
})
