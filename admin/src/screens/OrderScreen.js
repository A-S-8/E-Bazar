import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { PayPalButton } from 'react-paypal-button-v2'
import { Link } from 'react-router-dom'
import { Row, Col, ListGroup, Image, Card, Button } from 'react-bootstrap'
import { useDispatch, useSelector } from 'react-redux'
import Message from '../components/Message'
import Loader from '../components/Loader'
import {
  getOrderDetails,
  payOrder,
  deliverOrder,
} from '../actions/orderActions'
import {
  ORDER_PAY_RESET,
  ORDER_DELIVER_RESET,
} from '../constants/orderConstants'

const OrderScreen = ({ match, history }) => {
  const orderId = match.params.id

  const [sdkReady, setSdkReady] = useState(false)

  const dispatch = useDispatch()
  const cart = useSelector((state) => state.cart)

  const orderDetails = useSelector((state) => state.orderDetails)
  const { order, loading, error } = orderDetails

  console.log('order details', orderDetails)

  const orderPay = useSelector((state) => state.orderPay)
  const { loading: loadingPay, success: successPay } = orderPay

  const orderDeliver = useSelector((state) => state.orderDeliver)
  const { loading: loadingDeliver, success: successDeliver } = orderDeliver

  const userLogin = useSelector((state) => state.userLogin)
  const { userInfo } = userLogin

  // console.log("userLogin", userInfo, order);
  // userInfo._id

  if (!loading) {
    //   Calculate prices
    const addDecimals = (num) => {
      return (Math.round(num * 100) / 100).toFixed(2)
    }

    order.itemsPrice = addDecimals(
      order.orderItems.reduce((acc, item) => acc + item.price * item.qty, 0)
    )
  }

  // const makeTransaction = async () => {
  //   const userId = userInfo._id;
  //   const orderAmount = order.totalPrice;
  //   console.log("userid, amount", userId, orderAmount);
  //   const config = {
  //     headers: {
  //       "Content-Type": "application/json",
  //       Authorization: `Bearer ${userInfo.token}`,
  //     },
  //   };

  //   await axios.post(
  //     "/api/users/make_transaction",
  //     JSON.stringify({
  //       id: userId,
  //       amount: orderAmount,
  //     }),
  //     config
  //   );
  // };

  // useEffect(() => {
  //   if (loading === false && !order.isPaid && order.paymentMethod === "Wire") {
  //     const timer = setTimeout(() => {
  //       console.log("dispatch");
  //       dispatch(
  //         payOrder(orderId, {
  //           id: orderId,
  //           status: "COMPLETED",
  //           update_time: Date.now(),
  //           payer: { email_address: userInfo.email },
  //         })
  //       );
  //       makeTransaction();
  //     }, 500);
  //   }
  // }, [loading]);

  const makeTransaction = async () => {
    const config = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userInfo.token}`,
      },
    }

    const filteredOrder = await axios.get('/api/orders/filteredorders', config)
    const data = filteredOrder.data
    //console.log('data', data[0])
    const selectedOrder = data.find((e) => e._id === order._id)
    // console.log(selectedOrder)

    const response = await axios.post(
      '/api/bank/transaction',
      JSON.stringify({
        userId: userInfo._id,
        vendorId: selectedOrder.orderItems[0].product.user,
        amount: order.totalPrice,
      }),
      config
    )

    // console.log(response.data.message, 'make transition')

    if (response?.data?.message === 'done') {
      // order.paymentMethod.status = "COMPLETED";

      dispatch(
        payOrder(orderId, {
          id: orderId,
          status: 'COMPLETED',
          update_time: Date.now(),
          payer: { email_address: userInfo.email },
        })
      )
    }
  }

  useEffect(() => {
    if (!userInfo) {
      history.push('/login')
    }

    const addPayPalScript = async () => {
      const { data: clientId } = await axios.get('/api/config/paypal')
      const script = document.createElement('script')
      script.type = 'text/javascript'
      script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}`
      script.async = true
      script.onload = () => {
        setSdkReady(true)
      }
      document.body.appendChild(script)
    }

    if (!order || successPay || successDeliver || order._id !== orderId) {
      dispatch({ type: ORDER_PAY_RESET })
      dispatch({ type: ORDER_DELIVER_RESET })
      dispatch(getOrderDetails(orderId))
    } else if (!order.isPaid) {
      if (!window.paypal) {
        addPayPalScript()
      } else {
        setSdkReady(true)
      }
    }
  }, [dispatch, orderId, successPay, successDeliver, order])

  // const successPaymentHandler = (paymentResult) => {
  //   console.log(paymentResult, "paymentResult");
  //   dispatch(payOrder(orderId, paymentResult));

  //   makeTransaction();
  // };

  // const deliverHandler = () => {
  //   dispatch(deliverOrder(order));
  // };

  //console.log('orderorder', order)

  return loading ? (
    <Loader />
  ) : error ? (
    <Message variant='danger'>{error}</Message>
  ) : (
    <>
      <h1>Order {order._id}</h1>
      <Row>
        <Col md={8}>
          <ListGroup variant='flush'>
            <ListGroup.Item>
              <h2>Shipping</h2>
              <p>
                <strong>Name: </strong> {order.user.name}
              </p>
              <p>
                <strong>Email: </strong>{' '}
                <a href={`mailto:${order.user.email}`}>{order.user.email}</a>
              </p>
              <p>
                <strong>Address:</strong>
                {order.shippingAddress.address}, {order.shippingAddress.city}{' '}
                {order.shippingAddress.postalCode},{' '}
                {order.shippingAddress.country}
              </p>
              {order.isDelivered ? (
                <Message variant='success'>
                  Delivered on {order.deliveredAt}
                </Message>
              ) : (
                <Message variant='danger'>Not Delivered</Message>
              )}
            </ListGroup.Item>

            <ListGroup.Item>
              <h2>Payment Method</h2>
              <p>
                <strong>Method: </strong>
                {order.paymentMethod}
              </p>
              {order.isPaid && order.paymentResult.status === 'COMPLETED' ? (
                <Message variant='success'>Paid on {order.paidAt}</Message>
              ) : (
                <Message variant='success'>PROCESSING</Message>
              )}
            </ListGroup.Item>

            <ListGroup.Item>
              <h2>Order Items</h2>
              {order.orderItems.length === 0 ? (
                <Message>Order is empty</Message>
              ) : (
                <ListGroup variant='flush'>
                  {order.orderItems.map((item, index) => (
                    <ListGroup.Item key={index}>
                      <Row>
                        <Col md={1}>
                          <Image
                            src={item.image}
                            alt={item.name}
                            fluid
                            rounded
                          />
                        </Col>
                        <Col>
                          <Link to={`/product/${item.product}`}>
                            {item.name}
                          </Link>
                        </Col>
                        <Col md={4}>
                          {item.qty} x ${item.price} = ${item.qty * item.price}
                        </Col>
                      </Row>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              )}
            </ListGroup.Item>
          </ListGroup>
        </Col>
        <Col md={4}>
          <Card>
            <ListGroup variant='flush'>
              <ListGroup.Item>
                <h2>Order Summary</h2>
              </ListGroup.Item>
              <ListGroup.Item>
                <Row>
                  <Col>Items</Col>
                  <Col>${order.itemsPrice}</Col>
                </Row>
              </ListGroup.Item>
              <ListGroup.Item>
                <Row>
                  <Col>Shipping</Col>
                  <Col>${order.shippingPrice}</Col>
                </Row>
              </ListGroup.Item>
              <ListGroup.Item>
                <Row>
                  <Col>Tax</Col>
                  <Col>${order.taxPrice}</Col>
                </Row>
              </ListGroup.Item>
              <ListGroup.Item>
                <Row>
                  <Col>Total</Col>
                  <Col>${order.totalPrice}</Col>
                </Row>
              </ListGroup.Item>
              {!order.isPaid && (
                <ListGroup.Item>
                  {loadingPay && <Loader />}
                  {!sdkReady ? (
                    <Loader />
                  ) : cart?.paymentMethod === 'PayPal' ? (
                    <PayPalButton
                      amount={order.totalPrice}
                      // onSuccess={successPaymentHandler}
                    />
                  ) : (
                    <></>
                  )}
                </ListGroup.Item>
              )}
              {loadingDeliver && <Loader />}
              {userInfo &&
                userInfo.isAdmin &&
                order.isPaid &&
                !order.isDelivered && (
                  <ListGroup.Item>
                    <Button
                      type='button'
                      className='btn btn-block'
                      onClick={() => makeTransaction()}
                    >
                      {order.paymentResult.status === 'COMPLETED'
                        ? 'SUCCEEDED'
                        : 'PROCEED'}
                    </Button>
                  </ListGroup.Item>
                )}
            </ListGroup>
          </Card>
        </Col>
      </Row>
    </>
  )
}

export default OrderScreen
