import { ThemeProvider } from '@/lib/ThemeProvider';
import { BrowserRouter as Router, Routes, Route, BrowserRouter, Link } from 'react-router-dom';
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
import CodeEditorPage from '@/pages/CodeEditorPage';
import { SiteProvider } from '@/lib/SiteProvider';
import MarkdownEditorPage from '@/pages/MarkdownEditorPage';
import PostsPage from '@/pages/PostsPage';
import PostsSearchPage from '@/pages/PostsSearchPage';

axios.defaults.baseURL = import.meta.env.VITE_SERVER_BASE_URL;
axios.defaults.withCredentials = true;

function App() {
    return (
        <ThemeProvider defaultTheme='dark' storageKey='vite-ui-theme'>
            <SiteProvider>
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
                                                path='/app/posts/search'
                                                element={
                                                    <Protected>
                                                        <Layout>
                                                            <PostsSearchPage />
                                                        </Layout>
                                                    </Protected>
                                                }
                                            />
                                            <Route
                                                path='/app/templates/search'
                                                element={
                                                    <Protected>
                                                        <Layout>
                                                            <div>Templates Search</div>
                                                        </Layout>
                                                    </Protected>
                                                }
                                            />
                                            <Route
                                                path='/app/library'
                                                element={
                                                    <Protected>
                                                        <Layout>
                                                            <LibraryPage />
                                                        </Layout>
                                                    </Protected>
                                                }
                                            />
                                            <Route
                                                path='/app/editor/posts/:id'
                                                element={
                                                    <Protected>
                                                        <Layout>
                                                            <MarkdownEditorPage />
                                                        </Layout>
                                                    </Protected>
                                                }
                                            />
                                            <Route
                                                path='/app/editor/templates/:id'
                                                element={
                                                    <Protected>
                                                        <Layout>
                                                            <CodeEditorPage />
                                                        </Layout>
                                                    </Protected>
                                                }
                                            />
                                            <Route
                                                path='/app/templates/:id'
                                                element={
                                                    <Protected>
                                                        <Layout>
                                                            <div>Templates</div>
                                                        </Layout>
                                                    </Protected>
                                                }
                                            />
                                            <Route path='/posts/:id' element={<PostsPage />} />

                                            <Route
                                                path='/account/profile'
                                                element={
                                                    <Protected>
                                                        <Layout>
                                                            <div>Profile</div>
                                                        </Layout>
                                                    </Protected>
                                                }
                                            />
                                            <Route
                                                path='/404'
                                                element={
                                                    <div className='w-full h-full flex items-center justify-center'>
                                                        404 Not Found
                                                    </div>
                                                }
                                            />
                                            <Route
                                                path='*'
                                                element={
                                                    <div className='w-full h-[100vh] flex items-center justify-center  flex-col'>
                                                        <h1 className='text-2xl !mb-4'>Page Not Found.</h1>
                                                        <h1 className='text-lg'>Looks like you went off course!</h1>

                                                        <h3 className='text-md text-slate-400'>
                                                            404 Error.{' '}
                                                            <Link
                                                                className='underline underline-offset-4 hover:cursor-pointer'
                                                                to='/app/library'
                                                            >
                                                                Head back home?
                                                            </Link>
                                                        </h3>
                                                    </div>
                                                }
                                            />
                                        </Routes>
                                    </Router>
                                </TooltipProvider>
                            </TemplatesProvider>
                        </PostsProvider>
                    </SessionProvider>
                </UserProvider>
            </SiteProvider>
        </ThemeProvider>
    );
}

export default App;
