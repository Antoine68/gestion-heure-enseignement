let mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/hour_manages', {useNewUrlParser: true, useUnifiedTopology: true});
let Schema = mongoose.Schema;
let db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

let groupTeacherSchema = new Schema({
    pedagogical_element: { type: Schema.Types.ObjectId, ref: 'PedagogicalElement' },
    speaker: { type: Schema.Types.ObjectId, ref: 'Speaker' },
    week: Number,
    group_number: {
        TP: Number,
        TD: Number,
        CM: Number,
        PARTIEL: Number
    }
},{ timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });
let GroupTeacher = mongoose.model('GroupTeacher', groupTeacherSchema);

module.exports = GroupTeacher;
