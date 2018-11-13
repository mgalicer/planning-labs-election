const mapStyle = [{
  'stylers': [{'visibility': 'off'}]
}, {
  'featureType': 'landscape',
  'elementType': 'geometry',
  'stylers': [{'visibility': 'on'}, {'color': '#fcfcfc'}]
}, {
  'featureType': 'water',
  'elementType': 'geometry',
  'stylers': [{'visibility': 'on'}, {'color': '#bfd4ff'}]
}];

let map;

function initMap() {

  // load the map
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 40, lng: -100},
    zoom: 4.5,
    styles: mapStyle
  });


  map.data.setStyle(styleFeature);

  const selection = document.getElementById('election-year');

  google.maps.event.addDomListener(selection, 'change', () => {
    clearData();
    loadData(selection.options[selection.selectedIndex].value);
  });

  //load GeoJSON for state polygons
  map.data.loadGeoJson('https://storage.googleapis.com/mapsdevsite/json/states.js', { idPropertyName: 'NAME' });

  google.maps.event.addListenerOnce(map.data, 'addfeature', () => {
      google.maps.event.trigger(document.getElementById('election-year'),
          'change');
    });
}

const styleFeature = (feature) => {
  let showRow = true;
  if (feature.getProperty('color') == null) {
    showRow = false;
  }

  return {
    strokeWeight: 0.5,
    strokeColor: '#fff',
    fillColor: feature.getProperty('color') ,
    fillOpacity: feature.getProperty('opacity'),
    visible: showRow
  };
}

const clearData = () => {
  map.data.forEach((row) => {
    row.setProperty('winner', undefined);
  });
  // document.getElementById('data-box').style.display = 'none';
  // document.getElementById('data-caret').style.display = 'none';
}

const loadData = (url) => {
  fetch(url)
    .then(response => response.json())
    .then((myJSON) => {

      for (const state of Object.keys(myJSON)) {
        let stateName;
        let totalVotes = 0;
        let winningVotes = 0;
        let winningCandidate;

        for (const candidate of Object.keys(myJSON[state])) {
          stateName = myJSON[state][candidate]['state'];

          let numVotes = myJSON[state][candidate]['votes'];

          if(numVotes > winningVotes) {
            winningCandidate = myJSON[state][candidate];
            winningVotes = numVotes;
          }
          totalVotes += numVotes;
        }

        setFeatureStyles(stateName, winningCandidate['parties'][0], winningVotes/totalVotes);

      }
    })

}

const setFeatureStyles = (stateName, party, winMargin) => {
  let color;
  if(party === "Democratic") {
    color = '#0033cc';
  } else if(party == "Republican") {
    color = '#cc0000';
  } else {
    color = '#e6ccff';
  }

  map.data
    .getFeatureById(stateName)
    .setProperty('color', color)

  map.data
    .getFeatureById(stateName)
    .setProperty('opacity', 1.3 - winMargin);

}