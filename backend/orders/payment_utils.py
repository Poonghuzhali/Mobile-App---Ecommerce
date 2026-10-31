from decimal import Decimal


def cart_checkout_totals(cart) -> tuple[Decimal, Decimal, Decimal]:
    subtotal = Decimal(cart.total)
    shipping_fee = Decimal("49.00") if subtotal < Decimal("999") else Decimal("0")
    total = subtotal + shipping_fee
    return subtotal, shipping_fee, total
