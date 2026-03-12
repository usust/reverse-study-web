import { createRouter, createWebHistory } from 'vue-router'
import ConfigsView from '../views/ConfigsView.vue'
import BackendConfigView from '../views/BackendConfigView.vue'
import CommonStorageConfigView from '../views/CommonStorageConfigView.vue'
import ProgramListView from '../views/ProgramListView.vue'
import PublishedProgramsView from '../views/PublishedProgramsView.vue'
import PromptSettingsView from '../views/PromptSettingsView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/configs' },
    { path: '/configs', component: ConfigsView },
    { path: '/prompt-settings', component: PromptSettingsView },
    { path: '/common-storage', component: CommonStorageConfigView },
    { path: '/programs', component: ProgramListView },
    { path: '/published-programs', component: PublishedProgramsView },
    { path: '/backend-config', component: BackendConfigView }
  ]
})

export default router
