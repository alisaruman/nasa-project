import { BrowserRouter as Router } from "react-router-dom";
import { ThemeProvider } from "arwes/lib";
import { Arwes, SoundsProvider, createSounds, createTheme } from "arwes";

import AppLayout from "./pages/AppLayout";

import { theme, resources, sounds } from "./settings";

const App = () => {
  return (
    <ThemeProvider theme={createTheme(theme)}>
      <SoundsProvider sounds={createSounds(sounds)}>
        <Arwes
          animate
          background={resources.background.large}
          pattern={resources.pattern}
        >
          {(anim) => (
            <Router>
              <AppLayout show={anim.entered} />
            </Router>
          )}
        </Arwes>
      </SoundsProvider>
    </ThemeProvider>
  );
};

export default App;
