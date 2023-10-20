import { Address } from 'viem'

type Props = {
  params: { account: Address }
}

export default function Page(props: Props) {
  return <main>{props.params.account}</main>
}
