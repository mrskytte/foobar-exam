import React, { useEffect, useState } from "react";
import Anime, { anime } from "react-anime";

export default function Frontpage(props) {
  const lastOrder = localStorage.getItem("lastOrder");
  const [MinimumLoadTimeDone, setMinimumLoadTime] = useState(false);

  useEffect(() => {
    setTimeout(showPage, 2000);
  }, []);

  function showPage() {
    if (!lastOrder) {
      setMinimumLoadTime(true);
      props.setFrontpageStatus(false);
    }
  }

  function addLastOrder() {
    const lastOrder = JSON.parse(localStorage.getItem("lastOrder"));
    lastOrder.forEach((oneItem) =>
      props.setAmount(oneItem.name, oneItem.amount)
    );
    props.addLastOrder(lastOrder);
    setMinimumLoadTime(true);
    props.setFrontpageStatus(false);
  }

  return (
    <div
      id="frontpage"
      className={MinimumLoadTimeDone && props.loadDone ? "hidden" : "visible"}
    >
      {lastOrder ? (
        <>
          <h1>HEY AGAIN!</h1>
          <h2>
            WELCOME BACK TO FOOBAR, WANT ANOTHER ROUND OR CHECK OUT THE MENU
            AGAIN?
          </h2>
          <div id="frontpage-buttons">
            <button onClick={addLastOrder}>REPEAT LAST ROUND?</button>
            <button
              onClick={() => {
                setMinimumLoadTime(true);
                props.setFrontpageStatus(false);
              }}
            >
              VIEW MENU
            </button>
          </div>
        </>
      ) : (
        <>
          <h1>HEY THERE!</h1>
          <h2>WELCOME TO FOOBAR</h2>
          <div id="loader">
            <Anime
              duration={750}
              delay={anime.stagger(100, { start: 100 })}
              translateX="80%"
              loop={true}
              direction={"alternate"}
            >
              <div id="top" className="loader-element"></div>
              <div id="middle" className="loader-element"></div>
              <div id="bottom" className="loader-element"></div>
            </Anime>
          </div>
        </>
      )}
    </div>
  );
}
