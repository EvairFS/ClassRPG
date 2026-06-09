// TestPixi.tsx

import { Application, Container, Graphics } from "@pixi/react";

function Box() {
  return (
    <Graphics
      draw={(g) => {
        g.clear();
        g.rect(0, 0, 100, 100);
        g.fill(0xff0000);
      }}
    />
  );
}

export default function TestPixi() {
  return (
    <Application width={300} height={300}>
      <Container x={100} y={100}>
        <Box />
      </Container>
    </Application>
  );
}
