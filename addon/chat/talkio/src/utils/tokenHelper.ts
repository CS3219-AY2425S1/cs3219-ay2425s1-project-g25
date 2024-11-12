import { UserInfo } from "@/types/message";
import { jwtDecode } from "jwt-decode";

export function decodeToken(accessToken: string): UserInfo {
    const decoded = jwtDecode<{ id: string; username: string }>(accessToken);
    return {
        id: decoded.id,
        username: decoded.username,
    };
}
