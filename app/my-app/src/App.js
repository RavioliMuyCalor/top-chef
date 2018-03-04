import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import data from './restaurants_with_sales.json';


class App extends Component {

  constructor(props) {
    super(props);

    this.state = {
      restaurants_with_sales: [],
    };
  }

  FetchSales()
  {
    fetch('/api/fetch_sales')
    .then(response => response.json())
    .then(data => this.setState({ restaurants_with_sales: data }));
    
  }

  render() {

    if(data.length !== 0){
    return ( 

      <div>
          <button type="button" class="update_button" onClick={()=>{this.FetchSales()}}>Update Offers</button>

          <ul>
          {
             data.map(function(elem){
                return( 

                <div class="border">

                <h2 class="restaurant_title">{elem.title}</h2> 
                {elem.sales.map(sales =>
                  <div id="promo">
                    <h3 class = "sale_title">{sales.title}</h3> 
                    <div class = "sale_details_div">
                    <label>
                      {sales.details}
                    </label>
                    </div>
                    </div>

                )} 
                </div> ) ;

              })
          }
          </ul>

      </div>
  );
  }

    else{
      return (
        <div>
          <img src={logo} alt="loading" /> 
        </div>
        );
    }
}
}

export default App;
