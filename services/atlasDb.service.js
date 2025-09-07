import mongoose from 'mongoose';
import { loggerService } from './logger.service.js';

async function connectDB() {
    loggerService.info('Checking MongoDB connection status...');
    try {
        if (mongoose.connection.readyState === 0) {
            let uri = process.env.MONGODB_URI;
            if (!uri) throw new Error('Missing MongoDB URI in environment variables');
            
            // Remove any trailing colons and validate URI format
            uri = uri.replace(/:$/, '');
            if (!uri.startsWith('mongodb://') && !uri.startsWith('mongodb+srv://')) {
                throw new Error('Invalid MongoDB URI format. Must start with "mongodb://" or "mongodb+srv://"');
            }
            
            loggerService.info('Connecting to MongoDB Atlas...');            
            loggerService.debug(`MongoDB URI: ${uri}`); // Mask credentials in logs

            await mongoose.connect(uri, {
                useNewUrlParser: true,
                useUnifiedTopology: true
            });
            
            console.log('Connected to MongoDB Atlas');
        }
    } catch (err) {
        console.error('Failed to connect to MongoDB:', err);
        throw err;
    }
}

export const atlasDbService = {
    // Create one document
    async create(model, doc) {
        try {
            await connectDB();
            const document = new model(doc);
            await document.save();
            return document;
        } catch (err) {
            console.error(`Error creating document in ${model.modelName}:`, err);
            throw err;
        }
    },

    // Create multiple documents
    async createMany(model, docs) {
        try {
            await connectDB();
            const result = await model.insertMany(docs);
            return result;
        } catch (err) {
            console.error(`Error creating documents in ${model.modelName}:`, err);
            throw err;
        }
    },

    // Get a single document by ID
    async getById(model, id) {
        try {
            await connectDB();
            const doc = await model.findById(id);
            return doc;
        } catch (err) {
            console.error(`Error getting document by ID from ${model.modelName}:`, err);
            throw err;
        }
    },

    // Get documents by query with pagination
    async query(model, filterBy = {}, options = {}) {
        try {
            await connectDB();
            const {
                sort = {},
                page = 1,
                limit = 20,
                select = '',
                populate = ''
            } = options;

            const skip = (page - 1) * limit;
            const query = model.find(filterBy)
                            .sort(sort)
                            .skip(skip)
                            .limit(limit);

            if (select) query.select(select);
            if (populate) query.populate(populate);

            const [docs, total] = await Promise.all([
                query.exec(),
                model.countDocuments(filterBy)
            ]);

            return {
                docs,
                total,
                page,
                pages: Math.ceil(total / limit)
            };
        } catch (err) {
            console.error(`Error querying documents from ${model.modelName}:`, err);
            throw err;
        }
    },

    // Update a single document
    async update(model, id, update) {
        try {
            await connectDB();
            const doc = await model.findByIdAndUpdate(
                id,
                update,
                { new: true, runValidators: true }
            );
            return doc;
        } catch (err) {
            console.error(`Error updating document in ${model.modelName}:`, err);
            throw err;
        }
    },

    // Update multiple documents
    async updateMany(model, filter, update) {
        try {
            await connectDB();
            const result = await model.updateMany(filter, update, { runValidators: true });
            return result.modifiedCount;
        } catch (err) {
            console.error(`Error updating documents in ${model.modelName}:`, err);
            throw err;
        }
    },

    // Delete a single document
    async remove(model, id) {
        try {
            await connectDB();
            const doc = await model.findByIdAndDelete(id);
            return doc;
        } catch (err) {
            console.error(`Error removing document from ${model.modelName}:`, err);
            throw err;
        }
    },

    // Delete multiple documents
    async removeMany(model, filter) {
        try {
            await connectDB();
            const result = await model.deleteMany(filter);
            return result.deletedCount;
        } catch (err) {
            console.error(`Error removing documents from ${model.modelName}:`, err);
            throw err;
        }
    },

    // Aggregate documents
    async aggregate(model, pipeline) {
        try {
            await connectDB();
            const docs = await model.aggregate(pipeline);
            return docs;
        } catch (err) {
            console.error(`Error aggregating documents in ${model.modelName}:`, err);
            throw err;
        }
    },

    // Get distinct values
    async distinct(model, field, filter = {}) {
        try {
            await connectDB();
            const values = await model.distinct(field, filter);
            return values;
        } catch (err) {
            console.error(`Error getting distinct values from ${model.modelName}:`, err);
            throw err;
        }
    }
};
