import mongoose from "mongoose";


const fileSchema = new mongoose.Schema({
    title : {
        type : String,
        required : true,
    },
    author : {
        type : String,
        required : true,
    },
   
    desc : {
        type : String,
        required : true
    },
    language : {
        type : String,
        required : true
    },
    fileUrl : {
        type : String
    }
})



const File_ = new mongoose.model('File_', fileSchema);
export default File_;