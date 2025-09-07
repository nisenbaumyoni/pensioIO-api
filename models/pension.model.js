import mongoose from 'mongoose';

const pensionSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: String,
    dateOfBirth: Date,
    employmentStatus: String,
    numberOfChildren: Number,
    married: Boolean,
    address: String,
    profession: String,
    placeOfWork: String,
    currentIncome: Number
}, { timestamps: true });

export const Pension = mongoose.model('Pension', pensionSchema);
