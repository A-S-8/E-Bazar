import asyncHandler from 'express-async-handler'
import Bank from '../models/bankModel.js'
import User from '../models/userModel.js'

const getbalance = asyncHandler(async (req, res) => {
  //   const { name, email, password, bankAccount } = req.body;

  const userId = req.params.id

  // console.log('get balance calls', userId)

  const user = await User.findById(userId)
  //   const userExists = await User.findOne({ email });

  //   if (userExists) {
  const bankAccount = await Bank.findOne({ bankAccount: user.bankAccount })

  // console.log('get balance bankaccount', bankAccount)

  if (bankAccount) {
    res.status(200).json({
      balance: bankAccount.balance,
    })
  } else {
    res.status(400)
    throw new Error('Invalid user data')
  }
})

const transferAmount = asyncHandler(async (req, res) => {
  console.log('transfer amount callss', req.user)
  const userId = req.body.userId
  const vendorId = req.body.vendorId
  const amount = req.body.amount

  const user = await User.findById(userId)

  // console.log(userId, user, amount, 'ddfdf')

  const superUser = await User.findOne({ isSuperAdmin: true })
  const convertedSuperUser = superUser.toObject({
    getters: true,
  })

  // console.log('super user', superUser, convertedSuperUser)

  const superId = convertedSuperUser.id

  // console.log('before equal', userId, superId)
  if (userId !== superId) {
    // console.log('not equal')
    const bankAccount = await Bank.findOne({ bankAccount: user.bankAccount })
    bankAccount.balance = bankAccount.balance - amount
    await bankAccount.save()

    const superBankAccount = await Bank.findOne({
      bankAccount: superUser.bankAccount,
    })
    superBankAccount.balance = superBankAccount.balance + amount
    await superBankAccount.save()

    res.status(200).json({
      message: 'done',
    })
  } else {
    // console.log('same')
    const vender = await User.findById(vendorId)

    const bankAccount = await Bank.findOne({ bankAccount: vender.bankAccount })
    bankAccount.balance = bankAccount.balance + amount
    await bankAccount.save()

    const superBankAccount = await Bank.findOne({
      bankAccount: superUser.bankAccount,
    })
    superBankAccount.balance = superBankAccount.balance - amount
    await superBankAccount.save()
    res.status(200).json({
      message: 'done',
    })
  }
})

export { getbalance, transferAmount }
