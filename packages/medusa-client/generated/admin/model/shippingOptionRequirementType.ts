/**
 * Generated by orval v6.7.1 🍺
 * Do not edit manually.
 * Medusa Admin API
 * OpenAPI spec version: 1.0.0
 */

/**
 * The type of the requirement, this defines how the value will be compared to the Cart's total. `min_subtotal` requirements define the minimum subtotal that is needed for the Shipping Option to be available, while the `max_subtotal` defines the maximum subtotal that the Cart can have for the Shipping Option to be available.
 */
export type ShippingOptionRequirementType = "min_subtotal" | "max_subtotal"

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const ShippingOptionRequirementType = {
  min_subtotal: "min_subtotal" as ShippingOptionRequirementType,
  max_subtotal: "max_subtotal" as ShippingOptionRequirementType,
}