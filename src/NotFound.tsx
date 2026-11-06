import ErrorPage from "./components/ErrorPage";

/** 404 — any URL that matches no route. */
export default function NotFound() {
  return <ErrorPage code={404} />;
}
