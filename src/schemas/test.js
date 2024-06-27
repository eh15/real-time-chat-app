const { Schema, model } = require("mongoose");

let test = new Schema({
    task: String,
    description: String,
    date: String
});

module.exports = model("testschema1", test);