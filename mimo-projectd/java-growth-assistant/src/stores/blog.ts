import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { BlogPost } from '../types'

export const useBlogStore = defineStore('blog', () => {
  const posts = ref<BlogPost[]>([])
  const currentPost = ref<BlogPost | null>(null)

  async function loadAll() {
    posts.value = await window.api.getAllBlogPosts()
  }

  async function loadById(id: number) {
    currentPost.value = await window.api.getBlogPostById(id)
  }

  async function save(post: BlogPost): Promise<number> {
    const id = await window.api.saveBlogPost(JSON.parse(JSON.stringify(post)))
    await loadAll()
    return id
  }

  async function remove(id: number) {
    await window.api.deleteBlogPost(id)
    if (currentPost.value?.id === id) currentPost.value = null
    await loadAll()
  }

  function createNew(): BlogPost {
    return {
      title: '',
      content: '',
      dimension: 'general',
      published: false,
    }
  }

  return { posts, currentPost, loadAll, loadById, save, remove, createNew }
})
