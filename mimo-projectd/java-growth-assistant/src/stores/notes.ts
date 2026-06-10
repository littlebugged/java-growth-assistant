import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Note } from '../types'

export const useNotesStore = defineStore('notes', () => {
  const notes = ref<Note[]>([])
  const currentNote = ref<Note | null>(null)

  async function loadAll() {
    notes.value = await window.api.getAllNotes()
  }

  async function loadById(id: number) {
    currentNote.value = await window.api.getNoteById(id)
  }

  async function save(note: Note): Promise<number> {
    const id = await window.api.saveNote(JSON.parse(JSON.stringify(note)))
    await loadAll()
    return id
  }

  async function remove(id: number) {
    await window.api.deleteNote(id)
    if (currentNote.value?.id === id) currentNote.value = null
    await loadAll()
  }

  function createNew(): Note {
    return {
      title: '',
      content: '',
      dimension: 'general',
      tags: [],
    }
  }

  return { notes, currentNote, loadAll, loadById, save, remove, createNew }
})
