<template>
  <div>
    <h1 class="page-title">存储配置</h1>

    <div class="card">
      <div class="card-head">
        <h2>通用配置</h2>
        <div class="btn-row">
          <button class="secondary" @click="loadConfig">读取配置</button>
        </div>
      </div>

      <div class="row">
        <div class="field field-full">
          <label>storage.base_dir</label>
          <input v-model="form.baseDir" placeholder="/home/lyu/reverse-study-server/storage" />
        </div>
      </div>

      <div class="btn-row">
        <button @click="saveConfig">保存配置</button>
      </div>
      <div class="msg" :style="{ color: msgBad ? '#c52828' : '#0a5' }">{{ msg }}</div>
    </div>
  </div>
</template>

<script>
import { getApiBase } from '../api-base'

export default {
  name: 'CommonStorageConfigView',
  data() {
    return {
      apiBase: getApiBase(),
      form: {
        baseDir: ''
      },
      msg: '',
      msgBad: false
    }
  },
  mounted() {
    this.loadConfig()
  },
  methods: {
    trimText(value) {
      return String(value || '').trim()
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
        var data = await this.requestJSON('GET', '/config/common/storage')
        this.form.baseDir = this.trimText(data && data.base_dir)
        this.msg = '配置读取成功'
        this.msgBad = false
      } catch (err) {
        this.msg = err.message
        this.msgBad = true
      }
    },
    async saveConfig() {
      var payload = { base_dir: this.trimText(this.form.baseDir) }
      if (!payload.base_dir) {
        this.msg = 'base_dir 不能为空'
        this.msgBad = true
        return
      }
      try {
        var data = await this.requestJSON('PUT', '/config/common/storage', payload)
        this.form.baseDir = this.trimText(data && data.base_dir)
        this.msg = '配置更新成功'
        this.msgBad = false
      } catch (err) {
        this.msg = err.message
        this.msgBad = true
      }
    }
  }
}
</script>
