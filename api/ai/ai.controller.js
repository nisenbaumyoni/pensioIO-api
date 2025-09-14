import { googleAIService } from '../../services/googleAI.service.js';
import { loggerService } from '../../services/logger.service.js';

export async function generateContent(req, res) {
    try {
        const { prompt, options } = req.body;
        const result = await googleAIService.generateContent(prompt, options);
        res.json(result);
    } catch (error) {
        loggerService.error('Failed to generate content:', error);
        res.status(500).json({ error: 'Failed to generate content' });
    }
}

export async function chat(req, res) {
    try {
        const { messages, options } = req.body;
        const result = await googleAIService.chat(messages, options);
        res.json(result);
    } catch (error) {
        loggerService.error('Failed in chat interaction:', error);
        res.status(500).json({ error: 'Failed in chat interaction' });
    }
}

export async function analyzeSentiment(req, res) {
    try {
        const { text } = req.body;
        const result = await googleAIService.analyzeSentiment(text);
        res.json(result);
    } catch (error) {
        loggerService.error('Failed to analyze sentiment:', error);
        res.status(500).json({ error: 'Failed to analyze sentiment' });
    }
}

export async function extractInformation(req, res) {
    try {
        const { text, fields } = req.body;
        const result = await googleAIService.extractInformation(text, fields);
        res.json(result);
    } catch (error) {
        loggerService.error('Failed to extract information:', error);
        res.status(500).json({ error: 'Failed to extract information' });
    }
}

export async function summarize(req, res) {
    try {
        const { text, options } = req.body;
        const result = await googleAIService.summarize(text, options);
        res.json(result);
    } catch (error) {
        loggerService.error('Failed to generate summary:', error);
        res.status(500).json({ error: 'Failed to generate summary' });
    }
}
