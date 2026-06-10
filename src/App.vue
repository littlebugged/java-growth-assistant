<script setup lang="ts">
import { ref } from 'vue'
import Sidebar from './components/Sidebar.vue'
import DashboardView from './views/DashboardView.vue'
import AssessmentView from './views/AssessmentView.vue'
import RoadmapView from './views/RoadmapView.vue'
import NotesView from './views/NotesView.vue'
import ProjectsView from './views/ProjectsView.vue'
import BlogView from './views/BlogView.vue'
import StatsView from './views/StatsView.vue'
import InterviewView from './views/InterviewView.vue'
import AssessmentQuestionsView from './views/AssessmentQuestionsView.vue'

const currentView = ref('dashboard')

function navigate(view: string) {
  currentView.value = view
}
</script>

<template>
  <div class="app-layout">
    <Sidebar :current-view="currentView" @navigate="navigate" />
    <main class="main-content">
      <DashboardView
        v-if="currentView === 'dashboard'"
        @go-to-assessment="navigate('assessment')"
        @go-to-roadmap="navigate('roadmap')"
        @go-to-notes="navigate('notes')"
        @go-to-projects="navigate('projects')"
        @go-to-blog="navigate('blog')"
      />
      <AssessmentView
        v-else-if="currentView === 'assessment'"
        @go-to-roadmap="navigate('roadmap')"
      />
      <RoadmapView v-else-if="currentView === 'roadmap'" />
      <NotesView v-else-if="currentView === 'notes'" />
      <ProjectsView v-else-if="currentView === 'projects'" />
      <BlogView v-else-if="currentView === 'blog'" />
      <StatsView v-else-if="currentView === 'stats'" />
      <InterviewView v-else-if="currentView === 'interview'" />
      <AssessmentQuestionsView v-else-if="currentView === 'assessmentQuestions'" />
    </main>
  </div>
</template>

<style scoped>
.app-layout {
  display: flex;
  height: 100vh;
  overflow: hidden;
}

.main-content {
  flex: 1;
  overflow-y: auto;
  background: var(--bg-primary);
}
</style>
