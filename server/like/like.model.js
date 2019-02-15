const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * Like Schema
 */
const LikeSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'user',
    required: true,
  },
  article: {
    type: Schema.Types.ObjectId,
    ref: 'article',
    required: true,
  },
  updated: {
    type: Date,
    default: Date.now,
  },
});

/**
 * Add your
 * - pre-save hooks
 * - validations
 * - virtuals
 */

/**
 * Methods
 */
LikeSchema.method({});

/**
 * Statics
 */
LikeSchema.statics = {
  /**
   * Get number of likes by article
   */
  getByArticle(id) {
    return this.count({ article: id })
      .exec()
      .then(count => count);
  },
};

/**
 * @typedef like
 */
module.exports = mongoose.model('like', LikeSchema);
