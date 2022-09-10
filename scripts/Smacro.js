import { MODULE, EVENT_EFFECT } from './config.js';

export class Smacro
{
  drawTemplatePreview(type, distance) {
    const data = {
      t: type,
      user: game.user.id,
      distance: distance,
      direction: 0,
      x: 0,
      y: 0,
      fillColor: game.user.color
    }

    const doc = new MeasuredTemplateDocument(data, { parent: canvas.scene });

    let template = new game.dnd5e.canvas.AbilityTemplate(doc);
    template.drawPreview();
  }

  spawnActorAtTemplate(actorName, template) {
    const scene = template.parent;
    let protoToken = duplicate(game.actors.getName(actorName).data.token);
    protoToken.x = template.data.x;
    protoToken.y = template.data.y;
    // Increase this offset for larger summons
    protoToken.x -= (scene.data.grid / 2 + (protoToken.width - 1) * scene.data.grid);
    protoToken.y -= (scene.data.grid / 2 + (protoToken.height - 1) * scene.data.grid);

    return canvas.scene.createEmbeddedDocuments("Token", [protoToken])
  }

  deleteTemplatesAndSpawn(actorName, numberOfSummons = 1, templateType = 'circle', distance = 3.5) {
    let needToSummon = numberOfSummons;
    return async (templateDocument) => {
      needToSummon--;
      await this.spawnActorAtTemplate(actorName, templateDocument);
      await templateDocument.delete();
      if (needToSummon > 0) {
        this.summon(actorName, needToSummon, templateType, distance);
      }
    }
  }

  summon(actorName, numberOfSummons = 1, templateType = 'circle', distance = 3.5) {
    if (numberOfSummons > 0) {
      Hooks.once("createMeasuredTemplate", this.deleteTemplatesAndSpawn(actorName, numberOfSummons, templateType, distance));
      this.drawTemplatePreview(templateType, 3.5);
    }
  }

  showDialog(title = 'title', content = 'Content', callback) {
    new Dialog({
      title,
      content,
      buttons: {
        yes: {
          icon: '<i class="fas fa-check"></i>',
          label: "Ok",
          callback
        }
      }
    }).render(true);
  }

  generateActorListFromFolder(folderName, selectId, title = 'Select actor:', titleRenderer) {

    let content = `<form><div class="form-group"><label>${title}</label><select id="${selectId}">`;
    game.folders.getName(folderName).content.forEach(function (actor) {
      let name = actor.data.name;
      if (typeof titleRenderer === 'function') {
        name = titleRenderer(actor);
      }
      let optionActor = `<option value="${actor.data._id}">${name}</option>`;
      content += optionActor;
    });
    content += '</select></div></form>';
    return content;
  }

  placeEffectOnToken(token, effect, callback) {
    if (game.user.isGM) {
      token.toggleEffect(effect);
      if (typeof callback === 'function') {
        callback(token, effect);
      }
    } else {
      this.emitEffect(token, effect, callback);
    }
  }

  placeEffectOnTarget(item, callback) {
    const tok = Array.from(game.user.targets)[0];
    const effect = item.data.img;
    this.placeEffectOnToken(tok, effect, callback);
  }

  placeEffectOnCurrentToken(item, callback) {
    const tok = _token;
    const effect = item.data.img;
    this.placeEffectOnToken(tok, effect, callback);
  }

  emitEffect(token, effect, callback) {
    game.socket.emit(MODULE, {
      event: EVENT_EFFECT,
      userId: game.user.id,
      sceneId: canvas.scene.id,
      tokenId: token.id,
      effect,
      callback: callback ? callback.toString() : null,
    });
  }
}
