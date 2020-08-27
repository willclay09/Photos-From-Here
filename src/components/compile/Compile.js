import React from "react";
import flickrService from "../../services/Photos";
import "../compile/Compile.css";
import googleMapsService from "../../services/googleMapsService";
import Picture from "../picture/Picture";
import Gallery from "../gallery/Gallery";
import PhotoForm from "../photoform/PhotoForm";

class Compile extends React.Component {
  constructor(props) {
    super(props);

    this.init = {
      city: "Nassau, The Bahamas",
      searchTerm: "chicken",
    };

    this.state = {
      photos: [],
      total: null,
      currentNumber: 0,
      lat: 25.034281,
      lon: -77.396278,
      city: this.init.city,
      searchTerm: this.init.searchTerm,
      photoCount: 5,
      locationDenied: false,
      isLocButtonDisabled: false,
      isPhotoButtonDisabled: false,
      isSameCity: false,
      formData: {
        searchTerm: this.init.searchTerm,
        city: this.init.city,
        photoCount: 5,
      },
    };
  }
  componentDidMount() {
    this.getPictures();
  }
  getLocationHandler = () => {
    const onSuccess = (location) => {
      this.setState((prevState) => {
        return {
          lat: location.coords.latitude,
          lon: location.coords.longitude,
          isLocButtonDisabled: true,
          searchTerm: prevState.formData.searchTerm,
          photoCount: prevState.formData.photoCount,
        };
      }, this.geocodeLocation);
    };
    const onFail = (err) => {
      console.warn(err.message);
      this.setState({ locationDenied: true });
    };
    navigator.geolocation.getCurrentPosition(onSuccess, onFail);

    setTimeout(() => this.setState({ isLocButtonDisabled: false }), 10000);
  };
  getPictures() {
    flickrService(this.state).then((responsePhotoObject) => {
      if (!responsePhotoObject) return;
      const photosWithURLS = responsePhotoObject.photos.photo.map(
        (photoObj) => {
          photoObj.photoURL = this.constructImageURL(photoObj, "c");
          return photoObj;
        }
      );
      this.setState({
        photos: photosWithURLS,
        total: responsePhotoObject.photos.total,
        currentNumber: 0,
        isPhotoButtonDisabled: true,
      });
    });
    setTimeout(() => this.setState({ isPhotoButtonDisabled: false }), 10000);
  }
  reverseGeocodeCity() {
    googleMapsService(this.state, true).then((loc) => {
      if (loc.status === "ZERO_RESULTS") {
        console.log("location not found");
        this.setState({
          total: "0",
          currentNumber: 0,
        });
        return;
      }
      const cityLat = loc.results[0].geometry.location.lat;
      const cityLon = loc.results[0].geometry.location.lng;
      this.setState(
        {
          lat: cityLat,
          lon: cityLon,
        },
        this.getPictures
      );
    });
  }
  geocodeLocation() {
    googleMapsService(this.state, false).then((loc) => {
      const array = loc.plus_code.compound_code.split(" ");
      array.shift();
      const city = array.join(" ");
      this.setState({
        city: city,
        formData: { city },
      });
    });
  }
  constructImageURL(photoObj, size) {
    if (!photoObj) return;
    return (
      "https://farm" +
      photoObj.farm +
      ".staticflickr.com/" +
      photoObj.server +
      "/" +
      photoObj.id +
      "_" +
      photoObj.secret +
      "_" +
      size +
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

  handlePrev = () => {
    this.setState((prevState) => {
      const atStart = prevState.currentNumber === 0;
      const finalIndex = prevState.photos.length - 1;
      if (atStart) {
        return { currentNumber: finalIndex };
      } else {
        return { currentNumber: prevState.currentNumber - 1 };
      }
    });
  };
  handleSubmit = (event) => {
    event.preventDefault();
    if (!this.state.formData.city && !this.state.formData.searchTerm) return;
    this.setState(
      (prevState) => {
        const isSameCity = prevState.formData.city === prevState.city;
        return {
          city: prevState.formData.city || prevState.city,
          searchTerm: prevState.formData.searchTerm || prevState.searchTerm,
          photoCount: prevState.formData.photoCount || prevState.photoCount,
          currentNumber: 0,
          isSameCity: isSameCity,
        };
      },
      () => {
        if (this.state.isSameCity) {
          this.getPictures();
        } else {
          this.reverseGeocodeCity();
        }
      }
    );
  };
  handleChange = (event) => {
    const newformData = { ...this.state.formData };
    newformData[event.target.name] = event.target.value;

    this.setState({ formData: newformData });
  };

  render() {
    const realPhotoCount = Math.min(this.state.total, this.state.photoCount);
    return (
      <div className="Home">
        <div>
          <div className="photoControls">
            <button onClick={this.handlePrev}>Last Photo</button>
            <strong>
              Current Photo: {this.state.currentNumber + 1} / {realPhotoCount}
            </strong>
            <button onClick={this.handleNext}>Next Photo</button>
          </div>
          <PhotoForm
            inState={this.state}
            handleChange={this.handleChange}
            handleSubmit={this.handleSubmit}
            getLocationHandler={this.getLocationHandler}
          />
          <Picture
            total={this.state.total}
            photoObj={this.state.photos[this.state.currentNumber]}
          />
        </div>

        <Gallery
          photos={this.state.photos}
          searchTerm={this.state.searchTerm}
          city={this.state.city}
          constructImageURL={this.constructImageURL}
        />
      </div>
    );
  }
}

export default Compile;
