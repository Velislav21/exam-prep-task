import { Schema, model, Types } from "mongoose";

const gameSchema = new Schema({
    name: {
        type: String,
        required: true,
        minLength: 4,
    },
    image: {
        type: String,
        required: true,
        // validate: /^https?:\/\//
    },
    price: {
        type: Number,
        required: true,
        min: 0,
    },
    description: {
        type: String,
        required: true,
        minLength: 10,
    },
    genre: {
        type: String,
        required: true,
        minLength: 2
    },
    platform: {
        type: String,
        enum: ['PC', 'Nintendo', 'PS4', 'PS5', 'XBOX'],
        required: true,
    },
    boughtBy: {
        type: [], // should have types.Object Id
        ref: 'User',
    },
    owner: {
        type: Types.ObjectId,
        ref: 'User'
    }
})

const Game = model('Game', gameSchema);

export {
    Game

}