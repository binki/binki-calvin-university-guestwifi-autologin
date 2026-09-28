// ==UserScript==
// @name binki-calvin-university-guestwifi-autologin
// @version 1.0.1
// @match https://getconnected.calvin.edu/guest/*
// @grant GM.getValue
// @grant GM.setValue
// @require https://github.com/binki/binki-userscript-delay-async/raw/252c301cdbd21eb41fa0227c49cd53dc5a6d1e58/binki-userscript-delay-async.js
// @require https://github.com/binki/binki-userscript-when-element-query-selector-async/raw/0a9c204bdc304a9e82f1c31d090fdfdf7b554930/binki-userscript-when-element-query-selector-async.js
// ==/UserScript==

(async () => {
  const nameInput = await whenElementQuerySelectorAsync(document.body, 'input[name=visitor_name]');
  const registerButton = await whenElementQuerySelectorAsync(nameInput.closest('form'), 'input[type=submit]');
  if (nameInput.type === 'hidden') {
    // If the input is hidden, that means we are on the confirmation page and we should just immediately click through.
    registerButton.click();
  }
  const emailInput = await whenElementQuerySelectorAsync(document.body, 'input[name=cal_email]');
  const saved = JSON.parse(await GM.getValue('saved', 'null'));
  let tainted = !saved;
  for (const element of [
    nameInput,
    emailInput,
  ]) {
    element.addEventListener('click', () => {
      console.log('tainted by click');
      tainted = true;
    });
    element.addEventListener('input', () => {
      console.log('tainted by input');
      tainted = true;
    });
  }

  const registerButtonSaveOnClickHandler = async e => {
    registerButton.removeEventListener('click', registerButtonSaveOnClickHandler);
    if (!saved || saved.name != nameInput.value || saved.email !== emailInput.value) {
      e.preventDefault();
      registerButton.setAttribute('disabled', 'disabled');
      await GM.setValue('saved', JSON.stringify({
        name: nameInput.value,
        email: emailInput.value,
      }));
      registerButton.removeAttribute('disabled');
      await delayAsync(10);
      registerButton.click();
    }
  };
  registerButton.addEventListener('click', registerButtonSaveOnClickHandler);

  if (!tainted) {
    nameInput.value = saved.name;
    emailInput.value = saved.email;
    registerButton.click();
  }
})();
