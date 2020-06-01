let mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/hour_manages', {useNewUrlParser: true, useUnifiedTopology: true});
let Schema = mongoose.Schema;
let db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

let formationSchema = new Schema({
    name:  String,
    nickname: String,
    project: { type: Schema.Types.ObjectId, ref: 'Project' },
},{ timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });
formationSchema.virtual('element', {
    ref: 'PedagogicalElement',
    localField: '_id',
    foreignField: 'formation',
    justOne: true

})
let Formation = mongoose.model('Formation', formationSchema);

module.exports = Formation;