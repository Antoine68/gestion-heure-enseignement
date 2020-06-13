let mongoose = require('mongoose');
let tree = require('mongoose-data-tree'); 
mongoose.connect('mongodb://localhost:27017/hour_manages', {useNewUrlParser: true, useUnifiedTopology: true});
let Schema = mongoose.Schema;
let db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

let pedagogicalElementSchema = new Schema({
    title: String,
    nickname: String,
    reference: String,
    formation : { type: Schema.Types.ObjectId, ref: 'Formation' },
    project : {type: Schema.Types.ObjectId, ref: 'Project'},
    buildingElement: { type: Schema.Types.ObjectId, ref: 'BuildingElement' },
    input_type: {type: String, default: "aucun"},
    order: Number,
    forfait : {
        TP: {type: Number, default: 0},
        TD: {type: Number, default: 0},
        CM: {type: Number, default: 0},
        PARTIEL: {type: Number, default: 0}
    },
    number_groups : {
        TP: {type: Number, default: 1},
        TD: {type: Number, default: 1},
        CM: {type: Number, default: 1},
        PARTIEL: {type: Number, default: 1}
    },
    courses_types: {
        TP: {type: Boolean, default: true},
        TD: {type: Boolean, default: true},
        CM: {type: Boolean, default: true},
        PARTIEL: {type: Boolean, default: true}
    },
    hour_volume: {
        CM : Number,
        TP: Number,
        TD: Number,
    },
    __t: String,
    week: Number,
    interventions : [
        {type: Schema.Types.ObjectId, ref: 'Speaker'}
    ]
},{ timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });
pedagogicalElementSchema.plugin(tree);
pedagogicalElementSchema.virtual('volumes', {
    ref: 'Volume',
    localField: '_id',
    foreignField: 'pedagogical_element',
    justOne: false

});
pedagogicalElementSchema.virtual('groups_teachers', {
    ref: 'GroupTeacher',
    localField: '_id',
    foreignField: 'pedagogical_element',
    justOne: false

})
let PedagogicalElement = mongoose.model('PedagogicalElement', pedagogicalElementSchema);

/*let pedagogicalPeriodSchema = new Schema({
    week: Number
});
let PedagogicalPeriod = PedagogicalElement.discriminator('PedagogicalPeriod', pedagogicalPeriodSchema);*/

module.exports = PedagogicalElement;
