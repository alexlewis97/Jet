import { VercelRequest, VercelResponse } from '@vercel/node';
import { randomUUID } from 'crypto';

// In-memory storage
const configurations = new Map<string, any>();
const recipients = new Map<string, any>();
const aggregations = new Map<string, any[]>();
const schedules = new Map<string, any>();

export default function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { url, method, body } = req;
  const path = url?.split('?')[0] || '/';

  try {
    // Serve HTML for root
    if (path === '/' || path === '') {
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.status(200).send(getHtmlContent());
    }

    // Health check
    if (path === '/health') {
      return res.json({ status: 'ok' });
    }

    // API Routes
    const configMatch = path.match(/^\/api\/configurations\/?$/);
    const configIdMatch = path.match(/^\/api\/configurations\/([^\/]+)$/);
    const templateMatch = path.match(/^\/api\/configurations\/([^\/]+)\/template$/);
    const recipientsMatch = path.match(/^\/api\/configurations\/([^\/]+)\/recipients$/);
    const aggregationsMatch = path.match(/^\/api\/configurations\/([^\/]+)\/aggregations$/);
    const scheduleMatch = path.match(/^\/api\/configurations\/([^\/]+)\/schedule$/);
    const scheduleDescMatch = path.match(/^\/api\/configurations\/([^\/]+)\/schedule\/description$/);
    const previewMatch = path.match(/^\/api\/configurations\/([^\/]+)\/preview$/);
    const airflowMatch = path.match(/^\/api\/configurations\/([^\/]+)\/airflow$/);

    // POST /api/configurations
    if (configMatch && method === 'POST') {
      const { label } = body || {};
      if (!label?.trim()) return res.status(400).json({ error: 'Configuration label is required' });
      const id = randomUUID();
      const now = new Date();
      const template = { id: randomUUID(), content: '<html><body></body></html>', createdAt: now, updatedAt: now };
      const config = { id, label: label.trim(), template, recipientConfig: { id, type: 'manual', manualEmails: [] }, reportConfig: { id, tableReference: { database: '', table: '' } }, aggregations: [], createdAt: now, updatedAt: now };
      configurations.set(id, config);
      return res.status(201).json(config);
    }

    // GET /api/configurations
    if (configMatch && method === 'GET') {
      const search = req.query.search as string;
      let configs = Array.from(configurations.values());
      if (search) configs = configs.filter(c => c.label.toLowerCase().includes(search.toLowerCase()));
      return res.json(configs);
    }

    // GET /api/configurations/:id
    if (configIdMatch && method === 'GET') {
      const config = configurations.get(configIdMatch[1]);
      if (!config) return res.status(404).json({ error: 'Configuration not found' });
      return res.json(config);
    }

    // PUT /api/configurations/:id
    if (configIdMatch && method === 'PUT') {
      const existing = configurations.get(configIdMatch[1]);
      if (!existing) return res.status(404).json({ error: 'Configuration not found' });
      const updated = { ...existing, ...body, id: existing.id, createdAt: existing.createdAt, updatedAt: new Date() };
      configurations.set(configIdMatch[1], updated);
      return res.json(updated);
    }

    // DELETE /api/configurations/:id
    if (configIdMatch && method === 'DELETE') {
      if (!configurations.has(configIdMatch[1])) return res.status(404).json({ error: 'Configuration not found' });
      configurations.delete(configIdMatch[1]);
      return res.status(204).end();
    }

    // PUT /api/configurations/:id/template
    if (templateMatch && method === 'PUT') {
      const { content } = body || {};
      if (!content?.trim()) return res.status(400).json({ error: 'Template content cannot be empty' });
      const config = configurations.get(templateMatch[1]);
      if (!config) return res.status(404).json({ error: 'Configuration not found' });
      config.template.content = content;
      config.template.updatedAt = new Date();
      config.updatedAt = new Date();
      return res.json(config.template);
    }

    // PUT /api/configurations/:id/recipients
    if (recipientsMatch && method === 'PUT') {
      const { type, emails, tableReference } = body || {};
      const configId = recipientsMatch[1];
      let recipientConfig;
      if (type === 'manual') {
        recipientConfig = { id: configId, type: 'manual', manualEmails: emails || [] };
      } else {
        recipientConfig = { id: configId, type: 'datalake', tableReference };
      }
      recipients.set(configId, recipientConfig);
      const config = configurations.get(configId);
      if (config) { config.recipientConfig = recipientConfig; config.updatedAt = new Date(); }
      return res.json(recipientConfig);
    }

    // POST /api/configurations/:id/aggregations
    if (aggregationsMatch && method === 'POST') {
      const configId = aggregationsMatch[1];
      const agg = { id: randomUUID(), configId, ...body };
      const existing = aggregations.get(configId) || [];
      existing.push(agg);
      aggregations.set(configId, existing);
      const config = configurations.get(configId);
      if (config) { config.aggregations = existing; config.updatedAt = new Date(); }
      return res.status(201).json(agg);
    }

    // GET /api/configurations/:id/aggregations
    if (aggregationsMatch && method === 'GET') {
      return res.json(aggregations.get(aggregationsMatch[1]) || []);
    }

    // GET /api/configurations/:id/schedule
    if (scheduleMatch && method === 'GET') {
      const configId = scheduleMatch[1];
      let schedule = schedules.get(configId);
      if (!schedule) {
        schedule = { id: randomUUID(), configId, enabled: false, daysOfWeek: [], time: '09:00', datesOfMonth: [], timezone: 'UTC', createdAt: new Date(), updatedAt: new Date() };
        schedules.set(configId, schedule);
      }
      return res.json(schedule);
    }

    // PUT /api/configurations/:id/schedule
    if (scheduleMatch && method === 'PUT') {
      const configId = scheduleMatch[1];
      let schedule = schedules.get(configId) || { id: randomUUID(), configId, enabled: false, daysOfWeek: [], time: '09:00', datesOfMonth: [], timezone: 'UTC', createdAt: new Date(), updatedAt: new Date() };
      schedule = { ...schedule, ...body, updatedAt: new Date() };
      schedules.set(configId, schedule);
      return res.json(schedule);
    }

    // GET /api/configurations/:id/schedule/description
    if (scheduleDescMatch && method === 'GET') {
      const schedule = schedules.get(scheduleDescMatch[1]);
      if (!schedule?.enabled) return res.json({ description: 'לא מוגדר', cron: '' });
      const dayNames: Record<string, string> = { sunday: 'ראשון', monday: 'שני', tuesday: 'שלישי', wednesday: 'רביעי', thursday: 'חמישי', friday: 'שישי', saturday: 'שבת' };
      let desc = `בשעה ${schedule.time}`;
      if (schedule.datesOfMonth?.length > 0) desc += ` בתאריכים ${schedule.datesOfMonth.join(', ')} בחודש`;
      else if (schedule.daysOfWeek?.length > 0) desc += ` בימים: ${schedule.daysOfWeek.map((d: string) => dayNames[d] || d).join(', ')}`;
      else desc += ' כל יום';
      const [hour, minute] = schedule.time.split(':');
      let cron = `${minute} ${hour} * * *`;
      if (schedule.datesOfMonth?.length > 0) cron = `${minute} ${hour} ${schedule.datesOfMonth.join(',')} * *`;
      else if (schedule.daysOfWeek?.length > 0) {
        const dayMap: Record<string, number> = { sunday: 0, monday: 1, tuesday: 2, wednesday: 3, thursday: 4, friday: 5, saturday: 6 };
        cron = `${minute} ${hour} * * ${schedule.daysOfWeek.map((d: string) => dayMap[d]).join(',')}`;
      }
      return res.json({ description: desc, cron });
    }

    // GET /api/configurations/:id/preview
    if (previewMatch && method === 'GET') {
      const config = configurations.get(previewMatch[1]);
      if (!config) return res.status(404).json({ error: 'Configuration not found' });
      const aggs = aggregations.get(previewMatch[1]) || [];
      const mockData: Record<string, number[]> = { revenue: [1000.50, 2500.75, 750.25], count: [10, 25, 5] };
      const computedAggs = aggs.map((a: any) => {
        const data = mockData[a.column] || [0];
        let value = 0;
        switch (a.type) {
          case 'sum': value = data.reduce((acc, v) => acc + v, 0); break;
          case 'average': value = data.reduce((acc, v) => acc + v, 0) / data.length; break;
          case 'count': value = data.length; break;
          case 'min': value = Math.min(...data); break;
          case 'max': value = Math.max(...data); break;
        }
        return { label: a.label, value: Math.round(value * 100) / 100 };
      });
      let html = config.template.content;
      computedAggs.forEach((a: any) => { html = html.replace(new RegExp(`\\{\\{aggregation\\.${a.label}\\}\\}`, 'g'), String(a.value)); });
      const recipientConfig = recipients.get(previewMatch[1]);
      const recipientList = recipientConfig?.type === 'manual' ? (recipientConfig.manualEmails || []) : ['user1@example.com', 'user2@example.com'];
      return res.json({ renderedHtml: html, recipientCount: recipientList.length, recipients: recipientList, aggregations: computedAggs, errors: [] });
    }

    // GET /api/configurations/:id/airflow
    if (airflowMatch && method === 'GET') {
      const config = configurations.get(airflowMatch[1]);
      if (!config) return res.status(404).json({ error: 'Configuration not found' });
      const schedule = schedules.get(airflowMatch[1]);
      return res.json({ configId: config.id, label: config.label, templateContent: config.template.content, recipientSource: config.recipientConfig, reportTable: config.reportConfig.tableReference, aggregations: config.aggregations, schedule });
    }

    return res.status(404).json({ error: 'Not found' });
  } catch (error) {
    return res.status(500).json({ error: (error as Error).message });
  }
}


function getHtmlContent(): string {
  return `<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Jet - מתזמן דוא"ל</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; padding: 20px; }
    .container { max-width: 1200px; margin: 0 auto; }
    header { background: white; padding: 30px; margin-bottom: 30px; border-radius: 20px; box-shadow: 0 10px 40px rgba(0,0,0,0.15); }
    header h1 { font-size: 28px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    header p { color: #718096; margin-top: 8px; }
    .card { background: white; border-radius: 20px; padding: 25px; margin-bottom: 25px; box-shadow: 0 10px 40px rgba(0,0,0,0.1); }
    .card h2 { margin-bottom: 20px; color: #1a202c; font-size: 22px; }
    .btn { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; padding: 12px 24px; border-radius: 10px; cursor: pointer; font-size: 14px; font-weight: 600; }
    .btn-secondary { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); }
    input, textarea, select { width: 100%; padding: 12px 16px; border: 2px solid #e2e8f0; border-radius: 10px; margin-bottom: 15px; font-size: 14px; font-family: inherit; }
    textarea { min-height: 150px; font-family: monospace; }
    .config-list { list-style: none; }
    .config-item { padding: 15px; border: 2px solid #e2e8f0; border-radius: 12px; margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center; background: #fafafa; }
    .config-label { font-weight: 600; color: #2d3748; }
    .config-date { color: #a0aec0; font-size: 12px; margin-top: 4px; }
    .config-actions { display: flex; gap: 8px; }
    .tabs { display: flex; gap: 8px; margin-bottom: 20px; flex-wrap: wrap; }
    .tab { padding: 10px 18px; background: #f7fafc; border-radius: 10px; cursor: pointer; font-weight: 600; color: #718096; border: 2px solid transparent; }
    .tab.active { color: #667eea; background: white; border-color: #667eea; }
    .hidden { display: none; }
    .form-group { margin-bottom: 15px; }
    .form-group label { display: block; margin-bottom: 6px; font-weight: 600; color: #2d3748; font-size: 13px; }
    .preview-box { background: #f7fafc; border: 2px solid #e2e8f0; border-radius: 12px; padding: 20px; min-height: 200px; }
    .error { color: #e53e3e; background: #fff5f5; padding: 12px; border-radius: 10px; margin-bottom: 12px; }
    .success { color: #38a169; background: #f0fff4; padding: 12px; border-radius: 10px; margin-bottom: 12px; }
    .hint { color: #718096; font-size: 12px; margin-top: 4px; }
    .day-btn { padding: 10px 16px; border: 2px solid #e2e8f0; background: white; border-radius: 10px; cursor: pointer; font-weight: 600; color: #2d3748; font-size: 13px; }
    .day-btn.active { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-color: #667eea; }
    .empty-state { text-align: center; padding: 30px; color: #a0aec0; }
  </style>
</head>
<body>
  <div class="container">
    <header><h1>מתזמן דוא"ל Jet</h1><p>תזמן דוחות דוא"ל מבוססי נתונים</p></header>
    <div class="card">
      <h2>✨ צור תצורה חדשה</h2>
      <div class="form-group"><label>תווית תצורה</label><input type="text" id="newConfigLabel" placeholder="לדוגמה: דוח מכירות שבועי"></div>
      <button class="btn" onclick="createConfig()">צור תצורה</button>
      <div id="createMessage"></div>
    </div>
    <div class="card">
      <h2>📋 תצורות דוא"ל</h2>
      <input type="text" id="searchInput" placeholder="🔍 חפש תצורות..." oninput="loadConfigs()">
      <ul class="config-list" id="configList"></ul>
    </div>
    <div class="card hidden" id="editorCard">
      <h2>✏️ ערוך: <span id="editingLabel" style="color:#667eea;"></span></h2>
      <div class="tabs">
        <button class="tab active" onclick="showTab('template')">📝 תבנית</button>
        <button class="tab" onclick="showTab('recipients')">👥 נמענים</button>
        <button class="tab" onclick="showTab('schedule')">📅 תזמון</button>
        <button class="tab" onclick="showTab('aggregations')">📊 צבירות</button>
        <button class="tab" onclick="showTab('preview')">👁️ תצוגה מקדימה</button>
      </div>
      <div id="templateTab"><div class="form-group"><label>תבנית HTML</label><textarea id="templateContent"></textarea><p class="hint">💡 השתמש ב-{{aggregation.LabelName}}</p></div><button class="btn" onclick="saveTemplate()">שמור</button></div>
      <div id="recipientsTab" class="hidden"><div class="form-group"><label>סוג</label><select id="recipientType" onchange="toggleRecipientFields()"><option value="manual">✉️ ידני</option><option value="datalake">🗄️ אגם נתונים</option></select></div><div id="manualFields"><div class="form-group"><label>כתובות (שורה לכל אחת)</label><textarea id="manualEmails"></textarea></div></div><div id="datalakeFields" class="hidden"><div class="form-group"><label>מסד נתונים</label><input id="recipientDb"></div><div class="form-group"><label>טבלה</label><input id="recipientTable"></div><div class="form-group"><label>עמודת דוא"ל</label><input id="recipientColumn"></div></div><button class="btn" onclick="saveRecipients()">שמור</button></div>
      <div id="scheduleTab" class="hidden"><div class="form-group"><label><input type="checkbox" id="scheduleEnabled" onchange="toggleScheduleFields()" style="width:auto;margin-left:8px;">הפעל תזמון</label></div><div id="scheduleFields" class="hidden"><p style="margin-bottom:10px;font-weight:600;">בחר ימים:</p><div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:15px;"><button class="day-btn" data-day="sunday" onclick="toggleDay('sunday')">א</button><button class="day-btn" data-day="monday" onclick="toggleDay('monday')">ב</button><button class="day-btn" data-day="tuesday" onclick="toggleDay('tuesday')">ג</button><button class="day-btn" data-day="wednesday" onclick="toggleDay('wednesday')">ד</button><button class="day-btn" data-day="thursday" onclick="toggleDay('thursday')">ה</button><button class="day-btn" data-day="friday" onclick="toggleDay('friday')">ו</button><button class="day-btn" data-day="saturday" onclick="toggleDay('saturday')">ש</button></div><div class="form-group"><label>או תאריכים בחודש</label><input id="datesOfMonth" placeholder="1,15,30"></div><div class="form-group"><label>שעה</label><input type="time" id="scheduleTime" value="09:00"></div><div class="form-group"><label>אזור זמן</label><select id="scheduleTimezone"><option value="UTC">UTC</option><option value="Asia/Jerusalem">ישראל</option></select></div><button class="btn" onclick="saveSchedule()">שמור</button><div id="scheduleDesc" style="margin-top:15px;padding:12px;background:#f7fafc;border-radius:10px;display:none;"></div></div></div>
      <div id="aggregationsTab" class="hidden"><div class="form-group"><label>עמודה</label><input id="aggColumn"></div><div class="form-group"><label>סוג</label><select id="aggType"><option value="sum">סכום</option><option value="average">ממוצע</option><option value="count">ספירה</option><option value="min">מינימום</option><option value="max">מקסימום</option></select></div><div class="form-group"><label>תווית</label><input id="aggLabel"></div><button class="btn" onclick="addAggregation()">הוסף</button><ul id="aggList" class="config-list" style="margin-top:15px;"></ul></div>
      <div id="previewTab" class="hidden"><button class="btn" onclick="loadPreview()">🚀 צור תצוגה מקדימה</button><div id="previewContent" class="preview-box" style="margin-top:15px;"></div></div>
      <div id="editorMessage" style="margin-top:15px;"></div>
    </div>
  </div>

  <script>
    let currentConfigId = null, selectedDays = [];
    async function loadConfigs() {
      const search = document.getElementById('searchInput').value;
      const res = await fetch(search ? '/api/configurations?search=' + encodeURIComponent(search) : '/api/configurations');
      const configs = await res.json();
      document.getElementById('configList').innerHTML = configs.length === 0 ? '<li class="empty-state">אין תצורות עדיין 🚀</li>' : configs.map(c => '<li class="config-item"><div><div class="config-label">' + c.label + '</div><div class="config-date">' + new Date(c.createdAt).toLocaleString('he-IL') + '</div></div><div class="config-actions"><button class="btn" onclick="editConfig(\\'' + c.id + '\\',\\'' + c.label + '\\')">ערוך</button><button class="btn btn-secondary" onclick="deleteConfig(\\'' + c.id + '\\')">מחק</button></div></li>').join('');
    }
    async function createConfig() {
      const label = document.getElementById('newConfigLabel').value;
      if (!label) { showMessage('createMessage', 'אנא הזן תווית', 'error'); return; }
      const res = await fetch('/api/configurations', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ label }) });
      if (res.ok) { document.getElementById('newConfigLabel').value = ''; showMessage('createMessage', '✅ נוצר!', 'success'); loadConfigs(); }
      else { const err = await res.json(); showMessage('createMessage', err.error, 'error'); }
    }
    async function editConfig(id, label) {
      currentConfigId = id;
      document.getElementById('editingLabel').textContent = label;
      document.getElementById('editorCard').classList.remove('hidden');
      const res = await fetch('/api/configurations/' + id);
      const config = await res.json();
      document.getElementById('templateContent').value = config.template?.content || '';
      loadAggregations(); loadSchedule();
    }
    async function deleteConfig(id) {
      if (!confirm('למחוק?')) return;
      await fetch('/api/configurations/' + id, { method: 'DELETE' });
      loadConfigs();
      if (currentConfigId === id) document.getElementById('editorCard').classList.add('hidden');
    }
    async function saveTemplate() {
      const res = await fetch('/api/configurations/' + currentConfigId + '/template', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ content: document.getElementById('templateContent').value }) });
      showMessage('editorMessage', res.ok ? '✅ נשמר!' : (await res.json()).error, res.ok ? 'success' : 'error');
    }
    function toggleRecipientFields() {
      const type = document.getElementById('recipientType').value;
      document.getElementById('manualFields').classList.toggle('hidden', type !== 'manual');
      document.getElementById('datalakeFields').classList.toggle('hidden', type !== 'datalake');
    }
    async function saveRecipients() {
      const type = document.getElementById('recipientType').value;
      const body = type === 'manual' ? { type, emails: document.getElementById('manualEmails').value.split('\\n').filter(e => e.trim()) } : { type, tableReference: { database: document.getElementById('recipientDb').value, table: document.getElementById('recipientTable').value, emailColumn: document.getElementById('recipientColumn').value } };
      const res = await fetch('/api/configurations/' + currentConfigId + '/recipients', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      showMessage('editorMessage', res.ok ? '✅ נשמר!' : (await res.json()).error, res.ok ? 'success' : 'error');
    }
    async function addAggregation() {
      const res = await fetch('/api/configurations/' + currentConfigId + '/aggregations', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ column: document.getElementById('aggColumn').value, type: document.getElementById('aggType').value, label: document.getElementById('aggLabel').value }) });
      if (res.ok) { document.getElementById('aggColumn').value = ''; document.getElementById('aggLabel').value = ''; loadAggregations(); showMessage('editorMessage', '✅ נוסף!', 'success'); }
    }
    async function loadAggregations() {
      const res = await fetch('/api/configurations/' + currentConfigId + '/aggregations');
      const aggs = await res.json();
      document.getElementById('aggList').innerHTML = aggs.map(a => '<li class="config-item"><div class="config-label">' + a.label + ' (' + a.type + ')</div></li>').join('') || '<li class="empty-state">אין צבירות</li>';
    }
    function toggleDay(day) {
      const btn = document.querySelector('[data-day="' + day + '"]');
      if (selectedDays.includes(day)) { selectedDays = selectedDays.filter(d => d !== day); btn.classList.remove('active'); }
      else { selectedDays.push(day); btn.classList.add('active'); }
    }
    function toggleScheduleFields() {
      document.getElementById('scheduleFields').classList.toggle('hidden', !document.getElementById('scheduleEnabled').checked);
    }
    async function loadSchedule() {
      const res = await fetch('/api/configurations/' + currentConfigId + '/schedule');
      const s = await res.json();
      document.getElementById('scheduleEnabled').checked = s.enabled;
      document.getElementById('scheduleFields').classList.toggle('hidden', !s.enabled);
      document.getElementById('scheduleTime').value = s.time;
      document.getElementById('scheduleTimezone').value = s.timezone;
      document.getElementById('datesOfMonth').value = (s.datesOfMonth || []).join(',');
      selectedDays = s.daysOfWeek || [];
      document.querySelectorAll('.day-btn').forEach(btn => btn.classList.toggle('active', selectedDays.includes(btn.dataset.day)));
      if (s.enabled) loadScheduleDesc();
    }
    async function saveSchedule() {
      const dates = document.getElementById('datesOfMonth').value.split(',').map(d => parseInt(d.trim())).filter(d => !isNaN(d));
      const res = await fetch('/api/configurations/' + currentConfigId + '/schedule', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ enabled: document.getElementById('scheduleEnabled').checked, daysOfWeek: selectedDays, time: document.getElementById('scheduleTime').value, datesOfMonth: dates, timezone: document.getElementById('scheduleTimezone').value }) });
      showMessage('editorMessage', res.ok ? '✅ נשמר!' : (await res.json()).error, res.ok ? 'success' : 'error');
      if (res.ok && document.getElementById('scheduleEnabled').checked) loadScheduleDesc();
    }
    async function loadScheduleDesc() {
      const res = await fetch('/api/configurations/' + currentConfigId + '/schedule/description');
      const d = await res.json();
      const el = document.getElementById('scheduleDesc');
      el.style.display = 'block';
      el.innerHTML = '<strong>' + d.description + '</strong><br><code style="color:#718096;">' + d.cron + '</code>';
    }
    async function loadPreview() {
      const res = await fetch('/api/configurations/' + currentConfigId + '/preview');
      const p = await res.json();
      document.getElementById('previewContent').innerHTML = '<p><strong>נמענים:</strong> ' + p.recipientCount + '</p>' + (p.aggregations.length ? '<p><strong>צבירות:</strong></p><ul>' + p.aggregations.map(a => '<li>' + a.label + ': ' + a.value + '</li>').join('') + '</ul>' : '') + '<hr style="margin:15px 0;"><div>' + p.renderedHtml + '</div>';
    }
    function showTab(tab) {
      ['template', 'recipients', 'schedule', 'aggregations', 'preview'].forEach(t => document.getElementById(t + 'Tab').classList.toggle('hidden', t !== tab));
      document.querySelectorAll('.tab').forEach(el => el.classList.toggle('active', el.textContent.includes(tab === 'template' ? 'תבנית' : tab === 'recipients' ? 'נמענים' : tab === 'schedule' ? 'תזמון' : tab === 'aggregations' ? 'צבירות' : 'תצוגה')));
    }
    function showMessage(id, msg, type) {
      const el = document.getElementById(id);
      el.className = type; el.textContent = msg;
      setTimeout(() => el.textContent = '', 3000);
    }
    loadConfigs();
  </script>
</body>
</html>`;
}
