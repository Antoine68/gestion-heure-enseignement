let mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/hour_manages', {useNewUrlParser: true, useUnifiedTopology: true});
let Schema = mongoose.Schema;
let db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

let decompositionSchema = new Schema({
    name:  String,
    nickname: String,
},{ timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }, { toJSON: { virtuals: true } });
decompositionSchema.virtual('element', {
    ref: 'BuildingElement',
    localField: '_id',
    foreignField: 'decomposition',
    justOne: true

})
let Decomposition = mongoose.model('Decomposition', decompositionSchema);

module.exports = Decomposition;