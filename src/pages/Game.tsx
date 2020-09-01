import React, { useEffect, useState, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { FormattedDate, useIntl } from 'react-intl';
import { Container, Grid, Image, Label, Progress, Menu, Card, Responsive, Segment, Button } from 'semantic-ui-react';
import io from 'socket.io-client';
import styled from 'styled-components';
import { GameCardProps, University, GameStatus } from '@/components/GameCard';
import MainEventPopup from "@/components/MainEventPopup";
import config from '@/config';
import KaistLogo from '@/public/kaist.png';
import PostechLogo from '@/public/postech.png';
import { GlobalContext } from '@/context';
import LolImage from '@/public/lol.jpg';
import axios from '@/utils/axios';


const StyledProgress = styled(Progress)`
  color: #fafafa;
  direction: rtl;
`;

const Banner = styled(Menu)`
  background-color: #696969 !important;
  margin-bottom: 0 !important;
  text-align: center;
`;

const Team = styled.div`
  height: 20vh;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;

`
export enum LogoState {
  None = 'NONE',
  Kaist = 'K',
  Postech = 'P'
}

const defaultState: GameCardProps = {
  dividend: 1000,
  game_type: 'ai',
  kaist_arr: [],
  postech_arr: [],
  playing: GameStatus.Exiting,
  result: { [University.Kaist]: 0, [University.Postech]: 0 },
  starting_time: '2020-08-24T00:00:00.000Z'
};



const Game: React.FC = () => {
  const { state, dispatch } = useContext(GlobalContext);
  const { _id } = state.user || { _id: '0' };
  const { gameId }: { gameId: string } = useParams();
  const [{ playing, starting_time, result, game_type }, setGameData] = useState(
    defaultState
  );
  const [kaistRatio, setKaistRatio] = useState<number>(0.0);
  const [postechRatio, setPostechRatio] = useState<number>(0.0);
  const [currentBetting, setCurrentBetting] = useState<LogoState>(
    LogoState.None
  );
  const { formatMessage: f } = useIntl();

  useEffect(() => {
    const socket = io(config.socketURL, {
      transports: ['websocket'],
      upgrade: false,
      query: { game: gameId }
    });
    socket.on('refresh', (data: GameCardProps) => {
      if (data.kaist_arr.length + data.postech_arr.length != 0) {
        setKaistRatio(
          (100 * data.kaist_arr.length) /
            (data.kaist_arr.length + data.postech_arr.length)
        );
        setPostechRatio(
          (100 * data.postech_arr.length) /
            (data.kaist_arr.length + data.postech_arr.length)
        );
      }
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    const fetchGame = async () => {
      const { data }: { data: GameCardProps } = await axios.get(
        '/api/games/' + gameId
      );
      setGameData(data);

      if (data.kaist_arr.includes(_id)) {
        setCurrentBetting(LogoState.Kaist);
      } else if (data.postech_arr.includes(_id)) {
        setCurrentBetting(LogoState.Postech);
      } else {
        setCurrentBetting(LogoState.None);
      }

      if (data.kaist_arr.length + data.postech_arr.length != 0) {
        setKaistRatio(
          (100 * data.kaist_arr.length) /
            (data.kaist_arr.length + data.postech_arr.length)
        );
        setPostechRatio(
          (100 * data.postech_arr.length) /
            (data.kaist_arr.length + data.postech_arr.length)
        );
      }
    };
    fetchGame();
  }, [_id]);

  return (
    <Container style={{ padding: "0 2%" }}>
      <Banner color="grey" inverted secondary fluid style={{ margin: 0 }}>
        <Menu.Item style={{ margin: "0 auto" }}>
          <h3>{f({ id: `game.${gameId}` })}</h3>
        </Menu.Item>
      </Banner>
      <Grid divided="vertically" style={{ position: "relative", margin: 0 }} container>
        <Grid.Row columns={2} style={{ padding: 0 }}>
          <Grid.Column verticalAlign="middle" style={{ backgroundColor: "#a5dff9", margin: 0, padding: 0 }}>
            <Team>
              <Image src={KaistLogo} size="medium" style={{ flexGrow: 0.8, width: "10vw", height: "auto" }} />
              <h1 style={{ flexGrow: 1, textAlign: "right", margin: "0 6vw", color: "white" }}>{result[University.Kaist]}</h1>
            </Team>
          </Grid.Column>
          <Grid.Column verticalAlign="middle" style={{ backgroundColor: "#ffbbd6", margin: 0, padding: 0 }}>
            <Team>
              <h1 style={{ flexGrow: 1, textAlign: "left", margin: "0 6vw", color: "white" }}>{result[University.Postech]}</h1>
              <Image src={PostechLogo} size="medium" style={{ flexGrow: 0.8, marginRight: "4vw", width: "10vw", height: "auto" }} />

            </Team>
          </Grid.Column>
        </Grid.Row>
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}>
          {playing === GameStatus.Running ? (
            <Label color="green" size="huge">
              {f({ id: 'game.playing' })}
            </Label>
          ) : playing === GameStatus.Waiting ? (
            <Label color="black" size="huge" style={{ fontSize: '0.8rem' }}>
              <FormattedDate
                value={starting_time}
                month="2-digit"
                day="2-digit"
                hour="2-digit"
                minute="2-digit"
                hour12={false}
              />
            </Label>
          ) : (
                <Label color="red" size="huge">
                  {f({ id: 'game.finished' })}
                </Label>
              )}
        </div>
      </Grid>
      <Card style={{ position: "relative", top: "7vh", width: "90%", padding: "1rem 5rem" }} centered >
        <Card.Content>
          <Responsive as={Grid} style={{ margin: "0 0" }} minWidth={1200}>
            <Grid.Row columns={3} centered>
              <Grid.Column width={7}>
                <StyledProgress percent={kaistRatio} color="blue" />
              </Grid.Column >
              <Grid.Column style={{ textAlign: "center" }} width={2}>
                <h4>{f({ id: 'betting.status' })}</h4>
              </Grid.Column>
              <Grid.Column width={7}>
                <Progress percent={postechRatio} color="red" />
              </Grid.Column>
            </Grid.Row>
          </Responsive>
          <Responsive as={Grid} style={{ margin: "0 0" }} maxWidth={1199}>
            <Grid.Row columns={3} centered>
              <Grid.Column width={6}>
                <StyledProgress percent={kaistRatio} color="blue" />
              </Grid.Column >
              <Grid.Column style={{ textAlign: "center" }} width={2}>
                <h4>{f({ id: 'betting.status' })}</h4>
              </Grid.Column>
              <Grid.Column width={6}>
                <Progress percent={postechRatio} color="red" />
              </Grid.Column>
            </Grid.Row>
          </Responsive>
        </Card.Content>
        <Card.Content style={{ display: "flex", alignItems: "center" }}>
          <MainEventPopup currentBetting={currentBetting} setCurrentBetting={setCurrentBetting} game_type={game_type} >
          </MainEventPopup>
        </Card.Content>
      </Card>

    </Container >
  );
};

export default Game;
