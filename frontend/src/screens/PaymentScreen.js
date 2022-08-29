import React, { useRef, useState } from "react";
import { Form, Button, Col } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import FormContainer from "../components/FormContainer";
import CheckoutSteps from "../components/CheckoutSteps";
import { savePaymentMethod, saveSeccret } from "../actions/cartActions";

const PaymentScreen = ({ history }) => {
  const secretRef = useRef();
  const cart = useSelector((state) => state.cart);
  const { shippingAddress } = cart;

  if (!shippingAddress.address) {
    history.push("/shipping");
  }

  const [paymentMethod, setPaymentMethod] = useState("PayPal");

  const dispatch = useDispatch();

  const submitHandler = (e) => {
    e.preventDefault();
    const secret = secretRef?.current?.value;
    // console.log("secret", secret);
    dispatch(saveSeccret(secret));
    dispatch(savePaymentMethod(paymentMethod));
    history.push("/placeorder");
  };

  console.log("payment method", paymentMethod);

  return (
    <FormContainer>
      <CheckoutSteps step1 step2 step3 />
      <h1>Payment Method</h1>
      <Form onSubmit={submitHandler}>
        <Form.Group>
          <Form.Label as="legend">Select Method</Form.Label>
          <Col>
            <Form.Check
              type="radio"
              label="PayPal or Credit Card"
              id="PayPal"
              name="paymentMethod"
              value="PayPal"
              checked={paymentMethod === "PayPal"}
              onChange={(e) => setPaymentMethod(e.target.value)}
            ></Form.Check>
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <Form.Check
                type="radio"
                label="WIRE Transfer"
                id="Stripe"
                name="paymentMethod"
                value="Wire"
                onChange={(e) => setPaymentMethod(e.target.value)}
              ></Form.Check>
              {paymentMethod === "Wire" && (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    gap: "5px",
                  }}
                >
                  <div>secret</div>
                  <input type="text" id="fname" name="fname" ref={secretRef} />
                </div>
              )}
            </div>
          </Col>
        </Form.Group>

        <Button type="submit" variant="primary">
          Continue
        </Button>
      </Form>
    </FormContainer>
  );
};

export default PaymentScreen;
