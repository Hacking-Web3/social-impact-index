import { usePublicRecord } from '@self.id/framework'

function ShowProfileName({ did }) {
  const record = usePublicRecord('basicProfile', did)

  const text = record.isLoading
    ? 'Loading...'
    : record.content
    ? `Hello ${record.content.name || 'stranger'}`
    : 'No profile to load'
  return <p>{text}</p>
}

export default ShowProfileName;
