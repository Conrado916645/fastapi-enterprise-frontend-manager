import { useParams } from "react-router-dom";
import ErrorPage from "../components/ErrorPage";

const KNOWN = new Set(["400", "401", "403", "404", "408", "429", "500", "502", "503", "504"]);

/** /error/:code — linkable error pages (e.g. a reverse proxy's error_page can redirect here). */
export default function ErrorRoute() {
  const { code = "500" } = useParams();
  return <ErrorPage code={KNOWN.has(code) ? Number(code) : 404} />;
}
