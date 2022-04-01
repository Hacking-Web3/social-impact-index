import { useConnection } from '@self.id/framework'
import UserProfile from "@/components/UserProfile";

function ConnectButton() {
  const [connection, connect, disconnect] = useConnection()
  console.log(connection);

  return connection.status === 'connected' ? (
    <div>
      <UserProfile did={connection.status === 'connected' && connection.selfID.id}/>
    <button
      onClick={() => {
        disconnect()
      }}>
      Disconnect ({connection.selfID.id})
    </button>
  </div>
  ) : 'ethereum' in window ? (
    <button
      disabled={connection.status === 'connecting'}
      onClick={() => {
        connect()
      }}>
      Connect
    </button>
  ) : (
    <p>
      An injected Ethereum provider such as{' '}
      <a href="https://metamask.io/">MetaMask</a> is needed to authenticate.
    </p>
  )
}

export default ConnectButton;
