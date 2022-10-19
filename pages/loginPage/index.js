import LoginApp from "../../src/LoginApp";
import { AuthContextProvider } from "../../src/store/Login/auth-context";

const GoalList = () => {
  return (
  <AuthContextProvider>
    <LoginApp />
  </AuthContextProvider>
  );
}

export default GoalList;