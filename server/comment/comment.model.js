const mongoose = require('mongoose');

/**
 * Comment Schema
 */
const CommentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true,
  },
  article: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'article',
    required: true,
  },
  value: {
    type: String,
    required: true,
  },
  updated: {
    type: Date,
    default: Date.now,
  },
  // subcomments: [SubComment]
});

/**
 * Add your
 * - pre-save hooks
 * - validations
 * - virtuals
 */

// eslint-disable-next-line
// CommentSchema.pre('save', function(next) {});

/**
 * Methods
 */
CommentSchema.method({
  /**
   * To JSON
   */
  // toJSON() {},
});

/**
 * Statics
 */
CommentSchema.statics = {
  /**
   * Get list of comments by article
   */
  getByArticle(id) {
    return this.find({ article: id })
      .populate('user')
      .then(comments => comments);
  },
};

/**
 * @typedef comment
 */
module.exports = mongoose.model('comment', CommentSchema);
