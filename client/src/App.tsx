import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Users from "./pages/Users";
import {AppUserProvider, useAppUser} from "./contexts/user.context";
import {AuthCredentialsWithClaims, parseTokenClaims} from "./tools/token";
import {createClientManager} from "./infrastructure/client/manager";
import {AxiosProxy} from "./infrastructure/client/proxy/axios.proxy";
import React from "react";

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { isAuthorized } = useAppUser();
    return isAuthorized ? <>{children}</> : <Navigate to="/login" replace/>;
};

export default function App() {
    const token = localStorage.getItem('token');
    const user: AuthCredentialsWithClaims | null = token
    ? {
            accessToken: token, 
            refreshToken: token,
            claims: parseTokenClaims(token)
    }
    : null;
    
    const client = createClientManager(new AxiosProxy(process.env.REACT_APP_PUBLIC_API_URL ?? '', token ?? ''));
    
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

