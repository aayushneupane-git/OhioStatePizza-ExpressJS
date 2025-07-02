const mongoose = require('mongoose');

const toppingSchema = new mongoose.Schema({
  name: { type: String, required: true },
  extraPrice: { type: Number, default: 0 }
}, { _id: false });

const comboItemSchema = new mongoose.Schema({
  item: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem', required: true },
  toppings: [toppingSchema]
}, { _id: false });

const comboSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  price: { type: Number, required: true },
  items: [comboItemSchema],
  isSpecial: { type: Boolean, default: false },
  image: String,
}, { timestamps: true });

// ✅ Automatically populate items.item everywhere
comboSchema.pre(/^find/, function (next) {
  this.populate("items.item");
  next();
});

const Specials = mongoose.model('Combo', comboSchema);
module.exports = Specials;
