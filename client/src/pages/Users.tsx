import { useEffect, useState } from "react";
import { Container, Paper, Typography, Stack, TextField, Button, List, ListItem, ListItemText, IconButton } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import {getConnection} from "../tools/connections";
import {StateFetchedBatch, StateNamed} from "../infrastructure/state";
import {ClientErrorResponse} from "../infrastructure/client/response";

type State = StateFetchedBatch<Record<string, never>, ClientErrorResponse> | StateNamed<'FETCH'>;

const Users = () => {
    const [list, setList] = useState<any[]>([]);
    const [state, setState] = useState<State>({ type: 'EMPTY'});
    const [telegramId, setTelegramId] = useState<string>("");
    const [username, setUsername] = useState<string>("");

    useEffect(() => {
        getUsers();
        }, []);

    const getUsers = () => {
        const {client} = getConnection();
        setState({
            type: 'FETCH',
        });
        client.user.getUsers().then(response => {
            if (response.type == "SUCCESS") {
                setState({
                    type: "EMPTY",
                });
                setList(response.result);
            } else {
                setState({
                    type: "ERROR",
                    error: response,
                });
            }
        });
    }

    const add = async () => {
        const {client} = getConnection();
        setState({
            type: 'FETCH',
        })
        client.user.addUser({telegramId: Number(telegramId), username: username || undefined}).then(response => {
            if (response.type == "SUCCESS") {
                setState({
                    type: "EMPTY",
                });
                setTelegramId(""); setUsername("");
                getUsers();
            } else {
                setState({
                    type: "ERROR",
                    error: response,
                });
            }
        })
    };

    const remove = async (id:number) => {
        const {client} = getConnection();
        setState({
            type: 'FETCH',
        })
        client.user.removeUser(id).then(response => {
            if (response.type == "SUCCESS") {
                setState({
                    type: "EMPTY",
                });
                getUsers();
            } else {
                setState({
                    type: "ERROR",
                    error: response,
                });
            }
        })

    };

    return (
        <Container maxWidth="sm" sx={{ mt: 6 }}>
            <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>Allowed Telegram Users</Typography>
                <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                    <TextField label="Telegram ID" value={telegramId} onChange={e=>setTelegramId(e.target.value)} />
                    <TextField label="Username (@user)" value={username} onChange={e=>setUsername(e.target.value)} />
                    <Button variant="contained" onClick={add}>Add</Button>
                </Stack>
                <List>
                    {list.map((u:any)=>(
                        <ListItem key={u.telegramId} secondaryAction={
                            <IconButton edge="end" onClick={()=>remove(u.telegramId)}><DeleteIcon /></IconButton>
                        }>
                            <ListItemText primary={`${u.telegramId}`} secondary={u.username || ""}/>
                        </ListItem>
                    ))}
                </List>
            </Paper>
        </Container>
    );
}

export default Users;
