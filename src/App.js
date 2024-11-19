import './App.css';
import { useEffect} from 'react';
import { useDispatch } from 'react-redux';
import { getSeoulBikeData } from './redux/DataSetSlice';
import { setSelectedValue } from './redux/SelectionSlice';
import ScatterplotContainer from './components/scatterContainer'
import ParallelCoordinatesContainer from './components/parallelCoordinatesContainer';


// here import other dependencies

// a component is a piece of code which render a part of the user interface
function App() {
  const dispatch = useDispatch();
  useEffect(()=>{
    console.log("App useEffect");
  })

  const handleChange = (dropdown, event) => {
    dispatch(setSelectedValue({ dropdown, value: event.target.value }));
  };

  // called once the component did mount
  useEffect(()=>{
    // initialize the data from file
    dispatch(getSeoulBikeData());
  },[])

  return (
    <div className="App">
        {console.log("App rendering")}
        <div className="dropdown-container">
          <div className="dropdown-pair">
          <label htmlFor="dropdown1" className="dropdown-label">Choose an option for the x-axis:</label>
            <select id="dropdown1" className="dropdown-select" onChange={(e) => handleChange('dropdown1', e)} defaultValue={"Humidity"}>
              <option value="Date">Date</option>
              <option value="RentedBikeCount">Rented Bike Count</option>
              <option value="Hour">Hour</option>
              <option value="Temperature">Temperature</option>
              <option value="Humidity">Humidity</option>
              <option value="WindSpeed">Wind Speed</option>
              <option value="Visibility">Visibility</option>
              <option value="DewPointTemperature">Dew Point Temperature</option>
              <option value="SolarRadiation">Solar Radiation</option>
              <option value="Rainfall">Rainfall</option>
              <option value="Snowfall">Snowfall</option>
            </select>
          </div>

          <div className="dropdown-pair">
          <label htmlFor="dropdown2" className="dropdown-label">Choose an option for y-axis:</label>
            <select id="dropdown2" className="dropdown-select" onChange={(e) => handleChange('dropdown2', e)} defaultValue="Hour">
              <option value="Date">Date</option>
              <option value="RentedBikeCount">Rented Bike Count</option>
              <option value="Hour">Hour</option>
              <option value="Temperature">Temperature</option>
              <option value="Humidity">Humidity</option>
              <option value="WindSpeed">Wind Speed</option>
              <option value="Visibility">Visibility</option>
              <option value="DewPointTemperature">Dew Point Temperature</option>
              <option value="SolarRadiation">Solar Radiation</option>
              <option value="Rainfall">Rainfall</option>
              <option value="Snowfall">Snowfall</option>
            </select>
          </div>

          <div className="dropdown-pair">
          <label htmlFor="dropdown3" className="dropdown-label">Choose an option for left axis:</label>
            <select id="dropdown3" className="dropdown-select" onChange={(e) => handleChange('dropdown3', e)} defaultValue="RentedBikeCount">
              <option value="Date">Date</option>
              <option value="RentedBikeCount">Rented Bike Count</option>
              <option value="Hour">Hour</option>
              <option value="Temperature">Temperature</option>
              <option value="Humidity">Humidity</option>
              <option value="WindSpeed">Wind Speed</option>
              <option value="Visibility">Visibility</option>
              <option value="DewPointTemperature">Dew Point Temperature</option>
              <option value="SolarRadiation">Solar Radiation</option>
              <option value="Rainfall">Rainfall</option>
              <option value="Snowfall">Snowfall</option>
            </select>
          </div>

          <div className="dropdown-pair">
          <label htmlFor="dropdown4" className="dropdown-label">Choose an option for right axis:</label>
            <select id="dropdown4" className="dropdown-select" onChange={(e) => handleChange('dropdown4', e)} defaultValue="Date">
              <option value="Date">Date</option>
              <option value="RentedBikeCount">Rented Bike Count</option>
              <option value="Hour">Hour</option>
              <option value="Temperature">Temperature</option>
              <option value="Humidity">Humidity</option>
              <option value="WindSpeed">Wind Speed</option>
              <option value="Visibility">Visibility</option>
              <option value="DewPointTemperature">Dew Point Temperature</option>
              <option value="SolarRadiation">Solar Radiation</option>
              <option value="Rainfall">Rainfall</option>
              <option value="Snowfall">Snowfall</option>
            </select>
          </div>

          <div className="dropdown-pair">
          <label htmlFor="dropdown5" className="dropdown-label">Choose an option for categorical:</label>
            <select id="dropdown5" className="dropdown-select" onChange={(e) => handleChange('dropdown5', e)} defaultValue="Seasons">
              <option value="Seasons">Seasons</option>
              <option value="Holiday">Holiday</option>
              <option value="FunctioningDay">Functioning Day</option>
            </select>
          </div>

        </div>
        <div id="view-container" className="row">
          {<ScatterplotContainer/>}
          {<ParallelCoordinatesContainer/>}
        </div>
    </div>
  );
}

export default App;
