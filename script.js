(() => {
  'use strict';

  const scenes = Array.from(document.querySelectorAll('.scene'));
  const status = document.getElementById('live-status');
  const introPetals = document.getElementById('intro-petals');
  const finalPetals = document.getElementById('final-petals');
  const heartLayer = document.getElementById('hearts');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let activeScene = 'intro';
  let introTimer = null;
  let finalTimer = null;
  let particleTimer = null;
  let finaleStarted = false;

  const sceneNames = {
    intro: 'Une petite surprise pour toi',
    message: 'Octobre est rose',
    romance: 'Une rose pour toi',
    awareness: 'Un petit rappel important',
    interlude: "Mais j'ai encore quelque chose à te montrer",
    finale: 'Pour toi, avec tout mon amour'
  };

  function randomBetween(min, max) {
    return Math.random() * (max - min) + min;
  }

  function makePetal(container, floating = false) {
    const petal = document.createElement('span');
    petal.className = floating ? 'petal petal--float' : 'petal';
    petal.style.left = `${randomBetween(-2, 102)}%`;
    petal.style.setProperty('--drift', `${randomBetween(-95, 95)}px`);
    petal.style.setProperty('--spin', `${randomBetween(220, 760)}deg`);
    petal.style.animationDuration = `${randomBetween(floating ? 11 : 8, floating ? 18 : 14)}s`;
    petal.style.animationDelay = `${randomBetween(-12, 0)}s`;
    petal.style.opacity = randomBetween(.35, .78).toFixed(2);
    petal.style.scale = randomBetween(.65, 1.15).toFixed(2);
    container.appendChild(petal);
    petal.addEventListener('animationend', () => petal.remove(), { once: true });
  }

  function seedAmbientPetals() {
    if (reducedMotion.matches) return;
    for (let i = 0; i < 9; i += 1) makePetal(introPetals, true);
  }

  function stopFinaleEffects() {
    window.clearInterval(finalTimer);
    window.clearInterval(particleTimer);
    finalTimer = null;
    particleTimer = null;
    finalPetals.replaceChildren();
    heartLayer.replaceChildren();
    finaleStarted = false;
  }

  function setScene(sceneId, options = {}) {
    const nextScene = document.getElementById(sceneId);
    if (!nextScene || activeScene === sceneId) return;

    const previous = document.getElementById(activeScene);
    if (previous) {
      previous.classList.remove('is-active');
      previous.setAttribute('aria-hidden', 'true');
      previous.inert = true;
    }

    activeScene = sceneId;
    nextScene.classList.add('is-active');
    nextScene.setAttribute('aria-hidden', 'false');
    nextScene.inert = false;
    status.textContent = sceneNames[sceneId] || '';

    if (sceneId === 'finale') startFinale();
    else if (finaleStarted) stopFinaleEffects();

    if (options.focus !== false) {
      window.setTimeout(() => {
        const heading = nextScene.querySelector('h1, h2:not(.visually-hidden)');
        if (heading) {
          heading.setAttribute('tabindex', '-1');
          heading.focus({ preventScroll: true });
        }
      }, 350);
    }
  }

  function addSparkle() {
    const sparkle = document.createElement('span');
    sparkle.className = 'sparkle-particle';
    sparkle.style.left = `${randomBetween(13, 87)}%`;
    sparkle.style.top = `${randomBetween(12, 76)}%`;
    sparkle.style.animationDuration = `${randomBetween(1.8, 3.3)}s`;
    document.getElementById('finale').appendChild(sparkle);
    sparkle.addEventListener('animationend', () => sparkle.remove(), { once: true });
  }

  function startFinale() {
    if (finaleStarted) return;
    finaleStarted = true;
    finalPetals.replaceChildren();
    heartLayer.replaceChildren();

    if (reducedMotion.matches) return;

    // Une pluie légère au démarrage, puis seulement quelques éléments à la fois.
    for (let i = 0; i < 10; i += 1) {
      window.setTimeout(() => {
        if (activeScene === 'finale') makePetal(finalPetals);
      }, i * 180);
    }
    finalTimer = window.setInterval(() => {
      if (activeScene === 'finale') makePetal(finalPetals);
    }, 1050);
    particleTimer = window.setInterval(() => {
      if (activeScene !== 'finale') return;
      if (heartLayer.childElementCount < 4) {
        const heart = document.createElement('span');
        heart.className = 'floating-heart';
        heart.textContent = Math.random() > .35 ? '♡' : '✧';
        heart.style.left = `${randomBetween(12, 88)}%`;
        heart.style.setProperty('--drift', `${randomBetween(-60, 60)}px`);
        heart.style.animationDuration = `${randomBetween(5, 8)}s`;
        heartLayer.appendChild(heart);
        heart.addEventListener('animationend', () => heart.remove(), { once: true });
      }
      if (Math.random() > .28) addSparkle();
    }, 900);
  }

  document.querySelectorAll('[data-next]').forEach((button) => {
    button.addEventListener('click', () => setScene(button.dataset.next));
  });

  document.getElementById('show-surprise').addEventListener('click', () => {
    setScene('finale');
  });

  document.getElementById('replay').addEventListener('click', () => {
    stopFinaleEffects();
    window.clearInterval(introTimer);
    introPetals.replaceChildren();
    seedAmbientPetals();
    setScene('intro');
    window.scrollTo({ top: 0, behavior: reducedMotion.matches ? 'auto' : 'smooth' });
  });

  reducedMotion.addEventListener?.('change', () => {
    if (reducedMotion.matches) {
      introPetals.replaceChildren();
      stopFinaleEffects();
    } else {
      seedAmbientPetals();
      if (activeScene === 'finale') startFinale();
    }
  });

  seedAmbientPetals();
  introTimer = window.setInterval(() => {
    if (activeScene === 'intro' && !reducedMotion.matches && introPetals.childElementCount < 12) {
      makePetal(introPetals, true);
    }
  }, 1700);
})();
