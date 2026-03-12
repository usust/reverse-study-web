<template>
  <div>
    <h1 class="page-title">提示词管理</h1>

    <div class="card prompt-page-card">
      <div class="prompt-toolbar">
        <button class="secondary mini-action-btn icon-btn" @click="addPrompt">
          <svg viewBox="0 0 16 16" aria-hidden="true">
            <path d="M7 2h2v5h5v2H9v5H7V9H2V7h5z" />
          </svg>
          <span>新增提示词</span>
        </button>
      </div>

      <div v-if="prompts.length === 0" class="empty-tip prompt-empty">暂无提示词。</div>
      <div v-else class="prompt-grid">
        <div v-for="(item, idx) in prompts" :key="item.id || idx" class="prompt-card">
          <div class="prompt-card-head">
            <div class="prompt-card-title">
              <span class="prompt-chip">提示词 {{ idx + 1 }}</span>
              <span class="prompt-id" v-if="Number(item.id || 0) > 0">ID: {{ item.id }}</span>
            </div>
            <div class="prompt-card-actions">
              <button class="mini-action-btn icon-btn" @click="savePrompt(item)">
                <svg viewBox="0 0 16 16" aria-hidden="true">
                  <path d="M3 2h8l2 2v10H3V2zm2 1v3h6V3H5zm0 5v4h6V8H5z" />
                </svg>
                <span>保存</span>
              </button>
              <button class="warn mini-action-btn icon-btn" @click="deletePrompt(item, idx)">
                <svg viewBox="0 0 16 16" aria-hidden="true">
                  <path d="M6 2h4l1 1h3v2H2V3h3l1-1zm-2 4h8l-.6 8H4.6L4 6z" />
                </svg>
                <span>删除</span>
              </button>
            </div>
          </div>

          <div class="row">
            <div class="field">
              <label>名称</label>
              <input v-model="item.name" placeholder="例如：创建C代码提示词" />
            </div>
          </div>

          <div class="row">
            <div class="field field-full">
              <label>提示词内容</label>
              <textarea v-model="item.content" class="prompt-content" placeholder="请输入提示词内容"></textarea>
              <div class="prompt-count">字数：{{ contentLength(item.content) }}</div>
            </div>
          </div>
        </div>
      </div>

      <div class="msg" :style="{ color: msgBad ? '#c52828' : '#0a5' }">{{ msg }}</div>
    </div>
  </div>
</template>

<script>
import { getApiBase } from '../api-base'

export default {
  name: 'PromptSettingsView',
  data() {
    return {
      apiBase: getApiBase(),
      prompts: [],
      msg: '',
      msgBad: false
    }
  },
  mounted() {
    this.loadPrompts()
  },
  methods: {
    trimText(value) {
      if (value === null || value === undefined) {
        return ''
      }
      return String(value).trim()
    },
    contentLength(value) {
      return this.trimText(value).length
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
    async loadPrompts() {
      try {
        var data = await this.requestJSON('GET', '/config/prompt/prompts')
        this.prompts = Array.isArray(data) ? data : []
        if (this.prompts.length === 0) {
          this.prompts = [{ id: 0, name: '创建C代码提示词', content: '' }]
        }
        this.msg = ''
        this.msgBad = false
      } catch (err) {
        this.msg = err.message
        this.msgBad = true
      }
    },
    async savePrompt(item) {
      var payload = {
        id: Number(item.id || 0),
        name: this.trimText(item.name),
        content: this.trimText(item.content)
      }
      if (!payload.name) {
        this.msg = '名称不能为空'
        this.msgBad = true
        return
      }
      if (!payload.content) {
        this.msg = '提示词内容不能为空'
        this.msgBad = true
        return
      }
      try {
        var data = await this.requestJSON('PUT', '/config/prompt/prompts', payload)
        if (data && data.id) {
          item.id = data.id
        }
        this.msg = '提示词保存成功'
        this.msgBad = false
      } catch (err) {
        this.msg = err.message
        this.msgBad = true
      }
    },
    async deletePrompt(item, idx) {
      if (!window.confirm('确定删除该提示词吗？')) {
        return
      }

      var id = Number(item.id || 0)
      if (id <= 0) {
        this.prompts.splice(idx, 1)
        this.msg = '已删除'
        this.msgBad = false
        if (this.prompts.length === 0) {
          this.prompts.push({ id: 0, name: '', content: '' })
        }
        return
      }

      try {
        await this.requestJSON('DELETE', '/config/prompt/prompts/' + encodeURIComponent(String(id)))
        this.prompts.splice(idx, 1)
        this.msg = '提示词删除成功'
        this.msgBad = false
        if (this.prompts.length === 0) {
          this.prompts.push({ id: 0, name: '', content: '' })
        }
      } catch (err) {
        this.msg = err.message
        this.msgBad = true
      }
    },
    addPrompt() {
      this.prompts.push({ id: 0, name: '', content: '' })
    }
  }
}
</script>

<style scoped>
.prompt-page-card {
  background: linear-gradient(180deg, #eef4ff 0%, #e8f0ff 100%);
  border: 1px solid #d2def5;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.55);
}

.prompt-toolbar {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  margin-bottom: 12px;
}

.prompt-empty {
  padding: 8px 2px;
}

.prompt-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.prompt-card {
  border: 1px solid #cbdaf3;
  border-radius: 12px;
  padding: 12px;
  background: #ffffff;
  box-shadow: 0 8px 22px rgba(26, 47, 82, 0.12);
  transition: box-shadow 0.2s ease, transform 0.2s ease;
}

.prompt-card:hover {
  box-shadow: 0 12px 26px rgba(26, 47, 82, 0.16);
  transform: translateY(-1px);
}

.prompt-card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 8px;
}

.prompt-card-title {
  display: flex;
  align-items: center;
  gap: 8px;
}

.prompt-chip {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 12px;
  color: #0f356f;
  background: #dce9ff;
}

.prompt-id {
  font-size: 12px;
  color: #5a6f94;
}

.prompt-card-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.prompt-card-actions button {
  width: auto;
  min-width: 68px;
  padding: 6px 10px;
  font-size: 12px;
}

.mini-action-btn {
  width: auto;
  min-width: 58px;
  padding: 5px 9px;
  font-size: 12px;
}

.icon-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.icon-btn svg {
  width: 12px;
  height: 12px;
  fill: currentColor;
}

.prompt-content {
  min-height: 170px;
  background: #f9fbff;
  border-color: #bfd0ee;
}

.prompt-count {
  margin-top: 4px;
  text-align: right;
  font-size: 12px;
  color: #607497;
}

@media (max-width: 960px) {
  .prompt-grid {
    grid-template-columns: 1fr;
  }
}
</style>
