let mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/hour_manages', {useNewUrlParser: true, useUnifiedTopology: true});
let Schema = mongoose.Schema;
let db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

let statusSchema = new Schema({
    name:  String,
    nickname: String,
    min_mandatory_hour: Number,
    max_mandatory_hour : Number,
    min_additional_hour: Number,
    max_additional_hour: Number
},{ timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });
statusSchema.virtual('num_teachers', {
    ref: 'Teacher',
    localField: '_id',
    foreignField: 'status',
    count: true
});

let Status = mongoose.model('Status', statusSchema);

module.exports = Status;