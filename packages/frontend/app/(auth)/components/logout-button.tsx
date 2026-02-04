import { logout } from "../actions/auth";

export default function LogoutButton() {
  return <button onClick={logout}>로그아웃</button>;
}
