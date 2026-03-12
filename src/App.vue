<template>
  <div class="layout">
    <aside class="sidebar">
      <div class="brand">Reverse Study Admin</div>
      <nav class="menu">
        <RouterLink to="/programs">题目管理</RouterLink>
        <RouterLink to="/published-programs">已发布题目</RouterLink>
        <div class="menu-group">
          <div class="menu-parent" @click="toggleConfigMenu">
            <span>配置</span>
            <span class="menu-arrow">{{ configMenuOpen ? '▾' : '▸' }}</span>
          </div>
          <div v-show="configMenuOpen" class="menu-children">
            <RouterLink class="menu-sub" to="/configs">API配置</RouterLink>
            <RouterLink class="menu-sub" to="/prompt-settings">提示词管理</RouterLink>
            <div class="menu-group menu-sub-group">
              <div class="menu-parent menu-sub" @click="toggleCommonMenu">
                <span>通用配置</span>
                <span class="menu-arrow">{{ commonMenuOpen ? '▾' : '▸' }}</span>
              </div>
              <div v-show="commonMenuOpen" class="menu-children">
                <RouterLink class="menu-sub menu-sub-deep" to="/common-storage">存储配置</RouterLink>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div class="version-panel">
        <div class="version-line">前端版本 {{ frontendVersion }}</div>
        <div class="version-line">后端版本 {{ backendVersion }}</div>
      </div>
    </aside>

    <main class="main">
      <RouterView />
    </main>
  </div>
</template>

<script>
import { getApiBase } from './api-base'
import { FRONTEND_VERSION } from './version'

export default {
  name: 'App',
  data() {
    return {
      configMenuOpen: true,
      commonMenuOpen: true,
      frontendVersion: FRONTEND_VERSION,
      backendVersion: '读取中...',
      apiBase: getApiBase()
    }
  },
  mounted() {
    this.loadBackendVersion()
  },
  methods: {
    toggleConfigMenu() {
      this.configMenuOpen = !this.configMenuOpen
    },
    toggleCommonMenu() {
      this.commonMenuOpen = !this.commonMenuOpen
    },
    async loadBackendVersion() {
      try {
        var resp = await fetch(this.apiBase + '/system/version')
        var txt = await resp.text()
        var data = txt ? JSON.parse(txt) : null
        if (!resp.ok) {
          throw new Error((data && (data.message || data.error)) ? (data.message || data.error) : ('请求失败: ' + resp.status))
        }
        this.backendVersion = (data && data.version) ? String(data.version) : '未知'
      } catch (err) {
        this.backendVersion = '读取失败'
      }
    }
  }
}
</script>
