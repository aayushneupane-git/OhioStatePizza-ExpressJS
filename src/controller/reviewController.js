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

// UPDATE a review
exports.updateReview = async (req, res, next) => {
  try {
    const review = await Review.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    res.json(review);
  } catch (error) {
    next(error);
  }
};
// DELETE a review
exports.deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    next(error);
  }
};


