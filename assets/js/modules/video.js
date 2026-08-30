// Videos start as linked posters. A poster with data-video upgrades to an
// inline player; all other posters remain ordinary YouTube links. Nothing is
// requested from YouTube until someone chooses a video.

const PARAMS = 'autoplay=1&rel=0';

function embed(facade) {
  const id = facade.dataset.video;
  if (id == null || id === '') return;

  const iframe = document.createElement('iframe');
  iframe.title = facade.dataset.title ?? 'Video';
  iframe.src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}?${PARAMS}`;
  iframe.allow =
    'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
  iframe.referrerPolicy = 'strict-origin-when-cross-origin';
  iframe.allowFullscreen = true;

  facade.replaceWith(iframe);
  iframe.focus();
}

function ready() {
  for (const facade of document.querySelectorAll('.video__facade[data-video]')) {
    facade.addEventListener('click', (event) => {
      event.preventDefault();
      embed(facade);
    }, { once: true });
  }
}

export { ready };
