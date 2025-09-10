import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Users from "./pages/Users";
import {AppUserProvider, useAppUser} from "./contexts/user.context";
import {AuthCredentialsWithClaims, parseTokenCredentials} from "./tools/token";
import {createClientManager} from "./infrastructure/client/manager";
import {AxiosProxy} from "./infrastructure/client/proxy/axios.proxy";
import React from "react";
import {getCookie} from "./tools/cookie";

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { isAuthorized } = useAppUser();
    return isAuthorized ? <>{children}</> : <Navigate to="/login" replace/>;
};

export default function App() {
    const cookieJson = getCookie('vd_credentials');
    const user: AuthCredentialsWithClaims | null = parseTokenCredentials(cookieJson);
    const client = createClientManager(
        new AxiosProxy(process.env.REACT_APP_PUBLIC_API_URL ?? '', user?.accessToken ?? '')
    );
    
    return (
        <AppUserProvider user={user} client={client}>
            <Router>
                <Routes>
                    <Route path="/login" element={<Login/>} />
                    <Route
                        path={"/users"}
                        element={
                        <PrivateRoute>
                            <Users/>
                        </PrivateRoute>
                        }
                    />
                    <Route path="*" element={<Navigate to="/users" replace/> }/>
                </Routes>
            </Router>
        </AppUserProvider>
    );
}

