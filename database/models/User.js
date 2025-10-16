import mongoose, { Schema } from "mongoose";




const UserSchema = new Schema ({
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true,
    },
    roles: [
        {
            type: String,
            default: "Customer",
        }
    ],
    active: {
        type: Boolean,
        default: true,
    }
})



export const User = mongoose.model ("User", UserSchema);

