import React from "react"

function formatMultiplier(multiplier) {
    // only minutes and seconds no hours
    var left = ~~(multiplier / 100);
    var right = ~~multiplier % 100;

    var ret = "";
    ret += "" + left + "." + (right < 10 ? "0" : "");
    ret += "" + right;
    return ret;
}

function Bet1x2(props) {

    return (
      <div className="game-bet-button" onClick={() => props.handleBetProps(props.id, props.bet1x2, props.multiplier, formatMultiplier(props.multiplier))}>
        <span className="game-bet-1x2">{props.bet1x2}</span>
        <span className={'game-bet-multi' + (props.multiUpdated?'-updated':'')}>{formatMultiplier(props.multiplier)}</span>
      </div>
    )
}

export default Bet1x2
