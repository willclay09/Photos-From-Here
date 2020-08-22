import React from "react";
import flickrService from "../../services/Photos";
import "../compile/Compile.css";

class Compile extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      photos: [],
      currentNumber: 0,
      lat: 25.034281,
      lon: -77.396278,
      searchTerm: "",
      formData: {
        searchTerm: "",
        latitude: "",
        longitude: "",
      },
    };
  }
  componentDidMount() {
    this.getLocation();
  }
  getLocation() {
    let onSuccess = (location) => {
      this.setState(
        {
          lat: location.coords.latitude,
          lon: location.coords.longitude,
        },
        this.getPhotos
      );
    };
    let onFail = (err) => {
      console.warn(err.message);
      this.getPhotos();
    };

    navigator.geolocation.getCurrentPosition(onSuccess, onFail);
  }
  getPhotos() {
    flickrService(this.state).then((responsePhotoObject) => {
      this.setState({ photos: responsePhotoObject.photos.photo });
    });
  }
  constructImageURL(photoObj) {
    return (
      "https://farm" +
      photoObj.farm +
      ".staticflickr.com/" +
      photoObj.server +
      "/" +
      photoObj.id +
      "_" +
      photoObj.secret +
      ".jpg"
    );
  }
  handleNext = () => {
    this.setState((prevState) => {
      const atEndOfArray =
        prevState.currentNumber === prevState.photos.length - 1;
      if (atEndOfArray) {
        return { currentNumber: 0 };
      } else {
        return { currentNumber: prevState.currentNumber + 1 };
      }
    });
  };
  handleSubmit = (event) => {
    event.preventDefault();

    this.setState((prevState) => {
      return {
        lat: prevState.formData.latitude,
        lon: prevState.formData.longitude,
        searchTerm: prevState.formData.searchTerm,
        currentNumber: 0,
      };
    }, this.getPictures);
  };
  handleChange = (event) => {
    const newformData = { ...this.state.formData };
    newformData[event.target.name] = event.target.value;

    this.setState({ formData: newformData });
  };

  render() {
    if (this.state.photos.length === 0) {
      return <div>Loading...</div>;
    } else {
      const currentPhotoObj = this.state.photos[this.state.currentNumber];
      const photoURL = this.constructImageURL(currentPhotoObj);
      return (
        <div className="Display">
          <button onClick={this.handleNext}>Next Photo</button>
          <br />
          <img className="Picture" src={photoURL} alt="flickr img" />
          <h3>{currentPhotoObj.title}</h3>
          <form onSubmit={this.handleSubmit}>
            <div>
              <label htmlFor="searchTerm">Search Term</label>
              <input
                type="text"
                name="searchTerm"
                value={this.state.formData.searchTerm}
                onChange={this.handleChange}
              />
            </div>

            <div>
              <label htmlFor="latitude">Latitude</label>
              <input
                type="text"
                name="latitude"
                value={this.state.formData.latitude}
                onChange={this.handleChange}
              />
            </div>

            <div>
              <label htmlFor="longitude">Longitude</label>
              <input
                type="text"
                name="longitude"
                value={this.state.formData.longitude}
                onChange={this.handleChange}
              />
            </div>

            <button>Submit Form</button>
          </form>
        </div>
      );
    }
  }
}

export default Compile;
