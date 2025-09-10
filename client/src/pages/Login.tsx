import {useState} from "react";
import {Container, Paper, Stack, TextField} from "@mui/material";
import {Button, Typography, Form} from "antd";
import {StateFetchedBatch, StateNamed} from "../infrastructure/state";
import {ClientErrorResponse} from "../infrastructure/client/response";
import {getConnection} from "../tools/connections";
import {useAppUser} from "../contexts/user.context";
import { useNavigate } from "react-router-dom";

type State = StateFetchedBatch<Record<string, never>, ClientErrorResponse> | StateNamed<'FETCH'>;

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [state, setState] = useState<State>({ type: 'EMPTY'});
    const {signIn} = useAppUser();
    const navigate = useNavigate();

    const submit = async () => {
        setState({type: 'LOADING', startedTime: new Date()});
        const {client} = getConnection();
        const response = await client.auth.login({email: email, password: password});
        if (response.type == "SUCCESS") {
            setState({
                type: "SUCCESS",
                result: {}
            })
            signIn({
                accessToken: response.result.token,
                refreshToken: ''},
                true
            );
            navigate("/users", { replace: true });
        } else {
            setState({
                type: "ERROR",
                error: response,
            });
        }
    }

    return (
        <Container maxWidth="sm" sx={{ mt: 8 }}>
            <Paper sx={{ p: 4 }}>
                <Typography><Typography.Title>Admin Login</Typography.Title></Typography>
                <Form onFinish={submit}>
                    <Form.Item>
                        <Stack spacing={2}>
                            <TextField label="Email" value={email} onChange={e=>setEmail(e.target.value)} />
                            <TextField label="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
                            {state.type =='ERROR' && <Typography color="error">{state.error.errorMessage}</Typography>}
                            <Button type="primary" htmlType="submit" variant="outlined">Login</Button>
                        </Stack>
                    </Form.Item>

                </Form>
            </Paper>
        </Container>
    );
}

export default Login;
