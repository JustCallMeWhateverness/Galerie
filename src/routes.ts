import type Route from "./interfaces/Route.ts";
import { createElement } from "react";

// page components
import AboutPage from './pages/AboutPage.tsx';
import NotFoundPage from './pages/NotFoundPage.tsx';
import OurVisionPage from './pages/OurVisionPage.tsx';
import ProductDetailsPage from './pages/ProductDetailsPage.tsx';
import ProductsPage from './pages/ProductsPage.tsx';
import UserPage from './pages/UserPage.tsx';
import AuthModal from './modals/AuthModal.tsx';
import HomePage from "./pages/HomePage.tsx";
import FavouritesPage from "./pages/FavouritesPage.tsx";
import FilterPage from "./pages/FilterPage.tsx";

export default [
  AboutPage,
  NotFoundPage,
  OurVisionPage,
  ProductDetailsPage,
  ProductsPage,
  UserPage,
  AuthModal,
  HomePage,
  FavouritesPage,
  FilterPage
]
  // map the route property of each page component to a Route
  .map((x) => ({ element: createElement(x), ...x.route } as Route))
  // sort by index (and if an item has no index, sort as index 0)
  .sort((a, b) => (a.index || 0) - (b.index || 0));
