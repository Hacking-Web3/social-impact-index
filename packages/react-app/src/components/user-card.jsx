const ImgUpload =({
  onChange,
  src
})=>
  <label htmlFor="photo-upload" className="custom-file-upload fas">
    <div className="img-wrap img-upload" >
      <img for="photo-upload" src={src}/>
    </div>
    <input id="photo-upload" type="file" onChange={onChange}/> 
  </label>

const Name =({
  onChange,
  value
})=>
  <div className="field">
    <label htmlFor="name">
      name:
    </label>
    <input 
      id="name" 
      type="text" 
      onChange={onChange} 
      maxlength="25" 
      value={value} 
      placeholder="Name" 
      required/>
  </div>

  
const Status =({
  onChange,
  value
})=>
  <div className="field">
    <label htmlFor="status">
      status:
    </label>
    <input 
      id="status" 
      type="Textarea" 
      onChange={onChange} 
      maxLength="200" 
      value={value} 
      placeholder="Short bio" 
      required/>
  </div>


const Website =({
  onChange,
  value
})=>
  <div className="field">
    <label htmlFor="website">
      website:
    </label>
    <input 
      id="website" 
      type="link" 
      onChange={onChange} 
      maxLength="200d" 
      value={value} 
      placeholder="Link to the website" 
      required/>
  </div>


const Profile =({
  onSubmit,
  src,
  name,
  status,
  website,
})=>
  <div className="card">
    <form onSubmit={onSubmit}>
      <h1>Profile Card</h1>
      <label className="custom-file-upload fas">
        <div className="img-wrap" >
          <img for="photo-upload" src={src}/>
        </div>
      </label>
      <div className="name">{name}</div>
      <div className="status">{status}</div>
      <div className="website">{website}</div>
      <button type="submit" className="edit">Edit Profile </button>
    </form>
  </div>
     
      
const Edit =({
  onSubmit,
  children,
})=>
  <div className="card">
    <form onSubmit={onSubmit}>
      <h1>Profile Card</h1>
        {children}
      <button type="submit" className="save">Save </button>
    </form>
  </div>

class CardProfile extends React.Component {
  state = {
    file: '',
    //imagePreviewUrl: 'https://github.com/OlgaKoplik/CodePen/blob/master/profile.jpg?raw=true',
    imagePreviewUrl: '../../public/profile.jpg',
    name:'',
    status:'',
    active: 'edit'
  }

  photoUpload = e =>{
    e.preventDefault();
    const reader = new FileReader();
    const file = e.target.files[0];
    reader.onloadend = () => {
      this.setState({
        file: file,
        imagePreviewUrl: reader.result
      });
    }
    reader.readAsDataURL(file);
  }

  editName = e =>{
    const name = e.target.value;
    this.setState({
      name,
    });
  }
  
  editWebsite = e => {
    const website = e.target.value;
    this.setState({
      website,
    });
  }

  editStatus = e => {
    const status = e.target.value;
    this.setState({
      status,
    });
  }
  
  handleSubmit= e =>{
    e.preventDefault();
    let activeP = this.state.active === 'edit' ? 'profile' : 'edit';
    this.setState({
      active: activeP,
    })
  }
  
  render() {
    const {imagePreviewUrl, 
           name,
           website, 
           status, 
           active} = this.state;
    return (
      <div>
        {(active === 'edit')?(
          <Edit onSubmit={this.handleSubmit}>
            <ImgUpload onChange={this.photoUpload} src={imagePreviewUrl}/>
            <Name onChange={this.editName} value={name}/>
            <Website onChange={this.editWebsite} value={website}/>
            <Status onChange={this.editStatus} value={status}/>
          </Edit>
        ):(
          <Profile 
            onSubmit={this.handleSubmit} 
            src={imagePreviewUrl} 
            name={name} 
            website={website}
            status={status}/>)}
        
      </div>
    )
  }
}

ReactDOM.render(
  <CardProfile/>,
  document.getElementById('usercard')
)