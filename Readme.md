# RicheyData

RicheyData is a web app for buying mobile data bundles in Ghana. Customers and resellers/agents can buy MTN, Telecel and AirtelTigo bundles and pay with card or mobile money (MoMo) through Paystack.

This repository contains the **customer-facing site**.

## Features

- Sign up with phone number verification by SMS code
- Log in with phone/email and password
- Password reset by SMS code
- Browse data bundles by network (MTN, Telecel, AirtelTigo)
- Pay with card or MoMo via Paystack
- Order history and order status
- Separate pricing for customers and resellers/agents
- Bot protection with CAPTCHA (optional, switched on with a site key)
- Rate limits on verification and reset SMS to limit abuse

## Tech stack

- **Frontend:** React + Vite
- **Backend / database / auth:** Supabase (Postgres, Auth, Edge Functions)
- **Payments:** Paystack
- **SMS:** Frog SMS





All rights reserved.