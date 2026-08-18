import { JoyExhibition } from "@/components/sections/joy-exhibition";
import { getXpFiles } from "@/server/xp-files";

export default async function HomePage() {
  const xpFiles = await getXpFiles();
  return <JoyExhibition xpFiles={xpFiles} />;
}
