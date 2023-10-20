import { Address } from 'viem'

export const Routes = {
  doxxing: {
    base: '/doxxing',
    account(address: Address) {
      return `${this.base}/${address}`
    },
  },
}
