# Database Plan

## Overview

The application is an e-commerce platform for ornamental plants.

Database: PostgreSQL

ORM: Prisma

---

# Entities

## User

Purpose:
Stores customer and administrator accounts.

Fields:

- id
- firstName
- lastName
- email
- password
- phone
- avatar
- role
- provider
- isVerified
- createdAt
- updatedAt

---

## Category

Purpose:
Groups products into categories.

Fields:

- id
- name
- slug
- description
- image

---

## Product

Purpose:
Stores plant information.

Fields:

- id
- name
- slug
- description
- price
- discountPrice
- sku
- stock
- featured
- published

Plant specific fields:

- height
- potSize
- difficulty
- light
- watering
- temperature
- petFriendly

System fields:

- createdAt
- updatedAt

---

## ProductImage

Purpose:
Stores multiple images for one product.

Fields:

- id
- url
- alt
- isPrimary
- productId

---

## Review

Purpose:
Stores customer reviews.

Fields:

- id
- rating
- comment
- createdAt
- userId
- productId

---

## Wishlist

Purpose:
Stores favourite products.

Fields:

- id
- userId
- productId

---

## Address

Purpose:
Stores shipping addresses.

Fields:

- id
- street
- city
- postalCode
- country
- userId

---

## Order

Purpose:
Stores customer orders.

Fields:

- id
- orderNumber
- status
- paymentMethod
- paymentStatus
- totalPrice
- shippingPrice
- createdAt
- userId

---

## OrderItem

Purpose:
Stores products inside an order.

Fields:

- id
- quantity
- price
- productId
- orderId

---

## BlogPost

Purpose:
Stores blog articles.

Fields:

- id
- title
- slug
- content
- image
- published
- createdAt

---

# Relationships

User
1 → N Orders

User
1 → N Reviews

User
1 → N Addresses

User
N → N Wishlist Products

Category
1 → N Products

Product
1 → N Images

Product
1 → N Reviews

Product
N → N Orders (through OrderItem)

Order
1 → N OrderItems