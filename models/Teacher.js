let mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/hour_manages', {useNewUrlParser: true, useUnifiedTopology: true});
let Schema = mongoose.Schema;
let db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

let teacherSchema = new Schema({
    first_name:  String,
    last_name: String,
    nickname: String,
    email: String,
    status : {type: mongoose.Schema.Types.ObjectId, ref : 'Status'}
},{ timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

let Teacher = mongoose.model('Teacher', teacherSchema);

module.exports = Teacher;