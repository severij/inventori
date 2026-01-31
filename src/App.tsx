import { HashRouter, Routes, Route } from 'react-router-dom';

// Pages
import { Home } from './pages/Home';
import { LocationView } from './pages/LocationView';
import { ContainerView } from './pages/ContainerView';
import { ItemView } from './pages/ItemView';
import { AddLocation } from './pages/AddLocation';
import { AddContainer } from './pages/AddContainer';
import { AddItem } from './pages/AddItem';
import { EditLocation } from './pages/EditLocation';
import { EditContainer } from './pages/EditContainer';
import { EditItem } from './pages/EditItem';
import { Search } from './pages/Search';

/**
 * Main application component with HashRouter for routing.
 * HashRouter is used for compatibility with static hosting (e.g., GitHub Pages).
 */
function App() {
  return (
    <HashRouter>
      <Routes>
        {/* Home - list all locations */}
        <Route path="/" element={<Home />} />

        {/* View pages */}
        <Route path="/location/:id" element={<LocationView />} />
        <Route path="/container/:id" element={<ContainerView />} />
        <Route path="/item/:id" element={<ItemView />} />

        {/* Add pages */}
        <Route path="/add/location" element={<AddLocation />} />
        <Route path="/add/container" element={<AddContainer />} />
        <Route path="/add/item" element={<AddItem />} />

        {/* Edit pages */}
        <Route path="/edit/location/:id" element={<EditLocation />} />
        <Route path="/edit/container/:id" element={<EditContainer />} />
        <Route path="/edit/item/:id" element={<EditItem />} />

        {/* Search */}
        <Route path="/search" element={<Search />} />
      </Routes>
    </HashRouter>
  );
}

export default App;
