import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { Provider } from "react-redux";
import store from "./app/store.js";
import {
  ApolloProvider,
  ApolloClient,
  InMemoryCache,
  HttpLink,
  from,
} from "@apollo/client";
import { BrowserRouter } from "react-router-dom";
import { onError } from "@apollo/client/link/error";

const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors)
    graphQLErrors.forEach(({ message, locations, path }) =>
      console.log(
        `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
      )
    );
  if (networkError) console.error(`[Network error]: ${networkError}`);
});

const httpLink = new HttpLink({ uri: "http://localhost:4000/graphql" });

const cache = new InMemoryCache({
  // typePolicies: {
  //   Query: {
  //     fields: {
  //       clients: {
  //         merge(existing, incoming) {
  //           return incoming
  //         },
  //       },
  //       projects: {
  //         merge(existing, incoming) {
  //           return incoming
  //         },
  //       },
  //     }
  //   }
  // }
});

const client = new ApolloClient({
  cache: new InMemoryCache(),
  link: from([errorLink, httpLink]),
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <ApolloProvider client={client}>
    <React.StrictMode>
      <Provider store={store}>
        <BrowserRouter>
          <App></App>
        </BrowserRouter>
      </Provider>
    </React.StrictMode>
  </ApolloProvider>
);
