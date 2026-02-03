import { HashRouter, Routes, Route } from 'react-router-dom';
import { ToastProvider } from './contexts/ToastContext';
import { ToastContainer } from './components/ToastContainer';

// Pages
import { Home } from './pages/Home';
import { LocationView } from './pages/LocationView';
import { ItemView } from './pages/ItemView';
import { AddLocation } from './pages/AddLocation';
import { AddItem } from './pages/AddItem';
import { EditLocation } from './pages/EditLocation';
import { EditItem } from './pages/EditItem';
import { Search } from './pages/Search';
import { Tags } from './pages/Tags';

/**
 * Main application component with HashRouter for routing.
 * HashRouter is used for compatibility with static hosting (e.g., GitHub Pages).
 */
function App() {
  return (
    <ToastProvider>
      <HashRouter>
        <Routes>
          {/* Home - list all locations */}
          <Route path="/" element={<Home />} />

          {/* View pages */}
          <Route path="/location/:id" element={<LocationView />} />
          <Route path="/item/:id" element={<ItemView />} />

          {/* Add pages */}
          <Route path="/add/location" element={<AddLocation />} />
          <Route path="/add/item" element={<AddItem />} />

          {/* Edit pages */}
          <Route path="/edit/location/:id" element={<EditLocation />} />
          <Route path="/edit/item/:id" element={<EditItem />} />

           {/* Search */}
           <Route path="/search" element={<Search />} />

           {/* Tags */}
           <Route path="/tags" element={<Tags />} />
        </Routes>
        <ToastContainer />
      </HashRouter>
    </ToastProvider>
  );
}

export default App;
