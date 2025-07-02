const comboSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: String,
    price: { type: Number, required: true },
    items: [
      {
        item: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "MenuItem",
          required: true,
        },
        toppings: [
          {
            name: { type: String, required: true },
            extraPrice: { type: Number, default: 0 },
          },
        ],
      },
    ],
    isSpecial: { type: Boolean, default: false },
    image: String,
  },
  { timestamps: true }
);
