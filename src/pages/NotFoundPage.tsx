import { Link } from "react-router";
import { ROUTES } from "@/router/routerConfig";
import { Button } from "@/components/ui/button";

function NotFoundPage() {
  return (
    <div>
      <h1>404 Not Found</h1>
      <p>The page you are looking for does not exist.</p>
      <Button asChild>
        <Link to={ROUTES.SAMPLE}>Go to Sample</Link>
      </Button>
    </div>
  );
}

export default NotFoundPage;
