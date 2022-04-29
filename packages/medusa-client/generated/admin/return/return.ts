/**
 * Generated by orval v6.7.1 🍺
 * Do not edit manually.
 * Medusa Admin API
 * OpenAPI spec version: 1.0.0
 */
import type {
  PostReturnsReturnCancel200,
  GetReturns200,
  PostReturnsReturnReceive200,
  PostReturnsReturnReceiveBody,
} from ".././model"
import { getClient } from "../../../src/custom-instance"

/**
 * Registers a Return as canceled.
 * @summary Cancel a Return
 */
export const postReturnsReturnCancel = (id: string) => {
  return getClient<PostReturnsReturnCancel200>({
    url: `/admin/returns/${id}/cancel`,
    method: "post",
  })
}
/**
 * Retrieves a list of Returns
 * @summary List Returns
 */
export const getReturns = () => {
  return getClient<GetReturns200>({ url: `/admin/returns`, method: "get" })
}
/**
 * Registers a Return as received. Updates statuses on Orders and Swaps accordingly.
 * @summary Receive a Return
 */
export const postReturnsReturnReceive = (
  id: string,
  postReturnsReturnReceiveBody: PostReturnsReturnReceiveBody
) => {
  return getClient<PostReturnsReturnReceive200>({
    url: `/admin/returns/${id}/receive`,
    method: "post",
    headers: { "Content-Type": "application/json" },
    data: postReturnsReturnReceiveBody,
  })
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AsyncReturnType<T extends (...args: any) => Promise<any>> = T extends (
  ...args: any
) => Promise<infer R>
  ? R
  : any

export type PostReturnsReturnCancelResult = NonNullable<
  AsyncReturnType<typeof postReturnsReturnCancel>
>
export type GetReturnsResult = NonNullable<AsyncReturnType<typeof getReturns>>
export type PostReturnsReturnReceiveResult = NonNullable<
  AsyncReturnType<typeof postReturnsReturnReceive>
>