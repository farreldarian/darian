import { Address } from 'viem'

export const Routes = {
  auth: {
    signIn: '/signin',
    verifyRequest: '/verify-request',
  },
  doxxing: {
    base: '/doxxing',
    account(address: Address) {
      return `${this.base}/${address}`
    },
  },
}
