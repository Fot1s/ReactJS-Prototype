import React from "react"
import Bet1x2 from "./Bet1x2"

function formatTime(time) {
    // only minutes and seconds no hours
    var mins = ~~(time / 60);
    var secs = ~~time % 60;

    var ret = "";
    ret += "" + mins + ":" + (secs < 10 ? "0" : "");
    ret += "" + secs;
    return ret;
}

function GameItem(props) {

    const { id, live, time, date, home, away, home_goals, away_goals, bet_1, bet_x, bet_2, bet_1_updated,bet_x_updated,bet_2_updated } = props.game

    return (
      <li className="game-item">
        <div className="game-time-date">{live === 1 ? formatTime(time):date}</div>
        <div className="game-teams">{home}<br/>{away}</div>
        <div className="game-goals">{home_goals}<br/>{away_goals}</div>
        <Bet1x2 id={id} bet1x2="1" multiplier={bet_1} multiUpdated={bet_1_updated} handleBetProps={props.handleBetProps}/>
        <Bet1x2 id={id} bet1x2="X" multiplier={bet_x} multiUpdated={bet_x_updated} handleBetProps={props.handleBetProps}/>
        <Bet1x2 id={id} bet1x2="2" multiplier={bet_2} multiUpdated={bet_2_updated} handleBetProps={props.handleBetProps}/>
      </li>
    )
}

export default GameItem
