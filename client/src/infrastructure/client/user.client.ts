import {_RootClient} from "./_root.client";
import {ProxyClient} from "./proxy/proxy";
import {UserCreateDto} from "../dto/user/user.create.dto";
import {ClientResponse} from "./response";
import {UserResponseDto} from "../dto/user/user.response.dto";

export class UserClient extends _RootClient {
    /* eslint-disable @typescript-eslint/no-useless-constructor */
    constructor(proxy: ProxyClient) {
        super(proxy);
    }

    getUsers(): Promise<ClientResponse<UserResponseDto[]>> {
       return this.proxy.get("/api/users");
    }

    addUser(content: UserCreateDto): Promise<ClientResponse<UserResponseDto>> {
        return this.proxy.post("/api/users", content);
    }

    removeUser(telegramId: number): Promise<ClientResponse<UserResponseDto>> {
        return this.proxy.del(`/api/users/${telegramId}`);
    }
}
