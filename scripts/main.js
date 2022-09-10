import { EVENT_EFFECT, MODULE } from './config.js';
import { Smacro } from './Smacro.js';

console.log("Smacro loaded");

Hooks.on("init", function () {
  window.smacro = new Smacro();
  game.socket.on(MODULE, (data) => {
    console.log(data);
    if (data.event === EVENT_EFFECT) {
      console.log('Effect event');
      if (canvas.scene.id === data.sceneId && game.user.isGM) {
        canvas.tokens.placeables.forEach(token => {
          if (token.id === data.tokenId) {
            token.toggleEffect(data.effect);
            if (typeof data.callback !== null) {
              const callbackFunction = new Function('return ' + data.callback)();
              callbackFunction(token, data.effect);
            }
          }
        });
      }
    }
  });
});

Hooks.on("ready", function () {

});
