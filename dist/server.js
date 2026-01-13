"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const services_1 = require("./services");
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.static(path_1.default.join(__dirname, 'public')));
// Initialize services
const templateService = new services_1.TemplateService();
const recipientService = new services_1.RecipientService();
const reportService = new services_1.ReportService();
const aggregationService = new services_1.AggregationService();
const previewService = new services_1.PreviewService(recipientService, aggregationService);
const configService = new services_1.ConfigurationService(templateService, recipientService, reportService, aggregationService);
// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});
// Configuration endpoints
app.post('/api/configurations', (req, res) => {
    try {
        const { label } = req.body;
        const config = configService.createConfiguration(label);
        res.status(201).json(config);
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});
app.get('/api/configurations', (req, res) => {
    const { search } = req.query;
    const configs = search
        ? configService.searchConfigurations(search)
        : configService.listConfigurations();
    res.json(configs);
});
app.get('/api/configurations/:id', (req, res) => {
    try {
        const config = configService.getConfiguration(req.params.id);
        res.json(config);
    }
    catch (error) {
        res.status(404).json({ error: error.message });
    }
});
app.put('/api/configurations/:id', (req, res) => {
    try {
        const config = configService.updateConfiguration(req.params.id, req.body);
        res.json(config);
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});
app.delete('/api/configurations/:id', (req, res) => {
    try {
        configService.deleteConfiguration(req.params.id);
        res.status(204).send();
    }
    catch (error) {
        res.status(404).json({ error: error.message });
    }
});
// Airflow export
app.get('/api/configurations/:id/airflow', (req, res) => {
    try {
        const airflowConfig = configService.exportForAirflow(req.params.id);
        res.json(airflowConfig);
    }
    catch (error) {
        res.status(404).json({ error: error.message });
    }
});
// Template endpoints
app.put('/api/configurations/:id/template', (req, res) => {
    try {
        const { content } = req.body;
        const configId = req.params.id;
        // Get the configuration
        const config = configService.getConfiguration(configId);
        // Update the template
        const updatedTemplate = templateService.updateTemplate(config.template.id, content);
        // Update the configuration with the new template
        const updatedConfig = configService.updateConfiguration(configId, {
            template: updatedTemplate
        });
        res.json(updatedTemplate);
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});
// Recipient endpoints
app.put('/api/configurations/:id/recipients', (req, res) => {
    try {
        const { type, emails, tableReference } = req.body;
        let config;
        if (type === 'manual') {
            config = recipientService.setManualRecipients(req.params.id, emails);
        }
        else {
            config = recipientService.setDatalakeRecipients(req.params.id, tableReference);
        }
        res.json(config);
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});
// Aggregation endpoints
app.post('/api/configurations/:id/aggregations', (req, res) => {
    try {
        const aggregation = aggregationService.addAggregation(req.params.id, req.body);
        res.status(201).json(aggregation);
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});
app.get('/api/configurations/:id/aggregations', (req, res) => {
    const aggregations = aggregationService.getAggregations(req.params.id);
    res.json(aggregations);
});
// Preview endpoint
app.get('/api/configurations/:id/preview', async (req, res) => {
    try {
        const config = configService.getConfiguration(req.params.id);
        const preview = await previewService.generatePreview(config);
        res.json(preview);
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});
const PORT = 3002;
app.listen(PORT, () => {
    console.log(`Jet Email Scheduler running on http://localhost:${PORT}`);
});
//# sourceMappingURL=server.js.map