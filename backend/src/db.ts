import mongoose, { model, Schema } from "mongoose";




const UserSchema = new Schema({
    username : { type: String, unique: true, required: true},
    password : { type: String, required: true},
    email : { type: String, unique: true, required: true}
});

const ContentSchema = new Schema({
    title: {type:String, required: true, trim: true},
    link: {type:String, required: true, trim: true},
    type: {type: String, required: true, enum: ["youtube", "twitter"] },
    tags: [{type: mongoose.Types.ObjectId, ref: 'Tag'}],
    userId: {type: mongoose.Types.ObjectId, ref: 'User', required: true}
    

});

const TagSchema = new Schema({
    title: { type: String, unique: true, trim: true, lowercase: true }
});

const LinkSchema = new Schema({
    hash: {type: String, required: true, unique: true},
    userId: {type: mongoose.Types.ObjectId, ref: 'User', required: true , unique: true}
})

export const UserModel = model("User", UserSchema);
export const ContentModel = model("Content", ContentSchema);
export const TagModel = model("Tag", TagSchema);
export const LinkModel = model("Link", LinkSchema);