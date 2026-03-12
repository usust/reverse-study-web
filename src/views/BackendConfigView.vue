<template>
  <div>
    <h1 class="page-title">后台配置</h1>

    <div class="card">
      <h2>题目配置</h2>
      <div class="row">
        <div class="field field-full">
          <label>题目保存路径</label>
          <input v-model="programSavePath" placeholder="例如：./data/reverse-programs" />
        </div>
      </div>
      <div class="btn-row">
        <button class="secondary" @click="loadConfig">读取配置</button>
        <button @click="saveConfig">保存配置</button>
      </div>
      <div class="msg" :style="{ color: msgBad ? '#c52828' : '#0a5' }">{{ msg }}</div>
    </div>
  </div>
</template>

<script>
import { getApiBase } from '../api-base'

export default {
  name: 'BackendConfigView',
  data() {
    return {
      apiBase: getApiBase(),
      programSavePath: '',
      msg: '',
      msgBad: false
    }
  },
  mounted() {
    this.loadConfig()
  },
  methods: {
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
    async loadConfig() {
      try {
        var data = await this.requestJSON('GET', '/ai/config/program-save-path')
        this.programSavePath = this.trimText(data && data.programSavePath)
        this.msg = '配置读取成功'
        this.msgBad = false
      } catch (err) {
        this.msg = err.message
        this.msgBad = true
      }
    },
    async saveConfig() {
      var payload = { programSavePath: this.trimText(this.programSavePath) }
      if (!payload.programSavePath) {
        this.msg = '题目保存路径不能为空'
        this.msgBad = true
        return
      }
      try {
        var data = await this.requestJSON('PUT', '/ai/config/program-save-path', payload)
        this.programSavePath = this.trimText(data && data.programSavePath)
        this.msg = '配置保存成功'
        this.msgBad = false
      } catch (err) {
        this.msg = err.message
        this.msgBad = true
      }
    }
  }
}
</script>
