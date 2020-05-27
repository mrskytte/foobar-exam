import React from "react";

export default function Checkout(props) {
  console.log("bababab", props.cards);
  return (
    <main>
      <h1>ORDER SUMMARY</h1>
      <button onClick={props.cancelOrder}>X</button>
      <table>
        <thead>
          <tr>
            <th>Item</th>
            <th>Price</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>{props.cards}</tbody>
      </table>
    </main>
  );
}
