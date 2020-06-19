import React, { useEffect, useState, useRef } from "react";
import Card from "./Card";
import beers from "./beers.json";
import Button from "./Button";
import Checkout from "./Checkout";
import OrderSummary from "./orderSummary";
import Payment from "./Payment";
import Header from "./Header";
import OrderConfirmation from "./orderConfirmation";
import Frontpage from "./Frontpage";

const endpoint = "https://fireorange-foobar.herokuapp.com";

export default function App(props) {
  const beersArray = Object.entries(beers);
  const [cards, setCards] = useState([]);
  const [filterStatus, setFilterStatus] = useState(false);
  const [sortingStatus, setSortingStatus] = useState(null);
  const [isCheckingOut, setCheckingOut] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [orderConfirmed, setOrderStatus] = useState(false);
  const [orderNumber, setOrderNumber] = useState("99");
  const [cardInformation, setCardInformation] = useState({});
  const [showFrontpage, setFrontpageStatus] = useState(true);
  const [beersInOrder, setBeersInOrder] = useState([]);

  let cardsInUse = [];
  let beersOnTap = useRef("");

  useEffect(() => {
    fetchData();
    async function fetchData() {
      const data = await fetch(endpoint);
      const response = await data.json();
      const onTap = Object.values(response.taps);
      let taps = [];
      onTap.forEach((oneTap) => {
        taps.push(oneTap.beer);
      });
      beersOnTap.current = beersArray.filter((beer) => taps.includes(beer[0]));
      setCards(beersOnTap.current);
    }
  }, []);

  function addBeerToOrder(beer, amount) {
    let newOrder = "";
    if (beersInOrder.some((oneOrder) => oneOrder.name === beer)) {
      newOrder = beersInOrder.map((oneOrder) => {
        if (oneOrder.name === beer) {
          return { name: oneOrder.name, amount: amount };
        } else {
          return { name: oneOrder.name, amount: oneOrder.amount };
        }
      });
    } else {
      newOrder = beersInOrder.concat({ name: beer, amount: amount });
    }
    setBeersInOrder(newOrder);
    setAmount(beer, amount);
  }

  function addLastOrder(order) {
    setBeersInOrder(order);
    setCheckingOut(true);
  }

  function sortByPrice() {
    let theseCards = [...cards];
    let sortedCards = "";
    if (sortingStatus === null || sortingStatus === "desc") {
      sortedCards = theseCards.sort((a, b) =>
        a[1].price > b[1].price ? 1 : -1
      );
      setSortingStatus("asc");
    } else {
      sortedCards = theseCards.sort((a, b) =>
        a[1].price < b[1].price ? 1 : -1
      );
      setSortingStatus("desc");
    }
    setCards(sortedCards);
  }

  function filterPopular() {
    if (!filterStatus) {
      let filteredCards = cards.filter((card) => card[1].popular === "true");
      setCards(filteredCards);
    } else {
      setCards(beersOnTap.current);
    }
    setFilterStatus(!filterStatus);
  }

  function setAmount(beer, amount) {
    beersOnTap.current = cards.map((c) => {
      if (c[0] === beer) {
        return [
          c[0],
          {
            name: c[1].name,
            desc: c[1].desc,
            alc: c[1].alc,
            image: c[1].image,
            popular: c[1].popular,
            price: c[1].price,
            type: c[1].type,
            amount: amount,
          },
        ];
      } else {
        return [
          c[0],
          {
            name: c[1].name,
            desc: c[1].desc,
            alc: c[1].alc,
            image: c[1].image,
            popular: c[1].popular,
            price: c[1].price,
            type: c[1].type,
            amount: c[1].amount,
          },
        ];
      }
    });

    setCards(beersOnTap.current);
  }

  function goToOrder() {
    setFilterStatus(false);
    setCards(beersOnTap.current);
    setCheckingOut(true);
  }

  function goToPayment() {
    setIsPaying(true);
  }

  function setPayment(method) {
    setPaymentMethod(method);
  }

  function cancelOrder() {
    setCheckingOut(false);
  }

  function cancelPayment() {
    setIsPaying(false);
  }

  function cancelPaymentMethod() {
    setPaymentMethod("");
  }

  async function postOrder() {
    const postData = JSON.stringify(beersInOrder);
    localStorage.setItem("lastOrder", postData);
    const posting = await fetch(`${endpoint}/order`, {
      method: "post",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
      },
      body: postData,
    });
    const response = await posting.json();
    handleOrderNumber(response.id);
  }

  function reset() {
    setPaymentMethod("");
    setIsPaying(false);
    setCheckingOut(false);
    setOrderStatus(false);
    setBeersInOrder([]);

    beersOnTap.current = cards.map((c) => {
      return [
        c[0],
        {
          name: c[1].name,
          desc: c[1].desc,
          alc: c[1].alc,
          image: c[1].image,
          popular: c[1].popular,
          price: c[1].price,
          type: c[1].type,
          amount: 0,
        },
      ];
    });
    setBeersInOrder([]);
    setCards(beersOnTap.current);
    console.log(cards);
    console.log("beersontap", beersOnTap.current);
  }

  function handleOrderNumber(id) {
    let orderId = id.toString();
    if (orderId.length === 1) {
      orderId = "0" + orderId;
    } else if (orderId.length > 2) {
      const n = orderId.length - 2;
      orderId = orderId.substring(n);
    }
    setOrderNumber(orderId);
    setOrderStatus(true);
  }

  let total = 0;
  beersInOrder.forEach((oneOrder) => {
    const isBeerInOrder = beersArray.filter(
      (beer) => beer[0] === oneOrder.name
    );

    let price = parseInt(isBeerInOrder[0][1].price);
    total += price * oneOrder.amount;
  });

  cardsInUse = cards.map((c) => (
    <Card
      {...c}
      key={c[0]}
      addBeerToOrder={addBeerToOrder}
      isCheckingOut={isCheckingOut}
      orderConfirmed={orderConfirmed}
    />
  ));

  return (
    <div className={showFrontpage ? "App frontpage-shown" : "App"}>
      <Frontpage
        className="visible"
        addLastOrder={addLastOrder}
        setAmount={setAmount}
        setFrontpageStatus={setFrontpageStatus}
      />
      {orderConfirmed ? (
        <></>
      ) : (
        <Header
          isCheckingOut={isCheckingOut}
          isPaying={isPaying}
          cancelOrder={cancelOrder}
          cancelPayment={cancelPayment}
          cancelPaymentMethod={cancelPaymentMethod}
          paymentMethod={paymentMethod}
        />
      )}
      <main>
        {orderConfirmed ? (
          <OrderConfirmation
            orderNumber={orderNumber}
            cards={cardsInUse}
            total={total}
            cardInformation={cardInformation}
            reset={reset}
          />
        ) : isPaying ? (
          <Payment
            postOrder={postOrder}
            setPayment={setPayment}
            paymentMethod={paymentMethod}
            setCardInformation={setCardInformation}
          />
        ) : isCheckingOut ? (
          <Checkout cards={cardsInUse} cancelOrder={cancelOrder} />
        ) : (
          <>
            <h1 className="main-title">ON TAP TODAY</h1>
            <div className="sortingButtons">
              <Button
                className="button-price"
                name={
                  sortingStatus === null
                    ? "PRICE"
                    : sortingStatus === "asc"
                    ? "PRICE ↑"
                    : "PRICE ↓"
                }
                callback={sortByPrice}
              />
              <Button
                className="button-popular"
                name={filterStatus ? "ALL" : "POPULAR"}
                callback={filterPopular}
              />
            </div>
            {cardsInUse}
          </>
        )}

        {isPaying ? (
          <></>
        ) : beersInOrder.length > 0 ? (
          <OrderSummary
            beersInOrder={beersInOrder}
            beerInfo={beersArray}
            goToOrder={goToOrder}
            goToPayment={goToPayment}
            isCheckingOut={isCheckingOut}
            total={total}
          />
        ) : (
          <></>
        )}
      </main>
    </div>
  );
}
