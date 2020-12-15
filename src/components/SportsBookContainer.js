import React from "react"
import GamesList from "./GamesList"
import Header from "./Header"


class SportsBookContainer extends React.Component {

  getRandomInt(min, max) {
      min = Math.ceil(min);
      max = Math.floor(max);
      return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  //get games data from server
  getData () {
    fetch('//phinnovation.000webhostapp.com/react-prototype/sportsbook/backend/index.php')
      .then((response) => response.json())
      .then(myJson => {
        this.setState({games:myJson}) ;
        this.checkForLiveGamesAndStartTimer()
      });
  }

  constructor(props) {
    super(props);
    this.state = { games: []};
  }

  componentDidMount() {
    this.getData()
  }

  componentWillUnmount() {
    //clear interval if set, no need to unset us the component will be unmounted
    if (this.intervalId) {
      clearInterval(this.intervalId)
    }

    if (this.webSocketIntervalId) {
      clearInterval(this.webSocketIntervalId)
    }
  }

  handleClick = (id, bet1x2, multiplier, formatedMultiplier) => {

    //find the correct game
    const gameFound = this.state.games.find(game => game.id === id)

    if (gameFound) {
      let currentMultiplier
      let betOn

      if (bet1x2 === "1") {
        currentMultiplier = gameFound.bet_1
        betOn = gameFound.home
      } else if (bet1x2 === "X") {
        currentMultiplier = gameFound.bet_x
        betOn = "Draw"
      } else if (bet1x2 === "2") {
        currentMultiplier = gameFound.bet_2
        betOn = gameFound.away
      } else {
        alert("Developer notice: Should not artive here! [SportsBookContainer]")
        return
      }

      //final check test that the bet has not changed after the user clicked
      if (currentMultiplier !== multiplier) {
        alert("The multiplier has changed from " + multiplier + " to " + currentMultiplier + "!") ;
      } else {
          alert("Place Bet on\n" + betOn + " with a multiplier of " + formatedMultiplier) ;
      }

    } else {
      alert("Oups Somehting went really wrong!")
    }
  }

  render() {
    return (
      <div className="container">
        <Header/>
        {
          this.state.games.length === 0 &&
          <p>Please wait! Loading Games...</p>
        }
        <GamesList
          games={this.state.games}
          handleBetProps={this.handleClick}
          />
      </div>
    )
  }

  checkForLiveGamesAndStartTimer = () => {
    const liveGames = this.state.games.find(game => game.live === 1)

    if (liveGames) {
      this.intervalId = setInterval(this.updateLiveGamesTimesClearUpdated, 1000)
      this.startListeningForUpdates()
    }
  }

  startListeningForUpdates = () => {
    this.webSocket = new WebSocket('wss://echo.websocket.org')

    this.webSocket.onopen = () => {
      //connected start fake multiplier updates on live games
      //every 15 secs send a live game to the socket
      //change multiplier before sending so on arrival we just setState
      this.webSocketIntervalId = setInterval(this.updateLiveGameMultiplier, 15000)
    }

    this.webSocket.onmessage = evt => {
      // listen to data sent from the websocket server
      const updatedBet = JSON.parse(evt.data)
      //find the correct game by id and update its bets

      for (let i = 0; i < this.state.games.length; i++) {
        const game = this.state.games[i]

        if (game.id === updatedBet.id) {
          //no else if, in the feature we might update multiple bets here ;)
          if (updatedBet.bet_1) {
            game.bet_1 = updatedBet.bet_1
            game.bet_1_updated = 5
          }

          if (updatedBet.bet_x) {
            game.bet_x = updatedBet.bet_x
            game.bet_x_updated = 5
          }

          if (updatedBet.bet_2) {
            game.bet_2 = updatedBet.bet_2
            game.bet_2_updated = 5
          }

          //socket sends only one update break when found
          this.setState({games:this.state.games})
          break ;
        }
      }
    }

    this.webSocket.onclose = () => {
      console.log('disconnected')
      if (this.webSocketIntervalId) {
        clearInterval(this.webSocketIntervalId)
      }
    }
  }

  updateLiveGameMultiplier = () => {
    const liveGames = []

    this.state.games.forEach((game) => {
      if (game.live === 1) {
        liveGames.push(game)
      }
    });

    if (liveGames.length > 0) {
      const gameIndex = this.getRandomInt(0,liveGames.length-1)
      const game = this.state.games[gameIndex]

      const gameToSendData = {}
      gameToSendData.id = game.id

      //which multi to update 1 x or 2 (0,1,2)
      const updateMulti = this.getRandomInt(0,2)

      const howMuchToChange = this.getRandomInt(-5,5)

      if (updateMulti === 0) {
        gameToSendData.bet_1 = game.bet_1 + howMuchToChange

        if (gameToSendData.bet_1 < 100) {
          gameToSendData.bet_1 = 100
        }
      } else if (updateMulti === 1) {
        gameToSendData.bet_x = game.bet_x + howMuchToChange

        if (gameToSendData.bet_x < 100) {
          gameToSendData.bet_x = 100
        }
      } else {
        gameToSendData.bet_2 = game.bet_2 + howMuchToChange

        if (gameToSendData.bet_2 < 100) {
          gameToSendData.bet_2 = 100
        }
      }

      //send to socket
      //we only send the game id and the updated multiplier,
      this.webSocket.send(JSON.stringify(gameToSendData));
    }
  }

  updateLiveGamesTimesClearUpdated = () => {
    this.state.games.forEach((game) => {

      //update running time
      if (game.live === 1) {
        game.time += 1 ;

        //if updated decrement and finaly remove
        if (game.bet_1_updated) {
          game.bet_1_updated-- ;

          if (game.bet_1_updated < 0) {
            delete game.bet_1_updated ;
          }
        }
        if (game.bet_x_updated) {
          game.bet_x_updated-- ;

          if (game.bet_x_updated < 0) {
            delete game.bet_x_updated ;
          }
        }
        if (game.bet_2_updated) {
          game.bet_2_updated-- ;

          if (game.bet_2_updated < 0) {
            delete game.bet_2_updated ;
          }
        }
      }
    });

    this.setState({games:this.state.games})
  }
}
export default SportsBookContainer
