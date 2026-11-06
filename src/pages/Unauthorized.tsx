import ErrorPage from "../components/ErrorPage";

/** 401 — not signed in, or the session expired. */
export default function Unauthorized() {
  return <ErrorPage code={401} />;
}
