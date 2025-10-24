import type Route from "./interfaces/Route.ts";
import { createElement } from "react";

// Page components
import AboutPage from './pages/AboutPage.tsx';
import NotFoundPage from './pages/NotFoundPage.tsx';
import OurVisionPage from './pages/OurVisionPage.tsx';
import ProductDetailsPage from './pages/ProductDetailsPage.tsx';
import ProductsPage from './pages/ProductsPage.tsx';
import UserPage from './pages/UserPage.tsx';
import AuthModal from './modals/AuthModal.tsx';
import HomePage from "./pages/HomePage.tsx";
import FavouritesPage from "./pages/FavouritesPage.tsx";
import Search from "./pages/Search.tsx";
import ArtistView from "./pages/ArtistView.tsx";  // Individual artist profile page
import CreateAuction from "./pages/CreateAuction.tsx";
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
  Search,
  ArtistView,  // Individual artist profile page - displays artist details and ongoing auctions
  CreateAuction,
  FilterPage
]
  // Map the route property of each page component to a Route object
  .map((x) => ({ element: createElement(x), ...x.route } as Route))
  // Sort by index (items without index default to 0)
  .sort((a, b) => (a.index || 0) - (b.index || 0));
