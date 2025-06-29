import { ROUTES } from "@/router/routerConfig";
import { useEffect } from "react";
import { useNavigate } from "react-router";

const isAuthenticated = true;

function LoginPage() {
  const navigate = useNavigate();
  useEffect(() => {
    if (isAuthenticated) {
      navigate(ROUTES.SAMPLE, { replace: true });
    }
  }, [navigate]);
  return <div>LoginPage</div>;
}

export default LoginPage;
