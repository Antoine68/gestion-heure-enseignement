let mongoose = require('mongoose');
let tree = require('mongoose-data-tree'); 
mongoose.connect('mongodb://localhost:27017/hour_manages', {useNewUrlParser: true, useUnifiedTopology: true});
let Schema = mongoose.Schema;
let db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

let buildingElementSchema = new Schema({
    title:  String,
    nickname: String,
    reference: String,
    order: Number,
    decomposition: { type: Schema.Types.ObjectId, ref: 'Decomposition' },
    hour_volume: {
        CM : Number,
        TP: Number,
        TD: Number,

    }
},{ timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });
buildingElementSchema.plugin(tree);
let BuildingElement = mongoose.model('BuildingElement', buildingElementSchema);

module.exports = BuildingElement;
