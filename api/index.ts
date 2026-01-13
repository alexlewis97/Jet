import express, { Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import { randomUUID } from 'crypto';

const app = express();
app.use(cors());
app.use(express.json());

// In-memory storage
const configurations = new Map();
const templates = new Map();
const recipients = new Map();
const aggregations = new Map();
const schedules = new Map();

// Serve static files
app.use(express.static(path.join(__dirname, '../src/public')));

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

// Configuration endpoints
app.post('/api/configurations', (req: Request, res: Response) => {
  try {
    const { label } = req.body;
    if (!label || label.trim().length === 0) {
      throw new Error('Configuration label is required');
    }
    
    const id = randomUUID();
    const now = new Date();
    const template = { id: randomUUID(), content: '<html><body></body></html>', createdAt: now, updatedAt: now };
    templates.set(template.id, template);
    
    const config = {
      id,
      label: label.trim(),
      template,
      recipientConfig: { id, type: 'manual', manualEmails: [] },
      reportConfig: { id, tableReference: { database: '', table: '' } },
      aggregations: [],
      createdAt: now,
      updatedAt: now,
    };
    
    configurations.set(id, config);
    res.status(201).json(config);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

    const config = {
      id, label: label.trim(), template,
      recipientConfig: { id, type: 'manual', manualEmails: [] },
      reportConfig: { id, tableReference: { database: '', table: '' } },
      aggregations: [], createdAt: now, updatedAt: now
    };
    configurations.set(id, config);
    recipients.set(id, config.recipientConfig);
    res.status(201).json(config);
  } catch (error) { res.status(400).json({ error: (error as Error).message }); }
});

app.get('/api/configurations', (req, res) => {
  const { search } = req.query;
  let configs = Array.from(configurations.values());
  if (search) {
    const filter = (search as string).toLowerCase();
    configs = configs.filter((c: any) => c.label.toLowerCase().includes(filter));
  }
  res.json(configs);
});

app.get('/api/configurations/:id', (req, res) => {
  const config = configurations.get(req.params.id);
  if (!config) return res.status(404).json({ error: 'Configuration not found' });
  res.json(config);
});

app.put('/api/configurations/:id', (req, res) => {
  const existing = configurations.get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Configuration not found' });
  const updated = { ...existing, ...req.body, id: existing.id, createdAt: existing.createdAt, updatedAt: new Date() };
  configurations.set(req.params.id, updated);
  res.json(updated);
});

app.delete('/api/configurations/:id', (req, res) => {
  if (!configurations.has(req.params.id)) return res.status(404).json({ error: 'Configuration not found' });
  configurations.delete(req.params.id);
  res.status(204).send();
});

// Template endpoint
app.put('/api/configurations/:id/template', (req, res) => {
  try {
    const { content } = req.body;
    if (!content || content.trim().length === 0) {
      return res.status(400).json({ error: 'Template content cannot be empty' });
    }
    const config = configurations.get(req.params.id);
    if (!config) return res.status(404).json({ error: 'Configuration not found' });
    config.template.content = content;
    config.template.updatedAt = new Date();
    config.updatedAt = new Date();
    res.json(config.template);
  } catch (error) { res.status(400).json({ error: (error as Error).message }); }
});

// Recipients endpoint
app.put('/api/configurations/:id/recipients', (req, res) => {
  try {
    const { type, emails, tableReference } = req.body;
    const configId = req.params.id;
    let recipientConfig;
    if (type === 'manual') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const invalidEmails = (emails || []).filter((e: string) => !emailRegex.test(e));
      if (invalidEmails.length > 0) {
        return res.status(400).json({ error: `Invalid email format: ${invalidEmails.join(', ')}` });
      }
      recipientConfig = { id: configId, type: 'manual', manualEmails: emails || [] };
    } else {
      recipientConfig = { id: configId, type: 'datalake', tableReference };
    }
    recipients.set(configId, recipientConfig);
    const config = configurations.get(configId);
    if (config) { config.recipientConfig = recipientConfig; config.updatedAt = new Date(); }
    res.json(recipientConfig);
  } catch (error) { res.status(400).json({ error: (error as Error).message }); }
});

app.get('/api/configurations', (req: Request, res: Response) => {
  const { search } = req.query;
  let configs = Array.from(configurations.values());
  if (search) {
    const filter = (search as string).toLowerCase();
    configs = configs.filter((c: any) => c.label.toLowerCase().includes(filter));
  }
  res.json(configs);
});

app.get('/api/configurations/:id', (req: Request, res: Response) => {
  try {
    const config = configurations.get(req.params.id);
    if (!config) throw new Error(`Configuration not found: ${req.params.id}`);
    res.json(config);
  } catch (error) {
    res.status(404).json({ error: (error as Error).message });
  }
});

app.put('/api/configurations/:id', (req: Request, res: Response) => {
  try {
    const existing = configurations.get(req.params.id);
    if (!existing) throw new Error(`Configuration not found: ${req.params.id}`);
    const updated = { ...existing, ...req.body, id: existing.id, createdAt: existing.createdAt, updatedAt: new Date() };
    configurations.set(req.params.id, updated);
    res.json(updated);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

app.delete('/api/configurations/:id', (req: Request, res: Response) => {
  try {
    if (!configurations.has(req.params.id)) throw new Error(`Configuration not found: ${req.params.id}`);
    configurations.delete(req.params.id);
    res.status(204).send();
  } catch (error) {
    res.status(404).json({ error: (error as Error).message });
  }
});

// Template endpoint
app.put('/api/configurations/:id/template', (req: Request, res: Response) => {
  try {
    const { content } = req.body;
    if (!content || content.trim().length === 0) throw new Error('Template content cannot be empty');
    const config = configurations.get(req.params.id);
    if (!config) throw new Error(`Configuration not found: ${req.params.id}`);
    config.template.content = content;
    config.template.updatedAt = new Date();
    config.updatedAt = new Date();
    res.json(config.template);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

// Aggregations endpoints
app.post('/api/configurations/:id/aggregations', (req, res) => {
  try {
    const configId = req.params.id;
    const { column, type, label } = req.body;
    const agg = { id: generateId(), configId, column, type, label };
    const existing = aggregations.get(configId) || [];
    existing.push(agg);
    aggregations.set(configId, existing);
    const config = configurations.get(configId);
    if (config) { config.aggregations = existing; config.updatedAt = new Date(); }
    res.status(201).json(agg);
  } catch (error) { res.status(400).json({ error: (error as Error).message }); }
});

app.get('/api/configurations/:id/aggregations', (req, res) => {
  res.json(aggregations.get(req.params.id) || []);
});

// Schedule endpoints
app.get('/api/configurations/:id/schedule', (req, res) => {
  let schedule = schedules.get(req.params.id);
  if (!schedule) {
    schedule = {
      id: generateId(), configId: req.params.id, enabled: false,
      daysOfWeek: [], time: '09:00', datesOfMonth: [], timezone: 'UTC',
      createdAt: new Date(), updatedAt: new Date()
    };
    schedules.set(req.params.id, schedule);
  }
  res.json(schedule);
});

app.put('/api/configurations/:id/schedule', (req, res) => {
  try {
    const configId = req.params.id;
    let schedule = schedules.get(configId);
    if (!schedule) {
      schedule = { id: generateId(), configId, enabled: false, daysOfWeek: [], time: '09:00', datesOfMonth: [], timezone: 'UTC', createdAt: new Date(), updatedAt: new Date() };
    }
    const { enabled, daysOfWeek, time, datesOfMonth, timezone } = req.body;
    if (time && !/^([0-1][0-9]|2[0-3]):([0-5][0-9])$/.test(time)) {
      return res.status(400).json({ error: 'Invalid time format. Use HH:MM (24-hour format)' });
    }
    schedule = { ...schedule, enabled: enabled ?? schedule.enabled, daysOfWeek: daysOfWeek ?? schedule.daysOfWeek, time: time ?? schedule.time, datesOfMonth: datesOfMonth ?? schedule.datesOfMonth, timezone: timezone ?? schedule.timezone, updatedAt: new Date() };
    schedules.set(configId, schedule);
    res.json(schedule);
  } catch (error) { res.status(400).json({ error: (error as Error).message }); }
});

// Recipients endpoint
app.put('/api/configurations/:id/recipients', (req: Request, res: Response) => {
  try {
    const { type, emails, tableReference } = req.body;
    const configId = req.params.id;
    let config: any;
    if (type === 'manual') {
      config = { id: configId, type: 'manual', manualEmails: emails || [] };
    } else {
      config = { id: configId, type: 'datalake', tableReference };
    }
    recipients.set(configId, config);
    res.json(config);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

// Aggregation endpoints
app.post('/api/configurations/:id/aggregations', (req: Request, res: Response) => {
  try {
    const configId = req.params.id;
    const agg = { id: randomUUID(), configId, ...req.body };
    const existing = aggregations.get(configId) || [];
    existing.push(agg);
    aggregations.set(configId, existing);
    res.status(201).json(agg);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

app.get('/api/configurations/:id/aggregations', (req: Request, res: Response) => {
  res.json(aggregations.get(req.params.id) || []);
});

// Preview endpoint
app.get('/api/configurations/:id/preview', async (req: Request, res: Response) => {
  try {
    const config = configurations.get(req.params.id);
    if (!config) throw new Error(`Configuration not found: ${req.params.id}`);
    const aggs = aggregations.get(req.params.id) || [];
    const computedAggs = aggs.map((a: any) => ({ label: a.label, value: Math.floor(Math.random() * 1000) }));
    let html = config.template.content;
    computedAggs.forEach((a: any) => { html = html.replace(new RegExp(`{{aggregation.${a.label}}}`, 'g'), a.value); });
    res.json({ renderedHtml: html, recipientCount: 2, recipients: ['user@example.com'], aggregations: computedAggs, errors: [] });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

// Schedule endpoints
app.get('/api/configurations/:id/schedule', (req: Request, res: Response) => {
  try {
    let schedule = schedules.get(req.params.id);
    if (!schedule) {
      schedule = { id: randomUUID(), configId: req.params.id, enabled: false, daysOfWeek: [], time: '09:00', datesOfMonth: [], timezone: 'UTC', createdAt: new Date(), updatedAt: new Date() };
      schedules.set(req.params.id, schedule);
    }
    res.json(schedule);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

app.put('/api/configurations/:id/schedule', (req: Request, res: Response) => {
  try {
    const configId = req.params.id;
    let schedule = schedules.get(configId);
    if (!schedule) {
      schedule = { id: randomUUID(), configId, enabled: false, daysOfWeek: [], time: '09:00', datesOfMonth: [], timezone: 'UTC', createdAt: new Date(), updatedAt: new Date() };
    }
    const updated = { ...schedule, ...req.body, updatedAt: new Date() };
    schedules.set(configId, updated);
    res.json(updated);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

app.get('/api/configurations/:id/schedule/description', (req: Request, res: Response) => {
  try {
    const schedule = schedules.get(req.params.id);
    if (!schedule || !schedule.enabled) {
      res.json({ description: 'לא מוגדר', cron: '' });
      return;
    }
    const dayNames: Record<string, string> = { sunday: 'ראשון', monday: 'שני', tuesday: 'שלישי', wednesday: 'רביעי', thursday: 'חמישי', friday: 'שישי', saturday: 'שבת' };
    let desc = `בשעה ${schedule.time}`;
    if (schedule.datesOfMonth?.length > 0) {
      desc += ` בתאריכים ${schedule.datesOfMonth.join(', ')} בחודש`;
    } else if (schedule.daysOfWeek?.length > 0) {
      desc += ` בימים: ${schedule.daysOfWeek.map((d: string) => dayNames[d] || d).join(', ')}`;
    } else {
      desc += ' כל יום';
    }
    res.json({ description: desc, cron: `0 ${schedule.time.split(':')[0]} * * *` });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

// Airflow export
app.get('/api/configurations/:id/airflow', (req: Request, res: Response) => {
  try {
    const config = configurations.get(req.params.id);
    if (!config) throw new Error(`Configuration not found: ${req.params.id}`);
    const schedule = schedules.get(req.params.id);
    res.json({ configId: config.id, label: config.label, templateContent: config.template.content, recipientSource: config.recipientConfig, reportTable: config.reportConfig.tableReference, aggregations: aggregations.get(req.params.id) || [], schedule });
  } catch (error) {
    res.status(404).json({ error: (error as Error).message });
  }
});

export default app;

app.get('/api/configurations/:id/schedule/description', (req, res) => {
  const schedule = schedules.get(req.params.id);
  if (!schedule || !schedule.enabled) {
    return res.json({ description: 'לא מוגדר', cron: '' });
  }
  const dayNames: Record<string, string> = { sunday: 'ראשון', monday: 'שני', tuesday: 'שלישי', wednesday: 'רביעי', thursday: 'חמישי', friday: 'שישי', saturday: 'שבת' };
  let description = `בשעה ${schedule.time}`;
  if (schedule.datesOfMonth.length > 0) {
    description += ` בתאריכים ${schedule.datesOfMonth.sort((a: number, b: number) => a - b).join(', ')} בחודש`;
  } else if (schedule.daysOfWeek.length > 0) {
    description += ` בימים: ${schedule.daysOfWeek.map((d: string) => dayNames[d] || d).join(', ')}`;
  } else {
    description += ' כל יום';
  }
  // Generate cron
  const [hour, minute] = schedule.time.split(':');
  let cron = '';
  if (schedule.datesOfMonth.length > 0) {
    cron = `${minute} ${hour} ${schedule.datesOfMonth.join(',')} * *`;
  } else if (schedule.daysOfWeek.length > 0) {
    const dayMap: Record<string, number> = { sunday: 0, monday: 1, tuesday: 2, wednesday: 3, thursday: 4, friday: 5, saturday: 6 };
    cron = `${minute} ${hour} * * ${schedule.daysOfWeek.map((d: string) => dayMap[d]).join(',')}`;
  } else {
    cron = `${minute} ${hour} * * *`;
  }
  res.json({ description, cron });
});

// Preview endpoint
app.get('/api/configurations/:id/preview', async (req, res) => {
  try {
    const config = configurations.get(req.params.id);
    if (!config) return res.status(404).json({ error: 'Configuration not found' });
    const recipientConfig = recipients.get(req.params.id);
    const recipientList = recipientConfig?.type === 'manual' ? (recipientConfig.manualEmails || []) : ['user1@example.com', 'user2@example.com'];
    const aggs = aggregations.get(req.params.id) || [];
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
    let renderedHtml = config.template.content;
    computedAggs.forEach((a: any) => { renderedHtml = renderedHtml.replace(new RegExp(`\\{\\{aggregation\\.${a.label}\\}\\}`, 'g'), String(a.value)); });
    res.json({ renderedHtml, recipientCount: recipientList.length, recipients: recipientList, aggregations: computedAggs, errors: [] });
  } catch (error) { res.status(400).json({ error: (error as Error).message }); }
});

// Airflow export
app.get('/api/configurations/:id/airflow', (req, res) => {
  const config = configurations.get(req.params.id);
  if (!config) return res.status(404).json({ error: 'Configuration not found' });
  const schedule = schedules.get(req.params.id);
  res.json({
    configId: config.id, label: config.label, templateContent: config.template.content,
    recipientSource: config.recipientConfig, reportTable: config.reportConfig.tableReference,
    aggregations: config.aggregations.map((a: any) => ({ column: a.column, type: a.type, label: a.label })),
    schedule
  });
});

// Serve static HTML
const htmlContent = `<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Jet - מתזמן דוא"ל</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; padding: 20px; }
    .container { max-width: 1400px; margin: 0 auto; }
    header { background: white; color: #1a202c; padding: 30px 40px; margin-bottom: 30px; border-radius: 20px; box-shadow: 0 20px 60px rgba(0,0,0,0.15); display: flex; align-items: center; gap: 20px; }
    header h1 { font-size: 32px; font-weight: 700; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
    header p { color: #718096; margin-top: 8px; font-size: 16px; }
    .card { background: white; border-radius: 20px; padding: 30px; margin-bottom: 30px; box-shadow: 0 10px 40px rgba(0,0,0,0.1); }
    .card h2 { margin-bottom: 20px; color: #1a202c; font-size: 24px; font-weight: 600; }
    .btn { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; padding: 12px 28px; border-radius: 12px; cursor: pointer; font-size: 15px; font-weight: 600; }
    .btn-secondary { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); }
    input, textarea, select { width: 100%; padding: 14px 18px; border: 2px solid #e2e8f0; border-radius: 12px; margin-bottom: 15px; font-size: 15px; font-family: inherit; }
    textarea { min-height: 180px; font-family: monospace; }
    .config-list { list-style: none; }
    .config-item { padding: 20px; border: 2px solid #e2e8f0; border-radius: 16px; margin-bottom: 15px; display: flex; justify-content: space-between; align-items: center; background: #fafafa; }
    .config-label { font-weight: 600; color: #2d3748; }
    .config-date { color: #a0aec0; font-size: 13px; margin-top: 5px; }
    .config-actions { display: flex; gap: 10px; }
    .tabs { display: flex; gap: 10px; margin-bottom: 25px; border-bottom: 2px solid #e2e8f0; }
    .tab { padding: 14px 24px; background: transparent; border-radius: 12px 12px 0 0; cursor: pointer; font-weight: 600; color: #718096; border: none; }
    .tab.active { color: #667eea; background: white; border-bottom: 3px solid #667eea; }
    .hidden { display: none; }
    .form-group { margin-bottom: 20px; }
    .form-group label { display: block; margin-bottom: 8px; font-weight: 600; color: #2d3748; font-size: 14px; }
    .preview-box { background: #f7fafc; border: 2px solid #e2e8f0; border-radius: 16px; padding: 25px; min-height: 250px; }
    .error { color: #e53e3e; background: #fff5f5; padding: 14px 18px; border-radius: 12px; margin-bottom: 15px; }
    .success { color: #38a169; background: #f0fff4; padding: 14px 18px; border-radius: 12px; margin-bottom: 15px; }
    .hint { color: #718096; font-size: 13px; margin-top: 6px; }
    .day-btn { padding: 12px 20px; border: 2px solid #e2e8f0; background: white; border-radius: 12px; cursor: pointer; font-weight: 600; color: #2d3748; font-size: 14px; }
    .day-btn.active { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-color: #667eea; }
    .empty-state { text-align: center; padding: 40px; color: #a0aec0; }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <div>
        <h1>מתזמן דוא"ל Jet</h1>
        <p>תזמן דוחות דוא"ל מבוססי נתונים יפים מאגם הנתונים שלך</p>
      </div>
    </header>
    <div class="card">
      <h2>✨ צור תצורה חדשה</h2>
      <div class="form-group">
        <label>תווית תצורה</label>
        <input type="text" id="newConfigLabel" placeholder="לדוגמה: דוח מכירות שבועי">
      </div>
      <button class="btn" onclick="createConfig()">צור תצורה</button>
      <div id="createMessage"></div>
    </div>
    <div class="card">
      <h2>📋 תצורות דוא"ל</h2>
      <input type="text" id="searchInput" placeholder="🔍 חפש תצורות..." oninput="loadConfigs()">
      <ul class="config-list" id="configList"></ul>
    </div>
    <div class="card hidden" id="editorCard">
      <h2>✏️ ערוך תצורה: <span id="editingLabel" style="color:#667eea;"></span></h2>
      <div class="tabs">
        <button class="tab active" onclick="showTab('template')">📝 תבנית</button>
        <button class="tab" onclick="showTab('recipients')">👥 נמענים</button>
        <button class="tab" onclick="showTab('schedule')">📅 תזמון</button>
        <button class="tab" onclick="showTab('aggregations')">📊 צבירות</button>
        <button class="tab" onclick="showTab('preview')">👁️ תצוגה מקדימה</button>
      </div>
      <div id="templateTab">
        <div class="form-group">
          <label>תבנית HTML</label>
          <textarea id="templateContent" placeholder="<html><body>תוכן הדוא&quot;ל שלך כאן...</body></html>"></textarea>
          <p class="hint">💡 השתמש ב-{{aggregation.LabelName}} עבור מציינים של צבירות</p>
        </div>
        <button class="btn" onclick="saveTemplate()">שמור תבנית</button>
      </div>
      <div id="recipientsTab" class="hidden">
        <div class="form-group">
          <label>סוג נמענים</label>
          <select id="recipientType" onchange="toggleRecipientFields()">
            <option value="manual">✉️ רשימת דוא"ל ידנית</option>
            <option value="datalake">🗄️ טבלת אגם נתונים</option>
          </select>
        </div>
        <div id="manualFields">
          <div class="form-group">
            <label>כתובות דוא"ל (אחת בכל שורה)</label>
            <textarea id="manualEmails" placeholder="user1@example.com&#10;user2@example.com"></textarea>
          </div>
        </div>
        <div id="datalakeFields" class="hidden">
          <div class="form-group"><label>מסד נתונים</label><input type="text" id="recipientDb" placeholder="users"></div>
          <div class="form-group"><label>טבלה</label><input type="text" id="recipientTable" placeholder="subscribers"></div>
          <div class="form-group"><label>עמודת דוא"ל</label><input type="text" id="recipientColumn" placeholder="email"></div>
        </div>
        <button class="btn" onclick="saveRecipients()">שמור נמענים</button>
      </div>
      <div id="scheduleTab" class="hidden">
        <div class="form-group">
          <label style="display:flex;align-items:center;gap:10px;">
            <input type="checkbox" id="scheduleEnabled" onchange="saveSchedule()" style="width:auto;">
            <span>הפעל תזמון</span>
          </label>
        </div>
        <div id="scheduleFields" class="hidden">
          <h3 style="margin-bottom:15px;color:#2d3748;">בחר ימים</h3>
          <div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:20px;">
            <button class="day-btn" data-day="sunday" onclick="toggleDay('sunday')">ראשון</button>
            <button class="day-btn" data-day="monday" onclick="toggleDay('monday')">שני</button>
            <button class="day-btn" data-day="tuesday" onclick="toggleDay('tuesday')">שלישי</button>
            <button class="day-btn" data-day="wednesday" onclick="toggleDay('wednesday')">רביעי</button>
            <button class="day-btn" data-day="thursday" onclick="toggleDay('thursday')">חמישי</button>
            <button class="day-btn" data-day="friday" onclick="toggleDay('friday')">שישי</button>
            <button class="day-btn" data-day="saturday" onclick="toggleDay('saturday')">שבת</button>
          </div>
          <h3 style="margin-bottom:15px;color:#2d3748;">או בחר תאריכים בחודש</h3>
          <div class="form-group">
            <input type="text" id="datesOfMonth" placeholder="לדוגמה: 1,15,30 (מופרד בפסיקים)">
            <p class="hint">💡 הזן תאריכים בין 1-31, מופרדים בפסיקים</p>
          </div>
          <div class="form-group"><label>שעה</label><input type="time" id="scheduleTime" value="09:00"></div>
          <div class="form-group">
            <label>אזור זמן</label>
            <select id="scheduleTimezone">
              <option value="UTC">UTC</option>
              <option value="Asia/Jerusalem">ישראל (Asia/Jerusalem)</option>
              <option value="America/New_York">ניו יורק (America/New_York)</option>
            </select>
          </div>
          <button class="btn" onclick="saveSchedule()">שמור תזמון</button>
          <div id="scheduleDescription" style="margin-top:20px;padding:15px;background:#f7fafc;border-radius:12px;display:none;">
            <strong>תזמון נוכחי:</strong>
            <p id="scheduleDescText" style="margin-top:8px;color:#2d3748;"></p>
            <p id="scheduleCronText" style="margin-top:8px;color:#718096;font-family:monospace;font-size:13px;"></p>
          </div>
        </div>
      </div>
      <div id="aggregationsTab" class="hidden">
        <div class="form-group"><label>שם עמודה</label><input type="text" id="aggColumn" placeholder="revenue"></div>
        <div class="form-group">
          <label>סוג צבירה</label>
          <select id="aggType">
            <option value="sum">➕ סכום</option>
            <option value="average">📊 ממוצע</option>
            <option value="count">🔢 ספירה</option>
            <option value="min">⬇️ מינימום</option>
            <option value="max">⬆️ מקסימום</option>
          </select>
        </div>
        <div class="form-group"><label>תווית</label><input type="text" id="aggLabel" placeholder="סך הכנסות"></div>
        <button class="btn" onclick="addAggregation()">הוסף צבירה</button>
        <h3 style="margin-top:30px;margin-bottom:15px;color:#2d3748;">צבירות נוכחיות</h3>
        <ul id="aggList" class="config-list"></ul>
      </div>
      <div id="previewTab" class="hidden">
        <button class="btn" onclick="loadPreview()">🚀 צור תצוגה מקדימה</button>
        <div id="previewContent" class="preview-box" style="margin-top:20px;"></div>
      </div>
      <div id="editorMessage" style="margin-top:20px;"></div>
    </div>
  </div>
  <script>
    let currentConfigId = null;
    let selectedDays = [];
    async function loadConfigs() {
      const search = document.getElementById('searchInput').value;
      const url = search ? \`/api/configurations?search=\${encodeURIComponent(search)}\` : '/api/configurations';
      const res = await fetch(url);
      const configs = await res.json();
      const list = document.getElementById('configList');
      if (configs.length === 0) { list.innerHTML = '<li class="empty-state">אין תצורות עדיין. צור אחת למעלה! 🚀</li>'; return; }
      list.innerHTML = configs.map(c => \`<li class="config-item"><div><div class="config-label">\${c.label}</div><div class="config-date">נוצר: \${new Date(c.createdAt).toLocaleString('he-IL')}</div></div><div class="config-actions"><button class="btn" onclick="editConfig('\${c.id}', '\${c.label}')">ערוך</button><button class="btn btn-secondary" onclick="deleteConfig('\${c.id}')">מחק</button></div></li>\`).join('');
    }
    async function createConfig() {
      const label = document.getElementById('newConfigLabel').value;
      if (!label) { showMessage('createMessage', 'אנא הזן תווית', 'error'); return; }
      const res = await fetch('/api/configurations', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ label }) });
      if (res.ok) { document.getElementById('newConfigLabel').value = ''; showMessage('createMessage', '✅ תצורה נוצרה!', 'success'); loadConfigs(); }
      else { const err = await res.json(); showMessage('createMessage', err.error, 'error'); }
    }
    async function editConfig(id, label) {
      currentConfigId = id;
      document.getElementById('editingLabel').textContent = label;
      document.getElementById('editorCard').classList.remove('hidden');
      const res = await fetch(\`/api/configurations/\${id}\`);
      const config = await res.json();
      document.getElementById('templateContent').value = config.template?.content || '';
      loadAggregations();
    }
    async function deleteConfig(id) {
      if (!confirm('למחוק תצורה זו?')) return;
      await fetch(\`/api/configurations/\${id}\`, { method: 'DELETE' });
      loadConfigs();
      if (currentConfigId === id) { document.getElementById('editorCard').classList.add('hidden'); currentConfigId = null; }
    }
    async function saveTemplate() {
      const content = document.getElementById('templateContent').value;
      const res = await fetch(\`/api/configurations/\${currentConfigId}/template\`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ content }) });
      if (res.ok) showMessage('editorMessage', '✅ תבנית נשמרה!', 'success');
      else { const err = await res.json(); showMessage('editorMessage', err.error, 'error'); }
    }
    function toggleRecipientFields() {
      const type = document.getElementById('recipientType').value;
      document.getElementById('manualFields').classList.toggle('hidden', type !== 'manual');
      document.getElementById('datalakeFields').classList.toggle('hidden', type !== 'datalake');
    }
    async function saveRecipients() {
      const type = document.getElementById('recipientType').value;
      let body;
      if (type === 'manual') { const emails = document.getElementById('manualEmails').value.split('\\n').filter(e => e.trim()); body = { type, emails }; }
      else { body = { type, tableReference: { database: document.getElementById('recipientDb').value, table: document.getElementById('recipientTable').value, emailColumn: document.getElementById('recipientColumn').value } }; }
      const res = await fetch(\`/api/configurations/\${currentConfigId}/recipients\`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      if (res.ok) showMessage('editorMessage', '✅ נמענים נשמרו!', 'success');
      else { const err = await res.json(); showMessage('editorMessage', err.error, 'error'); }
    }
    async function addAggregation() {
      const body = { column: document.getElementById('aggColumn').value, type: document.getElementById('aggType').value, label: document.getElementById('aggLabel').value };
      const res = await fetch(\`/api/configurations/\${currentConfigId}/aggregations\`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      if (res.ok) { document.getElementById('aggColumn').value = ''; document.getElementById('aggLabel').value = ''; loadAggregations(); showMessage('editorMessage', '✅ צבירה נוספה!', 'success'); }
      else { const err = await res.json(); showMessage('editorMessage', err.error, 'error'); }
    }
    async function loadAggregations() {
      const res = await fetch(\`/api/configurations/\${currentConfigId}/aggregations\`);
      const aggs = await res.json();
      document.getElementById('aggList').innerHTML = aggs.map(a => \`<li class="config-item"><div><div class="config-label">\${a.label}</div><div class="config-date">\${a.type}(\${a.column}) - השתמש: {{aggregation.\${a.label}}}</div></div></li>\`).join('') || '<li class="empty-state">אין צבירות מוגדרות עדיין</li>';
    }
    async function loadPreview() {
      const res = await fetch(\`/api/configurations/\${currentConfigId}/preview\`);
      const preview = await res.json();
      let html = \`<p><strong>📧 נמענים:</strong> \${preview.recipientCount}</p>\`;
      if (preview.aggregations.length) { html += '<p style="margin-top:15px;"><strong>📊 צבירות:</strong></p><ul style="margin-right:20px;margin-top:10px;">'; preview.aggregations.forEach(a => { html += \`<li style="margin-bottom:5px;">\${a.label}: <strong>\${a.value}</strong></li>\`; }); html += '</ul>'; }
      html += '<hr style="margin:20px 0;border:none;border-top:2px solid #e2e8f0;"><div style="background:white;padding:20px;border-radius:12px;border:2px solid #e2e8f0;">' + preview.renderedHtml + '</div>';
      document.getElementById('previewContent').innerHTML = html;
    }
    function toggleDay(day) {
      const btn = document.querySelector(\`[data-day="\${day}"]\`);
      if (selectedDays.includes(day)) { selectedDays = selectedDays.filter(d => d !== day); btn.classList.remove('active'); }
      else { selectedDays.push(day); btn.classList.add('active'); }
    }
    async function loadSchedule() {
      const res = await fetch(\`/api/configurations/\${currentConfigId}/schedule\`);
      const schedule = await res.json();
      document.getElementById('scheduleEnabled').checked = schedule.enabled;
      document.getElementById('scheduleFields').classList.toggle('hidden', !schedule.enabled);
      document.getElementById('scheduleTime').value = schedule.time;
      document.getElementById('scheduleTimezone').value = schedule.timezone;
      selectedDays = schedule.daysOfWeek || [];
      document.querySelectorAll('.day-btn').forEach(btn => { btn.classList.toggle('active', selectedDays.includes(btn.getAttribute('data-day'))); });
      if (schedule.datesOfMonth?.length > 0) document.getElementById('datesOfMonth').value = schedule.datesOfMonth.join(',');
      if (schedule.enabled) loadScheduleDescription();
    }
    async function saveSchedule() {
      const enabled = document.getElementById('scheduleEnabled').checked;
      document.getElementById('scheduleFields').classList.toggle('hidden', !enabled);
      const datesInput = document.getElementById('datesOfMonth').value;
      const datesOfMonth = datesInput ? datesInput.split(',').map(d => parseInt(d.trim())).filter(d => !isNaN(d)) : [];
      const body = { enabled, daysOfWeek: selectedDays, time: document.getElementById('scheduleTime').value, datesOfMonth, timezone: document.getElementById('scheduleTimezone').value };
      const res = await fetch(\`/api/configurations/\${currentConfigId}/schedule\`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      if (res.ok) { showMessage('editorMessage', '✅ תזמון נשמר!', 'success'); if (enabled) loadScheduleDescription(); }
      else { const err = await res.json(); showMessage('editorMessage', err.error, 'error'); }
    }
    async function loadScheduleDescription() {
      const res = await fetch(\`/api/configurations/\${currentConfigId}/schedule/description\`);
      const data = await res.json();
      document.getElementById('scheduleDescription').style.display = 'block';
      document.getElementById('scheduleDescText').textContent = data.description;
      document.getElementById('scheduleCronText').textContent = data.cron ? \`Cron: \${data.cron}\` : '';
    }
    function showTab(tab) {
      ['template', 'recipients', 'schedule', 'aggregations', 'preview'].forEach(t => { document.getElementById(t + 'Tab').classList.toggle('hidden', t !== tab); });
      document.querySelectorAll('.tab').forEach(el => { el.classList.toggle('active', el.textContent.toLowerCase().includes(tab)); });
      if (tab === 'schedule') loadSchedule();
    }
    function showMessage(id, msg, type) { const el = document.getElementById(id); el.className = type; el.textContent = msg; setTimeout(() => el.textContent = '', 4000); }
    loadConfigs();
  </script>
</body>
</html>`;

app.get('/', (req, res) => {
  res.setHeader('Content-Type', 'text/html');
  res.send(htmlContent);
});

export default (req: VercelRequest, res: VercelResponse) => {
  return app(req, res);
};
