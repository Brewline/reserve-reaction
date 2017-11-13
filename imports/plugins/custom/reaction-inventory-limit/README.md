### :warning: Use this package only if you like instant tech debt\* :warning:
ok, you've been warned

---
# Inventory Limit
Limit the number of items per user

Features:

* Limit is applied to the quantity picker (an input of type "number")
* Limit is checked when adding to cart, and quantity is reduced to match the limit.
* *coming soon* Limit is checked prior to check to ensure that a user has not made
multiple purchases of the same product
* *coming soon* Limit is checked prior to check to ensure that multiple purchases
of the same product have been made using the same credit card

---
\* - Until it is a little more straightforward to modify core components, this package complete overrides a few core components and adds the necessary code. I did my best to keep file paths/names the same so you could refer back to the core source.

This is only a tiny bit better than forking the reaction repo and simply editing the core components. The nice thing is that you can still update Reaction using `reaction pull`, but if those core components are updated, the will remain overwritten by this package.

Again, you've been warned!
