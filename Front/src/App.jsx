import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import ThemeToggle from './components/ThemeToggle';
import Feed from './pages/Feed';
import NotFound from './pages/NotFound';
import ServerError from './pages/ServerError';
import './App.css';
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";

function App() {
    return (
        <ThemeProvider>
            <BrowserRouter>
                <ThemeToggle />
                <Routes>
                    <Route path="/" element={<Feed />} />
                    <Route path="/feed" element={<Feed />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />

                    <Route path="*" element={<NotFound />} />
                    <Route path="/error" element={<ServerError />} />
                </Routes>
            </BrowserRouter>
        </ThemeProvider>
    );
}

export default App;