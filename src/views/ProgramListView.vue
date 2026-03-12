<template>
  <div>
    <h1 class="page-title">题目管理</h1>

    <div class="card">
      <div class="card-head">
        <h2>题目数据</h2>
        <div class="btn-row">
          <button class="secondary" @click="loadPrograms">刷新题目</button>
          <button @click="openCreateDialog">新建题目</button>
        </div>
      </div>
      <div class="msg" :style="{ color: genMsgBad ? '#c52828' : '#0a5' }">{{ genMsg }}</div>
      <div v-if="programs.length === 0" class="empty-tip">暂无题目数据。</div>
      <table v-else>
        <thead>
          <tr>
            <th>ID</th>
            <th>题目名称</th>
            <th>题目描述</th>
            <th>发布状态</th>
            <th>分值</th>
            <th>类型</th>
            <th>难度</th>
            <th>标签</th>
            <th>完成数量</th>
            <th>基础目录</th>
            <th>程序MD5</th>
            <th>源码文件名</th>
            <th>程序文件名</th>
            <th>创建时间</th>
            <th>更新时间</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in programs" :key="item.id">
            <td>{{ item.id }}</td>
            <td>{{ item.title || '-' }}</td>
            <td>{{ shortText(item.description, 40) }}</td>
            <td>{{ isPublished(item.published) ? '已发布' : '未发布' }}</td>
            <td>{{ item.score }}</td>
            <td>{{ displayNumber(item.programType) }}</td>
            <td>{{ displayNumber(item.difficulty) }}</td>
            <td>{{ formatTags(item.tags) }}</td>
            <td>{{ item.completedCount }}</td>
            <td>{{ item.baseDir || '-' }}</td>
            <td>{{ item.programFileMd5 || '-' }}</td>
            <td>{{ item.sourceFileName || 'main.c' }}</td>
            <td>{{ item.programFileName || 'sample.exe' }}</td>
            <td>{{ formatTime(item.createdAt) }}</td>
            <td>{{ formatTime(item.updatedAt) }}</td>
            <td>
              <button class="secondary table-action-btn" @click="openEditDialog(item)">修改</button>
              <button class="table-action-btn" :disabled="isPublished(item.published)" @click="publishProgram(item)">
                {{ isPublished(item.published) ? '已发布' : '发布' }}
              </button>
              <button class="warn table-action-btn" @click="deleteProgram(item.id)">删除</button>
            </td>
          </tr>
        </tbody>
      </table>
      <div class="msg" :style="{ color: listMsgBad ? '#c52828' : '#0a5' }">{{ listMsg }}</div>
    </div>

    <div v-if="showCreateDialog" class="modal-mask" @click="closeCreateDialog">
      <div class="modal-dialog program-create-modal" @click.stop>
        <h2>新建题目</h2>
        <div class="row">
          <div class="field">
            <label>选择配置</label>
            <select v-model="selectedConfigId">
              <option value="" v-if="configs.length === 0">暂无配置</option>
              <option v-for="item in configs" :key="item.id" :value="item.id">
                {{ (item.name || item.id) + ' | ' + (item.model || '') }}
              </option>
            </select>
          </div>
        </div>
        <div class="row">
          <div class="field">
            <label>选择提示词</label>
            <select v-model="selectedPromptId" @change="applySelectedPrompt">
              <option value="" v-if="promptTemplates.length === 0">暂无提示词</option>
              <option v-for="item in promptTemplates" :key="item.id" :value="String(item.id)">
                {{ item.name || ('提示词#' + item.id) }}
              </option>
            </select>
          </div>
        </div>
        <div class="row">
          <div class="field field-full">
            <label>需求描述（Prompt）</label>
            <textarea class="prompt-editor" v-model="prompt" placeholder="示例：生成一个命令行程序，读取用户名和密码，做简单校验。"></textarea>
          </div>
        </div>
        <div class="row">
          <div class="field field-full">
            <label>编译选项（compile_options）</label>
          </div>
        </div>
        <div class="row">
          <div class="field field-small">
            <label>opt_level</label>
            <select v-model="compileOptions.opt_level">
              <option value="Od">Od</option>
              <option value="O1">O1</option>
              <option value="O2">O2</option>
              <option value="Ox">Ox</option>
            </select>
          </div>
          <div class="field field-small">
            <label>no_inline</label>
            <select v-model="compileOptions.no_inline">
              <option :value="true">true</option>
              <option :value="false">false</option>
            </select>
          </div>
          <div class="field field-small">
            <label>keep_frame_pointer</label>
            <select v-model="compileOptions.keep_frame_pointer">
              <option :value="true">true</option>
              <option :value="false">false</option>
            </select>
          </div>
        </div>
        <div class="row">
          <div class="field field-full">
            <label>题目参数（program）</label>
          </div>
        </div>
        <div class="row">
          <div class="field">
            <label>title</label>
            <input v-model="programForm.title" placeholder="例如：字符串校验逆向题" />
          </div>
          <div class="field field-small">
            <label>published</label>
            <select v-model="programForm.published">
              <option :value="1">1</option>
              <option :value="0">0</option>
            </select>
          </div>
        </div>
        <div class="row">
          <div class="field field-full">
            <label>description</label>
            <textarea v-model="programForm.description" placeholder="请输入题目描述"></textarea>
          </div>
        </div>
        <div class="row">
          <div class="field">
            <label>sourceFileName</label>
            <input v-model="programForm.sourceFileName" placeholder="main.c" />
          </div>
          <div class="field">
            <label>programFileName</label>
            <input v-model="programForm.programFileName" placeholder="example.exe" />
          </div>
        </div>
        <div class="row">
          <div class="field field-small">
            <label>score</label>
            <input v-model.number="programForm.score" type="number" min="0" step="1" />
          </div>
          <div class="field">
            <label>programType</label>
            <input v-model.number="programForm.programType" type="number" min="0" step="1" />
          </div>
          <div class="field field-small">
            <label>difficulty</label>
            <input v-model.number="programForm.difficulty" type="number" min="0" step="1" />
          </div>
          <div class="field field-small">
            <label>completedCount</label>
            <input v-model.number="programForm.completedCount" type="number" min="0" step="1" />
          </div>
        </div>
        <div class="row">
          <div class="field field-full">
            <label>tags</label>
            <input v-model="programForm.tagsText" placeholder="使用逗号分隔，例如：入门,字符串,注册机" />
          </div>
        </div>
        <div class="row">
          <div class="field field-full">
            <label>baseDir</label>
            <input v-model="programForm.baseDir" placeholder="/Users/lyu/Downloads/2" />
          </div>
        </div>
        <div class="btn-row">
          <button @click="createCodeOnly">新建题目</button>
          <button class="secondary" @click="closeCreateDialog">取消</button>
        </div>
      </div>
    </div>

    <div v-if="showEditDialog" class="modal-mask" @click="closeEditDialog">
      <div class="modal-dialog program-create-modal" @click.stop>
        <h2>修改题目</h2>
        <div class="row">
          <div class="field">
            <label>title</label>
            <input v-model="editForm.title" placeholder="例如：字符串校验逆向题" />
          </div>
          <div class="field field-small">
            <label>published</label>
            <select v-model="editForm.published">
              <option :value="1">1</option>
              <option :value="0">0</option>
            </select>
          </div>
        </div>
        <div class="row">
          <div class="field field-full">
            <label>description</label>
            <textarea v-model="editForm.description" placeholder="请输入题目描述"></textarea>
          </div>
        </div>
        <div class="row">
          <div class="field">
            <label>sourceFileName</label>
            <input v-model="editForm.sourceFileName" placeholder="main.c" />
          </div>
          <div class="field">
            <label>programFileName</label>
            <input v-model="editForm.programFileName" placeholder="example.exe" />
          </div>
        </div>
        <div class="row">
          <div class="field field-small">
            <label>score</label>
            <input v-model.number="editForm.score" type="number" min="0" step="1" />
          </div>
          <div class="field">
            <label>programType</label>
            <input v-model.number="editForm.programType" type="number" min="0" step="1" />
          </div>
          <div class="field field-small">
            <label>difficulty</label>
            <input v-model.number="editForm.difficulty" type="number" min="0" step="1" />
          </div>
          <div class="field field-small">
            <label>completedCount</label>
            <input v-model.number="editForm.completedCount" type="number" min="0" step="1" />
          </div>
        </div>
        <div class="row">
          <div class="field field-full">
            <label>tags</label>
            <input v-model="editForm.tagsText" placeholder="使用逗号分隔，例如：入门,字符串,注册机" />
          </div>
        </div>
        <div class="row">
          <div class="field field-full">
            <label>baseDir</label>
            <input v-model="editForm.baseDir" placeholder="/opt/deploy-server/reverse-programs" />
          </div>
        </div>
        <div class="btn-row">
          <button @click="updateProgram">保存修改</button>
          <button class="secondary" @click="closeEditDialog">取消</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getApiBase } from '../api-base'

export default {
  name: 'ProgramListView',
  data() {
    return {
      apiBase: getApiBase(),
      programs: [],
      configs: [],
      promptTemplates: [],
      compileOptions: {
        opt_level: 'Od',
        no_inline: true,
        keep_frame_pointer: true
      },
      programForm: {
        title: '',
        description: '',
        published: 0,
        sourceFileName: 'main.c',
        programFileName: 'example.exe',
        score: 10,
        programType: 0,
        difficulty: 1,
        tagsText: '',
        baseDir: '',
        completedCount: 0
      },
      showCreateDialog: false,
      showEditDialog: false,
      selectedConfigId: '',
      selectedPromptId: '',
      prompt: '',
      editForm: {
        id: '',
        title: '',
        description: '',
        published: 0,
        sourceFileName: 'main.c',
        programFileName: 'example.exe',
        score: 10,
        programType: 0,
        difficulty: 0,
        tagsText: '',
        baseDir: '',
        programFileMD5: '',
        completedCount: 0
      },
      genMsg: '',
      genMsgBad: false,
      listMsg: '',
      listMsgBad: false
    }
  },
  mounted() {
    this.loadConfigs()
    this.loadPrograms()
  },
  methods: {
    trimText(value) {
      if (value === null || value === undefined) {
        return ''
      }
      return String(value).trim()
    },
    shortText(value, maxLen) {
      var text = this.trimText(value)
      if (!text) {
        return '-'
      }
      if (text.length <= maxLen) {
        return text
      }
      return text.slice(0, maxLen) + '...'
    },
    formatTags(tags) {
      if (!Array.isArray(tags) || tags.length === 0) {
        return '-'
      }
      var result = tags
        .map(function (item) { return String(item || '').trim() })
        .filter(function (item) { return !!item })
      return result.length > 0 ? result.join(', ') : '-'
    },
    displayNumber(value) {
      return Number.isFinite(Number(value)) ? String(Number(value)) : '-'
    },
    isPublished(value) {
      return Number(value) === 1
    },
    parseTags(text) {
      return String(text || '')
        .split(',')
        .map(function (item) { return item.trim() })
        .filter(function (item) { return !!item })
    },
    toInt(value, fallback) {
      var n = Number(value)
      if (!Number.isFinite(n)) {
        return fallback
      }
      return Math.trunc(n)
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
    async loadPrograms() {
      try {
        var data = await this.requestJSON('GET', '/reverse-program/list')
        this.programs = Array.isArray(data) ? data : []
        this.listMsg = '题目数据已刷新，共 ' + this.programs.length + ' 条'
        this.listMsgBad = false
      } catch (err) {
        this.listMsg = err.message
        this.listMsgBad = true
      }
    },
    async loadConfigs() {
      try {
        var data = await this.requestJSON('GET', '/config/api/list')
        var allConfigs = Array.isArray(data) ? data : []
        this.configs = allConfigs.filter(function (item) { return !!item.enabled })
        if (!this.selectedConfigId && this.configs.length > 0) {
          this.selectedConfigId = this.configs[0].id
        }
        if (this.selectedConfigId && this.configs.every(function (item) { return item.id !== this.selectedConfigId }, this)) {
          this.selectedConfigId = this.configs.length > 0 ? this.configs[0].id : ''
        }
        this.genMsg = ''
        this.genMsgBad = false
      } catch (err) {
        this.genMsg = err.message
        this.genMsgBad = true
      }
    },
    async loadPromptTemplates() {
      try {
        var data = await this.requestJSON('GET', '/config/prompt/prompts')
        this.promptTemplates = Array.isArray(data) ? data : []
        if (this.promptTemplates.length === 0) {
          this.selectedPromptId = ''
          return
        }

        var hasSelected = this.promptTemplates.some(function (item) {
          return String(item.id) === String(this.selectedPromptId)
        }, this)
        if (!hasSelected) {
          this.selectedPromptId = String(this.promptTemplates[0].id)
          this.applySelectedPrompt()
        }
      } catch (err) {
        this.genMsg = err.message
        this.genMsgBad = true
      }
    },
    applySelectedPrompt() {
      var selected = this.promptTemplates.find(function (item) {
        return String(item.id) === String(this.selectedPromptId)
      }, this)
      if (!selected) {
        return
      }
      this.prompt = this.trimText(selected.content)
    },
    buildPayload() {
      var prompt = this.trimText(this.prompt)
      var configId = this.trimText(this.selectedConfigId)
      var baseDir = this.trimText(this.programForm.baseDir)
      if (!configId) {
        this.genMsg = '请先选择配置'
        this.genMsgBad = true
        return null
      }
      if (!baseDir) {
        this.genMsg = '题目保存路径不能为空'
        this.genMsgBad = true
        return null
      }

      return {
        model_api_id: configId,
        prompt: prompt,
        compile_options: {
          opt_level: this.trimText(this.compileOptions.opt_level) || 'Od',
          no_inline: !!this.compileOptions.no_inline,
          keep_frame_pointer: !!this.compileOptions.keep_frame_pointer
        },
        program: {
          title: this.trimText(this.programForm.title),
          description: this.trimText(this.programForm.description),
          published: this.toInt(this.programForm.published, 0),
          sourceFileName: this.trimText(this.programForm.sourceFileName) || 'main.c',
          programFileName: this.trimText(this.programForm.programFileName) || 'example.exe',
          score: this.toInt(this.programForm.score, 10),
          programType: this.toInt(this.programForm.programType, 0),
          difficulty: this.toInt(this.programForm.difficulty, 1),
          tags: this.parseTags(this.programForm.tagsText),
          baseDir: baseDir,
          completedCount: this.toInt(this.programForm.completedCount, 0)
        }
      }
    },
    async createCodeOnly() {
      var payload = this.buildPayload()
      if (!payload) {
        return
      }
      try {
        var data = await this.requestJSON('POST', '/reverse-program/new', payload)
        var program = (data && data.program) ? data.program : null
        var programID = (program && program.id !== undefined && program.id !== null) ? String(program.id) : ''
        this.genMsg = programID ? ('题目创建成功，记录ID：' + programID) : '题目创建成功'
        this.genMsgBad = false
        this.closeCreateDialog()
        this.loadPrograms()
      } catch (err) {
        this.genMsg = err.message
        this.genMsgBad = true
      }
    },
    async deleteProgram(id) {
      var textID = this.trimText(id)
      if (!textID) {
        this.listMsg = '无效题目ID'
        this.listMsgBad = true
        return
      }
      if (!window.confirm('确定删除题目 ' + textID + ' ?')) {
        return
      }
      try {
        await this.requestJSON('DELETE', '/reverse-program/' + encodeURIComponent(textID))
        this.listMsg = '删除成功'
        this.listMsgBad = false
        this.loadPrograms()
      } catch (err) {
        this.listMsg = err.message
        this.listMsgBad = true
      }
    },
    openEditDialog(item) {
      this.editForm = {
        id: String(item.id || ''),
        title: this.trimText(item.title),
        description: this.trimText(item.description),
        published: this.toInt(item.published, 0),
        sourceFileName: this.trimText(item.sourceFileName) || 'main.c',
        programFileName: this.trimText(item.programFileName) || 'example.exe',
        score: this.toInt(item.score, 10),
        programType: this.toInt(item.programType, 0),
        difficulty: this.toInt(item.difficulty, 0),
        tagsText: this.formatTags(item.tags) === '-' ? '' : this.formatTags(item.tags),
        baseDir: this.trimText(item.baseDir),
        programFileMD5: this.trimText(item.programFileMd5),
        completedCount: this.toInt(item.completedCount, 0)
      }
      this.showEditDialog = true
      this.listMsg = ''
      this.listMsgBad = false
    },
    closeEditDialog() {
      this.showEditDialog = false
    },
    async updateProgram() {
      var id = this.trimText(this.editForm.id)
      if (!id) {
        this.listMsg = '无效题目ID'
        this.listMsgBad = true
        return
      }
      try {
        await this.requestJSON('PUT', '/reverse-program/' + encodeURIComponent(id), {
          title: this.trimText(this.editForm.title),
          description: this.trimText(this.editForm.description),
          published: this.toInt(this.editForm.published, 0),
          sourceFileName: this.trimText(this.editForm.sourceFileName) || 'main.c',
          programFileName: this.trimText(this.editForm.programFileName) || 'example.exe',
          score: this.toInt(this.editForm.score, 10),
          programType: this.toInt(this.editForm.programType, 0),
          difficulty: this.toInt(this.editForm.difficulty, 0),
          tags: this.parseTags(this.editForm.tagsText),
          baseDir: this.trimText(this.editForm.baseDir),
          programFileMd5: this.trimText(this.editForm.programFileMD5),
          completedCount: this.toInt(this.editForm.completedCount, 0)
        })
        this.closeEditDialog()
        this.listMsg = '修改成功'
        this.listMsgBad = false
        this.loadPrograms()
      } catch (err) {
        this.listMsg = err.message
        this.listMsgBad = true
      }
    },
    async publishProgram(item) {
      var textID = this.trimText(item && item.id)
      if (!textID) {
        this.listMsg = '无效题目ID'
        this.listMsgBad = true
        return
      }
      if (this.isPublished(item.published)) {
        this.listMsg = '该题目已经发布'
        this.listMsgBad = false
        return
      }
      if (!window.confirm('确定发布题目 ' + textID + ' ?')) {
        return
      }
      try {
        await this.requestJSON('PUT', '/reverse-program/' + encodeURIComponent(textID) + '/publish')
        this.listMsg = '发布成功'
        this.listMsgBad = false
        this.loadPrograms()
      } catch (err) {
        this.listMsg = err.message
        this.listMsgBad = true
      }
    },
    openCreateDialog() {
      this.showCreateDialog = true
      this.genMsg = ''
      this.genMsgBad = false
      this.loadConfigs()
      this.loadPromptTemplates()
    },
    closeCreateDialog() {
      this.showCreateDialog = false
      this.selectedPromptId = ''
      this.prompt = ''
    }
  }
}
</script>
