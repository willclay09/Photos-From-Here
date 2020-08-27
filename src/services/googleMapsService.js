function googleMapsService(state, isReverse) {
  const apiKey = "d7d37b10c2098099e35beba204a72ece";
  const reverseGeoQuery = `address=${state.city}&key=${apiKey}`;
  const geocodeQuery = `latlng=${state.lat},${state.lon}&key=${apiKey}`;
  let URL = `https://maps.googleapis.com/maps/api/geocode/json?`;

  if (isReverse) {
    URL += reverseGeoQuery;
  } else {
    URL += geocodeQuery;
  }
  return fetch(URL)
    .then((response) => response.json())
    .catch((err) => console.warn(err));
}

export default googleMapsService;
