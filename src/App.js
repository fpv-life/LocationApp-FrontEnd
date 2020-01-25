/* global H */
import React, { useState } from 'react';
import './App.css';
import TextField from '@material-ui/core/TextField';
import Autocomplete from '@material-ui/lab/Autocomplete';
import axios from 'axios'

const App = () => { 
  const [locations, setLocations] = useState([]);
  const [newLocation, setNewLocation] = useState('');
  const [searchOptions, setSearchOptions] = useState([]);
  const [showLocations, setShowLocations] = useState([]);
  const [objects, setObjects] = useState([{}]);
  const [mssg, setMssg] = useState('');

  let i = 0;     
  
  var platform = new H.service.Platform({
    apikey: "ZxwsS89OjHMbyXLctmXRgOnugOgz1xgb9hGiwXdqTHg"
  });
            
  const DisplayMapFC = () => {
    const mapRef = React.useRef(null);

    React.useLayoutEffect(() => {
      if (!mapRef.current) return;
  
      const defaultLayers = platform.createDefaultLayers();
      const hMap = new H.Map(mapRef.current, defaultLayers.vector.normal.map, {
        center: { lat: 50, lng: 5 },
        zoom: 4,
        pixelRatio: window.devicePixelRatio || 1
      });
  
      const behavior = new H.mapevents.Behavior(new H.mapevents.MapEvents(hMap));
  
      const ui = H.ui.UI.createDefault(hMap, defaultLayers);

      if(!mssg){
        showLocations.forEach(element => {
          var marker = new H.map.Marker({lat: element.lat, lng: element.lon});
          hMap.addObject(marker);
        })
      }

      return () => {
        hMap.dispose();
      };
    }, [mapRef]);
  
    return <div className="map" ref={mapRef} style={{ height: "800px" }} />;
  };

  const searchFunction = function(temp){
    axios({
      "method":"GET",
      "url":"https://devru-latitude-longitude-find-v1.p.rapidapi.com/latlon.php",
      "headers":{
      "content-type":"application/octet-stream",
      "x-rapidapi-host":"devru-latitude-longitude-find-v1.p.rapidapi.com",
      "x-rapidapi-key":"b396477596mshc6746497eeadb3ap1f808ajsn4c563bac1b2b"
      },"params":{
        "location":temp
      }
      })
      .then((response)=>{
        setSearchOptions(response.data.Results);
      })
      .catch((error)=>{
        console.log(error)
      })
  };

  const sendFunction = function(){
    axios({
      "method":"POST",
      "url":"http://localhost:8080",
      "headers":{
        "content-type":"application/api",
      },
      "params": {
        "coordinates1":[objects[1].lat, objects[1].lon],
        "coordinates2": [objects[2].lat, objects[2].lon]
      }
      })
      .then((response)=>{
        if(response.data.data === "Account temporary block"){
          setMssg('Account temp blocked on usage limit');
        }
        setShowLocations(response.data.data);
      })
      .catch((error)=>{
        console.log(error)
    })
  }

  return <>
  <div className="container border-box">
    { 
      (mssg)? <div className="container box text-center">
        {mssg}
      </div>:<div></div>
    }
    <div className="container box">
      <h1>The Map App</h1>
      <p className="align">This app lets you add 2 cities, then find locations in between current weather and return it.</p>
    </div>
    <div className="container box">
      <p>Enter 2 cities:</p>
      <Autocomplete
        id="combo-box-demo"
        includeInputInList
        options={searchOptions}
        getOptionLabel={option => option.name}
        renderInput={params => {
          setNewLocation(params.inputProps.value);
          return <TextField {...params} label="Search" variant="outlined" fullWidth onChange={(e) => {
            setNewLocation(e.target.value);
            searchFunction(e.target.value);
          }}/>
        }}
      />
    <br></br>
      <button className="btn btn-dark" onClick={() => {
        searchOptions.forEach(element => {
          if(newLocation === element.name){
            if(i > 1){
              setMssg("Only 2 locations");
            }
            else{
              setObjects(staro => [...staro, element]);
              setLocations(staro => [...staro, element.name]);
            }
          }          
        });
        }}>Add</button>
      <button className="btn btn-dark float-right" onClick={() => {
          sendFunction();
        }}>Check locations</button>
    </div>

    <div className="container table">
      <table className="table">
        <thead>
          <tr>
            <th scope="col">#</th>
            <th scope="col">City</th>
            <th scope="col"></th>
            <th scope="col align-right"></th>
          </tr>
        </thead>
        <tbody>
          {
            locations.map((location, key) => {
              i++;
              return <>
              <tr>
                <th scope="row">{i}</th>
                <td key={key}>{location}</td>
                
                { 
                  (typeof showLocations.weather !== undefined)? <td></td>:<td></td>
                }

                <td><button className="btn btn-dark float-right" onClick={() => {
                    var array = locations.splice(key, 1);
                    setLocations(array);
                    array = objects.splice(key, 1);
                    setObjects(array);
                    //objects.splice(locations[i-1], 1);
                  }}>Remove</button></td>
              </tr>
              </>
            })
          }
        </tbody>
      </table>
    </div>

    <div className="container table">
      <DisplayMapFC/>
    </div> 

  </div> 
  </>
}

export default App;