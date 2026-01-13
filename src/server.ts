import express, { Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import {
  TemplateService,
  RecipientService,
  ReportService,
  AggregationService,
  PreviewService,
  ConfigurationService,
  ScheduleService,
} from './services';

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Initialize services
const templateService = new TemplateService();
const recipientService = new RecipientService();
const reportService = new ReportService();
const aggregationService = new AggregationService();
const previewService = new PreviewService(recipientService, aggregationService);
const scheduleService = new ScheduleService();
const configService = new ConfigurationService(templateService, recipientService, reportService, aggregationService);

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

// Configuration endpoints
app.post('/api/configurations', (req: Request, res: Response) => {
  try {
    const { label } = req.body;
    const config = configService.createConfiguration(label);
    res.status(201).json(config);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

app.get('/api/configurations', (req: Request, res: Response) => {
  const { search } = req.query;
  const configs = search
    ? configService.searchConfigurations(search as string)
    : configService.listConfigurations();
  res.json(configs);
});

app.get('/api/configurations/:id', (req: Request, res: Response) => {
  try {
    const config = configService.getConfiguration(req.params.id as string);
    res.json(config);
  } catch (error) {
    res.status(404).json({ error: (error as Error).message });
  }
});

app.put('/api/configurations/:id', (req: Request, res: Response) => {
  try {
    const config = configService.updateConfiguration(req.params.id as string, req.body);
    res.json(config);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

app.delete('/api/configurations/:id', (req: Request, res: Response) => {
  try {
    configService.deleteConfiguration(req.params.id as string);
    res.status(204).send();
  } catch (error) {
    res.status(404).json({ error: (error as Error).message });
  }
});

// Airflow export
app.get('/api/configurations/:id/airflow', (req: Request, res: Response) => {
  try {
    const airflowConfig = configService.exportForAirflow(req.params.id as string);
    res.json(airflowConfig);
  } catch (error) {
    res.status(404).json({ error: (error as Error).message });
  }
});

// Template endpoints
app.put('/api/configurations/:id/template', (req: Request, res: Response) => {
  try {
    const { content } = req.body;
    const configId = req.params.id as string;
    
    // Get the configuration
    const config = configService.getConfiguration(configId);
    
    // Update the template
    const updatedTemplate = templateService.updateTemplate(config.template.id, content);
    
    // Update the configuration with the new template
    const updatedConfig = configService.updateConfiguration(configId, {
      template: updatedTemplate
    });
    
    res.json(updatedTemplate);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

// Recipient endpoints
app.put('/api/configurations/:id/recipients', (req: Request, res: Response) => {
  try {
    const { type, emails, tableReference } = req.body;
    let config;
    if (type === 'manual') {
      config = recipientService.setManualRecipients(req.params.id as string, emails);
    } else {
      config = recipientService.setDatalakeRecipients(req.params.id as string, tableReference);
    }
    res.json(config);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

// Aggregation endpoints
app.post('/api/configurations/:id/aggregations', (req: Request, res: Response) => {
  try {
    const aggregation = aggregationService.addAggregation(req.params.id as string, req.body);
    res.status(201).json(aggregation);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

app.get('/api/configurations/:id/aggregations', (req: Request, res: Response) => {
  const aggregations = aggregationService.getAggregations(req.params.id as string);
  res.json(aggregations);
});

// Preview endpoint
app.get('/api/configurations/:id/preview', async (req: Request, res: Response) => {
  try {
    const config = configService.getConfiguration(req.params.id as string);
    const preview = await previewService.generatePreview(config);
    res.json(preview);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

// Schedule endpoints
app.get('/api/configurations/:id/schedule', (req: Request, res: Response) => {
  try {
    const schedule = scheduleService.getSchedule(req.params.id as string);
    if (!schedule) {
      // Create default schedule if none exists
      const newSchedule = scheduleService.createSchedule(req.params.id as string);
      res.json(newSchedule);
    } else {
      res.json(schedule);
    }
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

app.put('/api/configurations/:id/schedule', (req: Request, res: Response) => {
  try {
    const configId = req.params.id as string;
    
    // Ensure schedule exists
    let schedule = scheduleService.getSchedule(configId);
    if (!schedule) {
      schedule = scheduleService.createSchedule(configId);
    }
    
    // Update schedule
    const updated = scheduleService.updateSchedule(configId, req.body);
    res.json(updated);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

app.get('/api/configurations/:id/schedule/description', (req: Request, res: Response) => {
  try {
    const schedule = scheduleService.getSchedule(req.params.id as string);
    if (!schedule) {
      res.json({ description: 'לא מוגדר' });
    } else {
      const description = scheduleService.getScheduleDescription(schedule);
      const cron = scheduleService.toCronExpression(schedule);
      res.json({ description, cron });
    }
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

const PORT = process.env.PORT || 3002;

// Only start server if not in Vercel environment
if (process.env.VERCEL !== '1') {
  app.listen(PORT, () => {
    console.log(`Jet Email Scheduler running on http://localhost:${PORT}`);
  });
}

// Export for Vercel
export default app;
