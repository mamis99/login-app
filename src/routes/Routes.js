import React from 'react';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import Login from '../pages/Login';
import Menu from '../pages/Menu';
import Individual from '../pages/Individual';

function Routes() {
  return (
    <BrowserRouter>
      <Switch>
        <Route exact path='/' component={Login}/>
        <Route exact path='/menu/:mode' component={Menu}/>
        <Route exact path='/individual' component={Individual}/>
      </Switch>
    </BrowserRouter>
    
  );
}

export default Routes;
