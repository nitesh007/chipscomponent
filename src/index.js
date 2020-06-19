import React from "react";
import ReactDOM from "react-dom";
import "./styles.scss";

import Chips from './chips';

const App = () => {
  return (
    <div className="row indexcls">
      <Chips
        label="Movie Search"
        className="col-sm-6 col-md-8"
        placeholder="Enter Movie Name"
        name="moviesearch"
        livesearch="true"
      />
    </div>

  );
};

ReactDOM.render(<App />, document.getElementById("root"));