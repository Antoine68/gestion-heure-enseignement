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
    input_type: String,
    order: Number,
    forfait : {
        TP: Number,
        TD: Number,
        CM: Number,
        PARTIEL: Number
    },
    number_groups : {
        TP: Number,
        TD: Number,
        CM: Number,
        PARTIEL: Number
    },
    courses_types: {
        TP: Boolean,
        TD: Boolean,
        CM: Boolean,
        PARTIEL: Boolean
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
