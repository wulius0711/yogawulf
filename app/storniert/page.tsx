import { Suspense } from "react";
import StornierenContent from "./StornierenContent";

export default function StornierenPage() {
  return (
    <Suspense>
      <StornierenContent />
    </Suspense>
  );
}
