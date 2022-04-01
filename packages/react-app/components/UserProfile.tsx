import { usePublicRecord } from '@self.id/framework'

function ShowProfileName({ did, selfId }) {

  const saveMe = async (event) => {
    event.preventDefault();
    selfId.set('basicProfile', { name: 'Alice' });
  }

  const record = usePublicRecord('basicProfile', did)

  const text = record.isLoading
    ? 'Loading...'
    : record.content
    ? `Hello ${record.content.name || 'stranger'}`
    : 'No profile to load'
  return <p>{text}
      <form>
        <input type="text" defaultValue={record.content && record.content.name} />
        <button onClick={saveMe}>save</button>
      </form>
</p>
}

export default ShowProfileName;
