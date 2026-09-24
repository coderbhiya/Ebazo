import { ProductAttribute, ProductVariation } from './api';

// Attributes the customer chooses between (the ones that define variations)
export function variationAttributes(attributes: ProductAttribute[] | undefined): ProductAttribute[] {
  return (attributes || []).filter((a) => a.variation && a.options.length > 0);
}

// A variation matches when every attribute it defines equals the selection;
// an empty value on the variation means "Any <attribute>" (as in WooCommerce).
export function variationMatches(v: ProductVariation, selection: Record<string, string>): boolean {
  return Object.entries(selection).every(([name, value]) => {
    const own = v.attributes[name];
    return own === undefined || own === '' || own === value;
  });
}

// The variation for a complete selection (every variation attribute chosen), or null
export function findVariation(
  variations: ProductVariation[] | undefined,
  attributes: ProductAttribute[] | undefined,
  selection: Record<string, string>
): ProductVariation | null {
  const attrs = variationAttributes(attributes);
  if (!variations?.length || attrs.some((a) => !selection[a.name])) return null;
  // Prefer the most specific match: "6x8 / Clear / Heart" beats "6x8 / Clear / Any Shape"
  const specificity = (v: ProductVariation) => attrs.filter((a) => v.attributes[a.name]).length;
  return (
    variations
      .filter((v) => v.is_active !== 0 && variationMatches(v, selection))
      .sort((a, b) => specificity(b) - specificity(a))[0] || null
  );
}

// Whether picking `option` for `attrName` (keeping the other current choices) can lead to an
// existing variation — used to grey out combinations the admin never created.
export function isOptionAvailable(
  variations: ProductVariation[] | undefined,
  selection: Record<string, string>,
  attrName: string,
  option: string
): boolean {
  const next = { ...selection, [attrName]: option };
  return (variations || []).some((v) => v.is_active !== 0 && variationMatches(v, next));
}

// "8x10 in / Gold" (falls back to the attribute name for "Any")
export function variationLabel(v: ProductVariation, attributes?: ProductAttribute[]): string {
  const order = variationAttributes(attributes).map((a) => a.name);
  const names = order.length ? order : Object.keys(v.attributes);
  return names.map((n) => v.attributes[n] || `Any ${n}`).join(' / ');
}

// Label for the customer's actual selection (resolves "Any" to what they picked)
export function selectionLabel(selection: Record<string, string>, attributes?: ProductAttribute[]): string {
  return variationAttributes(attributes)
    .map((a) => selection[a.name])
    .filter(Boolean)
    .join(' / ');
}

// Every combination of the variation attributes' options (for "Generate variations")
export function allCombinations(attributes: ProductAttribute[]): Record<string, string>[] {
  return variationAttributes(attributes).reduce<Record<string, string>[]>(
    (combos, attr) => combos.flatMap((c) => attr.options.map((o) => ({ ...c, [attr.name]: o }))),
    [{}]
  );
}
