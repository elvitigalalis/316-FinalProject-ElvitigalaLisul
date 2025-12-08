import "./App.css";
import { React } from "react";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import { AuthContextProvider } from "./auth";
import { GlobalStoreContextProvider } from "./store";
import {
  AppBanner,
  HomeWrapper,
  LoginScreen,
  RegisterScreen,
  EditUserScreen,
  Statusbar,
  WorkspaceScreen,
} from "./components";
/*
  This is the entry-point for our application. Notice that we
  inject our store into all the components in our application.
  
  @author McKilla Gorilla
  @author elvitigalalis
*/
const App = () => {
  return (
    <BrowserRouter>
      <AuthContextProvider>
        <GlobalStoreContextProvider>
          <AppBanner />
          <Switch>
            <Route path="/" exact component={HomeWrapper} />
            <Route path="/login/" exact component={LoginScreen} />
            <Route path="/register/" exact component={RegisterScreen} />
            <Route path="/account/" exact component={EditUserScreen} />
            <Route path="/playlist/:id" exact component={WorkspaceScreen} />
          </Switch>
          <Statusbar />
        </GlobalStoreContextProvider>
      </AuthContextProvider>
    </BrowserRouter>
  );
};

export default App;
