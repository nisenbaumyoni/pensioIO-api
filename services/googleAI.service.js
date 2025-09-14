import { VertexAI } from '@google-cloud/vertexai';
import { loggerService } from './logger.service.js';

// Initialize Vertex with your Cloud project and location
const vertex = new VertexAI({
    project: process.env.GOOGLE_CLOUD_PROJECT,
    location: process.env.GOOGLE_CLOUD_LOCATION || 'us-central1',
});

// Initialize model
const model = 'gemini-pro';

class GoogleAIService {
    constructor() {
        this.generativeModel = vertex.preview.getGenerativeModel({
            model: model,
            generation_config: {
                max_output_tokens: 2048,
                temperature: 0.9,
                top_p: 1
            },
        });
    }

    /**
     * Generate text content using the AI model
     * @param {string} prompt - The input prompt
     * @param {object} options - Additional options for generation
     * @returns {Promise<object>} Generated content
     */
    async generateContent(prompt, options = {}) {
        try {
            loggerService.info(`Generating content with prompt: ${prompt.substring(0, 100)}...`);
            
            const generationConfig = {
                temperature: options.temperature || 0.9,
                top_p: options.topP || 1,
                top_k: options.topK || 40,
                max_output_tokens: options.maxTokens || 2048,
            };

            const result = await this.generativeModel.generateContent(prompt, generationConfig);
            return result.response;
        } catch (error) {
            loggerService.error('Error generating content:', error);
            throw new Error('Failed to generate content: ' + error.message);
        }
    }

    /**
     * Generate content in a chat-like conversation
     * @param {array} messages - Array of message objects with role and content
     * @param {object} options - Additional options for generation
     * @returns {Promise<object>} Generated response
     */
    async chat(messages, options = {}) {
        try {
            loggerService.info('Starting chat interaction');
            
            const chat = this.generativeModel.startChat({
                history: messages.map(msg => ({
                    role: msg.role,
                    content: msg.content
                })),
                generation_config: {
                    temperature: options.temperature || 0.7,
                    top_p: options.topP || 1,
                    top_k: options.topK || 40,
                    max_output_tokens: options.maxTokens || 2048,
                }
            });

            const result = await chat.sendMessage(messages[messages.length - 1].content);
            return result.response;
        } catch (error) {
            loggerService.error('Error in chat interaction:', error);
            throw new Error('Failed in chat interaction: ' + error.message);
        }
    }

    /**
     * Analyze sentiment of text
     * @param {string} text - Text to analyze
     * @returns {Promise<object>} Sentiment analysis results
     */
    async analyzeSentiment(text) {
        try {
            loggerService.info('Analyzing sentiment');
            
            const prompt = `Analyze the sentiment of the following text and return a JSON object with 
                           sentiment (POSITIVE, NEGATIVE, or NEUTRAL) and confidence score (0-1):
                           Text: "${text}"`;

            const result = await this.generateContent(prompt);
            return JSON.parse(result.text());
        } catch (error) {
            loggerService.error('Error analyzing sentiment:', error);
            throw new Error('Failed to analyze sentiment: ' + error.message);
        }
    }

    /**
     * Extract key information from text
     * @param {string} text - Text to analyze
     * @param {array} fields - Array of fields to extract
     * @returns {Promise<object>} Extracted information
     */
    async extractInformation(text, fields) {
        try {
            loggerService.info('Extracting information');
            
            const prompt = `Extract the following information from the text and return as JSON:
                           Fields to extract: ${fields.join(', ')}
                           Text: "${text}"`;

            const result = await this.generateContent(prompt);
            return JSON.parse(result.text());
        } catch (error) {
            loggerService.error('Error extracting information:', error);
            throw new Error('Failed to extract information: ' + error.message);
        }
    }

    /**
     * Summarize text
     * @param {string} text - Text to summarize
     * @param {object} options - Options like length, style
     * @returns {Promise<string>} Summarized text
     */
    async summarize(text, options = {}) {
        try {
            loggerService.info('Generating summary');
            
            const prompt = `Summarize the following text in ${options.length || 'brief'} length 
                           with a ${options.style || 'neutral'} tone:
                           "${text}"`;

            const result = await this.generateContent(prompt);
            return result.text();
        } catch (error) {
            loggerService.error('Error generating summary:', error);
            throw new Error('Failed to generate summary: ' + error.message);
        }
    }
}

// Create and export singleton instance
export const googleAIService = new GoogleAIService();
