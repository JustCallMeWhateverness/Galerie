import type Route from "./interfaces/Route.ts";
import { createElement } from "react";

// page components
import NotFoundPage from "./pages/NotFoundPage.tsx";
import UserPage from "./pages/UserPage.tsx";
import AuthModal from "./modals/AuthModal.tsx";
import HomePage from "./pages/HomePage.tsx";
import FavouritesPage from "./pages/FavouritesPage.tsx";
import Search from "./pages/Search.tsx";
import ArtistView from "./pages/ArtistView.tsx";
import CreateAuction from "./pages/CreateAuction.tsx";
import FilterPage from "./pages/FilterPage.tsx";
import AuctionListingPage from "./pages/AuctionListingPage.tsx";

export default [
  NotFoundPage,
  UserPage,
  AuthModal,
  HomePage,
  FavouritesPage,
  Search,
  ArtistView,
  CreateAuction,
  FilterPage,
  AuctionListingPage,
]
  // Map the route property of each page component to a Route object
  .map((x) => ({ element: createElement(x), ...x.route } as Route))
  // Sort by index (items without index default to 0)
  .sort((a, b) => (a.index || 0) - (b.index || 0));
