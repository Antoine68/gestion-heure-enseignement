let mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/hour_manages', {useNewUrlParser: true, useUnifiedTopology: true});
let Schema = mongoose.Schema;
let db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

let projectSchema = new Schema({
    title:  String,
    start_year: Number,
    end_year: Number,
    archived: {type: Boolean, default: false},
},{ timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });
projectSchema.virtual('speakers', {
    ref: 'Speaker',
    localField: '_id',
    foreignField: 'project',
    justOne: false

});
projectSchema.virtual('formations', {
    ref: 'Formation',
    localField: '_id',
    foreignField: 'project',
    justOne: false

})
let Project = mongoose.model('Project', projectSchema);

module.exports = Project; 