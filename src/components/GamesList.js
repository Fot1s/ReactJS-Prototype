import React from "react"
import GameItem from "./GameItem"

function GamesList(props) {
    return (
      <ul className="games-list">
      {
        props.games.map(game => (
          <GameItem
            key={game.id} game={game}
            handleBetProps={props.handleBetProps}
            />
        ))
      }
      </ul>
    )
}
export default GamesList
