const mongoose = require("mongoose");

// Schema for each selectable item in a group
const optionItemSchema = new mongoose.Schema(
  {
    label: String,
    priceModifier: Number
  },
  { _id: false }
);

// Schema for each group of options (e.g., sizes, addOns, etc.)
const optionGroupSchema = new mongoose.Schema(
  {
    isMultiple: { type: Boolean, required: true },
    values: [optionItemSchema]
  },
  { _id: false }
);

// Complete options schema
const optionsSchema = new mongoose.Schema(
  {
    sizes: optionGroupSchema,
    addOns: optionGroupSchema,
    crusts: optionGroupSchema,
    sauces: optionGroupSchema,
    meats: optionGroupSchema,
    veggies: optionGroupSchema,
    dips: optionGroupSchema,
    flavors: optionGroupSchema,
    extras: optionGroupSchema
  },
  { _id: false }
);

// Menu item schema
const menuItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  category: String,
  price: Number,
  availabilityByStore: {
    type: Map,
    of: {
      type: String,
      enum: ["Available", "Unavailable"],
      default: "Available"
    },
    default: {}
  },
  options: {
    type: optionsSchema,
    default: {}
  },
  image: {
    data: Buffer,
    contentType: String
  }
});

module.exports = mongoose.model("MenuItem", menuItemSchema);
