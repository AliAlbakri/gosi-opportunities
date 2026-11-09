export function BrandIcon({
  name,
  tone = "rich-blue",
  className = "h-8 w-8",
}: {
  name: string;
  tone?: "rich-blue" | "white";
  className?: string;
}) {
  return <img src={`/brand/icons/${tone}/${name}.png`} alt="" className={className} />;
}
