/**
 * Generated by orval v6.7.1 🍺
 * Do not edit manually.
 * Medusa Storefront API
 * OpenAPI spec version: 1.0.0
 */
import { rest } from "msw"
import { faker } from "@faker-js/faker"

export const getPostCartsCartShippingMethodMock = () => ({
  cart: faker.helpers.randomize([{}, undefined]),
})

export const getPostCartsCartTaxesMock = () =>
  faker.helpers.randomize([{ cart: faker.helpers.randomize([{}, undefined]) }])

export const getPostCartsCartCompleteMock = () =>
  faker.helpers.randomize([
    { order: faker.helpers.randomize([{}, undefined]) },
    { cart: faker.helpers.randomize([{}, undefined]) },
    { cart: faker.helpers.randomize([{}, undefined]) },
  ])

export const getPostCartMock = () => ({
  cart: faker.helpers.randomize([{}, undefined]),
})

export const getPostCartsCartLineItemsMock = () => ({
  cart: faker.helpers.randomize([{}, undefined]),
})

export const getPostCartsCartPaymentSessionsMock = () => ({
  cart: faker.helpers.randomize([{}, undefined]),
})

export const getDeleteCartsCartDiscountsDiscountMock = () => ({
  cart: faker.helpers.randomize([{}, undefined]),
})

export const getDeleteCartsCartLineItemsItemMock = () => ({
  cart: faker.helpers.randomize([{}, undefined]),
})

export const getPostCartsCartLineItemsItemMock = () => ({
  cart: faker.helpers.randomize([{}, undefined]),
})

export const getDeleteCartsCartPaymentSessionsSessionMock = () => ({
  cart: faker.helpers.randomize([{}, undefined]),
})

export const getPostCartsCartPaymentSessionUpdateMock = () => ({
  cart: faker.helpers.randomize([{}, undefined]),
})

export const getGetCartsCartMock = () => ({
  cart: faker.helpers.randomize([{}, undefined]),
})

export const getPostCartsCartPaymentSessionsSessionMock = () => ({
  cart: faker.helpers.randomize([{}, undefined]),
})

export const getPostCartsCartPaymentSessionMock = () => ({
  cart: faker.helpers.randomize([{}, undefined]),
})

export const getPostCartsCartMock = () => ({
  cart: faker.helpers.randomize([{}, undefined]),
})

export const getCartMSW = () => [
  rest.post("*/carts/:id/shipping-methods", (_req, res, ctx) => {
    return res(
      ctx.delay(1000),
      ctx.status(200, "Mocked status"),
      ctx.json(getPostCartsCartShippingMethodMock())
    )
  }),
  rest.post("*/carts/:id/taxes", (_req, res, ctx) => {
    return res(
      ctx.delay(1000),
      ctx.status(200, "Mocked status"),
      ctx.json(getPostCartsCartTaxesMock())
    )
  }),
  rest.post("*/carts/:id/complete", (_req, res, ctx) => {
    return res(
      ctx.delay(1000),
      ctx.status(200, "Mocked status"),
      ctx.json(getPostCartsCartCompleteMock())
    )
  }),
  rest.post("*/carts", (_req, res, ctx) => {
    return res(
      ctx.delay(1000),
      ctx.status(200, "Mocked status"),
      ctx.json(getPostCartMock())
    )
  }),
  rest.post("*/carts/:id/line-items", (_req, res, ctx) => {
    return res(
      ctx.delay(1000),
      ctx.status(200, "Mocked status"),
      ctx.json(getPostCartsCartLineItemsMock())
    )
  }),
  rest.post("*/carts/:id/payment-sessions", (_req, res, ctx) => {
    return res(
      ctx.delay(1000),
      ctx.status(200, "Mocked status"),
      ctx.json(getPostCartsCartPaymentSessionsMock())
    )
  }),
  rest.delete("*/carts/:id/discounts/:code", (_req, res, ctx) => {
    return res(
      ctx.delay(1000),
      ctx.status(200, "Mocked status"),
      ctx.json(getDeleteCartsCartDiscountsDiscountMock())
    )
  }),
  rest.delete("*/carts/:id/line-items/:lineid", (_req, res, ctx) => {
    return res(
      ctx.delay(1000),
      ctx.status(200, "Mocked status"),
      ctx.json(getDeleteCartsCartLineItemsItemMock())
    )
  }),
  rest.post("*/carts/:id/line-items/:lineid", (_req, res, ctx) => {
    return res(
      ctx.delay(1000),
      ctx.status(200, "Mocked status"),
      ctx.json(getPostCartsCartLineItemsItemMock())
    )
  }),
  rest.delete("*/carts/:id/payment-sessions/:providerid", (_req, res, ctx) => {
    return res(
      ctx.delay(1000),
      ctx.status(200, "Mocked status"),
      ctx.json(getDeleteCartsCartPaymentSessionsSessionMock())
    )
  }),
  rest.post("*/carts/:id/payment-sessions/:providerid", (_req, res, ctx) => {
    return res(
      ctx.delay(1000),
      ctx.status(200, "Mocked status"),
      ctx.json(getPostCartsCartPaymentSessionUpdateMock())
    )
  }),
  rest.get("*/carts/:id", (_req, res, ctx) => {
    return res(
      ctx.delay(1000),
      ctx.status(200, "Mocked status"),
      ctx.json(getGetCartsCartMock())
    )
  }),
  rest.post(
    "*/carts/:id/payment-sessions/:providerid/refresh",
    (_req, res, ctx) => {
      return res(
        ctx.delay(1000),
        ctx.status(200, "Mocked status"),
        ctx.json(getPostCartsCartPaymentSessionsSessionMock())
      )
    }
  ),
  rest.post("*/carts/:id/payment-session", (_req, res, ctx) => {
    return res(
      ctx.delay(1000),
      ctx.status(200, "Mocked status"),
      ctx.json(getPostCartsCartPaymentSessionMock())
    )
  }),
  rest.post("*/store/carts/:id", (_req, res, ctx) => {
    return res(
      ctx.delay(1000),
      ctx.status(200, "Mocked status"),
      ctx.json(getPostCartsCartMock())
    )
  }),
]