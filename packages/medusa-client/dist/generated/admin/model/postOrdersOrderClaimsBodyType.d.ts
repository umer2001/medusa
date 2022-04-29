/**
 * Generated by orval v6.7.1 🍺
 * Do not edit manually.
 * Medusa Admin API
 * OpenAPI spec version: 1.0.0
 */
/**
 * The type of the Claim. This will determine how the Claim is treated: `replace` Claims will result in a Fulfillment with new items being created, while a `refund` Claim will refund the amount paid for the claimed items.
 */
export declare type PostOrdersOrderClaimsBodyType = "replace" | "refund";
export declare const PostOrdersOrderClaimsBodyType: {
    replace: PostOrdersOrderClaimsBodyType;
    refund: PostOrdersOrderClaimsBodyType;
};