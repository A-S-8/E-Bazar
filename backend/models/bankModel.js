import mongoose from 'mongoose'

const bankSchema = mongoose.Schema(
  {
    accountId: {
      type: String,
      required: true,
    },
    bankAccount: {
      type: String,
      required: true,
    },

    balance: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
)

const Product = mongoose.model('Bank', bankSchema)

export default Product
