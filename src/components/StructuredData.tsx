import { getStructuredData } from "@/lib/site";

export function StructuredData() {
  const json = JSON.stringify(getStructuredData()).replace(/</g, "\\u003c");

  return (
    <script type="application/ld+json">{json}</script>
  );
}
