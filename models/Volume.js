let mongoose = require('mongoose');
let tree = require('mongoose-data-tree'); 
mongoose.connect('mongodb://localhost:27017/hour_manages', {useNewUrlParser: true, useUnifiedTopology: true});
let Schema = mongoose.Schema;
let db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

let volumeSchema = new Schema({
    pedagogical_element: { type: Schema.Types.ObjectId, ref: 'PedagogicalElement' },
    speaker: { type: Schema.Types.ObjectId, ref: 'Speaker' },
},{ timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });
let Volume = mongoose.model('Volume', volumeSchema);

let weeklyVolumeSchema = new Schema({
    week: Number,
    hour: {
        CM : Number,
        TP: Number,
        TD: Number,
        PARTIEL: Number
    }
});
let WeeklyVolume = Volume.discriminator('WeeklyVolume', weeklyVolumeSchema);

let globalVolumeSchema = new Schema({
    volume: {
        CM : Number,
        TP: Number,
        TD: Number,
        PARTIEL: Number
    }
});
let GlobalVolume = Volume.discriminator('GlobalVolume', globalVolumeSchema);

module.exports = {Volume, WeeklyVolume, GlobalVolume};
