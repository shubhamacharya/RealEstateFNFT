/* eslint-disable array-callback-return */
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  HttpLink,
  from,
} from "@apollo/client";
import { onError } from "@apollo/client/link/error";
import Login from './components/Login';
import Home from './components/Home';
import './App.css';
import Mint from './components/Mint';

const errorLink = onError(({ graphqlErrors, networkError }) => {
  if (graphqlErrors) {
    graphqlErrors.map(({ message, location, path }) => {
      alert(`Graphql error ${message}`);
    });
  }
});

const link = from([
  errorLink,
  new HttpLink({ uri: "http://localhost:4000/graphql" }),
]);

const client = new ApolloClient({
  cache: new InMemoryCache(),
  link: link,
});


function App() {
  return (
    <>
      <ApolloProvider client={client}>
        <Router>
          <Routes>
            <Route index path="/" element={<Login />}></Route>
            <Route path="/home" element={<Home />}></Route>
            <Route path="/mint" element={<Mint />}></Route>
          </Routes>
        </Router>
      </ApolloProvider>
    </>
  );
}

export default App;
