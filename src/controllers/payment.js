// This is your Stripe CLI webhook secret for testing your endpoint locally.
const endpointSecret = process.env.STRIPE_WEBHOOK_VALIDATION_0;
const stripeInstance = require("../config/third-party/stripe");
const Subscription = require("../models/subscriptions");
const User = require("../models/user");
const Plan = require("../models/plan");
const LogError = require("../utils/errorLog");

const postCreateCheckoutSession = async (req, res) => {
  try {
    const { plan_id } = req.body;
    const plan = await Plan.findByPk(plan_id);
    const user = req.session.user;
    if (!plan || !user) return res.status(401).send();

    const session = await stripeInstance.checkout.sessions.create({
      line_items: [
        {
          // Provide the exact Price ID (for example, pr_1234) of the product you want to sell
          price: plan.stripe_plan_price_id,
          quantity: 1,
        },
      ],
      mode: "payment",
      customer_email: user.email,
      metadata: { plan_id },
      payment_method_types: ["card"],

      success_url: `${process.env.APP_URL}/payment/feedback/success`,
      cancel_url: `${process.env.APP_URL}/payment/feedback/fail`,
    });

    res.redirect(303, session.url);
  } catch (error) {
    console.log(error);
    LogError(req, error);
    res.status(400).send();
  }
};

const postStripeCheckoutWebhook = async (request, response) => {
  try {
    const sig = request.headers["stripe-signature"];

    console.log(`WEBHOOK CALLED`, true);
    let event;
    try {
      event = stripeInstance.webhooks.constructEvent(
        request.body,
        sig,
        endpointSecret
      );
    } catch (err) {
      response.status(400).send(`Webhook Error: ${err.message}`);
      return;
    }

    // Handle the event
    switch (event.type) {
      case "checkout.session.completed":
        const session = event.data.object;
        const user = await User.findOne({
          where: { email: session.customer_email },
        });
        if (!user) {
          console.log(`user not found`, false);
          return response.status(404).send();
        }

        // one year order
        const due_date = Date.now() + 365 * 24 * 60 * 60 * 1000;
        await Subscription.create({
          inifinte: true,
          cost: +session.amount_total,
          end_date: due_date,
          planId: +session.metadata.plan_id,
          userId: +user.id,
          contract_type: 0,
        });

        break;
      case "payment_intent.succeeded":
        break;
      // ... handle other event types
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    // Return a 200 response to acknowledge receipt of the event
    response.send();
  } catch (error) {
    LogError(req, error);
    console.log(error);
  }
};

// payementRouter.post(
//   "/create-payment-intent",
//   bodyParser.json(),
//   async (req, res) => {
//     try {
//       const { plan_id } = req.body;
//       console.log(plan_id);
//       const plan = await Plan.findByPk(plan_id);
//       if (!plan) return res.status(404).send();
//       // Create a PaymentIntent with the order amount and currency
//       const amount = plan.price - (plan.price * plan.discount) / 100;
//       const paymentIntent = await stripe.paymentIntents.create({
//         amount: amount * 100, // amount in cents unit
//         currency: "usd",
//         automatic_payment_methods: {
//           enabled: true,
//         },
//         metadata: {
//           userId: req.session.user.id,
//           userEmail: req.session.user.email,
//           plan_id: plan_id,
//         },
//       });

//       res.send({
//         clientSecret: paymentIntent.client_secret,
//       });
//     } catch (error) {
//       console.log(error);
//       res.status(400).send();
//     }
//   }
// );
module.exports.paymentController = {
  postCreateCheckoutSession,
  postStripeCheckoutWebhook,
};
