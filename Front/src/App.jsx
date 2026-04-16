import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Feed from './pages/Feed';
import NotFound from './pages/NotFound';
import ServerError from './pages/ServerError';
import ErrorBoundary from "./pages/ErrorBoundary.jsx";
import './App.css';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Feed />} />
                <Route path="/feed" element={<Feed />} />

                {/* Страница 404 */}
                <Route path="*" element={<NotFound />} errorElement={<ErrorBoundary />} />

                {/* Страница 500*/}
                <Route path="/error" element={<ServerError />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;