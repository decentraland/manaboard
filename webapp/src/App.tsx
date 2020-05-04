import {
  Center,
  Footer,
  Header,
  Navbar,
  Page,
  Progress,
  Container,
  Grid,
  Card,
  Hero,
  Responsive,
} from "decentraland-ui";
import "decentraland-ui/lib/styles.css";
import React, { useEffect, useState } from "react";
import Chart from "./Chart";
import { ParentSize } from "@vx/responsive";

function niceNumber(n: number): string {
  const parts = [];
  while (n > 1) {
    const what = Math.floor(n % 1000).toFixed(0);
    parts.push(what.padStart(3, "0"));
    n = n / 1000;
  }
  parts.reverse();
  parts[0] = parts[0].replace(/^0+/g, "");
  return parts.join(",");
}

function App() {
  const [timeSummary, setTimeSummary] = useState(
    [] as { burned: string; timestamp: string }[]
  );
  const [latest, setLatest] = useState({
    burned: "607967028124150287041826048",
    supply: "2197919365034152513924741837",
  });
  useEffect(() => {
    fetch("https://api.thegraph.com/subgraphs/name/eordano/manaboard", {
      headers: {
        "content-type": "application/json",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-site",
      },
      body:
        '{"query":"{\\n  timeSummaries(first: 1000, orderDirection: asc, orderBy:timestamp\\n) {\\n    id\\n    timestamp\\n    burned\\n  }\\n  latests(first: 5) {\\n    id\\n    supply\\n    burned\\n  }\\n}\\n","variables":null}',
      method: "POST",
      mode: "cors",
      credentials: "omit",
    })
      .then((res) => res.json())
      .then((res) => {
        setLatest((res as any).data.latests[0]);
        setTimeSummary((res as any).data.timeSummaries);
      });
  }, []);
  const { burned, supply } = latest;
  const total = +burned / 1e18 + +supply / 1e18;
  const percent = (+burned * 100) / 1e18 / total;
  const minTablet = 650;
  const minDesktop = 920;

  let totalMinusBurned = total;
  let timeSum: any = [
    { burned: 0, timestamp: 1502755200 },
    { burned: 0, timestamp: 1514110400 },
    ...timeSummary,
  ].map((value: any) => {
    totalMinusBurned -= value.burned / 1e18;
    return { id: value.timestamp * 1000, remaining: +Math.floor(totalMinusBurned) };
  });

  return (
    <div className="container">
      <Navbar isFullscreen />
      <Page isFullscreen>
        <Hero>
          <div style={{ height: "200px" }}>&nbsp;</div>
          <Center>
            <Header size="huge">{niceNumber(+burned / 1e18)}</Header>
            <p>
              MANA was Burned out of the original {niceNumber(total)} supply
              <Progress
                precision={2}
                value={percent}
                total={100}
                style={{ marginTop: "20px" }}
                indicating={true}
                success={true}
              />
            </p>
          </Center>
        </Hero>
        <Container>
          <Responsive maxWidth={minTablet}>
            <Grid columns="1" centered>
              {Content()}
            </Grid>
          </Responsive>
          <Responsive minWidth={minTablet + 1} maxWidth={minDesktop - 1}>
            <Grid columns="2" centered>
              {Content()}
            </Grid>
          </Responsive>
          <Responsive minWidth={minDesktop}>
            <Grid columns="3" centered>
              {Content()}
            </Grid>
          </Responsive>
          <div style={{ marginTop: "20px" }}>
            {MakeCard(
              "MANA remaining over time",
              //<pre>{JSON.stringify(latest, null, 2)} </pre>
              <>
                <ParentSize>
                  {({ width }) => (
                    <Chart width={width} height={width / 2} data={timeSum} />
                  )}
                </ParentSize>
              </>
            )}
          </div>
        </Container>
        <div style={{ height: "100px" }}>&nbsp;</div>
      </Page>
      <Footer isFullscreen />
    </div>
  );
}

function Content() {
  return (
    <>
      {MakeCard(
        "What does this mean?",
        "MANA was initially created to be deflationary. Initially, the supply of 2,805,886,393 was burned in the Terraform event, the second auction, and the DAO creation. But there are other ways in which MANA gets burned."
      )}
      {MakeCard(
        "How does MANA get burn?",
        "Any activity on the marketplace charges a 2.5% fee on the sale (payed by the seller). This means that the amount of MANA burned is directly tied to the activity of the platform."
      )}
      {MakeCard(
        "What are the consequences?",
        "The less mana there is, the more valuable each token becomes. Any marginal demand for MANA would cause an increase in the MANA price, leading to an appreciation of the token."
      )}
    </>
  );
}

function MakeCard(title: string, content: any) {
  return (
    <Grid.Column>
      <Card fluid>
        <Card.Content>
          <Card.Header>
            <h3>{title}</h3>
          </Card.Header>
          <Card.Meta>
            {typeof content === "string" ? <p>{content}</p> : content}
          </Card.Meta>
        </Card.Content>
      </Card>
    </Grid.Column>
  );
}
export default App;
