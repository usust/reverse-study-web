<template>
  <div>
    <h1 class="page-title">API配置</h1>

    <div class="card">
      <div class="card-head">
        <h2>配置列表</h2>
        <div class="btn-row">
          <button class="secondary" @click="loadConfigs">刷新列表</button>
          <button class="secondary" @click="startAddApi">添加API</button>
        </div>
      </div>
      <div v-if="configs.length === 0" class="empty-tip">暂无API配置，点击“添加API”开始创建。</div>
      <div v-else class="api-grid">
        <div v-for="item in configs" :key="item.id" class="api-item">
          <div class="api-switch-corner">
            <label class="switch">
              <input type="checkbox" :checked="!!item.enabled" @change="toggleEnabled(item, $event)" />
              <span class="slider"></span>
            </label>
          </div>
          <div class="api-title">{{ displayText(item.name, item.id) }}</div>
          <div class="api-line">ID：{{ displayText(item.id) }}</div>
          <div class="api-line">名称：{{ displayText(item.name) }}</div>
          <div class="api-line">供应商：{{ displayText(item.provider) }}</div>
          <div class="api-line">API地址：{{ displayText(item.baseUrl) }}</div>
          <div class="api-line">展示模型名：{{ displayText(item.model) }}</div>
          <div class="api-line">API模型ID：{{ displayText(item.apiModel, item.model) }}</div>
          <div class="api-line">启用状态：{{ item.enabled ? '已启用' : '未启用' }}</div>
          <div class="api-line">创建时间：{{ formatTime(item.createdAt) }}</div>
          <div class="api-line">更新时间：{{ formatTime(item.updatedAt) }}</div>
          <div class="btn-row">
            <button @click="editConfig(item)">编辑</button>
            <button class="warn" @click="deleteConfig(item.id)">删除</button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showForm" class="card" id="api-form-card">
      <div class="card-head">
        <h2>{{ isEditMode ? '编辑API' : '添加API' }}</h2>
        <button class="secondary" @click="cancelForm">取消</button>
      </div>
      <div class="row">
        <div class="field field-full">
          <label>名称</label>
          <input v-model="form.name" placeholder="火山-生产" />
        </div>
      </div>
      <div class="row">
        <div class="field">
          <label>Provider</label>
          <input v-model="form.provider" />
        </div>
        <div class="field">
          <label>展示模型名</label>
          <input v-model="form.model" />
        </div>
      </div>
      <div class="row">
        <div class="field">
          <label>API模型ID</label>
          <input v-model="form.apiModel" placeholder="例如：doubao-seed-2-0-code-preview-260215" />
        </div>
        <div class="field">
          <label>API地址</label>
          <input v-model="form.baseUrl" />
        </div>
      </div>
      <div class="row">
        <div class="field">
          <label>API Key</label>
          <div class="input-with-action">
            <input :type="showApiKey ? 'text' : 'password'" v-model="form.apiKey" placeholder="填写你的密钥" autocomplete="new-password" />
            <button type="button" class="secondary small-btn" @click="showApiKey = !showApiKey">
              {{ showApiKey ? '隐藏' : '显示' }}
            </button>
          </div>
        </div>
      </div>
      <div class="btn-row">
        <button @click="saveConfig">{{ isEditMode ? '保存修改' : '创建API' }}</button>
        <button class="secondary" @click="clearForm">清空表单</button>
      </div>
      <div class="msg" :style="{ color: cfgMsgBad ? '#c52828' : '#0a5' }">{{ cfgMsg }}</div>
    </div>
  </div>
</template>

<script>
import { getApiBase } from '../api-base'

export default {
  name: 'ConfigsView',
  data() {
    return {
      apiBase: getApiBase(),
      configs: [],
      form: {
        id: '',
        name: '',
        provider: 'Volcengine Ark',
        model: 'doubao-seed-1-6-251015',
        apiModel: 'doubao-seed-1-6-251015',
        baseUrl: '',
        apiKey: '',
        enabled: true
      },
      showForm: false,
      isEditMode: false,
      showApiKey: false,
      cfgMsg: '',
      cfgMsgBad: false
    }
  },
  mounted() {
    this.loadConfigs()
  },
  methods: {
    displayText(value, fallback) {
      var a = this.trimText(value)
      if (a) {
        return a
      }
      var b = this.trimText(fallback)
      return b || '-'
    },
    formatTime(value) {
      var text = this.trimText(value)
      if (!text) {
        return '-'
      }
      var d = new Date(text)
      if (isNaN(d.getTime())) {
        return text
      }
      return d.getFullYear() + '-' +
        String(d.getMonth() + 1).padStart(2, '0') + '-' +
        String(d.getDate()).padStart(2, '0') + ' ' +
        String(d.getHours()).padStart(2, '0') + ':' +
        String(d.getMinutes()).padStart(2, '0') + ':' +
        String(d.getSeconds()).padStart(2, '0')
    },
    trimText(value) {
      return (value || '').trim()
    },
    async requestJSON(method, path, body) {
      var options = { method: method, headers: { 'Content-Type': 'application/json' } }
      if (body) {
        options.body = JSON.stringify(body)
      }

      var resp = await fetch(this.apiBase + path, options)
      var txt = await resp.text()
      var data = null
      try {
        data = txt ? JSON.parse(txt) : null
      } catch (e) {
        data = null
      }
      if (!resp.ok) {
        throw new Error((data && (data.message || data.error)) ? (data.message || data.error) : ('请求失败: ' + resp.status))
      }
      if (data && typeof data === 'object' && Object.prototype.hasOwnProperty.call(data, 'data')) {
        return data.data
      }
      return data
    },
    async loadConfigs() {
      try {
        var data = await this.requestJSON('GET', '/config/api/list')
        this.configs = data || []
        this.cfgMsg = '配置列表已刷新，共 ' + this.configs.length + ' 条'
        this.cfgMsgBad = false
      } catch (err) {
        this.cfgMsg = err.message
        this.cfgMsgBad = true
      }
    },
    clearForm() {
      this.form = {
        id: '',
        name: '',
        provider: 'Volcengine Ark',
        model: 'doubao-seed-1-6-251015',
        apiModel: 'doubao-seed-1-6-251015',
        baseUrl: '',
        apiKey: '',
        enabled: false
      }
      this.showApiKey = false
    },
    startAddApi() {
      this.clearForm()
      this.isEditMode = false
      this.showForm = true
      this.cfgMsg = ''
      this.cfgMsgBad = false
      this.scrollToForm()
    },
    cancelForm() {
      this.showForm = false
      this.showApiKey = false
      this.cfgMsg = ''
      this.cfgMsgBad = false
    },
    scrollToForm() {
      this.$nextTick(function () {
        var el = document.getElementById('api-form-card')
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      })
    },
    editConfig(item) {
      this.form = {
        id: item.id || '',
        name: item.name || '',
        provider: item.provider || '',
        model: item.model || '',
        apiModel: item.apiModel || item.model || '',
        baseUrl: item.baseUrl || '',
        apiKey: item.apiKey || '',
        enabled: !!item.enabled
      }
      this.isEditMode = true
      this.showForm = true
      this.showApiKey = false
      this.cfgMsg = '已填充到表单，可直接修改后保存'
      this.cfgMsgBad = false
      this.scrollToForm()
    },
    async saveConfig() {
      var payload = {
        id: this.trimText(this.form.id),
        name: this.trimText(this.form.name),
        provider: this.trimText(this.form.provider),
        model: this.trimText(this.form.model),
        apiModel: this.trimText(this.form.apiModel),
        baseUrl: this.trimText(this.form.baseUrl),
        apiKey: this.trimText(this.form.apiKey),
        enabled: !!this.form.enabled
      }

      if (!payload.name) {
        this.cfgMsg = '名称不能为空'
        this.cfgMsgBad = true
        return
      }

      var method = payload.id ? 'PUT' : 'POST'
      var path = payload.id ? ('/config/api/' + encodeURIComponent(payload.id)) : '/config/api/create'

      try {
        var saved = await this.requestJSON(method, path, payload)
        if (saved && saved.id) {
          this.form.id = saved.id
        }
        this.cfgMsg = '保存成功'
        this.cfgMsgBad = false
        this.showForm = false
        this.isEditMode = false
        await this.loadConfigs()
      } catch (err) {
        this.cfgMsg = err.message
        this.cfgMsgBad = true
      }
    },
    async toggleEnabled(item, event) {
      var previous = !!item.enabled
      var nextValue = !!event.target.checked
      var payload = {
        id: item.id || '',
        name: item.name || '',
        provider: item.provider || '',
        model: item.model || '',
        apiModel: item.apiModel || item.model || '',
        baseUrl: item.baseUrl || '',
        apiKey: item.apiKey || '',
        enabled: nextValue
      }

      try {
        await this.requestJSON('PUT', '/config/api/' + encodeURIComponent(item.id), payload)
        item.enabled = nextValue
        this.cfgMsg = '启用状态更新成功'
        this.cfgMsgBad = false
      } catch (err) {
        event.target.checked = previous
        item.enabled = previous
        this.cfgMsg = err.message
        this.cfgMsgBad = true
      }
    },
    async deleteConfig(id) {
      if (!window.confirm('确定删除配置 ' + id + ' ?')) {
        return
      }

      try {
        var resp = await fetch(this.apiBase + '/config/api/' + encodeURIComponent(id), { method: 'DELETE' })
        if (!resp.ok) {
          var txt = await resp.text()
          var msg = '删除失败: ' + resp.status
          try {
            var obj = txt ? JSON.parse(txt) : null
            if (obj && (obj.message || obj.error)) {
              msg = obj.message || obj.error
            }
          } catch (e) {
            msg = msg
          }
          throw new Error(msg)
        }
        this.cfgMsg = '删除成功'
        this.cfgMsgBad = false
        await this.loadConfigs()
      } catch (err) {
        this.cfgMsg = err.message
        this.cfgMsgBad = true
      }
    }
  }
}
</script>
