import { EVENT_EFFECT, MODULE } from './config.js';
import { Smacro } from './Smacro.js';

console.log("Smacro loaded");

Hooks.on("init", function () {
  window.smacro = new Smacro();
  game.socket.on(MODULE, (data) => {
    console.log(data);
    if (data.event === EVENT_EFFECT) {
      console.log('Effect event');
      if (canvas.scene.id === data.sceneId) {
        canvas.tokens.placeables.forEach(token => {
          if (token.id === data.tokenId) {
            smacro.placeEffectOnToken(token, data.effect);
          }
        });
      }
    }
  });
});

Hooks.on("ready", function () {

});
