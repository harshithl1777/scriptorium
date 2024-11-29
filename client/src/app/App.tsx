import { ThemeProvider } from '@/lib/ThemeProvider';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import LoginPage from '@/pages/LoginPage';
import SignupPage from '@/pages/SignupPage';
import Library from '@/pages/Library';
import axios from 'axios';
import { UserProvider } from '@/lib/UserProvider';
import { SessionProvider } from '@/lib/SessionProvider';
import Gateway from '@/components/Gateway';
import Protected from '@/components/Protected';

axios.defaults.baseURL = import.meta.env.VITE_SERVER_BASE_URL;
axios.defaults.withCredentials = true;

function App() {
    return (
        <ThemeProvider defaultTheme='dark' storageKey='vite-ui-theme'>
            <UserProvider>
                <SessionProvider>
                    <Toaster />
                    <Router>
                        <Routes>
                            <Route path='/' element={<div>Landing Page</div>} />
                            <Route
                                path='/auth/login'
                                element={
                                    <Gateway>
                                        <LoginPage />
                                    </Gateway>
                                }
                            />
                            <Route
                                path='/auth/signup'
                                element={
                                    <Gateway>
                                        <SignupPage />
                                    </Gateway>
                                }
                            />
                            <Route
                                path='/app/library'
                                element={
                                    // <Protected>
                                        <Library />
                                    // </Protected>
                                }
                            />
                        </Routes>
                    </Router>
                </SessionProvider>
            </UserProvider>
        </ThemeProvider>
    );
}

export default App;
