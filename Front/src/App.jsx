import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Feed from './pages/Feed';
import './App.css';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Feed />} />
                <Route path="/feed" element={<Feed />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;