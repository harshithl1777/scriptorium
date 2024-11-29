import { ThemeProvider } from "@/lib/ThemeProvider";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import LoginPage from "@/pages/LoginPage";
import SignupPage from "@/pages/SignupPage";
import Library from "@/pages/Library";
import axios from "axios";
import { UserProvider } from "@/lib/UserProvider";
import { SessionProvider } from "@/lib/SessionProvider";
import Gateway from "@/components/Gateway";
import Protected from "@/components/Protected";
import Layout from "@/components/Layout";
import { TagProvider } from "@/lib/TagProvider";

axios.defaults.baseURL = import.meta.env.VITE_SERVER_BASE_URL;
axios.defaults.withCredentials = true;

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <UserProvider>
        <SessionProvider>
          <TagProvider>
            <Toaster />
            <Router>
              <Routes>
                <Route path="/" element={<div>Landing Page</div>} />
                <Route
                  path="/auth/login"
                  element={
                    <Gateway>
                      <LoginPage />
                    </Gateway>
                  }
                />
                <Route
                  path="/auth/signup"
                  element={
                    <Gateway>
                      <SignupPage />
                    </Gateway>
                  }
                />
                <Route
                  path="/app/templates"
                  element={
                    <Protected>
                      <Layout names={["Templates"]} links={["/app/templates"]}>
                        <div>Templates</div>
                      </Layout>
                    </Protected>
                  }
                />
                <Route
                  path="/app/blogs"
                  element={
                    <Protected>
                      <Layout names={["Blogs"]} links={["/app/blogs"]}>
                        <div>Blogs</div>
                      </Layout>
                    </Protected>
                  }
                />
                <Route
                  path="/app/search"
                  element={
                    // <Protected>
                    <Layout names={["Search"]} links={["/app/search"]}>
                      <Library />
                    </Layout>
                    // </Protected>
                  }
                />
                <Route
                  path="/account/profile"
                  element={
                    <Protected>
                      <Layout names={["Profile"]} links={["/account/profile"]}>
                        <div>Profile</div>
                      </Layout>
                    </Protected>
                  }
                />
                <Route
                  path="/account/reports"
                  element={
                    <Protected>
                      <Layout names={["Reports"]} links={["/account/Reports"]}>
                        <div>Reports</div>
                      </Layout>
                    </Protected>
                  }
                />
                <Route
                  path="/account/developer"
                  element={
                    <Protected>
                      <Layout
                        names={["Developer Mode"]}
                        links={["/account/developer"]}
                      >
                        <div>Developer Mode</div>
                      </Layout>
                    </Protected>
                  }
                />
              </Routes>
            </Router>
          </TagProvider>
        </SessionProvider>
      </UserProvider>
    </ThemeProvider>
  );
}

export default App;
