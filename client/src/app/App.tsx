import { ThemeProvider } from '@/lib/ThemeProvider';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import LoginPage from '@/pages/LoginPage';
import SignupPage from '@/pages/SignupPage';
import axios from 'axios';
import { UserProvider } from '@/lib/UserProvider';
import { SessionProvider } from '@/lib/SessionProvider';
import Gateway from '@/components/Gateway';
import Protected from '@/components/Protected';
import Layout from '@/components/Layout';
import LibraryPage from '@/pages/LibraryPage';
import { TooltipProvider } from '@/components/ui/tooltip';
import { TemplatesProvider } from '@/lib/TemplatesProvider';
import { PostsProvider } from '@/lib/PostsProvider';

axios.defaults.baseURL = import.meta.env.VITE_SERVER_BASE_URL;
axios.defaults.withCredentials = true;

function App() {
    return (
        <ThemeProvider defaultTheme='dark' storageKey='vite-ui-theme'>
            <UserProvider>
                <SessionProvider>
                    <PostsProvider>
                        <TemplatesProvider>
                            <Toaster />
                            <TooltipProvider>
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
                                                <Protected>
                                                    <Layout names={['Library']} links={['/app/library']}>
                                                        <LibraryPage />
                                                    </Layout>
                                                </Protected>
                                            }
                                        />
                                        <Route
                                            path='/app/editor'
                                            element={
                                                <Protected>
                                                    <Layout names={['Editor']} links={['/app/editor']}>
                                                        <div>Editor</div>
                                                    </Layout>
                                                </Protected>
                                            }
                                        />
                                        <Route
                                            path='/app/templates/:id'
                                            element={
                                                <Protected>
                                                    <Layout names={['Templates']} links={['/app/templates']}>
                                                        <div>Templates</div>
                                                    </Layout>
                                                </Protected>
                                            }
                                        />
                                        <Route
                                            path='/app/blogs/:id'
                                            element={
                                                <Protected>
                                                    <Layout names={['Blogs']} links={['/app/blogs']}>
                                                        <div>Blogs</div>
                                                    </Layout>
                                                </Protected>
                                            }
                                        />
                                        <Route
                                            path='/app/search'
                                            element={
                                                <Protected>
                                                    <Layout names={['Search']} links={['/app/search']}>
                                                        <div>Search</div>
                                                    </Layout>
                                                </Protected>
                                            }
                                        />
                                        <Route
                                            path='/account/profile'
                                            element={
                                                <Protected>
                                                    <Layout names={['Profile']} links={['/account/profile']}>
                                                        <div>Profile</div>
                                                    </Layout>
                                                </Protected>
                                            }
                                        />
                                        <Route
                                            path='/account/reports'
                                            element={
                                                <Protected>
                                                    <Layout names={['Reports']} links={['/account/Reports']}>
                                                        <div>Reports</div>
                                                    </Layout>
                                                </Protected>
                                            }
                                        />
                                        <Route
                                            path='/account/developer'
                                            element={
                                                <Protected>
                                                    <Layout names={['Developer Mode']} links={['/account/developer']}>
                                                        <div>Developer Mode</div>
                                                    </Layout>
                                                </Protected>
                                            }
                                        />
                                    </Routes>
                                </Router>
                            </TooltipProvider>
                        </TemplatesProvider>
                    </PostsProvider>
                </SessionProvider>
            </UserProvider>
        </ThemeProvider>
    );
}

export default App;
