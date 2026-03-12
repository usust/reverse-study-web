<template>
  <div>
    <h1 class="page-title">已发布题目</h1>

    <div class="card published-card-shell">
      <div class="card-head">
        <h2>卡片展示</h2>
        <div class="btn-row">
          <button class="secondary" @click="loadPrograms">刷新题目</button>
        </div>
      </div>

      <div class="msg" :style="{ color: listMsgBad ? '#c52828' : '#0a5' }">{{ listMsg }}</div>

      <div v-if="publishedPrograms.length === 0" class="empty-tip">
        暂无已发布题目。
      </div>

      <div v-else class="program-card-grid">
        <article v-for="item in publishedPrograms" :key="item.id" class="program-card">
          <div class="program-card-head">
            <h3 class="program-title">{{ item.title || '未命名题目' }}</h3>
            <button class="download-btn" @click="downloadProgram(item)">下载</button>
          </div>
          <p class="program-desc">{{ item.description || '暂无题目描述' }}</p>

          <div class="program-tag-row">
            <span class="program-tag">分值 {{ item.score }}</span>
            <span class="program-tag">难度 {{ displayNumber(item.difficulty) }}</span>
            <span class="program-tag">完成 {{ item.completedCount }}</span>
          </div>
        </article>
      </div>
    </div>
  </div>
</template>

<script>
import { getApiBase } from '../api-base'

export default {
  name: 'PublishedProgramsView',
  data() {
    return {
      apiBase: getApiBase(),
      publishedPrograms: [],
      listMsg: '',
      listMsgBad: false
    }
  },
  mounted() {
    this.loadPrograms()
  },
  methods: {
    displayNumber(value) {
      return Number.isFinite(Number(value)) ? String(Number(value)) : '-'
    },
    trimText(value) {
      if (value === null || value === undefined) {
        return ''
      }
      return String(value).trim()
    },
    async requestJSON(method, path) {
      var resp = await fetch(this.apiBase + path, { method: method })
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
    async loadPrograms() {
      try {
        var data = await this.requestJSON('GET', '/reverse-program/list')
        var allPrograms = Array.isArray(data) ? data : []
        this.publishedPrograms = allPrograms.filter(function (item) {
          return Number(item.published) === 1
        })
        this.listMsg = '已发布题目共 ' + this.publishedPrograms.length + ' 条'
        this.listMsgBad = false
      } catch (err) {
        this.listMsg = err.message
        this.listMsgBad = true
      }
    },
    downloadProgram(item) {
      var id = this.trimText(item && item.id)
      if (!id) {
        this.listMsg = '无效题目ID'
        this.listMsgBad = true
        return
      }
      window.open(this.apiBase + '/reverse-program/download/' + encodeURIComponent(id), '_blank')
    }
  }
}
</script>

<style scoped>
.published-card-shell {
  background:
    radial-gradient(circle at top right, rgba(255, 215, 170, 0.65), transparent 24%),
    linear-gradient(180deg, #fef6e9 0%, #fffdf9 100%);
  border: 1px solid #ead9be;
}

.program-card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 12px;
}

.program-card {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-height: 142px;
  padding: 12px;
  border-radius: 14px;
  border: 1px solid #e7d6bb;
  background: linear-gradient(180deg, #fffdfa 0%, #fff6ea 100%);
  box-shadow: 0 6px 14px rgba(78, 50, 18, 0.05);
}

.program-card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.program-title {
  margin: 0;
  flex: 1;
  color: #2f2215;
  font-size: 17px;
  line-height: 1.25;
}

.program-desc {
  margin: 0;
  min-height: 40px;
  color: #6a4f2f;
  line-height: 1.4;
  font-size: 13px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.program-tag-row {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: auto;
}

.program-tag {
  display: inline-flex;
  align-items: center;
  height: 24px;
  padding: 0 8px;
  border-radius: 999px;
  background: #fff1dd;
  border: 1px solid #ebcfaa;
  color: #6b4b24;
  font-weight: 600;
  font-size: 11px;
}

.download-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: auto;
  min-width: 0;
  height: 28px;
  padding: 0 10px;
  border: 1px solid #dcb98a;
  border-radius: 999px;
  background: #fffaf3;
  color: #7a5427;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
}

.download-btn:hover {
  background: #fff2e3;
}
</style>
