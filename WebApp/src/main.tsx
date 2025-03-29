import ReactDom from "react-dom/client";
import {
  RouterProvider,
  createBrowserRouter,
  createRoutesFromElements,
  Route,
} from "react-router-dom";
import Layout from "./Layout";
import ProtectedRoute from "./pages/ProtectedRoute";
import HomePage from "./pages/HomePage";
import ExplorePage from "./pages/ExplorePage";
import SignInPage from "./pages/SignInPage";
import SignUpPage from "./pages/SignUpPage";
import "./index.css";
import { Provider } from "react-redux";
import { store } from "./store/store";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<Layout />}>
      <Route path="" element={<HomePage />} />
      <Route
        path="sign-in"
        element={
          <ProtectedRoute>
            <SignInPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="sign-up"
        element={
          <ProtectedRoute>
            <SignUpPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="explore"
        element={
          <ProtectedRoute>
            <ExplorePage />
          </ProtectedRoute>
        }
      />
    </Route>
  )
);

const rootElement = document.getElementById("root");
if (rootElement) {
  ReactDom.createRoot(rootElement).render(
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  );
} else {
  console.error("Root element not found");
}
