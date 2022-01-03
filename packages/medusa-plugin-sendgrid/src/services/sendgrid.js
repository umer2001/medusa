import SendGrid from "@sendgrid/mail"

import { NotificationService } from "medusa-interfaces"
import { humanizeAmount, zeroDecimalCurrencies } from "medusa-core-utils"

class SendGridService extends NotificationService {
  static identifier = "sendgrid"

  /**
   * @param {Object} options - options defined in `medusa-config.js`
   *    e.g.
   *    {
   *      api_key: SendGrid api key
   *      from: Medusa <hello@medusa.example>,
   *      order_placed_template: 01234,
   *      order_updated_template: 56789,
   *      order_cancelled_template: 4242,
   *      user_password_reset_template: 0000,
   *      customer_password_reset_template: 1111,
   *    }
   */
  constructor(
    {
      storeService,
      orderService,
      returnService,
      swapService,
      cartService,
      lineItemService,
      claimService,
      fulfillmentService,
      fulfillmentProviderService,
      totalsService,
      productVariantService,
    },
    options
  ) {
    super()

    this.options_ = options

    this.fulfillmentProviderService_ = fulfillmentProviderService
    this.storeService_ = storeService
    this.lineItemService_ = lineItemService
    this.orderService_ = orderService
    this.cartService_ = cartService
    this.claimService_ = claimService
    this.returnService_ = returnService
    this.swapService_ = swapService
    this.fulfillmentService_ = fulfillmentService
    this.totalsService_ = totalsService
    this.productVariantService_ = productVariantService

    SendGrid.setApiKey(options.api_key)
  }

  async fetchAttachments(event, data, attachmentGenerator) {
    switch (event) {
      case "swap.created":
      case "order.return_requested": {
        let attachments = []
        const { shipping_method, shipping_data } = data.return_request
        if (shipping_method) {
          const provider = shipping_method.shipping_option.provider_id

          const lbl = await this.fulfillmentProviderService_.retrieveDocuments(
            provider,
            shipping_data,
            "label"
          )

          attachments = attachments.concat(
            lbl.map((d) => ({
              name: "return-label",
              base64: d.base_64,
              type: d.type,
            }))
          )
        }

        if (attachmentGenerator && attachmentGenerator.createReturnInvoice) {
          const base64 = await attachmentGenerator.createReturnInvoice(
            data.order,
            data.return_request.items
          )
          attachments.push({
            name: "invoice",
            base64,
            type: "application/pdf",
          })
        }

        return attachments
      }
      default:
        return []
    }
  }

  async fetchData(event, eventData, attachmentGenerator) {
    switch (event) {
      case "order.return_requested":
        return this.returnRequestedData(eventData, attachmentGenerator)
      case "swap.shipment_created":
        return this.swapShipmentCreatedData(eventData, attachmentGenerator)
      case "claim.shipment_created":
        return this.claimShipmentCreatedData(eventData, attachmentGenerator)
      case "order.items_returned":
        return this.itemsReturnedData(eventData, attachmentGenerator)
      case "swap.received":
        return this.swapReceivedData(eventData, attachmentGenerator)
      case "swap.created":
        return this.swapCreatedData(eventData, attachmentGenerator)
      case "gift_card.created":
        return this.gcCreatedData(eventData, attachmentGenerator)
      case "order.gift_card_created":
        return this.gcCreatedData(eventData, attachmentGenerator)
      case "order.placed":
        return this.orderPlacedData(eventData, attachmentGenerator)
      case "order.shipment_created":
        return this.orderShipmentCreatedData(eventData, attachmentGenerator)
      case "order.canceled":
        return this.orderCanceledData(eventData, attachmentGenerator)
      case "user.password_reset":
        return this.userPasswordResetData(eventData, attachmentGenerator)
      case "customer.password_reset":
        return this.customerPasswordResetData(eventData, attachmentGenerator)
      case "restock-notification.restocked":
        return await this.restockNotificationData(
          eventData,
          attachmentGenerator
        )
      default:
        return {}
    }
  }

  getLocalizedTemplateId(event, locale) {
    if (this.options_.localization && this.options_.localization[locale]) {
      const map = this.options_.localization[locale]
      switch (event) {
        case "order.return_requested":
          return map.order_return_requested_template
        case "swap.shipment_created":
          return map.swap_shipment_created_template
        case "claim.shipment_created":
          return map.claim_shipment_created_template
        case "order.items_returned":
          return map.order_items_returned_template
        case "swap.received":
          return map.swap_received_template
        case "swap.created":
          return map.swap_created_template
        case "gift_card.created":
          return map.gift_card_created_template
        case "order.gift_card_created":
          return map.gift_card_created_template
        case "order.placed":
          return map.order_placed_template
        case "order.shipment_created":
          return map.order_shipped_template
        case "order.canceled":
          return map.order_canceled_template
        case "user.password_reset":
          return map.user_password_reset_template
        case "customer.password_reset":
          return map.customer_password_reset_template
        case "restock-notification.restocked":
          return map.medusa_restock_template
        default:
          return null
      }
    }
    return null
  }

  getTemplateId(event) {
    switch (event) {
      case "order.return_requested":
        return this.options_.order_return_requested_template
      case "swap.shipment_created":
        return this.options_.swap_shipment_created_template
      case "claim.shipment_created":
        return this.options_.claim_shipment_created_template
      case "order.items_returned":
        return this.options_.order_items_returned_template
      case "swap.received":
        return this.options_.swap_received_template
      case "swap.created":
        return this.options_.swap_created_template
      case "gift_card.created":
        return this.options_.gift_card_created_template
      case "order.gift_card_created":
        return this.options_.gift_card_created_template
      case "order.placed":
        return this.options_.order_placed_template
      case "order.shipment_created":
        return this.options_.order_shipped_template
      case "order.canceled":
        return this.options_.order_canceled_template
      case "user.password_reset":
        return this.options_.user_password_reset_template
      case "customer.password_reset":
        return this.options_.customer_password_reset_template
      case "restock-notification.restocked":
        return this.options_.medusa_restock_template
      default:
        return null
    }
  }

  async sendNotification(event, eventData, attachmentGenerator) {
    let templateId = this.getTemplateId(event)

    if (!templateId) {
      return false
    }

    const data = await this.fetchData(event, eventData, attachmentGenerator)
    const attachments = await this.fetchAttachments(
      event,
      data,
      attachmentGenerator
    )

    if (data.locale) {
      templateId = this.getLocalizedTemplateId(event, data.locale) || templateId
    }

    const sendOptions = {
      template_id: templateId,
      from: this.options_.from,
      to: data.email,
      dynamic_template_data: data,
      has_attachments: attachments?.length,
    }

    if (attachments?.length) {
      sendOptions.has_attachments = true
      sendOptions.attachments = attachments.map((a) => {
        return {
          content: a.base64,
          filename: a.name,
          type: a.type,
          disposition: "attachment",
          contentId: a.name,
        }
      })
    }

    const status = await SendGrid.send(sendOptions)
      .then(() => "sent")
      .catch(() => "failed")

    // We don't want heavy docs stored in DB
    delete sendOptions.attachments

    return { to: data.email, status, data: sendOptions }
  }

  async resendNotification(notification, config, attachmentGenerator) {
    const sendOptions = {
      ...notification.data,
      to: config.to || notification.to,
    }

    const attachs = await this.fetchAttachments(
      notification.event_name,
      notification.data.dynamic_template_data,
      attachmentGenerator
    )

    sendOptions.attachments = attachs.map((a) => {
      return {
        content: a.base64,
        filename: a.name,
        type: a.type,
        disposition: "attachment",
        contentId: a.name,
      }
    })

    const status = await SendGrid.send(sendOptions)
      .then(() => "sent")
      .catch(() => "failed")

    return { to: sendOptions.to, status, data: sendOptions }
  }

  /**
   * Sends an email using SendGrid.
   * @param {string} templateId - id of template in SendGrid
   * @param {string} from - sender of email
   * @param {string} to - receiver of email
   * @param {Object} data - data to send in mail (match with template)
   * @returns {Promise} result of the send operation
   */
  async sendEmail(options) {
    try {
      return SendGrid.send(options)
    } catch (error) {
      throw error
    }
  }

  async orderShipmentCreatedData({ id, fulfillment_id }, attachmentGenerator) {
    const order = await this.orderService_.retrieve(id, {
      select: [
        "shipping_total",
        "discount_total",
        "tax_total",
        "refunded_total",
        "gift_card_total",
        "subtotal",
        "total",
        "refundable_amount",
      ],
      relations: [
        "customer",
        "billing_address",
        "shipping_address",
        "discounts",
        "discounts.rule",
        "discounts.rule.valid_for",
        "shipping_methods",
        "shipping_methods.shipping_option",
        "payments",
        "fulfillments",
        "returns",
        "gift_cards",
        "gift_card_transactions",
      ],
    })

    const shipment = await this.fulfillmentService_.retrieve(fulfillment_id, {
      relations: ["items", "tracking_links"],
    })

    const locale = await this.extractLocale(order)

    return {
      locale,
      order,
      date: shipment.shipped_at.toDateString(),
      email: order.email,
      fulfillment: shipment,
      tracking_links: shipment.tracking_links,
      tracking_number: shipment.tracking_numbers.join(", "),
    }
  }

  async orderPlacedData({ id }) {
    const order = await this.orderService_.retrieve(id, {
      select: [
        "shipping_total",
        "discount_total",
        "tax_total",
        "refunded_total",
        "gift_card_total",
        "subtotal",
        "total",
      ],
      relations: [
        "customer",
        "billing_address",
        "shipping_address",
        "discounts",
        "discounts.rule",
        "discounts.rule.valid_for",
        "shipping_methods",
        "shipping_methods.shipping_option",
        "payments",
        "fulfillments",
        "returns",
        "gift_cards",
        "gift_card_transactions",
      ],
    })

    const {
      subtotal,
      tax_total,
      discount_total,
      shipping_total,
      gift_card_total,
      total,
    } = order

    const taxRate = order.tax_rate / 100
    const currencyCode = order.currency_code.toUpperCase()

    const items = this.processItems_(order.items, taxRate, currencyCode)

    let discounts = []
    if (order.discounts) {
      discounts = order.discounts.map((discount) => {
        return {
          is_giftcard: false,
          code: discount.code,
          descriptor: `${discount.rule.value}${
            discount.rule.type === "percentage" ? "%" : ` ${currencyCode}`
          }`,
        }
      })
    }

    let giftCards = []
    if (order.gift_cards) {
      giftCards = order.gift_cards.map((gc) => {
        return {
          is_giftcard: true,
          code: gc.code,
          descriptor: `${gc.value} ${currencyCode}`,
        }
      })

      discounts.concat(giftCards)
    }

    const locale = await this.extractLocale(order)

    return {
      ...order,
      locale,
      has_discounts: order.discounts.length,
      has_gift_cards: order.gift_cards.length,
      date: order.created_at.toDateString(),
      items,
      discounts,
      subtotal: `${this.humanPrice_(
        subtotal * (1 + taxRate),
        currencyCode
      )} ${currencyCode}`,
      gift_card_total: `${this.humanPrice_(
        gift_card_total * (1 + taxRate),
        currencyCode
      )} ${currencyCode}`,
      tax_total: `${this.humanPrice_(tax_total, currencyCode)} ${currencyCode}`,
      discount_total: `${this.humanPrice_(
        discount_total * (1 + taxRate),
        currencyCode
      )} ${currencyCode}`,
      shipping_total: `${this.humanPrice_(
        shipping_total * (1 + taxRate),
        currencyCode
      )} ${currencyCode}`,
      total: `${this.humanPrice_(total, currencyCode)} ${currencyCode}`,
    }
  }

  async gcCreatedData({ id }) {
    const giftCard = await this.giftCardService_.retrieve(id, {
      relations: ["region", "order"],
    })

    if (!giftCard.order) {
      return
    }

    const taxRate = giftCard.region.tax_rate / 100

    const locale = await this.extractLocale(order)

    return {
      ...giftCard,
      locale,
      email: giftCard.order.email,
      display_value: giftCard.value * (1 + taxRate),
    }
  }

  async returnRequestedData({ id, return_id }) {
    // Fetch the return request
    const returnRequest = await this.returnService_.retrieve(return_id, {
      relations: [
        "items",
        "items.item",
        "items.item.variant",
        "items.item.variant.product",
        "shipping_method",
        "shipping_method.shipping_option",
      ],
    })

    const items = await this.lineItemService_.list({
      id: returnRequest.items.map(({ item_id }) => item_id),
    })

    returnRequest.items = returnRequest.items.map((item) => {
      const found = items.find((i) => i.id === item.item_id)
      return {
        ...item,
        item: found,
      }
    })

    // Fetch the order
    const order = await this.orderService_.retrieve(id, {
      select: ["total"],
      relations: [
        "items",
        "discounts",
        "discounts.rule",
        "discounts.rule.valid_for",
        "shipping_address",
        "returns",
        "swaps",
        "swaps.additional_items",
      ],
    })

    let merged = [...order.items]

    // merge items from order with items from order swaps
    if (order.swaps && order.swaps.length) {
      for (const s of order.swaps) {
        merged = [...merged, ...s.additional_items]
      }
    }

    // Calculate which items are in the return
    const returnItems = returnRequest.items.map((i) => {
      const found = merged.find((oi) => oi.id === i.item_id)
      return {
        ...found,
        quantity: i.quantity,
      }
    })

    const taxRate = order.tax_rate / 100
    const currencyCode = order.currency_code.toUpperCase()

    // Get total of the returned products
    const item_subtotal = this.totalsService_.getRefundTotal(order, returnItems)

    // If the return has a shipping method get the price and any attachments
    let shippingTotal = 0
    if (returnRequest.shipping_method) {
      shippingTotal = returnRequest.shipping_method.price * (1 + taxRate)
    }

    const locale = await this.extractLocale(order)

    return {
      locale,
      has_shipping: !!returnRequest.shipping_method,
      email: order.email,
      items: this.processItems_(returnItems, taxRate, currencyCode),
      subtotal: `${this.humanPrice_(
        item_subtotal,
        currencyCode
      )} ${currencyCode}`,
      shipping_total: `${this.humanPrice_(
        shippingTotal,
        currencyCode
      )} ${currencyCode}`,
      refund_amount: `${this.humanPrice_(
        returnRequest.refund_amount,
        currencyCode
      )} ${currencyCode}`,
      return_request: {
        ...returnRequest,
        refund_amount: `${this.humanPrice_(
          returnRequest.refund_amount,
          currencyCode
        )} ${currencyCode}`,
      },
      order,
      date: returnRequest.updated_at.toDateString(),
    }
  }

  async swapCreatedData({ id }) {
    const store = await this.storeService_.retrieve()
    const swap = await this.swapService_.retrieve(id, {
      relations: [
        "additional_items",
        "return_order",
        "return_order.items",
        "return_order.items.item",
        "return_order.shipping_method",
        "return_order.shipping_method.shipping_option",
      ],
    })

    const returnRequest = swap.return_order

    const items = await this.lineItemService_.list({
      id: returnRequest.items.map(({ item_id }) => item_id),
    })

    returnRequest.items = returnRequest.items.map((item) => {
      const found = items.find((i) => i.id === item.item_id)
      return {
        ...item,
        item: found,
      }
    })

    const swapLink = store.swap_link_template.replace(
      /\{cart_id\}/,
      swap.cart_id
    )

    const order = await this.orderService_.retrieve(swap.order_id, {
      select: ["total"],
      relations: [
        "items",
        "discounts",
        "discounts.rule",
        "discounts.rule.valid_for",
        "shipping_address",
        "swaps",
        "swaps.additional_items",
      ],
    })

    const taxRate = order.tax_rate / 100
    const currencyCode = order.currency_code.toUpperCase()

    let merged = [...order.items]

    // merge items from order with items from order swaps
    if (order.swaps && order.swaps.length) {
      for (const s of order.swaps) {
        merged = [...merged, ...s.additional_items]
      }
    }

    const returnItems = this.processItems_(
      swap.return_order.items.map((i) => {
        const found = merged.find((oi) => oi.id === i.item_id)
        return {
          ...found,
          quantity: i.quantity,
        }
      }),
      taxRate,
      currencyCode
    )

    const returnTotal = this.totalsService_.getRefundTotal(order, returnItems)

    const constructedOrder = {
      ...order,
      shipping_methods: [],
      items: swap.additional_items,
    }

    const additionalTotal = this.totalsService_.getTotal(constructedOrder)

    const refundAmount = swap.return_order.refund_amount

    const locale = await this.extractLocale(order)

    return {
      locale,
      swap,
      order,
      return_request: returnRequest,
      date: swap.updated_at.toDateString(),
      swap_link: swapLink,
      email: order.email,
      items: this.processItems_(swap.additional_items, taxRate, currencyCode),
      return_items: returnItems,
      return_total: `${this.humanPrice_(
        returnTotal,
        currencyCode
      )} ${currencyCode}`,
      refund_amount: `${this.humanPrice_(
        refundAmount,
        currencyCode
      )} ${currencyCode}`,
      additional_total: `${this.humanPrice_(
        additionalTotal,
        currencyCode
      )} ${currencyCode}`,
    }
  }

  async itemsReturnedData(data) {
    return this.returnRequestedData(data)
  }

  async swapShipmentCreatedData({ id, fulfillment_id }) {
    const swap = await this.swapService_.retrieve(id, {
      relations: [
        "shipping_address",
        "shipping_methods",
        "additional_items",
        "return_order",
        "return_order.items",
      ],
    })

    const order = await this.orderService_.retrieve(swap.order_id, {
      relations: [
        "items",
        "discounts",
        "discounts.rule",
        "discounts.rule.valid_for",
        "swaps",
        "swaps.additional_items",
      ],
    })

    let merged = [...order.items]

    // merge items from order with items from order swaps
    if (order.swaps && order.swaps.length) {
      for (const s of order.swaps) {
        merged = [...merged, ...s.additional_items]
      }
    }

    const taxRate = order.tax_rate / 100
    const currencyCode = order.currency_code.toUpperCase()

    const returnItems = this.processItems_(
      swap.return_order.items.map((i) => {
        const found = merged.find((oi) => oi.id === i.item_id)
        return {
          ...found,
          quantity: i.quantity,
        }
      }),
      taxRate,
      currencyCode
    )

    const returnTotal = this.totalsService_.getRefundTotal(order, returnItems)

    const constructedOrder = {
      ...order,
      shipping_methods: swap.shipping_methods,
      items: swap.additional_items,
    }

    const additionalTotal = this.totalsService_.getTotal(constructedOrder)

    const refundAmount = swap.return_order.refund_amount

    const shipment = await this.fulfillmentService_.retrieve(fulfillment_id, {
      relations: ["tracking_links"],
    })

    const locale = await this.extractLocale(order)

    return {
      locale,
      swap,
      order,
      items: this.processItems_(swap.additional_items, taxRate, currencyCode),
      date: swap.updated_at.toDateString(),
      email: order.email,
      tax_amount: `${this.humanPrice_(
        swap.difference_due * taxRate,
        currencyCode
      )} ${currencyCode}`,
      paid_total: `${this.humanPrice_(
        swap.difference_due,
        currencyCode
      )} ${currencyCode}`,
      return_total: `${this.humanPrice_(
        returnTotal,
        currencyCode
      )} ${currencyCode}`,
      refund_amount: `${this.humanPrice_(
        refundAmount,
        currencyCode
      )} ${currencyCode}`,
      additional_total: `${this.humanPrice_(
        additionalTotal,
        currencyCode
      )} ${currencyCode}`,
      fulfillment: shipment,
      tracking_links: shipment.tracking_links,
      tracking_number: shipment.tracking_numbers.join(", "),
    }
  }

  async claimShipmentCreatedData({ id, fulfillment_id }) {
    const claim = await this.claimService_.retrieve(id, {
      relations: ["order", "order.items", "order.shipping_address"],
    })

    const shipment = await this.fulfillmentService_.retrieve(fulfillment_id, {
      relations: ["tracking_links"],
    })

    const locale = await this.extractLocale(claim.order)

    return {
      locale,
      email: claim.order.email,
      claim,
      order: claim.order,
      fulfillment: shipment,
      tracking_links: shipment.tracking_links,
      tracking_number: shipment.tracking_numbers.join(", "),
    }
  }

  async restockNotificationData({ variant_id, emails }) {
    const variant = await this.productVariantService_.retrieve(variant_id, {
      relations: ["product"],
    })

    let thumb
    if (variant.product.thumbnail) {
      thumb = this.normalizeThumbUrl_(variant.product.thumbnail)
    }

    return {
      product: {
        ...variant.product,
        thumbnail: thumb,
      },
      variant,
      variant_id,
      emails,
    }
  }

  userPasswordResetData(data) {
    return data
  }

  customerPasswordResetData(data) {
    return data
  }

  processItems_(items, taxRate, currencyCode) {
    return items.map((i) => {
      return {
        ...i,
        thumbnail: this.normalizeThumbUrl_(i.thumbnail),
        price: `${this.humanPrice_(
          i.unit_price * (1 + taxRate),
          currencyCode
        )} ${currencyCode}`,
      }
    })
  }

  humanPrice_(amount, currency) {
    if (!amount) {
      return "0.00"
    }

    const normalized = humanizeAmount(amount, currency)
    return normalized.toFixed(
      zeroDecimalCurrencies.includes(currency.toLowerCase()) ? 0 : 2
    )
  }

  normalizeThumbUrl_(url) {
    if (!url) {
      return null
    }

    if (url.startsWith("http")) {
      return url
    } else if (url.startsWith("//")) {
      return `https:${url}`
    }
    return url
  }

  async extractLocale(fromOrder) {
    if (fromOrder.cart_id) {
      try {
        const cart = await this.cartService_.retrieve(fromOrder.cart_id, {
          select: ["context"],
        })

        if (cart.context && cart.context.locale) {
          return cart.context.locale
        }
      } catch (err) {
        console.log(err)
        console.warn("Failed to gather context for order")
        return null
      }
    }
    return null
  }
}

export default SendGridService