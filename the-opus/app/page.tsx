import { redirect } from "next/navigation";

// Root: send everyone into the app. The proxy/auth guard bounces
// unauthenticated visitors on to /login.
export default function Home() {
  redirect("/feed");
}
