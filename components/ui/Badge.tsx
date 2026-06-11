type BadgeVariant = "new" | "bestseller" | "sale" | "custom";

const variants: Record<BadgeVariant, string> = {
  new: "bg-boko-dark text-white",
  bestseller: "bg-boko-footer text-white",
  sale: "bg-red-600 text-white",
  custom: "bg-boko-cream text-boko-dark border border-boko-border",
};

export default function Badge({ variant, label }: { variant: BadgeVariant; label: string }) {
  return (
    <span className={`text-[10px] font-semibold uppercase tracking-widest px-2 py-1 rounded-sm ${variants[variant]}`}>
      {label}
    </span>
  );
}
