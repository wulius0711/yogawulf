import { loadConfigFromDB } from "@/lib/loadConfig";
import { buildThemeVars } from "@/lib/theme";
import Wizard from "@/components/Wizard";
import IframeResizer from "@/components/IframeResizer";

const GOOGLE_FONTS: Record<string, string> = {
  "Cormorant Garamond": "Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400",
  "Playfair Display":   "Playfair+Display:ital,wght@0,400;0,600;1,400",
  "Lora":               "Lora:ital,wght@0,400;0,500;1,400",
  "DM Serif Display":   "DM+Serif+Display:ital@0;1",
  "EB Garamond":        "EB+Garamond:ital,wght@0,400;0,500;1,400",
};

interface Props {
  searchParams: Promise<{ kunde?: string }>;
}

export default async function Home({ searchParams }: Props) {
  const { kunde } = await searchParams;
  const slug = kunde ?? process.env.SUPERADMIN_SLUG ?? "default";
  const config = await loadConfigFromDB(slug);

  const themeVars = buildThemeVars(config.company.primaryColor);

  const titleFont = config.formTitleFont ?? "Cormorant Garamond";
  const googleFontParam = GOOGLE_FONTS[titleFont];
  const googleFontUrl = googleFontParam
    ? `https://fonts.googleapis.com/css2?family=${googleFontParam}&display=swap`
    : null;

  return (
    <div id="embed-root" style={themeVars as React.CSSProperties}>
      <IframeResizer />
      {googleFontUrl && <link rel="stylesheet" href={googleFontUrl} />}
      <div style={{ padding: "2rem 1.5rem", background: config.formBgColor || "transparent" }}>
        {config.formTitle && (
          <h2
            style={{
              textAlign: "center",
              fontFamily: `'${titleFont}', Georgia, serif`,
              fontSize: "2rem",
              fontWeight: 300,
              fontStyle: "italic",
              letterSpacing: "0.02em",
              lineHeight: 1.3,
              color: "var(--text)",
              marginTop: "0.5rem",
              marginBottom: "3rem",
            }}
          >
            {config.formTitle}
          </h2>
        )}
        <Wizard config={config} slug={slug} />
      </div>
    </div>
  );
}
