let mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/hour_manages', {useNewUrlParser: true, useUnifiedTopology: true});
let Schema = mongoose.Schema;
let db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

let speakerSchema = new Schema({
    project: { type: Schema.Types.ObjectId, ref: 'Project' },
    teacher: { type: Schema.Types.ObjectId, ref: 'Teacher' },
    min_mandatory_hour: Number,
    max_mandatory_hour : Number,
    min_additional_hour: Number,
    max_additional_hour: Number,
},{ timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });
let Speaker = mongoose.model('Speaker', speakerSchema);

module.exports = Speaker;