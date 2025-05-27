const Review = require('../models/reviewModel');

// GET all reviews
exports.getReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find();
    res.json(reviews);
  } catch (error) {
    next(error);
  }
};

// POST a new review
exports.createReview = async (req, res, next) => {
  try {
    const { name, position, company, message, avatar, featured } = req.body;

    const review = await Review.create({
      name,
      position,
      company,
      message,
      avatar,
      featured
    });

    res.status(201).json(review);
  } catch (error) {
    next(error);
  }
};
